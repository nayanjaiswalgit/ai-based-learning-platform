import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CohortService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new cohort for a bootcamp
   * Phase 2: Cohort creation (start/end dates)
   */
  async create(data: {
    bootcampId: string;
    name: string;
    startDate: Date;
    endDate: Date;
    maxEnrollment?: number;
    scheduleDetails?: any;
  }) {
    const bootcamp = await this.prisma.bootcamp.findUnique({
      where: { id: data.bootcampId },
    });

    if (!bootcamp) {
      throw new NotFoundException('Bootcamp not found');
    }

    const cohort = await this.prisma.cohort.create({
      data: {
        bootcampId: data.bootcampId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        maxEnrollment: data.maxEnrollment || bootcamp.maxStudentsPerCohort || 30,
        scheduleDetails: data.scheduleDetails,
        status: 'upcoming',
      },
      include: {
        bootcamp: {
          include: {
            instructor: true,
          },
        },
      },
    });

    return cohort;
  }

  /**
   * Get all cohorts for a bootcamp
   */
  async findAllByBootcamp(bootcampId: string, filters?: {
    status?: string;
  }) {
    const where: any = { bootcampId };

    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.cohort.findMany({
      where,
      include: {
        bootcamp: true,
        _count: {
          select: {
            enrollments: true,
            mentors: true,
            sessions: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  /**
   * Get cohort details
   * Phase 2: Cohort-specific dashboards
   */
  async findOne(id: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id },
      include: {
        bootcamp: {
          include: {
            instructor: true,
          },
        },
        enrollments: {
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
          },
          orderBy: {
            enrolledAt: 'asc',
          },
        },
        mentors: {
          include: {
            mentor: {
              select: {
                id: true,
                username: true,
                email: true,
                profilePictureUrl: true,
                profile: true,
              },
            },
          },
        },
        sessions: {
          orderBy: {
            sessionDate: 'asc',
          },
          take: 10,
        },
        _count: {
          select: {
            enrollments: true,
            mentors: true,
            sessions: true,
            assignments: true,
          },
        },
      },
    });

    if (!cohort) {
      throw new NotFoundException('Cohort not found');
    }

    return cohort;
  }

  /**
   * Update cohort
   */
  async update(id: string, data: Partial<{
    name: string;
    startDate: Date;
    endDate: Date;
    status: string;
    maxEnrollment: number;
    scheduleDetails: any;
  }>) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id },
    });

    if (!cohort) {
      throw new NotFoundException('Cohort not found');
    }

    return this.prisma.cohort.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete cohort
   */
  async delete(id: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id },
      include: {
        enrollments: true,
      },
    });

    if (!cohort) {
      throw new NotFoundException('Cohort not found');
    }

    if (cohort.status === 'active') {
      throw new BadRequestException('Cannot delete an active cohort');
    }

    if (cohort.enrollments.length > 0) {
      throw new BadRequestException('Cannot delete cohort with enrollments');
    }

    await this.prisma.cohort.delete({ where: { id } });

    return { message: 'Cohort deleted successfully' };
  }

  /**
   * Enroll student in cohort
   * Phase 2: Student roster management
   */
  async enrollStudent(cohortId: string, userId: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      include: {
        enrollments: true,
      },
    });

    if (!cohort) {
      throw new NotFoundException('Cohort not found');
    }

    if (cohort.currentEnrollment >= cohort.maxEnrollment) {
      throw new BadRequestException('Cohort is full');
    }

    // Check if already enrolled
    const existing = await this.prisma.cohortEnrollment.findUnique({
      where: {
        cohortId_userId: {
          cohortId,
          userId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Student is already enrolled in this cohort');
    }

    const enrollment = await this.prisma.cohortEnrollment.create({
      data: {
        cohortId,
        userId,
        enrollmentStatus: 'active',
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
        cohort: {
          include: {
            bootcamp: true,
          },
        },
      },
    });

    return enrollment;
  }

  /**
   * Assign mentor to cohort
   * Phase 2: Mentor assignment to cohorts
   */
  async assignMentor(cohortId: string, mentorId: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
    });

    if (!cohort) {
      throw new NotFoundException('Cohort not found');
    }

    // Verify mentor exists and has mentor role
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }

    if (mentor.role !== 'mentor' && mentor.role !== 'instructor') {
      throw new BadRequestException('User is not a mentor');
    }

    // Check if already assigned
    const existing = await this.prisma.cohortMentor.findUnique({
      where: {
        cohortId_mentorId: {
          cohortId,
          mentorId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Mentor is already assigned to this cohort');
    }

    return this.prisma.cohortMentor.create({
      data: {
        cohortId,
        mentorId,
      },
      include: {
        mentor: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePictureUrl: true,
            profile: true,
          },
        },
      },
    });
  }

  /**
   * Remove mentor from cohort
   */
  async removeMentor(cohortId: string, mentorId: string) {
    const assignment = await this.prisma.cohortMentor.findUnique({
      where: {
        cohortId_mentorId: {
          cohortId,
          mentorId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Mentor assignment not found');
    }

    await this.prisma.cohortMentor.delete({
      where: {
        cohortId_mentorId: {
          cohortId,
          mentorId,
        },
      },
    });

    return { message: 'Mentor removed from cohort' };
  }

  /**
   * Get cohort roster
   * Phase 2: Student roster management
   */
  async getRoster(cohortId: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
    });

    if (!cohort) {
      throw new NotFoundException('Cohort not found');
    }

    const enrollments = await this.prisma.cohortEnrollment.findMany({
      where: { cohortId },
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
      },
      orderBy: {
        enrolledAt: 'asc',
      },
    });

    return enrollments;
  }

  /**
   * Get cohort dashboard data
   * Phase 2: Cohort-specific dashboards
   */
  async getDashboard(cohortId: string) {
    const cohort = await this.findOne(cohortId);

    const [
      upcomingSessions,
      recentAssignments,
      activeStudents,
      completionRate,
    ] = await Promise.all([
      this.prisma.cohortSession.findMany({
        where: {
          cohortId,
          sessionDate: { gte: new Date() },
        },
        orderBy: { sessionDate: 'asc' },
        take: 5,
      }),
      this.prisma.cohortAssignment.findMany({
        where: { cohortId },
        orderBy: { dueDate: 'desc' },
        take: 5,
        include: {
          _count: {
            select: {
              submissions: true,
            },
          },
        },
      }),
      this.prisma.cohortEnrollment.count({
        where: {
          cohortId,
          enrollmentStatus: 'active',
        },
      }),
      this.getCompletionRate(cohortId),
    ]);

    return {
      cohort,
      upcomingSessions,
      recentAssignments,
      stats: {
        activeStudents,
        totalStudents: cohort.currentEnrollment,
        completionRate,
        totalSessions: cohort._count.sessions,
        totalAssignments: cohort._count.assignments,
      },
    };
  }

  /**
   * Calculate cohort completion rate
   */
  private async getCompletionRate(cohortId: string) {
    const [total, completed] = await Promise.all([
      this.prisma.cohortEnrollment.count({
        where: { cohortId },
      }),
      this.prisma.cohortEnrollment.count({
        where: {
          cohortId,
          enrollmentStatus: 'completed',
        },
      }),
    ]);

    return total > 0 ? (completed / total) * 100 : 0;
  }

  /**
   * Send message to cohort chat
   * Phase 2: Cohort chat/discussion channels
   */
  async sendMessage(cohortId: string, senderId: string, messageText: string, attachments?: any[]) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
    });

    if (!cohort) {
      throw new NotFoundException('Cohort not found');
    }

    return this.prisma.cohortMessage.create({
      data: {
        cohortId,
        senderId,
        messageText,
        attachments,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profilePictureUrl: true,
          },
        },
      },
    });
  }

  /**
   * Get cohort messages
   * Phase 2: Cohort chat/discussion channels
   */
  async getMessages(cohortId: string, limit: number = 50, offset: number = 0) {
    return this.prisma.cohortMessage.findMany({
      where: {
        cohortId,
        deletedAt: null,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profilePictureUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  }
}
