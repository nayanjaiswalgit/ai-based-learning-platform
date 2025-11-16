import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBootcampDto } from './dto/create-bootcamp.dto';

@Injectable()
export class BootcampService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new bootcamp
   * Phase 1: Bootcamp creation API
   */
  async create(dto: CreateBootcampDto) {
    // Check if slug already exists
    const existing = await this.prisma.bootcamp.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new BadRequestException('Bootcamp with this slug already exists');
    }

    const bootcamp = await this.prisma.bootcamp.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        description: dto.description,
        durationWeeks: dto.durationWeeks,
        syllabus: dto.syllabus,
        instructorId: dto.instructorId,
        price: dto.price,
        maxStudentsPerCohort: dto.maxStudentsPerCohort || 30,
        difficultyLevel: dto.difficultyLevel,
        thumbnailUrl: dto.thumbnailUrl,
        isPublished: dto.isPublished || false,
      },
      include: {
        instructor: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    return bootcamp;
  }

  /**
   * Get all bootcamps with filtering
   * Phase 1: Bootcamp listing for landing pages
   */
  async findAll(filters?: {
    isPublished?: boolean;
    difficultyLevel?: string;
    instructorId?: string;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.isPublished !== undefined) {
      where.isPublished = filters.isPublished;
    }

    if (filters?.difficultyLevel) {
      where.difficultyLevel = filters.difficultyLevel;
    }

    if (filters?.instructorId) {
      where.instructorId = filters.instructorId;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const bootcamps = await this.prisma.bootcamp.findMany({
      where,
      include: {
        instructor: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePictureUrl: true,
          },
        },
        _count: {
          select: {
            cohorts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bootcamps;
  }

  /**
   * Get bootcamp by ID or slug
   * Phase 1: Bootcamp detail page
   */
  async findOne(identifier: string) {
    const bootcamp = await this.prisma.bootcamp.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier },
        ],
      },
      include: {
        instructor: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePictureUrl: true,
            profile: true,
          },
        },
        cohorts: {
          where: {
            status: { in: ['upcoming', 'active'] },
          },
          orderBy: {
            startDate: 'asc',
          },
        },
        screeningQuestions: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
        _count: {
          select: {
            applications: true,
            cohorts: true,
          },
        },
      },
    });

    if (!bootcamp) {
      throw new NotFoundException('Bootcamp not found');
    }

    return bootcamp;
  }

  /**
   * Update bootcamp
   * Phase 1: Course update and versioning
   */
  async update(id: string, data: Partial<CreateBootcampDto>) {
    const bootcamp = await this.prisma.bootcamp.findUnique({
      where: { id },
    });

    if (!bootcamp) {
      throw new NotFoundException('Bootcamp not found');
    }

    return this.prisma.bootcamp.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        instructor: true,
      },
    });
  }

  /**
   * Delete bootcamp
   */
  async delete(id: string) {
    const bootcamp = await this.prisma.bootcamp.findUnique({
      where: { id },
      include: {
        cohorts: true,
      },
    });

    if (!bootcamp) {
      throw new NotFoundException('Bootcamp not found');
    }

    if (bootcamp.cohorts.some(c => c.status === 'active')) {
      throw new BadRequestException('Cannot delete bootcamp with active cohorts');
    }

    await this.prisma.bootcamp.delete({
      where: { id },
    });

    return { message: 'Bootcamp deleted successfully' };
  }

  /**
   * Publish/unpublish bootcamp
   * Phase 1: Draft/publish workflow
   */
  async togglePublish(id: string, isPublished: boolean) {
    const bootcamp = await this.prisma.bootcamp.findUnique({
      where: { id },
    });

    if (!bootcamp) {
      throw new NotFoundException('Bootcamp not found');
    }

    return this.prisma.bootcamp.update({
      where: { id },
      data: { isPublished },
    });
  }

  /**
   * Get bootcamp preview for instructors
   * Phase 1: Course preview for instructors
   */
  async preview(id: string, instructorId: string) {
    const bootcamp = await this.prisma.bootcamp.findFirst({
      where: {
        id,
        instructorId,
      },
      include: {
        instructor: true,
        cohorts: true,
        screeningQuestions: true,
      },
    });

    if (!bootcamp) {
      throw new NotFoundException('Bootcamp not found or you do not have access');
    }

    return bootcamp;
  }

  /**
   * Add screening questions
   * Phase 1: Student screening (optional quiz/interview)
   */
  async addScreeningQuestions(bootcampId: string, questions: any[]) {
    const bootcamp = await this.prisma.bootcamp.findUnique({
      where: { id: bootcampId },
    });

    if (!bootcamp) {
      throw new NotFoundException('Bootcamp not found');
    }

    const createdQuestions = await this.prisma.bootcampScreeningQuestion.createMany({
      data: questions.map((q, index) => ({
        bootcampId,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        correctAnswer: q.correctAnswer,
        isRequired: q.isRequired ?? true,
        orderIndex: index,
      })),
    });

    return createdQuestions;
  }

  /**
   * Get bootcamp statistics for instructor
   */
  async getStatistics(bootcampId: string, instructorId: string) {
    const bootcamp = await this.prisma.bootcamp.findFirst({
      where: {
        id: bootcampId,
        instructorId,
      },
    });

    if (!bootcamp) {
      throw new NotFoundException('Bootcamp not found or you do not have access');
    }

    const [
      totalApplications,
      acceptedApplications,
      totalCohorts,
      activeCohorts,
      totalEnrollments,
      completedEnrollments,
    ] = await Promise.all([
      this.prisma.bootcampApplication.count({
        where: { bootcampId },
      }),
      this.prisma.bootcampApplication.count({
        where: { bootcampId, applicationStatus: 'accepted' },
      }),
      this.prisma.cohort.count({
        where: { bootcampId },
      }),
      this.prisma.cohort.count({
        where: { bootcampId, status: 'active' },
      }),
      this.prisma.cohortEnrollment.count({
        where: { cohort: { bootcampId } },
      }),
      this.prisma.cohortEnrollment.count({
        where: {
          cohort: { bootcampId },
          enrollmentStatus: 'completed',
        },
      }),
    ]);

    return {
      applications: {
        total: totalApplications,
        accepted: acceptedApplications,
        pending: totalApplications - acceptedApplications,
      },
      cohorts: {
        total: totalCohorts,
        active: activeCohorts,
      },
      enrollments: {
        total: totalEnrollments,
        completed: completedEnrollments,
        active: totalEnrollments - completedEnrollments,
      },
    };
  }
}
