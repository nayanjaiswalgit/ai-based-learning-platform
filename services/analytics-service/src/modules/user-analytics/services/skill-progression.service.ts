import { Injectable, Logger } from '@nestjs/common'
import { prisma } from '@repo/database'
import { subMonths } from 'date-fns'

@Injectable()
export class SkillProgressionService {
  private readonly logger = new Logger(SkillProgressionService.name)

  async getProgression(userId: string) {
    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: { proficiencyLevel: 'desc' },
    })

    // Calculate change from last month
    const lastMonth = subMonths(new Date(), 1)

    const progression = await Promise.all(
      userSkills.map(async (userSkill) => {
        // Get historical data (this would require a skill_history table in production)
        // For now, we'll calculate based on recent activity
        const recentActivity = await prisma.learningAnalytics.aggregate({
          where: {
            userId,
            analyticsDate: { gte: lastMonth },
          },
          _sum: {
            problemsSolved: true,
            lessonsCompleted: true,
          },
        })

        // Simple calculation: estimate change based on activity
        const activityScore =
          (recentActivity._sum.problemsSolved || 0) +
          (recentActivity._sum.lessonsCompleted || 0)
        const estimatedChange = Math.min(activityScore * 0.5, 10) // Max 10 points per month

        return {
          skillId: userSkill.skillId,
          skillName: userSkill.skill.name,
          proficiencyLevel: userSkill.proficiencyLevel,
          change: estimatedChange,
        }
      }),
    )

    return progression
  }

  async updateSkillLevel(userId: string, skillId: string, change: number): Promise<void> {
    await prisma.userSkill.upsert({
      where: {
        userId_skillId: { userId, skillId },
      },
      update: {
        proficiencyLevel: { increment: change },
        lastAssessedAt: new Date(),
      },
      create: {
        userId,
        skillId,
        proficiencyLevel: change,
        lastAssessedAt: new Date(),
      },
    })

    this.logger.log(`Updated skill ${skillId} for user ${userId} by ${change} points`)
  }
}
