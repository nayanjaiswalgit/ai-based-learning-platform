'use client';

import { useState } from 'react';
import CodeEditor from './CodeEditor';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface TestCase {
  input: string;
  expectedOutput: string;
  passed?: boolean;
  actualOutput?: string;
}

interface CodingChallengeProps {
  problemId: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  initialCode?: string;
  language?: string;
  testCases: TestCase[];
}

export default function CodingChallenge({
  problemId,
  title,
  description,
  difficulty,
  initialCode,
  language = 'python',
  testCases,
}: CodingChallengeProps) {
  const [code, setCode] = useState(initialCode || '');
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const difficultyColors = {
    EASY: 'text-success',
    MEDIUM: 'text-warning',
    HARD: 'text-destructive',
  };

  async function handleRun() {
    setIsRunning(true);
    setActiveTab('results');

    try {
      // Call code execution API
      const response = await fetch('http://localhost:3002/execute/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          testCases,
          problemId,
        }),
      });

      const result = await response.json();
      setTestResults(result.testResults || []);
    } catch (error) {
      console.error('Execution error:', error);
    } finally {
      setIsRunning(false);
    }
  }

  const passedTests = testResults.filter((t) => t.passed).length;
  const totalTests = testResults.length;

  return (
    <div className="flex h-screen">
      {/* Left Panel - Problem Description */}
      <div className="w-1/2 border-r overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{title}</h1>
            <span className={`font-semibold ${difficultyColors[difficulty]}`}>
              {difficulty}
            </span>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="results">
                Results {testResults.length > 0 && `(${passedTests}/${totalTests})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{description}</ReactMarkdown>
              </div>
            </TabsContent>

            <TabsContent value="examples" className="mt-4">
              <div className="space-y-4">
                {testCases.slice(0, 2).map((testCase, index) => (
                  <div key={index} className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Example {index + 1}</h3>
                    <div className="space-y-2 font-mono text-sm">
                      <div>
                        <span className="text-muted-foreground">Input:</span> {testCase.input}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Output:</span> {testCase.expectedOutput}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="results" className="mt-4">
              {isRunning ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="ml-2">Running tests...</span>
                </div>
              ) : testResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Run your code to see test results
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    {passedTests === totalTests ? (
                      <CheckCircle className="w-6 h-6 text-success" />
                    ) : (
                      <XCircle className="w-6 h-6 text-destructive" />
                    )}
                    <span className="font-semibold">
                      {passedTests}/{totalTests} test cases passed
                    </span>
                  </div>

                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${
                        result.passed ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Test Case {index + 1}</span>
                        {result.passed ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <XCircle className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                      <div className="space-y-1 text-sm font-mono">
                        <div>
                          <span className="text-muted-foreground">Input:</span> {result.input}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expected:</span> {result.expectedOutput}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Got:</span>{' '}
                          <span className={result.passed ? 'text-success' : 'text-destructive'}>
                            {result.actualOutput}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="w-1/2 flex flex-col">
        <div className="flex-1 p-4">
          <CodeEditor
            initialCode={initialCode}
            language={language}
            onRun={handleRun}
            height="calc(100vh - 100px)"
          />
        </div>

        <div className="border-t p-4 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {isRunning ? 'Running...' : 'Ready'}
          </div>
          <Button
            onClick={handleRun}
            disabled={isRunning}
            className="bg-success hover:bg-success/90 btn-modern"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              'Run Code'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
