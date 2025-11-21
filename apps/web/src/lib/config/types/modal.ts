/**
 * Modal/Dialog Configuration Types
 * Config-driven modals, dialogs, and drawers
 */

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type ModalPosition = 'center' | 'top' | 'bottom';

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

export type ModalAction = {
  id: string;
  label: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  type?: 'button' | 'submit' | 'reset';
  onClick?: string; // Function name
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

export type ModalContent = {
  type: 'text' | 'html' | 'form' | 'component' | 'iframe';
  content?: string;
  html?: string;
  formConfig?: any; // FormConfig from forms
  component?: string; // Component name
  componentProps?: Record<string, any>;
  iframeSrc?: string;
};

export type ConfirmDialogConfig = {
  type: 'confirm';
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: string; // Function name
  onCancel?: string;
};

export type AlertDialogConfig = {
  type: 'alert';
  title: string;
  description: string;
  icon?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  onConfirm?: string;
};

export type CustomModalConfig = {
  type: 'custom';
  title?: string;
  description?: string;
  content: ModalContent;
  actions?: ModalAction[];
  footer?: {
    text?: string;
    align?: 'left' | 'center' | 'right';
  };
};

export type ModalConfig = {
  id: string;
  size?: ModalSize;
  position?: ModalPosition;
  closeButton?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  showOverlay?: boolean;
  className?: string;
  onOpen?: string; // Function name
  onClose?: string;
} & (ConfirmDialogConfig | AlertDialogConfig | CustomModalConfig);

export type DrawerConfig = {
  id: string;
  title?: string;
  description?: string;
  position: DrawerPosition;
  size?: number | string; // Width for left/right, height for top/bottom
  content: ModalContent;
  actions?: ModalAction[];
  closeButton?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  showOverlay?: boolean;
  className?: string;
  onOpen?: string;
  onClose?: string;
};

export type ToastConfig = {
  id?: string;
  title: string;
  description?: string;
  variant: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number; // ms, 0 for permanent
  action?: {
    label: string;
    onClick: string;
  };
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
};

export type NotificationConfig = {
  id: string;
  title: string;
  description?: string;
  timestamp?: string | Date;
  read?: boolean;
  avatar?: string;
  icon?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  actions?: {
    label: string;
    onClick: string;
  }[];
  onClick?: string;
};
