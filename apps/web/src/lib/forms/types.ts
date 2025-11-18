/**
 * Form Configuration Types
 * Defines the schema for config-driven and server-driven forms
 */

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'textarea'
  | 'file'
  | 'hidden';

export type ValidationRule = {
  type: 'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any, formData: Record<string, any>) => boolean | Promise<boolean>;
};

export type ConditionalRule = {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
};

export type FieldOption = {
  label: string;
  value: string | number;
  disabled?: boolean;
};

export type FormField = {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: any;
  options?: FieldOption[]; // For select, radio, checkbox groups
  validation?: ValidationRule[];
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  conditionalDisplay?: ConditionalRule;
  helpText?: string;
  prefix?: string; // For input addons
  suffix?: string;
  autoComplete?: string;
  className?: string;
  rows?: number; // For textarea
  accept?: string; // For file inputs
  multiple?: boolean; // For file inputs and selects
  min?: number | string;
  max?: number | string;
  step?: number | string;
  pattern?: string;
  showPasswordToggle?: boolean; // For password fields
};

export type FormSection = {
  id: string;
  title?: string;
  description?: string;
  fields: FormField[];
  conditionalDisplay?: ConditionalRule;
  columns?: number; // For grid layout
};

export type FormAction = {
  type: 'submit' | 'reset' | 'button';
  label: string;
  loadingText?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  disabled?: boolean;
  onClick?: string; // Function name or API endpoint
  className?: string;
};

export type SocialAuthProvider = {
  provider: 'google' | 'github' | 'facebook' | 'microsoft' | 'apple';
  label: string;
  icon?: string;
  enabled: boolean;
  callbackUrl?: string;
};

export type FormConfig = {
  id: string;
  title: string;
  description?: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  action: string; // API endpoint
  sections: FormSection[];
  actions: FormAction[];
  socialAuth?: SocialAuthProvider[];
  divider?: {
    show: boolean;
    text?: string;
  };
  footer?: {
    text: string;
    link: {
      text: string;
      href: string;
    };
  };
  onSuccess?: {
    message?: string;
    redirect?: string;
    callback?: string;
  };
  onError?: {
    message?: string;
    callback?: string;
  };
  loading?: {
    text?: string;
  };
  metadata?: Record<string, any>;
};

export type FormState = {
  values?: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid?: boolean;
  submitCount?: number;
  isDirty?: boolean;
  submitSuccess?: boolean;
  submitError?: string;
};

export type FormContextValue = {
  config: FormConfig;
  state: FormState;
  updateField: (name: string, value: any) => void;
  updateFieldTouched: (name: string, touched: boolean) => void;
  validateField: (name: string) => Promise<string | null>;
  validateForm: () => Promise<boolean>;
  submitForm: () => Promise<void>;
  resetForm: () => void;
};
