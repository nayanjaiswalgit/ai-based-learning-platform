'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Trash2,
  Save,
  Eye,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { assessmentApi } from '@/lib/api-client';
import type {
  CreateQuestionRequest,
  CreateQuizRequest,
  QuestionType,
  DifficultyLevel,
} from '@/types/api.types';
import { useToast } from '@/components/ui/use-toast';

interface QuestionOption {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface QuestionForm {
  id: string;
  questionText: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  options: QuestionOption[];
  explanation: string;
  timeLimit?: number;
  points: number;
}

export default function CreateQuizPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'quiz' | 'questions' | 'settings'>('quiz');

  // Quiz metadata
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    courseId: '',
    timeLimit: 3600, // 60 minutes default
    passingPercentage: 70,
  });

  // Quiz settings
  const [quizSettings, setQuizSettings] = useState({
    randomizeQuestions: true,
    shuffleAnswers: true,
    showResultsImmediately: true,
    maxAttempts: 3,
    availableFrom: '',
    availableUntil: '',
  });

  // Questions
  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      id: '1',
      questionText: '',
      type: 'MULTIPLE_CHOICE',
      difficulty: 'MEDIUM',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      explanation: '',
      points: 10,
    },
  ]);

  const addQuestion = () => {
    const newQuestion: QuestionForm = {
      id: Date.now().toString(),
      questionText: '',
      type: 'MULTIPLE_CHOICE',
      difficulty: 'MEDIUM',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      explanation: '',
      points: 10,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof QuestionForm, value: any) => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, [field]: value } : q,
      ),
    );
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [...q.options, { text: '', isCorrect: false }],
          };
        }
        return q;
      }),
    );
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.filter((_, i) => i !== optionIndex),
          };
        }
        return q;
      }),
    );
  };

  const updateOption = (
    questionId: string,
    optionIndex: number,
    field: keyof QuestionOption,
    value: any,
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = {
            ...newOptions[optionIndex],
            [field]: value,
          };
          return { ...q, options: newOptions };
        }
        return q;
      }),
    );
  };

  const validateQuiz = (): boolean => {
    if (!quizData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a quiz title',
        variant: 'destructive',
      });
      return false;
    }

    if (questions.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one question',
        variant: 'destructive',
      });
      return false;
    }

    for (const question of questions) {
      if (!question.questionText.trim()) {
        toast({
          title: 'Validation Error',
          description: 'All questions must have text',
          variant: 'destructive',
        });
        return false;
      }

      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'MULTIPLE_SELECT') {
        if (question.options.length < 2) {
          toast({
            title: 'Validation Error',
            description: 'Questions must have at least 2 options',
            variant: 'destructive',
          });
          return false;
        }

        const hasCorrectAnswer = question.options.some((opt) => opt.isCorrect);
        if (!hasCorrectAnswer) {
          toast({
            title: 'Validation Error',
            description: 'Each question must have at least one correct answer',
            variant: 'destructive',
          });
          return false;
        }

        const emptyOptions = question.options.filter((opt) => !opt.text.trim());
        if (emptyOptions.length > 0) {
          toast({
            title: 'Validation Error',
            description: 'All options must have text',
            variant: 'destructive',
          });
          return false;
        }
      }
    }

    return true;
  };

  const handleSaveQuiz = async () => {
    if (!validateQuiz()) return;

    try {
      setIsLoading(true);

      // Step 1: Create questions
      const createdQuestionIds: string[] = [];

      for (const question of questions) {
        const questionData: CreateQuestionRequest = {
          questionText: question.questionText,
          type: question.type,
          difficulty: question.difficulty,
          options: question.options,
          explanation: question.explanation,
          courseId: quizData.courseId || undefined,
          timeLimit: question.timeLimit,
          points: question.points,
        };

        const response = await assessmentApi.createQuestion(questionData);
        createdQuestionIds.push((response as any).id);
      }

      // Step 2: Create quiz
      const quizRequest: CreateQuizRequest = {
        title: quizData.title,
        description: quizData.description,
        questionIds: createdQuestionIds,
        timeLimit: quizData.timeLimit,
        passingPercentage: quizData.passingPercentage,
        randomizeQuestions: quizSettings.randomizeQuestions,
        shuffleAnswers: quizSettings.shuffleAnswers,
        showResultsImmediately: quizSettings.showResultsImmediately,
        maxAttempts: quizSettings.maxAttempts,
        courseId: quizData.courseId || undefined,
        availableFrom: quizSettings.availableFrom || undefined,
        availableUntil: quizSettings.availableUntil || undefined,
      };

      await assessmentApi.createQuiz(quizRequest);

      toast({
        title: 'Success!',
        description: 'Quiz created successfully',
      });

      setTimeout(() => {
        router.push('/instructor/quizzes');
      }, 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create quiz',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Create New Quiz
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Create a quiz with multiple choice questions
          </p>
        </div>
        <Button
          onClick={handleSaveQuiz}
          disabled={isLoading}
          size="lg"
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Quiz
        </Button>
      </div>

      {/* Step Navigation */}
      <div className="flex gap-2">
        {['quiz', 'questions', 'settings'].map((step) => (
          <Button
            key={step}
            variant={currentStep === step ? 'default' : 'outline'}
            onClick={() => setCurrentStep(step as any)}
            className="capitalize"
          >
            {step}
          </Button>
        ))}
      </div>

      {/* Quiz Details */}
      {currentStep === 'quiz' && (
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-bold">Quiz Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                value={quizData.title}
                onChange={(e) =>
                  setQuizData({ ...quizData, title: e.target.value })
                }
                placeholder="e.g., JavaScript Fundamentals Quiz"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={quizData.description}
                onChange={(e) =>
                  setQuizData({ ...quizData, description: e.target.value })
                }
                placeholder="Brief description of the quiz..."
                className="mt-2"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="courseId">Course ID (optional)</Label>
                <Input
                  id="courseId"
                  value={quizData.courseId}
                  onChange={(e) =>
                    setQuizData({ ...quizData, courseId: e.target.value })
                  }
                  placeholder="Enter course ID"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="passingPercentage">
                  Passing Percentage (%)
                </Label>
                <Input
                  id="passingPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={quizData.passingPercentage}
                  onChange={(e) =>
                    setQuizData({
                      ...quizData,
                      passingPercentage: parseInt(e.target.value) || 70,
                    })
                  }
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="timeLimit">
                Time Limit (seconds)
              </Label>
              <Input
                id="timeLimit"
                type="number"
                min="60"
                max="10800"
                value={quizData.timeLimit}
                onChange={(e) =>
                  setQuizData({
                    ...quizData,
                    timeLimit: parseInt(e.target.value) || 3600,
                  })
                }
                className="mt-2"
              />
              <p className="mt-1 text-xs text-slate-500">
                {Math.floor(quizData.timeLimit / 60)} minutes
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Questions */}
      {currentStep === 'questions' && (
        <div className="space-y-4">
          {questions.map((question, qIndex) => (
            <Card key={question.id} className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Question {qIndex + 1}</h3>
                {questions.length > 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeQuestion(question.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Question Text *</Label>
                  <Textarea
                    value={question.questionText}
                    onChange={(e) =>
                      updateQuestion(question.id, 'questionText', e.target.value)
                    }
                    placeholder="Enter your question..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={question.type}
                      onValueChange={(value) =>
                        updateQuestion(question.id, 'type', value)
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MULTIPLE_CHOICE">
                          Multiple Choice
                        </SelectItem>
                        <SelectItem value="MULTIPLE_SELECT">
                          Multiple Select
                        </SelectItem>
                        <SelectItem value="TRUE_FALSE">
                          True/False
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Difficulty</Label>
                    <Select
                      value={question.difficulty}
                      onValueChange={(value) =>
                        updateQuestion(question.id, 'difficulty', value)
                      }
                    >
                      <SelectTrigger className="mt-2">
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
                    <Label>Points</Label>
                    <Input
                      type="number"
                      min="1"
                      value={question.points}
                      onChange={(e) =>
                        updateQuestion(
                          question.id,
                          'points',
                          parseInt(e.target.value) || 10,
                        )
                      }
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Options */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Answer Options *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(question.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Option
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className="flex items-start gap-2"
                      >
                        <div className="flex items-center pt-3">
                          <Checkbox
                            checked={option.isCorrect}
                            onCheckedChange={(checked) =>
                              updateOption(
                                question.id,
                                optIndex,
                                'isCorrect',
                                checked,
                              )
                            }
                            className="h-5 w-5"
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            value={option.text}
                            onChange={(e) =>
                              updateOption(
                                question.id,
                                optIndex,
                                'text',
                                e.target.value,
                              )
                            }
                            placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                          />
                        </div>
                        {question.options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(question.id, optIndex)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Check the correct answer(s)
                  </p>
                </div>

                {/* Explanation */}
                <div>
                  <Label>Explanation (optional)</Label>
                  <Textarea
                    value={question.explanation}
                    onChange={(e) =>
                      updateQuestion(question.id, 'explanation', e.target.value)
                    }
                    placeholder="Explain why this is the correct answer..."
                    className="mt-2"
                    rows={2}
                  />
                </div>
              </div>
            </Card>
          ))}

          <Button onClick={addQuestion} variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Another Question
          </Button>
        </div>
      )}

      {/* Settings */}
      {currentStep === 'settings' && (
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-bold">Quiz Settings</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Randomize Questions</Label>
                <p className="text-sm text-slate-500">
                  Questions appear in random order for each student
                </p>
              </div>
              <Switch
                checked={quizSettings.randomizeQuestions}
                onCheckedChange={(checked) =>
                  setQuizSettings({
                    ...quizSettings,
                    randomizeQuestions: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Shuffle Answer Options</Label>
                <p className="text-sm text-slate-500">
                  Answer options appear in random order
                </p>
              </div>
              <Switch
                checked={quizSettings.shuffleAnswers}
                onCheckedChange={(checked) =>
                  setQuizSettings({ ...quizSettings, shuffleAnswers: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Results Immediately</Label>
                <p className="text-sm text-slate-500">
                  Students see results right after submission
                </p>
              </div>
              <Switch
                checked={quizSettings.showResultsImmediately}
                onCheckedChange={(checked) =>
                  setQuizSettings({
                    ...quizSettings,
                    showResultsImmediately: checked,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="maxAttempts">Maximum Attempts</Label>
              <Input
                id="maxAttempts"
                type="number"
                min="1"
                max="10"
                value={quizSettings.maxAttempts}
                onChange={(e) =>
                  setQuizSettings({
                    ...quizSettings,
                    maxAttempts: parseInt(e.target.value) || 3,
                  })
                }
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="availableFrom">Available From</Label>
                <Input
                  id="availableFrom"
                  type="datetime-local"
                  value={quizSettings.availableFrom}
                  onChange={(e) =>
                    setQuizSettings({
                      ...quizSettings,
                      availableFrom: e.target.value,
                    })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="availableUntil">Available Until</Label>
                <Input
                  id="availableUntil"
                  type="datetime-local"
                  value={quizSettings.availableUntil}
                  onChange={(e) =>
                    setQuizSettings({
                      ...quizSettings,
                      availableUntil: e.target.value,
                    })
                  }
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
