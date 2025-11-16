import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AssignmentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create assignment
   * Phase 5: Assignment creation and distribution
   */
  async create(data: {
    cohortId: string;
    title: string;
    description: string;
    assignmentType: string;
    instructions?: string;
    resources?: any;
    maxPoints?: number;
    dueDate: Date;
    allowLateSubmission?: boolean;
    latePenaltyPercent?: number;
    peerReviewRequired?: boolean;
    minPeerReviews?: number;
    autoGrading?: boolean;
    testCases?: any;
    rubric?: any;
    createdBy: string;
  }) {
    const assignment = await this.prisma.cohortAssignment.create({
      data: {
        cohortId: data.cohortId,
        title: data.title,
        description: data.description,
        assignmentType: data.assignmentType,
        instructions: data.instructions,
        resources: data.resources,
        maxPoints: data.maxPoints || 100,
        dueDate: data.dueDate,
        allowLateSubmission: data.allowLateSubmission ?? false,
        latePenaltyPercent: data.latePenaltyPercent || 20,
        peerReviewRequired: data.peerReviewRequired ?? false,
        minPeerReviews: data.minPeerReviews || 2,
        autoGrading: data.autoGrading ?? false,
        testCases: data.testCases,
        rubric: data.rubric,
        createdBy: data.createdBy,
      },
      include: {
        cohort: true,
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // TODO: Notify all students in cohort

    return assignment;
  }

  /**
   * Get assignments for a cohort
   */
  async findAllByCohort(cohortId: string, filters?: {
    upcoming?: boolean;
    overdue?: boolean;
  }) {
    const where: any = { cohortId };
    const now = new Date();

    if (filters?.upcoming) {
      where.dueDate = { gte: now };
    } else if (filters?.overdue) {
      where.dueDate = { lt: now };
    }

    return this.prisma.cohortAssignment.findMany({
      where,
      include: {
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  /**
   * Get assignment details
   */
  async findOne(id: string) {
    const assignment = await this.prisma.cohortAssignment.findUnique({
      where: { id },
      include: {
        cohort: {
          include: {
            enrollments: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        submissions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                profilePictureUrl: true,
              },
            },
            peerReviews: true,
          },
          orderBy: {
            submittedAt: 'desc',
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return assignment;
  }

  /**
   * Update assignment
   */
  async update(id: string, data: any) {
    return this.prisma.cohortAssignment.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete assignment
   */
  async delete(id: string) {
    await this.prisma.cohortAssignment.delete({
      where: { id },
    });

    return { message: 'Assignment deleted successfully' };
  }

  /**
   * Get assignment statistics
   * Phase 5: Instructor grading interface
   */
  async getStatistics(assignmentId: string) {
    const assignment = await this.findOne(assignmentId);

    const totalStudents = assignment.cohort.enrollments.filter(
      e => e.enrollmentStatus === 'active',
    ).length;

    const submissions = assignment.submissions;
    const submittedCount = submissions.filter(s => s.status !== 'draft').length;
    const gradedCount = submissions.filter(s => s.status === 'graded').length;
    const averageGrade = submissions.filter(s => s.grade).reduce((sum, s) => sum + (s.grade || 0), 0) / gradedCount || 0;

    return {
      totalStudents,
      submitted: submittedCount,
      pending: totalStudents - submittedCount,
      graded: gradedCount,
      averageGrade: Math.round(averageGrade * 100) / 100,
      submissionRate: totalStudents > 0 ? (submittedCount / totalStudents) * 100 : 0,
    };
  }
}
