import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PeerReviewService {
  constructor(private prisma: PrismaService) {}

  /**
   * Assign peer reviews
   * Phase 5: Peer review system
   */
  async assignPeerReviews(assignmentId: string) {
    const assignment = await this.prisma.cohortAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        submissions: {
          where: { status: 'submitted' },
          include: { user: true },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (!assignment.peerReviewRequired) {
      throw new BadRequestException('Peer review is not required for this assignment');
    }

    const submissions = assignment.submissions;
    const minReviews = assignment.minPeerReviews;

    // Simple round-robin assignment
    const assignments: any[] = [];

    for (let i = 0; i < submissions.length; i++) {
      for (let j = 1; j <= minReviews; j++) {
        const reviewerIndex = (i + j) % submissions.length;
        const submission = submissions[i];
        const reviewer = submissions[reviewerIndex];

        if (submission.userId !== reviewer.userId) {
          assignments.push({
            submissionId: submission.id,
            reviewerId: reviewer.userId,
          });
        }
      }
    }

    // Create peer review records (placeholder)
    // TODO: Create actual peer review assignment records

    return {
      message: `Assigned ${assignments.length} peer reviews`,
      assignments,
    };
  }

  /**
   * Submit peer review
   */
  async submitReview(data: {
    submissionId: string;
    reviewerId: string;
    rating: number;
    feedback: string;
    rubricScores?: any;
  }) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: data.submissionId },
      include: { assignment: true },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.userId === data.reviewerId) {
      throw new BadRequestException('Cannot review your own submission');
    }

    return this.prisma.peerReview.upsert({
      where: {
        submissionId_reviewerId: {
          submissionId: data.submissionId,
          reviewerId: data.reviewerId,
        },
      },
      update: {
        rating: data.rating,
        feedback: data.feedback,
        rubricScores: data.rubricScores,
        reviewedAt: new Date(),
      },
      create: {
        submissionId: data.submissionId,
        reviewerId: data.reviewerId,
        rating: data.rating,
        feedback: data.feedback,
        rubricScores: data.rubricScores,
      },
      include: {
        reviewer: {
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
   * Get peer reviews for a submission
   */
  async getReviews(submissionId: string) {
    return this.prisma.peerReview.findMany({
      where: { submissionId },
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
            profilePictureUrl: true,
          },
        },
      },
      orderBy: {
        reviewedAt: 'desc',
      },
    });
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string, isHelpful: boolean) {
    return this.prisma.peerReview.update({
      where: { id: reviewId },
      data: { isHelpful },
    });
  }
}
