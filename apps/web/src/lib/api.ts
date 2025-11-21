const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

async function fetcher<T = any>(url: string): Promise<T> {
  const response = await fetch(`${API_URL}${url}`)

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  return response.json()
}

// Type definitions for API responses
export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  summary: {
    totalTimeSpent: number;
    coursesCompleted: number;
    problemsSolved: number;
    averageScore: number;
    lessonsWatched?: number;
    timeSpent?: number;
    streakDays?: number;
  };
  topAchievements: string[] | Array<{ title: string; description: string; date: string }>;
  recommendations: string[] | Array<{ title: string; description: string }>;
}

export interface MonthlyReport {
  month: string;
  year: string;
  progress: {
    coursesCompleted: number;
    coursesInProgress: number;
    totalTimeSpent: number;
    averageScore: number;
    problemsSolved?: number;
    timeSpent?: number;
    skillsImproved?: number;
  };
  highlights: string[];
  nextSteps: string[];
}

export interface UserAnalytics {
  problemsSolved: {
    total: number;
    easy: number;
    medium: number;
    hard: number;
    byDifficulty?: { easy: number; medium: number; hard: number };
    byTopic?: any[];
  };
  timeSpent: {
    total: number;
    thisWeek: number;
    thisMonth: number;
    daily?: number;
    weekly?: number;
    monthly?: number;
  };
  learningStreak: {
    current: number;
    longest: number;
    currentStreakDays?: number;
    longestStreakDays?: number;
  };
  coursesCompleted: number;
  coursesInProgress: number;
  achievements: Array<{ id: string; title: string; description: string }>;
  skillProgression: Array<{ skill: string; level: number; progress: number }>;
}

export interface InstructorDashboard {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  recentRevenue: Array<{ date: string; amount: number }>;
}

export interface AdminDashboard {
  platform: {
    activeUsers: number;
    totalCourses: number;
    totalRevenue: number;
    totalUsers?: number;
    dailyActiveUsers?: number;
    monthlyActiveUsers?: number;
    courseCatalogSize?: number;
    totalCodeExecutions?: number;
    userGrowth?: any[];
  };
  revenue: {
    monthly: number;
    yearly: number;
    revenueByPlan?: {
      free?: number;
      pro?: number;
      enterprise?: number;
      [key: string]: number | undefined;
    };
    mrr?: number;
    churnRate?: number;
    ltv?: number;
    cac?: number;
  };
  content: {
    courses: number;
    assessments: number;
    labs: number;
    mostPopularCourses?: any[];
  };
}

export interface PerformanceMetrics {
  apiResponseTime: { avg: number; p50?: number; p95: number; p99: number };
  databaseQueryPerformance: {
    avgTime: number;
    averageQueryTime?: number;
    slowQueries: any[];
    totalQueries: number;
    queries: any[];
  };
  errorRate: number | { rate: number; total: number; lastHour: number };
  uptime: number | { percentage: number; downtime: number };
  codeExecutionMetrics: {
    avgTime: number;
    totalExecutions: number;
    queueLength?: number;
    errors?: number;
  };
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  variants?: any[];
}

export interface ABTest {
  id: string;
  name: string;
  variants: any[];
  results?: any;
}

export const analyticsApi = {
  // User Analytics
  getUserAnalytics: (userId: string) =>
    fetcher<UserAnalytics>(`/user-analytics/${userId}`),

  getLearningStreak: (userId: string) =>
    fetcher<UserAnalytics['learningStreak']>(`/user-analytics/${userId}/streak`),

  getTimeSpent: (userId: string) =>
    fetcher<UserAnalytics['timeSpent']>(`/user-analytics/${userId}/time-spent`),

  getCourseProgress: (userId: string) =>
    fetcher<{ coursesCompleted: number; coursesInProgress: number }>(`/user-analytics/${userId}/courses`),

  getProblemsSolved: (userId: string) =>
    fetcher<UserAnalytics['problemsSolved']>(`/user-analytics/${userId}/problems`),

  getSkillProgression: (userId: string) =>
    fetcher<UserAnalytics['skillProgression']>(`/user-analytics/${userId}/skills`),

  getAchievements: (userId: string) =>
    fetcher<UserAnalytics['achievements']>(`/user-analytics/${userId}/achievements`),

  // Instructor Analytics
  getCoursePerformance: (instructorId: string, courseId: string) =>
    fetcher<any>(`/instructor-analytics/${instructorId}/courses/${courseId}/performance`),

  getInstructorRevenue: (instructorId: string) =>
    fetcher<InstructorDashboard['recentRevenue']>(`/instructor-analytics/${instructorId}/revenue`),

  getStudentEngagement: (instructorId: string, courseId: string) =>
    fetcher<any>(`/instructor-analytics/${instructorId}/courses/${courseId}/engagement`),

  getInstructorDashboard: (instructorId: string) =>
    fetcher<InstructorDashboard>(`/instructor-analytics/${instructorId}/dashboard`),

  // Admin Analytics
  getPlatformMetrics: () =>
    fetcher<AdminDashboard['platform']>('/admin-analytics/platform-metrics'),

  getRevenueMetrics: () =>
    fetcher<AdminDashboard['revenue']>('/admin-analytics/revenue-metrics'),

  getContentMetrics: (limit?: number) =>
    fetcher<AdminDashboard['content']>(`/admin-analytics/content-metrics${limit ? `?${limit}` : ''}`),

  getAdminDashboard: () =>
    fetcher<AdminDashboard>('/admin-analytics/dashboard'),

  // Feature Flags
  getAllFlags: () =>
    fetcher<FeatureFlag[]>('/feature-flags'),

  getFlag: (key: string) =>
    fetcher<FeatureFlag>(`/feature-flags/${key}`),

  isEnabled: (key: string, userId: string) =>
    fetcher<{ enabled: boolean }>(`/feature-flags/${key}/user/${userId}`),

  // A/B Testing
  getAllTests: () =>
    fetcher<ABTest[]>('/feature-flags/ab-tests'),

  getTestResults: (testId: string) =>
    fetcher<ABTest>(`/feature-flags/ab-tests/${testId}/results`),

  // Performance
  getPerformanceMetrics: () =>
    fetcher<PerformanceMetrics>('/performance/metrics'),

  // Reports
  getWeeklyReport: (userId: string) =>
    fetcher<WeeklyReport>(`/reports/weekly/${userId}`),

  getMonthlyReport: (userId: string, month?: string, year?: string) => {
    const params = new URLSearchParams()
    if (month) params.append('month', month)
    if (year) params.append('year', year)
    const query = params.toString()
    return fetcher<MonthlyReport>(`/reports/monthly/${userId}${query ? `?${query}` : ''}`)
  },

  getInstructorReport: (instructorId: string) =>
    fetcher<any>(`/reports/instructor/${instructorId}`),
}
