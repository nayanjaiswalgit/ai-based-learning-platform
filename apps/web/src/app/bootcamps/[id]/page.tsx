import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Calendar,
  Users,
  Clock,
  Video,
  CheckCircle2,
  Award,
  MessageSquare,
} from 'lucide-react'

const bootcamp = {
  id: 1,
  title: 'Full Stack Developer Bootcamp',
  subtitle: 'Become job-ready in 16 weeks',
  cohort: 'January 2025',
  startDate: 'January 15, 2025',
  duration: '16 weeks',
  format: 'Live + Self-paced',
  spotsLeft: 12,
  totalSpots: 30,
  price: 2999,
  weeklyHours: '15-20 hours',
  level: 'Beginner to Advanced',
  instructors: [
    { name: 'John Doe', title: 'Ex-Google Engineer', avatar: '' },
    { name: 'Jane Smith', title: 'Tech Lead at Meta', avatar: '' },
  ],
}

const curriculum = [
  { week: '1-2', topic: 'Web Fundamentals', status: 'locked' },
  { week: '3-4', topic: 'JavaScript & TypeScript', status: 'locked' },
  { week: '5-7', topic: 'React & Modern Frontend', status: 'locked' },
  { week: '8-10', topic: 'Backend with Node.js', status: 'locked' },
  { week: '11-12', topic: 'Databases & APIs', status: 'locked' },
  { week: '13-14', topic: 'DevOps & Deployment', status: 'locked' },
  { week: '15-16', topic: 'Capstone Project', status: 'locked' },
]

const benefits = [
  {
    icon: Video,
    title: 'Live Classes',
    description: '3 live sessions per week with expert instructors',
  },
  {
    icon: MessageSquare,
    title: '1:1 Mentorship',
    description: 'Weekly personalized mentoring sessions',
  },
  {
    icon: Users,
    title: 'Career Support',
    description: 'Resume reviews, mock interviews, and job placement assistance',
  },
  {
    icon: Award,
    title: 'Certificate',
    description: 'Industry-recognized certificate upon completion',
  },
]

export default function BootcampDetailPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge>{bootcamp.level}</Badge>
                <Badge variant="outline">{bootcamp.format}</Badge>
                <Badge variant="destructive">
                  Only {bootcamp.spotsLeft} spots left!
                </Badge>
              </div>
              <h1 className="mb-4 text-4xl font-bold">{bootcamp.title}</h1>
              <p className="mb-6 text-xl text-muted-foreground">{bootcamp.subtitle}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Starts {bootcamp.startDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{bootcamp.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {bootcamp.spotsLeft}/{bootcamp.totalSpots} spots available
                  </span>
                </div>
              </div>
            </div>

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle>What You&apos;ll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    'Build full-stack web applications',
                    'Master React, Node.js, and databases',
                    'Deploy applications to production',
                    'Write clean, maintainable code',
                    'Work with Git and GitHub',
                    'Ace technical interviews',
                    'Build your professional portfolio',
                    'Get job-ready in 16 weeks',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Curriculum */}
            <Card>
              <CardHeader>
                <CardTitle>16-Week Curriculum</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {curriculum.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">Week {item.week}</p>
                        <p className="text-sm text-muted-foreground">{item.topic}</p>
                      </div>
                      <Badge variant="outline">{item.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <div className="grid gap-6 sm:grid-cols-2">
              {benefits.map((benefit, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 font-semibold">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Instructors */}
            <Card>
              <CardHeader>
                <CardTitle>Meet Your Instructors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {bootcamp.instructors.map((instructor, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{instructor.name}</p>
                      <p className="text-sm text-muted-foreground">{instructor.title}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardContent className="space-y-6 pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Cohort</p>
                  <p className="text-2xl font-bold">{bootcamp.cohort}</p>
                </div>

                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Enrollment Progress</p>
                  <Progress
                    value={(bootcamp.spotsLeft / bootcamp.totalSpots) * 100}
                    className="mb-2"
                  />
                  <p className="text-sm font-medium">
                    {bootcamp.totalSpots - bootcamp.spotsLeft} students enrolled
                  </p>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="font-medium">{bootcamp.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Weekly Commitment</span>
                    <span className="font-medium">{bootcamp.weeklyHours}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Format</span>
                    <span className="font-medium">{bootcamp.format}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="mb-4">
                    <p className="text-3xl font-bold">${bootcamp.price.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">One-time payment</p>
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full" size="lg">
                      Apply Now
                    </Button>
                    <Button variant="outline" className="w-full">
                      Schedule Info Session
                    </Button>
                  </div>
                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    30-day money-back guarantee
                  </p>
                </div>

                <div className="border-t pt-4 text-sm">
                  <p className="mb-2 font-semibold">Financing Available</p>
                  <p className="text-muted-foreground">
                    Pay as low as $250/month with 0% APR
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
