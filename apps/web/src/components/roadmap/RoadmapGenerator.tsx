'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sparkles,
  Loader2,
  CheckCircle,
  Circle,
  Clock,
  Target,
  TrendingUp,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const API_BASE = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3009';

const schema = z.object({
  goal: z.string().min(10, 'Goal must be at least 10 characters'),
  currentLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  timeCommitment: z.number().min(1).max(40),
  focusAreas: z.array(z.string()).min(1, 'Select at least one focus area'),
  targetDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Milestone {
  id: string;
  title: string;
  description: string;
  order: number;
  estimatedDuration: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  resources: string[];
  estimatedHours: number;
  completed: boolean;
}

interface Roadmap {
  id?: string;
  title: string;
  description: string;
  goal: string;
  currentLevel: string;
  timeCommitment: number;
  milestones: Milestone[];
  estimatedCompletionWeeks: number;
}

const FOCUS_AREAS = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'Cloud Computing',
  'Cybersecurity',
  'Blockchain',
  'Game Development',
  'UI/UX Design',
  'Database Management',
  'System Design',
];

export function RoadmapGenerator({ userId }: { userId?: string }) {
  const [generatedRoadmap, setGeneratedRoadmap] = useState<Roadmap | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'timeline' | 'kanban'>('timeline');
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      goal: '',
      currentLevel: 'BEGINNER',
      timeCommitment: 10,
      focusAreas: [],
      targetDate: '',
    },
  });

  const handleAreaToggle = (area: string) => {
    const newAreas = selectedAreas.includes(area)
      ? selectedAreas.filter((a) => a !== area)
      : [...selectedAreas, area];
    setSelectedAreas(newAreas);
    form.setValue('focusAreas', newAreas);
  };

  const handleGenerate = async (data: FormData) => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/roadmap/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: data.goal,
          currentLevel: data.currentLevel,
          timeCommitment: data.timeCommitment,
          focusAreas: data.focusAreas,
          targetDate: data.targetDate,
          userId,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate roadmap');

      const result = await response.json();
      setGeneratedRoadmap(result.roadmap);

      toast({
        title: 'Roadmap generated!',
        description: `Created a personalized ${result.roadmap.estimatedCompletionWeeks}-week learning path`,
      });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRoadmap = async () => {
    if (!generatedRoadmap) return;

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE}/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...generatedRoadmap,
          userId,
        }),
      });

      if (!response.ok) throw new Error('Failed to save roadmap');

      const saved = await response.json();
      setGeneratedRoadmap({ ...generatedRoadmap, id: saved.id });

      toast({
        title: 'Roadmap saved!',
        description: 'Your learning roadmap has been saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMilestone = (milestoneId: string, field: string, value: any) => {
    if (!generatedRoadmap) return;

    const updatedMilestones = generatedRoadmap.milestones.map((m) =>
      m.id === milestoneId ? { ...m, [field]: value } : m
    );
    setGeneratedRoadmap({ ...generatedRoadmap, milestones: updatedMilestones });
  };

  const getMilestoneProgress = (milestone: Milestone) => {
    if (milestone.tasks.length === 0) return 0;
    const completed = milestone.tasks.filter((t) => t.completed).length;
    return (completed / milestone.tasks.length) * 100;
  };

  const getOverallProgress = () => {
    if (!generatedRoadmap || generatedRoadmap.milestones.length === 0) return 0;
    const totalProgress = generatedRoadmap.milestones.reduce(
      (sum, m) => sum + getMilestoneProgress(m),
      0
    );
    return totalProgress / generatedRoadmap.milestones.length;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learning Roadmap Generator</h1>
          <p className="text-gray-600 mt-1">
            Create a personalized learning path with AI
          </p>
        </div>
      </div>

      {!generatedRoadmap ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Your Learning Goals</CardTitle>
              <CardDescription>
                Tell us about your goals and we'll create a personalized roadmap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-4">
                <div>
                  <Label htmlFor="goal">What do you want to learn?</Label>
                  <textarea
                    id="goal"
                    {...form.register('goal')}
                    className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                    placeholder="e.g., I want to become a full-stack web developer and build my own SaaS product..."
                  />
                  {form.formState.errors.goal && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.goal.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="currentLevel">Current Skill Level</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue('currentLevel', value as any)
                    }
                    defaultValue="BEGINNER"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timeCommitment">
                    Weekly Time Commitment: {form.watch('timeCommitment')} hours
                  </Label>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    {...form.register('timeCommitment', { valueAsNumber: true })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1 hour/week</span>
                    <span>40 hours/week</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="targetDate">Target Completion Date (Optional)</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    {...form.register('targetDate')}
                  />
                </div>

                <div>
                  <Label>Focus Areas</Label>
                  <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded max-h-48 overflow-y-auto">
                    {FOCUS_AREAS.map((area) => (
                      <Badge
                        key={area}
                        variant={selectedAreas.includes(area) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleAreaToggle(area)}
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                  {form.formState.errors.focusAreas && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.focusAreas.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Roadmap...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Roadmap
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Define Your Goal</h4>
                  <p className="text-sm text-gray-600">
                    Tell us what you want to learn and your current skill level
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">AI Generates Path</h4>
                  <p className="text-sm text-gray-600">
                    Our AI creates a personalized learning roadmap with milestones and tasks
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Track Progress</h4>
                  <p className="text-sm text-gray-600">
                    Follow your roadmap, complete tasks, and track your learning journey
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Benefits:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Structured learning path
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Time estimates for each milestone
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Curated resources and materials
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Progress tracking
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{generatedRoadmap.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {generatedRoadmap.description}
                  </CardDescription>
                  <div className="flex gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span>{generatedRoadmap.goal}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-purple-600" />
                      <span>
                        {generatedRoadmap.estimatedCompletionWeeks} weeks
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span>{generatedRoadmap.currentLevel}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setGeneratedRoadmap(null)}>
                    Generate New
                  </Button>
                  <Button onClick={handleSaveRoadmap} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {generatedRoadmap.id ? 'Update' : 'Save'} Roadmap
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Overall Progress</span>
                  <span className="font-medium">{getOverallProgress().toFixed(0)}%</span>
                </div>
                <Progress value={getOverallProgress()} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('timeline')}
            >
              Timeline View
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              Kanban View
            </Button>
          </div>

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <div className="space-y-4">
              {generatedRoadmap.milestones.map((milestone, index) => (
                <Card key={milestone.id} className="relative">
                  {/* Timeline Connector */}
                  {index < generatedRoadmap.milestones.length - 1 && (
                    <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gray-200" />
                  )}

                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {milestone.status === 'COMPLETED' ? (
                          <CheckCircle className="h-8 w-8 text-green-600 fill-green-100" />
                        ) : milestone.status === 'IN_PROGRESS' ? (
                          <Circle className="h-8 w-8 text-blue-600 fill-blue-100" />
                        ) : (
                          <Circle className="h-8 w-8 text-gray-300" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {index + 1}. {milestone.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {milestone.description}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {milestone.estimatedDuration} weeks
                          </Badge>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2 mb-3">
                          <Progress
                            value={getMilestoneProgress(milestone)}
                            className="h-1.5"
                          />
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {milestone.tasks.filter((t) => t.completed).length} of{' '}
                              {milestone.tasks.length} tasks completed
                            </span>
                            <span>{getMilestoneProgress(milestone).toFixed(0)}%</span>
                          </div>
                        </div>

                        {/* Tasks */}
                        <div className="space-y-2">
                          {milestone.tasks.map((task) => (
                            <div
                              key={task.id}
                              className="flex items-start gap-2 p-2 bg-gray-50 rounded text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={(e) => {
                                  task.completed = e.target.checked;
                                  setGeneratedRoadmap({ ...generatedRoadmap });
                                }}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <p className={task.completed ? 'line-through text-gray-500' : ''}>
                                  {task.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {task.estimatedHours}h • {task.resources.length} resources
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Kanban View */}
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-3 gap-4">
              {['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                <Card key={status}>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      {status.replace('_', ' ')}
                      <Badge variant="outline" className="ml-2">
                        {
                          generatedRoadmap.milestones.filter((m) => m.status === status)
                            .length
                        }
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {generatedRoadmap.milestones
                      .filter((m) => m.status === status)
                      .map((milestone) => (
                        <Card key={milestone.id} className="cursor-move">
                          <CardContent className="p-3 space-y-2">
                            <h4 className="font-semibold text-sm">{milestone.title}</h4>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {milestone.description}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">
                                {milestone.tasks.length} tasks
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {milestone.estimatedDuration}w
                              </Badge>
                            </div>
                            <Progress
                              value={getMilestoneProgress(milestone)}
                              className="h-1"
                            />
                          </CardContent>
                        </Card>
                      ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
