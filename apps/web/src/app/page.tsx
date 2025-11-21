'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  BookOpen,
  Code,
  GraduationCap,
  Rocket,
  Trophy,
  Users,
  Zap,
  Star,
  Clock,
  Award,
  TrendingUp,
  Target,
  Loader2,
} from 'lucide-react';
import courseClient from '@/lib/api/course-client';

export default function HomePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseClient.getCourses({
        isPublished: true,
        limit: 3,
      });
      setCourses(data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      // Use fallback empty array on error
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: 'Expert-Led Courses',
      description: 'Learn from industry experts with real-world experience',
    },
    {
      icon: Code,
      title: 'Hands-On Practice',
      description: 'Build projects and solve coding challenges',
    },
    {
      icon: Trophy,
      title: 'Earn Certificates',
      description: 'Showcase your achievements with verified certificates',
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Connect with peers and mentors worldwide',
    },
  ];

  const stats = [
    { label: 'Active Students', value: '50,000+', icon: Users },
    { label: 'Expert Instructors', value: '500+', icon: Award },
    { label: 'Courses Available', value: '1,200+', icon: BookOpen },
    { label: 'Success Rate', value: '95%', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-white/10 px-6 py-2 text-sm text-white backdrop-blur-sm">
              <Zap className="mr-2 h-4 w-4" />
              Join 50,000+ learners worldwide
            </div>
            <h1 className="mb-6 text-5xl font-bold text-white md:text-7xl">
              Learn to Code.
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Build Your Future.
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-blue-100">
              Master coding, data science, and more with expert-led courses, hands-on projects,
              and a supportive community.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/courses">
                <Button size="lg" className="h-14 bg-white px-8 text-lg font-semibold text-blue-600 hover:bg-blue-50">
                  <Rocket className="mr-2 h-5 w-5" />
                  Get Started Free
                </Button>
              </Link>
              <Link href="/instructor">
                <Button size="lg" variant="outline" className="h-14 border-2 border-white px-8 text-lg font-semibold text-white hover:bg-white/10">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Become an Instructor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mb-2 flex justify-center">
                  <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-950">
                    <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-20 dark:from-slate-950 dark:to-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Everything you need to accelerate your learning journey
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border-slate-200 bg-white/80 p-6 backdrop-blur-sm transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/80">
                <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 dark:bg-blue-950">
                  <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="bg-white py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                Popular Courses
              </h2>
              <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                Start learning with our most-loved courses
              </p>
            </div>
            <Link href="/courses">
              <Button variant="outline">View All Courses</Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : courses.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden border-slate-200 bg-white transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-16 w-16 text-white opacity-50" />
                      </div>
                    )}
                    {course.price && (
                      <div className="absolute top-4 right-4 rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-900">
                        ${course.price}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
                      {course.title}
                    </h3>
                    <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                      by {course.instructor?.username || 'Instructor'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      {course.averageRating && (
                        <span className="flex items-center">
                          <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {course.averageRating.toFixed(1)}
                        </span>
                      )}
                      {course.enrollmentCount > 0 && (
                        <span className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          {course.enrollmentCount.toLocaleString()}
                        </span>
                      )}
                      {course.estimatedDurationHours && (
                        <span className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {course.estimatedDurationHours} hours
                        </span>
                      )}
                    </div>
                    <Link href={`/courses/${course.slug || course.id}`}>
                      <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700">
                        Enroll Now
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-muted/20 p-12 text-center">
              <h3 className="mb-2 text-2xl font-semibold">No courses available yet</h3>
              <p className="text-muted-foreground">Check back soon for exciting new courses!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Target className="mx-auto mb-6 h-16 w-16 text-white" />
          <h2 className="mb-4 text-4xl font-bold text-white">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="mb-8 text-xl text-blue-100">
            Join thousands of students already learning on our platform
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/courses">
              <Button size="lg" className="h-14 bg-white px-8 text-lg font-semibold text-blue-600 hover:bg-blue-50">
                Browse Courses
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="h-14 border-2 border-white px-8 text-lg font-semibold text-white hover:bg-white/10">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                About
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/careers">Careers</Link></li>
                <li><Link href="/blog">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                Learn
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="/courses">All Courses</Link></li>
                <li><Link href="/bootcamps">Bootcamps</Link></li>
                <li><Link href="/problems">Practice Problems</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                Support
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                Legal
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/cookies">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
            © 2025 AI Learning Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
