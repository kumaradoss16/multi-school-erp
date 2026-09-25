import { 
  Student, Staff, ClassInfo, Admission, FeeInvoice, PaymentReceipt, 
  Exam, ExamMark, Assignment, TimetableSlot, Book, BookIssue, 
  TransportRoute, HostelRoom, NoticeEvent, RecentActivity, AuditLog, 
  SchoolProfile, Role, AttendanceStatus, AdmissionStatus, AppNotification,
  NotificationCategory, NotificationUrgency, Campus, AcademicYearConfig,
  FrontOfficeEnquiry, VisitorLog, Complaint, Subject, LessonPlan, QuestionItem,
  StudyResource, ExpenseVoucher, IncomeRecord, Vendor, StaffLeaveRequest,
  PayrollRecord, InventoryItem, AssetRecord, CertificateRecord, HealthRecord,
  DisciplineIncident, AlumniRecord, IntegrationServiceConfig,
  CustomModuleConfig, CustomFeatureConfig, FeatureFlagConfig, NavigationConfigItem,
  CustomFieldDefinition, CustomFormConfig, CustomTableViewConfig, DashboardWidgetConfig,
  ThemeConfig, TemplateConfig, WorkflowConfig, NumberingConfig, SchoolBrandingConfig,
  LocalizationConfig, UserPreferencesConfig, ConfigVersionSnapshot,
  UserAccount, LoginHistoryRecord, UserSession, SecuritySettingsConfig,
  UserStatus, UserType, ModulePermissionRule, AuthValidationResult, LoginResult
} from '../types';
import { 
  initialSchoolProfile, initialClasses, initialStudents, initialStaff, 
  initialAdmissions, initialInvoices, initialReceipts, initialExams, 
  initialExamMarks, initialAssignments, initialTimetable, initialNotices, 
  initialActivities, initialBooks, initialBookIssues, initialRoutes, 
  initialHostelRooms, initialAuditLogs, initialCampuses, initialAcademicYears,
  initialFrontOfficeEnquiries, initialVisitorLogs, initialComplaints,
  initialSubjects, initialLessonPlans, initialQuestions, initialStudyResources,
  initialExpenseVouchers, initialIncomeRecords, initialVendors, initialStaffLeaves,
  initialPayrolls, initialInventoryItems, initialAssets, initialCertificates,
  initialHealthRecords, initialDisciplineIncidents, initialAlumni, initialIntegrations
} from './seedData';
import {
  initialCustomModules, initialCustomFeatures, initialFeatureFlags, initialNavigationItems,
  initialCustomFields, initialCustomForms, initialTableViews, initialDashboardWidgets,
  initialThemePresets, initialTemplates, initialWorkflows, initialNumberingConfigs,
  initialSchoolBranding, initialLocalization, initialUserPreferences, initialVersionSnapshots
} from './seedCustomization';
import { normalizeModuleKey } from '../utils/notificationUtils';
import { initialUsers, initialLoginHistory, initialSessions, initialSecuritySettings } from './seedUsers';
import { PasswordService, defaultPasswordPolicy } from './passwordService';
import { AuthIpcService, CreateUserPayload, UpdateUserPayload, SanitizedUser } from './authIpcService';
import { AuthenticationService } from './authenticationService';
import { ConfigurationService } from './configurationService';
import { BackupUtility } from './backupUtility';

const STORAGE_KEY = 'school_erp_data_v1';

export interface ERPState {
  schoolProfile: SchoolProfile;
  campuses: Campus[];
  selectedCampusId: string;
  academicYears: AcademicYearConfig[];
  selectedAcademicYear: string;
  users: UserAccount[];
  loginHistory: LoginHistoryRecord[];
  userSessions: UserSession[];
  securitySettings: SecuritySettingsConfig;
  students: Student[];
  staff: Staff[];
  classes: ClassInfo[];
  admissions: Admission[];
  invoices: FeeInvoice[];
  receipts: PaymentReceipt[];
  exams: Exam[];
  examMarks: ExamMark[];
  assignments: Assignment[];
  timetable: TimetableSlot[];
  notices: NoticeEvent[];
  activities: RecentActivity[];
  books: Book[];
  bookIssues: BookIssue[];
  routes: TransportRoute[];
  hostelRooms: HostelRoom[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  frontOfficeEnquiries: FrontOfficeEnquiry[];
  visitorLogs: VisitorLog[];
  complaints: Complaint[];
  subjects: Subject[];
  lessonPlans: LessonPlan[];
  questions: QuestionItem[];
  studyResources: StudyResource[];
  expenseVouchers: ExpenseVoucher[];
  incomeRecords: IncomeRecord[];
  vendors: Vendor[];
  staffLeaves: StaffLeaveRequest[];
  payrolls: PayrollRecord[];
  inventoryItems: InventoryItem[];
  assets: AssetRecord[];
  certificates: CertificateRecord[];
  healthRecords: HealthRecord[];
  disciplineIncidents: DisciplineIncident[];
  alumni: AlumniRecord[];
  integrations: IntegrationServiceConfig[];
  customModules: CustomModuleConfig[];
  customFeatures: CustomFeatureConfig[];
  featureFlags: FeatureFlagConfig[];
  navigationConfig: NavigationConfigItem[];
  customFields: CustomFieldDefinition[];
  customFieldValues: Record<string, Record<string, any>>;
  customForms: CustomFormConfig[];
  tableViews: CustomTableViewConfig[];
  dashboardWidgets: DashboardWidgetConfig[];
  themes: ThemeConfig[];
  activeThemeId: string;
  templates: TemplateConfig[];
  workflows: WorkflowConfig[];
  numberingConfigs: NumberingConfig[];
  schoolBranding: SchoolBrandingConfig;
  localization: LocalizationConfig;
  userPreferences: UserPreferencesConfig;
  configSnapshots: ConfigVersionSnapshot[];
  currentUser: {
    name: string;
    role: Role;
    roleLabel: string;
    avatar: string;
  };
  attendanceSummary: {
    totalStudents: number;
    present: number;
    absent: number;
    leave: number;
    percentage: number;
  };
  lastBackupDate: string;
}

const getInitialNotifications = (): AppNotification[] => [
  { 
    id: 'notif-att-1', 
    title: 'Low Attendance Alert: Rahul Sharma (68.0%)', 
    message: 'Student in Class 10 (A) has fallen below statutory 75% CBSE attendance. Guardian: Rajesh Sharma (+91 98112 34567).', 
    time: '5m ago', 
    timestamp: Date.now() - 300000,
    read: false, 
    type: 'error', 
    urgency: 'CRITICAL',
    category: 'ATTENDANCE',
    module: 'Attendance',
    targetId: 's-1001',
    targetAction: 'view_student'
  },
  { 
    id: 'notif-fee-1', 
    title: 'Fee Payment Overdue: INV-2025-003 (₹28,000)', 
    message: 'Term 1 tuition for Ananya Roy (Class 9 B) is 7 days overdue. Automatic warning SMS pending dispatch.', 
    time: '24m ago', 
    timestamp: Date.now() - 1440000,
    read: false, 
    type: 'warning', 
    urgency: 'CRITICAL',
    category: 'FEE',
    module: 'Fees',
    targetId: 'inv-103',
    targetAction: 'view_invoice'
  },
  { 
    id: 'notif-exam-1', 
    title: 'Upcoming Exam Deadline: Mid-Term Examination 2025', 
    message: 'Official exams commence in 6 days (Classes 9, 10, 11, 12). Hall ticket verification deadline in 48 hours.', 
    time: '1h ago', 
    timestamp: Date.now() - 3600000,
    read: false, 
    type: 'warning', 
    urgency: 'WARNING',
    category: 'EXAM',
    module: 'Examinations',
    targetId: 'ex-02',
    targetAction: 'view_exam'
  },
  { 
    id: 'notif-adm-1', 
    title: 'New Admission Enquiry: Aryan Malhotra', 
    message: 'Walk-in application received for Class 9. Document verification stage pending.', 
    time: '2h ago', 
    timestamp: Date.now() - 7200000,
    read: true, 
    type: 'info', 
    urgency: 'INFO',
    category: 'SYSTEM',
    module: 'Admissions' 
  }
];

export const loadStoredState = (): ERPState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        campuses: parsed.campuses || initialCampuses,
        selectedCampusId: parsed.selectedCampusId || 'camp-1',
        academicYears: parsed.academicYears || initialAcademicYears,
        selectedAcademicYear: parsed.selectedAcademicYear || '2024-2025',
        frontOfficeEnquiries: parsed.frontOfficeEnquiries || initialFrontOfficeEnquiries,
        visitorLogs: parsed.visitorLogs || initialVisitorLogs,
        complaints: parsed.complaints || initialComplaints,
        subjects: parsed.subjects || initialSubjects,
        lessonPlans: parsed.lessonPlans || initialLessonPlans,
        questions: parsed.questions || initialQuestions,
        studyResources: parsed.studyResources || initialStudyResources,
        expenseVouchers: parsed.expenseVouchers || initialExpenseVouchers,
        incomeRecords: parsed.incomeRecords || initialIncomeRecords,
        vendors: parsed.vendors || initialVendors,
        staffLeaves: parsed.staffLeaves || initialStaffLeaves,
        payrolls: parsed.payrolls || initialPayrolls,
        inventoryItems: parsed.inventoryItems || initialInventoryItems,
        assets: parsed.assets || initialAssets,
        certificates: parsed.certificates || initialCertificates,
        healthRecords: parsed.healthRecords || initialHealthRecords,
        disciplineIncidents: parsed.disciplineIncidents || initialDisciplineIncidents,
        alumni: parsed.alumni || initialAlumni,
        integrations: parsed.integrations || initialIntegrations,
        customModules: parsed.customModules || initialCustomModules,
        customFeatures: parsed.customFeatures || initialCustomFeatures,
        featureFlags: parsed.featureFlags || initialFeatureFlags,
        navigationConfig: parsed.navigationConfig || initialNavigationItems,
        customFields: parsed.customFields || initialCustomFields,
        customFieldValues: parsed.customFieldValues || {},
        customForms: parsed.customForms || initialCustomForms,
        tableViews: parsed.tableViews || initialTableViews,
        dashboardWidgets: parsed.dashboardWidgets || initialDashboardWidgets,
        themes: parsed.themes || initialThemePresets,
        activeThemeId: parsed.activeThemeId || 'theme-professional-blue',
        templates: parsed.templates || initialTemplates,
        workflows: parsed.workflows || initialWorkflows,
        numberingConfigs: parsed.numberingConfigs || initialNumberingConfigs,
        schoolBranding: parsed.schoolBranding || initialSchoolBranding,
        localization: parsed.localization || initialLocalization,
        userPreferences: parsed.userPreferences || initialUserPreferences,
        configSnapshots: parsed.configSnapshots || initialVersionSnapshots,
        users: parsed.users || initialUsers,
        loginHistory: parsed.loginHistory || initialLoginHistory,
        userSessions: parsed.userSessions || initialSessions,
        securitySettings: parsed.securitySettings || initialSecuritySettings,
        currentUser: parsed.currentUser || {
          name: 'Administrator (Super Admin)',
          role: 'SUPER_ADMIN',
          roleLabel: 'Super Administrator',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
        }
      };
    }
  } catch (err) {
    console.error('Failed to load ERP state from storage:', err);
  }

  return {
    schoolProfile: initialSchoolProfile,
    campuses: initialCampuses,
    selectedCampusId: 'camp-1',
    academicYears: initialAcademicYears,
    selectedAcademicYear: '2024-2025',
    students: initialStudents,
    staff: initialStaff,
    classes: initialClasses,
    admissions: initialAdmissions,
    invoices: initialInvoices,
    receipts: initialReceipts,
    exams: initialExams,
    examMarks: initialExamMarks,
    assignments: initialAssignments,
    timetable: initialTimetable,
    notices: initialNotices,
    activities: initialActivities,
    books: initialBooks,
    bookIssues: initialBookIssues,
    routes: initialRoutes,
    hostelRooms: initialHostelRooms,
    auditLogs: initialAuditLogs,
    notifications: getInitialNotifications(),
    frontOfficeEnquiries: initialFrontOfficeEnquiries,
    visitorLogs: initialVisitorLogs,
    complaints: initialComplaints,
    subjects: initialSubjects,
    lessonPlans: initialLessonPlans,
    questions: initialQuestions,
    studyResources: initialStudyResources,
    expenseVouchers: initialExpenseVouchers,
    incomeRecords: initialIncomeRecords,
    vendors: initialVendors,
    staffLeaves: initialStaffLeaves,
    payrolls: initialPayrolls,
    inventoryItems: initialInventoryItems,
    assets: initialAssets,
    certificates: initialCertificates,
    healthRecords: initialHealthRecords,
    disciplineIncidents: initialDisciplineIncidents,
    alumni: initialAlumni,
    integrations: initialIntegrations,
    customModules: initialCustomModules,
    customFeatures: initialCustomFeatures,
    featureFlags: initialFeatureFlags,
    navigationConfig: initialNavigationItems,
    customFields: initialCustomFields,
    customFieldValues: {},
    customForms: initialCustomForms,
    tableViews: initialTableViews,
    dashboardWidgets: initialDashboardWidgets,
    themes: initialThemePresets,
    activeThemeId: 'theme-professional-blue',
    templates: initialTemplates,
    workflows: initialWorkflows,
    numberingConfigs: initialNumberingConfigs,
    schoolBranding: initialSchoolBranding,
    localization: initialLocalization,
    userPreferences: initialUserPreferences,
    configSnapshots: initialVersionSnapshots,
    users: initialUsers,
    loginHistory: initialLoginHistory,
    userSessions: initialSessions,
    securitySettings: initialSecuritySettings,
    currentUser: {
      name: 'Administrator (Super Admin)',
      role: 'SUPER_ADMIN',
      roleLabel: 'Super Administrator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
    },
    attendanceSummary: {
      totalStudents: 1248,
      present: 1148,
      absent: 82,
      leave: 18,
      percentage: 92
    },
    lastBackupDate: '2025-04-28 06:00 AM'
  };
};

