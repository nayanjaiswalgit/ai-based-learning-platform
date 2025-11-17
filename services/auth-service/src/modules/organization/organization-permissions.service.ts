import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import {
  Permission,
  Feature,
  getRolePermissions,
  hasPermission,
  hasFeature,
  isLimitReached,
  getLimits,
} from './constants/permissions';

@Injectable()
export class OrganizationPermissionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user's permissions within an organization
   */
  async getUserPermissions(userId: string, organizationId: string): Promise<{
    permissions: Permission[];
    features: Feature[];
    limits: any;
    role: string;
    title?: string;
  }> {
    // Get user's membership
    const member = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      include: {
        organization: {
          select: {
            settings: true,
          },
        },
      },
    });

    if (!member) {
      throw new Error('User is not a member of this organization');
    }

    // Get organization's subscription tier
    const tier = member.organization.settings?.subscriptionTier || 'FREE';

    // Get role-based permissions
    const rolePermissions = getRolePermissions(member.role);

    // Merge with custom permissions if any
    const customPermissions: Permission[] = member.permissions?.permissions || [];
    const allPermissions = Array.from(new Set([...rolePermissions, ...customPermissions]));

    // Get features based on subscription
    const allFeatures = Object.values(Feature).filter(f => hasFeature(tier, f));

    // Get limits
    const limits = getLimits(tier);

    return {
      permissions: allPermissions,
      features: allFeatures,
      limits,
      role: member.role,
      title: member.title,
    };
  }

  /**
   * Check if user has a specific permission in an organization
   */
  async checkPermission(userId: string, organizationId: string, permission: Permission): boolean {
    try {
      const userPerms = await this.getUserPermissions(userId, organizationId);
      return userPerms.permissions.includes(permission);
    } catch {
      return false;
    }
  }

  /**
   * Check if organization has access to a feature
   */
  async checkFeature(organizationId: string, feature: Feature): boolean {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    });

    if (!org) return false;

    const tier = org.settings?.subscriptionTier || 'FREE';
    return hasFeature(tier, feature);
  }

  /**
   * Check if organization has reached a limit
   */
  async checkLimit(organizationId: string, limitType: 'maxMembers' | 'maxCourses' | 'maxDepartments' | 'maxStorage'): Promise<{
    reached: boolean;
    current: number;
    limit?: number;
  }> {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        _count: {
          select: {
            members: true,
            courses: true,
            departments: true,
          },
        },
      },
    });

    if (!org) {
      throw new Error('Organization not found');
    }

    const tier = org.settings?.subscriptionTier || 'FREE';
    const limits = getLimits(tier);

    let currentValue = 0;
    switch (limitType) {
      case 'maxMembers':
        currentValue = org._count.members;
        break;
      case 'maxCourses':
        currentValue = org._count.courses;
        break;
      case 'maxDepartments':
        currentValue = org._count.departments;
        break;
      case 'maxStorage':
        // TODO: Calculate actual storage usage
        currentValue = 0;
        break;
    }

    const limit = limits[limitType];
    const reached = limit !== undefined && currentValue >= limit;

    return {
      reached,
      current: currentValue,
      limit,
    };
  }

  /**
   * Get organization capabilities (for UI to consume)
   */
  async getOrganizationCapabilities(organizationId: string, userId?: string): Promise<{
    tier: string;
    features: Feature[];
    limits: any;
    usage: {
      members: number;
      courses: number;
      departments: number;
    };
    userPermissions?: Permission[];
  }> {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        _count: {
          select: {
            members: true,
            courses: true,
            departments: true,
          },
        },
      },
    });

    if (!org) {
      throw new Error('Organization not found');
    }

    const tier = org.settings?.subscriptionTier || 'FREE';
    const allFeatures = Object.values(Feature).filter(f => hasFeature(tier, f));
    const limits = getLimits(tier);

    const result: any = {
      tier,
      features: allFeatures,
      limits,
      usage: {
        members: org._count.members,
        courses: org._count.courses,
        departments: org._count.departments,
      },
    };

    // Add user permissions if userId provided
    if (userId) {
      try {
        const userPerms = await this.getUserPermissions(userId, organizationId);
        result.userPermissions = userPerms.permissions;
      } catch {
        // User not a member
        result.userPermissions = [];
      }
    }

    return result;
  }
}
