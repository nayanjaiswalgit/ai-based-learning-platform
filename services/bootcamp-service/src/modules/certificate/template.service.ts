import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TemplateService {
  /**
   * Create certificate template
   * Phase 6: Certificate template designer
   */
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    bootcampId?: string;
    templateType: string;
    designConfig: any;
    backgroundImageUrl?: string;
    signatureImageUrl?: string;
    createdBy: string;
  }) {
    return this.prisma.certificateTemplate.create({
      data: {
        name: data.name,
        bootcampId: data.bootcampId,
        templateType: data.templateType,
        designConfig: data.designConfig,
        backgroundImageUrl: data.backgroundImageUrl,
        signatureImageUrl: data.signatureImageUrl,
        createdBy: data.createdBy,
        isActive: true,
      },
    });
  }

  /**
   * Get all templates
   */
  async findAll(filters?: {
    bootcampId?: string;
    templateType?: string;
    activeOnly?: boolean;
  }) {
    const where: any = {};

    if (filters?.bootcampId !== undefined) {
      where.bootcampId = filters.bootcampId;
    }

    if (filters?.templateType) {
      where.templateType = filters.templateType;
    }

    if (filters?.activeOnly) {
      where.isActive = true;
    }

    return this.prisma.certificateTemplate.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get template by ID
   */
  async findOne(id: string) {
    const template = await this.prisma.certificateTemplate.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        bootcamp: true,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  /**
   * Update template
   */
  async update(id: string, data: any) {
    return this.prisma.certificateTemplate.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete template
   */
  async delete(id: string) {
    await this.prisma.certificateTemplate.delete({
      where: { id },
    });

    return { message: 'Template deleted successfully' };
  }

  /**
   * Toggle template active status
   */
  async toggleActive(id: string, isActive: boolean) {
    return this.prisma.certificateTemplate.update({
      where: { id },
      data: { isActive },
    });
  }
}
