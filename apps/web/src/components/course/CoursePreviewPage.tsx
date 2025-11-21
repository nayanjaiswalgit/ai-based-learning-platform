'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  Users,
  Award,
  Star,
  Play,
  CheckCircle,
  BookOpen,
  Globe,
  Calendar,
  Lock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

const API_BASE = process.env.NEXT_PUBLIC_COURSE_SERVICE_URL || 'http://localhost:3002';

interface CoursePreviewPageProps {
  slug: string;
}

interface CoursePreview {
  id: string;
  title: string;
  description: string;
  slug: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  price: number;
  thumbnail?: string;
  category: string;
  language: string;
  rating: number;
  totalRatings: number;
  totalStudents: number;
  lastUpdated: string;
  instructor: {
    id: string;
    name: string;
    bio?: string;
    avatar?: string;
    title?: string;
    totalStudents?: number;
    totalCourses?: number;
  };
  learningOutcomes: string[];
  requirements: string[];
  modules: {
    id: string;
    title: string;
    description: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      durationMinutes: number;
      isFreePreview: boolean;
      order: number;
    }[];
  }[];
  reviews: {
    id: string;
    rating: number;
    comment: string;
    studentName: string;
    createdAt: string;
  }[];
}

export function CoursePreviewPage({ slug }: CoursePreviewPageProps) {
  const [course, setCourse] = useState<CoursePreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchCoursePreview();
  }, [slug]);

  const fetchCoursePreview = async () => {
    try {
      const response = await fetch(`${API_BASE}/courses/slug/${slug}/preview`);
      if (!response.ok) throw new Error('Failed to fetch course');
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      toast({
        title: 'Failed to load course',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleEnroll = () => {
    if (course) {
      // Redirect to enrollment/payment page
      window.location.href = `/courses/${course.id}/enroll`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course not found</h2>
          <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const totalDuration = course.modules.reduce(
    (acc, mod) =>
      acc + mod.lessons.reduce((sum, lesson) => sum + lesson.durationMinutes, 0),
    0
  );
  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const freePreviewCount = course.modules.reduce(
    (acc, mod) => acc + mod.lessons.filter((l) => l.isFreePreview).length,
    0
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Section */}
      <div className="bg-gradient-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Course Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="bg-warning text-warning-foreground">
                {course.difficulty}
              </Badge>
              <span className="text-primary-foreground/80">{course.category}</span>
            </div>

            <h1 className="text-4xl font-bold">{course.title}</h1>
            <p className="text-lg text-primary-foreground/80">{course.description}</p>

            {/* Rating and Stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-warning text-warning" />
                <span className="font-bold">{course.rating.toFixed(1)}</span>
                <span className="text-primary-foreground/70">
                  ({course.totalRatings} ratings)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-5 w-5" />
                <span>{course.totalStudents.toLocaleString()} students</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-5 w-5" />
                <span>Updated {new Date(course.lastUpdated).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="h-5 w-5" />
                <span>{course.language}</span>
              </div>
            </div>

            {/* Instructor Info */}
            <div className="flex items-center gap-3 pt-2">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {course.instructor.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-primary-foreground/70">Created by</p>
                <p className="font-semibold">{course.instructor.name}</p>
                {course.instructor.title && (
                  <p className="text-sm text-primary-foreground/70">{course.instructor.title}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Enrollment Card (Desktop) */}
          <div className="hidden lg:block">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-4">
                {course.thumbnail && (
                  <div className="aspect-video bg-muted rounded overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <div className="text-3xl font-bold">
                    {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                  </div>
                </div>

                <Button onClick={handleEnroll} className="w-full btn-modern" size="lg">
                  {course.price === 0 ? 'Enroll for Free' : 'Enroll Now'}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  30-Day Money-Back Guarantee
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Includes:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    <span>{Math.floor(totalDuration / 60)} hours on-demand video</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Full lifetime access</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle>What you'll learn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{outcome}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {course.modules.length} modules • {totalLessons} lessons •{' '}
                  {Math.floor(totalDuration / 60)}h {totalDuration % 60}m total length •{' '}
                  {freePreviewCount} free preview{freePreviewCount !== 1 ? 's' : ''}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {course.modules.map((module, modIndex) => (
                  <div key={module.id} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full px-4 py-3 bg-muted hover:bg-muted/80 text-left flex items-center justify-between transition"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">
                          {modIndex + 1}. {module.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {module.lessons.length} lessons •{' '}
                          {module.lessons.reduce((sum, l) => sum + l.durationMinutes, 0)} min
                        </p>
                      </div>
                      <span
                        className={`transform transition ${
                          expandedModules.has(module.id) ? 'rotate-90' : ''
                        }`}
                      >
                        ▶
                      </span>
                    </button>

                    {expandedModules.has(module.id) && (
                      <div className="border-t">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="px-4 py-3 hover:bg-muted/50 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.isFreePreview ? (
                                <Play className="h-4 w-4 text-primary" />
                              ) : (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              )}
                              <div>
                                <p className="text-sm">
                                  {modIndex + 1}.{lessonIndex + 1} {lesson.title}
                                </p>
                                {lesson.isFreePreview && (
                                  <span className="text-xs text-primary">
                                    Free preview
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{lesson.durationMinutes} min</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    {course.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-line">{course.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Instructor */}
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-2xl">
                      {course.instructor.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{course.instructor.name}</h3>
                    {course.instructor.title && (
                      <p className="text-muted-foreground">{course.instructor.title}</p>
                    )}

                    <div className="flex gap-6 mt-2 text-sm text-muted-foreground">
                      {course.instructor.totalStudents && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{course.instructor.totalStudents.toLocaleString()} students</span>
                        </div>
                      )}
                      {course.instructor.totalCourses && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.instructor.totalCourses} courses</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {course.instructor.bio && (
                  <p className="text-sm text-foreground">{course.instructor.bio}</p>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            {course.reviews && course.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Student Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Rating Summary */}
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold">{course.rating.toFixed(1)}</div>
                      <div className="flex gap-0.5 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round(course.rating)
                                ? 'fill-warning text-warning'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Course Rating</div>
                    </div>

                    <div className="flex-1 space-y-1">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count =
                          course.reviews?.filter((r) => r.rating === rating).length || 0;
                        const percentage = course.totalRatings
                          ? (count / course.totalRatings) * 100
                          : 0;
                        return (
                          <div key={rating} className="flex items-center gap-2 text-sm">
                            <span className="w-16">
                              {rating} {rating === 1 ? 'star' : 'stars'}
                            </span>
                            <Progress value={percentage} className="flex-1 h-2" />
                            <span className="w-12 text-right text-muted-foreground">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-4 pt-4 border-t">
                    {course.reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {review.studentName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">{review.studentName}</p>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${
                                      star <= review.rating
                                        ? 'fill-warning text-warning'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Sticky enrollment card on desktop (placeholder) */}
          <div className="hidden lg:block">
            {/* Enrollment card is already sticky in hero section */}
          </div>
        </div>
      </div>

      {/* Mobile Enrollment Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
            </div>
          </div>
          <Button onClick={handleEnroll} size="lg" className="btn-modern">
            {course.price === 0 ? 'Enroll for Free' : 'Enroll Now'}
          </Button>
        </div>
      </div>
    </div>
  );
}
