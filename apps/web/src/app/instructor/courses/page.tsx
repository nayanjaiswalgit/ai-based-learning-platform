'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  PlusCircle,
  Search,
  Users,
  DollarSign,
  Star,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function InstructorCoursesPage() {
  // Mock data
  const courses = [
    {
      id: 1,
      title: 'Advanced React Patterns',
      status: 'published',
      students: 456,
      revenue: 12345,
      rating: 4.9,
      modules: 12,
      lessons: 87,
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
      updatedAt: '2 days ago',
    },
    {
      id: 2,
      title: 'Node.js Masterclass',
      status: 'published',
      students: 234,
      revenue: 8456,
      rating: 4.7,
      modules: 10,
      lessons: 65,
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop',
      updatedAt: '1 week ago',
    },
    {
      id: 3,
      title: 'TypeScript Deep Dive',
      status: 'draft',
      students: 0,
      revenue: 0,
      rating: 0,
      modules: 8,
      lessons: 42,
      thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=250&fit=crop',
      updatedAt: '3 days ago',
    },
    {
      id: 4,
      title: 'GraphQL Complete Guide',
      status: 'published',
      students: 189,
      revenue: 6789,
      rating: 4.8,
      modules: 9,
      lessons: 54,
      thumbnail: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=250&fit=crop',
      updatedAt: '2 weeks ago',
    },
  ];

  const stats = {
    totalCourses: courses.length,
    published: courses.filter((c) => c.status === 'published').length,
    draft: courses.filter((c) => c.status === 'draft').length,
    totalStudents: courses.reduce((acc, c) => acc + c.students, 0),
    totalRevenue: courses.reduce((acc, c) => acc + c.revenue, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            My Courses
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Manage and track your course performance
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/instructor/courses/generate-ai">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <span className="mr-2">✨</span>
              Generate with AI
            </Button>
          </Link>
          <Link href="/instructor/courses/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Manually
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Courses</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.totalCourses}
                </p>
              </div>
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Published</p>
                <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.published}
                </p>
              </div>
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-950">
                <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Draft</p>
                <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.draft}
                </p>
              </div>
              <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-950">
                <Edit className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Students</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.totalStudents.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-950">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Revenue</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-950">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search courses..." className="pl-10" />
        </div>
        <select className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
          <option>All Status</option>
          <option>Published</option>
          <option>Draft</option>
        </select>
        <select className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
          <option>Sort by: Latest</option>
          <option>Sort by: Most Students</option>
          <option>Sort by: Highest Revenue</option>
          <option>Sort by: Highest Rating</option>
        </select>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {courses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden border-slate-200 bg-white/80 backdrop-blur-sm transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/80"
          >
            <div className="relative h-48 overflow-hidden bg-slate-200">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="h-full w-full object-cover"
              />
              <Badge
                className={`absolute top-4 right-4 ${
                  course.status === 'published'
                    ? 'bg-green-600'
                    : 'bg-yellow-600'
                }`}
              >
                {course.status}
              </Badge>
            </div>

            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Updated {course.updatedAt}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Modules</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {course.modules}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Lessons</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {course.lessons}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t border-slate-200 pt-4 text-sm dark:border-slate-700">
                <span className="flex items-center text-slate-600 dark:text-slate-400">
                  <Users className="mr-1 h-4 w-4" />
                  {course.students.toLocaleString()}
                </span>
                {course.status === 'published' && (
                  <>
                    <span className="flex items-center text-slate-600 dark:text-slate-400">
                      <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {course.rating}
                    </span>
                    <span className="flex items-center text-slate-600 dark:text-slate-400">
                      <DollarSign className="mr-1 h-4 w-4" />
                      {course.revenue.toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              <Link href={`/instructor/courses/${course.id}/edit`}>
                <Button className="mt-4 w-full">
                  <Edit className="mr-2 h-4 w-4" />
                  Manage Course
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
