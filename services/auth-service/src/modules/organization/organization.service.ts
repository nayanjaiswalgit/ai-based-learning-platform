import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  AddMemberDto,
  UpdateMemberDto,
  CreateDepartmentDto,
} from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  // =====================================================
  // ORGANIZATION CRUD
  // =====================================================

  async createOrganization(dto: CreateOrganizationDto, createdBy: string) {
    // Check if slug already exists
    const existing = await this.prisma.organization.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Organization slug already exists');
    }

    // Create organization and add creator as ADMIN member
    return this.prisma.organization.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        type: dto.type,
        description: dto.description,
        website: dto.website,
        logoUrl: dto.logoUrl,
        industry: dto.industry,
        location: dto.location,
        settings: dto.settings,
        createdBy,
        members: {
          create: {
            userId: createdBy,
            role: UserRole.ADMIN,
            title: 'Founder',
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                role: true,
                profile: true,
              },
            },
          },
        },
      },
    });
  }

  async getAllOrganizations(filters?: {
    type?: string;
    isActive?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        take: filters?.limit || 20,
        skip: filters?.offset || 0,
        include: {
          creator: {
            select: {
              id: true,
              username: true,
            },
          },
          _count: {
            select: {
              members: true,
              courses: true,
              bootcamps: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return {
      organizations,
      total,
      limit: filters?.limit || 20,
      offset: filters?.offset || 0,
    };
  }

  async getOrganizationBySlug(slug: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        members: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                role: true,
                profile: true,
              },
            },
            department: true,
          },
        },
        departments: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
        _count: {
          select: {
            members: true,
            courses: true,
            bootcamps: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async getOrganizationById(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            members: true,
            courses: true,
            bootcamps: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async updateOrganization(slug: string, dto: UpdateOrganizationDto, userId: string) {
    const organization = await this.getOrganizationBySlug(slug);

    // Check if user is admin of the organization
    await this.checkOrganizationAdmin(organization.id, userId);

    return this.prisma.organization.update({
      where: { id: organization.id },
      data: dto,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            members: true,
            courses: true,
            bootcamps: true,
          },
        },
      },
    });
  }

  async deleteOrganization(slug: string, userId: string) {
    const organization = await this.getOrganizationBySlug(slug);

    // Only creator can delete
    if (organization.createdBy !== userId) {
      throw new ForbiddenException('Only the organization creator can delete it');
    }

    return this.prisma.organization.delete({
      where: { id: organization.id },
    });
  }

  // =====================================================
  // MEMBER MANAGEMENT
  // =====================================================

  async addMember(slug: string, dto: AddMemberDto, adminUserId: string) {
    const organization = await this.getOrganizationBySlug(slug);

    // Check if requester is admin
    await this.checkOrganizationAdmin(organization.id, adminUserId);

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if member already exists
    const existingMember = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: dto.userId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this organization');
    }

    return this.prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: dto.userId,
        role: dto.role,
        title: dto.title,
        departmentId: dto.departmentId,
        permissions: dto.permissions,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            profile: true,
          },
        },
        department: true,
      },
    });
  }

  async getMembers(slug: string, filters?: {
    role?: UserRole;
    departmentId?: string;
    isActive?: boolean;
  }) {
    const organization = await this.getOrganizationBySlug(slug);

    const where: any = {
      organizationId: organization.id,
    };

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.departmentId) {
      where.departmentId = filters.departmentId;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return this.prisma.organizationMember.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            profile: true,
          },
        },
        department: true,
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  async getMemberById(memberId: string) {
    const member = await this.prisma.organizationMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            profile: true,
          },
        },
        organization: true,
        department: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async updateMember(memberId: string, dto: UpdateMemberDto, adminUserId: string) {
    const member = await this.getMemberById(memberId);

    // Check if requester is admin
    await this.checkOrganizationAdmin(member.organizationId, adminUserId);

    return this.prisma.organizationMember.update({
      where: { id: memberId },
      data: dto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            profile: true,
          },
        },
        department: true,
      },
    });
  }

  async removeMember(memberId: string, adminUserId: string) {
    const member = await this.getMemberById(memberId);

    // Check if requester is admin
    await this.checkOrganizationAdmin(member.organizationId, adminUserId);

    // Cannot remove the creator
    const organization = await this.prisma.organization.findUnique({
      where: { id: member.organizationId },
    });

    if (organization.createdBy === member.userId) {
      throw new ForbiddenException('Cannot remove the organization creator');
    }

    // Soft delete by setting leftAt
    return this.prisma.organizationMember.update({
      where: { id: memberId },
      data: {
        isActive: false,
        leftAt: new Date(),
      },
    });
  }

  // =====================================================
  // DEPARTMENT MANAGEMENT
  // =====================================================

  async createDepartment(slug: string, dto: CreateDepartmentDto, adminUserId: string) {
    const organization = await this.getOrganizationBySlug(slug);

    // Check if requester is admin
    await this.checkOrganizationAdmin(organization.id, adminUserId);

    // Check if department name already exists
    const existing = await this.prisma.organizationDepartment.findUnique({
      where: {
        organizationId_name: {
          organizationId: organization.id,
          name: dto.name,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Department with this name already exists');
    }

    return this.prisma.organizationDepartment.create({
      data: {
        organizationId: organization.id,
        name: dto.name,
        description: dto.description,
        headMemberId: dto.headMemberId,
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
  }

  async getDepartments(slug: string) {
    const organization = await this.getOrganizationBySlug(slug);

    return this.prisma.organizationDepartment.findMany({
      where: {
        organizationId: organization.id,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profile: true,
              },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });
  }

  async updateDepartment(departmentId: string, dto: Partial<CreateDepartmentDto>, adminUserId: string) {
    const department = await this.prisma.organizationDepartment.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Check if requester is admin
    await this.checkOrganizationAdmin(department.organizationId, adminUserId);

    return this.prisma.organizationDepartment.update({
      where: { id: departmentId },
      data: dto,
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
  }

  async deleteDepartment(departmentId: string, adminUserId: string) {
    const department = await this.prisma.organizationDepartment.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Check if requester is admin
    await this.checkOrganizationAdmin(department.organizationId, adminUserId);

    return this.prisma.organizationDepartment.delete({
      where: { id: departmentId },
    });
  }

  // =====================================================
  // USER ORGANIZATIONS
  // =====================================================

  async getUserOrganizations(userId: string) {
    const memberships = await this.prisma.organizationMember.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        organization: {
          include: {
            _count: {
              select: {
                members: true,
                courses: true,
                bootcamps: true,
              },
            },
          },
        },
        department: true,
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map(m => ({
      ...m.organization,
      membership: {
        role: m.role,
        title: m.title,
        department: m.department,
        joinedAt: m.joinedAt,
        permissions: m.permissions,
      },
    }));
  }

  // =====================================================
  // MENTOR DISCOVERY
  // =====================================================

  async getMentorsInOrganization(slug: string, filters?: {
    departmentId?: string;
    skills?: string[];
  }) {
    const organization = await this.getOrganizationBySlug(slug);

    const where: any = {
      organizationId: organization.id,
      role: UserRole.MENTOR,
      isActive: true,
    };

    if (filters?.departmentId) {
      where.departmentId = filters.departmentId;
    }

    return this.prisma.organizationMember.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            profile: true,
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
        department: true,
      },
    });
  }

  // =====================================================
  // HELPERS
  // =====================================================

  private async checkOrganizationAdmin(organizationId: string, userId: string) {
    const member = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    if (!member || member.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only organization administrators can perform this action');
    }

    return member;
  }

  async checkUserMembership(organizationId: string, userId: string) {
    const member = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    return member;
  }
}
