import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react'

const milestones = [
  {
    id: 1,
    title: 'JavaScript Fundamentals',
    status: 'completed',
    progress: 100,
    tasks: ['Variables & Data Types', 'Functions', 'Arrays & Objects', 'ES6+ Features'],
  },
  {
    id: 2,
    title: 'React Basics',
    status: 'in-progress',
    progress: 65,
    tasks: ['Components', 'Props & State', 'Hooks', 'Context API'],
  },
  {
    id: 3,
    title: 'Advanced React Patterns',
    status: 'locked',
    progress: 0,
    tasks: ['Custom Hooks', 'Performance Optimization', 'Server Components', 'Suspense'],
  },
  {
    id: 4,
    title: 'Full Stack Project',
    status: 'locked',
    progress: 0,
    tasks: ['API Design', 'Database Modeling', 'Authentication', 'Deployment'],
  },
]

export default function RoadmapsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Learning Roadmap</h1>
            <p className="text-muted-foreground">
              AI-generated personalized path to Full Stack Developer
            </p>
          </div>
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Regenerate with AI
          </Button>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  2 of 4 milestones completed
                </span>
                <span className="text-sm font-medium">42% complete</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[42%] bg-gradient-to-r from-primary to-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap Timeline */}
        <div className="relative space-y-8">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="relative">
              {/* Node */}
              <div className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full border-4 border-background bg-card">
                {milestone.status === 'completed' ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : milestone.status === 'in-progress' ? (
                  <div className="h-6 w-6 rounded-full border-4 border-primary" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="ml-20">
                <Card
                  className={
                    milestone.status === 'locked' ? 'opacity-60' : 'hover:shadow-md transition-shadow'
                  }
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{milestone.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Phase {index + 1} of 4
                        </p>
                      </div>
                      <span className="text-sm font-medium">{milestone.progress}%</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>

                    <div className="space-y-2">
                      {milestone.tasks.map((task, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {milestone.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : milestone.status === 'in-progress' && i < 2 ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span
                            className={
                              milestone.status === 'locked' ? 'text-muted-foreground' : ''
                            }
                          >
                            {task}
                          </span>
                        </div>
                      ))}
                    </div>

                    {milestone.status !== 'locked' && (
                      <Button className="w-full">
                        {milestone.status === 'completed' ? 'Review' : 'Continue'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
