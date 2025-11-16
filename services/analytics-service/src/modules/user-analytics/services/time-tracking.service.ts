import { Injectable, Logger } from '@nestjs/common'
import { prisma } from '@repo/database'
import { subDays, subWeeks, subMonths, startOfDay } from 'date-fns'

@Injectable()
export class TimeTrackingService {
  private readonly logger = new Logger(TimeTrackingService.name)

  async getTimeSpent(userId: string, period?: 'daily' | 'weekly' | 'monthly') {
    const now = new Date()
    const dayAgo = subDays(now, 1)
    const weekAgo = subWeeks(now, 1)
    const monthAgo = subMonths(now, 1)

    const [dailyProgress, weeklyProgress, monthlyProgress, totalProgress] = await Promise.all([
      // Daily
      prisma.userProgress.aggregate({
        where: {
          userId,
          lastAccessedAt: { gte: dayAgo },
        },
        _sum: { timeSpentMinutes: true },
      }),
      // Weekly
      prisma.userProgress.aggregate({
        where: {
          userId,
          lastAccessedAt: { gte: weekAgo },
        },
        _sum: { timeSpentMinutes: true },
      }),
      // Monthly
      prisma.userProgress.aggregate({
        where: {
          userId,
          lastAccessedAt: { gte: monthAgo },
        },
        _sum: { timeSpentMinutes: true },
      }),
      // Total
      prisma.userProgress.aggregate({
        where: { userId },
        _sum: { timeSpentMinutes: true },
      }),
    ])

    return {
      daily: dailyProgress._sum.timeSpentMinutes || 0,
      weekly: weeklyProgress._sum.timeSpentMinutes || 0,
      monthly: monthlyProgress._sum.timeSpentMinutes || 0,
      total: totalProgress._sum.timeSpentMinutes || 0,
    }
  }

  async trackTime(userId: string, resourceType: string, resourceId: string, minutes: number) {
    await prisma.userProgress.upsert({
      where: {
        userId_resourceType_resourceId: {
          userId,
          resourceType,
          resourceId,
        },
      },
      update: {
        timeSpentMinutes: { increment: minutes },
        lastAccessedAt: new Date(),
      },
      create: {
        userId,
        resourceType,
        resourceId,
        timeSpentMinutes: minutes,
        lastAccessedAt: new Date(),
      },
    })

    // Also update daily analytics
    const today = startOfDay(new Date())
    await prisma.learningAnalytics.upsert({
      where: {
        userId_analyticsDate: {
          userId,
          analyticsDate: today,
        },
      },
      update: {
        timeSpentMinutes: { increment: minutes },
      },
      create: {
        userId,
        analyticsDate: today,
        timeSpentMinutes: minutes,
      },
    })

    this.logger.log(`Tracked ${minutes} minutes for user ${userId}`)
  }
}
