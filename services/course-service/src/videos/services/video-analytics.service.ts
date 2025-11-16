import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class VideoAnalyticsService {
  private readonly logger = new Logger(VideoAnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Track video view
   */
  async trackView(lessonId: string, userId: string, watchTimeSeconds: number) {
    // Update or create analytics record
    const analytics = await this.prisma.videoAnalytics.upsert({
      where: { lessonId },
      create: {
        lessonId,
        totalViews: 1,
        totalWatchTimeSeconds: BigInt(watchTimeSeconds),
      },
      update: {
        totalViews: { increment: 1 },
        totalWatchTimeSeconds: { increment: BigInt(watchTimeSeconds) },
      },
    });

    return analytics;
  }

  /**
   * Track drop-off points
   */
  async trackDropOff(lessonId: string, timestampPercentage: number) {
    const analytics = await this.prisma.videoAnalytics.findUnique({
      where: { lessonId },
    });

    if (!analytics) {
      return;
    }

    const dropOffPoints = (analytics.dropOffPoints as any) || {};
    const key = Math.floor(timestampPercentage).toString();
    dropOffPoints[key] = (dropOffPoints[key] || 0) + 1;

    await this.prisma.videoAnalytics.update({
      where: { lessonId },
      data: {
        dropOffPoints,
      },
    });
  }

  /**
   * Calculate completion rate
   */
  async calculateCompletionRate(lessonId: string) {
    const [watchProgresses, analytics] = await Promise.all([
      this.prisma.watchProgress.findMany({
        where: { lessonId },
      }),
      this.prisma.videoAnalytics.findUnique({
        where: { lessonId },
      }),
    ]);

    if (!analytics || watchProgresses.length === 0) {
      return 0;
    }

    const completed = watchProgresses.filter((p) => p.completed).length;
    const completionRate = (completed / watchProgresses.length) * 100;

    await this.prisma.videoAnalytics.update({
      where: { lessonId },
      data: {
        completionRate,
        averageWatchPercentage: this.calculateAverageWatchPercentage(watchProgresses),
      },
    });

    return completionRate;
  }

  /**
   * Calculate average watch percentage
   */
  private calculateAverageWatchPercentage(watchProgresses: any[]): number {
    if (watchProgresses.length === 0) return 0;

    const totalPercentage = watchProgresses.reduce((sum, progress) => {
      const percentage = (progress.currentTimeSeconds / progress.totalTimeSeconds) * 100;
      return sum + percentage;
    }, 0);

    return totalPercentage / watchProgresses.length;
  }

  /**
   * Get analytics for a lesson
   */
  async getLessonAnalytics(lessonId: string) {
    const analytics = await this.prisma.videoAnalytics.findUnique({
      where: { lessonId },
    });

    if (!analytics) {
      return {
        lessonId,
        totalViews: 0,
        avgWatchTime: 0,
        completionRate: 0,
        dropOffPoints: {},
      };
    }

    const avgWatchTime = analytics.totalViews > 0
      ? Number(analytics.totalWatchTimeSeconds) / analytics.totalViews
      : 0;

    return {
      lessonId,
      totalViews: analytics.totalViews,
      avgWatchTimeSeconds: Math.round(avgWatchTime),
      completionRate: parseFloat(Number(analytics.completionRate).toFixed(2)),
      averageWatchPercentage: parseFloat(Number(analytics.averageWatchPercentage).toFixed(2)),
      dropOffPoints: analytics.dropOffPoints,
      updatedAt: analytics.updatedAt,
    };
  }

  /**
   * Get analytics for all lessons in a course
   */
  async getCourseVideoAnalytics(courseId: string) {
    const lessons = await this.prisma.lesson.findMany({
      where: {
        module: {
          courseId,
        },
        contentType: 'video',
      },
      include: {
        videoAnalytics: true,
        module: {
          select: {
            title: true,
          },
        },
      },
    });

    return lessons.map((lesson) => ({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      moduleTitle: lesson.module.title,
      totalViews: lesson.videoAnalytics?.totalViews || 0,
      completionRate: lesson.videoAnalytics ? Number(lesson.videoAnalytics.completionRate) : 0,
      avgWatchPercentage: lesson.videoAnalytics ? Number(lesson.videoAnalytics.averageWatchPercentage) : 0,
    }));
  }
}
