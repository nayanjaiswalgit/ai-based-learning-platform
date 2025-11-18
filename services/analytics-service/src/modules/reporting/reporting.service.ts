import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { prisma } from '@repo/database'
import { startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth } from 'date-fns'
import { UserAnalyticsService } from '../user-analytics/user-analytics.service'
import { InstructorAnalyticsService } from '../instructor-analytics/instructor-analytics.service'
import type { WeeklyReport, MonthlyReport } from '@repo/shared-types'

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name)

  constructor(
    private readonly userAnalyticsService: UserAnalyticsService,
    private readonly instructorAnalyticsService: InstructorAnalyticsService,
  ) {}

  async generateWeeklyReport(userId: string): Promise<WeeklyReport> {
    const now = new Date()
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)

    const analytics = await this.userAnalyticsService.getUserAnalytics(userId)

    // Get weekly stats
    const weeklyStats = await prisma.learningAnalytics.aggregate({
      where: {
        userId,
        analyticsDate: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      _sum: {
        coursesCompleted: true,
        lessonsCompleted: true,
        problemsSolved: true,
        timeSpentMinutes: true,
      },
    })

    return {
      userId,
      weekStart,
      weekEnd,
      summary: {
        coursesCompleted: weeklyStats._sum.coursesCompleted || 0,
        lessonsWatched: weeklyStats._sum.lessonsCompleted || 0,
        problemsSolved: weeklyStats._sum.problemsSolved || 0,
        timeSpent: weeklyStats._sum.timeSpentMinutes || 0,
        streakDays: analytics.learningStreak.currentStreakDays,
      },
      topAchievements: analytics.achievements.slice(0, 3).map((a: any) => a.title),
      recommendations: [
        'Continue your learning streak!',
        'Try solving medium-difficulty problems',
        'Complete the React course you started',
      ],
    }
  }

  async generateMonthlyReport(
    userId: string,
    month?: string,
    year?: string,
  ): Promise<MonthlyReport> {
    const now = new Date()
    const targetMonth = month || (now.getMonth() + 1).toString()
    const targetYear = year ? parseInt(year) : now.getFullYear()

    const monthStart = startOfMonth(new Date(targetYear, parseInt(targetMonth) - 1))
    const monthEnd = endOfMonth(new Date(targetYear, parseInt(targetMonth) - 1))

    const monthlyStats = await prisma.learningAnalytics.aggregate({
      where: {
        userId,
        analyticsDate: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _sum: {
        coursesCompleted: true,
        problemsSolved: true,
        timeSpentMinutes: true,
      },
    })

    // Calculate skills improved
    const skillsImproved = await prisma.userSkill.count({
      where: {
        userId,
        lastAssessedAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    })

    return {
      userId,
      month: targetMonth,
      year: targetYear,
      progress: {
        coursesCompleted: monthlyStats._sum.coursesCompleted || 0,
        problemsSolved: monthlyStats._sum.problemsSolved || 0,
        timeSpent: monthlyStats._sum.timeSpentMinutes || 0,
        skillsImproved,
      },
      goals: {
        achieved: 0,
        inProgress: 0,
        pending: 0,
      },
      highlights: [
        `Completed ${monthlyStats._sum.coursesCompleted || 0} courses this month!`,
        `Solved ${monthlyStats._sum.problemsSolved || 0} coding problems`,
        'Maintained a strong learning streak',
      ],
      nextSteps: [
        'Set new learning goals for next month',
        'Join a bootcamp to accelerate learning',
        'Practice more advanced algorithms',
      ],
    }
  }

  async generateInstructorReport(instructorId: string) {
    const dashboard = await this.instructorAnalyticsService.getInstructorDashboard(instructorId)
    return dashboard
  }

  async exportWeeklyReportCSV(userId: string): Promise<string> {
    const report = await this.generateWeeklyReport(userId)

    const csv = [
      'Metric,Value',
      `Courses Completed,${report.summary.coursesCompleted}`,
      `Lessons Watched,${report.summary.lessonsWatched}`,
      `Problems Solved,${report.summary.problemsSolved}`,
      `Time Spent (minutes),${report.summary.timeSpent}`,
      `Streak Days,${report.summary.streakDays}`,
    ].join('\n')

    return csv
  }

  async exportWeeklyReportPDF(userId: string): Promise<Buffer> {
    const report = await this.generateWeeklyReport(userId)

    // Placeholder: In production, use pdfkit or puppeteer
    const pdfContent = `
      Weekly Learning Report
      User: ${userId}
      Week: ${report.weekStart.toDateString()} - ${report.weekEnd.toDateString()}

      Summary:
      - Courses Completed: ${report.summary.coursesCompleted}
      - Lessons Watched: ${report.summary.lessonsWatched}
      - Problems Solved: ${report.summary.problemsSolved}
      - Time Spent: ${report.summary.timeSpent} minutes
      - Streak: ${report.summary.streakDays} days
    `

    return Buffer.from(pdfContent)
  }

  // Scheduled task: Generate weekly reports every Monday at 9 AM
  @Cron(CronExpression.EVERY_WEEK)
  async scheduleWeeklyReports() {
    this.logger.log('Generating scheduled weekly reports')

    // Get all active users
    const activeUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, email: true },
    })

    // Generate reports for all users (in production, use a queue)
    for (const user of activeUsers.slice(0, 10)) {
      // Limit for demo
      try {
        const report = await this.generateWeeklyReport(user.id)
        // In production: Send email with report
        this.logger.log(`Generated weekly report for user ${user.id}`)
      } catch (error) {
        this.logger.error(`Failed to generate report for user ${user.id}:`, error)
      }
    }
  }

  // Scheduled task: Generate monthly reports on the 1st of each month
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async scheduleMonthlyReports() {
    this.logger.log('Generating scheduled monthly reports')

    const activeUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, email: true },
    })

    for (const user of activeUsers.slice(0, 10)) {
      try {
        const report = await this.generateMonthlyReport(user.id)
        // In production: Send email with report
        this.logger.log(`Generated monthly report for user ${user.id}`)
      } catch (error) {
        this.logger.error(`Failed to generate monthly report for user ${user.id}:`, error)
      }
    }
  }
}
