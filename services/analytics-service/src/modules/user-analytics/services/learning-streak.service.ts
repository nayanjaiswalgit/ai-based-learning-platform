import { Injectable, Logger } from '@nestjs/common'
import { prisma } from '@repo/database'
import { startOfDay, differenceInDays } from 'date-fns'

@Injectable()
export class LearningStreakService {
  private readonly logger = new Logger(LearningStreakService.name)

  async getStreak(userId: string) {
    let streak = await prisma.learningStreak.findUnique({
      where: { userId },
    })

    if (!streak) {
      // Initialize streak for new user
      streak = await prisma.learningStreak.create({
        data: {
          userId,
          currentStreakDays: 0,
          longestStreakDays: 0,
          totalActiveDays: 0,
        },
      })
    }

    return {
      currentStreakDays: streak.currentStreakDays,
      longestStreakDays: streak.longestStreakDays,
      lastActivityDate: streak.lastActivityDate,
      totalActiveDays: streak.totalActiveDays,
    }
  }

  async updateStreak(userId: string): Promise<void> {
    const today = startOfDay(new Date())

    const streak = await prisma.learningStreak.findUnique({
      where: { userId },
    })

    if (!streak) {
      await prisma.learningStreak.create({
        data: {
          userId,
          currentStreakDays: 1,
          longestStreakDays: 1,
          lastActivityDate: today,
          totalActiveDays: 1,
        },
      })
      return
    }

    if (!streak.lastActivityDate) {
      // First activity
      await prisma.learningStreak.update({
        where: { userId },
        data: {
          currentStreakDays: 1,
          longestStreakDays: 1,
          lastActivityDate: today,
          totalActiveDays: 1,
        },
      })
      return
    }

    const daysDiff = differenceInDays(today, startOfDay(streak.lastActivityDate))

    if (daysDiff === 0) {
      // Already logged activity today
      return
    } else if (daysDiff === 1) {
      // Consecutive day
      const newStreak = streak.currentStreakDays + 1
      await prisma.learningStreak.update({
        where: { userId },
        data: {
          currentStreakDays: newStreak,
          longestStreakDays: Math.max(newStreak, streak.longestStreakDays),
          lastActivityDate: today,
          totalActiveDays: streak.totalActiveDays + 1,
        },
      })
    } else {
      // Streak broken
      await prisma.learningStreak.update({
        where: { userId },
        data: {
          currentStreakDays: 1,
          lastActivityDate: today,
          totalActiveDays: streak.totalActiveDays + 1,
        },
      })
    }

    this.logger.log(`Updated streak for user ${userId}`)
  }
}
