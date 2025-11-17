import { Injectable, Logger } from '@nestjs/common'
import { prisma } from '@repo/database'

interface Achievement {
  type: string
  title: string
  description: string
  badgeIconUrl?: string
  checkCondition: (userId: string) => Promise<boolean>
}

@Injectable()
export class AchievementService {
  private readonly logger = new Logger(AchievementService.name)

  private achievements: Achievement[] = [
    {
      type: '7_day_streak',
      title: '7-Day Streak',
      description: 'Learn for 7 days straight',
      badgeIconUrl: '/badges/7-day-streak.png',
      checkCondition: async (userId) => {
        const streak = await prisma.learningStreak.findUnique({
          where: { userId },
        })
        return (streak?.currentStreakDays || 0) >= 7
      },
    },
    {
      type: '30_day_streak',
      title: '30-Day Streak',
      description: 'Learn for 30 days straight',
      badgeIconUrl: '/badges/30-day-streak.png',
      checkCondition: async (userId) => {
        const streak = await prisma.learningStreak.findUnique({
          where: { userId },
        })
        return (streak?.currentStreakDays || 0) >= 30
      },
    },
    {
      type: '100_problems_solved',
      title: '100 Problems Solved',
      description: 'Complete 100 coding problems',
      badgeIconUrl: '/badges/100-problems.png',
      checkCondition: async (userId) => {
        const count = await prisma.userSubmission.count({
          where: {
            userId,
            status: 'accepted',
          },
          distinct: ['questionId'],
        })
        return count >= 100
      },
    },
    {
      type: 'course_completionist',
      title: 'Course Completionist',
      description: 'Finish your first course',
      badgeIconUrl: '/badges/course-complete.png',
      checkCondition: async (userId) => {
        const count = await prisma.courseEnrollment.count({
          where: {
            userId,
            completedAt: { not: null },
          },
        })
        return count >= 1
      },
    },
    {
      type: '5_courses_completed',
      title: '5 Courses Completed',
      description: 'Complete 5 courses',
      badgeIconUrl: '/badges/5-courses.png',
      checkCondition: async (userId) => {
        const count = await prisma.courseEnrollment.count({
          where: {
            userId,
            completedAt: { not: null },
          },
        })
        return count >= 5
      },
    },
    {
      type: 'early_bird',
      title: 'Early Bird',
      description: 'Study before 6 AM',
      badgeIconUrl: '/badges/early-bird.png',
      checkCondition: async (userId) => {
        const analytics = await prisma.learningAnalytics.findFirst({
          where: { userId },
        })
        // This would require timestamp tracking of actual study sessions
        // For now, return false as placeholder
        return false
      },
    },
    {
      type: 'night_owl',
      title: 'Night Owl',
      description: 'Study after midnight',
      badgeIconUrl: '/badges/night-owl.png',
      checkCondition: async (userId) => {
        // This would require timestamp tracking of actual study sessions
        return false
      },
    },
  ]

  async getAchievements(userId: string) {
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    })

    return userAchievements.map((a: any) => ({
      id: a.id,
      title: a.achievementTitle,
      description: a.achievementDescription || '',
      badgeIconUrl: a.badgeIconUrl,
      earnedAt: a.earnedAt,
    }))
  }

  async checkAndAwardAchievements(userId: string): Promise<void> {
    const existingAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementType: true },
    })

    const existingTypes = new Set(existingAchievements.map((a: any) => a.achievementType))

    for (const achievement of this.achievements) {
      if (existingTypes.has(achievement.type)) {
        continue // Already earned
      }

      const earned = await achievement.checkCondition(userId)

      if (earned) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementType: achievement.type,
            achievementTitle: achievement.title,
            achievementDescription: achievement.description,
            badgeIconUrl: achievement.badgeIconUrl,
          },
        })

        this.logger.log(`Awarded achievement ${achievement.type} to user ${userId}`)
      }
    }
  }
}
