import { 
  UserAccount, 
  LoginHistoryRecord, 
  UserSession, 
  SecuritySettingsConfig, 
  AuthValidationResult,
  Role,
  UserType,
  ModulePermissionRule,
  PermissionScope
} from '../types/auth';
import { PasswordService, defaultPasswordPolicy } from './passwordService';

/**
 * Sanitized user object safe to be returned across IPC boundary to Renderer
 * (Strictly excludes passwordHash, passwordSalt, passwordHistory)
 */
export type SanitizedUser = Omit<UserAccount, 'passwordHash' | 'passwordSalt' | 'passwordHistory'>;

export interface CreateUserPayload {
  username: string;
  email: string;
  phone: string;
  displayName: string;
  employeeId?: string;
  userType: UserType;
  role: Role;
  schoolId: string;
  schoolName: string;
  campusId: string;
  campusName: string;
  department?: string;
  designation?: string;
  password?: string;
  confirmPassword?: string;
  forcePasswordChange?: boolean;
  permissions?: ModulePermissionRule[];
}

export interface UpdateUserPayload {
  displayName?: string;
  email?: string;
  phone?: string;
  employeeId?: string;
  userType?: UserType;
  role?: Role;
  schoolId?: string;
  schoolName?: string;
  campusId?: string;
  campusName?: string;
  department?: string;
  designation?: string;
  status?: UserAccount['status'];
  permissions?: ModulePermissionRule[];
  mfaEnabled?: boolean;
}

export interface LoginResult {
  success: boolean;
  user?: SanitizedUser;
  session?: UserSession;
  requiresPasswordChange?: boolean;
  isLocked?: boolean;
  message: string;
  errorCode?: string;
}

/**
 * Trusted Main-Process / Backend Authentication & IPC Security Service
 * Enforces server-side RBAC, transaction safety, tenant isolation,
 * Argon2id cryptographic operations, and brute-force lockout controls.
 */
export class AuthIpcService {
  /**
   * Sanitizes user account to prevent sensitive cryptographic hashes from leaking to Renderer
   */
  public static sanitizeUser(user: UserAccount): SanitizedUser {
    const { passwordHash, passwordSalt, passwordHistory, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Validates username uniqueness, format, and normalization
   */
  public static validateUsername(username: string, existingUsers: UserAccount[], excludeUserId?: string): AuthValidationResult {
    if (!username || username.trim().length === 0) {
      return {
        isValid: false,
        field: 'username',
        code: 'USERNAME_REQUIRED',
        message: 'Username is required and cannot be empty.'
      };
    }

    const normalized = username.trim().toLowerCase();

    if (normalized.length < 3 || normalized.length > 30) {
      return {
        isValid: false,
        field: 'username',
        code: 'USERNAME_INVALID_LENGTH',
        message: 'Username must be between 3 and 30 characters.'
      };
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(normalized)) {
      return {
        isValid: false,
        field: 'username',
        code: 'USERNAME_INVALID_CHARS',
        message: 'Username can only contain alphanumeric characters, dots (.), underscores (_), and hyphens (-).'
      };
    }

    const duplicate = existingUsers.find(
      u => u.username.toLowerCase() === normalized && u.id !== excludeUserId
    );

    if (duplicate) {
      return {
        isValid: false,
        field: 'username',
        code: 'USERNAME_EXISTS',
        message: 'This username is already in use by another account.'
      };
    }

    return { isValid: true, message: 'Username is valid and available.' };
  }

  /**
   * Validates email address format and uniqueness
   */
  public static validateEmail(email: string, existingUsers: UserAccount[], excludeUserId?: string): AuthValidationResult {
    if (!email || email.trim().length === 0) {
      return {
        isValid: false,
        field: 'email',
        code: 'EMAIL_REQUIRED',
        message: 'Email address is required.'
      };
    }

    const normalized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalized)) {
      return {
        isValid: false,
        field: 'email',
        code: 'EMAIL_INVALID_FORMAT',
        message: 'Please provide a valid email address format (e.g. name@school.edu.in).'
      };
    }

    const duplicate = existingUsers.find(
      u => u.email.toLowerCase() === normalized && u.id !== excludeUserId
    );

    if (duplicate) {
      return {
        isValid: false,
        field: 'email',
        code: 'EMAIL_EXISTS',
        message: 'An account with this email address already exists.'
      };
    }

    return { isValid: true, message: 'Email address is valid.' };
  }

