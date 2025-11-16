import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { VideoPlayer } from '@/components/video-player/video-player'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, FileText, Code, ChevronRight } from 'lucide-react'

const lessons = [
  { id: 1, title: 'Introduction to React', completed: true, duration: '12:34' },
  { id: 2, title: 'Components and Props', completed: true, duration: '18:45' },
  { id: 3, title: 'State and Lifecycle', completed: false, duration: '25:12', current: true },
  { id: 4, title: 'Handling Events', completed: false, duration: '15:30' },
  { id: 5, title: 'Conditional Rendering', completed: false, duration: '20:15' },
]

export default function CourseViewPage() {
  return (
    <DashboardLayout>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Main Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Full Stack Development Bootcamp</h1>
            <p className="text-muted-foreground">Module 3: State and Lifecycle</p>
          </div>

          <VideoPlayer
            src="/videos/sample.mp4"
            title="State and Lifecycle"
            onProgress={(progress) => console.log('Progress:', progress)}
          />

          {/* Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                In this lesson, you&apos;ll learn about React state and lifecycle methods.
                Understanding these concepts is crucial for building interactive applications.
              </p>

              <h3 className="font-semibold">What you&apos;ll learn:</h3>
              <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                <li>How to use the useState hook</li>
                <li>Understanding component lifecycle</li>
                <li>Working with useEffect</li>
                <li>Managing complex state</li>
              </ul>

              <div className="mt-6 flex gap-4">
                <Button className="flex-1">Mark as Complete</Button>
                <Button variant="outline" className="flex-1">
                  Next Lesson
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Download Lesson Notes (PDF)
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Code className="mr-2 h-4 w-4" />
                View Source Code
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent ${
                    lesson.current ? 'bg-accent' : ''
                  }`}
                >
                  {lesson.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>My Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="min-h-[200px] w-full resize-none rounded-md border bg-background p-3 text-sm"
                placeholder="Take notes while watching..."
              />
              <Button className="mt-2 w-full">Save Notes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
