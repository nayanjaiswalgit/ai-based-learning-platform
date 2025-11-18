import { Injectable, Logger } from '@nestjs/common'
import { prisma } from '@repo/database'

@Injectable()
export class ProblemSolvingService {
  private readonly logger = new Logger(ProblemSolvingService.name)

  async getProblemStats(userId: string) {
    // Get total solved problems
    const solvedSubmissions = await prisma.userSubmission.findMany({
      where: {
        userId,
        status: 'accepted',
      },
      distinct: ['questionId'],
      include: {
        question: {
          select: {
            id: true,
            difficulty: true,
            topics: true,
          },
        },
      },
    })

    const total = solvedSubmissions.length

    // Group by difficulty
    const byDifficulty = {
      easy: 0,
      medium: 0,
      hard: 0,
    }

    const byTopic: Record<string, number> = {}

    for (const submission of solvedSubmissions) {
      const difficulty = submission.question.difficulty?.toLowerCase()
      if (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard') {
        (byDifficulty as any)[difficulty]++
      }

      // Count topics
      const topics = submission.question.topics as string[] | null
      if (topics && Array.isArray(topics)) {
        for (const topic of topics) {
          byTopic[topic] = (byTopic[topic] || 0) + 1
        }
      }
    }

    // Get recent submissions
    const recentSubmissions = await prisma.userSubmission.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      take: 10,
      include: {
        question: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          },
        },
      },
    })

    return {
      total,
      byDifficulty,
      byTopic,
      recentSubmissions: recentSubmissions.map((s: any) => ({
        questionId: s.questionId,
        questionTitle: s.question.title,
        difficulty: s.question.difficulty,
        status: s.status,
        submittedAt: s.submittedAt,
        language: s.language,
        executionTime: s.executionTimeMs,
      })),
    }
  }

  async recordSolved(userId: string, questionId: string, difficulty: string): Promise<void> {
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
        problemsSolved: { increment: 1 },
      },
      create: {
        userId,
        analyticsDate: today,
        problemsSolved: 1,
      },
    })

    this.logger.log(`User ${userId} solved problem ${questionId} (${difficulty})`)
  }
}
