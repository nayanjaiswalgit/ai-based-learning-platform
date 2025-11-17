'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Code, FileText, Eye, EyeOff, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIContentGeneratorDialog } from './AIContentGeneratorDialog';

const API_BASE = process.env.NEXT_PUBLIC_COURSE_SERVICE_URL || 'http://localhost:3002';

interface LessonContentManagerProps {
  lessonId: string;
  courseId: string;
  moduleId: string;
  lessonTitle: string;
  currentContent?: string;
  onSave?: (content: string) => void;
}

interface Resource {
  id?: string;
  title: string;
  url: string;
  type: 'LINK' | 'FILE' | 'VIDEO' | 'DOCUMENT';
}

export function LessonContentManager({
  lessonId,
  courseId,
  moduleId,
  lessonTitle,
  currentContent = '',
  onSave,
}: LessonContentManagerProps) {
  const [content, setContent] = useState(currentContent);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiDialogType, setAiDialogType] = useState<'mcq' | 'coding-lab' | 'explanation'>('mcq');
  const { toast } = useToast();

  useEffect(() => {
    fetchLessonDetails();
  }, [lessonId]);

  const fetchLessonDetails = async () => {
    try {
      const response = await fetch(`${API_BASE}/lessons/${lessonId}`);
      if (response.ok) {
        const lesson = await response.json();
        setContent(lesson.content || '');
        setIsFreePreview(lesson.isFreePreview || false);
        setResources(lesson.resources || []);
      }
    } catch (error) {
      console.error('Failed to fetch lesson details:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE}/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          isFreePreview,
          resources,
        }),
      });

      if (!response.ok) throw new Error('Failed to save lesson');

      toast({
        title: 'Lesson saved!',
        description: 'Your changes have been saved successfully',
      });

      onSave?.(content);
    } catch (error) {
      toast({
        title: 'Failed to save',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateQuiz = () => {
    setAiDialogType('mcq');
    setShowAIDialog(true);
  };

  const handleGenerateCodingLab = () => {
    setAiDialogType('coding-lab');
    setShowAIDialog(true);
  };

  const handleGenerateExplanation = () => {
    setAiDialogType('explanation');
    setShowAIDialog(true);
  };

  const handleAIGenerate = (generatedContent: any) => {
    // Append AI-generated content to existing content
    let newContent = content;

    if (aiDialogType === 'mcq' && generatedContent.questions) {
      newContent += '\n\n## Quiz Questions\n\n';
      generatedContent.questions.forEach((q: any, index: number) => {
        newContent += `${index + 1}. **${q.question}**\n`;
        q.options.forEach((opt: string, i: number) => {
          newContent += `   ${String.fromCharCode(65 + i)}. ${opt}\n`;
        });
        newContent += `   *Correct Answer: ${q.correctAnswer}*\n`;
        if (q.explanation) {
          newContent += `   *Explanation: ${q.explanation}*\n`;
        }
        newContent += '\n';
      });
    } else if (aiDialogType === 'coding-lab' && generatedContent.problem) {
      newContent += '\n\n## Coding Challenge\n\n';
      newContent += `**${generatedContent.problem.title}**\n\n`;
      newContent += `${generatedContent.problem.description}\n\n`;
      if (generatedContent.problem.starterCode) {
        newContent += '```\n' + generatedContent.problem.starterCode + '\n```\n\n';
      }
    } else if (aiDialogType === 'explanation' && generatedContent.explanation) {
      newContent += '\n\n' + generatedContent.explanation + '\n\n';
    }

    setContent(newContent);
    toast({
      title: 'Content added!',
      description: 'AI-generated content has been added to your lesson',
    });
  };

  const handleAddResource = () => {
    setResources([
      ...resources,
      { title: '', url: '', type: 'LINK' },
    ]);
  };

  const handleUpdateResource = (index: number, field: keyof Resource, value: string) => {
    const newResources = [...resources];
    (newResources[index] as any)[field] = value;
    setResources(newResources);
  };

  const handleRemoveResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Editing: {lessonTitle}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFreePreview(!isFreePreview)}
              >
                {isFreePreview ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Free Preview
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Paid Content
                  </>
                )}
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Manage lesson content, resources, and AI-generated materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="content">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Content Editor</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              {/* AI Generation Tools */}
              <div className="flex flex-wrap gap-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="w-full text-sm font-medium text-purple-900 mb-2">
                  AI Content Generation Tools
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateQuiz}
                  className="border-purple-300"
                >
                  <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                  Generate Quiz
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateCodingLab}
                  className="border-purple-300"
                >
                  <Code className="h-4 w-4 mr-2 text-purple-600" />
                  Generate Coding Lab
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateExplanation}
                  className="border-purple-300"
                >
                  <FileText className="h-4 w-4 mr-2 text-purple-600" />
                  Generate Explanation
                </Button>
              </div>

              {/* Content Editor */}
              <div>
                <Label htmlFor="content">Lesson Content (Markdown supported)</Label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[400px] px-3 py-2 border rounded-md font-mono text-sm"
                  placeholder="Write your lesson content here. You can use Markdown formatting..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {content.length} characters
                </p>
              </div>

              {/* Content Preview */}
              <div>
                <Label>Preview</Label>
                <div className="border rounded-md p-4 bg-gray-50 min-h-[200px] prose prose-sm max-w-none">
                  {content ? (
                    <div className="whitespace-pre-wrap">{content}</div>
                  ) : (
                    <p className="text-gray-400">Content preview will appear here...</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Add supplementary resources for students
                </p>
                <Button onClick={handleAddResource} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              </div>

              {resources.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No resources added yet</p>
                  <Button
                    onClick={handleAddResource}
                    size="sm"
                    variant="outline"
                    className="mt-4"
                  >
                    Add First Resource
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {resources.map((resource, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-[1fr_1fr_120px_40px] gap-3 items-start">
                          <div>
                            <Label className="text-xs">Title</Label>
                            <Input
                              value={resource.title}
                              onChange={(e) =>
                                handleUpdateResource(index, 'title', e.target.value)
                              }
                              placeholder="Resource title"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">URL</Label>
                            <Input
                              value={resource.url}
                              onChange={(e) =>
                                handleUpdateResource(index, 'url', e.target.value)
                              }
                              placeholder="https://..."
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Type</Label>
                            <select
                              value={resource.type}
                              onChange={(e) =>
                                handleUpdateResource(index, 'type', e.target.value)
                              }
                              className="mt-1 w-full px-3 py-2 border rounded-md text-sm"
                            >
                              <option value="LINK">Link</option>
                              <option value="FILE">File</option>
                              <option value="VIDEO">Video</option>
                              <option value="DOCUMENT">Document</option>
                            </select>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveResource(index)}
                            className="mt-5"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Content Generator Dialog */}
      <AIContentGeneratorDialog
        open={showAIDialog}
        onOpenChange={setShowAIDialog}
        contentType={aiDialogType}
        context={{
          courseId,
          moduleId,
          lessonId,
        }}
        onGenerate={handleAIGenerate}
      />
    </div>
  );
}