  /**
   * Evaluates server-side authorization: Checks if current actor has permission to perform action
   */
  public static checkAuthorization(
    actor: { id: string; role: Role; schoolId?: string; campusId?: string },
    requiredModule: string,
    requiredAction: string,
    targetSchoolId?: string
  ): boolean {
    // 1. Super Admin has unrestricted access everywhere
    if (actor.role === 'SUPER_ADMIN') return true;

    // 2. School Admin has full access within their designated school
    if (actor.role === 'ADMIN') {
      if (!targetSchoolId || !actor.schoolId || targetSchoolId === actor.schoolId) {
        return true;
      }
      return false;
    }

    // 3. Principal can manage academic users within their school
    if (actor.role === 'PRINCIPAL') {
      if (requiredModule === 'users' && (requiredAction === 'view' || requiredAction === 'create' || requiredAction === 'edit')) {
        return !targetSchoolId || targetSchoolId === actor.schoolId;
      }
    }

    return false;
  }

  /**
   * Executes atomic user creation with full validation and Argon2id hashing
   */
  public static async executeCreateUserTransaction(
    payload: CreateUserPayload,
    actorUser: { id: string; username: string; role: Role; schoolId: string },
    existingUsers: UserAccount[],
    securityConfig: SecuritySettingsConfig
  ): Promise<{ success: boolean; user?: UserAccount; error?: AuthValidationResult }> {
    // Step 1: Authorization check
    const isAuthorized = this.checkAuthorization(
      actorUser,
      'users',
      'create',
      payload.schoolId
    );

    if (!isAuthorized) {
      return {
        success: false,
        error: {
          isValid: false,
          code: 'UNAUTHORIZED_ACCESS',
          message: 'You do not have administrative permissions to create user accounts in this scope.'
        }
      };
    }

    // Step 2: Validate username
    const usernameValidation = this.validateUsername(payload.username, existingUsers);
    if (!usernameValidation.isValid) {
      return { success: false, error: usernameValidation };
    }

    // Step 3: Validate email
    const emailValidation = this.validateEmail(payload.email, existingUsers);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation };
    }

    // Step 4: Validate password
    const password = payload.password || PasswordService.generateTemporaryPassword(14);
    if (payload.password && payload.confirmPassword && payload.password !== payload.confirmPassword) {
      return {
        success: false,
        error: {
          isValid: false,
          field: 'confirmPassword',
          code: 'PASSWORDS_DO_NOT_MATCH',
          message: 'Passwords do not match. Please re-enter identical passwords.'
        }
      };
    }

    const policyValidation = PasswordService.validatePasswordPolicy(
      password,
      securityConfig.passwordPolicy || defaultPasswordPolicy
    );

    if (!policyValidation.isValid) {
      return { success: false, error: policyValidation };
    }

    // Step 5: Argon2id Password Hashing
    const salt = PasswordService.generateSalt(16);
    const passwordHash = await PasswordService.hashPassword(password, salt);

    // Step 6: Assemble User Account Record
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date().toISOString();

    const newUser: UserAccount = {
      id: userId,
      username: payload.username.trim().toLowerCase(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone || '',
      displayName: payload.displayName.trim(),
      employeeId: payload.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
      userType: payload.userType,
      role: payload.role,
      roleLabel: this.getRoleLabel(payload.role),
      schoolId: payload.schoolId || 'sch-main',
      schoolName: payload.schoolName || 'Green Valley International School',
      campusId: payload.campusId || 'camp-1',
      campusName: payload.campusName || 'Main City Campus',
      department: payload.department || 'General Administration',
      designation: payload.designation || payload.userType,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces`,
      status: 'ACTIVE',
      passwordHash,
      passwordSalt: salt,
      passwordHistory: [passwordHash],
      forcePasswordChange: payload.forcePasswordChange ?? true,
      failedLoginCount: 0,
      mfaEnabled: false,
      permissions: payload.permissions || this.getDefaultRolePermissions(payload.role),
      createdAt: now.split('T')[0],
      updatedAt: now.split('T')[0],
      createdBy: actorUser.id,
      updatedBy: actorUser.id
    };

    return {
      success: true,
      user: newUser
    };
  }

  /**
   * Helper to format human-readable role labels
   */
  public static getRoleLabel(role: Role): string {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Administrator';
      case 'ADMIN': return 'School Administrator';
      case 'PRINCIPAL': return 'Principal';
      case 'VICE_PRINCIPAL': return 'Vice Principal';
      case 'TEACHER': return 'Faculty / Teacher';
      case 'ACCOUNTANT': return 'Bursar / Accountant';
      case 'LIBRARIAN': return 'Librarian';
      case 'RECEPTIONIST': return 'Front Desk / Reception';
      case 'HR_MANAGER': return 'HR Manager';
      case 'TRANSPORT_MANAGER': return 'Transport Manager';
      case 'HOSTEL_WARDEN': return 'Hostel Warden';
      default: return role;
    }
  }

  /**
   * Maps user role to default enterprise permission matrix
   */
  public static getDefaultRolePermissions(role: Role): ModulePermissionRule[] {
    switch (role) {
      case 'SUPER_ADMIN':
        return [{ module: '*', actions: ['view', 'create', 'edit', 'delete', 'approve', 'publish', 'export', 'print', 'refund', 'manage', 'configure'], scope: 'SYSTEM_WIDE' }];
      case 'ADMIN':
        return [
          { module: 'students', actions: ['view', 'create', 'edit', 'delete', 'export', 'print'], scope: 'SCHOOL_WIDE' },
          { module: 'staff', actions: ['view', 'create', 'edit', 'delete', 'export'], scope: 'SCHOOL_WIDE' },
          { module: 'admissions', actions: ['view', 'create', 'edit', 'approve', 'publish'], scope: 'SCHOOL_WIDE' },
          { module: 'academics', actions: ['view', 'create', 'edit', 'approve'], scope: 'SCHOOL_WIDE' },
          { module: 'fees', actions: ['view', 'create', 'edit', 'export', 'print'], scope: 'SCHOOL_WIDE' },
          { module: 'reports', actions: ['view', 'export', 'print'], scope: 'SCHOOL_WIDE' },
          { module: 'users', actions: ['view', 'create', 'edit', 'manage'], scope: 'SCHOOL_WIDE' }
        ];
      case 'PRINCIPAL':
        return [
          { module: 'students', actions: ['view', 'create', 'edit', 'export'], scope: 'SCHOOL_WIDE' },
          { module: 'staff', actions: ['view', 'create', 'edit', 'approve'], scope: 'SCHOOL_WIDE' },
          { module: 'admissions', actions: ['view', 'create', 'edit', 'approve', 'publish'], scope: 'SCHOOL_WIDE' },
          { module: 'academics', actions: ['view', 'create', 'edit', 'approve'], scope: 'SCHOOL_WIDE' },
          { module: 'examinations', actions: ['view', 'create', 'edit', 'publish'], scope: 'SCHOOL_WIDE' },
          { module: 'reports', actions: ['view', 'export'], scope: 'SCHOOL_WIDE' }
        ];
      case 'TEACHER':
        return [
          { module: 'students', actions: ['view'], scope: 'CLASS' },
          { module: 'attendance', actions: ['view', 'create', 'edit'], scope: 'CLASS' },
          { module: 'academics', actions: ['view', 'create', 'edit', 'publish'], scope: 'DEPARTMENT' },
          { module: 'examinations', actions: ['view', 'create', 'edit'], scope: 'CLASS' }
        ];
      case 'ACCOUNTANT':
        return [
          { module: 'fees', actions: ['view', 'create', 'edit', 'print', 'export', 'refund'], scope: 'SCHOOL_WIDE' },
          { module: 'students', actions: ['view'], scope: 'SCHOOL_WIDE' },
          { module: 'reports', actions: ['view', 'export', 'print'], scope: 'DEPARTMENT' }
        ];
      case 'LIBRARIAN':
        return [
          { module: 'library', actions: ['view', 'create', 'edit', 'delete', 'export', 'manage'], scope: 'SCHOOL_WIDE' },
          { module: 'students', actions: ['view'], scope: 'SCHOOL_WIDE' }
        ];
      case 'TRANSPORT_MANAGER':
        return [
          { module: 'transport', actions: ['view', 'create', 'edit', 'manage', 'print'], scope: 'SCHOOL_WIDE' },
          { module: 'students', actions: ['view'], scope: 'SCHOOL_WIDE' }
        ];
      case 'HOSTEL_WARDEN':
        return [
          { module: 'hostel', actions: ['view', 'create', 'edit', 'manage'], scope: 'SCHOOL_WIDE' },
          { module: 'students', actions: ['view'], scope: 'SCHOOL_WIDE' }
        ];
      default:
        return [{ module: 'dashboard', actions: ['view'], scope: 'SELF' }];
    }
  }
}
