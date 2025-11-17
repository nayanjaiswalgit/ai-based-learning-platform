'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Flame, Target, Code, BookOpen, Calendar, Settings, Share2, Award, Crown, Medal, Star } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="overflow-hidden border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-4xl font-bold text-white ring-4 ring-white dark:ring-slate-900">
                  JD
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 ring-2 ring-white dark:ring-slate-900">
                  <Crown className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">John Doe</h1>
                <p className="text-slate-600 dark:text-slate-400">john.doe@example.com</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Badge className="bg-blue-600 text-white">Full Stack Developer</Badge>
                  <Badge className="bg-purple-600 text-white">Pro Member</Badge>
                  <Badge className="bg-green-600 text-white">Level 15</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/dashboard/settings">
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </Link>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Learning Streak</CardTitle>
              <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-950">
                <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">23 days</div>
              <p className="text-xs text-green-600 dark:text-green-400">Your longest: 45 days 🎉</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Problems Solved</CardTitle>
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-950">
                <Code className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">247</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">85 Easy, 142 Medium, 20 Hard</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Courses Completed</CardTitle>
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950">
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">9</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">3 in progress</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Study Time</CardTitle>
              <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-950">
                <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">142h</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">This month: 28h</p>
            </CardContent>
          </Card>
        </div>

        {/* Global Rank Card */}
        <Card className="border-slate-200 bg-gradient-to-r from-purple-500 to-indigo-600 dark:border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm font-medium opacity-90">Global Ranking</p>
                <p className="mt-1 text-5xl font-bold">#142</p>
                <p className="mt-2 text-sm opacity-90">Top 5% of all learners</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <Trophy className="mx-auto h-12 w-12" />
                  <p className="mt-1 text-xs">12 Trophies</p>
                </div>
                <div className="text-center">
                  <Medal className="mx-auto h-12 w-12" />
                  <p className="mt-1 text-xs">3 Medals</p>
                </div>
                <div className="text-center">
                  <Star className="mx-auto h-12 w-12" />
                  <p className="mt-1 text-xs">10,450 Points</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 dark:text-white">Achievements</CardTitle>
              <Badge className="bg-blue-600">12/24 Unlocked</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: 'First Problem', icon: '🎯', unlocked: true, date: '2 weeks ago' },
                { name: '7-Day Streak', icon: '🔥', unlocked: true, date: '1 week ago' },
                { name: '100 Problems', icon: '💯', unlocked: true, date: '3 days ago' },
                { name: 'First Course', icon: '📚', unlocked: true, date: '1 month ago' },
                { name: '500 Problems', icon: '🏆', unlocked: false, progress: '247/500' },
                { name: '30-Day Streak', icon: '⚡', unlocked: false, progress: '23/30' },
                { name: '10 Courses', icon: '🎓', unlocked: false, progress: '9/10' },
                { name: 'Contest Winner', icon: '👑', unlocked: false, progress: 'Not started' },
              ].map((achievement, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all ${
                    achievement.unlocked
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/50'
                      : 'border-slate-200 bg-slate-50 opacity-60 dark:border-slate-700 dark:bg-slate-800'
                  }`}
                >
                  <div className="text-4xl">{achievement.icon}</div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{achievement.name}</p>
                  {achievement.unlocked ? (
                    <p className="text-xs text-green-600 dark:text-green-400">✓ {achievement.date}</p>
                  ) : (
                    <p className="text-xs text-slate-600 dark:text-slate-400">{achievement.progress}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Activity This Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 365 }).map((_, i) => {
                const intensity = Math.floor(Math.random() * 5)
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-sm ${
                      intensity === 0
                        ? 'bg-muted'
                        : intensity === 1
                        ? 'bg-primary/20'
                        : intensity === 2
                        ? 'bg-primary/40'
                        : intensity === 3
                        ? 'bg-primary/60'
                        : 'bg-primary'
                    }`}
                    title={`Day ${i + 1}`}
                  />
                )
              })}
            </div>
            <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="h-3 w-3 rounded-sm bg-muted" />
              <div className="h-3 w-3 rounded-sm bg-primary/20" />
              <div className="h-3 w-3 rounded-sm bg-primary/40" />
              <div className="h-3 w-3 rounded-sm bg-primary/60" />
              <div className="h-3 w-3 rounded-sm bg-primary" />
              <span>More</span>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'JavaScript', level: 85 },
                { name: 'React', level: 78 },
                { name: 'Data Structures', level: 72 },
                { name: 'Algorithms', level: 68 },
                { name: 'System Design', level: 45 },
              ].map((skill) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.level}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
