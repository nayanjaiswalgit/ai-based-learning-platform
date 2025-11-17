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
import { Plus, X, Save, Code, HelpCircle, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface MCQQuestion {
  id: string;
  question: string;
  options: MCQOption[];
  explanation: string;
  points: number;
}

interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  starterCode: string;
  testCases: Array<{ input: string; expectedOutput: string; points: number }>;
  timeLimit: number;
  memoryLimit: number;
}

export default function CreateAssessmentPage() {
  const [assessmentType, setAssessmentType] = useState<'mcq' | 'coding'>('mcq');
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [assessmentDescription, setAssessmentDescription] = useState('');
  const [duration, setDuration] = useState(60);

  // MCQ Questions
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([]);
  const [currentMCQ, setCurrentMCQ] = useState<MCQQuestion>({
    id: '',
    question: '',
    options: [
      { id: '1', text: '', isCorrect: false },
      { id: '2', text: '', isCorrect: false },
      { id: '3', text: '', isCorrect: false },
      { id: '4', text: '', isCorrect: false },
    ],
    explanation: '',
    points: 1,
  });

  // Coding Questions
  const [codingQuestions, setCodingQuestions] = useState<CodingQuestion[]>([]);
  const [currentCoding, setCurrentCoding] = useState<CodingQuestion>({
    id: '',
    title: '',
    description: '',
    difficulty: 'easy',
    starterCode: '',
    testCases: [{ input: '', expectedOutput: '', points: 10 }],
    timeLimit: 1000,
    memoryLimit: 128,
  });

  const addMCQQuestion = () => {
    if (!currentMCQ.question) return;
    const newQuestion = { ...currentMCQ, id: Date.now().toString() };
    setMcqQuestions([...mcqQuestions, newQuestion]);
    setCurrentMCQ({
      id: '',
      question: '',
      options: [
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
        { id: '4', text: '', isCorrect: false },
      ],
      explanation: '',
      points: 1,
    });
  };

  const addCodingQuestion = () => {
    if (!currentCoding.title) return;
    const newQuestion = { ...currentCoding, id: Date.now().toString() };
    setCodingQuestions([...codingQuestions, newQuestion]);
    setCurrentCoding({
      id: '',
      title: '',
      description: '',
      difficulty: 'easy',
      starterCode: '',
      testCases: [{ input: '', expectedOutput: '', points: 10 }],
      timeLimit: 1000,
      memoryLimit: 128,
    });
  };

  const updateMCQOption = (index: number, text: string) => {
    const newOptions = [...currentMCQ.options];
    newOptions[index].text = text;
    setCurrentMCQ({ ...currentMCQ, options: newOptions });
  };

  const toggleCorrectOption = (index: number) => {
    const newOptions = currentMCQ.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setCurrentMCQ({ ...currentMCQ, options: newOptions });
  };

  const addTestCase = () => {
    setCurrentCoding({
      ...currentCoding,
      testCases: [...currentCoding.testCases, { input: '', expectedOutput: '', points: 10 }],
    });
  };

  const updateTestCase = (index: number, field: string, value: string | number) => {
    const newTestCases = [...currentCoding.testCases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setCurrentCoding({ ...currentCoding, testCases: newTestCases });
  };

  const removeTestCase = (index: number) => {
    setCurrentCoding({
      ...currentCoding,
      testCases: currentCoding.testCases.filter((_, i) => i !== index),
    });
  };

  const handleSave = () => {
    console.log('Saving assessment...', {
      type: assessmentType,
      title: assessmentTitle,
      description: assessmentDescription,
      duration,
      mcqQuestions,
      codingQuestions,
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Create Assessment
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Build quizzes and coding challenges for your students
          </p>
        </div>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          <Save className="mr-2 h-4 w-4" />
          Save Assessment
        </Button>
      </div>

      {/* Basic Info */}
      <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="p-6 space-y-4">
          <div>
            <Label htmlFor="title">Assessment Title *</Label>
            <Input
              id="title"
              value={assessmentTitle}
              onChange={(e) => setAssessmentTitle(e.target.value)}
              placeholder="e.g., React Fundamentals Quiz"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={assessmentDescription}
              onChange={(e) => setAssessmentDescription(e.target.value)}
              placeholder="Describe what this assessment covers..."
              className="mt-2"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Assessment Type</Label>
              <Select
                value={assessmentType}
                onValueChange={(value: 'mcq' | 'coding') => setAssessmentType(value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice Quiz</SelectItem>
                  <SelectItem value="coding">Coding Challenge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                className="mt-2"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Questions */}
      <Tabs value={assessmentType} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mcq" onClick={() => setAssessmentType('mcq')}>
            <HelpCircle className="mr-2 h-4 w-4" />
            MCQ Questions
          </TabsTrigger>
          <TabsTrigger value="coding" onClick={() => setAssessmentType('coding')}>
            <Code className="mr-2 h-4 w-4" />
            Coding Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mcq" className="space-y-6">
          {/* Add MCQ Question */}
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Add MCQ Question
              </h3>

              <div>
                <Label htmlFor="mcq-question">Question *</Label>
                <Textarea
                  id="mcq-question"
                  value={currentMCQ.question}
                  onChange={(e) => setCurrentMCQ({ ...currentMCQ, question: e.target.value })}
                  placeholder="Enter your question here..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label>Options (select the correct answer)</Label>
                {currentMCQ.options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={option.isCorrect}
                      onChange={() => toggleCorrectOption(index)}
                      className="h-4 w-4"
                    />
                    <Input
                      value={option.text}
                      onChange={(e) => updateMCQOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="explanation">Explanation (optional)</Label>
                <Textarea
                  id="explanation"
                  value={currentMCQ.explanation}
                  onChange={(e) => setCurrentMCQ({ ...currentMCQ, explanation: e.target.value })}
                  placeholder="Explain the correct answer..."
                  className="mt-2"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  value={currentMCQ.points}
                  onChange={(e) => setCurrentMCQ({ ...currentMCQ, points: parseInt(e.target.value) || 1 })}
                  className="mt-2"
                  min="1"
                />
              </div>

              <Button onClick={addMCQQuestion} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>
          </Card>

          {/* MCQ Questions List */}
          {mcqQuestions.length > 0 && (
            <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Questions ({mcqQuestions.length})
                </h3>
                <div className="space-y-4">
                  {mcqQuestions.map((q, index) => (
                    <div
                      key={q.id}
                      className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white">
                            {index + 1}. {q.question}
                          </h4>
                          <div className="mt-2 space-y-1">
                            {q.options.map((opt, optIndex) => (
                              <div
                                key={opt.id}
                                className={`text-sm ${opt.isCorrect ? 'text-green-600 font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
                              >
                                {String.fromCharCode(65 + optIndex)}. {opt.text}
                              </div>
                            ))}
                          </div>
                          <p className="mt-2 text-xs text-slate-500">{q.points} points</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMcqQuestions(mcqQuestions.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="coding" className="space-y-6">
          {/* Add Coding Question */}
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Add Coding Question
              </h3>

              <div>
                <Label htmlFor="coding-title">Problem Title *</Label>
                <Input
                  id="coding-title"
                  value={currentCoding.title}
                  onChange={(e) => setCurrentCoding({ ...currentCoding, title: e.target.value })}
                  placeholder="e.g., Two Sum"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="coding-description">Problem Description *</Label>
                <Textarea
                  id="coding-description"
                  value={currentCoding.description}
                  onChange={(e) => setCurrentCoding({ ...currentCoding, description: e.target.value })}
                  placeholder="Describe the problem in detail..."
                  className="mt-2"
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={currentCoding.difficulty}
                  onValueChange={(value: any) => setCurrentCoding({ ...currentCoding, difficulty: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="starter-code">Starter Code</Label>
                <Textarea
                  id="starter-code"
                  value={currentCoding.starterCode}
                  onChange={(e) => setCurrentCoding({ ...currentCoding, starterCode: e.target.value })}
                  placeholder="function twoSum(nums, target) {&#10;  // Your code here&#10;}"
                  className="mt-2 font-mono"
                  rows={8}
                />
              </div>

              <div>
                <Label>Test Cases</Label>
                <div className="mt-2 space-y-3">
                  {currentCoding.testCases.map((tc, index) => (
                    <div key={index} className="flex gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                      <div className="flex-1 space-y-2">
                        <Input
                          value={tc.input}
                          onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                          placeholder="Input (e.g., [2,7,11,15], 9)"
                        />
                        <Input
                          value={tc.expectedOutput}
                          onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                          placeholder="Expected Output (e.g., [0,1])"
                        />
                        <Input
                          type="number"
                          value={tc.points}
                          onChange={(e) => updateTestCase(index, 'points', parseInt(e.target.value) || 0)}
                          placeholder="Points"
                        />
                      </div>
                      {currentCoding.testCases.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeTestCase(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" onClick={addTestCase} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Test Case
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time-limit">Time Limit (ms)</Label>
                  <Input
                    id="time-limit"
                    type="number"
                    value={currentCoding.timeLimit}
                    onChange={(e) => setCurrentCoding({ ...currentCoding, timeLimit: parseInt(e.target.value) || 1000 })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="memory-limit">Memory Limit (MB)</Label>
                  <Input
                    id="memory-limit"
                    type="number"
                    value={currentCoding.memoryLimit}
                    onChange={(e) => setCurrentCoding({ ...currentCoding, memoryLimit: parseInt(e.target.value) || 128 })}
                    className="mt-2"
                  />
                </div>
              </div>

              <Button onClick={addCodingQuestion} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Coding Question
              </Button>
            </div>
          </Card>

          {/* Coding Questions List */}
          {codingQuestions.length > 0 && (
            <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Coding Questions ({codingQuestions.length})
                </h3>
                <div className="space-y-4">
                  {codingQuestions.map((q, index) => (
                    <div
                      key={q.id}
                      className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white">
                            {index + 1}. {q.title}
                          </h4>
                          <div className="mt-2 flex gap-3 text-sm">
                            <span className={`rounded-full px-2 py-1 text-xs ${
                              q.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-950' :
                              q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950' :
                              'bg-red-100 text-red-700 dark:bg-red-950'
                            }`}>
                              {q.difficulty}
                            </span>
                            <span className="text-slate-600 dark:text-slate-400">
                              {q.testCases.length} test cases
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCodingQuestions(codingQuestions.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
