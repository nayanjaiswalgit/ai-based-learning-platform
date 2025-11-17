'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, CheckCircle, Code, TrendingUp, Share2, Home } from 'lucide-react';
import Link from 'next/link';

export default function SubmissionSuccessPage() {
  const stats = {
    runtime: '52 ms',
    memory: '14.2 MB',
    beatsRuntime: '85.6%',
    beatsMemory: '72.3%',
    difficulty: 'Easy',
    points: 10,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12">
      <div className="mx-auto max-w-3xl space-y-6 px-4">
        {/* Success Header */}
        <Card className="border-green-200 bg-gradient-to-r from-green-500 to-emerald-600 dark:border-green-900">
          <div className="p-8 text-center text-white">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
              <Trophy className="h-12 w-12" />
            </div>
            <h1 className="mb-2 text-3xl font-bold">Solution Accepted!</h1>
            <p className="text-lg opacity-90">
              Congratulations! Your solution passed all test cases.
            </p>
          </div>
        </Card>

        {/* Performance Stats */}
        <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="p-6">
            <h2 className="mb-6 flex items-center text-xl font-bold text-slate-900 dark:text-white">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
              Performance Stats
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400">Runtime</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.runtime}
                </p>
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  Beats {stats.beatsRuntime} of submissions
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400">Memory</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.memory}
                </p>
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  Beats {stats.beatsMemory} of submissions
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-300">
                    Points Earned
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Difficulty: {stats.difficulty}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    +{stats.points}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-500">XP</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="p-6">
            <h2 className="mb-4 flex items-center text-xl font-bold text-slate-900 dark:text-white">
              <CheckCircle className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
              Achievements Unlocked
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                <div className="text-4xl">🎯</div>
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-300">
                    First Problem Solved
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    You solved your first coding challenge!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                <div className="text-4xl">⚡</div>
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-300">
                    Speed Demon
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Your solution beats 85%+ in runtime!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/problems">
            <Button variant="outline" className="gap-2">
              <Code className="h-4 w-4" />
              More Problems
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="outline" className="gap-2">
              <Trophy className="h-4 w-4" />
              View Leaderboard
            </Button>
          </Link>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Share2 className="h-4 w-4" />
            Share Achievement
          </Button>
          <Link href="/dashboard">
            <Button className="gap-2 bg-green-600 hover:bg-green-700">
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
