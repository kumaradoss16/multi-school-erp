export type Role = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'PRINCIPAL' 
  | 'VICE_PRINCIPAL'
  | 'TEACHER' 
  | 'ACCOUNTANT' 
  | 'LIBRARIAN' 
  | 'RECEPTIONIST'
  | 'HR_MANAGER'
  | 'TRANSPORT_MANAGER'
  | 'HOSTEL_WARDEN';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'SUSPENDED' | 'PENDING';

export type UserType = 
  | 'Administrator' 
  | 'Principal' 
  | 'Vice Principal' 
  | 'Teacher' 
  | 'Accountant' 
  | 'Receptionist' 
  | 'Librarian' 
  | 'HR Manager' 
  | 'Transport Manager' 
  | 'Hostel Warden' 
  | 'Staff' 
  | 'Parent' 
  | 'Student' 
  | 'Driver' 
  | 'Custom';

export type PermissionAction = 
  | 'view' 
  | 'create' 
  | 'edit' 
  | 'delete' 
  | 'approve' 
  | 'publish' 
  | 'export' 
  | 'print' 
  | 'refund' 
  | 'manage' 
  | 'configure';

export type PermissionScope = 
  | 'SYSTEM_WIDE' 
  | 'SCHOOL_WIDE' 
  | 'CAMPUS_WIDE' 
  | 'DEPARTMENT' 
  | 'CLASS' 
  | 'ASSIGNED_STUDENTS' 
  | 'SELF';

export interface ModulePermissionRule {
  module: string;
  actions: PermissionAction[];
  scope: PermissionScope;
  allowedClasses?: string[];
  allowedDepartments?: string[];
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  phone: string;
  displayName: string;
  employeeId?: string;
  userType: UserType;
  role: Role;
  roleLabel: string;
  schoolId: string;
  schoolName: string;
  campusId: string;
  campusName: string;
  department?: string;
  designation?: string;
  avatar?: string;
  status: UserStatus;
  passwordHash: string; // Argon2id standard encoded hash string
  passwordSalt: string;
  passwordHistory: string[]; // Previous Argon2id hashes
  forcePasswordChange: boolean;
  failedLoginCount: number;
  lastFailedLoginAt?: string;
  lockedUntil?: string;
  lockReason?: string;
  mfaEnabled: boolean;
  mfaType?: 'TOTP' | 'EMAIL_OTP' | 'SECURITY_KEY';
  permissions: ModulePermissionRule[];
  lastLoginAt?: string;
  lastLoginIp?: string;
  lastPasswordChangedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export type LoginEventType = 
  | 'LOGIN_SUCCESS' 
  | 'LOGIN_FAILED' 
  | 'ACCOUNT_LOCKED' 
  | 'ACCOUNT_UNLOCKED' 
  | 'PASSWORD_CHANGED' 
  | 'PASSWORD_RESET' 
  | 'LOGOUT' 
  | 'SESSION_TERMINATED';

export interface LoginHistoryRecord {
  id: string;
  userId: string;
  username: string;
  timestamp: string;
  result: 'SUCCESS' | 'FAILURE' | 'WARNING';
  eventType: LoginEventType;
  device: string;
  ip: string;
  reason: string;
  location?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  role: Role;
  schoolId: string;
  campusId: string;
  loginTime: string;
  lastActivity: string;
  logoutTime?: string;
  device: string;
  appVersion: string;
  ip: string;
  isCurrent: boolean;
}

export interface PasswordPolicyConfig {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  disallowCommonPasswords: boolean;
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  passwordExpirationDays: number;
  enforcePasswordHistoryCount: number; // e.g. remember last 5 passwords
  sessionTimeoutMinutes: number;
  idleTimeoutMinutes: number;
  forcePasswordChangeOnFirstLogin: boolean;
}

export interface SecuritySettingsConfig {
  passwordPolicy: PasswordPolicyConfig;
  twoFactorAuth: {
    enabled: boolean;
    enforceForRoles: Role[];
    allowedMethods: ('TOTP' | 'EMAIL_OTP' | 'SECURITY_KEY')[];
  };
  sessionSecurity: {
    maxConcurrentSessionsPerUser: number;
    terminateOnBrowserClose: boolean;
    ipBinding: boolean;
  };
  auditCompliance: {
    retainLogsDays: number;
    immutableAuditTrail: boolean;
    logFailedAttempts: boolean;
  };
}

export interface AuthValidationResult {
  isValid: boolean;
  field?: string;
  code?: string;
  message: string;
  details?: string[];
}

export interface PasswordStrengthResult {
  score: number; // 0 to 100
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  passedChecks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    specialChar: boolean;
  };
  feedback: string[];
}

export interface LoginResult {
  success: boolean;
  user?: any;
  session?: any;
  requiresPasswordChange?: boolean;
  isLocked?: boolean;
  message: string;
  errorCode?: string;
}
