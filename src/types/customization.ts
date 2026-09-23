import { Role } from './index';

export type CustomModuleType = 'BUILTIN' | 'CONFIGURABLE' | 'CUSTOM_DATA' | 'INTEGRATION';
export type CustomModuleCategory = 'Core' | 'Academic' | 'Administration' | 'Finance' | 'Student Services' | 'Integrations' | 'Custom';
export type CustomModuleStatus = 'ENABLED' | 'DISABLED';

export interface CustomModuleConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  category: CustomModuleCategory;
  type: CustomModuleType;
  parentModule?: string;
  route: string;
  sortOrder: number;
  status: CustomModuleStatus;
  requiredRole: Role[];
  schoolScope: 'ALL' | 'CAMPUS_SPECIFIC';
  version: string;
  updatedAt: string;
  featuresCount: number;
  badgeColor: string;
  isDeletable?: boolean;
}

export interface CustomFeatureConfig {
  id: string;
  moduleId: string;
  name: string;
  description: string;
  enabled: boolean;
  requiredRole: Role[];
  dependencies: string[];
  isBeta?: boolean;
  scope: 'SYSTEM' | 'SCHOOL' | 'CAMPUS' | 'ROLE';
}

export interface FeatureFlagConfig {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  category: 'General' | 'AI & Automation' | 'Security' | 'Hardware' | 'Experimental';
  scope: 'GLOBAL' | 'SCHOOL' | 'ROLE' | 'USER';
  updatedAt: string;
}

export interface NavigationConfigItem {
  id: string;
  moduleId: string;
  label: string;
  customLabel: string;
  group: string;
  icon: string;
  order: number;
  visible: boolean;
  roles: Role[];
  shortcut?: string;
  isPinned: boolean;
}

export type CustomFieldEntityType = 
  | 'STUDENT' 
  | 'STAFF' 
  | 'ADMISSION' 
  | 'FEE' 
  | 'CLASS' 
  | 'ASSET' 
  | 'VISITOR' 
  | 'ALUMNI' 
  | 'CUSTOM';

export type CustomFieldType = 
  | 'TEXT' 
  | 'TEXTAREA' 
  | 'NUMBER' 
  | 'DECIMAL' 
  | 'CURRENCY' 
  | 'DATE' 
  | 'DATETIME' 
  | 'TIME' 
  | 'BOOLEAN' 
  | 'SELECT' 
  | 'MULTISELECT' 
  | 'EMAIL' 
  | 'PHONE' 
  | 'URL' 
  | 'FILE' 
  | 'IMAGE' 
  | 'SIGNATURE' 
  | 'COLOR';

export interface CustomFieldDefinition {
  id: string;
  entityType: CustomFieldEntityType;
  fieldName: string;
  fieldKey: string;
  fieldType: CustomFieldType;
  placeholder?: string;
  defaultValue?: any;
  isRequired: boolean;
  isUnique: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  visibleToRoles: Role[];
  options?: string[];
  validationRegex?: string;
  section: string;
  order: number;
  helpText?: string;
}

export interface CustomFormSection {
  id: string;
  title: string;
  description?: string;
  columns: 1 | 2 | 3;
  fieldKeys: string[];
  conditionalRule?: {
    triggerFieldKey: string;
    operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'IS_NOT_EMPTY';
    value: string;
  };
}

export interface CustomFormConfig {
  id: string;
  name: string;
  entityType: CustomFieldEntityType;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  version: number;
  sections: CustomFormSection[];
  updatedAt: string;
  updatedBy: string;
}

export interface CustomTableViewConfig {
  id: string;
  entityType: CustomFieldEntityType;
  name: string;
  isDefault: boolean;
  density: 'COMPACT' | 'COMFORTABLE' | 'DENSE';
  visibleColumns: string[];
  columnOrder: string[];
  pinnedColumns: string[];
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  scope: 'SYSTEM' | 'USER';
  userId?: string;
}

