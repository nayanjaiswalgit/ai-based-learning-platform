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
  const getDifficultyStyles = () => {
    switch (bootcamp.difficultyLevel.toLowerCase()) {
      case 'beginner':
        return 'bg-success text-success-foreground';
      case 'intermediate':
        return 'bg-warning text-warning-foreground';
      case 'advanced':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-info text-info-foreground';
    }
  };

  return (
    <div className="card-elevated bg-card rounded-lg shadow-md overflow-hidden border border-border">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-primary">
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
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyStyles()}`}>
            {bootcamp.difficultyLevel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
          {bootcamp.title}
        </h3>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
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
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground">
                {bootcamp.instructor.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-sm text-foreground">
            {bootcamp.instructor.username}
          </span>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
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
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-1 text-lg font-bold text-foreground">
            <DollarSign className="w-5 h-5" />
            <span>{bootcamp.price.toLocaleString()}</span>
          </div>

          <Link
            href={`/bootcamps/${bootcamp.slug}`}
            className="btn-modern px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors duration-200 text-sm font-semibold"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
