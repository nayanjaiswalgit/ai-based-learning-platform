'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Sparkles,
  Upload,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  BookOpen,
  Code,
  Map,
  BarChart3,
  Loader2,
  Eye,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { CourseCardWithActions } from '@/components/course/CourseCardWithActions';

const API_BASE = process.env.NEXT_PUBLIC_COURSE_SERVICE_URL || 'http://localhost:3002';

interface InstructorStats {
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  monthlyEarnings: number;
  monthlyStudents: number;
}

interface RecentCourse {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  enrollmentCount?: number;
  rating?: number;
  totalRatings?: number;
  createdAt: string;
  updatedAt: string;
}

interface InstructorDashboardEnhancedProps {
  instructorId: string;
  onCreateCourse?: () => void;
  onCreateCourseWithAI?: () => void;
  onGenerateDSA?: () => void;
  onCreateRoadmap?: () => void;
  onBulkImport?: () => void;
}

export function InstructorDashboardEnhanced({
  instructorId,
  onCreateCourse,
  onCreateCourseWithAI,
  onGenerateDSA,
  onCreateRoadmap,
  onBulkImport,
}: InstructorDashboardEnhancedProps) {
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, [instructorId]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch instructor stats
      const statsResponse = await fetch(
        `${API_BASE}/instructors/${instructorId}/stats`
      );
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent courses
      const coursesResponse = await fetch(
        `${API_BASE}/courses?instructorId=${instructorId}&limit=6&sort=updatedAt:desc`
      );
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setRecentCourses(coursesData.courses || []);
      }
    } catch (error) {
      toast({
        title: 'Failed to load dashboard',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseAction = () => {
    fetchDashboardData(); // Refresh data after any course action
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your courses and track your performance
          </p>
        </div>
        <Button onClick={onCreateCourse}>
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Fast access to common tasks and AI-powered tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col py-4 gap-2"
              onClick={onCreateCourse}
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">Create Course</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col py-4 gap-2"
              onClick={onCreateCourseWithAI}
            >
              <Sparkles className="h-6 w-6 text-purple-600" />
              <span className="text-sm">AI Course</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col py-4 gap-2"
              onClick={onGenerateDSA}
            >
              <Code className="h-6 w-6 text-blue-600" />
              <span className="text-sm">DSA Sheet</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col py-4 gap-2"
              onClick={onCreateRoadmap}
            >
              <Map className="h-6 w-6 text-green-600" />
              <span className="text-sm">Roadmap</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col py-4 gap-2"
              onClick={onBulkImport}
            >
              <Upload className="h-6 w-6 text-orange-600" />
              <span className="text-sm">Bulk Import</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">
                +{stats.monthlyStudents} this month
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>12% increase</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                ${stats.monthlyEarnings.toLocaleString()} this month
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>8% increase</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageRating.toFixed(1)}
                <span className="text-sm text-gray-500 font-normal">/5.0</span>
              </div>
              <div className="flex gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(stats.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <div className="flex gap-3 mt-2 text-xs">
                <span className="text-green-600">
                  {stats.publishedCourses} published
                </span>
                <span className="text-gray-500">{stats.draftCourses} drafts</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Courses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Courses</CardTitle>
            <CardDescription>Your latest courses and their performance</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {recentCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first course to get started
              </p>
              <Button onClick={onCreateCourse}>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentCourses.map((course) => (
                <CourseCardWithActions
                  key={course.id}
                  course={course}
                  onEdit={(id) => console.log('Edit', id)}
                  onDuplicate={handleCourseAction}
                  onDelete={handleCourseAction}
                  onPublish={handleCourseAction}
                  onAnalytics={(id) => console.log('Analytics', id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Courses</CardTitle>
            <CardDescription>Courses with highest enrollment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCourses
                .sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0))
                .slice(0, 5)
                .map((course, index) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm line-clamp-1">
                          {course.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {course.enrollmentCount || 0} students
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCourses.slice(0, 5).map((course) => (
                <div
                  key={course.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Edit className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">
                      {course.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Updated {new Date(course.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Tools Promo */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  Supercharge Your Content Creation
                </h3>
                <p className="text-gray-600 text-sm">
                  Use AI tools to generate courses, quizzes, coding labs, and more
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCreateCourseWithAI}>
                Try AI Tools
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
