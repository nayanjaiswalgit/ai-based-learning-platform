import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ProjectShowcaseService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create project showcase
   * Phase 5: Final project showcase
   */
  async create(data: {
    cohortId: string;
    userId: string;
    projectTitle: string;
    description: string;
    demoUrl?: string;
    githubUrl?: string;
    videoUrl?: string;
    techStack?: string[];
    screenshots?: string[];
  }) {
    const project = await this.prisma.projectShowcase.create({
      data: {
        cohortId: data.cohortId,
        userId: data.userId,
        projectTitle: data.projectTitle,
        description: data.description,
        demoUrl: data.demoUrl,
        githubUrl: data.githubUrl,
        videoUrl: data.videoUrl,
        techStack: data.techStack,
        screenshots: data.screenshots,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePictureUrl: true,
          },
        },
        cohort: true,
      },
    });

    return project;
  }

  /**
   * Get all showcased projects for a cohort
   */
  async findAllByCohort(cohortId: string, filters?: {
    featured?: boolean;
  }) {
    const where: any = { cohortId };

    if (filters?.featured) {
      where.isFeatured = true;
    }

    return this.prisma.projectShowcase.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePictureUrl: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { likesCount: 'desc' },
      ],
    });
  }

  /**
   * Get project details
   */
  async findOne(id: string) {
    const project = await this.prisma.projectShowcase.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePictureUrl: true,
            profile: true,
          },
        },
        cohort: {
          include: {
            bootcamp: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Increment views
    await this.prisma.projectShowcase.update({
      where: { id },
      data: {
        viewsCount: { increment: 1 },
      },
    });

    return project;
  }

  /**
   * Update project
   */
  async update(id: string, userId: string, data: any) {
    const project = await this.prisma.projectShowcase.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new NotFoundException('You do not have permission to update this project');
    }

    return this.prisma.projectShowcase.update({
      where: { id },
      data,
    });
  }

  /**
   * Toggle like
   */
  async toggleLike(id: string, userId: string) {
    // TODO: Implement proper like tracking with a separate table
    // For now, just increment/decrement the counter

    const project = await this.prisma.projectShowcase.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.projectShowcase.update({
      where: { id },
      data: {
        likesCount: { increment: 1 },
      },
    });
  }

  /**
   * Feature project
   */
  async toggleFeatured(id: string, isFeatured: boolean) {
    return this.prisma.projectShowcase.update({
      where: { id },
      data: { isFeatured },
    });
  }
}
