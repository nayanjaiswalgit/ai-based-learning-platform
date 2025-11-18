'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { TrendingUp, BookOpen, Code, Award, Flame } from 'lucide-react'
import { formatNumber, formatDuration } from '@/lib/utils'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function UserAnalyticsPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['user-analytics', userId],
    queryFn: () => analyticsApi.getUserAnalytics(userId),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-gray-500">Loading analytics...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-red-500">Failed to load analytics</div>
      </div>
    )
  }

  const problemsByDifficulty = [
    { name: 'Easy', value: analytics.problemsSolved.byDifficulty?.easy || analytics.problemsSolved.easy || 0 },
    { name: 'Medium', value: analytics.problemsSolved.byDifficulty?.medium || analytics.problemsSolved.medium || 0 },
    { name: 'Hard', value: analytics.problemsSolved.byDifficulty?.hard || analytics.problemsSolved.hard || 0 },
  ]

  const timeSpentData = [
    { name: 'Daily', minutes: analytics.timeSpent.daily || 0 },
    { name: 'Weekly', minutes: analytics.timeSpent.weekly || analytics.timeSpent.thisWeek || 0 },
    { name: 'Monthly', minutes: analytics.timeSpent.monthly || analytics.timeSpent.thisMonth || 0 },
  ]

  const topTopics = Object.entries(analytics.problemsSolved.byTopic || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }))

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">User Analytics</h1>
          <p className="text-gray-600 mt-2">Personal learning insights and progress tracking</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.learningStreak.currentStreakDays || analytics.learningStreak.current || 0} days</div>
              <p className="text-xs text-muted-foreground mt-2">
                Longest: {analytics.learningStreak.longestStreakDays || analytics.learningStreak.longest || 0} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.coursesCompleted}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {analytics.coursesInProgress} in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
              <Code className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.problemsSolved.total}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Across {Object.keys(analytics.problemsSolved.byTopic || {}).length} topics
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Award className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.achievements.length}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Badges earned
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Time Spent */}
          <Card>
            <CardHeader>
              <CardTitle>Time Spent Learning</CardTitle>
              <CardDescription>Study time breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeSpentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatDuration(value)} />
                  <Bar dataKey="minutes" fill="#3b82f6" name="Time Spent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Problems by Difficulty */}
          <Card>
            <CardHeader>
              <CardTitle>Problems by Difficulty</CardTitle>
              <CardDescription>Distribution of solved problems</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={problemsByDifficulty}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {problemsByDifficulty.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Topics */}
          {topTopics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Topics</CardTitle>
                <CardDescription>Most practiced areas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topTopics} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" name="Problems Solved" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Skill Progression */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Progression</CardTitle>
              <CardDescription>Top skills and proficiency levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.skillProgression.slice(0, 5).map((skill: any) => (
                  <div key={skill.skillId}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{skill.skillName}</span>
                      <span className="text-muted-foreground">{skill.proficiencyLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${skill.proficiencyLevel}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Badges and milestones earned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {analytics.achievements.map((achievement: any) => (
                <div
                  key={achievement.id}
                  className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <Award className="h-12 w-12 text-yellow-500 mb-2" />
                  <h4 className="font-semibold text-center">{achievement.title}</h4>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {achievement.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(achievement.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
