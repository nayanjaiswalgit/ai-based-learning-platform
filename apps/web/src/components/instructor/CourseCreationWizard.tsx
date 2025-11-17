'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ChevronRight, ChevronLeft, Sparkles, Edit, Eye, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const API_BASE = process.env.NEXT_PUBLIC_COURSE_SERVICE_URL || 'http://localhost:3002';

// Schemas
const basicInfoSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  price: z.number().min(0, 'Price must be positive'),
  category: z.string().min(1, 'Category is required'),
});

const aiGenerationSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  moduleCount: z.number().min(1).max(20),
  lessonsPerModule: z.number().min(1).max(15),
});

type BasicInfo = z.infer<typeof basicInfoSchema>;
type AIGeneration = z.infer<typeof aiGenerationSchema>;

interface Module {
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Lesson {
  title: string;
  description: string;
  content: string;
  isFreePreview: boolean;
  durationMinutes: number;
}

interface CourseCreationWizardProps {
  onComplete?: (courseId: string) => void;
  instructorId: string;
}

const STEPS = [
  { id: 1, name: 'Basic Info', description: 'Course details' },
  { id: 2, name: 'Creation Method', description: 'Manual or AI' },
  { id: 3, name: 'Content', description: 'Add modules & lessons' },
  { id: 4, name: 'Review', description: 'Review & publish' },
];

export function CourseCreationWizard({ onComplete, instructorId }: CourseCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
  const [creationMethod, setCreationMethod] = useState<'manual' | 'ai' | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const { toast } = useToast();

  const basicForm = useForm<BasicInfo>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: '',
      description: '',
      difficulty: 'INTERMEDIATE',
      price: 0,
      category: '',
    },
  });

  const aiForm = useForm<AIGeneration>({
    resolver: zodResolver(aiGenerationSchema),
    defaultValues: {
      prompt: '',
      moduleCount: 5,
      lessonsPerModule: 5,
    },
  });

  const progress = (currentStep / STEPS.length) * 100;

  // Step 1: Submit basic info
  const handleBasicInfoSubmit = (data: BasicInfo) => {
    setBasicInfo(data);
    setCurrentStep(2);
  };

  // Step 2: Generate course with AI
  const handleAIGeneration = async (data: AIGeneration) => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/courses/generate-outline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: data.prompt,
          difficulty: basicInfo?.difficulty,
          moduleCount: data.moduleCount,
          lessonsPerModule: data.lessonsPerModule,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate course outline');

      const result = await response.json();

      // Transform AI-generated outline to our module structure
      const generatedModules: Module[] = result.modules.map((mod: any) => ({
        title: mod.title,
        description: mod.description,
        lessons: mod.lessons.map((lesson: any) => ({
          title: lesson.title,
          description: lesson.description || '',
          content: lesson.content || '',
          isFreePreview: false,
          durationMinutes: lesson.estimatedDuration || 30,
        })),
      }));

      setModules(generatedModules);
      setCurrentStep(3);

      toast({
        title: 'Course outline generated!',
        description: `Created ${generatedModules.length} modules with AI`,
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

  // Manual module addition
  const handleAddManualModule = () => {
    setModules([
      ...modules,
      {
        title: 'New Module',
        description: 'Module description',
        lessons: [],
      },
    ]);
  };

  const handleAddLesson = (moduleIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons.push({
      title: 'New Lesson',
      description: '',
      content: '',
      isFreePreview: false,
      durationMinutes: 30,
    });
    setModules(newModules);
  };

  const handleUpdateModule = (index: number, field: keyof Module, value: string) => {
    const newModules = [...modules];
    (newModules[index] as any)[field] = value;
    setModules(newModules);
  };

  const handleUpdateLesson = (
    moduleIndex: number,
    lessonIndex: number,
    field: keyof Lesson,
    value: string | boolean | number
  ) => {
    const newModules = [...modules];
    (newModules[moduleIndex].lessons[lessonIndex] as any)[field] = value;
    setModules(newModules);
  };

  const handleRemoveModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const handleRemoveLesson = (moduleIndex: number, lessonIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter(
      (_, i) => i !== lessonIndex
    );
    setModules(newModules);
  };

  // Final submission
  const handlePublishCourse = async (asDraft: boolean) => {
    if (!basicInfo) return;

    setIsDraft(asDraft);
    setIsGenerating(true);

    try {
      const payload = {
        title: basicInfo.title,
        description: basicInfo.description,
        difficulty: basicInfo.difficulty,
        price: basicInfo.price,
        category: basicInfo.category,
        instructorId,
        status: asDraft ? 'DRAFT' : 'PUBLISHED',
        modules: modules.map((mod, modOrder) => ({
          title: mod.title,
          description: mod.description,
          order: modOrder,
          lessons: mod.lessons.map((lesson, lessonOrder) => ({
            title: lesson.title,
            description: lesson.description,
            content: lesson.content,
            isFreePreview: lesson.isFreePreview,
            order: lessonOrder,
            durationMinutes: lesson.durationMinutes,
          })),
        })),
      };

      const response = await fetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create course');

      const result = await response.json();

      toast({
        title: asDraft ? 'Draft saved!' : 'Course published!',
        description: `Your course has been ${asDraft ? 'saved as draft' : 'published successfully'}`,
      });

      onComplete?.(result.id);
    } catch (error) {
      toast({
        title: 'Failed to create course',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create New Course</h2>
          <span className="text-sm text-gray-500">
            Step {currentStep} of {STEPS.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex-1 text-center ${
                currentStep >= step.id ? 'text-blue-600 font-medium' : ''
              }`}
            >
              {step.name}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Course Basic Information</CardTitle>
            <CardDescription>
              Enter the fundamental details about your course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={basicForm.handleSubmit(handleBasicInfoSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  {...basicForm.register('title')}
                  placeholder="e.g., Complete Web Development Bootcamp"
                />
                {basicForm.formState.errors.title && (
                  <p className="text-sm text-red-500 mt-1">
                    {basicForm.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  {...basicForm.register('description')}
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                  placeholder="Describe what students will learn in this course..."
                />
                {basicForm.formState.errors.description && (
                  <p className="text-sm text-red-500 mt-1">
                    {basicForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    onValueChange={(value) =>
                      basicForm.setValue('difficulty', value as any)
                    }
                    defaultValue="INTERMEDIATE"
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
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...basicForm.register('price', { valueAsNumber: true })}
                    placeholder="49.99"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    {...basicForm.register('category')}
                    placeholder="Development"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Choose Creation Method */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Choose Creation Method</CardTitle>
              <CardDescription>
                Create your course manually or use AI to generate an outline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={creationMethod || undefined} onValueChange={(v) => setCreationMethod(v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ai">
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI-Assisted
                  </TabsTrigger>
                  <TabsTrigger value="manual">
                    <Edit className="mr-2 h-4 w-4" />
                    Manual
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ai" className="space-y-4 mt-4">
                  <form
                    onSubmit={aiForm.handleSubmit(handleAIGeneration)}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="prompt">Describe your course</Label>
                      <textarea
                        id="prompt"
                        {...aiForm.register('prompt')}
                        className="w-full min-h-[120px] px-3 py-2 border rounded-md"
                        placeholder="e.g., Create a comprehensive course on React.js covering hooks, state management, and best practices..."
                      />
                      {aiForm.formState.errors.prompt && (
                        <p className="text-sm text-red-500 mt-1">
                          {aiForm.formState.errors.prompt.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="moduleCount">Number of Modules</Label>
                        <Input
                          id="moduleCount"
                          type="number"
                          {...aiForm.register('moduleCount', { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lessonsPerModule">Lessons per Module</Label>
                        <Input
                          id="lessonsPerModule"
                          type="number"
                          {...aiForm.register('lessonsPerModule', { valueAsNumber: true })}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button type="submit" disabled={isGenerating}>
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate with AI
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="manual" className="mt-4">
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      Start with an empty course and add modules manually
                    </p>
                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button onClick={() => setCurrentStep(3)}>
                        Continue to Add Content
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Content Creation/Editing */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Course Content</CardTitle>
            <CardDescription>
              {creationMethod === 'ai'
                ? 'Review and edit the AI-generated content'
                : 'Add modules and lessons to your course'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {modules.map((module, modIndex) => (
              <Card key={modIndex} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={module.title}
                        onChange={(e) =>
                          handleUpdateModule(modIndex, 'title', e.target.value)
                        }
                        className="font-semibold"
                        placeholder="Module title"
                      />
                      <Input
                        value={module.description}
                        onChange={(e) =>
                          handleUpdateModule(modIndex, 'description', e.target.value)
                        }
                        placeholder="Module description"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveModule(modIndex)}
                    >
                      Remove
                    </Button>
                  </div>

                  {/* Lessons */}
                  <div className="ml-4 space-y-2">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lessonIndex}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                      >
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Input
                            value={lesson.title}
                            onChange={(e) =>
                              handleUpdateLesson(
                                modIndex,
                                lessonIndex,
                                'title',
                                e.target.value
                              )
                            }
                            placeholder="Lesson title"
                            className="text-sm"
                          />
                          <Input
                            value={lesson.durationMinutes}
                            type="number"
                            onChange={(e) =>
                              handleUpdateLesson(
                                modIndex,
                                lessonIndex,
                                'durationMinutes',
                                parseInt(e.target.value)
                              )
                            }
                            placeholder="Duration (min)"
                            className="text-sm"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLesson(modIndex, lessonIndex)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddLesson(modIndex)}
                    >
                      + Add Lesson
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" onClick={handleAddManualModule} className="w-full">
              + Add Module
            </Button>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep(4)}
                disabled={modules.length === 0}
              >
                Continue to Review
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review and Publish */}
      {currentStep === 4 && basicInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Review Your Course</CardTitle>
            <CardDescription>
              Review all details before publishing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info Review */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{basicInfo.title}</h3>
              <p className="text-gray-600">{basicInfo.description}</p>
              <div className="flex gap-4 text-sm">
                <span className="px-2 py-1 bg-blue-100 rounded">
                  {basicInfo.difficulty}
                </span>
                <span className="px-2 py-1 bg-green-100 rounded">
                  ${basicInfo.price}
                </span>
                <span className="px-2 py-1 bg-purple-100 rounded">
                  {basicInfo.category}
                </span>
              </div>
            </div>

            {/* Content Summary */}
            <div>
              <h4 className="font-semibold mb-2">Course Content</h4>
              <div className="space-y-2">
                {modules.map((module, i) => (
                  <div key={i} className="pl-4 border-l-2">
                    <p className="font-medium">{module.title}</p>
                    <p className="text-sm text-gray-600">
                      {module.lessons.length} lessons
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Total: {modules.length} modules,{' '}
                {modules.reduce((acc, mod) => acc + mod.lessons.length, 0)} lessons
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Edit
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePublishCourse(true)}
                  disabled={isGenerating}
                >
                  {isGenerating && isDraft ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="mr-2 h-4 w-4" />
                  )}
                  Save as Draft
                </Button>
                <Button
                  onClick={() => handlePublishCourse(false)}
                  disabled={isGenerating}
                >
                  {isGenerating && !isDraft ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Publish Course
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