// Singleton In-Memory + Persistent Store
class ERPStore {
  private state: ERPState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = loadStoredState();
  }

  public getState(): ERPState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.save();
    this.listeners.forEach(fn => fn());
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to persist ERP state:', e);
    }
  }

  public logAudit(action: string, module: string, entityId: string, details: string, result: 'SUCCESS' | 'FAILURE' = 'SUCCESS') {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      user: this.state.currentUser.name,
      role: this.state.currentUser.role,
      action,
      module,
      entityId,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      result,
      details
    };
    this.state.auditLogs = [newLog, ...this.state.auditLogs];
  }

  public addNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error', module: string) {
    const notif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title,
      message,
      time: 'Just now',
      timestamp: Date.now(),
      read: false,
      type,
      urgency: type === 'error' ? 'CRITICAL' : type === 'warning' ? 'WARNING' : 'INFO',
      category: module.toUpperCase().includes('ATTENDANCE') ? 'ATTENDANCE' : module.toUpperCase().includes('FEE') ? 'FEE' : module.toUpperCase().includes('EXAM') ? 'EXAM' : 'SYSTEM',
      module
    };
    this.state.notifications = [notif, ...this.state.notifications];
    this.notify();
  }

  public addDetailedNotification(notif: AppNotification) {
    // Prevent duplicate IDs
    const filtered = this.state.notifications.filter(n => n.id !== notif.id);
    this.state.notifications = [notif, ...filtered];
    this.notify();
  }

  public async fetchStudents() {
    try {
      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const students = await response.json();
        this.state.students = students;
        this.notify();
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  }

  public dismissNotification(id: string) {
    this.state.notifications = this.state.notifications.filter(n => n.id !== id);
    this.notify();
  }

  public clearReadNotifications() {
    this.state.notifications = this.state.notifications.filter(n => !n.read);
    this.notify();
  }

  public setCurrentUserRole(role: Role) {
    const labels: Record<Role, string> = {
      SUPER_ADMIN: 'Super Admin',
      ADMIN: 'School Admin',
      PRINCIPAL: 'Principal',
      VICE_PRINCIPAL: 'Vice Principal',
      TEACHER: 'Senior Faculty',
      ACCOUNTANT: 'Accounts Officer',
      LIBRARIAN: 'Librarian',
      RECEPTIONIST: 'Receptionist',
      HOSTEL_WARDEN: 'Hostel Warden',
      HR_MANAGER: 'HR Manager',
      TRANSPORT_MANAGER: 'Transport Manager'
    };
    this.state.currentUser.role = role;
    this.state.currentUser.roleLabel = labels[role];
    this.logAudit('ROLE_SWITCH', 'Security', role, `Switched view context to ${labels[role]}`);
    this.notify();
  }

  // --- User & Authentication Operations ---
  public getUsers(): UserAccount[] {
    return this.state.users;
  }

  public getSanitizedUsers(): SanitizedUser[] {
    return this.state.users.map(u => AuthIpcService.sanitizeUser(u));
  }

  public getUserById(id: string): UserAccount | undefined {
    return this.state.users.find(u => u.id === id);
  }

  public getUserByUsername(username: string): UserAccount | undefined {
    return this.state.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
  }

  public async authenticate(username: string, candidatePassword: string, deviceInfo: string = 'SchoolERP Desktop Client'): Promise<LoginResult> {
    const authRes = await AuthenticationService.authenticate(
      username,
      candidatePassword,
      this.state.users,
      this.state.securitySettings,
      deviceInfo
    );

    this.state.users = authRes.updatedUsers;
    this.state.loginHistory = [authRes.loginHistoryRecord, ...this.state.loginHistory];

    if (authRes.result.success && authRes.newSession && authRes.result.user) {
      this.state.userSessions = this.state.userSessions.map(s => ({ ...s, isCurrent: false }));
      this.state.userSessions = [authRes.newSession, ...this.state.userSessions.slice(0, 15)];

      const user = this.state.users.find(u => u.id === authRes.newSession?.userId);
      if (user) {
        this.state.currentUser = {
          name: user.displayName,
          role: user.role,
          roleLabel: user.roleLabel || AuthIpcService.getRoleLabel(user.role),
          avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
        };
        this.logAudit('USER_LOGIN', 'Authentication', user.username, `Session initiated (${deviceInfo}) via AuthenticationService`);
      }
    } else {
      if (authRes.loginHistoryRecord.eventType === 'ACCOUNT_LOCKED') {
        this.logAudit('ACCOUNT_LOCKED', 'Security', authRes.loginHistoryRecord.username, authRes.loginHistoryRecord.reason, 'FAILURE');
      } else {
        this.logAudit('AUTH_FAILED', 'Authentication', authRes.loginHistoryRecord.username, authRes.loginHistoryRecord.reason, 'FAILURE');
      }
    }

    this.notify();
    return authRes.result;
  }

  public async createUserAccount(payload: CreateUserPayload): Promise<{ success: boolean; user?: SanitizedUser; error?: AuthValidationResult }> {
    const actor = {
      id: 'current-actor',
      username: this.state.currentUser.name,
      role: this.state.currentUser.role,
      schoolId: 'sch-main'
    };

    const res = await AuthIpcService.executeCreateUserTransaction(
      payload,
      actor,
      this.state.users,
      this.state.securitySettings
    );

    if (res.success && res.user) {
      this.state.users = [res.user, ...this.state.users];
      this.logAudit(
        'USER_CREATED',
        'Administration',
        res.user.username,
        `Created new user account: ${res.user.displayName} (${res.user.roleLabel}) with Argon2id hash`
      );
      this.notify();
      return { success: true, user: AuthIpcService.sanitizeUser(res.user) };
    }

    return { success: false, error: res.error };
  }

  public updateUserAccount(userId: string, payload: UpdateUserPayload): { success: boolean; error?: string } {
    const user = this.state.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User account not found.' };

    if (payload.displayName) user.displayName = payload.displayName.trim();
    if (payload.email) user.email = payload.email.trim().toLowerCase();
    if (payload.phone !== undefined) user.phone = payload.phone;
    if (payload.employeeId !== undefined) user.employeeId = payload.employeeId;
    if (payload.userType) user.userType = payload.userType;
    if (payload.role) {
      user.role = payload.role;
      user.roleLabel = AuthIpcService.getRoleLabel(payload.role);
    }
    if (payload.schoolId) user.schoolId = payload.schoolId;
    if (payload.schoolName) user.schoolName = payload.schoolName;
    if (payload.campusId) user.campusId = payload.campusId;
    if (payload.campusName) user.campusName = payload.campusName;
    if (payload.department !== undefined) user.department = payload.department;
    if (payload.designation !== undefined) user.designation = payload.designation;
    if (payload.status) user.status = payload.status;
    if (payload.permissions) user.permissions = payload.permissions;
    if (payload.mfaEnabled !== undefined) user.mfaEnabled = payload.mfaEnabled;

    user.updatedAt = new Date().toISOString().split('T')[0];
    user.updatedBy = this.state.currentUser.name;

    this.logAudit('USER_UPDATED', 'Administration', user.username, `Updated profile and permissions for ${user.displayName}`);
    this.notify();
    return { success: true };
  }

  public setUserStatus(userId: string, status: UserStatus, reason?: string): boolean {
    const user = this.state.users.find(u => u.id === userId);
    if (!user) return false;

    const oldStatus = user.status;
    user.status = status;
    if (status === 'ACTIVE') {
      user.failedLoginCount = 0;
      user.lockedUntil = undefined;
      user.lockReason = undefined;
    } else if (status === 'LOCKED' && reason) {
      user.lockReason = reason;
    }

    user.updatedAt = new Date().toISOString().split('T')[0];
    this.logAudit('USER_STATUS_CHANGE', 'Administration', user.username, `Status changed from ${oldStatus} to ${status}${reason ? ` (${reason})` : ''}`);
    this.notify();
    return true;
  }

  public async resetUserPassword(userId: string, newPassword?: string, forcePasswordChange: boolean = true): Promise<{ success: boolean; temporaryPassword?: string; error?: string }> {
    const user = this.state.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User account not found.' };

    const plainPassword = newPassword || PasswordService.generateTemporaryPassword(14);
    const policyRes = PasswordService.validatePasswordPolicy(plainPassword, this.state.securitySettings.passwordPolicy);
    if (!policyRes.isValid) {
      return { success: false, error: policyRes.message };
    }

    const salt = PasswordService.generateSalt(16);
    const newHash = await PasswordService.hashPassword(plainPassword, salt);

    user.passwordHash = newHash;
    user.passwordSalt = salt;
    user.passwordHistory = [newHash, ...(user.passwordHistory || []).slice(0, 4)];
    user.forcePasswordChange = forcePasswordChange;
    user.failedLoginCount = 0;
    user.lockedUntil = undefined;
    user.lockReason = undefined;
    user.lastPasswordChangedAt = new Date().toISOString().split('T')[0];
    user.updatedAt = new Date().toISOString().split('T')[0];

    const logRec: LoginHistoryRecord = {
      id: `log-${Date.now()}`,
      userId: user.id,
      username: user.username,
      timestamp: new Date().toLocaleString(),
      result: 'SUCCESS',
      eventType: 'PASSWORD_RESET',
      device: 'Admin Console IPC',
      ip: '127.0.0.1',
      reason: `Password reset by administrator ${this.state.currentUser.name}`
    };
    this.state.loginHistory = [logRec, ...this.state.loginHistory];
    this.logAudit('PASSWORD_RESET', 'Security', user.username, `Administrator reset password with forceChange=${forcePasswordChange}`);
    this.notify();

    return { success: true, temporaryPassword: plainPassword };
  }

  public async changeUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const user = this.state.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User account not found.' };

    const isCurrentValid = await PasswordService.verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return { success: false, error: 'Current password verification failed. Please check your current password.' };
    }

    const policyRes = PasswordService.validatePasswordPolicy(newPassword, this.state.securitySettings.passwordPolicy);
    if (!policyRes.isValid) {
      return { success: false, error: policyRes.message };
    }

    const inHistory = await PasswordService.isPasswordInHistory(newPassword, user.passwordHistory || []);
    if (inHistory) {
      return { success: false, error: 'Cannot reuse recent passwords. Please choose a new password.' };
    }

    const salt = PasswordService.generateSalt(16);
    const newHash = await PasswordService.hashPassword(newPassword, salt);

    user.passwordHash = newHash;
    user.passwordSalt = salt;
    user.passwordHistory = [newHash, ...(user.passwordHistory || []).slice(0, 4)];
    user.forcePasswordChange = false;
    user.lastPasswordChangedAt = new Date().toISOString().split('T')[0];
    user.updatedAt = new Date().toISOString().split('T')[0];

    const logRec: LoginHistoryRecord = {
      id: `log-${Date.now()}`,
      userId: user.id,
      username: user.username,
      timestamp: new Date().toLocaleString(),
      result: 'SUCCESS',
      eventType: 'PASSWORD_CHANGED',
      device: 'User Self-Service',
      ip: '127.0.0.1',
      reason: 'User successfully changed account password'
    };
    this.state.loginHistory = [logRec, ...this.state.loginHistory];
    this.logAudit('PASSWORD_CHANGED', 'Security', user.username, 'User changed account password');
    this.notify();

    return { success: true };
  }

  public unlockUserAccount(userId: string): boolean {
    const user = this.state.users.find(u => u.id === userId);
    if (!user) return false;

    user.status = 'ACTIVE';
    user.failedLoginCount = 0;
    user.lockedUntil = undefined;
    user.lockReason = undefined;
    user.updatedAt = new Date().toISOString().split('T')[0];

    const logRec: LoginHistoryRecord = {
      id: `log-${Date.now()}`,
      userId: user.id,
      username: user.username,
      timestamp: new Date().toLocaleString(),
      result: 'SUCCESS',
      eventType: 'ACCOUNT_UNLOCKED',
      device: 'Admin Console IPC',
      ip: '127.0.0.1',
      reason: `Account unlocked by administrator ${this.state.currentUser.name}`
    };
    this.state.loginHistory = [logRec, ...this.state.loginHistory];
    this.logAudit('ACCOUNT_UNLOCKED', 'Security', user.username, `Unlocked account for user ${user.displayName}`);
    this.notify();
    return true;
  }

  public lockUserAccount(userId: string, reason: string): boolean {
    const user = this.state.users.find(u => u.id === userId);
    if (!user) return false;

    user.status = 'LOCKED';
    user.lockReason = reason;
    user.updatedAt = new Date().toISOString().split('T')[0];

    const logRec: LoginHistoryRecord = {
      id: `log-${Date.now()}`,
      userId: user.id,
      username: user.username,
      timestamp: new Date().toLocaleString(),
      result: 'WARNING',
      eventType: 'ACCOUNT_LOCKED',
      device: 'Admin Console IPC',
      ip: '127.0.0.1',
      reason: `Admin lock: ${reason}`
    };
    this.state.loginHistory = [logRec, ...this.state.loginHistory];
    this.logAudit('ACCOUNT_LOCKED', 'Security', user.username, `Admin manually locked account: ${reason}`);
    this.notify();
    return true;
  }

  public deleteUserAccount(userId: string): { success: boolean; error?: string } {
    const user = this.state.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found.' };

    if (user.username === 'admin') {
      return { success: false, error: 'The primary system administrator account cannot be deleted.' };
    }

    this.state.users = this.state.users.filter(u => u.id !== userId);
    this.state.userSessions = this.state.userSessions.filter(s => s.userId !== userId);
    this.logAudit('USER_DELETED', 'Administration', user.username, `Deleted user account: ${user.displayName}`);
    this.notify();
    return { success: true };
  }

  public terminateSession(sessionId: string): boolean {
    const session = this.state.userSessions.find(s => s.id === sessionId);
    if (!session) return false;

    this.state.userSessions = this.state.userSessions.filter(s => s.id !== sessionId);
    const logRec: LoginHistoryRecord = {
      id: `log-${Date.now()}`,
      userId: session.userId,
      username: session.username,
      timestamp: new Date().toLocaleString(),
      result: 'SUCCESS',
      eventType: 'SESSION_TERMINATED',
      device: session.device,
      ip: session.ip,
      reason: 'Session revoked/terminated'
    };
    this.state.loginHistory = [logRec, ...this.state.loginHistory];
    this.logAudit('SESSION_TERMINATED', 'Security', session.username, `Terminated active session (${session.id})`);
    this.notify();
    return true;
  }

  public terminateAllUserSessions(userId: string): boolean {
    const user = this.state.users.find(u => u.id === userId);
    this.state.userSessions = this.state.userSessions.filter(s => s.userId !== userId);
    this.logAudit('SESSIONS_PURGED', 'Security', user ? user.username : userId, 'Terminated all active user sessions');
    this.notify();
    return true;
  }

  public updateSecuritySettings(settings: Partial<SecuritySettingsConfig>) {
    this.state.securitySettings = {
      ...this.state.securitySettings,
      ...settings,
      passwordPolicy: {
        ...this.state.securitySettings.passwordPolicy,
        ...(settings.passwordPolicy || {})
      },
      twoFactorAuth: {
        ...this.state.securitySettings.twoFactorAuth,
        ...(settings.twoFactorAuth || {})
      },
      sessionSecurity: {
        ...this.state.securitySettings.sessionSecurity,
        ...(settings.sessionSecurity || {})
      },
      auditCompliance: {
        ...this.state.securitySettings.auditCompliance,
        ...(settings.auditCompliance || {})
      }
    };
    this.logAudit('SECURITY_POLICY_UPDATED', 'Security', 'POLICIES', 'Updated password policy, lockout parameters, and compliance rules');
    this.notify();
  }

  public switchActiveUser(userId: string): boolean {
    const user = this.state.users.find(u => u.id === userId);
    if (!user) return false;

    this.state.currentUser = {
      name: user.displayName,
      role: user.role,
      roleLabel: user.roleLabel || AuthIpcService.getRoleLabel(user.role),
      avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
    };

    this.logAudit('USER_SWITCH', 'Security', user.username, `Simulated active user switch to ${user.displayName} (${user.role})`);
    this.notify();
    return true;
  }

  // --- Student Operations ---
  public addStudent(studentData: Omit<Student, 'id' | 'admissionNo' | 'status' | 'enrollmentDate' | 'attendancePercent' | 'documents'>): Student {
    const count = this.state.students.length + 1;
    const admissionNo = `ADM-2025-${String(count).padStart(3, '0')}`;
    const newStudent: Student = {
      ...studentData,
      id: `s-${Date.now()}`,
      admissionNo,
      status: 'ACTIVE',
      enrollmentDate: new Date().toISOString().slice(0, 10),
      attendancePercent: 100,
      documents: []
    };
    this.state.students = [newStudent, ...this.state.students];

    // If pending fee, create invoice
    if (newStudent.pendingAmount > 0) {
      this.createInvoice({
        studentId: newStudent.id,
        studentName: `${newStudent.firstName} ${newStudent.lastName}`,
        admissionNo: newStudent.admissionNo,
        className: `${newStudent.className} (${newStudent.section})`,
        feeType: 'Admission & Term 1 Tuition',
        totalAmount: newStudent.totalFees,
        paidAmount: newStudent.paidFees,
        balance: newStudent.pendingAmount,
        dueDate: '2025-05-15',
        status: newStudent.paidFees >= newStudent.totalFees ? 'PAID' : (newStudent.paidFees > 0 ? 'PARTIAL' : 'PENDING'),
        issueDate: new Date().toISOString().slice(0, 10)
      });
    }

    this.logAudit('STUDENT_CREATE', 'Students', newStudent.admissionNo, `Enrolled student ${newStudent.firstName} ${newStudent.lastName} in ${newStudent.className} (${newStudent.section})`);
    this.addNotification('New Student Enrolled', `${newStudent.firstName} ${newStudent.lastName} registered in ${newStudent.className}`, 'success', 'Students');
    this.notify();
    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Student>) {
    this.state.students = this.state.students.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates };
        this.logAudit('STUDENT_UPDATE', 'Students', updated.admissionNo, `Updated record for ${updated.firstName} ${updated.lastName}`);
        return updated;
      }
      return s;
    });
    this.notify();
  }

  public deleteStudent(id: string) {
    const student = this.state.students.find(s => s.id === id);
    if (student) {
      this.state.students = this.state.students.filter(s => s.id !== id);
      this.logAudit('STUDENT_ARCHIVE', 'Students', student.admissionNo, `Archived student ${student.firstName} ${student.lastName}`);
      this.addNotification('Student Record Removed', `${student.firstName} ${student.lastName} archived`, 'info', 'Students');
      this.notify();
    }
  }

  // --- Staff Operations ---
  public addStaff(staffData: Omit<Staff, 'id' | 'empId' | 'status' | 'attendanceStatus'>): Staff {
    const empId = `EMP-0${String(this.state.staff.length + 101)}`;
    const newStaff: Staff = {
      ...staffData,
      id: `st-${Date.now()}`,
      empId,
      status: 'ACTIVE',
      attendanceStatus: 'PRESENT'
    };
    this.state.staff = [newStaff, ...this.state.staff];
    this.logAudit('STAFF_CREATE', 'Staff', newStaff.empId, `Added staff member ${newStaff.firstName} ${newStaff.lastName} (${newStaff.designation})`);
    this.addNotification('New Staff Joined', `${newStaff.firstName} ${newStaff.lastName} added to ${newStaff.department}`, 'success', 'Staff');
    this.notify();
    return newStaff;
  }

  public deleteStaff(id: string) {
    const member = this.state.staff.find(s => s.id === id);
    if (member) {
      this.state.staff = this.state.staff.filter(s => s.id !== id);
      this.logAudit('STAFF_DELETE', 'Staff', member.empId, `Removed staff member ${member.firstName} ${member.lastName}`);
      this.addNotification('Staff Record Removed', `${member.firstName} ${member.lastName} removed`, 'info', 'Staff');
      this.notify();
    }
  }

  // --- Admissions Operations ---
  public addAdmission(admissionData: Omit<Admission, 'id' | 'applicationNo' | 'applicationDate' | 'status' | 'documentsVerified'>): Admission {
    const appNo = `APP-2025-${String(this.state.admissions.length + 1045)}`;
    const newAdm: Admission = {
      ...admissionData,
      id: `adm-${Date.now()}`,
      applicationNo: appNo,
      applicationDate: new Date().toISOString().slice(0, 10),
      status: 'APPLICATION',
      documentsVerified: false
    };
    this.state.admissions = [newAdm, ...this.state.admissions];
    this.logAudit('ADMISSION_ENQUIRY', 'Admissions', appNo, `Received admission application for ${newAdm.studentName}`);
    this.addNotification('New Admission Application', `Application received for ${newAdm.studentName} (${newAdm.appliedClass})`, 'info', 'Admissions');
    this.notify();
    return newAdm;
  }

  public updateAdmissionStatus(id: string, status: AdmissionStatus, verified?: boolean) {
    this.state.admissions = this.state.admissions.map(adm => {
      if (adm.id === id) {
        const updated = { 
          ...adm, 
          status, 
          documentsVerified: verified !== undefined ? verified : adm.documentsVerified 
        };
        this.logAudit('ADMISSION_STATUS', 'Admissions', adm.applicationNo, `Status changed to ${status}`);
        return updated;
      }
      return adm;
    });
    this.notify();
  }

  public enrollApplicant(admissionId: string, section: string = 'A'): Student | null {
    const adm = this.state.admissions.find(a => a.id === admissionId);
    if (!adm) return null;

    const names = adm.studentName.split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || 'Student';

    const newStudent = this.addStudent({
      firstName,
      lastName,
      gender: adm.gender,
      dob: '2010-05-15',
      bloodGroup: 'B+',
      classId: 'c1',
      className: adm.appliedClass,
      section,
      rollNo: this.state.students.filter(s => s.className === adm.appliedClass).length + 1,
      parentName: adm.parentName,
      parentRelationship: 'Guardian',
      parentPhone: adm.phone,
      parentEmail: adm.email,
      address: 'Admitted via Portal',
      city: 'Delhi',
      state: 'Delhi',
      feeStatus: 'PENDING',
      totalFees: 45000,
      paidFees: 0,
      pendingAmount: 45000
    });

    this.updateAdmissionStatus(admissionId, 'ENROLLED', true);
    this.logAudit('ADMISSION_CONVERT', 'Admissions', adm.applicationNo, `Converted applicant ${adm.studentName} to enrolled student ${newStudent.admissionNo}`);
    return newStudent;
  }

  // --- Attendance Operations ---
  public markClassAttendance(className: string, section: string, records: { studentId: string; status: AttendanceStatus }[]) {
    records.forEach(r => {
      const student = this.state.students.find(s => s.id === r.studentId);
      if (student) {
        // adjust percent slightly
        const delta = r.status === 'PRESENT' ? 0.2 : (r.status === 'ABSENT' ? -0.8 : -0.2);
        student.attendancePercent = Math.min(100, Math.max(50, Math.round((student.attendancePercent + delta) * 10) / 10));

        // Real-time Low Attendance Alert check
        if (student.attendancePercent < 75) {
          const alertId = `notif-att-${student.id}`;
          const existing = this.state.notifications.find(n => n.id === alertId);
          if (!existing) {
            this.addDetailedNotification({
              id: alertId,
              title: `Low Attendance Alert: ${student.firstName} ${student.lastName} (${student.attendancePercent}%)`,
              message: `Student in ${student.className} (${student.section}) attendance has fallen to ${student.attendancePercent}% (below 75% CBSE requirement). Guardian: ${student.parentName} (${student.parentPhone}).`,
              time: 'Just now',
              timestamp: Date.now(),
              read: false,
              type: 'error',
              urgency: student.attendancePercent < 70 ? 'CRITICAL' : 'WARNING',
              category: 'ATTENDANCE',
              module: 'Attendance',
              targetId: student.id,
              targetAction: 'view_student'
            });
          }
        }
      }
    });

    const presentCount = records.filter(r => r.status === 'PRESENT').length;
    const absentCount = records.filter(r => r.status === 'ABSENT').length;
    const leaveCount = records.filter(r => r.status === 'LEAVE').length;

    this.logAudit('ATTENDANCE_MARKED', 'Attendance', `${className}-${section}`, `Marked attendance for ${className} (${section}): ${presentCount} Present, ${absentCount} Absent, ${leaveCount} Leave`);
    this.addNotification('Attendance Recorded', `Class ${className} (${section}) attendance recorded successfully`, 'success', 'Attendance');
    this.notify();
  }

  // --- Background Real-Time Refresh for Student Engagement & Attendance ---
  public refreshStudentAttendanceAndEngagement(): {
    timestamp: string;
    totalStudents: number;
    presentStudents: number;
    absentStudents: number;
    leaveStudents: number;
    attendancePercent: number;
    activeEngagements: number;
    newAlertsCount: number;
  } {
    const totalStudents = this.state.students.length > 0 ? this.state.students.length : 1248;
    const avgAttendance = this.state.students.length > 0
      ? Math.round((this.state.students.reduce((acc, s) => acc + (s.attendancePercent || 90), 0) / this.state.students.length) * 10) / 10
      : 92.4;
    
    const presentStudents = Math.round((totalStudents * avgAttendance) / 100);
    const leaveStudents = Math.round(totalStudents * 0.015);
    const absentStudents = Math.max(0, totalStudents - presentStudents - leaveStudents);

    this.state.attendanceSummary = {
      totalStudents,
      present: presentStudents,
      absent: absentStudents,
      leave: leaveStudents,
      percentage: Math.round(avgAttendance)
    };

    // Add dynamic real-time engagement activity
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const engagementActivities: Omit<RecentActivity, 'id'>[] = [
      {
        type: 'ATTENDANCE',
        title: `Live biometric sync: ${presentStudents.toLocaleString()} students verified on campus`,
        timestamp: `${timeString}`,
        module: 'Attendance',
        iconColor: '#10b981'
      },
      {
        type: 'ASSIGNMENT',
        title: `Student Portal: 42 homework submissions & lesson reviews completed`,
        timestamp: `${timeString}`,
        module: 'Academics',
        iconColor: '#6366f1'
      },
      {
        type: 'ATTENDANCE',
        title: `Class attendance verified & synced across all campus wings`,
        timestamp: `${timeString}`,
        module: 'Attendance',
        iconColor: '#10b981'
      }
    ];

    const randomEvent = engagementActivities[Math.floor(Math.random() * engagementActivities.length)];
    this.state.activities = [
      {
        id: `act-sync-${Date.now()}`,
        ...randomEvent
      },
      ...this.state.activities.slice(0, 19)
    ];

    // Scan for student low-attendance threshold warnings (<75%)
    let newAlertsCount = 0;
    this.state.students.forEach(s => {
      if (s.attendancePercent < 75) {
        const notifId = `notif-att-${s.id}`;
        if (!this.state.notifications.some(n => n.id === notifId)) {
          newAlertsCount++;
          this.state.notifications.unshift({
            id: notifId,
            title: `Low Attendance Alert: ${s.firstName} ${s.lastName} (${s.attendancePercent}%)`,
            message: `Attendance for ${s.firstName} ${s.lastName} (${s.className}-${s.section}) is below statutory 75%. Guardian: ${s.parentName} (${s.parentPhone}).`,
            time: 'Just now',
            timestamp: Date.now(),
            read: false,
            type: 'error',
            urgency: s.attendancePercent < 70 ? 'CRITICAL' : 'WARNING',
            category: 'ATTENDANCE',
            module: 'Attendance',
            targetId: s.id,
            targetAction: 'view_student'
          });
        }
      }
    });

    this.logAudit('BACKGROUND_SYNC', 'Dashboard', 'ATTENDANCE_ENGAGEMENT', `Auto-refreshed attendance and engagement metrics (${presentStudents}/${totalStudents} present, ${avgAttendance}%)`);
    this.notify();

    return {
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      totalStudents,
      presentStudents,
      absentStudents,
      leaveStudents,
      attendancePercent: Math.round(avgAttendance),
      activeEngagements: Math.floor(Math.random() * 25) + 110,
      newAlertsCount
    };
  }

  // --- Finance & Fees Operations ---
  public createInvoice(invoiceData: Omit<FeeInvoice, 'id' | 'invoiceNo'>): FeeInvoice {
    const invNo = `INV-2025-${String(this.state.invoices.length + 105).padStart(3, '0')}`;
    const newInv: FeeInvoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      invoiceNo: invNo
    };
    this.state.invoices = [newInv, ...this.state.invoices];
    this.logAudit('INVOICE_CREATED', 'Fees', invNo, `Generated invoice for ${newInv.studentName}: ₹${newInv.totalAmount}`);
    this.notify();
    return newInv;
  }

  public recordPayment(params: {
    invoiceId: string;
    amount: number;
    paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Net Banking' | 'Cheque';
    cashierName: string;
    notes?: string;
  }): PaymentReceipt | null {
    const invoice = this.state.invoices.find(inv => inv.id === params.invoiceId);
    if (!invoice) return null;

    const receiptNo = `RCP-2025-${String(this.state.receipts.length + 503).padStart(3, '0')}`;
    const receipt: PaymentReceipt = {
      id: `rcp-${Date.now()}`,
      receiptNo,
      invoiceId: invoice.id,
      studentId: invoice.studentId,
      studentName: invoice.studentName,
      admissionNo: invoice.admissionNo,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      paymentDate: new Date().toLocaleString(),
      cashierName: params.cashierName,
      notes: params.notes
    };

    // Update invoice balance & status
    invoice.paidAmount += params.amount;
    invoice.balance = Math.max(0, invoice.totalAmount - invoice.paidAmount);
    invoice.status = invoice.balance === 0 ? 'PAID' : (invoice.paidAmount > 0 ? 'PARTIAL' : 'PENDING');

    // Update student pending fees
    const student = this.state.students.find(s => s.id === invoice.studentId);
    if (student) {
      student.paidFees += params.amount;
      student.pendingAmount = Math.max(0, student.totalFees - student.paidFees);
      student.feeStatus = student.pendingAmount === 0 ? 'PAID' : (student.paidFees > 0 ? 'PARTIAL' : 'PENDING');
    }

    this.state.receipts = [receipt, ...this.state.receipts];

    // Add to recent activity
    this.state.activities = [
      {
        id: `act-${Date.now()}`,
        type: 'FEE',
        title: `Fee payment received - ₹${params.amount.toLocaleString()}`,
        timestamp: 'Just now',
        module: 'Fees',
        iconColor: '#10b981'
      },
      ...this.state.activities
    ];

    this.logAudit('PAYMENT_COLLECTED', 'Fees', receiptNo, `Collected ₹${params.amount} from ${invoice.studentName} via ${params.paymentMethod}`);
    this.addNotification('Fee Payment Collected', `Receipt ${receiptNo} issued for ₹${params.amount.toLocaleString()} (${invoice.studentName})`, 'success', 'Fees');

    if (invoice.balance === 0) {
      this.dismissNotification(`notif-fee-${invoice.id}`);
    }

    this.notify();
    return receipt;
  }

  // --- Examination Operations ---
  public createExam(examData: Omit<Exam, 'id' | 'status'>): Exam {
    const newExam: Exam = {
      ...examData,
      id: `ex-${Date.now()}`,
      status: 'UPCOMING'
    };
    this.state.exams = [newExam, ...this.state.exams];
    this.logAudit('EXAM_CREATED', 'Examinations', newExam.name, `Created exam schedule for ${newExam.classes.join(', ')}`);
    this.addDetailedNotification({
      id: `notif-exam-${newExam.id}`,
      title: `Upcoming Exam Deadline: ${newExam.name}`,
      message: `Official exam scheduled for ${newExam.startDate}. Applicable to grades: ${newExam.classes.join(', ')}. Review timetable and hall tickets.`,
      time: 'Just now',
      timestamp: Date.now(),
      read: false,
      type: 'warning',
      urgency: 'WARNING',
      category: 'EXAM',
      module: 'Examinations',
      targetId: newExam.id,
      targetAction: 'view_exam'
    });
    this.notify();
    return newExam;
  }

  public recordExamMark(mark: Omit<ExamMark, 'id'>) {
    const existingIndex = this.state.examMarks.findIndex(m => m.examId === mark.examId && m.studentId === mark.studentId && m.subject === mark.subject);
    if (existingIndex >= 0) {
      this.state.examMarks[existingIndex] = { ...this.state.examMarks[existingIndex], ...mark };
    } else {
      this.state.examMarks.push({ ...mark, id: `em-${Date.now()}-${Math.random().toString(36).substring(2, 5)}` });
    }
    this.notify();
  }

  public publishExam(examId: string) {
    const exam = this.state.exams.find(e => e.id === examId);
    if (exam) {
      exam.status = 'PUBLISHED';
      this.state.activities = [
        {
          id: `act-${Date.now()}`,
          type: 'EXAM',
          title: `Exam result published - ${exam.name}`,
          timestamp: 'Just now',
          module: 'Examinations',
          iconColor: '#f97316'
        },
        ...this.state.activities
      ];
      this.logAudit('RESULT_PUBLISH', 'Examinations', exam.name, `Published evaluation results for ${exam.name}`);
      this.addNotification('Exam Results Published', `Results for ${exam.name} are now accessible`, 'success', 'Examinations');
      this.notify();
    }
  }

  // --- Assignment Operations ---
  public addAssignment(asgData: Omit<Assignment, 'id' | 'submissionsCount'>): Assignment {
    const newAsg: Assignment = {
      ...asgData,
      id: `asg-${Date.now()}`,
      submissionsCount: 0
    };
    this.state.assignments = [newAsg, ...this.state.assignments];
    this.state.activities = [
      {
        id: `act-${Date.now()}`,
        type: 'ASSIGNMENT',
        title: `New assignment posted - ${newAsg.subject}`,
        timestamp: 'Just now',
        module: 'Assignments',
        iconColor: '#6366f1'
      },
      ...this.state.activities
    ];
    this.logAudit('ASSIGNMENT_CREATED', 'Assignments', newAsg.title, `Published assignment for ${newAsg.className} - ${newAsg.subject}`);
    this.addNotification('Assignment Published', `${newAsg.title} (${newAsg.subject}) due ${newAsg.dueDate}`, 'info', 'Assignments');
    this.notify();
    return newAsg;
  }

  // --- Library Operations ---
  public addBook(bookData: { title: string; author: string; category: string; totalCopies: number; isbn?: string; rackNo?: string }): Book {
    const newBook: Book = {
      id: `bk-${Date.now()}`,
      isbn: bookData.isbn || `978-0-${Math.floor(100000 + Math.random() * 900000)}`,
      rackNo: bookData.rackNo || 'R-12',
      title: bookData.title,
      author: bookData.author,
      category: bookData.category,
      totalCopies: bookData.totalCopies,
      availableCopies: bookData.totalCopies
    };
    this.state.books = [newBook, ...this.state.books];
    this.logAudit('BOOK_ADDED', 'Library', newBook.isbn, `Added catalog book "${newBook.title}" (${newBook.totalCopies} copies)`);
    this.notify();
    return newBook;
  }

  public issueBook(bookId: string, studentId: string, studentName: string, daysOrDueDate: number | string = 14) {
    const book = this.state.books.find(b => b.id === bookId);
    if (!book || book.availableCopies <= 0) return false;

    book.availableCopies -= 1;
    const issueDate = new Date().toISOString().slice(0, 10);
    const dueDate = typeof daysOrDueDate === 'string'
      ? daysOrDueDate
      : new Date(Date.now() + daysOrDueDate * 86400000).toISOString().slice(0, 10);

    const issue: BookIssue = {
      id: `bi-${Date.now()}`,
      bookId,
      bookTitle: book.title,
      studentId,
      studentName,
      issueDate,
      dueDate,
      fineAmount: 0,
      status: 'ISSUED'
    };
    this.state.bookIssues = [issue, ...this.state.bookIssues];
    this.logAudit('BOOK_ISSUED', 'Library', book.title, `Issued "${book.title}" to ${studentName}`);
    this.notify();
    return true;
  }

  public returnBook(issueId: string) {
    const issue = this.state.bookIssues.find(i => i.id === issueId);
    if (issue && issue.status === 'ISSUED') {
      issue.status = 'RETURNED';
      issue.returnDate = new Date().toISOString().slice(0, 10);
      const book = this.state.books.find(b => b.id === issue.bookId);
      if (book) book.availableCopies += 1;
      this.logAudit('BOOK_RETURNED', 'Library', issue.bookTitle, `Returned "${issue.bookTitle}" by ${issue.studentName}`);
      this.notify();
    }
  }

  // --- Multi-Campus & Academic Year ---
  public setSelectedCampus(campusId: string) {
    this.state.selectedCampusId = campusId;
    const campus = this.state.campuses.find(c => c.id === campusId);
    this.logAudit('CAMPUS_SWITCHED', 'System', campusId, `Active operating campus context switched to: ${campus?.name || campusId}`);
    this.notify();
  }

  public setSelectedAcademicYear(year: string) {
    this.state.selectedAcademicYear = year;
    this.logAudit('ACADEMIC_YEAR_SWITCHED', 'Academics', year, `Active academic year session switched to: ${year}`);
    this.notify();
  }

  // --- Front Office & Visitor Management ---
  public addFrontOfficeEnquiry(data: Omit<FrontOfficeEnquiry, 'id' | 'enquiryNo'>) {
    const enquiryNo = `ENQ-${new Date().getFullYear()}-${String(this.state.frontOfficeEnquiries.length + 145).padStart(4, '0')}`;
    const newEnquiry: FrontOfficeEnquiry = {
      ...data,
      id: `enq-${Date.now()}`,
      enquiryNo
    };
    this.state.frontOfficeEnquiries = [newEnquiry, ...this.state.frontOfficeEnquiries];
    this.logAudit('ENQUIRY_CREATED', 'FrontOffice', enquiryNo, `New admission inquiry received for ${data.candidateName} (${data.appliedClass})`);
    this.notify();
    return newEnquiry;
  }

  public updateEnquiryStatus(enquiryId: string, status: FrontOfficeEnquiry['status']) {
    const enq = this.state.frontOfficeEnquiries.find(e => e.id === enquiryId);
    if (enq) {
      enq.status = status;
      this.logAudit('ENQUIRY_STATUS_UPDATED', 'FrontOffice', enq.enquiryNo, `Enquiry status updated to ${status} for ${enq.candidateName}`);
      this.notify();
    }
  }

  public addVisitorLog(data: Omit<VisitorLog, 'id' | 'passNo'>) {
    const passNo = `PASS-${new Date().getFullYear()}-${String(this.state.visitorLogs.length + 49).padStart(3, '0')}`;
    const newLog: VisitorLog = {
      ...data,
      id: `vis-${Date.now()}`,
      passNo
    };
    this.state.visitorLogs = [newLog, ...this.state.visitorLogs];
    this.logAudit('VISITOR_CHECKIN', 'FrontOffice', passNo, `Visitor check-in: ${data.visitorName} meeting with ${data.meetingWith}`);
    this.notify();
    return newLog;
  }

  public checkoutVisitor(visitorId: string) {
    const log = this.state.visitorLogs.find(v => v.id === visitorId);
    if (log && log.status === 'IN_PREMISES') {
      log.status = 'CHECKED_OUT';
      log.checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.logAudit('VISITOR_CHECKOUT', 'FrontOffice', log.passNo, `Visitor checked out: ${log.visitorName}`);
      this.notify();
    }
  }

  public addComplaint(data: Omit<Complaint, 'id' | 'ticketNo'>) {
    const ticketNo = `HD-${new Date().getFullYear()}-${String(this.state.complaints.length + 82).padStart(3, '0')}`;
    const complaint: Complaint = {
      ...data,
      id: `comp-${Date.now()}`,
      ticketNo
    };
    this.state.complaints = [complaint, ...this.state.complaints];
    this.logAudit('COMPLAINT_LOGGED', 'Helpdesk', ticketNo, `Complaint logged: ${data.title} (${data.priority} priority)`);
    this.notify();
    return complaint;
  }

  public updateComplaintStatus(complaintId: string, status: Complaint['status'], resolutionRemarks?: string) {
    const comp = this.state.complaints.find(c => c.id === complaintId);
    if (comp) {
      comp.status = status;
      if (resolutionRemarks) comp.resolutionRemarks = resolutionRemarks;
      this.logAudit('COMPLAINT_UPDATED', 'Helpdesk', comp.ticketNo, `Complaint ${comp.ticketNo} marked as ${status}`);
      this.notify();
    }
  }

  // --- Academics & Lesson Plans ---
  public addLessonPlan(data: Omit<LessonPlan, 'id'>) {
    const lp: LessonPlan = {
      ...data,
      id: `lp-${Date.now()}`
    };
    this.state.lessonPlans = [lp, ...this.state.lessonPlans];
    this.logAudit('LESSON_PLAN_CREATED', 'Academics', data.subject, `New lesson plan created for ${data.className} - ${data.topic}`);
    this.notify();
    return lp;
  }

  public updateLessonPlanProgress(id: string, completionPercent: number, status: LessonPlan['status']) {
    const lp = this.state.lessonPlans.find(l => l.id === id);
    if (lp) {
      lp.completionPercent = completionPercent;
      lp.status = status;
      this.logAudit('LESSON_PLAN_UPDATED', 'Academics', lp.subject, `Updated syllabus progress for ${lp.topic} to ${completionPercent}% (${status})`);
      this.notify();
    }
  }

  public addQuestion(data: Omit<QuestionItem, 'id'>) {
    const q: QuestionItem = {
      ...data,
      id: `qb-${Date.now()}`
    };
    this.state.questions = [q, ...this.state.questions];
    this.logAudit('QUESTION_ADDED', 'Academics', data.subject, `Added new ${data.difficulty} ${data.type} question to question bank`);
    this.notify();
    return q;
  }

  // --- Financial (Expenses, Income, Vendors) ---
  public addExpenseVoucher(data: Omit<ExpenseVoucher, 'id' | 'voucherNo'>) {
    const voucherNo = `EXP-${new Date().getFullYear()}-${String(this.state.expenseVouchers.length + 44).padStart(3, '0')}`;
    const voucher: ExpenseVoucher = {
      ...data,
      id: `exp-${Date.now()}`,
      voucherNo
    };
    this.state.expenseVouchers = [voucher, ...this.state.expenseVouchers];
    this.logAudit('EXPENSE_CREATED', 'Accounts', voucherNo, `Expense voucher generated for ₹${data.amount.toLocaleString()} (${data.category})`);
    this.notify();
    return voucher;
  }

  public approveExpenseVoucher(voucherId: string) {
    const v = this.state.expenseVouchers.find(exp => exp.id === voucherId);
    if (v) {
      v.status = 'APPROVED';
      v.approvedBy = this.state.schoolProfile.principal;
      this.logAudit('EXPENSE_APPROVED', 'Accounts', v.voucherNo, `Expense voucher ${v.voucherNo} approved for payment`);
      this.notify();
    }
  }

  public updateExpenseStatus(voucherId: string, status: ExpenseVoucher['status']) {
    const v = this.state.expenseVouchers.find(exp => exp.id === voucherId);
    if (v) {
      v.status = status;
      if (status === 'APPROVED' && !v.approvedBy) {
        v.approvedBy = this.state.schoolProfile.principal;
      }
      this.logAudit('EXPENSE_STATUS_UPDATED', 'Accounts', v.voucherNo, `Expense voucher ${v.voucherNo} updated to ${status}`);
      this.notify();
    }
  }

  public addVendor(data: Omit<Vendor, 'id' | 'vendorCode'>) {
    const vendorCode = `VEN-${String(this.state.vendors.length + 4).padStart(3, '0')}`;
    const vendor: Vendor = {
      ...data,
      id: `ven-${Date.now()}`,
      vendorCode
    };
    this.state.vendors = [vendor, ...this.state.vendors];
    this.logAudit('VENDOR_REGISTERED', 'Procurement', vendorCode, `Registered vendor: ${data.name}`);
    this.notify();
    return vendor;
  }

  // --- HR & Payroll ---
  public applyStaffLeave(data: Omit<StaffLeaveRequest, 'id' | 'appliedAt' | 'status'>) {
    const req: StaffLeaveRequest = {
      ...data,
      id: `lve-${Date.now()}`,
      appliedAt: new Date().toISOString().slice(0, 10),
      status: 'PENDING'
    };
    this.state.staffLeaves = [req, ...this.state.staffLeaves];
    this.logAudit('LEAVE_APPLIED', 'HR', data.staffName, `${data.staffName} submitted ${data.totalDays}-day ${data.leaveType} leave application`);
    this.notify();
    return req;
  }

  public reviewStaffLeave(leaveId: string, status: 'APPROVED' | 'REJECTED', reviewRemarks: string) {
    const leave = this.state.staffLeaves.find(l => l.id === leaveId);
    if (leave) {
      leave.status = status;
      leave.reviewedBy = `${this.state.currentUser.name} (${this.state.currentUser.roleLabel})`;
      leave.reviewRemarks = reviewRemarks;
      this.logAudit('LEAVE_REVIEWED', 'HR', leave.staffName, `Staff leave request for ${leave.staffName} was ${status}`);
      this.notify();
    }
  }

  public updateStaffLeaveStatus(leaveId: string, status: 'APPROVED' | 'REJECTED') {
    this.reviewStaffLeave(leaveId, status, `Direct status change to ${status}`);
  }

  public updatePayrollStatus(payrollId: string, status: 'PAID' | 'PROCESSED' | 'PENDING') {
    const p = this.state.payrolls.find(item => item.id === payrollId);
    if (p) {
      p.paymentStatus = status;
      this.logAudit('PAYROLL_UPDATED', 'Accounts', p.slipNo, `Salary slip ${p.slipNo} status changed to ${status}`);
      this.notify();
    }
  }

  public generatePayrollForMonth(month: string) {
    const existingForMonth = this.state.payrolls.filter(p => p.month === month);
    if (existingForMonth.length > 0) return existingForMonth;

    const newPayrolls: PayrollRecord[] = this.state.staff.map((st, idx) => {
      const basicSalary = st.salary;
      const allowances = Math.round(basicSalary * 0.4);
      const deductions = Math.round(basicSalary * 0.1);
      const taxDeducted = Math.round(basicSalary * 0.08);
      const netSalary = basicSalary + allowances - deductions - taxDeducted;
      return {
        id: `pay-${Date.now()}-${idx}`,
        slipNo: `PAY-${month.replace(/\s+/g, '-').toUpperCase()}-${String(idx + 1).padStart(2, '0')}`,
        staffId: st.id,
        staffName: `${st.firstName} ${st.lastName}`,
        department: st.department,
        designation: st.designation,
        month,
        basicSalary,
        allowances,
        deductions,
        taxDeducted,
        netSalary,
        paymentDate: new Date().toISOString().slice(0, 10),
        paymentStatus: 'PROCESSED',
        paymentMethod: 'Direct Deposit'
      };
    });

    this.state.payrolls = [...newPayrolls, ...this.state.payrolls];
    this.logAudit('PAYROLL_GENERATED', 'HR', month, `Automated bulk monthly salary payroll generated for ${newPayrolls.length} employees`);
    this.notify();
    return newPayrolls;
  }

  // --- Inventory & Assets ---
  public addInventoryItem(data: Omit<InventoryItem, 'id' | 'itemCode' | 'lastRestocked'>) {
    const itemCode = `INV-${data.category.slice(0, 3).toUpperCase()}-${String(this.state.inventoryItems.length + 35).padStart(3, '0')}`;
    const item: InventoryItem = {
      ...data,
      id: `inv-${Date.now()}`,
      itemCode,
      lastRestocked: new Date().toISOString().slice(0, 10)
    };
    this.state.inventoryItems = [item, ...this.state.inventoryItems];
    this.logAudit('INVENTORY_ADDED', 'Inventory', itemCode, `Added new inventory stock item: ${data.name}`);
    this.notify();
    return item;
  }

  public updateInventoryStock(itemId: string, quantityChange: number, action: 'IN' | 'OUT') {
    const item = this.state.inventoryItems.find(i => i.id === itemId);
    if (item) {
      if (action === 'IN') {
        item.currentStock += quantityChange;
        item.lastRestocked = new Date().toISOString().slice(0, 10);
      } else {
        item.currentStock = Math.max(0, item.currentStock - quantityChange);
      }
      this.logAudit('INVENTORY_ADJUSTED', 'Inventory', item.itemCode, `${action === 'IN' ? 'Stock In' : 'Stock Out'}: ${quantityChange} ${item.unit} for ${item.name}`);
      this.notify();
    }
  }

  public addAssetRecord(data: Omit<AssetRecord, 'id' | 'assetTag'>) {
    const assetTag = `AST-${data.category.slice(0, 3).toUpperCase()}-${String(this.state.assets.length + 20).padStart(3, '0')}`;
    const asset: AssetRecord = {
      ...data,
      id: `ast-${Date.now()}`,
      assetTag
    };
    this.state.assets = [asset, ...this.state.assets];
    this.logAudit('ASSET_REGISTERED', 'Assets', assetTag, `Registered new fixed asset: ${data.name} in ${data.location}`);
    this.notify();
    return asset;
  }

  public addAsset(data: Omit<AssetRecord, 'id' | 'assetTag'>) {
    return this.addAssetRecord(data);
  }

  // --- Student Welfare & Life ---
  public generateCertificate(data: Omit<CertificateRecord, 'id' | 'certNo' | 'issueDate' | 'status'>) {
    const certPrefix = data.type === 'Transfer' ? 'TC' : data.type === 'Bonafide' ? 'BC' : 'CC';
    const certNo = `${certPrefix}-${new Date().getFullYear()}-${String(this.state.certificates.length + 85).padStart(3, '0')}`;
    const cert: CertificateRecord = {
      ...data,
      id: `cert-${Date.now()}`,
      certNo,
      issueDate: new Date().toISOString().slice(0, 10),
      status: 'ACTIVE'
    };
    this.state.certificates = [cert, ...this.state.certificates];
    this.logAudit('CERTIFICATE_ISSUED', 'Certificates', certNo, `Issued ${data.type} Certificate for ${data.studentName} (${data.admissionNo})`);
    this.notify();
    return cert;
  }

  public updateHealthRecord(studentId: string, data: Partial<HealthRecord>) {
    let rec = this.state.healthRecords.find(h => h.studentId === studentId);
    if (rec) {
      Object.assign(rec, data);
    } else {
      const student = this.state.students.find(s => s.id === studentId);
      if (student) {
        rec = {
          id: `hlth-${Date.now()}`,
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          admissionNo: student.admissionNo,
          className: student.className,
          bloodGroup: data.bloodGroup || student.bloodGroup,
          allergies: data.allergies || ['None known'],
          chronicConditions: data.chronicConditions || ['None'],
          emergencyContact: data.emergencyContact || student.parentName,
          emergencyPhone: data.emergencyPhone || student.parentPhone,
          lastCheckupDate: data.lastCheckupDate || new Date().toISOString().slice(0, 10),
          vaccinationsStatus: data.vaccinationsStatus || 'COMPLETE',
          doctorNotes: data.doctorNotes || 'Routine medical check completed.'
        };
        this.state.healthRecords = [rec, ...this.state.healthRecords];
      }
    }
    this.logAudit('HEALTH_RECORD_UPDATED', 'Infirmary', studentId, `Medical profile updated for student ID ${studentId}`);
    this.notify();
  }

  public addDisciplineIncident(data: Omit<DisciplineIncident, 'id' | 'caseNo'>) {
    const caseNo = `DISC-${new Date().getFullYear()}-${String(this.state.disciplineIncidents.length + 15).padStart(3, '0')}`;
    const incident: DisciplineIncident = {
      ...data,
      id: `disc-${Date.now()}`,
      caseNo
    };
    this.state.disciplineIncidents = [incident, ...this.state.disciplineIncidents];
    this.logAudit('DISCIPLINE_RECORDED', 'Discipline', caseNo, `Discipline incident recorded for ${data.studentName}: ${data.incidentType}`);
    this.notify();
    return incident;
  }

  public addAlumniRecord(data: Omit<AlumniRecord, 'id'>) {
    const item: AlumniRecord = {
      ...data,
      id: `alm-${Date.now()}`
    };
    this.state.alumni = [item, ...this.state.alumni];
    this.logAudit('ALUMNI_REGISTERED', 'Alumni', data.admissionNo, `Registered alumni: ${data.studentName} (Batch ${data.passingYear})`);
    this.notify();
    return item;
  }

  // --- Integrations Hub ---
  public updateIntegrationStatus(id: string, status: IntegrationServiceConfig['status']) {
    const item = this.state.integrations.find(i => i.id === id);
    if (item) {
      item.status = status;
      item.lastPing = `Updated at ${new Date().toLocaleTimeString()}`;
      this.logAudit('INTEGRATION_STATUS', 'System', item.name, `Connector ${item.name} set to ${status}`);
      this.notify();
    }
  }

  // --- Backup & Restore ---
  public exportBackupJson(): string {
    const backupData = {
      version: '1.0.4',
      exportDate: new Date().toISOString(),
      school: this.state.schoolProfile,
      state: this.state
    };
    this.state.lastBackupDate = new Date().toLocaleString();
    this.logAudit('BACKUP_CREATED', 'System', 'DB_EXPORT', 'Manual database snapshot JSON generated and downloaded');
    this.notify();
    return JSON.stringify(backupData, null, 2);
  }

  public exportStateJSON(): string {
    return this.exportBackupJson();
  }

  public restoreBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data && data.state) {
        this.state = data.state;
        this.logAudit('BACKUP_RESTORED', 'System', 'DB_RESTORE', 'Database restored from valid external JSON snapshot');
        this.notify();
        return true;
      }
    } catch (e) {
      console.error('Failed to restore backup:', e);
    }
    return false;
  }

  public importStateJSON(jsonString: string): boolean {
    return this.restoreBackupJson(jsonString);
  }

  public resetToSeed() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = loadStoredState();
    this.logAudit('DATABASE_RESET', 'System', 'RESET_SEED', 'Reset local database to certified factory seed records');
    this.notify();
  }

  public resetToFactorySeed() {
    this.resetToSeed();
  }

  // --- Customization & Configuration Center Operations ---

  // 1. Modules
  public addCustomModule(moduleData: Omit<CustomModuleConfig, 'id' | 'updatedAt' | 'version'>): CustomModuleConfig {
    const newModule: CustomModuleConfig = {
      ...moduleData,
      id: `mod-custom-${Date.now()}`,
      version: '1.0.0',
      updatedAt: new Date().toLocaleString(),
      isDeletable: true
    };
    this.state.customModules.push(newModule);
    this.logAudit('MODULE_CREATED', 'Customization', newModule.name, `Created custom business module: ${newModule.displayName}`);
    this.notify();
    return newModule;
  }

  public updateCustomModule(id: string, updates: Partial<CustomModuleConfig>) {
    const idx = this.state.customModules.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.state.customModules[idx] = {
        ...this.state.customModules[idx],
        ...updates,
        updatedAt: new Date().toLocaleString()
      };
      this.logAudit('MODULE_UPDATED', 'Customization', id, `Updated module metadata for ${this.state.customModules[idx].displayName}`);
      this.notify();
    }
  }

  public toggleCustomModuleStatus(id: string) {
    const mod = this.state.customModules.find(m => m.id === id);
    if (mod) {
      mod.status = mod.status === 'ENABLED' ? 'DISABLED' : 'ENABLED';
      mod.updatedAt = new Date().toLocaleString();
      this.logAudit(
        mod.status === 'ENABLED' ? 'MODULE_ENABLED' : 'MODULE_DISABLED',
        'Customization',
        mod.name,
        `Module ${mod.displayName} set to ${mod.status}`
      );
      this.notify();
    }
  }

  public deleteCustomModule(id: string): boolean {
    const mod = this.state.customModules.find(m => m.id === id);
    if (mod && mod.isDeletable) {
      this.state.customModules = this.state.customModules.filter(m => m.id !== id);
      this.logAudit('MODULE_DELETED', 'Customization', mod.name, `Deleted custom module ${mod.displayName}`);
      this.notify();
      return true;
    }
    return false;
  }

  // 2. Features & Flags
  public toggleFeature(id: string) {
    const feat = this.state.customFeatures.find(f => f.id === id);
    if (feat) {
      feat.enabled = !feat.enabled;
      this.logAudit(
        feat.enabled ? 'FEATURE_ENABLED' : 'FEATURE_DISABLED',
        'Customization',
        feat.name,
        `Feature ${feat.name} toggled to ${feat.enabled ? 'Enabled' : 'Disabled'}`
      );
      this.notify();
    }
  }

  public toggleFeatureFlag(key: string) {
    const flag = this.state.featureFlags.find(f => f.key === key);
    if (flag) {
      flag.enabled = !flag.enabled;
      flag.updatedAt = new Date().toISOString().split('T')[0];
      this.logAudit(
        flag.enabled ? 'FEATURE_FLAG_ENABLED' : 'FEATURE_FLAG_DISABLED',
        'Customization',
        flag.key,
        `Feature flag ${flag.label} (${flag.key}) set to ${flag.enabled}`
      );
      this.notify();
    }
  }

  // 3. Navigation
  public updateNavigationItems(items: NavigationConfigItem[]) {
    this.state.navigationConfig = items;
    this.logAudit('NAVIGATION_UPDATED', 'Customization', 'SIDEBAR_NAV', 'Updated sidebar menu hierarchy, ordering, and labels');
    this.notify();
  }

  public resetNavigationToDefault() {
    this.state.navigationConfig = [...initialNavigationItems];
    this.logAudit('NAVIGATION_RESET', 'Customization', 'SIDEBAR_NAV', 'Reset navigation structure to system defaults');
    this.notify();
  }

  // 4. Custom Fields & Field Values
  public addCustomField(fieldData: Omit<CustomFieldDefinition, 'id'>): CustomFieldDefinition {
    const newField: CustomFieldDefinition = {
      ...fieldData,
      id: `cf-${Date.now()}`
    };
    this.state.customFields.push(newField);
    this.logAudit('CUSTOM_FIELD_CREATED', 'Customization', newField.entityType, `Added custom field ${newField.fieldName} (${newField.fieldType})`);
    this.notify();
    return newField;
  }

  public updateCustomField(id: string, updates: Partial<CustomFieldDefinition>) {
    const idx = this.state.customFields.findIndex(f => f.id === id);
    if (idx !== -1) {
      this.state.customFields[idx] = { ...this.state.customFields[idx], ...updates };
      this.logAudit('CUSTOM_FIELD_UPDATED', 'Customization', id, `Updated custom field ${this.state.customFields[idx].fieldName}`);
      this.notify();
    }
  }

  public deleteCustomField(id: string) {
    const field = this.state.customFields.find(f => f.id === id);
    if (field) {
      this.state.customFields = this.state.customFields.filter(f => f.id !== id);
      this.logAudit('CUSTOM_FIELD_DELETED', 'Customization', field.entityType, `Deleted custom field ${field.fieldName}`);
      this.notify();
    }
  }

  public setCustomFieldValue(entityId: string, fieldKey: string, value: any) {
    if (!this.state.customFieldValues[entityId]) {
      this.state.customFieldValues[entityId] = {};
    }
    this.state.customFieldValues[entityId][fieldKey] = value;
    this.notify();
  }

  public getCustomFieldValues(entityId: string): Record<string, any> {
    return this.state.customFieldValues[entityId] || {};
  }

  // 5. Custom Forms
  public saveCustomForm(form: CustomFormConfig) {
    const idx = this.state.customForms.findIndex(f => f.id === form.id);
    if (idx !== -1) {
      this.state.customForms[idx] = {
        ...form,
        version: form.version + 1,
        updatedAt: new Date().toLocaleString()
      };
      this.logAudit('FORM_UPDATED', 'Customization', form.id, `Updated form definition: ${form.name} (v${form.version + 1})`);
    } else {
      this.state.customForms.push({
        ...form,
        id: form.id || `form-${Date.now()}`,
        version: 1,
        updatedAt: new Date().toLocaleString()
      });
      this.logAudit('FORM_CREATED', 'Customization', form.name, `Created custom form blueprint: ${form.name}`);
    }
    this.notify();
  }

  public deleteCustomForm(id: string) {
    this.state.customForms = this.state.customForms.filter(f => f.id !== id);
    this.logAudit('FORM_DELETED', 'Customization', id, `Deleted custom form template`);
    this.notify();
  }

  // 6. Table Views
  public saveTableView(view: CustomTableViewConfig) {
    const idx = this.state.tableViews.findIndex(v => v.id === view.id);
    if (idx !== -1) {
      this.state.tableViews[idx] = view;
    } else {
      this.state.tableViews.push({
        ...view,
        id: view.id || `view-${Date.now()}`
      });
    }
    this.logAudit('TABLE_VIEW_SAVED', 'Customization', view.name, `Saved custom table layout: ${view.name}`);
    this.notify();
  }

  // 7. Dashboard Widgets
  public saveDashboardWidgets(widgets: DashboardWidgetConfig[]) {
    this.state.dashboardWidgets = widgets;
    this.logAudit('DASHBOARD_UPDATED', 'Customization', 'WIDGETS', 'Updated dashboard widget layout and visibility');
    this.notify();
  }

  // 8. Themes
  public addTheme(theme: ThemeConfig): ThemeConfig {
    const newTheme: ThemeConfig = {
      ...theme,
      id: `theme-${Date.now()}`,
      version: 1,
      status: 'PUBLISHED'
    };
    this.state.themes.push(newTheme);
    this.logAudit('THEME_CREATED', 'Customization', newTheme.name, `Created custom theme preset: ${newTheme.name}`);
    this.notify();
    return newTheme;
  }

  public saveTheme(theme: ThemeConfig) {
    const idx = this.state.themes.findIndex(t => t.id === theme.id);
    if (idx !== -1) {
      this.state.themes[idx] = {
        ...theme,
        version: (theme.version || 1) + 1
      };
      if (this.state.activeThemeId === theme.id) {
        ConfigurationService.applyThemeTokens(this.state.themes[idx]);
      }
      this.logAudit('THEME_UPDATED', 'Customization', theme.id, `Saved theme configuration for ${theme.name}`);
    } else {
      this.state.themes.push(theme);
      this.logAudit('THEME_CREATED', 'Customization', theme.name, `Created theme configuration for ${theme.name}`);
    }
    this.notify();
  }

  public updateTheme(id: string, updates: Partial<ThemeConfig>) {
    const idx = this.state.themes.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.state.themes[idx] = {
        ...this.state.themes[idx],
        ...updates,
        version: this.state.themes[idx].version + 1
      };
      if (this.state.activeThemeId === id) {
        ConfigurationService.applyThemeTokens(this.state.themes[idx]);
      }
      this.logAudit('THEME_UPDATED', 'Customization', id, `Updated theme tokens for ${this.state.themes[idx].name}`);
      this.notify();
    }
  }

  public setActiveTheme(themeId: string) {
    const theme = this.state.themes.find(t => t.id === themeId);
    if (theme) {
      this.state.activeThemeId = themeId;
      ConfigurationService.applyThemeTokens(theme);
      this.logAudit('THEME_APPLIED', 'Customization', theme.name, `Applied active design system theme: ${theme.name}`);
      this.notify();
    }
  }

  // 9. Templates
  public saveTemplate(template: TemplateConfig) {
    const idx = this.state.templates.findIndex(t => t.id === template.id);
    if (idx !== -1) {
      this.state.templates[idx] = {
        ...template,
        version: template.version + 1,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      this.logAudit('TEMPLATE_UPDATED', 'Customization', template.id, `Updated template: ${template.name} (v${template.version + 1})`);
    } else {
      this.state.templates.push({
        ...template,
        id: template.id || `tmpl-${Date.now()}`,
        version: 1,
        updatedAt: new Date().toISOString().split('T')[0]
      });
      this.logAudit('TEMPLATE_CREATED', 'Customization', template.name, `Created template document: ${template.name}`);
    }
    this.notify();
  }

  public deleteTemplate(id: string) {
    const tmpl = this.state.templates.find(t => t.id === id);
    if (tmpl) {
      this.state.templates = this.state.templates.filter(t => t.id !== id);
      this.logAudit('TEMPLATE_DELETED', 'Customization', tmpl.name, `Deleted template ${tmpl.name}`);
      this.notify();
    }
  }

  // 10. Workflows
  public saveWorkflow(wf: WorkflowConfig) {
    const idx = this.state.workflows.findIndex(w => w.id === wf.id);
    if (idx !== -1) {
      this.state.workflows[idx] = wf;
      this.logAudit('WORKFLOW_UPDATED', 'Customization', wf.id, `Updated workflow states and transition matrix for ${wf.name}`);
    } else {
      this.state.workflows.push({
        ...wf,
        id: wf.id || `wf-${Date.now()}`
      });
      this.logAudit('WORKFLOW_CREATED', 'Customization', wf.name, `Created new workflow rule: ${wf.name}`);
    }
    this.notify();
  }

  // 11. Numbering Sequences
  public updateNumberingConfig(config: NumberingConfig) {
    const idx = this.state.numberingConfigs.findIndex(n => n.id === config.id);
    if (idx !== -1) {
      this.state.numberingConfigs[idx] = config;
      this.logAudit('NUMBERING_UPDATED', 'Customization', config.entity, `Updated sequence generator pattern for ${config.name}`);
      this.notify();
    }
  }

  public getNextSequenceNumber(entity: NumberingConfig['entity']): string {
    const config = this.state.numberingConfigs.find(n => n.entity === entity);
    if (!config) return `${entity}-${Date.now()}`;
    const { formattedNumber, updatedConfig } = ConfigurationService.generateSequenceNumber(config);
    this.updateNumberingConfig(updatedConfig);
    return formattedNumber;
  }

  // 12. School Branding & Localization
  public updateSchoolBranding(branding: Partial<SchoolBrandingConfig>) {
    this.state.schoolBranding = { ...this.state.schoolBranding, ...branding };
    this.logAudit('BRANDING_UPDATED', 'Customization', 'BRANDING', 'Updated institutional branding, logos, and signatures');
    this.notify();
  }

  public updateLocalization(loc: Partial<LocalizationConfig>) {
    this.state.localization = { ...this.state.localization, ...loc };
    this.logAudit('LOCALIZATION_UPDATED', 'Customization', 'LOCALIZATION', 'Updated regional formats, currency, and date formats');
    this.notify();
  }

  public updateUserPreferences(prefs: Partial<UserPreferencesConfig>) {
    this.state.userPreferences = { ...this.state.userPreferences, ...prefs };
    this.notify();
  }

  // 13. Snapshots, Versioning & Import/Export
  public createConfigSnapshot(title: string, description: string): ConfigVersionSnapshot {
    const snapshot: ConfigVersionSnapshot = {
      id: `snap-${Date.now()}`,
      version: this.state.configSnapshots.length + 1,
      title,
      description,
      createdBy: this.state.currentUser.name,
      createdAt: new Date().toLocaleString(),
      snapshot: {
        customModules: this.state.customModules,
        customFeatures: this.state.customFeatures,
        featureFlags: this.state.featureFlags,
        navigationConfig: this.state.navigationConfig,
        customFields: this.state.customFields,
        customForms: this.state.customForms,
        dashboardWidgets: this.state.dashboardWidgets,
        themes: this.state.themes,
        activeThemeId: this.state.activeThemeId,
        templates: this.state.templates,
        workflows: this.state.workflows,
        numberingConfigs: this.state.numberingConfigs,
        schoolBranding: this.state.schoolBranding,
        localization: this.state.localization
      },
      canRollback: true
    };
    this.state.configSnapshots.unshift(snapshot);
    this.logAudit('SNAPSHOT_CREATED', 'Customization', `v${snapshot.version}`, `Created configuration checkpoint: ${title}`);
    this.notify();
    return snapshot;
  }

  public rollbackConfigSnapshot(snapshotId: string): boolean {
    const snap = this.state.configSnapshots.find(s => s.id === snapshotId);
    if (snap && snap.snapshot) {
      const data = snap.snapshot;
      if (data.customModules) this.state.customModules = data.customModules;
      if (data.customFeatures) this.state.customFeatures = data.customFeatures;
      if (data.featureFlags) this.state.featureFlags = data.featureFlags;
      if (data.navigationConfig) this.state.navigationConfig = data.navigationConfig;
      if (data.customFields) this.state.customFields = data.customFields;
      if (data.customForms) this.state.customForms = data.customForms;
      if (data.dashboardWidgets) this.state.dashboardWidgets = data.dashboardWidgets;
      if (data.themes) this.state.themes = data.themes;
      if (data.activeThemeId) {
        this.state.activeThemeId = data.activeThemeId;
        const currentTheme = this.state.themes.find(t => t.id === data.activeThemeId);
        if (currentTheme) ConfigurationService.applyThemeTokens(currentTheme);
      }
      if (data.templates) this.state.templates = data.templates;
      if (data.workflows) this.state.workflows = data.workflows;
      if (data.numberingConfigs) this.state.numberingConfigs = data.numberingConfigs;
      if (data.schoolBranding) this.state.schoolBranding = data.schoolBranding;
      if (data.localization) this.state.localization = data.localization;

      this.logAudit('SNAPSHOT_ROLLBACK', 'Customization', `v${snap.version}`, `Rolled back configuration to snapshot: ${snap.title}`);
      this.notify();
      return true;
    }
    return false;
  }

  public exportConfigurationPackage(): string {
    const pkg = {
      manifest: {
        system: 'SchoolERP',
        version: '3.0.0',
        exportedAt: new Date().toISOString(),
        exportedBy: this.state.currentUser.name
      },
      configuration: {
        customModules: this.state.customModules,
        customFeatures: this.state.customFeatures,
        featureFlags: this.state.featureFlags,
        navigationConfig: this.state.navigationConfig,
        customFields: this.state.customFields,
        customForms: this.state.customForms,
        tableViews: this.state.tableViews,
        dashboardWidgets: this.state.dashboardWidgets,
        themes: this.state.themes,
        activeThemeId: this.state.activeThemeId,
        templates: this.state.templates,
        workflows: this.state.workflows,
        numberingConfigs: this.state.numberingConfigs,
        schoolBranding: this.state.schoolBranding,
        localization: this.state.localization
      }
    };
    this.logAudit('CONFIG_EXPORTED', 'Customization', 'PACKAGE', 'Exported comprehensive configuration package JSON');
    return JSON.stringify(pkg, null, 2);
  }

  public importConfigurationPackage(jsonString: string): { success: boolean; message: string } {
    const validation = ConfigurationService.validateConfigPackage(jsonString);
    if (!validation.isValid) {
      return { success: false, message: validation.error || 'Invalid configuration file' };
    }

    const cfg = validation.data.configuration;
    if (cfg.customModules) this.state.customModules = cfg.customModules;
    if (cfg.customFeatures) this.state.customFeatures = cfg.customFeatures;
    if (cfg.featureFlags) this.state.featureFlags = cfg.featureFlags;
    if (cfg.navigationConfig) this.state.navigationConfig = cfg.navigationConfig;
    if (cfg.customFields) this.state.customFields = cfg.customFields;
    if (cfg.customForms) this.state.customForms = cfg.customForms;
    if (cfg.tableViews) this.state.tableViews = cfg.tableViews;
    if (cfg.dashboardWidgets) this.state.dashboardWidgets = cfg.dashboardWidgets;
    if (cfg.themes) this.state.themes = cfg.themes;
    if (cfg.activeThemeId) {
      this.state.activeThemeId = cfg.activeThemeId;
      const currentTheme = this.state.themes.find(t => t.id === cfg.activeThemeId);
      if (currentTheme) ConfigurationService.applyThemeTokens(currentTheme);
    }
    if (cfg.templates) this.state.templates = cfg.templates;
    if (cfg.workflows) this.state.workflows = cfg.workflows;
    if (cfg.numberingConfigs) this.state.numberingConfigs = cfg.numberingConfigs;
    if (cfg.schoolBranding) this.state.schoolBranding = cfg.schoolBranding;
    if (cfg.localization) this.state.localization = cfg.localization;

    // Automatically create a post-import snapshot
    this.createConfigSnapshot(
      `Post-Import Config (${new Date().toLocaleDateString()})`,
      `Applied configuration package exported on ${validation.data.manifest?.exportedAt || 'unknown date'}`
    );

    this.logAudit('CONFIG_IMPORTED', 'Customization', 'PACKAGE', 'Successfully imported and applied configuration package');
    this.notify();
    return { success: true, message: 'Configuration package imported and applied successfully.' };
  }

  public resetConfiguration(scope: 'THEME' | 'NAV' | 'MODULES' | 'ALL') {
    if (scope === 'THEME' || scope === 'ALL') {
      this.state.themes = [...initialThemePresets];
      this.state.activeThemeId = 'theme-professional-blue';
      ConfigurationService.applyThemeTokens(this.state.themes[0]);
    }
    if (scope === 'NAV' || scope === 'ALL') {
      this.state.navigationConfig = [...initialNavigationItems];
    }
    if (scope === 'MODULES' || scope === 'ALL') {
      this.state.customModules = [...initialCustomModules];
      this.state.customFeatures = [...initialCustomFeatures];
      this.state.featureFlags = [...initialFeatureFlags];
    }
    if (scope === 'ALL') {
      this.state.customFields = [...initialCustomFields];
      this.state.customForms = [...initialCustomForms];
      this.state.tableViews = [...initialTableViews];
      this.state.dashboardWidgets = [...initialDashboardWidgets];
      this.state.templates = [...initialTemplates];
      this.state.workflows = [...initialWorkflows];
      this.state.numberingConfigs = [...initialNumberingConfigs];
      this.state.schoolBranding = { ...initialSchoolBranding };
      this.state.localization = { ...initialLocalization };
    }

    this.logAudit('CONFIG_RESET', 'Customization', scope, `Reset configuration domain: ${scope}`);
    this.notify();
  }

  public updateSchoolProfile(profile: Partial<SchoolProfile>) {
    this.state.schoolProfile = { ...this.state.schoolProfile, ...profile };
    this.logAudit('PROFILE_UPDATED', 'Settings', 'SCHOOL_PROFILE', 'Updated school institutional profile information');
    this.notify();
  }

  public exportDatabaseBackup(): string {
    const backupJson = BackupUtility.createBackupPackage(this.state);
    const nowStr = new Date().toLocaleString();
    this.state.lastBackupDate = nowStr;
    this.logAudit('BACKUP_EXPORTED', 'Settings', 'DATABASE', 'Triggered manual local database backup export');
    this.notify();
    return backupJson;
  }

  public downloadDatabaseBackup(): void {
    BackupUtility.downloadBackupFile(this.state);
    const nowStr = new Date().toLocaleString();
    this.state.lastBackupDate = nowStr;
    this.logAudit('BACKUP_DOWNLOADED', 'Settings', 'DATABASE', 'Downloaded institutional database backup package (.erpbackup)');
    this.notify();
  }

  public restoreDatabaseBackup(jsonString: string): { success: boolean; error?: string; metadata?: any } {
    const parseRes = BackupUtility.validateAndParseBackup(jsonString);
    if (!parseRes.success || !parseRes.state) {
      return { success: false, error: parseRes.error || 'Failed to parse backup package.' };
    }

    this.state = parseRes.state;
    this.logAudit('BACKUP_RESTORED', 'Settings', 'DATABASE', `Successfully restored database from backup dated ${parseRes.metadata?.timestamp || 'unknown'}`);
    this.notify();
    return { success: true, metadata: parseRes.metadata };
  }

  public getUnreadCount(moduleKey: string, userId?: string): number {
    const normalizedTarget = normalizeModuleKey(moduleKey);
    return this.state.notifications.filter(n => {
      const isUnread = n.status === 'unread' || (!n.status && !n.read);
      if (!isUnread) return false;
      const nMod = normalizeModuleKey(n.module);
      if (nMod !== normalizedTarget) return false;
      if (userId && n.readBy && n.readBy.includes(userId)) return false;
      return true;
    }).length;
  }

  public getUnreadCountsByModule(userId?: string): Record<string, number> {
    const counts: Record<string, number> = {};
    this.state.notifications.forEach(n => {
      const isUnread = n.status === 'unread' || (!n.status && !n.read);
      if (!isUnread) return;
      if (userId && n.readBy && n.readBy.includes(userId)) return;
      const modKey = normalizeModuleKey(n.module);
      if (modKey) {
        counts[modKey] = (counts[modKey] || 0) + 1;
      }
    });
    return counts;
  }

  public markNotificationAsRead(notificationId: string, userId?: string) {
    const notif = this.state.notifications.find(n => n.id === notificationId);
    if (notif) {
      notif.read = true;
      notif.status = 'read';
      notif.readAt = new Date().toISOString();
      if (userId) {
        notif.readBy = Array.from(new Set([...(notif.readBy || []), userId]));
      }
      this.logAudit('NOTIFICATION_READ', notif.module || 'System', notif.id, `Marked notification as read: ${notif.title}`);
      this.notify();
    }
  }

  public markNotificationAsResolved(notificationId: string, userId?: string) {
    const notif = this.state.notifications.find(n => n.id === notificationId);
    if (notif) {
      notif.read = true;
      notif.status = 'resolved';
      notif.resolvedAt = new Date().toISOString();
      if (userId) {
        notif.readBy = Array.from(new Set([...(notif.readBy || []), userId]));
      }
      this.logAudit('NOTIFICATION_RESOLVED', notif.module || 'System', notif.id, `Resolved notification issue: ${notif.title}`);
      this.notify();
    }
  }

  public markModuleAsRead(moduleKey: string, userId?: string) {
    const normalizedTarget = normalizeModuleKey(moduleKey);
    let updatedCount = 0;
    this.state.notifications.forEach(n => {
      const isUnread = n.status === 'unread' || (!n.status && !n.read);
      if (isUnread && normalizeModuleKey(n.module) === normalizedTarget) {
        n.read = true;
        n.status = 'read';
        n.readAt = new Date().toISOString();
        if (userId) {
          n.readBy = Array.from(new Set([...(n.readBy || []), userId]));
        }
        updatedCount++;
      }
    });
    if (updatedCount > 0) {
      this.logAudit('MODULE_NOTIFICATIONS_READ', moduleKey, 'BATCH', `Marked ${updatedCount} notifications as read for module ${moduleKey}`);
      this.notify();
    }
  }

  public markAllAsRead(userId?: string) {
    let updatedCount = 0;
    this.state.notifications.forEach(n => {
      const isUnread = n.status === 'unread' || (!n.status && !n.read);
      if (isUnread) {
        n.read = true;
        n.status = 'read';
        n.readAt = new Date().toISOString();
        if (userId) {
          n.readBy = Array.from(new Set([...(n.readBy || []), userId]));
        }
        updatedCount++;
      }
    });
    if (updatedCount > 0) {
      this.logAudit('ALL_NOTIFICATIONS_READ', 'System', 'BATCH', `Marked all ${updatedCount} unread notifications as read`);
      this.notify();
    }
  }

  public getVisibleNotifications(currentUserRole: Role, userId?: string): AppNotification[] {
    if (currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'ADMIN') {
      return this.state.notifications;
    }
    if (currentUserRole === 'TEACHER') {
      const allowed = ['attendance', 'academics', 'timetable', 'students', 'assignments', 'examinations', 'welfare'];
      return this.state.notifications.filter(n => allowed.includes(normalizeModuleKey(n.module)));
    }
    if (currentUserRole === 'ACCOUNTANT') {
      const allowed = ['fees', 'frontoffice', 'reports'];
      return this.state.notifications.filter(n => allowed.includes(normalizeModuleKey(n.module)));
    }
    if (currentUserRole === 'RECEPTIONIST') {
      const allowed = ['admissions', 'frontoffice', 'transport', 'hostel', 'library'];
      return this.state.notifications.filter(n => allowed.includes(normalizeModuleKey(n.module)));
    }
    return this.state.notifications;
  }
}

export const erpStore = new ERPStore();

