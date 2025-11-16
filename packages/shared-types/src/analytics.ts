import { z } from 'zod'

// =====================================================
// USER ANALYTICS
// =====================================================

export const UserAnalyticsSchema = z.object({
  userId: z.string().uuid(),
  learningStreak: z.object({
    currentStreakDays: z.number(),
    longestStreakDays: z.number(),
    lastActivityDate: z.date().nullable(),
    totalActiveDays: z.number(),
  }),
  timeSpent: z.object({
    daily: z.number(),
    weekly: z.number(),
    monthly: z.number(),
    total: z.number(),
  }),
  coursesCompleted: z.number(),
  coursesInProgress: z.number(),
  problemsSolved: z.object({
    total: z.number(),
    byDifficulty: z.object({
      easy: z.number(),
      medium: z.number(),
      hard: z.number(),
    }),
    byTopic: z.record(z.string(), z.number()),
  }),
  skillProgression: z.array(
    z.object({
      skillId: z.string(),
      skillName: z.string(),
      proficiencyLevel: z.number(),
      change: z.number(),
    })
  ),
  achievements: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      badgeIconUrl: z.string().nullable(),
      earnedAt: z.date(),
    })
  ),
})

export type UserAnalytics = z.infer<typeof UserAnalyticsSchema>

// =====================================================
// INSTRUCTOR ANALYTICS
// =====================================================

export const CoursePerformanceSchema = z.object({
  courseId: z.string().uuid(),
  courseTitle: z.string(),
  enrollmentTrend: z.array(
    z.object({
      date: z.string(),
      count: z.number(),
    })
  ),
  completionRate: z.number(),
  averageWatchTime: z.number(),
  dropOffPoints: z.array(
    z.object({
      lessonId: z.string(),
      lessonTitle: z.string(),
      dropOffRate: z.number(),
    })
  ),
  studentSatisfaction: z.object({
    averageRating: z.number(),
    totalReviews: z.number(),
    ratingDistribution: z.object({
      5: z.number(),
      4: z.number(),
      3: z.number(),
      2: z.number(),
      1: z.number(),
    }),
  }),
})

export type CoursePerformance = z.infer<typeof CoursePerformanceSchema>

export const InstructorRevenueSchema = z.object({
  instructorId: z.string().uuid(),
  totalEarnings: z.number(),
  earningsPerCourse: z.array(
    z.object({
      courseId: z.string(),
      courseTitle: z.string(),
      earnings: z.number(),
      enrollments: z.number(),
    })
  ),
  monthlyRevenue: z.array(
    z.object({
      month: z.string(),
      amount: z.number(),
    })
  ),
  topSellingCourses: z.array(
    z.object({
      courseId: z.string(),
      courseTitle: z.string(),
      revenue: z.number(),
      enrollments: z.number(),
    })
  ),
})

export type InstructorRevenue = z.infer<typeof InstructorRevenueSchema>

export const StudentEngagementSchema = z.object({
  courseId: z.string().uuid(),
  activeStudents: z.number(),
  inactiveStudents: z.number(),
  discussionParticipation: z.number(),
  assignmentSubmissionRate: z.number(),
  averageTimePerStudent: z.number(),
})

export type StudentEngagement = z.infer<typeof StudentEngagementSchema>

// =====================================================
// ADMIN ANALYTICS
// =====================================================

export const PlatformMetricsSchema = z.object({
  totalUsers: z.number(),
  userGrowth: z.array(
    z.object({
      date: z.string(),
      count: z.number(),
    })
  ),
  dailyActiveUsers: z.number(),
  monthlyActiveUsers: z.number(),
  courseCatalogSize: z.number(),
  totalCodeExecutions: z.number(),
  apiRequestVolume: z.number(),
})

export type PlatformMetrics = z.infer<typeof PlatformMetricsSchema>

export const RevenueMetricsSchema = z.object({
  mrr: z.number(), // Monthly Recurring Revenue
  churnRate: z.number(),
  ltv: z.number(), // Lifetime Value
  cac: z.number(), // Customer Acquisition Cost
  revenueByPlan: z.object({
    free: z.number(),
    pro: z.number(),
    enterprise: z.number(),
  }),
  revenueGrowth: z.array(
    z.object({
      month: z.string(),
      amount: z.number(),
    })
  ),
})

export type RevenueMetrics = z.infer<typeof RevenueMetricsSchema>

export const ContentMetricsSchema = z.object({
  mostPopularCourses: z.array(
    z.object({
      courseId: z.string(),
      title: z.string(),
      enrollments: z.number(),
      rating: z.number(),
    })
  ),
  highestRatedCourses: z.array(
    z.object({
      courseId: z.string(),
      title: z.string(),
      rating: z.number(),
      reviews: z.number(),
    })
  ),
  problemSolveRates: z.array(
    z.object({
      questionId: z.string(),
      title: z.string(),
      solveRate: z.number(),
      attempts: z.number(),
    })
  ),
})

export type ContentMetrics = z.infer<typeof ContentMetricsSchema>

// =====================================================
// PERFORMANCE MONITORING
// =====================================================

export const PerformanceMetricsSchema = z.object({
  apiResponseTime: z.object({
    p50: z.number(),
    p95: z.number(),
    p99: z.number(),
  }),
  databaseQueryPerformance: z.object({
    averageQueryTime: z.number(),
    slowQueries: z.array(
      z.object({
        query: z.string(),
        duration: z.number(),
        timestamp: z.date(),
      })
    ),
  }),
  codeExecutionMetrics: z.object({
    queueLength: z.number(),
    averageExecutionTime: z.number(),
    timeouts: z.number(),
    errors: z.number(),
  }),
  videoMetrics: z.object({
    averageBufferTime: z.number(),
    playbackQuality: z.record(z.string(), z.number()),
  }),
  errorRate: z.number(),
  uptime: z.number(),
})

export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>

// =====================================================
// REPORTS
// =====================================================

export const WeeklyReportSchema = z.object({
  userId: z.string().uuid(),
  weekStart: z.date(),
  weekEnd: z.date(),
  summary: z.object({
    coursesCompleted: z.number(),
    lessonsWatched: z.number(),
    problemsSolved: z.number(),
    timeSpent: z.number(),
    streakDays: z.number(),
  }),
  topAchievements: z.array(z.string()),
  recommendations: z.array(z.string()),
})

export type WeeklyReport = z.infer<typeof WeeklyReportSchema>

export const MonthlyReportSchema = z.object({
  userId: z.string().uuid(),
  month: z.string(),
  year: z.number(),
  progress: z.object({
    coursesCompleted: z.number(),
    problemsSolved: z.number(),
    timeSpent: z.number(),
    skillsImproved: z.number(),
  }),
  goals: z.object({
    achieved: z.number(),
    inProgress: z.number(),
    pending: z.number(),
  }),
  highlights: z.array(z.string()),
  nextSteps: z.array(z.string()),
})

export type MonthlyReport = z.infer<typeof MonthlyReportSchema>

// =====================================================
// FEATURE FLAGS
// =====================================================

export const FeatureFlagSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
  rolloutPercentage: z.number().min(0).max(100),
  targetSegments: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type FeatureFlag = z.infer<typeof FeatureFlagSchema>

export const ABTestSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  variants: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      allocation: z.number(),
      config: z.record(z.string(), z.unknown()),
    })
  ),
  status: z.enum(['draft', 'running', 'paused', 'completed']),
  startDate: z.date(),
  endDate: z.date().nullable(),
  metrics: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['conversion', 'engagement', 'revenue']),
    })
  ),
})

export type ABTest = z.infer<typeof ABTestSchema>
