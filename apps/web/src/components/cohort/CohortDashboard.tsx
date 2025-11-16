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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Cohort Dashboard</h1>
        <p className="text-blue-100">Track your cohort's progress and engagement</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Students */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-green-600 font-semibold">
              {Math.round((stats.activeStudents / stats.totalStudents) * 100)}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {stats.activeStudents}/{stats.totalStudents}
          </h3>
          <p className="text-sm text-gray-600">Active Students</p>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {stats.completionRate}%
          </h3>
          <p className="text-sm text-gray-600">Completion Rate</p>
        </div>

        {/* Total Sessions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {stats.totalSessions}
          </h3>
          <p className="text-sm text-gray-600">Live Sessions</p>
        </div>

        {/* Assignments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {stats.totalAssignments}
          </h3>
          <p className="text-sm text-gray-600">Assignments</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left">
            <Calendar className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Schedule Session</h3>
            <p className="text-sm text-gray-600">Create a new live session</p>
          </button>

          <button className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left">
            <BookOpen className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">New Assignment</h3>
            <p className="text-sm text-gray-600">Create an assignment</p>
          </button>

          <button className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left">
            <Award className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Generate Certificates</h3>
            <p className="text-sm text-gray-600">Issue completion certificates</p>
          </button>
        </div>
      </div>
    </div>
  );
}
