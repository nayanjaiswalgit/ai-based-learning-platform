import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RevenueShareService {
  private readonly DEFAULT_INSTRUCTOR_SHARE = 70; // 70% to instructor, 30% to platform

  constructor(private prisma: PrismaService) {}

  /**
   * Record a course sale and calculate revenue share
   */
  async recordCourseSale(instructorId: string, courseId: string, saleAmount: number) {
    const instructorSharePercentage = this.DEFAULT_INSTRUCTOR_SHARE;
    const instructorShare = (saleAmount * instructorSharePercentage) / 100;
    const platformShare = saleAmount - instructorShare;

    // Upsert revenue share record
    const revenueShare = await this.prisma.revenueShare.upsert({
      where: {
        instructorId_courseId: {
          instructorId,
          courseId,
        },
      },
      create: {
        instructorId,
        courseId,
        totalRevenue: saleAmount,
        instructorShare,
        platformShare,
        sharePercentage: instructorSharePercentage,
      },
      update: {
        totalRevenue: {
          increment: saleAmount,
        },
        instructorShare: {
          increment: instructorShare,
        },
        platformShare: {
          increment: platformShare,
        },
      },
    });

    return revenueShare;
  }

  /**
   * Get revenue share details for an instructor and course
   */
  async getRevenueShare(instructorId: string, courseId: string) {
    return this.prisma.revenueShare.findUnique({
      where: {
        instructorId_courseId: {
          instructorId,
          courseId,
        },
      },
    });
  }

  /**
   * Get all revenue shares for an instructor
   */
  async getInstructorRevenue(instructorId: string) {
    const revenueShares = await this.prisma.revenueShare.findMany({
      where: { instructorId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const totalRevenue = revenueShares.reduce((sum, r) => sum + Number(r.totalRevenue), 0);
    const totalInstructorShare = revenueShares.reduce((sum, r) => sum + Number(r.instructorShare), 0);
    const pendingPayout = revenueShares
      .filter((r) => r.payoutStatus === 'pending')
      .reduce((sum, r) => sum + Number(r.instructorShare), 0);

    return {
      instructorId,
      courses: revenueShares.map((r) => ({
        courseId: r.courseId,
        courseTitle: r.course.title,
        totalRevenue: parseFloat(Number(r.totalRevenue).toFixed(2)),
        instructorShare: parseFloat(Number(r.instructorShare).toFixed(2)),
        platformShare: parseFloat(Number(r.platformShare).toFixed(2)),
        payoutStatus: r.payoutStatus,
      })),
      summary: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalInstructorShare: parseFloat(totalInstructorShare.toFixed(2)),
        pendingPayout: parseFloat(pendingPayout.toFixed(2)),
      },
    };
  }

  /**
   * Process payout for an instructor
   */
  async processPayout(instructorId: string, courseId?: string) {
    const where: any = {
      instructorId,
      payoutStatus: 'pending',
    };

    if (courseId) {
      where.courseId = courseId;
    }

    const updated = await this.prisma.revenueShare.updateMany({
      where,
      data: {
        payoutStatus: 'paid',
        lastPayoutAt: new Date(),
      },
    });

    return {
      message: 'Payout processed successfully',
      recordsUpdated: updated.count,
    };
  }
}
