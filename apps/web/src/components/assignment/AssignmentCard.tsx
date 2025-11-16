'use client';

import React from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AssignmentCardProps {
  assignment: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    maxPoints: number;
    assignmentType: string;
    peerReviewRequired: boolean;
    submitted?: boolean;
    grade?: number;
  };
  onViewDetails?: () => void;
}

export function AssignmentCard({ assignment, onViewDetails }: AssignmentCardProps) {
  const dueDate = new Date(assignment.dueDate);
  const isOverdue = dueDate < new Date() && !assignment.submitted;
  const isUpcoming = dueDate > new Date();

  const getStatusColor = () => {
    if (assignment.submitted && assignment.grade !== undefined) {
      return 'text-green-600 bg-green-100';
    }
    if (assignment.submitted) {
      return 'text-blue-600 bg-blue-100';
    }
    if (isOverdue) {
      return 'text-red-600 bg-red-100';
    }
    return 'text-yellow-600 bg-yellow-100';
  };

  const getStatusIcon = () => {
    if (assignment.submitted && assignment.grade !== undefined) {
      return <CheckCircle className="w-5 h-5" />;
    }
    if (assignment.submitted) {
      return <Clock className="w-5 h-5" />;
    }
    if (isOverdue) {
      return <AlertCircle className="w-5 h-5" />;
    }
    return <BookOpen className="w-5 h-5" />;
  };

  const getStatusText = () => {
    if (assignment.submitted && assignment.grade !== undefined) {
      return `Graded: ${assignment.grade}/${assignment.maxPoints}`;
    }
    if (assignment.submitted) {
      return 'Submitted - Pending Review';
    }
    if (isOverdue) {
      return 'Overdue';
    }
    return `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{assignment.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{assignment.description}</p>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="hidden sm:inline">{getStatusText()}</span>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{dueDate.toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold">{assignment.maxPoints} pts</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
            {assignment.assignmentType}
          </span>
        </div>

        {assignment.peerReviewRequired && (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
            Peer Review
          </span>
        )}
      </div>

      <button
        onClick={onViewDetails}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
      >
        {assignment.submitted ? 'View Submission' : 'Start Assignment'}
      </button>
    </div>
  );
}
