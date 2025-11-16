import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Flame, Target, Code, BookOpen, Calendar } from 'lucide-react'

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-foreground">
                JD
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold">John Doe</h1>
                <p className="text-muted-foreground">john.doe@example.com</p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Badge>Full Stack Developer</Badge>
                  <Badge variant="outline">Pro Member</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23 days</div>
              <p className="text-xs text-muted-foreground">Your longest: 45 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
              <Code className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">85 Easy, 142 Medium, 20 Hard</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">9</div>
              <p className="text-xs text-muted-foreground">3 in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
              <Calendar className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142h</div>
              <p className="text-xs text-muted-foreground">This month: 28h</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: 'First Problem', icon: '🎯', unlocked: true },
                { name: '7-Day Streak', icon: '🔥', unlocked: true },
                { name: '100 Problems', icon: '💯', unlocked: true },
                { name: 'First Course', icon: '📚', unlocked: true },
                { name: '500 Problems', icon: '🏆', unlocked: false },
                { name: '30-Day Streak', icon: '⚡', unlocked: false },
                { name: '10 Courses', icon: '🎓', unlocked: false },
                { name: 'Contest Winner', icon: '👑', unlocked: false },
              ].map((achievement, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-center ${
                    achievement.unlocked ? '' : 'opacity-40'
                  }`}
                >
                  <div className="text-4xl">{achievement.icon}</div>
                  <p className="text-sm font-medium">{achievement.name}</p>
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
