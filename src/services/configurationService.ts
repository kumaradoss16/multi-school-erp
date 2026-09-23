import { 
  CustomModuleConfig, 
  CustomFeatureConfig, 
  FeatureFlagConfig, 
  NavigationConfigItem, 
  CustomFieldDefinition, 
  CustomFormConfig, 
  CustomTableViewConfig, 
  DashboardWidgetConfig, 
  ThemeConfig, 
  TemplateConfig, 
  WorkflowConfig, 
  NumberingConfig, 
  SchoolBrandingConfig, 
  LocalizationConfig, 
  UserPreferencesConfig, 
  ConfigVersionSnapshot,
  Role,
  CustomFieldEntityType
} from '../types';

export class ConfigurationService {
  // Safe template variable interpolation
  static interpolateTemplate(
    templateBody: string, 
    context: Record<string, string | number | undefined | null>
  ): string {
    if (!templateBody) return '';
    return templateBody.replace(/\{\{([a-zA-Z0-9_.]+)\}\}/g, (match, key) => {
      const val = context[key];
      return val !== undefined && val !== null ? String(val) : match;
    });
  }

  // Generate sequence numbers transactionally
  static generateSequenceNumber(config: NumberingConfig): { formattedNumber: string; updatedConfig: NumberingConfig } {
    const nextSeq = config.currentSequence + 1;
    const padded = String(nextSeq).padStart(config.padding, '0');
    const currentYear = new Date().getFullYear();
    
    let parts: string[] = [];
    if (config.prefix) parts.push(config.prefix);
    if (config.includeYear) parts.push(String(currentYear));
    parts.push(padded);
    if (config.suffix) parts.push(config.suffix);

    const formattedNumber = parts.join('-');
    const updatedConfig: NumberingConfig = {
      ...config,
      currentSequence: nextSeq
    };

    return { formattedNumber, updatedConfig };
  }

  // Generate CSS tokens from active theme configuration
  static applyThemeTokens(theme: ThemeConfig) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    root.style.setProperty('--erp-primary', theme.primaryColor);
    root.style.setProperty('--erp-secondary', theme.secondaryColor);
    root.style.setProperty('--erp-accent', theme.accentColor);
    root.style.setProperty('--erp-sidebar-bg', theme.sidebarBg);
    root.style.setProperty('--erp-sidebar-text', theme.sidebarTextColor);
    
    // Border radius mapping
    const radiusMap = {
      none: '0px',
      small: '4px',
      medium: '8px',
      large: '16px',
      pill: '9999px'
    };
    root.style.setProperty('--erp-radius', radiusMap[theme.borderRadius] || '8px');

    // Font family mapping
    const fontMap = {
      'Plus Jakarta Sans': "'Plus Jakarta Sans', system-ui, sans-serif",
      'Inter': "'Inter', system-ui, sans-serif",
      'Segoe UI': "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      'JetBrains Mono': "'JetBrains Mono', monospace",
      'System': 'system-ui, -apple-system, sans-serif'
    };
    root.style.setProperty('--erp-font', fontMap[theme.fontFamily] || 'inherit');
  }

  // Validate custom field value against rules
  static validateFieldValue(
    field: CustomFieldDefinition, 
    value: any
  ): { isValid: boolean; errorMessage?: string } {
    if (field.isRequired && (value === undefined || value === null || value === '')) {
      return { isValid: false, errorMessage: `${field.fieldName} is required.` };
    }

    if (value !== undefined && value !== null && value !== '') {
      if (field.validationRegex) {
        try {
          const reg = new RegExp(field.validationRegex);
          if (!reg.test(String(value))) {
            return { isValid: false, errorMessage: `${field.fieldName} does not match expected format.` };
          }
        } catch {
          // Ignore invalid regex in user config
        }
      }

      if (field.fieldType === 'NUMBER' || field.fieldType === 'CURRENCY' || field.fieldType === 'DECIMAL') {
        if (isNaN(Number(value))) {
          return { isValid: false, errorMessage: `${field.fieldName} must be a valid number.` };
        }
      }

      if (field.fieldType === 'EMAIL') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          return { isValid: false, errorMessage: `Invalid email format.` };
        }
      }
    }

    return { isValid: true };
  }

  // Check if role has access to module or feature
  static hasAccess(requiredRoles: Role[], currentRole: Role): boolean {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (currentRole === 'SUPER_ADMIN') return true;
    return requiredRoles.includes(currentRole);
  }

  // Validate JSON schema for import
  static validateConfigPackage(jsonContent: string): { isValid: boolean; data?: any; error?: string } {
    try {
      const data = JSON.parse(jsonContent);
      if (!data || typeof data !== 'object') {
        return { isValid: false, error: 'Uploaded file is not a valid JSON configuration object.' };
      }
      if (!data.manifest || data.manifest.system !== 'SchoolERP') {
        return { isValid: false, error: 'Invalid configuration manifest. File is not a SchoolERP configuration export.' };
      }
      return { isValid: true, data };
    } catch (err: any) {
      return { isValid: false, error: `JSON Parse Error: ${err.message}` };
    }
  }
}
