import { Injectable, Logger } from '@nestjs/common'
import { prisma } from '@repo/database'
import { subMonths, format, eachDayOfInterval, subDays } from 'date-fns'
import type { PlatformMetrics, RevenueMetrics, ContentMetrics } from '@repo/shared-types'

@Injectable()
export class AdminAnalyticsService {
  private readonly logger = new Logger(AdminAnalyticsService.name)

  async getPlatformMetrics(): Promise<PlatformMetrics> {
    // Total users
    const totalUsers = await prisma.user.count()

    // User growth (last 12 months)
    const twelveMonthsAgo = subMonths(new Date(), 12)
    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: twelveMonthsAgo },
      },
      select: { createdAt: true },
    })

    const usersByMonth = new Map<string, number>()
    users.forEach((u) => {
      const month = format(u.createdAt, 'yyyy-MM')
      usersByMonth.set(month, (usersByMonth.get(month) || 0) + 1)
    })

    const userGrowth = Array.from(usersByMonth.entries()).map(([date, count]) => ({
      date,
      count,
    }))

    // Daily Active Users (last 24 hours)
    const oneDayAgo = subDays(new Date(), 1)
    const dailyActiveUsers = await prisma.userProgress.groupBy({
      by: ['userId'],
      where: {
        lastAccessedAt: { gte: oneDayAgo },
      },
    })

    // Monthly Active Users (last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30)
    const monthlyActiveUsers = await prisma.userProgress.groupBy({
      by: ['userId'],
      where: {
        lastAccessedAt: { gte: thirtyDaysAgo },
      },
    })

    // Course catalog size
    const courseCatalogSize = await prisma.course.count({
      where: { isPublished: true },
    })

    // Total code executions
    const totalCodeExecutions = await prisma.userSubmission.count({
      where: { submissionType: 'code' },
    })

    // API request volume - requires API gateway logging/metrics service
    // TODO: Integrate with API Gateway or logging service to track request counts
    // Options:
    // 1. AWS CloudWatch metrics if using AWS API Gateway
    // 2. Kong/Nginx access logs parsing
    // 3. Custom middleware request counter with Redis
    // 4. APM tools like DataDog, New Relic
    const apiRequestVolume = 0 // Placeholder - implement API gateway metrics integration

    return {
      totalUsers,
      userGrowth,
      dailyActiveUsers: dailyActiveUsers.length,
      monthlyActiveUsers: monthlyActiveUsers.length,
      courseCatalogSize,
      totalCodeExecutions,
      apiRequestVolume,
    }
  }

  async getRevenueMetrics(): Promise<RevenueMetrics> {
    // Get all successful transactions
    const transactions = await prisma.paymentTransaction.findMany({
      where: { status: 'succeeded' },
      select: {
        amount: true,
        createdAt: true,
        transactionType: true,
      },
    })

    // Calculate MRR (Monthly Recurring Revenue from subscriptions)
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: 'active' },
      include: {
        user: {
          select: { id: true },
        },
      },
    })

    const subscriptionRevenue = await prisma.paymentTransaction.aggregate({
      where: {
        transactionType: 'subscription',
        status: 'succeeded',
        createdAt: { gte: subMonths(new Date(), 1) },
      },
      _sum: { amount: true },
    })

    const mrr = Number(subscriptionRevenue._sum.amount) || 0

    // Calculate churn rate
    const lastMonth = subMonths(new Date(), 1)
    const subscribersStartOfMonth = await prisma.subscription.count({
      where: {
        createdAt: { lt: lastMonth },
        status: 'active',
      },
    })

    const cancelledLastMonth = await prisma.subscription.count({
      where: {
        status: 'cancelled',
        updatedAt: { gte: lastMonth },
      },
    })

    const churnRate =
      subscribersStartOfMonth > 0 ? (cancelledLastMonth / subscribersStartOfMonth) * 100 : 0

    // Calculate LTV (Lifetime Value) - simplified calculation
    const avgMonthlyRevenue = mrr / (activeSubscriptions.length || 1)
    const avgCustomerLifeMonths = churnRate > 0 ? 1 / (churnRate / 100) : 12
    const ltv = avgMonthlyRevenue * avgCustomerLifeMonths

    // Calculate CAC (Customer Acquisition Cost) - requires marketing spend tracking
    // TODO: Implement marketing spend tracking
    // CAC = Total Marketing Spend / Number of New Customers
    // Needs:
    // 1. MarketingCampaign table with spend tracking
    // 2. Integration with ad platforms (Google Ads, Facebook Ads)
    // 3. Track user acquisition source/attribution
    // Query would be:
    // const marketingSpend = await prisma.marketingCampaign.aggregate({
    //   where: { createdAt: { gte: lastMonth } },
    //   _sum: { spend: true }
    // });
    // const newCustomers = await prisma.user.count({
    //   where: { createdAt: { gte: lastMonth } }
    // });
    // const cac = marketingSpend._sum.spend / newCustomers;
    const cac = 0 // Placeholder - implement marketing spend tracking

    // Revenue by plan
    const planRevenue = await Promise.all([
      prisma.paymentTransaction.aggregate({
        where: {
          user: {
            subscriptions: {
              some: { planType: 'free' },
            },
          },
          status: 'succeeded',
        },
        _sum: { amount: true },
      }),
      prisma.paymentTransaction.aggregate({
        where: {
          user: {
            subscriptions: {
              some: { planType: 'pro' },
            },
          },
          status: 'succeeded',
        },
        _sum: { amount: true },
      }),
      prisma.paymentTransaction.aggregate({
        where: {
          user: {
            subscriptions: {
              some: { planType: 'enterprise' },
            },
          },
          status: 'succeeded',
        },
        _sum: { amount: true },
      }),
    ])

    const revenueByPlan = {
      free: Number(planRevenue[0]._sum.amount) || 0,
      pro: Number(planRevenue[1]._sum.amount) || 0,
      enterprise: Number(planRevenue[2]._sum.amount) || 0,
    }

    // Revenue growth (last 12 months)
    const twelveMonthsAgo = subMonths(new Date(), 12)
    const recentTransactions = transactions.filter((t) => t.createdAt >= twelveMonthsAgo)

    const revenueByMonth = new Map<string, number>()
    recentTransactions.forEach((t) => {
      const month = format(t.createdAt, 'yyyy-MM')
      revenueByMonth.set(month, (revenueByMonth.get(month) || 0) + Number(t.amount))
    })

    const revenueGrowth = Array.from(revenueByMonth.entries()).map(([month, amount]) => ({
      month,
      amount,
    }))

    return {
      mrr,
      churnRate,
      ltv,
      cac,
      revenueByPlan,
      revenueGrowth,
    }
  }

  async getContentMetrics(limit = 10): Promise<ContentMetrics> {
    // Most popular courses (by enrollments)
    const popularCourses = await prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { enrollmentCount: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        enrollmentCount: true,
        ratingAverage: true,
      },
    })

    const mostPopularCourses = popularCourses.map((c) => ({
      courseId: c.id,
      title: c.title,
      enrollments: c.enrollmentCount,
      rating: Number(c.ratingAverage),
    }))

    // Highest rated courses
    const highestRated = await prisma.course.findMany({
      where: {
        isPublished: true,
        ratingCount: { gt: 5 }, // At least 5 reviews
      },
      orderBy: { ratingAverage: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        ratingAverage: true,
        ratingCount: true,
      },
    })

    const highestRatedCourses = highestRated.map((c) => ({
      courseId: c.id,
      title: c.title,
      rating: Number(c.ratingAverage),
      reviews: c.ratingCount,
    }))

    // Problem solve rates
    const questions = await prisma.question.findMany({
      where: { isPublic: true },
      take: limit * 2,
      select: {
        id: true,
        title: true,
      },
    })

    const problemSolveRates = await Promise.all(
      questions.map(async (q) => {
        const totalAttempts = await prisma.userSubmission.groupBy({
          by: ['userId'],
          where: { questionId: q.id },
        })

        const solvedAttempts = await prisma.userSubmission.groupBy({
          by: ['userId'],
          where: {
            questionId: q.id,
            status: 'accepted',
          },
        })

        const attempts = totalAttempts.length
        const solveRate = attempts > 0 ? (solvedAttempts.length / attempts) * 100 : 0

        return {
          questionId: q.id,
          title: q.title,
          solveRate,
          attempts,
        }
      }),
    )

    // Sort by attempts and take top limit
    problemSolveRates.sort((a, b) => b.attempts - a.attempts)

    return {
      mostPopularCourses,
      highestRatedCourses,
      problemSolveRates: problemSolveRates.slice(0, limit),
    }
  }

  async getAdminDashboard() {
    const [platformMetrics, revenueMetrics, contentMetrics] = await Promise.all([
      this.getPlatformMetrics(),
      this.getRevenueMetrics(),
      this.getContentMetrics(5),
    ])

    return {
      platform: platformMetrics,
      revenue: revenueMetrics,
      content: contentMetrics,
    }
  }
}
