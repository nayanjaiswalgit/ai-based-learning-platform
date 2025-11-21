'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, TrendingUp, Award } from 'lucide-react';

export default function InstructorStudentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Students</h1>
          <p className="text-muted-foreground">
            View and manage your students across all courses
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Users className="h-10 w-10 text-primary" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <TrendingUp className="h-10 w-10 text-success" />
              <div>
                <p className="text-2xl font-bold">0%</p>
                <p className="text-sm text-muted-foreground">Avg. Completion Rate</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Award className="h-10 w-10 text-warning" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Certifications Issued</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search students by name or email..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Empty State */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-bold">No Students Yet</h2>
            <p className="mb-6 max-w-md text-muted-foreground">
              Once students enroll in your courses, you'll be able to track their progress and performance here.
            </p>
            <Button variant="outline">View Your Courses</Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
