'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  Share2,
  Download,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface QuizResults {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
  timeTaken?: string;
  submittedAt: string;
  questionResults?: Array<{
    questionId: string;
    question: string;
    userAnswer: any;
    isCorrect: boolean;
  }>;
}

export default function QuizResultsPage({ params }: { params: { id: string } }) {
  const [results, setResults] = useState<QuizResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        // The id param is the attemptId
        const attemptId = params.id;

        // Fetch results from quiz service
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ASSESSMENT_SERVICE_URL || 'http://localhost:3003'}/quizzes/attempts/${attemptId}/results`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch quiz results');
        }

        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <Card className="p-12 text-center border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Unable to Load Results
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {error || 'Quiz results not found'}
            </p>
            <Link href="/quizzes">
              <Button>Back to Quizzes</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const wrongAnswers = results.totalQuestions - results.correctAnswers;
  const questionBreakdown = results.questionResults || [];

  // Use the passed status from API
  const isPassed = results.passed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12">
      <div className="mx-auto max-w-4xl space-y-6 px-4">
        {/* Header */}
        <div className="text-center">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Quiz Completed!
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            {results.quizTitle}
          </p>
        </div>

        {/* Score Card */}
        <Card className="overflow-hidden border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className={`p-8 ${isPassed ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-orange-500 to-red-600'}`}>
            <div className="text-center text-white">
              <p className="text-lg font-medium">Your Score</p>
              <p className="mt-2 text-6xl font-bold">{results.score}%</p>
              <p className="mt-2 text-lg">
                {results.correctAnswers} / {results.totalQuestions} Correct
              </p>
              <div className="mt-4">
                <span className={`inline-block rounded-full px-6 py-2 text-sm font-semibold ${isPassed ? 'bg-white text-green-600' : 'bg-white text-red-600'}`}>
                  {isPassed ? '✓ Passed' : '✗ Not Passed'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {results.correctAnswers}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Correct</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {wrongAnswers}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Wrong</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {results.timeTaken || 'N/A'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Time Taken</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {results.score}%
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Score</p>
            </div>
          </div>
        </Card>

        {/* Performance Analytics */}
        <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="p-6">
            <h2 className="flex items-center text-xl font-bold text-slate-900 dark:text-white">
              <TrendingUp className="mr-2 h-5 w-5" />
              Performance Analytics
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Accuracy</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {results.score}%
                  </span>
                </div>
                <Progress value={results.score} className="mt-2" />
              </div>

              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400">Submitted At</p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                  {new Date(results.submittedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Question Breakdown */}
        <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Question Breakdown
            </h2>

            <div className="mt-6 space-y-4">
              {questionBreakdown.length === 0 ? (
                <p className="text-center text-slate-600 dark:text-slate-400">
                  Detailed question breakdown is not available for this quiz.
                </p>
              ) : (
                questionBreakdown.map((q, index) => (
                  <div
                    key={q.questionId}
                    className={`rounded-lg border-2 p-4 ${
                      q.isCorrect
                        ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30'
                        : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {q.isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            Question {index + 1}: {q.question}
                          </h3>
                        </div>

                        <div className="mt-3 space-y-2 text-sm">
                          <div>
                            <span className="text-slate-600 dark:text-slate-400">Your Answer: </span>
                            <span className={q.isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                              {typeof q.userAnswer === 'object' ? JSON.stringify(q.userAnswer) : q.userAnswer}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-600 dark:text-slate-400">Status: </span>
                            <span className={q.isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                              {q.isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share Results
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download Certificate
          </Button>
          <Link href={`/quiz/${params.id}`}>
            <Button variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Trophy className="h-4 w-4" />
              View Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
