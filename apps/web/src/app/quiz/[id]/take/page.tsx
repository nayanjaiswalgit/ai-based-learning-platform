'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Maximize,
  X,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { assessmentApi } from '@/lib/api-client';
import { useAntiCheating } from '@/hooks/useAntiCheating';
import { useTimer, formatTime, getTimeColor } from '@/hooks/useTimer';
import { useToast } from '@/components/ui/use-toast';
import type { Quiz, Question, QuizAttempt, QuestionAnswer } from '@/types/api.types';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TakeQuizPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string[]>>(new Map());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Anti-cheating hook
  const antiCheating = useAntiCheating({
    detectTabSwitch: true,
    detectCopyPaste: true,
    detectRightClick: true,
    detectDevTools: true,
    detectFullscreenExit: true,
    maxTabSwitches: 5,
    maxCopyAttempts: 3,
    onViolation: (violation) => {
      toast({
        title: 'Warning!',
        description: `Detected: ${violation.type.replace('_', ' ')}. Violation #${violation.count}`,
        variant: 'destructive',
      });

      // Show warning overlay
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    },
    onMaxViolations: () => {
      toast({
        title: 'Max Violations Reached',
        description: 'Your quiz will be auto-submitted due to suspicious activity.',
        variant: 'destructive',
      });

      // Auto-submit quiz after max violations
      setTimeout(() => {
        handleSubmitQuiz();
      }, 3000);
    },
  });

  // Timer hook
  const timer = useTimer({
    initialTime: quiz?.timeLimit || 3600,
    onComplete: () => {
      toast({
        title: 'Time\'s Up!',
        description: 'Auto-submitting your quiz...',
      });
      handleSubmitQuiz();
    },
    autoStart: hasStarted,
    countDown: true,
  });

  // Load quiz data
  useEffect(() => {
    loadQuiz();
  }, [resolvedParams.id]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      const quizData = await assessmentApi.getQuiz(resolvedParams.id);
      setQuiz(quizData as Quiz);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load quiz',
        variant: 'destructive',
      });
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    try {
      const attemptData = await assessmentApi.startQuiz(resolvedParams.id);
      setAttempt(attemptData as QuizAttempt);
      setHasStarted(true);
      timer.start();

      // Request fullscreen
      await antiCheating.startFullscreen();

      toast({
        title: 'Quiz Started',
        description: 'Good luck! Anti-cheating measures are active.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start quiz',
        variant: 'destructive',
      });
    }
  };

  const handleAnswerChange = (questionId: string, selectedOptions: string[]) => {
    setAnswers(new Map(answers.set(questionId, selectedOptions)));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setIsSubmitting(true);
      timer.pause();

      if (!attempt) {
        throw new Error('No active attempt');
      }

      // Prepare answers with time spent per question
      const questionAnswers: QuestionAnswer[] = Array.from(answers.entries()).map(
        ([questionId, selectedAnswers]) => ({
          questionId,
          selectedAnswers,
          timeSpent: 30, // TODO: Track actual time per question
        }),
      );

      // Submit quiz
      await assessmentApi.submitQuiz(attempt.id, {
        answers: questionAnswers,
        totalTime: timer.timeElapsed,
      });

      // Exit fullscreen
      antiCheating.exitFullscreen();

      toast({
        title: 'Quiz Submitted!',
        description: 'Redirecting to results...',
      });

      // Redirect to results
      setTimeout(() => {
        router.push(`/quiz/attempts/${attempt.id}/results`);
      }, 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit quiz',
        variant: 'destructive',
      });
      timer.resume();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-slate-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold">Quiz Not Found</h2>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Pre-start screen
  if (!hasStarted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="max-w-2xl p-8">
          <div className="mb-6 text-center">
            <Shield className="mx-auto mb-4 h-16 w-16 text-blue-600" />
            <h1 className="mb-2 text-3xl font-bold">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-slate-600 dark:text-slate-400">
                {quiz.description}
              </p>
            )}
          </div>

          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
              <span className="font-medium">Questions:</span>
              <span className="text-lg font-bold">{quiz.questions.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
              <span className="font-medium">Time Limit:</span>
              <span className="text-lg font-bold">
                {Math.floor(quiz.timeLimit / 60)} minutes
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
              <span className="font-medium">Passing Score:</span>
              <span className="text-lg font-bold">{quiz.passingPercentage}%</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
              <span className="font-medium">Max Attempts:</span>
              <span className="text-lg font-bold">{quiz.maxAttempts}</span>
            </div>
          </div>

          <Alert className="mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Anti-Cheating Measures Active:</strong>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                <li>Tab switching will be detected and logged</li>
                <li>Copy/paste operations are disabled</li>
                <li>Right-click is disabled</li>
                <li>Fullscreen mode is required</li>
                <li>Multiple violations may result in auto-submission</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Button onClick={handleStartQuiz} size="lg" className="w-full">
            <Maximize className="mr-2 h-5 w-5" />
            Start Quiz (Enter Fullscreen)
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredCount = answers.size;

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Warning Overlay */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-600/90">
          <div className="text-center text-white">
            <AlertTriangle className="mx-auto mb-4 h-24 w-24 animate-pulse" />
            <h2 className="mb-2 text-4xl font-bold">WARNING!</h2>
            <p className="text-xl">Suspicious Activity Detected</p>
            <p className="mt-2">
              Violations: {antiCheating.tabSwitchCount + antiCheating.copyAttemptCount}
            </p>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">{quiz.title}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span>
                Question {currentQuestionIndex + 1} / {quiz.questions.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <div
              className={`flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 dark:bg-slate-700 ${getTimeColor(timer.timeLeft, quiz.timeLimit)}`}
            >
              <Clock className="h-5 w-5" />
              <span className="text-lg font-bold">
                {formatTime(timer.timeLeft)}
              </span>
            </div>

            {/* Violations */}
            {(antiCheating.tabSwitchCount > 0 ||
              antiCheating.copyAttemptCount > 0) && (
              <div className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-bold">
                  {antiCheating.tabSwitchCount + antiCheating.copyAttemptCount}{' '}
                  Violations
                </span>
              </div>
            )}

            {/* Fullscreen Status */}
            {!antiCheating.isFullscreen && (
              <Button
                variant="outline"
                size="sm"
                onClick={antiCheating.startFullscreen}
              >
                <Maximize className="mr-2 h-4 w-4" />
                Enter Fullscreen
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Question Content */}
      <div className="mx-auto max-w-4xl p-6">
        <Card className="mb-6 p-8">
          {/* Question Header */}
          <div className="mb-6 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                  {currentQuestion.difficulty}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  {currentQuestion.points} points
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {currentQuestion.title}
              </h2>
              {currentQuestion.description && (
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  {currentQuestion.description}
                </p>
              )}
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.questionType === 'MULTIPLE_CHOICE' ? (
              <RadioGroup
                value={answers.get(currentQuestion.id)?.[0] || ''}
                onValueChange={(value) =>
                  handleAnswerChange(currentQuestion.id, [value])
                }
              >
                {currentQuestion.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-3 rounded-lg border-2 border-slate-200 p-4 transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/10"
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label
                      htmlFor={option.id}
                      className="flex-1 cursor-pointer text-base"
                    >
                      {option.optionText}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              // Multiple Select
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-3 rounded-lg border-2 border-slate-200 p-4 transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/10"
                  >
                    <Checkbox
                      id={option.id}
                      checked={
                        answers.get(currentQuestion.id)?.includes(option.id) ||
                        false
                      }
                      onCheckedChange={(checked) => {
                        const current = answers.get(currentQuestion.id) || [];
                        const updated = checked
                          ? [...current, option.id]
                          : current.filter((id) => id !== option.id);
                        handleAnswerChange(currentQuestion.id, updated);
                      }}
                    />
                    <Label
                      htmlFor={option.id}
                      className="flex-1 cursor-pointer text-base"
                    >
                      {option.optionText}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          <div className="text-sm text-slate-600 dark:text-slate-400">
            Answered: {answeredCount} / {quiz.questions.length}
          </div>

          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <Button onClick={handleNextQuestion}>Next</Button>
          ) : (
            <Button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Submit Quiz
                </>
              )}
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <Card className="mt-6 p-6">
          <h3 className="mb-4 font-bold">Question Navigator</h3>
          <div className="grid grid-cols-10 gap-2">
            {quiz.questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : answers.has(q.id)
                      ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'border-slate-300 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
