/**
 * Organization Permissions System
 *
 * This file defines the permission structure for organizations.
 * Permissions are checked dynamically rather than hardcoded in the UI.
 */

export enum Permission {
  // Organization Management
  ORG_VIEW = 'org:view',
  ORG_CREATE = 'org:create',
  ORG_UPDATE = 'org:update',
  ORG_DELETE = 'org:delete',

  // Member Management
  MEMBER_VIEW = 'member:view',
  MEMBER_ADD = 'member:add',
  MEMBER_UPDATE = 'member:update',
  MEMBER_REMOVE = 'member:remove',

  // Department Management
  DEPT_VIEW = 'dept:view',
  DEPT_CREATE = 'dept:create',
  DEPT_UPDATE = 'dept:update',
  DEPT_DELETE = 'dept:delete',

  // Course Management
  COURSE_VIEW = 'course:view',
  COURSE_CREATE = 'course:create',
  COURSE_UPDATE = 'course:update',
  COURSE_DELETE = 'course:delete',
  COURSE_ENROLL = 'course:enroll',

  // Forum/Discussion
  FORUM_VIEW = 'forum:view',
  FORUM_POST = 'forum:post',
  FORUM_REPLY = 'forum:reply',
  FORUM_MODERATE = 'forum:moderate',
  FORUM_DELETE = 'forum:delete',

  // Mentorship
  MENTOR_VIEW = 'mentor:view',
  MENTOR_REQUEST = 'mentor:request',
  MENTOR_ACCEPT = 'mentor:accept',

  // Analytics
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_EXPORT = 'analytics:export',
}

export interface RolePermissions {
  role: string;
  permissions: Permission[];
  inherits?: string; // Inherit permissions from another role
}

/**
 * Default role permissions
 * Each role inherits permissions from the role below it
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  STUDENT: [
    Permission.ORG_VIEW,
    Permission.MEMBER_VIEW,
    Permission.DEPT_VIEW,
    Permission.COURSE_VIEW,
    Permission.COURSE_ENROLL,
    Permission.FORUM_VIEW,
    Permission.FORUM_POST,
    Permission.FORUM_REPLY,
    Permission.MENTOR_VIEW,
    Permission.MENTOR_REQUEST,
  ],

  MENTOR: [
    // Inherits all STUDENT permissions plus:
    Permission.MENTOR_ACCEPT,
    Permission.FORUM_MODERATE, // Can moderate discussions
  ],

  INSTRUCTOR: [
    // Inherits all MENTOR permissions plus:
    Permission.COURSE_CREATE,
    Permission.COURSE_UPDATE,
    Permission.DEPT_VIEW,
    Permission.ANALYTICS_VIEW,
  ],

  ADMIN: [
    // Inherits all INSTRUCTOR permissions plus:
    Permission.ORG_UPDATE,
    Permission.ORG_DELETE,
    Permission.MEMBER_ADD,
    Permission.MEMBER_UPDATE,
    Permission.MEMBER_REMOVE,
    Permission.DEPT_CREATE,
    Permission.DEPT_UPDATE,
    Permission.DEPT_DELETE,
    Permission.COURSE_DELETE,
    Permission.FORUM_DELETE,
    Permission.ANALYTICS_EXPORT,
  ],
};

/**
 * Role hierarchy for inheritance
 */
export const ROLE_HIERARCHY = {
  STUDENT: 0,
  MENTOR: 1,
  INSTRUCTOR: 2,
  ADMIN: 3,
};

/**
 * Get all permissions for a role including inherited permissions
 */
export function getRolePermissions(role: string): Permission[] {
  const permissions = new Set<Permission>();
  const roleLevel = ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] || 0;

  // Add permissions from current role and all roles below it
  Object.entries(ROLE_HIERARCHY).forEach(([r, level]) => {
    if (level <= roleLevel) {
      const rolePerms = DEFAULT_ROLE_PERMISSIONS[r] || [];
      rolePerms.forEach(p => permissions.add(p));
    }
  });

  return Array.from(permissions);
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: string, permission: Permission, customPermissions?: Permission[]): boolean {
  // Check custom permissions first
  if (customPermissions?.includes(permission)) {
    return true;
  }

  // Check default role permissions
  const rolePermissions = getRolePermissions(role);
  return rolePermissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: string, permissions: Permission[], customPermissions?: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p, customPermissions));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: string, permissions: Permission[], customPermissions?: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p, customPermissions));
}

/**
 * Feature flags for premium/subscription features
 */
export enum Feature {
  // Free tier
  BASIC_COURSES = 'basic_courses',
  BASIC_FORUMS = 'basic_forums',

  // Premium tier
  ADVANCED_ANALYTICS = 'advanced_analytics',
  UNLIMITED_COURSES = 'unlimited_courses',
  CUSTOM_BRANDING = 'custom_branding',
  SSO_INTEGRATION = 'sso_integration',
  PRIORITY_SUPPORT = 'priority_support',

  // Enterprise tier
  UNLIMITED_MEMBERS = 'unlimited_members',
  ADVANCED_PERMISSIONS = 'advanced_permissions',
  API_ACCESS = 'api_access',
  DEDICATED_SUPPORT = 'dedicated_support',
  CUSTOM_INTEGRATIONS = 'custom_integrations',
  WHITE_LABEL = 'white_label',
}

export interface SubscriptionTier {
  name: string;
  features: Feature[];
  limits: {
    maxMembers?: number;
    maxCourses?: number;
    maxDepartments?: number;
    maxStorage?: number; // in GB
  };
}

/**
 * Subscription tiers configuration
 */
export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  FREE: {
    name: 'Free',
    features: [Feature.BASIC_COURSES, Feature.BASIC_FORUMS],
    limits: {
      maxMembers: 50,
      maxCourses: 5,
      maxDepartments: 3,
      maxStorage: 1,
    },
  },

  PREMIUM: {
    name: 'Premium',
    features: [
      Feature.BASIC_COURSES,
      Feature.BASIC_FORUMS,
      Feature.ADVANCED_ANALYTICS,
      Feature.UNLIMITED_COURSES,
      Feature.CUSTOM_BRANDING,
      Feature.PRIORITY_SUPPORT,
    ],
    limits: {
      maxMembers: 500,
      maxDepartments: 20,
      maxStorage: 50,
    },
  },

  ENTERPRISE: {
    name: 'Enterprise',
    features: Object.values(Feature), // All features
    limits: {
      // No limits
    },
  },
};

/**
 * Check if an organization has access to a feature
 */
export function hasFeature(tier: string, feature: Feature): boolean {
  const subscription = SUBSCRIPTION_TIERS[tier];
  if (!subscription) return false;
  return subscription.features.includes(feature);
}

/**
 * Get limits for a subscription tier
 */
export function getLimits(tier: string): SubscriptionTier['limits'] {
  const subscription = SUBSCRIPTION_TIERS[tier];
  return subscription?.limits || {};
}

/**
 * Check if limit is reached
 */
export function isLimitReached(tier: string, limitType: keyof SubscriptionTier['limits'], currentValue: number): boolean {
  const limits = getLimits(tier);
  const limit = limits[limitType];
  if (limit === undefined) return false; // No limit
  return currentValue >= limit;
}
