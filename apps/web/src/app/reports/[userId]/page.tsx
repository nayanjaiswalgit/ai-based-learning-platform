'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download, Calendar } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

export default function ReportsPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)

  const { data: weeklyReport, isLoading: weeklyLoading } = useQuery({
    queryKey: ['weekly-report', userId],
    queryFn: () => analyticsApi.getWeeklyReport(userId),
  })

  const { data: monthlyReport, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthly-report', userId],
    queryFn: () => analyticsApi.getMonthlyReport(userId),
  })

  if (weeklyLoading || monthlyLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading reports...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Learning Reports</h1>
          <p className="text-gray-600 mt-2">Weekly and monthly progress reports</p>
        </div>

        {/* Weekly Report */}
        {weeklyReport && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Weekly Report
                  </CardTitle>
                  <CardDescription>
                    {new Date(weeklyReport.weekStart).toLocaleDateString()} -{' '}
                    {new Date(weeklyReport.weekEnd).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/reports/weekly/${userId}/export/csv`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    CSV
                  </a>
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/reports/weekly/${userId}/export/pdf`}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    PDF
                  </a>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{weeklyReport.summary.coursesCompleted}</div>
                  <p className="text-sm text-gray-600 mt-1">Courses Completed</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{weeklyReport.summary.lessonsWatched}</div>
                  <p className="text-sm text-gray-600 mt-1">Lessons Watched</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{weeklyReport.summary.problemsSolved}</div>
                  <p className="text-sm text-gray-600 mt-1">Problems Solved</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">
                    {formatDuration(weeklyReport.summary.timeSpent)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Time Spent</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">{weeklyReport.summary.streakDays}</div>
                  <p className="text-sm text-gray-600 mt-1">Streak Days</p>
                </div>
              </div>

              {weeklyReport.topAchievements.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Top Achievements</h4>
                  <div className="flex gap-2 flex-wrap">
                    {weeklyReport.topAchievements.map((achievement: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        {achievement}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {weeklyReport.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {weeklyReport.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="text-gray-700 text-sm">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Monthly Report */}
        {monthlyReport && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Monthly Report
              </CardTitle>
              <CardDescription>
                {monthlyReport.month}/{monthlyReport.year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{monthlyReport.progress.coursesCompleted}</div>
                  <p className="text-sm text-gray-600 mt-1">Courses Completed</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{monthlyReport.progress.problemsSolved}</div>
                  <p className="text-sm text-gray-600 mt-1">Problems Solved</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">
                    {formatDuration(monthlyReport.progress.timeSpent)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Time Spent</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{monthlyReport.progress.skillsImproved}</div>
                  <p className="text-sm text-gray-600 mt-1">Skills Improved</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Highlights</h4>
                  <ul className="space-y-2">
                    {monthlyReport.highlights.map((highlight: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span className="text-gray-700 text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Next Steps</h4>
                  <ul className="space-y-2">
                    {monthlyReport.nextSteps.map((step: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">→</span>
                        <span className="text-gray-700 text-sm">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
