import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Star, Clock, Users, Filter } from 'lucide-react'
import Link from 'next/link'

const courses = [
  {
    id: 1,
    title: 'Full Stack Development Bootcamp',
    instructor: 'John Doe',
    rating: 4.8,
    students: 12500,
    duration: '40 hours',
    level: 'Intermediate',
    price: '$99',
    image: 'from-blue-500 to-purple-600',
  },
  {
    id: 2,
    title: 'Data Structures & Algorithms Masterclass',
    instructor: 'Jane Smith',
    rating: 4.9,
    students: 18200,
    duration: '60 hours',
    level: 'Advanced',
    price: '$149',
    image: 'from-green-500 to-teal-600',
  },
  {
    id: 3,
    title: 'System Design Interview Prep',
    instructor: 'Mike Johnson',
    rating: 4.7,
    students: 9800,
    duration: '25 hours',
    level: 'Advanced',
    price: '$79',
    image: 'from-orange-500 to-red-600',
  },
  {
    id: 4,
    title: 'React & Next.js Complete Guide',
    instructor: 'Sarah Williams',
    rating: 4.9,
    students: 15600,
    duration: '35 hours',
    level: 'Beginner',
    price: '$89',
    image: 'from-cyan-500 to-blue-600',
  },
  {
    id: 5,
    title: 'DevOps & Kubernetes Essentials',
    instructor: 'Tom Brown',
    rating: 4.6,
    students: 7400,
    duration: '30 hours',
    level: 'Intermediate',
    price: '$99',
    image: 'from-purple-500 to-pink-600',
  },
  {
    id: 6,
    title: 'Python for Data Science',
    instructor: 'Emma Davis',
    rating: 4.8,
    students: 11200,
    duration: '45 hours',
    level: 'Beginner',
    price: '$79',
    image: 'from-yellow-500 to-orange-600',
  },
]

export default function CoursesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container py-12">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">Explore Courses</h1>
          <p className="text-lg text-muted-foreground">
            Learn from industry experts and advance your tech career
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search courses..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Categories */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Badge variant="secondary" className="cursor-pointer">
            All Courses
          </Badge>
          <Badge variant="outline" className="cursor-pointer">
            Web Development
          </Badge>
          <Badge variant="outline" className="cursor-pointer">
            Data Science
          </Badge>
          <Badge variant="outline" className="cursor-pointer">
            DevOps
          </Badge>
          <Badge variant="outline" className="cursor-pointer">
            Mobile Development
          </Badge>
          <Badge variant="outline" className="cursor-pointer">
            Cloud Computing
          </Badge>
        </div>

        {/* Course Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden transition-shadow hover:shadow-lg">
              <div className={`aspect-video bg-gradient-to-br ${course.image}`} />
              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <Badge>{course.level}</Badge>
                  <span className="text-lg font-bold">{course.price}</span>
                </div>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <p className="text-sm text-muted-foreground">by {course.instructor}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <Link href={`/courses/${course.id}`}>View Course</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
