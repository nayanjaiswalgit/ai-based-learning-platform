import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Star,
  Users,
  Clock,
  CheckCircle2,
  Play,
  Globe,
  Award,
  BookOpen,
} from 'lucide-react'

const course = {
  id: 1,
  title: 'Full Stack Development Bootcamp',
  subtitle: 'Master React, Node.js, and Modern Web Development',
  instructor: {
    name: 'John Doe',
    title: 'Senior Software Engineer at Google',
    avatar: '',
    students: 50000,
    rating: 4.9,
  },
  rating: 4.8,
  reviews: 12500,
  students: 45000,
  lastUpdated: 'November 2024',
  language: 'English',
  level: 'Intermediate',
  duration: '40 hours',
  price: 99,
  originalPrice: 199,
  image: 'from-blue-500 to-purple-600',
}

const curriculum = [
  {
    title: 'Introduction to Web Development',
    lessons: 8,
    duration: '2h 30m',
    preview: true,
  },
  {
    title: 'HTML & CSS Fundamentals',
    lessons: 12,
    duration: '4h 15m',
    preview: false,
  },
  {
    title: 'JavaScript Essentials',
    lessons: 15,
    duration: '6h 45m',
    preview: false,
  },
  {
    title: 'React Development',
    lessons: 20,
    duration: '8h 30m',
    preview: false,
  },
  {
    title: 'Node.js & Express',
    lessons: 18,
    duration: '7h 20m',
    preview: false,
  },
  {
    title: 'Database & MongoDB',
    lessons: 14,
    duration: '5h 40m',
    preview: false,
  },
  {
    title: 'Full Stack Project',
    lessons: 10,
    duration: '5h 00m',
    preview: false,
  },
]

export default function CourseDetailPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge>{course.level}</Badge>
                <Badge variant="outline">Bestseller</Badge>
                <Badge variant="outline">Updated {course.lastUpdated}</Badge>
              </div>
              <h1 className="mb-4 text-4xl font-bold">{course.title}</h1>
              <p className="mb-6 text-xl text-muted-foreground">{course.subtitle}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating}</span>
                  <span className="text-muted-foreground">
                    ({course.reviews.toLocaleString()} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>{course.language}</span>
                </div>
              </div>
            </div>

            {/* Instructor */}
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={course.instructor.avatar} />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{course.instructor.name}</h3>
                    <p className="text-sm text-muted-foreground">{course.instructor.title}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {course.instructor.rating} rating
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.instructor.students.toLocaleString()} students
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>What you&apos;ll learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        'Build modern web applications with React',
                        'Create RESTful APIs with Node.js and Express',
                        'Work with MongoDB and databases',
                        'Deploy full-stack applications',
                        'Implement authentication and authorization',
                        'Use Git and GitHub for version control',
                        'Master modern JavaScript ES6+',
                        'Build responsive layouts with CSS',
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                      <li>Basic knowledge of HTML and CSS</li>
                      <li>Familiarity with programming concepts</li>
                      <li>A computer with internet connection</li>
                      <li>Willingness to learn and practice</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                    <p>
                      This comprehensive bootcamp will take you from beginner to professional full-stack
                      developer. You&apos;ll learn modern web development technologies including React,
                      Node.js, Express, and MongoDB.
                    </p>
                    <p>
                      The course includes hands-on projects, coding exercises, and quizzes to reinforce
                      your learning. By the end of this course, you&apos;ll have built multiple real-world
                      applications and be ready for a career in web development.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum" className="space-y-2">
                {curriculum.map((section, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{section.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {section.lessons} lessons • {section.duration}
                          </p>
                        </div>
                        {section.preview && <Badge variant="outline">Preview</Badge>}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Student Feedback</CardTitle>
                      <div className="flex items-center gap-2">
                        <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                        <span className="text-2xl font-bold">{course.rating}</span>
                        <span className="text-muted-foreground">course rating</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        name: 'Sarah Johnson',
                        rating: 5,
                        date: '2 weeks ago',
                        comment: 'Excellent course! The instructor explains everything clearly and the projects are very practical.',
                      },
                      {
                        name: 'Mike Chen',
                        rating: 5,
                        date: '1 month ago',
                        comment: 'Best web development course I&apos;ve taken. Highly recommend!',
                      },
                      {
                        name: 'Emma Williams',
                        rating: 4,
                        date: '2 months ago',
                        comment: 'Great content and well-structured. Would love more advanced topics in the future.',
                      },
                    ].map((review, i) => (
                      <div key={i} className="border-b pb-4 last:border-0">
                        <div className="mb-2 flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{review.name}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {Array.from({ length: review.rating }).map((_, j) => (
                                  <Star key={j} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="sticky top-4">
              <div className={`aspect-video bg-gradient-to-br ${course.image}`} />
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">${course.price}</span>
                  <span className="text-lg text-muted-foreground line-through">
                    ${course.originalPrice}
                  </span>
                  <Badge variant="destructive">50% OFF</Badge>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" size="lg">
                    <Play className="mr-2 h-5 w-5" />
                    Enroll Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    Preview This Course
                  </Button>
                </div>

                <div className="space-y-3 border-t pt-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Level</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Enrolled</span>
                    <span className="font-medium">{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Language</span>
                    <span className="font-medium">{course.language}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <h4 className="font-semibold text-sm">This course includes:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-muted-foreground" />
                      <span>40 hours on-demand video</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>97 downloadable resources</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>Full lifetime access</span>
                    </div>
                  </div>
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
