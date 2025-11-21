/**
 * Settings Configuration Types
 * Config-driven settings pages and preferences
 */

export type SettingType =
  | 'text'
  | 'email'
  | 'number'
  | 'toggle'
  | 'select'
  | 'radio'
  | 'slider'
  | 'color'
  | 'file'
  | 'textarea'
  | 'password'
  | 'date'
  | 'time';

export type SettingValidation = {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: string; // Function name
};

export type Setting = {
  id: string;
  key: string; // Storage key
  label: string;
  description?: string;
  type: SettingType;
  defaultValue?: any;
  value?: any;
  options?: { label: string; value: any; description?: string }[];
  validation?: SettingValidation;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  accept?: string; // For file inputs
  rows?: number; // For textarea
  showPasswordToggle?: boolean;
  onChange?: string; // Function name
  dependencies?: {
    key: string;
    value: any;
    operator?: 'equals' | 'notEquals' | 'contains';
  }[];
};

export type SettingsSection = {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  settings: Setting[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  permissions?: {
    roles?: string[];
    permissions?: string[];
  };
};

export type SettingsTab = {
  id: string;
  label: string;
  icon?: string;
  sections: SettingsSection[];
  badge?: string;
  permissions?: {
    roles?: string[];
    permissions?: string[];
  };
};

export type SettingsConfig = {
  id: string;
  title: string;
  description?: string;
  layout: 'tabs' | 'sidebar' | 'single';
  tabs?: SettingsTab[];
  sections?: SettingsSection[];
  storage: {
    type: 'local' | 'session' | 'api';
    endpoint?: string; // For API storage
    autoSave?: boolean;
    debounce?: number; // ms
  };
  actions?: {
    save?: {
      enabled: boolean;
      label?: string;
      position?: 'top' | 'bottom' | 'both';
    };
    reset?: {
      enabled: boolean;
      label?: string;
    };
    export?: {
      enabled: boolean;
      formats?: ('json' | 'yaml')[];
    };
    import?: {
      enabled: boolean;
    };
  };
  onSave?: string; // Function name
  onReset?: string;
  onExport?: string;
  onImport?: string;
};

export type ThemeConfig = {
  id: string;
  name: string;
  colors: {
    primary?: string;
    secondary?: string;
    success?: string;
    warning?: string;
    destructive?: string;
    info?: string;
    background?: string;
    foreground?: string;
    muted?: string;
    border?: string;
  };
  fonts?: {
    sans?: string;
    mono?: string;
    sizes?: Record<string, string>;
  };
  spacing?: Record<string, string>;
  borderRadius?: Record<string, string>;
  shadows?: Record<string, string>;
  custom?: Record<string, any>;
};

export type PreferencesConfig = {
  id: string;
  userId?: string;
  theme?: 'light' | 'dark' | 'auto';
  customTheme?: ThemeConfig;
  locale?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  currency?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    desktop?: boolean;
  };
  privacy?: {
    profileVisibility?: 'public' | 'private' | 'friends';
    showEmail?: boolean;
    showActivity?: boolean;
  };
  accessibility?: {
    highContrast?: boolean;
    reducedMotion?: boolean;
    screenReader?: boolean;
    fontSize?: number;
  };
  custom?: Record<string, any>;
};
