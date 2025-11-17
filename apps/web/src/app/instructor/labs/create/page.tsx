'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, Save, Terminal, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  description: string;
  command: string;
  validation: string;
}

export default function CreateLabPage() {
  const router = useRouter();
  const [labData, setLabData] = useState({
    title: '',
    description: '',
    difficulty: 'beginner',
    estimatedTime: '',
    scenario: 'linux',
  });

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: '',
      description: '',
      command: '',
      validation: '',
    },
  ]);

  const addTask = () => {
    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        title: '',
        description: '',
        command: '',
        validation: '',
      },
    ]);
  };

  const removeTask = (id: string) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((t) => t.id !== id));
    }
  };

  const updateTask = (id: string, field: keyof Task, value: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const handleSave = () => {
    console.log('Lab Data:', labData);
    console.log('Tasks:', tasks);
    // Save to API
    router.push('/instructor/labs');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Create Terminal Lab
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Build interactive terminal-based learning experiences
        </p>
      </div>

      {/* Lab Details */}
      <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="p-6 space-y-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Lab Information
          </h2>

          <div>
            <Label htmlFor="title">Lab Title *</Label>
            <Input
              id="title"
              value={labData.title}
              onChange={(e) => setLabData({ ...labData, title: e.target.value })}
              placeholder="e.g., Docker Basics - Container Management"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={labData.description}
              onChange={(e) => setLabData({ ...labData, description: e.target.value })}
              placeholder="Describe what students will learn in this lab..."
              className="mt-2"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="difficulty">Difficulty Level *</Label>
              <Select
                value={labData.difficulty}
                onValueChange={(value) => setLabData({ ...labData, difficulty: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="time">Estimated Time (min) *</Label>
              <Input
                id="time"
                type="number"
                value={labData.estimatedTime}
                onChange={(e) => setLabData({ ...labData, estimatedTime: e.target.value })}
                placeholder="45"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="scenario">Terminal Scenario *</Label>
              <Select
                value={labData.scenario}
                onValueChange={(value) => setLabData({ ...labData, scenario: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linux">Linux (Ubuntu)</SelectItem>
                  <SelectItem value="docker">Docker</SelectItem>
                  <SelectItem value="kubernetes">Kubernetes</SelectItem>
                  <SelectItem value="git">Git</SelectItem>
                  <SelectItem value="aws">AWS CLI</SelectItem>
                  <SelectItem value="node">Node.js</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Tasks */}
      <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Lab Tasks
            </h2>
            <Button onClick={addTask} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>

          <div className="space-y-6">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="rounded-lg border border-slate-200 p-6 dark:border-slate-700"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Task {index + 1}
                  </h3>
                  {tasks.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTask(task.id)}
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`task-title-${task.id}`}>Task Title *</Label>
                    <Input
                      id={`task-title-${task.id}`}
                      value={task.title}
                      onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                      placeholder="e.g., Pull an Image"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`task-desc-${task.id}`}>Description *</Label>
                    <Textarea
                      id={`task-desc-${task.id}`}
                      value={task.description}
                      onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                      placeholder="Describe what the student needs to do..."
                      className="mt-2"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`task-command-${task.id}`}>Hint Command (Optional)</Label>
                    <Input
                      id={`task-command-${task.id}`}
                      value={task.command}
                      onChange={(e) => updateTask(task.id, 'command', e.target.value)}
                      placeholder="e.g., docker pull nginx"
                      className="mt-2 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`task-validation-${task.id}`}>Validation String *</Label>
                    <Input
                      id={`task-validation-${task.id}`}
                      value={task.validation}
                      onChange={(e) => updateTask(task.id, 'validation', e.target.value)}
                      placeholder="e.g., Status: Downloaded"
                      className="mt-2"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      The text to look for in the command output to mark this task as complete
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Preview & Save */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          Preview Lab
        </Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          <Save className="mr-2 h-4 w-4" />
          Save Lab
        </Button>
      </div>

      {/* Tips */}
      <Card className="border-blue-200 bg-blue-50/80 backdrop-blur-sm dark:border-blue-900 dark:bg-blue-950/80">
        <div className="p-6">
          <h3 className="mb-3 flex items-center font-semibold text-blue-900 dark:text-blue-300">
            <Terminal className="mr-2 h-5 w-5" />
            Lab Creation Tips
          </h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-blue-800 dark:text-blue-400">
            <li>Break down complex topics into small, achievable tasks</li>
            <li>Provide clear, concise descriptions for each task</li>
            <li>Use validation strings that are unique to the expected output</li>
            <li>Add hint commands to guide students who get stuck</li>
            <li>Test your lab thoroughly before publishing</li>
            <li>Consider the estimated time carefully based on difficulty</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
