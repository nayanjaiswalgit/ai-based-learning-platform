import { Injectable, Logger } from '@nestjs/common'
import { prisma } from '@repo/database'
import { subMonths, format, eachMonthOfInterval } from 'date-fns'
import type { CoursePerformance, InstructorRevenue, StudentEngagement } from '@repo/shared-types'

@Injectable()
export class InstructorAnalyticsService {
  private readonly logger = new Logger(InstructorAnalyticsService.name)

  async getCoursePerformance(
    instructorId: string,
    courseId: string,
  ): Promise<CoursePerformance> {
    // Verify ownership
    const course = await prisma.course.findFirst({
      where: { id: courseId, instructorId },
    })

    if (!course) {
      throw new Error('Course not found or not owned by instructor')
    }

    // Get enrollment trend (last 6 months)
    const sixMonthsAgo = subMonths(new Date(), 6)
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        courseId,
        enrolledAt: { gte: sixMonthsAgo },
      },
      select: { enrolledAt: true },
    })

    // Group by month
    const enrollmentsByMonth = new Map<string, number>()
    enrollments.forEach((e: any) => {
      const month = format(e.enrolledAt, 'yyyy-MM')
      enrollmentsByMonth.set(month, (enrollmentsByMonth.get(month) || 0) + 1)
    })

    const enrollmentTrend = Array.from(enrollmentsByMonth.entries()).map(([date, count]) => ({
      date,
      count,
    }))

    // Calculate completion rate
    const totalEnrolled = await prisma.courseEnrollment.count({
      where: { courseId },
    })

    const totalCompleted = await prisma.courseEnrollment.count({
      where: {
        courseId,
        completedAt: { not: null },
      },
    })

    const completionRate = totalEnrolled > 0 ? (totalCompleted / totalEnrolled) * 100 : 0

    // Average watch time
    const avgWatchTime = await prisma.userProgress.aggregate({
      where: {
        resourceType: 'course',
        resourceId: courseId,
      },
      _avg: { timeSpentMinutes: true },
    })

    // Get drop-off points (lessons with low completion)
    const lessons = await prisma.lesson.findMany({
      where: {
        module: {
          courseId,
        },
      },
      include: {
        module: true,
      },
    })

    const dropOffPoints = await Promise.all(
      lessons.map(async (lesson: any) => {
        const totalStudents = totalEnrolled
        const completedLesson = await prisma.userProgress.count({
          where: {
            resourceType: 'lesson',
            resourceId: lesson.id,
            completedAt: { not: null },
          },
        })

        const dropOffRate =
          totalStudents > 0 ? ((totalStudents - completedLesson) / totalStudents) * 100 : 0

        return {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          dropOffRate,
        }
      }),
    )

    // Sort by highest drop-off rate
    dropOffPoints.sort((a: any, b: any) => b.dropOffRate - a.dropOffRate)

    // Student satisfaction (ratings)
    const reviews = await prisma.courseReview.findMany({
      where: { courseId },
      select: { rating: true },
    })

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    let totalRating = 0

    reviews.forEach((r: any) => {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingDistribution[r.rating as keyof typeof ratingDistribution]++
        totalRating += r.rating
      }
    })

    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

    return {
      courseId,
      courseTitle: course.title,
      enrollmentTrend,
      completionRate,
      averageWatchTime: Number(avgWatchTime._avg.timeSpentMinutes) || 0,
      dropOffPoints: dropOffPoints.slice(0, 5),
      studentSatisfaction: {
        averageRating,
        totalReviews: reviews.length,
        ratingDistribution,
      },
    }
  }

  async getRevenue(instructorId: string): Promise<InstructorRevenue> {
    // Get all courses by instructor
    const courses = await prisma.course.findMany({
      where: { instructorId },
      select: { id: true, title: true, price: true },
    })

    // Get transactions for instructor's courses
    const transactions = await prisma.paymentTransaction.findMany({
      where: {
        transactionType: 'course',
        resourceId: { in: courses.map((c: any) => c.id) },
        status: 'succeeded',
      },
      select: {
        amount: true,
        resourceId: true,
        createdAt: true,
      },
    })

    // Calculate total earnings (70% instructor share)
    const totalEarnings = transactions.reduce((sum: any,  t: any) => sum + Number(t.amount) * 0.7, 0)

    // Earnings per course
    const earningsPerCourse = courses.map((course: any) => {
      const courseTransactions = transactions.filter((t: any) => t.resourceId === course.id)
      const earnings = courseTransactions.reduce((sum: any,  t: any) => sum + Number(t.amount) * 0.7, 0)
      const enrollments = courseTransactions.length

      return {
        courseId: course.id,
        courseTitle: course.title,
        earnings,
        enrollments,
      }
    })

    // Monthly revenue (last 12 months)
    const twelveMonthsAgo = subMonths(new Date(), 12)
    const recentTransactions = transactions.filter((t: any) => t.createdAt >= twelveMonthsAgo)

    const revenueByMonth = new Map<string, number>()
    recentTransactions.forEach((t: any) => {
      const month = format(t.createdAt, 'yyyy-MM')
      revenueByMonth.set(month, (revenueByMonth.get(month) || 0) + Number(t.amount) * 0.7)
    })

    const monthlyRevenue = Array.from(revenueByMonth.entries()).map(([month, amount]) => ({
      month,
      amount,
    }))

    // Top selling courses
    const topSellingCourses = earningsPerCourse
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((c: any) => ({
        courseId: c.courseId,
        courseTitle: c.courseTitle,
        revenue: c.earnings,
        enrollments: c.enrollments,
      }))

    return {
      instructorId,
      totalEarnings,
      earningsPerCourse,
      monthlyRevenue,
      topSellingCourses,
    }
  }

  async getStudentEngagement(courseId: string): Promise<StudentEngagement> {
    const totalEnrollments = await prisma.courseEnrollment.count({
      where: { courseId },
    })

    // Active students (accessed in last 7 days)
    const sevenDaysAgo = subMonths(new Date(), 0)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const activeStudents = await prisma.courseEnrollment.count({
      where: {
        courseId,
        lastAccessedAt: { gte: sevenDaysAgo },
      },
    })

    const inactiveStudents = totalEnrollments - activeStudents

    // Discussion participation
    const discussions = await prisma.discussionThread.count({
      where: {
        resourceType: 'course',
        resourceId: courseId,
      },
    })

    const discussionParticipation = totalEnrollments > 0 ? (discussions / totalEnrollments) * 100 : 0

    // Assignment submission rate (placeholder - would require assignments table)
    const assignmentSubmissionRate = 0

    // Average time per student
    const avgTime = await prisma.userProgress.aggregate({
      where: {
        resourceType: 'course',
        resourceId: courseId,
      },
      _avg: { timeSpentMinutes: true },
    })

    return {
      courseId,
      activeStudents,
      inactiveStudents,
      discussionParticipation,
      assignmentSubmissionRate,
      averageTimePerStudent: Number(avgTime._avg.timeSpentMinutes) || 0,
    }
  }

  async getInstructorDashboard(instructorId: string) {
    const [courses, totalStudents, revenue] = await Promise.all([
      prisma.course.count({ where: { instructorId } }),
      prisma.courseEnrollment.count({
        where: {
          course: { instructorId },
        },
      }),
      this.getRevenue(instructorId),
    ])

    return {
      totalCourses: courses,
      totalStudents,
      totalRevenue: revenue.totalEarnings,
      recentRevenue: revenue.monthlyRevenue,
    }
  }
}
