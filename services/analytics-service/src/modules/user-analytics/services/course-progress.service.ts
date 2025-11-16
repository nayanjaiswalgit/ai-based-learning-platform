import { Injectable, Logger } from '@nestjs/common'
import { prisma } from '@repo/database'

@Injectable()
export class CourseProgressService {
  private readonly logger = new Logger(CourseProgressService.name)

  async getProgress(userId: string) {
    const [completed, inProgress] = await Promise.all([
      prisma.courseEnrollment.count({
        where: {
          userId,
          completedAt: { not: null },
        },
      }),
      prisma.courseEnrollment.count({
        where: {
          userId,
          completedAt: null,
          progressPercentage: { gt: 0 },
        },
      }),
    ])

    // Get detailed course progress
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: { lastAccessedAt: 'desc' },
      take: 10,
    })

    return {
      completed,
      inProgress,
      recentCourses: enrollments.map((e) => ({
        courseId: e.courseId,
        courseTitle: e.course.title,
        courseThumbnail: e.course.thumbnailUrl,
        progress: Number(e.progressPercentage),
        lastAccessed: e.lastAccessedAt,
        completedAt: e.completedAt,
      })),
    }
  }

  async updateProgress(
    userId: string,
    courseId: string,
    progressPercentage: number,
  ): Promise<void> {
    const isCompleted = progressPercentage >= 100

    await prisma.courseEnrollment.update({
      where: {
        userId_courseId: { userId, courseId },
      },
      data: {
        progressPercentage,
        lastAccessedAt: new Date(),
        ...(isCompleted && { completedAt: new Date() }),
      },
    })

    if (isCompleted) {
      // Update daily analytics
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      await prisma.learningAnalytics.upsert({
        where: {
          userId_analyticsDate: {
            userId,
            analyticsDate: today,
          },
        },
        update: {
          coursesCompleted: { increment: 1 },
        },
        create: {
          userId,
          analyticsDate: today,
          coursesCompleted: 1,
        },
      })

      this.logger.log(`User ${userId} completed course ${courseId}`)
    }
  }
}
