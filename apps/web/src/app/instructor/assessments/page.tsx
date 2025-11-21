'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Users, Clock } from 'lucide-react';
import Link from 'next/link';

export default function InstructorAssessmentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold">Assessments</h1>
            <p className="text-muted-foreground">
              Create and manage quizzes and assignments for your courses
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Assessment
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <FileText className="h-10 w-10 text-primary" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Total Assessments</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Users className="h-10 w-10 text-success" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Submissions</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Clock className="h-10 w-10 text-warning" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-bold">No Assessments Yet</h2>
            <p className="mb-6 max-w-md text-muted-foreground">
              Create your first assessment to test your students' knowledge and track their progress.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Assessment
            </Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
