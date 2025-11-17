'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  RotateCcw,
  BookOpen,
  Lightbulb,
  Flag,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

interface LabTask {
  id: number;
  title: string;
  description: string;
  command: string;
  validation: string;
  completed: boolean;
}

interface Lab {
  id: string;
  title: string;
  difficulty: string;
  estimatedTime: string;
  description: string;
  scenario: string;
  tasks: LabTask[];
}

export default function LabPage({ params }: { params: { id: string } }) {
  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<LabTask[]>([]);
  const [currentTask, setCurrentTask] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Fetch lab data
  useEffect(() => {
    async function fetchLab() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ASSESSMENT_SERVICE_URL || 'http://localhost:3003'}/terminal-challenges/${params.id}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Lab not found');
          }
          throw new Error('Failed to load lab');
        }

        const data = await response.json();
        setLab(data);
        setTasks(data.tasks.map((t: any) => ({ ...t, completed: false })));
        setTerminalOutput([
          `$ Welcome to ${data.title}`,
          '$ Type commands to complete the tasks',
          '$ ',
        ]);
      } catch (err) {
        console.error('Error fetching lab:', err);
        setError(err instanceof Error ? err.message : 'Failed to load lab');
      } finally {
        setLoading(false);
      }
    }

    fetchLab();
  }, [params.id]);

  // Timer
  useEffect(() => {
    if (!loading && lab) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, lab]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    // Add command to output
    setTerminalOutput((prev) => [...prev, `$ ${command}`]);

    // Simulate command execution
    const currentTaskData = tasks[currentTask];

    if (command.toLowerCase().includes(currentTaskData.validation.toLowerCase())) {
      // Task completed
      setTerminalOutput((prev) => [
        ...prev,
        `✓ Task ${currentTaskData.id} completed!`,
        '',
        '$ ',
      ]);

      const newTasks = [...tasks];
      newTasks[currentTask].completed = true;
      setTasks(newTasks);

      if (currentTask < tasks.length - 1) {
        setCurrentTask(currentTask + 1);
      }
    } else {
      // Simulate generic output
      setTerminalOutput((prev) => [
        ...prev,
        `Command executed: ${command}`,
        '',
        '$ ',
      ]);
    }

    setCommand('');
  };

  const handleReset = () => {
    if (!lab) return;
    setTasks(lab.tasks.map((t) => ({ ...t, completed: false })));
    setCurrentTask(0);
    setTerminalOutput([
      `$ Welcome to ${lab.title}`,
      '$ Type commands to complete the tasks',
      '$ ',
    ]);
    setTimeElapsed(0);
  };

  const completedTasks = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  const allCompleted = tasks.length > 0 && completedTasks === tasks.length;

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !lab) {
    return (
      <DashboardLayout>
        <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardContent className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Unable to Load Lab
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {error || 'Lab not found'}
            </p>
            <p className="text-sm text-slate-500 mb-6">
              The terminal challenges endpoint needs to be implemented in the assessment service.
              The TerminalChallenge model exists in the database - an API endpoint is needed.
            </p>
            <Link href="/labs">
              <Button>Back to Labs</Button>
            </Link>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {lab.title}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <Badge
                  className={
                    lab.difficulty === 'Beginner'
                      ? 'bg-green-600'
                      : lab.difficulty === 'Intermediate'
                      ? 'bg-yellow-600'
                      : 'bg-red-600'
                  }
                >
                  {lab.difficulty}
                </Badge>
                <span className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="mr-1 h-4 w-4" />
                  {lab.estimatedTime}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Time: {formatTime(timeElapsed)}
                </span>
              </div>
            </div>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Lab
            </Button>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-900 dark:text-white">
                Progress: {completedTasks}/{tasks.length} tasks completed
              </span>
              <span className="text-slate-600 dark:text-slate-400">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {allCompleted && (
          <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600">
                  <Flag className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-300">
                    Lab Completed!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Great job! You've completed all tasks in {formatTime(timeElapsed)}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Terminal */}
          <div className="space-y-4">
            <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900 dark:text-white">
                  <Terminal className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Terminal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-slate-950 p-4 font-mono text-sm">
                  <div className="mb-4 h-96 overflow-y-auto text-green-400">
                    {terminalOutput.map((line, i) => (
                      <div key={i} className="whitespace-pre-wrap">
                        {line}
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleCommand} className="flex items-center gap-2">
                    <span className="text-green-400">$</span>
                    <input
                      type="text"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      className="flex-1 bg-transparent text-white outline-none"
                      placeholder="Type your command here..."
                      autoFocus
                    />
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions & Tasks */}
          <div className="space-y-4">
            <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardContent className="pt-6">
                <Tabs defaultValue="instructions">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="instructions">Instructions</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  </TabsList>

                  <TabsContent value="instructions" className="space-y-4">
                    <div>
                      <h3 className="mb-2 flex items-center font-semibold text-slate-900 dark:text-white">
                        <BookOpen className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                        About This Lab
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {lab.description}
                      </p>
                    </div>

                    {!allCompleted && (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                        <h4 className="mb-2 flex items-center font-semibold text-blue-900 dark:text-blue-300">
                          <Lightbulb className="mr-2 h-4 w-4" />
                          Current Task
                        </h4>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                          {tasks[currentTask].title}
                        </p>
                        <p className="mt-1 text-sm text-blue-700 dark:text-blue-500">
                          {tasks[currentTask].description}
                        </p>
                        <div className="mt-3 rounded bg-blue-100 p-2 font-mono text-xs text-blue-900 dark:bg-blue-900/30 dark:text-blue-300">
                          Hint: {tasks[currentTask].command}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="tasks" className="space-y-2">
                    {tasks.map((task, index) => (
                      <div
                        key={task.id}
                        className={`rounded-lg border p-3 ${
                          task.completed
                            ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30'
                            : index === currentTask
                            ? 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30'
                            : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {task.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : index === currentTask ? (
                              <Play className="h-5 w-5 text-blue-600" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {task.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                              {task.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
