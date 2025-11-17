import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

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

export enum Feature {
  BASIC_COURSES = 'basic_courses',
  BASIC_FORUMS = 'basic_forums',
  ADVANCED_ANALYTICS = 'advanced_analytics',
  UNLIMITED_COURSES = 'unlimited_courses',
  CUSTOM_BRANDING = 'custom_branding',
  SSO_INTEGRATION = 'sso_integration',
  PRIORITY_SUPPORT = 'priority_support',
  UNLIMITED_MEMBERS = 'unlimited_members',
  ADVANCED_PERMISSIONS = 'advanced_permissions',
  API_ACCESS = 'api_access',
  DEDICATED_SUPPORT = 'dedicated_support',
  CUSTOM_INTEGRATIONS = 'custom_integrations',
  WHITE_LABEL = 'white_label',
}

interface OrganizationCapabilities {
  tier: string;
  features: Feature[];
  limits: {
    maxMembers?: number;
    maxCourses?: number;
    maxDepartments?: number;
    maxStorage?: number;
  };
  usage: {
    members: number;
    courses: number;
    departments: number;
  };
  userPermissions: Permission[];
}

/**
 * Hook to check permissions and features for an organization
 */
export function useOrganizationPermissions(organizationId?: string) {
  const { data: session } = useSession();
  const [capabilities, setCapabilities] = useState<OrganizationCapabilities | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setCapabilities(null);
      setLoading(false);
      return;
    }

    const fetchCapabilities = async () => {
      try {
        setLoading(true);
        const { organizationApi } = await import('@/lib/api/organization-client');
        const caps = await organizationApi.getCapabilities(organizationId);
        setCapabilities(caps);
      } catch (error) {
        console.error('Failed to fetch organization capabilities:', error);
        // Set default permissions on error
        setCapabilities({
          tier: 'FREE',
          features: [Feature.BASIC_COURSES, Feature.BASIC_FORUMS],
          limits: {
            maxMembers: 50,
            maxCourses: 5,
            maxDepartments: 3,
          },
          usage: {
            members: 0,
            courses: 0,
            departments: 0,
          },
          userPermissions: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCapabilities();
  }, [organizationId, session]);

  const hasPermission = (permission: Permission): boolean => {
    return capabilities?.userPermissions.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  const hasFeature = (feature: Feature): boolean => {
    return capabilities?.features.includes(feature) || false;
  };

  const isLimitReached = (limitType: 'maxMembers' | 'maxCourses' | 'maxDepartments' | 'maxStorage'): boolean => {
    if (!capabilities) return false;
    const limit = capabilities.limits[limitType];
    if (limit === undefined) return false; // No limit

    const usageMap = {
      maxMembers: capabilities.usage.members,
      maxCourses: capabilities.usage.courses,
      maxDepartments: capabilities.usage.departments,
      maxStorage: 0, // TODO: Implement storage tracking
    };

    return usageMap[limitType] >= limit;
  };

  const canPerformAction = (permission: Permission, feature?: Feature): {
    allowed: boolean;
    reason?: string;
  } => {
    if (!capabilities) {
      return { allowed: false, reason: 'Organization not loaded' };
    }

    // Check permission first
    if (!hasPermission(permission)) {
      return { allowed: false, reason: 'You do not have permission to perform this action' };
    }

    // Check feature if specified
    if (feature && !hasFeature(feature)) {
      return { allowed: false, reason: `This feature requires ${capabilities.tier} tier or higher` };
    }

    return { allowed: true };
  };

  return {
    capabilities,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasFeature,
    isLimitReached,
    canPerformAction,
  };
}

/**
 * Component wrapper for permission-based rendering
 */
interface PermissionGateProps {
  permission?: Permission | Permission[];
  feature?: Feature;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  organizationId?: string;
}

export function PermissionGate({
  permission,
  feature,
  fallback = null,
  children,
  organizationId,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasFeature: checkFeature, loading } = useOrganizationPermissions(organizationId);

  if (loading) {
    return <>{fallback}</>;
  }

  // Check permission
  if (permission) {
    const hasAccess = Array.isArray(permission)
      ? hasAnyPermission(permission)
      : hasPermission(permission);

    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  // Check feature
  if (feature && !checkFeature(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
