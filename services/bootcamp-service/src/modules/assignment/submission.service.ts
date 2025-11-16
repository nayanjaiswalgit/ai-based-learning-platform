import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SubmissionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Submit assignment
   * Phase 5: Submission tracking
   */
  async submit(data: {
    assignmentId: string;
    userId: string;
    submissionUrl?: string;
    submissionText?: string;
    files?: any;
  }) {
    const assignment = await this.prisma.cohortAssignment.findUnique({
      where: { id: data.assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const now = new Date();
    const isLate = now > assignment.dueDate;

    if (isLate && !assignment.allowLateSubmission) {
      throw new BadRequestException('Late submissions are not allowed for this assignment');
    }

    const submission = await this.prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_userId: {
          assignmentId: data.assignmentId,
          userId: data.userId,
        },
      },
      update: {
        submissionUrl: data.submissionUrl,
        submissionText: data.submissionText,
        files: data.files,
        submittedAt: now,
        isLate,
        status: 'submitted',
      },
      create: {
        assignmentId: data.assignmentId,
        userId: data.userId,
        submissionUrl: data.submissionUrl,
        submissionText: data.submissionText,
        files: data.files,
        isLate,
        status: 'submitted',
      },
      include: {
        assignment: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Auto-grade if enabled
    if (assignment.autoGrading && assignment.testCases) {
      await this.autoGrade(submission.id, assignment.testCases);
    }

    return submission;
  }

  /**
   * Auto-grade submission
   */
  private async autoGrade(submissionId: string, testCases: any) {
    // TODO: Implement auto-grading logic
    // This would run test cases against the submitted code
    console.log('Auto-grading submission:', submissionId);
  }

  /**
   * Grade submission
   * Phase 5: Instructor grading interface
   */
  async grade(submissionId: string, gradedBy: string, grade: number, feedback?: string) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (grade > submission.assignment.maxPoints) {
      throw new BadRequestException('Grade cannot exceed maximum points');
    }

    // Apply late penalty if applicable
    let finalGrade = grade;
    if (submission.isLate && submission.assignment.latePenaltyPercent > 0) {
      finalGrade = grade * (1 - submission.assignment.latePenaltyPercent / 100);
    }

    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        grade: finalGrade,
        feedback,
        gradedAt: new Date(),
        gradedBy,
        status: 'graded',
      },
    });
  }

  /**
   * Get user's submissions
   */
  async getUserSubmissions(userId: string, cohortId?: string) {
    const where: any = { userId };

    if (cohortId) {
      where.assignment = { cohortId };
    }

    return this.prisma.assignmentSubmission.findMany({
      where,
      include: {
        assignment: {
          include: {
            cohort: true,
          },
        },
        peerReviews: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  /**
   * Get submission details
   */
  async findOne(id: string) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id },
      include: {
        assignment: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePictureUrl: true,
          },
        },
        peerReviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                username: true,
                profilePictureUrl: true,
              },
            },
          },
        },
        grader: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
  }
}
