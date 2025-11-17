'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, DollarSign, TrendingUp, Eye, Star, PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  enrollmentCount: number;
  price: number;
  ratingAverage: number;
  isPublished: boolean;
}

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    avgRating: 0,
  });

  useEffect(() => {
    async function fetchInstructorData() {
      try {
        // TODO: Get instructor ID from auth context
        const instructorId = 'user_123';

        // Fetch instructor's courses
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_COURSE_SERVICE_URL || 'http://localhost:3002'}/courses?instructorId=${instructorId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data = await response.json();
        const coursesData = data.courses || [];
        setCourses(coursesData.slice(0, 3)); // Get top 3 courses for dashboard

        // Calculate stats from courses
        const totalStudents = coursesData.reduce((sum: number, c: Course) => sum + c.enrollmentCount, 0);
        const totalRevenue = coursesData.reduce((sum: number, c: Course) => sum + (Number(c.price) * c.enrollmentCount), 0);
        const avgRating = coursesData.length > 0
          ? coursesData.reduce((sum: number, c: Course) => sum + Number(c.ratingAverage), 0) / coursesData.length
          : 0;

        setStats({
          totalCourses: coursesData.length,
          totalStudents,
          totalRevenue,
          avgRating: Math.round(avgRating * 10) / 10,
        });
      } catch (error) {
        console.error('Error fetching instructor data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchInstructorData();
  }, []);

  const statsDisplay = [
    {
      name: 'Total Courses',
      value: loading ? '...' : stats.totalCourses.toString(),
      icon: BookOpen,
      change: '+2',
      trend: 'up'
    },
    {
      name: 'Total Students',
      value: loading ? '...' : stats.totalStudents.toLocaleString(),
      icon: Users,
      change: '+123',
      trend: 'up'
    },
    {
      name: 'Total Revenue',
      value: loading ? '...' : `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: '+12%',
      trend: 'up'
    },
    {
      name: 'Avg. Rating',
      value: loading ? '...' : stats.avgRating.toFixed(1),
      icon: Star,
      change: '+0.2',
      trend: 'up'
    },
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
        {statsDisplay.map((stat) => (
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                <p>No courses yet. Create your first course to get started!</p>
              </div>
            ) : (
              courses.map((course) => (
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
                        {course.enrollmentCount} students
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="mr-1 h-4 w-4" />
                        ${(Number(course.price) * course.enrollmentCount).toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <Star className="mr-1 h-4 w-4" />
                        {Number(course.ratingAverage).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        course.isPublished
                          ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
                      }`}
                    >
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <Link href={`/instructor/courses/${course.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
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