export type WidgetType = 
  | 'KPI' 
  | 'CHART' 
  | 'TABLE' 
  | 'ATTENDANCE_GAUGE' 
  | 'RECENT_ACTIVITY' 
  | 'TIMETABLE' 
  | 'ALERTS' 
  | 'QUICK_ACTIONS' 
  | 'AI_INSIGHTS' 
  | 'FEES_SUMMARY' 
  | 'CUSTOM_METRIC';

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  type: WidgetType;
  gridSpan: 1 | 2 | 3 | 4 | 6 | 12;
  enabled: boolean;
  order: number;
  targetRoles: Role[];
  refreshIntervalSeconds?: number;
  settings?: Record<string, any>;
}

export interface ThemeConfig {
  id: string;
  name: string;
  isDefault: boolean;
  mode: 'LIGHT' | 'DARK' | 'SYSTEM';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  sidebarBg: string;
  sidebarTextColor: string;
  fontFamily: 'Plus Jakarta Sans' | 'Inter' | 'Segoe UI' | 'JetBrains Mono' | 'System';
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'pill';
  density: 'compact' | 'comfortable' | 'spacious';
  version: number;
  status: 'DRAFT' | 'PUBLISHED';
}

export type TemplateCategory = 
  | 'CERTIFICATE' 
  | 'ID_CARD' 
  | 'INVOICE' 
  | 'RECEIPT' 
  | 'REPORT' 
  | 'EMAIL' 
  | 'SMS' 
  | 'WHATSAPP';

export interface TemplateConfig {
  id: string;
  name: string;
  category: TemplateCategory;
  version: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  layout: 'PORTRAIT' | 'LANDSCAPE' | 'STANDARD';
  headerText?: string;
  footerText?: string;
  contentBody: string;
  variables: string[];
  signatureRequired: boolean;
  qrVerificationEnabled: boolean;
  schoolBranding: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface WorkflowTransition {
  fromState: string;
  toState: string;
  actionLabel: string;
  requiredRole: Role[];
  notifyParent: boolean;
  notifyApplicant: boolean;
}

export interface WorkflowConfig {
  id: string;
  name: string;
  module: 'ADMISSIONS' | 'LEAVE' | 'PURCHASE' | 'EXPENSE' | 'FEE_CONCESSION' | 'DISCIPLINE';
  description: string;
  states: Array<{ id: string; name: string; color: string; isFinal: boolean }>;
  transitions: WorkflowTransition[];
  slaHours?: number;
  status: 'ACTIVE' | 'DRAFT';
}

export interface NumberingConfig {
  id: string;
  entity: 'STUDENT' | 'ADMISSION' | 'INVOICE' | 'RECEIPT' | 'CERTIFICATE' | 'STAFF' | 'EXPENSE';
  name: string;
  prefix: string;
  suffix: string;
  includeYear: boolean;
  includeCampus: boolean;
  padding: number;
  currentSequence: number;
  resetFrequency: 'NEVER' | 'YEARLY' | 'ACADEMIC_YEAR';
}

export interface SchoolBrandingConfig {
  schoolName: string;
  shortName: string;
  tagline: string;
  affiliationNo: string;
  boardName: string;
  logoUrl: string;
  watermarkUrl?: string;
  stampUrl?: string;
  signatureUrl?: string;
  primaryBrandColor: string;
  secondaryBrandColor: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
}

export interface LocalizationConfig {
  language: 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'mr' | 'gu';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'DD MMM YYYY';
  timeFormat: '12_HOUR' | '24_HOUR';
  currency: 'INR (₹)' | 'USD ($)' | 'AED (د.إ)' | 'EUR (€)' | 'GBP (£)';
  numberFormat: 'INDIAN_LAKHS' | 'INTERNATIONAL_MILLIONS';
  weekStartDay: 'MONDAY' | 'SUNDAY';
  academicYearStartMonth: 'APRIL' | 'JUNE' | 'JANUARY' | 'SEPTEMBER';
}

export interface UserPreferencesConfig {
  userId: string;
  themeId: string;
  compactDensity: boolean;
  sidebarCollapsed: boolean;
  defaultLandingModule: string;
  favoriteModules: string[];
  enableKeyboardShortcuts: boolean;
  enableAudioNotifications: boolean;
  autoRefreshInterval: number;
}

export interface ConfigVersionSnapshot {
  id: string;
  version: number;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  snapshot: any;
  canRollback: boolean;
}
