'use client';

import { useState, useEffect } from 'react';
import {
  Edit,
  Trash2,
  Eye,
  Loader2,
  Plus,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const API_BASE = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3009';

interface Roadmap {
  id: string;
  title: string;
  description: string;
  goal: string;
  currentLevel: string;
  timeCommitment: number;
  estimatedCompletionWeeks: number;
  progress: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  milestones: {
    id: string;
    title: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    tasks: { completed: boolean }[];
  }[];
}

interface RoadmapManagerProps {
  userId: string;
  onCreateNew?: () => void;
  onEdit?: (roadmapId: string) => void;
}

export function RoadmapManager({ userId, onCreateNew, onEdit }: RoadmapManagerProps) {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'>(
    'ALL'
  );
  const { toast } = useToast();

  useEffect(() => {
    fetchRoadmaps();
  }, [userId]);

  const fetchRoadmaps = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/roadmap/list/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch roadmaps');

      const data = await response.json();
      setRoadmaps(data.roadmaps || []);
    } catch (error) {
      toast({
        title: 'Failed to load roadmaps',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const response = await fetch(`${API_BASE}/roadmap/${deletingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete roadmap');

      toast({
        title: 'Roadmap deleted',
        description: 'The roadmap has been deleted successfully',
      });

      setRoadmaps(roadmaps.filter((r) => r.id !== deletingId));
      setShowDeleteDialog(false);
      setDeletingId(null);
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (roadmapId: string, status: string) => {
    try {
      const response = await fetch(`${API_BASE}/roadmap/${roadmapId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update roadmap');

      toast({
        title: 'Status updated',
        description: `Roadmap status changed to ${status}`,
      });

      fetchRoadmaps();
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const calculateProgress = (roadmap: Roadmap) => {
    if (!roadmap.milestones || roadmap.milestones.length === 0) return 0;

    const totalTasks = roadmap.milestones.reduce(
      (sum, m) => sum + m.tasks.length,
      0
    );
    const completedTasks = roadmap.milestones.reduce(
      (sum, m) => sum + m.tasks.filter((t) => t.completed).length,
      0
    );

    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-700',
      COMPLETED: 'bg-blue-100 text-blue-700',
      ARCHIVED: 'bg-gray-100 text-gray-700',
    };
    return colors[status as keyof typeof colors] || colors.ACTIVE;
  };

  const filteredRoadmaps =
    filterStatus === 'ALL'
      ? roadmaps
      : roadmaps.filter((r) => r.status === filterStatus);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Learning Roadmaps</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your learning journeys
          </p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create Roadmap
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['ALL', 'ACTIVE', 'COMPLETED', 'ARCHIVED'].map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(status as any)}
          >
            {status}
            {status !== 'ALL' && (
              <Badge variant="secondary" className="ml-2">
                {roadmaps.filter((r) => r.status === status).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Roadmaps List */}
      {filteredRoadmaps.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No roadmaps found</h3>
            <p className="text-gray-600 mb-4">
              {filterStatus === 'ALL'
                ? 'Create your first learning roadmap to get started'
                : `No ${filterStatus.toLowerCase()} roadmaps`}
            </p>
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Roadmap
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoadmaps.map((roadmap) => (
            <Card key={roadmap.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge className={getStatusColor(roadmap.status)}>
                      {roadmap.status}
                    </Badge>
                    <CardTitle className="mt-2 line-clamp-2">
                      {roadmap.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {roadmap.description}
                    </CardDescription>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(roadmap.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit?.(roadmap.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {roadmap.status === 'ACTIVE' && (
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(roadmap.id, 'COMPLETED')}
                        >
                          Mark as Completed
                        </DropdownMenuItem>
                      )}

                      {roadmap.status !== 'ARCHIVED' && (
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(roadmap.id, 'ARCHIVED')}
                        >
                          Archive
                        </DropdownMenuItem>
                      )}

                      {roadmap.status === 'ARCHIVED' && (
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(roadmap.id, 'ACTIVE')}
                        >
                          Restore
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => {
                          setDeletingId(roadmap.id);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Goal */}
                <div className="flex items-start gap-2 text-sm">
                  <Target className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600 line-clamp-2">{roadmap.goal}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{roadmap.estimatedCompletionWeeks}w</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{roadmap.timeCommitment}h/wk</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>{roadmap.currentLevel}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Target className="h-4 w-4" />
                    <span>{roadmap.milestones.length} milestones</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {calculateProgress(roadmap).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={calculateProgress(roadmap)} className="h-2" />
                </div>

                {/* Milestone Status */}
                <div className="flex gap-1">
                  {roadmap.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className={`h-2 flex-1 rounded ${
                        milestone.status === 'COMPLETED'
                          ? 'bg-green-500'
                          : milestone.status === 'IN_PROGRESS'
                          ? 'bg-blue-500'
                          : 'bg-gray-200'
                      }`}
                      title={milestone.title}
                    />
                  ))}
                </div>

                {/* Last Updated */}
                <div className="text-xs text-gray-500 pt-2 border-t">
                  Updated {new Date(roadmap.updatedAt).toLocaleDateString()}
                </div>
              </CardContent>

              <div className="px-6 pb-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onEdit?.(roadmap.id)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button className="flex-1" onClick={() => onEdit?.(roadmap.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {roadmaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-700">
                  {roadmaps.length}
                </div>
                <div className="text-sm text-gray-600">Total Roadmaps</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-700">
                  {roadmaps.filter((r) => r.status === 'ACTIVE').length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded">
                <div className="text-2xl font-bold text-purple-700">
                  {roadmaps.filter((r) => r.status === 'COMPLETED').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded">
                <div className="text-2xl font-bold text-orange-700">
                  {Math.round(
                    roadmaps.reduce((sum, r) => sum + calculateProgress(r), 0) /
                      roadmaps.length
                  )}
                  %
                </div>
                <div className="text-sm text-gray-600">Avg. Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Roadmap</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this roadmap? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletingId(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
