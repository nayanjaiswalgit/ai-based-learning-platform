'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Star, Clock, Users, Filter, BookOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';
import courseClient from '@/lib/api/course-client';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, [difficultyFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: any = {
        isPublished: true,
      };

      if (difficultyFilter) {
        filters.difficultyLevel = difficultyFilter;
      }

      if (searchQuery) {
        filters.search = searchQuery;
      }

      const data = await courseClient.getCourses(filters);
      setCourses(data);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-12">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">Explore Courses</h1>
          <p className="text-lg text-muted-foreground">
            Learn from industry experts and advance your tech career
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <div className="flex gap-2">
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || difficultyFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setDifficultyFilter('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading courses...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchCourses} className="mt-4" variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && courses.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/20 p-12 text-center">
            <BookOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-2xl font-semibold">No courses found</h3>
            <p className="text-muted-foreground">
              {searchQuery || difficultyFilter
                ? 'Try adjusting your search or filters'
                : 'Check back soon for new courses'}
            </p>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && courses.length > 0 && (
          <>
            <div className="mb-6 text-sm text-muted-foreground">
              Showing {courses.length} course{courses.length !== 1 ? 's' : ''}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className="overflow-hidden border-border bg-card transition-all hover:shadow-lg"
                >
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
                      <div className="absolute top-4 right-4 rounded-full bg-white px-3 py-1 text-sm font-semibold">
                        ${course.price}
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="mb-2">
                      <Badge variant="secondary">{course.difficultyLevel || 'All Levels'}</Badge>
                    </div>

                    <h3 className="mb-2 text-xl font-semibold line-clamp-2">{course.title}</h3>

                    <p className="mb-4 text-sm text-muted-foreground">
                      by {course.instructor?.username || 'Instructor'}
                    </p>

                    <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
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
                          {course.estimatedDurationHours}h
                        </span>
                      )}
                    </div>

                    <Link href={`/courses/${course.slug || course.id}`}>
                      <Button className="w-full">View Course</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
