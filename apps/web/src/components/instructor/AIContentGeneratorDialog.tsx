'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Sparkles, Copy, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const API_BASE = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3009';

// Schemas
const mcqSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  count: z.number().min(1).max(20),
  context: z.string().optional(),
});

const codingLabSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description required'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  language: z.string().default('javascript'),
  tags: z.string().optional(),
});

const courseSchema = z.object({
  topic: z.string().min(5, 'Topic must be at least 5 characters'),
  targetAudience: z.string().optional(),
  duration: z.string().optional(),
  keyTopics: z.string().optional(),
});

const explanationSchema = z.object({
  concept: z.string().min(5, 'Concept must be at least 5 characters'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  includeExamples: z.boolean().default(true),
});

type MCQForm = z.infer<typeof mcqSchema>;
type CodingLabForm = z.infer<typeof codingLabSchema>;
type CourseForm = z.infer<typeof courseSchema>;
type ExplanationForm = z.infer<typeof explanationSchema>;

interface AIContentGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: 'mcq' | 'coding-lab' | 'course' | 'explanation';
  context?: {
    courseId?: string;
    moduleId?: string;
    lessonId?: string;
  };
  onGenerate: (content: any) => void;
}

export function AIContentGeneratorDialog({
  open,
  onOpenChange,
  contentType,
  context,
  onGenerate,
}: AIContentGeneratorDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const { toast } = useToast();

  const mcqForm = useForm<MCQForm>({
    resolver: zodResolver(mcqSchema),
    defaultValues: {
      topic: '',
      difficulty: 'MEDIUM',
      count: 5,
      context: '',
    },
  });

  const codingLabForm = useForm<CodingLabForm>({
    resolver: zodResolver(codingLabSchema),
    defaultValues: {
      title: '',
      description: '',
      difficulty: 'MEDIUM',
      language: 'javascript',
      tags: '',
    },
  });

  const courseForm = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      topic: '',
      targetAudience: '',
      duration: '',
      keyTopics: '',
    },
  });

  const explanationForm = useForm<ExplanationForm>({
    resolver: zodResolver(explanationSchema),
    defaultValues: {
      concept: '',
      level: 'INTERMEDIATE',
      includeExamples: true,
    },
  });

  // Generate MCQ Questions
  const generateMCQ = async (data: MCQForm) => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/content-generation/mcq/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: data.topic,
          difficulty: data.difficulty,
          count: data.count,
          context: data.context,
          courseId: context?.courseId,
          moduleId: context?.moduleId,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate MCQ questions');

      const result = await response.json();
      setGeneratedContent(result);

      toast({
        title: 'MCQ Questions Generated!',
        description: `Created ${data.count} questions on ${data.topic}`,
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

  // Generate Coding Lab
  const generateCodingLab = async (data: CodingLabForm) => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/content-generation/generate-coding-lab`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          difficulty: data.difficulty,
          language: data.language,
          tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
          courseId: context?.courseId,
          lessonId: context?.lessonId,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate coding lab');

      const result = await response.json();
      setGeneratedContent(result);

      toast({
        title: 'Coding Lab Generated!',
        description: `Created lab: ${data.title}`,
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

  // Generate Course Outline
  const generateCourse = async (data: CourseForm) => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/content-generation/generate-course`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: data.topic,
          targetAudience: data.targetAudience,
          duration: data.duration,
          keyTopics: data.keyTopics ? data.keyTopics.split(',').map(t => t.trim()) : [],
        }),
      });

      if (!response.ok) throw new Error('Failed to generate course');

      const result = await response.json();
      setGeneratedContent(result);

      toast({
        title: 'Course Outline Generated!',
        description: `Created outline for: ${data.topic}`,
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

  // Generate Explanation
  const generateExplanation = async (data: ExplanationForm) => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/content-generation/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: data.concept,
          level: data.level,
          includeExamples: data.includeExamples,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate explanation');

      const result = await response.json();
      setGeneratedContent(result);

      toast({
        title: 'Explanation Generated!',
        description: `Generated explanation for: ${data.concept}`,
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

  const handleUseContent = () => {
    if (generatedContent) {
      onGenerate(generatedContent);
      onOpenChange(false);
      setGeneratedContent(null);
    }
  };

  const handleRegenerate = () => {
    setGeneratedContent(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Content copied to clipboard',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Content Generator
          </DialogTitle>
          <DialogDescription>
            Generate high-quality content using AI
          </DialogDescription>
        </DialogHeader>

        {!generatedContent ? (
          <div className="space-y-4">
            {/* MCQ Generation */}
            {contentType === 'mcq' && (
              <form onSubmit={mcqForm.handleSubmit(generateMCQ)} className="space-y-4">
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    {...mcqForm.register('topic')}
                    placeholder="e.g., React Hooks"
                  />
                  {mcqForm.formState.errors.topic && (
                    <p className="text-sm text-red-500 mt-1">
                      {mcqForm.formState.errors.topic.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      onValueChange={(value) =>
                        mcqForm.setValue('difficulty', value as any)
                      }
                      defaultValue="MEDIUM"
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EASY">Easy</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HARD">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="count">Number of Questions</Label>
                    <Input
                      id="count"
                      type="number"
                      {...mcqForm.register('count', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="context">Context (Optional)</Label>
                  <textarea
                    id="context"
                    {...mcqForm.register('context')}
                    className="w-full min-h-[80px] px-3 py-2 border rounded-md"
                    placeholder="Provide additional context for better questions..."
                  />
                </div>

                <Button type="submit" disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate MCQ Questions
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Coding Lab Generation */}
            {contentType === 'coding-lab' && (
              <form onSubmit={codingLabForm.handleSubmit(generateCodingLab)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Lab Title</Label>
                  <Input
                    id="title"
                    {...codingLabForm.register('title')}
                    placeholder="e.g., Build a Todo App"
                  />
                  {codingLabForm.formState.errors.title && (
                    <p className="text-sm text-red-500 mt-1">
                      {codingLabForm.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    {...codingLabForm.register('description')}
                    className="w-full min-h-[80px] px-3 py-2 border rounded-md"
                    placeholder="Describe what students will build..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      onValueChange={(value) =>
                        codingLabForm.setValue('difficulty', value as any)
                      }
                      defaultValue="MEDIUM"
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EASY">Easy</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HARD">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select
                      onValueChange={(value) => codingLabForm.setValue('language', value)}
                      defaultValue="javascript"
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      {...codingLabForm.register('tags')}
                      placeholder="react, hooks"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Coding Lab
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Course Generation */}
            {contentType === 'course' && (
              <form onSubmit={courseForm.handleSubmit(generateCourse)} className="space-y-4">
                <div>
                  <Label htmlFor="topic">Course Topic</Label>
                  <Input
                    id="topic"
                    {...courseForm.register('topic')}
                    placeholder="e.g., Full Stack Web Development"
                  />
                  {courseForm.formState.errors.topic && (
                    <p className="text-sm text-red-500 mt-1">
                      {courseForm.formState.errors.topic.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    {...courseForm.register('targetAudience')}
                    placeholder="e.g., Beginners with basic programming knowledge"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Expected Duration</Label>
                  <Input
                    id="duration"
                    {...courseForm.register('duration')}
                    placeholder="e.g., 10 weeks, 50 hours"
                  />
                </div>

                <div>
                  <Label htmlFor="keyTopics">Key Topics (comma-separated)</Label>
                  <Input
                    id="keyTopics"
                    {...courseForm.register('keyTopics')}
                    placeholder="e.g., HTML, CSS, JavaScript, React, Node.js"
                  />
                </div>

                <Button type="submit" disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Course Outline
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Explanation Generation */}
            {contentType === 'explanation' && (
              <form onSubmit={explanationForm.handleSubmit(generateExplanation)} className="space-y-4">
                <div>
                  <Label htmlFor="concept">Concept to Explain</Label>
                  <Input
                    id="concept"
                    {...explanationForm.register('concept')}
                    placeholder="e.g., Closures in JavaScript"
                  />
                  {explanationForm.formState.errors.concept && (
                    <p className="text-sm text-red-500 mt-1">
                      {explanationForm.formState.errors.concept.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="level">Explanation Level</Label>
                  <Select
                    onValueChange={(value) =>
                      explanationForm.setValue('level', value as any)
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

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includeExamples"
                    {...explanationForm.register('includeExamples')}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="includeExamples">Include code examples</Label>
                </div>

                <Button type="submit" disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Explanation
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        ) : (
          // Display Generated Content
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Generated Content
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(generatedContent, null, 2))}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </CardTitle>
                <CardDescription>Review and use the generated content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(generatedContent, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRegenerate} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
              <Button onClick={handleUseContent} className="flex-1">
                Use This Content
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
