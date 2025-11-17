'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  Video,
  FileText,
  Code,
  HelpCircle,
  Save,
  Eye,
} from 'lucide-react';

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'coding' | 'quiz';
  duration: number;
  isFree: boolean;
  order: number;
}

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const [modules, setModules] = useState<Module[]>([
    {
      id: '1',
      title: 'Introduction to React',
      description: 'Learn the basics of React',
      order: 1,
      lessons: [
        { id: '1-1', title: 'What is React?', type: 'video', duration: 15, isFree: true, order: 1 },
        { id: '1-2', title: 'Setting up your environment', type: 'article', duration: 10, isFree: false, order: 2 },
      ],
    },
  ]);

  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [newModule, setNewModule] = useState({ title: '', description: '' });
  const [newLesson, setNewLesson] = useState({
    title: '',
    type: 'video' as const,
    duration: 0,
    isFree: false,
  });

  const addModule = () => {
    const module: Module = {
      id: Date.now().toString(),
      title: newModule.title,
      description: newModule.description,
      order: modules.length + 1,
      lessons: [],
    };
    setModules([...modules, module]);
    setNewModule({ title: '', description: '' });
    setIsAddModuleOpen(false);
  };

  const addLesson = () => {
    const moduleIndex = modules.findIndex((m) => m.id === selectedModuleId);
    if (moduleIndex === -1) return;

    const lesson: Lesson = {
      id: Date.now().toString(),
      title: newLesson.title,
      type: newLesson.type,
      duration: newLesson.duration,
      isFree: newLesson.isFree,
      order: modules[moduleIndex].lessons.length + 1,
    };

    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons.push(lesson);
    setModules(updatedModules);
    setNewLesson({ title: '', type: 'video', duration: 0, isFree: false });
    setIsAddLessonOpen(false);
  };

  const deleteModule = (moduleId: string) => {
    setModules(modules.filter((m) => m.id !== moduleId));
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    const updatedModules = modules.map((module) => {
      if (module.id === moduleId) {
        return {
          ...module,
          lessons: module.lessons.filter((l) => l.id !== lessonId),
        };
      }
      return module;
    });
    setModules(updatedModules);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'article':
        return <FileText className="h-5 w-5" />;
      case 'coding':
        return <Code className="h-5 w-5" />;
      case 'quiz':
        return <HelpCircle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Edit Course
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Manage your course content and curriculum
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="curriculum" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum" className="space-y-6">
          {/* Add Module Button */}
          <div className="flex justify-end">
            <Dialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Module
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Module</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="module-title">Module Title</Label>
                    <Input
                      id="module-title"
                      value={newModule.title}
                      onChange={(e) =>
                        setNewModule({ ...newModule, title: e.target.value })
                      }
                      placeholder="e.g., Introduction to React"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="module-description">Description</Label>
                    <Textarea
                      id="module-description"
                      value={newModule.description}
                      onChange={(e) =>
                        setNewModule({ ...newModule, description: e.target.value })
                      }
                      placeholder="Brief description of this module"
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                  <Button onClick={addModule} className="w-full">
                    Add Module
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Modules List */}
          <div className="space-y-4">
            {modules.map((module, moduleIndex) => (
              <Card
                key={module.id}
                className="overflow-hidden border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80"
              >
                {/* Module Header */}
                <div className="flex items-center justify-between bg-slate-50 p-4 dark:bg-slate-800">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 cursor-move text-slate-400" />
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Module {moduleIndex + 1}: {module.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {module.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog
                      open={isAddLessonOpen && selectedModuleId === module.id}
                      onOpenChange={(open) => {
                        setIsAddLessonOpen(open);
                        if (open) setSelectedModuleId(module.id);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Lesson
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Lesson</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="lesson-title">Lesson Title</Label>
                            <Input
                              id="lesson-title"
                              value={newLesson.title}
                              onChange={(e) =>
                                setNewLesson({ ...newLesson, title: e.target.value })
                              }
                              placeholder="e.g., Introduction to Components"
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lesson-type">Lesson Type</Label>
                            <Select
                              value={newLesson.type}
                              onValueChange={(value: any) =>
                                setNewLesson({ ...newLesson, type: value })
                              }
                            >
                              <SelectTrigger className="mt-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="article">Article</SelectItem>
                                <SelectItem value="coding">Coding Exercise</SelectItem>
                                <SelectItem value="quiz">Quiz</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                            <Input
                              id="lesson-duration"
                              type="number"
                              value={newLesson.duration}
                              onChange={(e) =>
                                setNewLesson({
                                  ...newLesson,
                                  duration: parseInt(e.target.value) || 0,
                                })
                              }
                              className="mt-2"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="lesson-free"
                              checked={newLesson.isFree}
                              onChange={(e) =>
                                setNewLesson({ ...newLesson, isFree: e.target.checked })
                              }
                              className="h-4 w-4"
                            />
                            <Label htmlFor="lesson-free">Free preview</Label>
                          </div>
                          <Button onClick={addLesson} className="w-full">
                            Add Lesson
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteModule(module.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                {/* Lessons List */}
                <div className="p-4">
                  {module.lessons.length === 0 ? (
                    <div className="py-8 text-center text-slate-500">
                      No lessons yet. Add your first lesson to this module.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="h-4 w-4 cursor-move text-slate-400" />
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                              {getLessonIcon(lesson.type)}
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white">
                                {lessonIndex + 1}. {lesson.title}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                                <span className="capitalize">{lesson.type}</span>
                                <span>•</span>
                                <span>{lesson.duration} min</span>
                                {lesson.isFree && (
                                  <>
                                    <span>•</span>
                                    <span className="text-green-600">Free preview</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteLesson(module.id, lesson.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {modules.length === 0 && (
              <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
                <div className="p-12 text-center">
                  <p className="text-slate-600 dark:text-slate-400">
                    No modules yet. Create your first module to start building your course.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Course Settings
              </h3>
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                Settings page coming soon...
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Pricing & Coupons
              </h3>
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                Pricing page coming soon...
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Course Analytics
              </h3>
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                Analytics page coming soon...
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
