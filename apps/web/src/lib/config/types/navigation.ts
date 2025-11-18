/**
 * Navigation Configuration Types
 * Config-driven navigation menus, sidebars, and breadcrumbs
 */

export type NavItemIcon =
  | 'home'
  | 'courses'
  | 'dashboard'
  | 'users'
  | 'settings'
  | 'analytics'
  | 'calendar'
  | 'message'
  | 'notification'
  | 'search'
  | 'menu'
  | 'close'
  | 'chevron-down'
  | 'chevron-right'
  | 'external-link'
  | string;

export type NavItemBadge = {
  text: string;
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info';
  pulse?: boolean;
};

export type NavPermission = {
  roles?: string[];
  permissions?: string[];
  featureFlags?: string[];
};

export type NavItem = {
  id: string;
  label: string;
  icon?: NavItemIcon;
  href?: string;
  badge?: NavItemBadge;
  external?: boolean;
  children?: NavItem[];
  divider?: boolean;
  heading?: boolean;
  permissions?: NavPermission;
  onClick?: string; // Function name or action
  activeMatch?: string | string[]; // URL patterns to match for active state
  disabled?: boolean;
  hidden?: boolean;
};

export type NavSection = {
  id: string;
  title?: string;
  items: NavItem[];
  permissions?: NavPermission;
  collapsible?: boolean;
  defaultExpanded?: boolean;
};

export type NavigationConfig = {
  id: string;
  type: 'sidebar' | 'header' | 'footer' | 'mobile';
  sections: NavSection[];
  branding?: {
    logo?: string;
    logoSmall?: string;
    name?: string;
    tagline?: string;
    href?: string;
  };
  user?: {
    show: boolean;
    position: 'top' | 'bottom';
    showAvatar?: boolean;
    showName?: boolean;
    showEmail?: boolean;
    showRole?: boolean;
    dropdownItems?: NavItem[];
  };
  search?: {
    show: boolean;
    placeholder?: string;
    endpoint?: string;
  };
  notifications?: {
    show: boolean;
    endpoint?: string;
  };
  theme?: {
    position?: 'header' | 'user-menu' | 'settings';
  };
  settings?: {
    collapsible?: boolean;
    compact?: boolean;
    width?: number;
    position?: 'left' | 'right';
  };
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
  icon?: NavItemIcon;
};

export type BreadcrumbConfig = {
  items: BreadcrumbItem[];
  separator?: 'slash' | 'chevron' | 'arrow';
  showHome?: boolean;
  homeHref?: string;
};
