'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, DollarSign, TrendingUp, Eye, Star, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function InstructorDashboard() {
  // Mock data - will be replaced with actual API calls
  const stats = [
    { name: 'Total Courses', value: '12', icon: BookOpen, change: '+2', trend: 'up' },
    { name: 'Total Students', value: '1,234', icon: Users, change: '+123', trend: 'up' },
    { name: 'Total Revenue', value: '$45,678', icon: DollarSign, change: '+12%', trend: 'up' },
    { name: 'Avg. Rating', value: '4.8', icon: Star, change: '+0.2', trend: 'up' },
  ];

  const recentCourses = [
    { id: 1, title: 'Advanced React Patterns', students: 456, revenue: '$12,345', rating: 4.9, status: 'Published' },
    { id: 2, title: 'Node.js Masterclass', students: 234, revenue: '$8,456', rating: 4.7, status: 'Published' },
    { id: 3, title: 'TypeScript Deep Dive', students: 123, revenue: '$4,567', rating: 4.8, status: 'Draft' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Instructor Dashboard
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Manage your courses and track your performance
          </p>
        </div>
        <Link href="/instructor/courses/create">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="overflow-hidden border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-950">
                    <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{stat.name}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Courses */}
      <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Your Courses
            </h2>
            <Link href="/instructor/courses">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:hover:border-blue-700"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {course.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {course.students} students
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="mr-1 h-4 w-4" />
                      {course.revenue}
                    </span>
                    <span className="flex items-center">
                      <Star className="mr-1 h-4 w-4" />
                      {course.rating}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      course.status === 'Published'
                        ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
                    }`}
                  >
                    {course.status}
                  </span>
                  <Link href={`/instructor/courses/${course.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="p-6">
            <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
              Performance Analytics
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Track your course performance and student engagement
            </p>
            <Link href="/instructor/analytics">
              <Button variant="outline" className="mt-4 w-full">
                View Analytics
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="p-6">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
              Student Management
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              View and manage your enrolled students
            </p>
            <Link href="/instructor/students">
              <Button variant="outline" className="mt-4 w-full">
                Manage Students
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="p-6">
            <Eye className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
              Create Assessment
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Build quizzes and coding challenges for your courses
            </p>
            <Link href="/instructor/assessments/create">
              <Button variant="outline" className="mt-4 w-full">
                Create Assessment
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
