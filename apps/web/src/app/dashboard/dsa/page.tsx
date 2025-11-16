import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, CheckCircle2, Circle, Clock } from 'lucide-react'

const problems = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays',
    companies: ['Google', 'Amazon', 'Meta'],
    status: 'solved',
    lastAttempt: '2 days ago',
  },
  {
    id: 2,
    title: 'Binary Tree Inorder Traversal',
    difficulty: 'Medium',
    category: 'Trees',
    companies: ['Microsoft', 'Google'],
    status: 'attempted',
    lastAttempt: '1 week ago',
  },
  {
    id: 3,
    title: 'LRU Cache',
    difficulty: 'Medium',
    category: 'Design',
    companies: ['Amazon', 'Uber', 'Lyft'],
    status: 'todo',
    lastAttempt: null,
  },
  {
    id: 4,
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    category: 'Binary Search',
    companies: ['Google', 'Meta'],
    status: 'todo',
    lastAttempt: null,
  },
  {
    id: 5,
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    companies: ['Amazon', 'Bloomberg'],
    status: 'solved',
    lastAttempt: '3 days ago',
  },
]

export default function DSASheetPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">DSA Problem Tracker</h1>
          <p className="text-muted-foreground">
            Track your progress on 1000+ coding problems
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">Across all topics</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Solved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">247</div>
              <p className="text-xs text-muted-foreground">19.8% completion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Attempted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">86</div>
              <p className="text-xs text-muted-foreground">Need revision</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Mastered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">142</div>
              <p className="text-xs text-muted-foreground">Repeated 3+ times</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search problems..." className="pl-10" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer">
                  All
                </Badge>
                <Badge variant="outline" className="cursor-pointer">
                  Easy
                </Badge>
                <Badge variant="outline" className="cursor-pointer">
                  Medium
                </Badge>
                <Badge variant="outline" className="cursor-pointer">
                  Hard
                </Badge>
                <Badge variant="outline" className="cursor-pointer">
                  Google
                </Badge>
                <Badge variant="outline" className="cursor-pointer">
                  Amazon
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Problems List */}
        <Card>
          <CardHeader>
            <CardTitle>Problems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-4">
                    {problem.status === 'solved' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : problem.status === 'attempted' ? (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <h3 className="font-medium">{problem.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            problem.difficulty === 'Easy'
                              ? 'secondary'
                              : problem.difficulty === 'Medium'
                              ? 'default'
                              : 'destructive'
                          }
                          className="text-xs"
                        >
                          {problem.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{problem.category}</span>
                        {problem.companies.map((company) => (
                          <Badge key={company} variant="outline" className="text-xs">
                            {company}
                          </Badge>
                        ))}
                      </div>
                      {problem.lastAttempt && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Last attempted: {problem.lastAttempt}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button>Solve</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
