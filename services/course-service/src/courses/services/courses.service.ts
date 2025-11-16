import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import slugify from 'slugify';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new course
   */
  async create(createCourseDto: CreateCourseDto) {
    const slug = slugify(createCourseDto.title, { lower: true, strict: true });

    // Check if slug already exists
    const existingCourse = await this.prisma.course.findUnique({
      where: { slug },
    });

    if (existingCourse) {
      throw new BadRequestException('A course with this title already exists');
    }

    const { skillIds, ...courseData } = createCourseDto;

    // Create course with skills
    const course = await this.prisma.course.create({
      data: {
        ...courseData,
        slug,
        ...(skillIds && {
          skills: {
            create: skillIds.map((skillId) => ({
              skillId,
            })),
          },
        }),
      },
      include: {
        instructor: {
          select: {
            id: true,
            email: true,
            username: true,
            profilePictureUrl: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    return course;
  }

  /**
   * Get all courses with filters and pagination
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
    instructorId?: string;
    difficulty?: string;
    isFree?: boolean;
    isPublished?: boolean;
  }) {
    const { skip = 0, take = 10, search, instructorId, difficulty, isFree, isPublished = true } = params;

    const where: any = {
      isPublished,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (instructorId) {
      where.instructorId = instructorId;
    }

    if (difficulty) {
      where.difficultyLevel = difficulty;
    }

    if (isFree !== undefined) {
      where.isFree = isFree;
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take,
        include: {
          instructor: {
            select: {
              id: true,
              username: true,
              profilePictureUrl: true,
            },
          },
          skills: {
            include: {
              skill: true,
            },
          },
          _count: {
            select: {
              modules: true,
              enrollments: true,
              reviews: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      data: courses,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Get a single course by ID or slug
   */
  async findOne(identifier: string) {
    const course = await this.prisma.course.findFirst({
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
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                contentType: true,
                durationMinutes: true,
                orderIndex: true,
                isFreePreview: true,
              },
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  /**
   * Update a course
   */
  async update(id: string, updateCourseDto: UpdateCourseDto) {
    // Check if course exists
    await this.findOne(id);

    const { skillIds, ...courseData } = updateCourseDto;

    // If title is updated, regenerate slug
    if (updateCourseDto.title) {
      const slug = slugify(updateCourseDto.title, { lower: true, strict: true });
      courseData['slug'] = slug;
    }

    const updateData: any = { ...courseData };

    // Update skills if provided
    if (skillIds) {
      // Delete existing skills and create new ones
      updateData.skills = {
        deleteMany: {},
        create: skillIds.map((skillId) => ({
          skillId,
        })),
      };
    }

    const course = await this.prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        instructor: {
          select: {
            id: true,
            username: true,
            profilePictureUrl: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    return course;
  }

  /**
   * Publish/unpublish a course
   */
  async togglePublish(id: string, isPublished: boolean) {
    const course = await this.findOne(id);

    // Validation: ensure course has at least one module before publishing
    if (isPublished) {
      const modulesCount = await this.prisma.courseModule.count({
        where: { courseId: id },
      });

      if (modulesCount === 0) {
        throw new BadRequestException('Course must have at least one module before publishing');
      }
    }

    return this.prisma.course.update({
      where: { id },
      data: { isPublished },
    });
  }

  /**
   * Delete a course
   */
  async remove(id: string) {
    await this.findOne(id);

    // Check if course has enrollments
    const enrollmentCount = await this.prisma.courseEnrollment.count({
      where: { courseId: id },
    });

    if (enrollmentCount > 0) {
      throw new BadRequestException('Cannot delete course with active enrollments');
    }

    await this.prisma.course.delete({
      where: { id },
    });

    return { message: 'Course deleted successfully' };
  }

  /**
   * Get course analytics for instructor
   */
  async getCourseAnalytics(courseId: string) {
    const course = await this.findOne(courseId);

    const [enrollments, completions, reviews, avgWatchTime] = await Promise.all([
      this.prisma.courseEnrollment.count({
        where: { courseId },
      }),
      this.prisma.courseEnrollment.count({
        where: {
          courseId,
          completedAt: { not: null },
        },
      }),
      this.prisma.courseReview.findMany({
        where: { courseId },
        select: {
          rating: true,
        },
      }),
      this.getAverageWatchTime(courseId),
    ]);

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    const completionRate = enrollments > 0 ? (completions / enrollments) * 100 : 0;

    return {
      courseId,
      courseTitle: course.title,
      totalEnrollments: enrollments,
      activeEnrollments: enrollments - completions,
      completions,
      completionRate: parseFloat(completionRate.toFixed(2)),
      averageRating: parseFloat(avgRating.toFixed(2)),
      totalReviews: reviews.length,
      avgWatchTimeMinutes: avgWatchTime,
    };
  }

  /**
   * Calculate average watch time for a course
   */
  private async getAverageWatchTime(courseId: string): Promise<number> {
    const result = await this.prisma.userProgress.aggregate({
      where: {
        resourceType: 'course',
        resourceId: courseId,
      },
      _avg: {
        timeSpentMinutes: true,
      },
    });

    return result._avg.timeSpentMinutes || 0;
  }
}
