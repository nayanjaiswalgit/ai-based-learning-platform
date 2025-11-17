'use client';

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
} from 'lucide-react';
import Link from 'next/link';

export default function QuizResultsPage({ params }: { params: { id: string } }) {
  // Mock data - will be replaced with actual API data
  const results = {
    quizTitle: 'React Fundamentals Quiz',
    score: 85,
    totalQuestions: 20,
    correctAnswers: 17,
    wrongAnswers: 3,
    timeTaken: '18:45',
    timeLimit: '30:00',
    passingScore: 70,
    rank: 12,
    totalAttempts: 145,
    percentile: 92,
    attemptDate: '2025-11-17',
  };

  const questionBreakdown = [
    {
      id: 1,
      question: 'What is JSX?',
      yourAnswer: 'A syntax extension for JavaScript',
      correctAnswer: 'A syntax extension for JavaScript',
      isCorrect: true,
      points: 5,
      explanation: 'JSX stands for JavaScript XML and allows us to write HTML in React.',
    },
    {
      id: 2,
      question: 'Which hook is used for side effects?',
      yourAnswer: 'useState',
      correctAnswer: 'useEffect',
      isCorrect: false,
      points: 0,
      explanation: 'useEffect is used for side effects like data fetching, subscriptions, etc.',
    },
    {
      id: 3,
      question: 'What does React.memo do?',
      yourAnswer: 'Prevents unnecessary re-renders',
      correctAnswer: 'Prevents unnecessary re-renders',
      isCorrect: true,
      points: 5,
      explanation: 'React.memo is a higher order component that memoizes the result.',
    },
  ];

  const isPassed = results.score >= results.passingScore;

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
                {results.wrongAnswers}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Wrong</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {results.timeTaken}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Time Taken</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {results.percentile}%
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Percentile</p>
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

              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Time Efficiency</span>
                  <span className="font-semibold text-slate-900 dark:text-white">62.5%</span>
                </div>
                <Progress value={62.5} className="mt-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Your Rank</p>
                  <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                    #{results.rank}
                  </p>
                  <p className="text-xs text-slate-500">out of {results.totalAttempts} attempts</p>
                </div>

                <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-950">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Percentile</p>
                  <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {results.percentile}th
                  </p>
                  <p className="text-xs text-slate-500">Better than {results.percentile}% of users</p>
                </div>
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
              {questionBreakdown.map((q) => (
                <div
                  key={q.id}
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
                          Question {q.id}: {q.question}
                        </h3>
                      </div>

                      <div className="mt-3 space-y-2 text-sm">
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Your Answer: </span>
                          <span className={q.isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                            {q.yourAnswer}
                          </span>
                        </div>

                        {!q.isCorrect && (
                          <div>
                            <span className="text-slate-600 dark:text-slate-400">Correct Answer: </span>
                            <span className="text-green-700 dark:text-green-400">
                              {q.correctAnswer}
                            </span>
                          </div>
                        )}

                        <div className="mt-2 rounded-md bg-white/50 p-3 dark:bg-slate-900/50">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Explanation:
                          </p>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                            {q.explanation}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        {q.points} pts
                      </span>
                    </div>
                  </div>
                </div>
              ))}
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
