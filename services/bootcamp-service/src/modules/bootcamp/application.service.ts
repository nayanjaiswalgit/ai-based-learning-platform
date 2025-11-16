import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ApplyBootcampDto } from './dto/apply-bootcamp.dto';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Submit bootcamp application
   * Phase 1: Application/enrollment system
   */
  async apply(userId: string, dto: ApplyBootcampDto) {
    // Check if bootcamp exists and is published
    const bootcamp = await this.prisma.bootcamp.findUnique({
      where: { id: dto.bootcampId },
      include: { screeningQuestions: true },
    });

    if (!bootcamp) {
      throw new NotFoundException('Bootcamp not found');
    }

    if (!bootcamp.isPublished) {
      throw new BadRequestException('This bootcamp is not currently accepting applications');
    }

    // Check if user already applied
    const existingApplication = await this.prisma.bootcampApplication.findUnique({
      where: {
        bootcampId_userId: {
          bootcampId: dto.bootcampId,
          userId,
        },
      },
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied to this bootcamp');
    }

    // Create application
    const application = await this.prisma.bootcampApplication.create({
      data: {
        bootcampId: dto.bootcampId,
        userId,
        motivationLetter: dto.motivationLetter,
        resumeUrl: dto.resumeUrl,
        linkedinUrl: dto.linkedinUrl,
        githubUrl: dto.githubUrl,
        portfolioUrl: dto.portfolioUrl,
        applicationStatus: 'pending',
      },
    });

    // Save screening answers if provided
    if (dto.answers && dto.answers.length > 0) {
      await this.prisma.applicationAnswer.createMany({
        data: dto.answers.map(answer => ({
          applicationId: application.id,
          questionId: answer.questionId,
          answerText: answer.answerText,
          fileUrl: answer.fileUrl,
        })),
      });

      // Auto-grade MCQ questions
      await this.autoGradeApplication(application.id);
    }

    return application;
  }

  /**
   * Auto-grade screening questions
   */
  private async autoGradeApplication(applicationId: string) {
    const application = await this.prisma.bootcampApplication.findUnique({
      where: { id: applicationId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!application) return;

    let totalScore = 0;
    let maxScore = 0;

    for (const answer of application.answers) {
      if (answer.question.questionType === 'mcq' && answer.question.correctAnswer) {
        maxScore += 1;
        if (answer.answerText === answer.question.correctAnswer) {
          totalScore += 1;
          await this.prisma.applicationAnswer.update({
            where: { id: answer.id },
            data: { isCorrect: true },
          });
        } else {
          await this.prisma.applicationAnswer.update({
            where: { id: answer.id },
            data: { isCorrect: false },
          });
        }
      }
    }

    // Update application score
    if (maxScore > 0) {
      const scorePercentage = (totalScore / maxScore) * 100;
      await this.prisma.bootcampApplication.update({
        where: { id: applicationId },
        data: { screeningScore: scorePercentage },
      });
    }
  }

  /**
   * Get all applications for a bootcamp (instructor only)
   */
  async getBootcampApplications(bootcampId: string, instructorId: string, filters?: {
    status?: string;
    search?: string;
  }) {
    // Verify instructor owns this bootcamp
    const bootcamp = await this.prisma.bootcamp.findFirst({
      where: {
        id: bootcampId,
        instructorId,
      },
    });

    if (!bootcamp) {
      throw new NotFoundException('Bootcamp not found or you do not have access');
    }

    const where: any = { bootcampId };

    if (filters?.status) {
      where.applicationStatus = filters.status;
    }

    const applications = await this.prisma.bootcampApplication.findMany({
      where,
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
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    return applications;
  }

  /**
   * Review application (accept/reject)
   * Phase 1: Student screening
   */
  async reviewApplication(
    applicationId: string,
    instructorId: string,
    decision: 'accepted' | 'rejected' | 'waitlisted',
    notes?: string,
    rejectionReason?: string,
  ) {
    const application = await this.prisma.bootcampApplication.findUnique({
      where: { id: applicationId },
      include: { bootcamp: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.bootcamp.instructorId !== instructorId) {
      throw new BadRequestException('You do not have permission to review this application');
    }

    return this.prisma.bootcampApplication.update({
      where: { id: applicationId },
      data: {
        applicationStatus: decision,
        reviewedAt: new Date(),
        reviewedBy: instructorId,
        interviewNotes: notes,
        rejectionReason,
      },
      include: {
        user: true,
        bootcamp: true,
      },
    });
  }

  /**
   * Get user's applications
   */
  async getUserApplications(userId: string) {
    return this.prisma.bootcampApplication.findMany({
      where: { userId },
      include: {
        bootcamp: {
          include: {
            instructor: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });
  }
}
