import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async createOrganization(data: any, createdBy: string) {
    const { name, slug, domain, plan } = data;

    // Check if slug already exists
    const existing = await this.prisma.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Organization slug already exists');
    }

    return this.prisma.organization.create({
      data: {
        name,
        slug,
        domain,
        plan: plan || 'free',
        members: {
          create: {
            userId: createdBy,
            role: 'admin',
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async getOrganizationBySlug(slug: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
      include: {
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async addMember(slug: string, userId: string, role: string = 'member') {
    const organization = await this.getOrganizationBySlug(slug);

    // Check if member already exists
    const existingMember = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this organization');
    }

    return this.prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId,
        role,
      },
    });
  }

  async getMembers(slug: string) {
    const organization = await this.getOrganizationBySlug(slug);

    return this.prisma.organizationMember.findMany({
      where: {
        organizationId: organization.id,
      },
      select: {
        id: true,
        userId: true,
        role: true,
        createdAt: true,
      },
    });
  }
}
