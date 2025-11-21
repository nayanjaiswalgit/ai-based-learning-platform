'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Users,
  Clock,
  Video,
  CheckCircle2,
  Award,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import bootcampClient from '@/lib/api/bootcamp-client';

export default function BootcampDetailPage() {
  const params = useParams();
  const [bootcamp, setBootcamp] = useState<any>(null);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchBootcamp();
      fetchCohorts();
    }
  }, [params.id]);

  const fetchBootcamp = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bootcampClient.getBootcamp(params.id as string);
      setBootcamp(data);
    } catch (err: any) {
      console.error('Error fetching bootcamp:', err);
      setError('Failed to load bootcamp details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCohorts = async () => {
    try {
      const data = await bootcampClient.getCohorts(params.id as string);
      setCohorts(data);
    } catch (err: any) {
      console.error('Error fetching cohorts:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading bootcamp details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !bootcamp) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container py-24">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-12 text-center">
            <h2 className="mb-2 text-2xl font-bold">Error</h2>
            <p className="text-destructive">{error || 'Bootcamp not found'}</p>
            <Button onClick={fetchBootcamp} className="mt-4" variant="outline">
              Try Again
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const curriculum = bootcamp.syllabus?.weeks || [];
  const benefits = bootcamp.syllabus?.benefits || [];
  const activeCohort = cohorts.find((c) => c.status === 'active' || c.status === 'upcoming');
  const spotsLeft = activeCohort ? activeCohort.maxEnrollment - activeCohort.currentEnrollment : 0;

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
                <Badge>{bootcamp.difficultyLevel}</Badge>
                <Badge variant="outline">{bootcamp.durationWeeks} weeks</Badge>
                {spotsLeft > 0 && spotsLeft <= 10 && (
                  <Badge variant="destructive">Only {spotsLeft} spots left!</Badge>
                )}
              </div>
              <h1 className="mb-4 text-4xl font-bold">{bootcamp.title}</h1>
              <p className="mb-6 text-xl text-muted-foreground">{bootcamp.description}</p>

              {activeCohort && (
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Starts {new Date(activeCohort.startDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{bootcamp.durationWeeks} weeks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {activeCohort.currentEnrollment}/{activeCohort.maxEnrollment} enrolled
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Curriculum */}
            {curriculum.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{bootcamp.durationWeeks}-Week Curriculum</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {curriculum.map((item: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">Week {item.range}</p>
                          <p className="text-sm text-muted-foreground">{item.topic}</p>
                          {item.description && (
                            <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                        <Badge variant="outline">Upcoming</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {benefits.map((benefit: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructor */}
            {bootcamp.instructor && (
              <Card>
                <CardHeader>
                  <CardTitle>Meet Your Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback>
                        {bootcamp.instructor.username?.charAt(0).toUpperCase() || 'I'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{bootcamp.instructor.username}</p>
                      <p className="text-sm text-muted-foreground">Expert Instructor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardContent className="space-y-6 pt-6">
                {activeCohort && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Cohort</p>
                      <p className="text-2xl font-bold">{activeCohort.name}</p>
                    </div>

                    <div>
                      <p className="mb-2 text-sm text-muted-foreground">Enrollment Progress</p>
                      <Progress
                        value={(activeCohort.currentEnrollment / activeCohort.maxEnrollment) * 100}
                        className="mb-2"
                      />
                      <p className="text-sm font-medium">
                        {activeCohort.currentEnrollment} students enrolled
                      </p>
                    </div>
                  </>
                )}

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="font-medium">{bootcamp.durationWeeks} weeks</span>
                  </div>
                  {activeCohort?.scheduleDetails?.weeklyHours && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Weekly Commitment</span>
                      <span className="font-medium">{activeCohort.scheduleDetails.weeklyHours}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Level</span>
                    <span className="font-medium">{bootcamp.difficultyLevel}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="mb-4">
                    <p className="text-3xl font-bold">${Number(bootcamp.price).toLocaleString()}</p>
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
  );
}
