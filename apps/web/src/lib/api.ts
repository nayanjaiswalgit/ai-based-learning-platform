const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(`${API_URL}${url}`)

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  return response.json()
}

export const analyticsApi = {
  // User Analytics
  getUserAnalytics: (userId: string) =>
    fetcher(`/user-analytics/${userId}`),

  getLearningStreak: (userId: string) =>
    fetcher(`/user-analytics/${userId}/streak`),

  getTimeSpent: (userId: string) =>
    fetcher(`/user-analytics/${userId}/time-spent`),

  getCourseProgress: (userId: string) =>
    fetcher(`/user-analytics/${userId}/courses`),

  getProblemsSolved: (userId: string) =>
    fetcher(`/user-analytics/${userId}/problems`),

  getSkillProgression: (userId: string) =>
    fetcher(`/user-analytics/${userId}/skills`),

  getAchievements: (userId: string) =>
    fetcher(`/user-analytics/${userId}/achievements`),

  // Instructor Analytics
  getCoursePerformance: (instructorId: string, courseId: string) =>
    fetcher(`/instructor-analytics/${instructorId}/courses/${courseId}/performance`),

  getInstructorRevenue: (instructorId: string) =>
    fetcher(`/instructor-analytics/${instructorId}/revenue`),

  getStudentEngagement: (instructorId: string, courseId: string) =>
    fetcher(`/instructor-analytics/${instructorId}/courses/${courseId}/engagement`),

  getInstructorDashboard: (instructorId: string) =>
    fetcher(`/instructor-analytics/${instructorId}/dashboard`),

  // Admin Analytics
  getPlatformMetrics: () =>
    fetcher('/admin-analytics/platform-metrics'),

  getRevenueMetrics: () =>
    fetcher('/admin-analytics/revenue-metrics'),

  getContentMetrics: (limit?: number) =>
    fetcher(`/admin-analytics/content-metrics${limit ? `?limit=${limit}` : ''}`),

  getAdminDashboard: () =>
    fetcher('/admin-analytics/dashboard'),

  // Feature Flags
  getAllFlags: () =>
    fetcher('/feature-flags'),

  getFlag: (key: string) =>
    fetcher(`/feature-flags/${key}`),

  isEnabled: (key: string, userId: string) =>
    fetcher(`/feature-flags/${key}/user/${userId}`),

  // A/B Testing
  getAllTests: () =>
    fetcher('/feature-flags/ab-tests'),

  getTestResults: (testId: string) =>
    fetcher(`/feature-flags/ab-tests/${testId}/results`),

  // Performance
  getPerformanceMetrics: () =>
    fetcher('/performance/metrics'),

  // Reports
  getWeeklyReport: (userId: string) =>
    fetcher(`/reports/weekly/${userId}`),

  getMonthlyReport: (userId: string, month?: string, year?: string) => {
    const params = new URLSearchParams()
    if (month) params.append('month', month)
    if (year) params.append('year', year)
    const query = params.toString()
    return fetcher(`/reports/monthly/${userId}${query ? `?${query}` : ''}`)
  },

  getInstructorReport: (instructorId: string) =>
    fetcher(`/reports/instructor/${instructorId}`),
}
