'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { Loader2, Sparkles, Check } from 'lucide-react';

interface AILabGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLabGenerated: (questionId: string, labType: 'coding' | 'terminal', labDetails: any) => void;
  courseTitle?: string;
  moduleTitle?: string;
}

export function AILabGenerationDialog({
  open,
  onOpenChange,
  onLabGenerated,
  courseTitle,
  moduleTitle,
}: AILabGenerationDialogProps) {
  const [step, setStep] = useState<'configure' | 'generating' | 'review'>('configure');
  const [params, setParams] = useState({
    topic: '',
    difficulty: 'INTERMEDIATE' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    labType: 'coding' as 'coding' | 'terminal',
    context: '',
  });
  const [generatedLab, setGeneratedLab] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setStep('generating');
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3005'}/content-generation/generate-coding-lab`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...params,
            courseTitle,
            moduleTitle,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate lab');
      }

      const data = await response.json();
      setGeneratedLab(data);
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStep('configure');
    }
  };

  const handleSave = async () => {
    if (!generatedLab) return;

    try {
      // Save to the questions database
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ASSESSMENT_SERVICE_URL || 'http://localhost:3003'}/questions/from-ai-generation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            generatedContent: generatedLab,
            labType: params.labType,
            createdBy: 'current-user-id', // TODO: Get from auth context
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save lab');
      }

      const savedQuestion = await response.json();

      // Call the callback with the saved question ID
      onLabGenerated(savedQuestion.id, params.labType, generatedLab);

      // Reset state and close dialog
      setStep('configure');
      setParams({
        topic: '',
        difficulty: 'INTERMEDIATE',
        labType: 'coding',
        context: '',
      });
      setGeneratedLab(null);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save lab');
    }
  };

  const handleClose = () => {
    setStep('configure');
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Generate Lab with AI
          </DialogTitle>
          <DialogDescription>
            Use AI to create a coding challenge or terminal lab tailored to your course
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Step 1: Configure */}
        {step === 'configure' && (
          <div className="space-y-4 mt-4">
            {/* Lab Type */}
            <div>
              <Label>Lab Type</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => setParams({ ...params, labType: 'coding' })}
                  className={`p-3 border-2 rounded-lg transition-colors text-left ${
                    params.labType === 'coding'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-sm">Coding Challenge</div>
                  <div className="text-xs text-gray-600">
                    Programming problems with test cases
                  </div>
                </button>
                <button
                  onClick={() => setParams({ ...params, labType: 'terminal' })}
                  className={`p-3 border-2 rounded-lg transition-colors text-left ${
                    params.labType === 'terminal'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-sm">Terminal Lab</div>
                  <div className="text-xs text-gray-600">
                    Command-line challenges
                  </div>
                </button>
              </div>
            </div>

            {/* Topic */}
            <div>
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                value={params.topic}
                onChange={(e) => setParams({ ...params, topic: e.target.value })}
                placeholder="e.g., Binary Search Trees, Docker Networking"
                className="mt-1"
              />
            </div>

            {/* Difficulty */}
            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={params.difficulty}
                onValueChange={(value: any) => setParams({ ...params, difficulty: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Context */}
            <div>
              <Label htmlFor="context">Additional Context (Optional)</Label>
              <Textarea
                id="context"
                value={params.context}
                onChange={(e) => setParams({ ...params, context: e.target.value })}
                placeholder="Provide specific requirements or focus areas..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={!params.topic}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Lab
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Generating */}
        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <h3 className="text-lg font-semibold mt-4">Generating Your Lab...</h3>
            <p className="text-sm text-gray-600 mt-2">
              Creating a {params.labType} lab about {params.topic}
            </p>
            <p className="text-xs text-gray-500 mt-2">This usually takes 10-30 seconds</p>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 'review' && generatedLab && (
          <div className="space-y-4 mt-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Lab generated successfully!</p>
                <p className="text-xs text-green-700 mt-1">
                  Review the details below and click Save to add it to your lesson.
                </p>
              </div>
            </div>

            {/* Title */}
            <div>
              <Label>Title</Label>
              <Input
                value={generatedLab.title}
                onChange={(e) =>
                  setGeneratedLab({ ...generatedLab, title: e.target.value })
                }
                className="mt-1"
              />
            </div>

            {/* Description Preview */}
            <div>
              <Label>Description</Label>
              <div className="mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50 max-h-40 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {generatedLab.description}
                </p>
              </div>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Difficulty</Label>
                <p className="text-sm font-medium mt-1">{generatedLab.difficulty}</p>
              </div>
              <div>
                <Label className="text-xs">Estimated Time</Label>
                <p className="text-sm font-medium mt-1">
                  {generatedLab.estimatedMinutes} minutes
                </p>
              </div>
            </div>

            {/* Summary */}
            {params.labType === 'coding' && generatedLab.testCases && (
              <div>
                <Label className="text-xs">Test Cases</Label>
                <p className="text-sm mt-1">{generatedLab.testCases.length} test cases generated</p>
              </div>
            )}

            {params.labType === 'terminal' && generatedLab.tasks && (
              <div>
                <Label className="text-xs">Tasks</Label>
                <p className="text-sm mt-1">{generatedLab.tasks.length} hands-on tasks</p>
              </div>
            )}

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep('configure')}>
                Regenerate
              </Button>
              <Button onClick={handleSave}>
                <Check className="w-4 h-4 mr-2" />
                Save Lab
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
