'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Terminal, Clock, Search, TrendingUp, Code } from 'lucide-react';
import Link from 'next/link';

const labs = [
  {
    id: 1,
    title: 'Docker Basics - Container Management',
    description: 'Learn the fundamentals of Docker by creating, managing, and deploying containers.',
    difficulty: 'Intermediate',
    estimatedTime: '45 min',
    scenario: 'Docker',
    completions: 1234,
    rating: 4.8,
    tasks: 5,
  },
  {
    id: 2,
    title: 'Kubernetes Cluster Setup',
    description: 'Set up and manage a Kubernetes cluster from scratch.',
    difficulty: 'Advanced',
    estimatedTime: '60 min',
    scenario: 'Kubernetes',
    completions: 856,
    rating: 4.9,
    tasks: 8,
  },
  {
    id: 3,
    title: 'Linux Command Line Basics',
    description: 'Master essential Linux commands and file system navigation.',
    difficulty: 'Beginner',
    estimatedTime: '30 min',
    scenario: 'Linux',
    completions: 2456,
    rating: 4.7,
    tasks: 6,
  },
  {
    id: 4,
    title: 'Git Version Control',
    description: 'Learn Git basics including branching, merging, and collaboration.',
    difficulty: 'Beginner',
    estimatedTime: '40 min',
    scenario: 'Git',
    completions: 3124,
    rating: 4.9,
    tasks: 7,
  },
  {
    id: 5,
    title: 'AWS CLI Essentials',
    description: 'Interact with AWS services using the command line interface.',
    difficulty: 'Intermediate',
    estimatedTime: '50 min',
    scenario: 'AWS',
    completions: 678,
    rating: 4.6,
    tasks: 9,
  },
  {
    id: 6,
    title: 'Node.js API Development',
    description: 'Build a RESTful API using Node.js and Express from the terminal.',
    difficulty: 'Intermediate',
    estimatedTime: '55 min',
    scenario: 'Node.js',
    completions: 1567,
    rating: 4.8,
    tasks: 10,
  },
];

const categories = [
  { name: 'All Labs', count: labs.length },
  { name: 'Docker', count: 15 },
  { name: 'Kubernetes', count: 12 },
  { name: 'Linux', count: 24 },
  { name: 'Git', count: 8 },
  { name: 'AWS', count: 18 },
  { name: 'Node.js', count: 14 },
];

export default function LabsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Terminal Labs
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Practice real-world scenarios in interactive terminal environments
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search labs..." className="pl-10" />
          </div>
          <select className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
            <option>All Difficulties</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
          <select className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
            <option>Sort by: Popular</option>
            <option>Sort by: Newest</option>
            <option>Sort by: Difficulty</option>
            <option>Sort by: Duration</option>
          </select>
        </div>

        <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle className="text-base text-slate-900 dark:text-white">
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-blue-50 dark:hover:bg-blue-950"
                  >
                    <span className="text-slate-700 dark:text-slate-300">{category.name}</span>
                    <span className="text-slate-500 dark:text-slate-400">{category.count}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Labs Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {labs.map((lab) => (
              <Card
                key={lab.id}
                className="border-slate-200 bg-white/80 backdrop-blur-sm transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/80"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                      <Terminal className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <Badge
                      className={
                        lab.difficulty === 'Beginner'
                          ? 'bg-green-600'
                          : lab.difficulty === 'Intermediate'
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                      }
                    >
                      {lab.difficulty}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {lab.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {lab.description}
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {lab.estimatedTime}
                    </span>
                    <span className="flex items-center">
                      <Code className="mr-1 h-4 w-4" />
                      {lab.tasks} tasks
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {lab.completions.toLocaleString()} completed
                    </span>
                    <span>★ {lab.rating}</span>
                    <Badge variant="outline" className="text-xs">
                      {lab.scenario}
                    </Badge>
                  </div>

                  <Link href={`/labs/${lab.id}`}>
                    <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700">
                      Start Lab
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
