'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Users, DollarSign, BookOpen } from 'lucide-react';

interface BootcampCardProps {
  bootcamp: {
    id: string;
    title: string;
    slug: string;
    description: string;
    durationWeeks: number;
    price: number;
    difficultyLevel: string;
    thumbnailUrl?: string;
    instructor: {
      username: string;
      profilePictureUrl?: string;
    };
    _count: {
      cohorts: number;
    };
  };
}

export function BootcampCard({ bootcamp }: BootcampCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
        {bootcamp.thumbnailUrl ? (
          <img
            src={bootcamp.thumbnailUrl}
            alt={bootcamp.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BookOpen className="w-16 h-16 text-white opacity-50" />
          </div>
        )}

        {/* Difficulty Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
            bootcamp.difficultyLevel === 'beginner' ? 'bg-green-500' :
            bootcamp.difficultyLevel === 'intermediate' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}>
            {bootcamp.difficultyLevel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {bootcamp.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {bootcamp.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-4">
          {bootcamp.instructor.profilePictureUrl ? (
            <img
              src={bootcamp.instructor.profilePictureUrl}
              alt={bootcamp.instructor.username}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-600">
                {bootcamp.instructor.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-sm text-gray-700">
            {bootcamp.instructor.username}
          </span>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{bootcamp.durationWeeks} weeks</span>
          </div>

          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{bootcamp._count.cohorts} cohorts</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-1 text-lg font-bold text-gray-900">
            <DollarSign className="w-5 h-5" />
            <span>{bootcamp.price.toLocaleString()}</span>
          </div>

          <Link
            href={`/bootcamps/${bootcamp.slug}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-semibold"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
