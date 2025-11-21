'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Code, Trophy, TrendingUp } from 'lucide-react';

export default function ProblemsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Coding Problems</h1>
          <p className="text-lg text-muted-foreground">
            Practice your coding skills with curated problems
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">150+</p>
                <p className="text-sm text-muted-foreground">Problems</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <Trophy className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Solved</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search problems..."
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                <SelectItem value="arrays">Arrays</SelectItem>
                <SelectItem value="strings">Strings</SelectItem>
                <SelectItem value="linked-lists">Linked Lists</SelectItem>
                <SelectItem value="trees">Trees</SelectItem>
                <SelectItem value="graphs">Graphs</SelectItem>
                <SelectItem value="dp">Dynamic Programming</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Coming Soon Message */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Code className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-bold">Coding Problems Coming Soon</h2>
            <p className="mb-6 max-w-md text-muted-foreground">
              We're working on bringing you a comprehensive collection of coding problems
              to help you ace your technical interviews.
            </p>
            <div className="flex gap-2">
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline">Browse Courses</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Features */}
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold">Coming Features</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold">150+ Curated Problems</h3>
                <p className="text-sm text-muted-foreground">
                  Handpicked problems covering all major data structures and algorithms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold">Company Tags</h3>
                <p className="text-sm text-muted-foreground">
                  See which companies have asked these problems in interviews
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold">Video Solutions</h3>
                <p className="text-sm text-muted-foreground">
                  Detailed video explanations for every problem
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold">Code Editor</h3>
                <p className="text-sm text-muted-foreground">
                  Write and test your solutions directly in the browser
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold">Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your problem-solving journey and maintain streaks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold">Discussion Forum</h3>
                <p className="text-sm text-muted-foreground">
                  Share approaches and learn from the community
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
