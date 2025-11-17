'use client';

import { useState } from 'react';
import {
  MoreVertical,
  Edit,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  BarChart3,
  Loader2,
  Users,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const API_BASE = process.env.NEXT_PUBLIC_COURSE_SERVICE_URL || 'http://localhost:3002';

interface CourseCardWithActionsProps {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    price: number;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    enrollmentCount?: number;
    rating?: number;
    totalRatings?: number;
    createdAt: string;
    updatedAt: string;
  };
  onEdit?: (courseId: string) => void;
  onDuplicate?: (courseId: string) => void;
  onDelete?: (courseId: string) => void;
  onPublish?: (courseId: string, published: boolean) => void;
  onAnalytics?: (courseId: string) => void;
}

export function CourseCardWithActions({
  course,
  onEdit,
  onDuplicate,
  onDelete,
  onPublish,
  onAnalytics,
}: CourseCardWithActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const { toast } = useToast();

  const handleDuplicate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/courses/${course.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to duplicate course');

      const duplicatedCourse = await response.json();

      toast({
        title: 'Course duplicated!',
        description: `Created a copy: ${duplicatedCourse.title}`,
      });

      onDuplicate?.(duplicatedCourse.id);
    } catch (error) {
      toast({
        title: 'Failed to duplicate',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    const newStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update course status');

      toast({
        title: `Course ${newStatus === 'PUBLISHED' ? 'published' : 'unpublished'}!`,
        description: `${course.title} is now ${newStatus.toLowerCase()}`,
      });

      onPublish?.(course.id, newStatus === 'PUBLISHED');
      setShowPublishDialog(false);
    } catch (error) {
      toast({
        title: 'Failed to update status',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/courses/${course.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete course');

      toast({
        title: 'Course deleted',
        description: `${course.title} has been deleted`,
      });

      onDelete?.(course.id);
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        title: 'Failed to delete',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    const variants = {
      PUBLISHED: 'default',
      DRAFT: 'secondary',
      ARCHIVED: 'outline',
    } as const;

    return (
      <Badge variant={variants[course.status] || 'default'}>
        {course.status}
      </Badge>
    );
  };

  const getDifficultyColor = () => {
    const colors = {
      BEGINNER: 'bg-green-100 text-green-700',
      INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
      ADVANCED: 'bg-red-100 text-red-700',
    };
    return colors[course.difficulty] || colors.INTERMEDIATE;
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-shadow">
        <CardHeader className="relative p-0">
          {/* Thumbnail */}
          <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white text-2xl font-bold">
                {course.title.charAt(0)}
              </div>
            )}

            {/* Status Badge Overlay */}
            <div className="absolute top-2 left-2">{getStatusBadge()}</div>

            {/* Actions Menu */}
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onEdit?.(course.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Course
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleDuplicate} disabled={isLoading}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setShowPublishDialog(true)}>
                    {course.status === 'PUBLISHED' ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Publish
                      </>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => onAnalytics?.(course.id)}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem]">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
            {course.description}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor()}`}>
              {course.difficulty}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              ${course.price.toFixed(2)}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{course.enrollmentCount || 0} students</span>
            </div>

            {course.rating && course.totalRatings ? (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>
                  {course.rating.toFixed(1)} ({course.totalRatings})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-400">
                <Star className="h-4 w-4" />
                <span>No ratings</span>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="text-xs text-gray-500">
            Updated: {new Date(course.updatedAt).toLocaleDateString()}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onEdit?.(course.id)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            className="flex-1"
            onClick={() => onAnalytics?.(course.id)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{course.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish/Unpublish Confirmation Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {course.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'} Course
            </DialogTitle>
            <DialogDescription>
              {course.status === 'PUBLISHED'
                ? `Are you sure you want to unpublish "${course.title}"? Students won't be able to enroll until you publish it again.`
                : `Are you sure you want to publish "${course.title}"? It will be visible to students and available for enrollment.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPublishDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handlePublishToggle} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {course.status === 'PUBLISHED' ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Publish
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
