'use client';

import React from 'react';
import { Calendar, Users, BookOpen, Award, TrendingUp } from 'lucide-react';

interface CohortDashboardProps {
  cohortId: string;
}

export function CohortDashboard({ cohortId }: CohortDashboardProps) {
  // This would fetch data from the API
  const stats = {
    activeStudents: 28,
    totalStudents: 30,
    completionRate: 85,
    totalSessions: 24,
    totalAssignments: 12,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-primary rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Cohort Dashboard</h1>
        <p className="text-primary-foreground/80">Track your cohort's progress and engagement</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Students */}
        <div className="bg-card rounded-lg shadow p-6 card-elevated">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm text-success font-semibold">
              {Math.round((stats.activeStudents / stats.totalStudents) * 100)}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            {stats.activeStudents}/{stats.totalStudents}
          </h3>
          <p className="text-sm text-muted-foreground">Active Students</p>
        </div>

        {/* Completion Rate */}
        <div className="bg-card rounded-lg shadow p-6 card-elevated">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            {stats.completionRate}%
          </h3>
          <p className="text-sm text-muted-foreground">Completion Rate</p>
        </div>

        {/* Total Sessions */}
        <div className="bg-card rounded-lg shadow p-6 card-elevated">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Calendar className="w-6 h-6 text-secondary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            {stats.totalSessions}
          </h3>
          <p className="text-sm text-muted-foreground">Live Sessions</p>
        </div>

        {/* Assignments */}
        <div className="bg-card rounded-lg shadow p-6 card-elevated">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-warning/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-warning" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            {stats.totalAssignments}
          </h3>
          <p className="text-sm text-muted-foreground">Assignments</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-lg shadow p-6 card-elevated">
        <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-primary/20 rounded-lg hover:bg-primary/5 transition-colors text-left btn-modern">
            <Calendar className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-semibold text-foreground">Schedule Session</h3>
            <p className="text-sm text-muted-foreground">Create a new live session</p>
          </button>

          <button className="p-4 border-2 border-success/20 rounded-lg hover:bg-success/5 transition-colors text-left btn-modern">
            <BookOpen className="w-6 h-6 text-success mb-2" />
            <h3 className="font-semibold text-foreground">New Assignment</h3>
            <p className="text-sm text-muted-foreground">Create an assignment</p>
          </button>

          <button className="p-4 border-2 border-secondary/20 rounded-lg hover:bg-secondary/5 transition-colors text-left btn-modern">
            <Award className="w-6 h-6 text-secondary mb-2" />
            <h3 className="font-semibold text-foreground">Generate Certificates</h3>
            <p className="text-sm text-muted-foreground">Issue completion certificates</p>
          </button>
        </div>
      </div>
    </div>
  );
}
