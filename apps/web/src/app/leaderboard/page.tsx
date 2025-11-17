'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Flame,
  Target,
  Crown,
  Star,
} from 'lucide-react';

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'alltime'>('weekly');

  // Mock data
  const globalLeaderboard = [
    {
      rank: 1,
      userId: '1',
      name: 'Sarah Johnson',
      avatar: '',
      points: 12450,
      streak: 45,
      coursesCompleted: 12,
      badge: 'Elite',
      change: 2,
    },
    {
      rank: 2,
      userId: '2',
      name: 'Michael Chen',
      avatar: '',
      points: 11890,
      streak: 38,
      coursesCompleted: 10,
      badge: 'Expert',
      change: -1,
    },
    {
      rank: 3,
      userId: '3',
      name: 'Emma Williams',
      avatar: '',
      points: 11200,
      streak: 52,
      coursesCompleted: 11,
      badge: 'Master',
      change: 0,
    },
    {
      rank: 4,
      userId: '4',
      name: 'James Rodriguez',
      avatar: '',
      points: 10800,
      streak: 30,
      coursesCompleted: 9,
      badge: 'Expert',
      change: 3,
    },
    {
      rank: 5,
      userId: '5',
      name: 'You',
      avatar: '',
      points: 10450,
      streak: 25,
      coursesCompleted: 8,
      badge: 'Advanced',
      change: 1,
      isCurrentUser: true,
    },
  ];

  const courseLeaderboard = [
    {
      rank: 1,
      name: 'Alex Turner',
      score: 98.5,
      completionTime: '24 hours',
      attempts: 1,
    },
    {
      rank: 2,
      name: 'Jessica Brown',
      score: 96.8,
      completionTime: '28 hours',
      attempts: 1,
    },
    {
      rank: 3,
      name: 'David Kim',
      score: 95.2,
      completionTime: '26 hours',
      attempts: 2,
    },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-slate-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-slate-600 dark:text-slate-400">#{rank}</span>;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Elite':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400';
      case 'Master':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400';
      case 'Expert':
        return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400';
      case 'Advanced':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12">
      <div className="mx-auto max-w-6xl space-y-6 px-4">
        {/* Header */}
        <div className="text-center">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Leaderboard
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            See how you rank against other learners
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex justify-center gap-2">
          <Button
            variant={timeFilter === 'daily' ? 'default' : 'outline'}
            onClick={() => setTimeFilter('daily')}
            size="sm"
          >
            Daily
          </Button>
          <Button
            variant={timeFilter === 'weekly' ? 'default' : 'outline'}
            onClick={() => setTimeFilter('weekly')}
            size="sm"
          >
            Weekly
          </Button>
          <Button
            variant={timeFilter === 'monthly' ? 'default' : 'outline'}
            onClick={() => setTimeFilter('monthly')}
            size="sm"
          >
            Monthly
          </Button>
          <Button
            variant={timeFilter === 'alltime' ? 'default' : 'outline'}
            onClick={() => setTimeFilter('alltime')}
            size="sm"
          >
            All Time
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-950">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Your Rank</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">#5</p>
                <p className="text-xs text-green-600">↑ 1 position</p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-950">
                <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Current Streak</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">25 days</p>
                <p className="text-xs text-slate-500">Keep it going!</p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-950">
                <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Points</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">10,450</p>
                <p className="text-xs text-green-600">+250 this week</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="global" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="course">By Course</TabsTrigger>
            <TabsTrigger value="cohort">My Cohort</TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                  Global Leaderboard
                </h2>

                <div className="space-y-3">
                  {globalLeaderboard.map((user) => (
                    <div
                      key={user.userId}
                      className={`flex items-center justify-between rounded-lg p-4 transition-all ${
                        user.isCurrentUser
                          ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                          : 'border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center">
                          {getRankIcon(user.rank)}
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white">
                          {user.name.charAt(0)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {user.name}
                              {user.isCurrentUser && (
                                <span className="ml-2 text-sm text-blue-600">(You)</span>
                              )}
                            </h3>
                            <Badge className={getBadgeColor(user.badge)}>
                              {user.badge}
                            </Badge>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                            <span className="flex items-center">
                              <Star className="mr-1 h-3 w-3" />
                              {user.points.toLocaleString()} pts
                            </span>
                            <span className="flex items-center">
                              <Flame className="mr-1 h-3 w-3" />
                              {user.streak} day streak
                            </span>
                            <span>{user.coursesCompleted} courses</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {user.change > 0 && (
                          <div className="flex items-center text-green-600">
                            <TrendingUp className="mr-1 h-4 w-4" />
                            <span className="text-sm font-semibold">+{user.change}</span>
                          </div>
                        )}
                        {user.change < 0 && (
                          <div className="flex items-center text-red-600">
                            <TrendingUp className="mr-1 h-4 w-4 rotate-180" />
                            <span className="text-sm font-semibold">{user.change}</span>
                          </div>
                        )}
                        {user.change === 0 && (
                          <div className="text-sm text-slate-500">-</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="course">
            <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Course Leaderboard
                  </h2>
                  <select className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                    <option>React Fundamentals</option>
                    <option>Advanced JavaScript</option>
                    <option>Node.js Masterclass</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="pb-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Rank
                        </th>
                        <th className="pb-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Name
                        </th>
                        <th className="pb-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Score
                        </th>
                        <th className="pb-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Time
                        </th>
                        <th className="pb-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Attempts
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseLeaderboard.map((user) => (
                        <tr
                          key={user.rank}
                          className="border-b border-slate-100 dark:border-slate-800"
                        >
                          <td className="py-4">
                            <div className="flex h-8 w-8 items-center justify-center">
                              {getRankIcon(user.rank)}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {user.name}
                            </div>
                          </td>
                          <td className="py-4 text-right">
                            <span className="font-semibold text-green-600">{user.score}%</span>
                          </td>
                          <td className="py-4 text-right text-slate-600 dark:text-slate-400">
                            {user.completionTime}
                          </td>
                          <td className="py-4 text-right text-slate-600 dark:text-slate-400">
                            {user.attempts}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="cohort">
            <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
              <div className="p-12 text-center">
                <p className="text-slate-600 dark:text-slate-400">
                  Join a cohort to see the leaderboard for your peers!
                </p>
                <Button className="mt-4">Browse Cohorts</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
