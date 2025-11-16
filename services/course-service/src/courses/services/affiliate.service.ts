import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { nanoid } from 'nanoid';

@Injectable()
export class AffiliateService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate affiliate link for a course
   */
  async generateAffiliateLink(courseId: string, commissionRate: number = 10) {
    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const affiliateCode = nanoid(10);

    return this.prisma.affiliateLink.create({
      data: {
        courseId,
        affiliateCode,
        commissionRate,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
    });
  }

  /**
   * Get affiliate link by code
   */
  async findByCode(code: string) {
    const link = await this.prisma.affiliateLink.findUnique({
      where: { affiliateCode: code },
      include: {
        course: true,
      },
    });

    if (!link) {
      throw new NotFoundException('Affiliate link not found');
    }

    return link;
  }

  /**
   * Track affiliate click
   */
  async trackClick(affiliateCode: string) {
    return this.prisma.affiliateLink.update({
      where: { affiliateCode },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Track affiliate conversion (when purchase is made)
   */
  async trackConversion(affiliateCode: string, purchaseAmount: number) {
    const link = await this.findByCode(affiliateCode);

    const commission = (purchaseAmount * Number(link.commissionRate)) / 100;

    return this.prisma.affiliateLink.update({
      where: { affiliateCode },
      data: {
        conversions: {
          increment: 1,
        },
        totalEarnings: {
          increment: commission,
        },
      },
    });
  }

  /**
   * Get affiliate statistics
   */
  async getAffiliateStats(affiliateCode: string) {
    const link = await this.findByCode(affiliateCode);

    const conversionRate = link.clicks > 0
      ? (link.conversions / link.clicks) * 100
      : 0;

    return {
      affiliateCode: link.affiliateCode,
      courseTitle: link.course.title,
      clicks: link.clicks,
      conversions: link.conversions,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      totalEarnings: parseFloat(Number(link.totalEarnings).toFixed(2)),
      commissionRate: parseFloat(Number(link.commissionRate).toFixed(2)),
    };
  }

  /**
   * Get all affiliate links for a course
   */
  async getCoursAffiliateLinks(courseId: string) {
    return this.prisma.affiliateLink.findMany({
      where: { courseId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
