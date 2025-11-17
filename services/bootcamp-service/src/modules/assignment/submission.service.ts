import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SubmissionService {
  constructor(
    private prisma: PrismaService,
    @Inject('CODE_RUNNER_SERVICE') private readonly codeRunnerClient: HttpService,
  ) {}

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
    if (assignment.autoGrading) {
      try {
        const grade = await this.autoGrade(submission, assignment);
        if (grade > 0) {
          await this.prisma.assignmentSubmission.update({
            where: { id: submission.id },
            data: {
              grade,
              status: 'graded',
              gradedAt: new Date(),
            },
          });
        }
      } catch (error) {
        console.error('Auto-grading failed:', error);
      }
    }

    return submission;
  }

  /**
   * Auto-grade submission based on assignment type
   */
  private async autoGrade(submission: any, assignment: any): Promise<number> {
    if (assignment.type === 'MULTIPLE_CHOICE' || assignment.type === 'QUIZ') {
      return this.gradeQuizSubmission(submission, assignment);
    } else if (assignment.type === 'CODING') {
      return this.gradeCodingSubmission(submission, assignment);
    }
    // For essays, projects, etc., auto-grading not applicable
    return 0;
  }

  /**
   * Grade quiz/multiple choice submissions
   */
  private gradeQuizSubmission(submission: any, assignment: any): number {
    let correctAnswers = 0;
    const totalQuestions = assignment.questions?.length || 0;

    if (totalQuestions === 0) {
      return 0;
    }

    const submissionAnswers = submission.submissionText
      ? JSON.parse(submission.submissionText)
      : submission.answers || [];

    submissionAnswers.forEach((answer: any) => {
      const question = assignment.questions.find((q: any) => q.id === answer.questionId);
      if (question && answer.selectedOption === question.correctOption) {
        correctAnswers++;
      }
    });

    return (correctAnswers / totalQuestions) * assignment.maxPoints;
  }

  /**
   * Grade coding submissions by running test cases
   */
  private async gradeCodingSubmission(submission: any, assignment: any): Promise<number> {
    try {
      // Extract code from submission
      const code = submission.submissionText || submission.code;
      const language = assignment.language || 'javascript';
      const testCases = assignment.testCases || [];

      if (!code || testCases.length === 0) {
        return 0;
      }

      // Call code runner service to execute test cases
      const result = await this.codeRunnerClient.axiosRef.post('/execute', {
        code,
        language,
        testCases,
      });

      const passedTests = result.data.results.filter((r: any) => r.passed).length;
      const totalTests = result.data.results.length;

      return (passedTests / totalTests) * assignment.maxPoints;
    } catch (error) {
      console.error('Coding submission grading failed:', error);
      return 0;
    }
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
