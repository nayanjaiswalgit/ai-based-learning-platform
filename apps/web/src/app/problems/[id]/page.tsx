'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MonacoEditor } from '@/components/code-editor/monaco-editor'
import { Play, CheckCircle2, XCircle, Clock } from 'lucide-react'

const problem = {
  id: 1,
  title: 'Two Sum',
  difficulty: 'Easy',
  acceptance: '49.2%',
  companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  examples: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
    },
    {
      input: 'nums = [3,2,4], target = 6',
      output: '[1,2]',
      explanation: null,
    },
  ],
  constraints: [
    '2 <= nums.length <= 10^4',
    '-10^9 <= nums[i] <= 10^9',
    '-10^9 <= target <= 10^9',
    'Only one valid answer exists.',
  ],
}

const starterCode = `function twoSum(nums, target) {
    // Write your code here

}

// Test
console.log(twoSum([2,7,11,15], 9)); // Expected: [0,1]`

export default function ProblemSolvePage() {
  const [code, setCode] = useState(starterCode)
  const [testResults, setTestResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)

  const handleRun = () => {
    setIsRunning(true)
    // Simulate code execution
    setTimeout(() => {
      setTestResults({
        passed: 2,
        total: 3,
        cases: [
          { input: '[2,7,11,15], 9', expected: '[0,1]', output: '[0,1]', passed: true },
          { input: '[3,2,4], 6', expected: '[1,2]', output: '[1,2]', passed: true },
          { input: '[3,3], 6', expected: '[0,1]', output: '[0,1]', passed: false },
        ],
      })
      setIsRunning(false)
    }, 2000)
  }

  return (
    <DashboardLayout>
      <div className="grid h-[calc(100vh-8rem)] gap-4 lg:grid-cols-[1fr_1fr]">
        {/* Problem Description */}
        <div className="flex flex-col overflow-hidden">
          <Card className="flex-1 overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{problem.title}</CardTitle>
                <Badge
                  variant={
                    problem.difficulty === 'Easy'
                      ? 'secondary'
                      : problem.difficulty === 'Medium'
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {problem.difficulty}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>Acceptance: {problem.acceptance}</span>
                <span>•</span>
                <div className="flex flex-wrap gap-1">
                  {problem.companies.map((company) => (
                    <Badge key={company} variant="outline" className="text-xs">
                      {company}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="description" className="w-full">
                <TabsList>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="solutions">Solutions</TabsTrigger>
                  <TabsTrigger value="submissions">Submissions</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="space-y-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap">{problem.description}</p>

                    <h3>Examples</h3>
                    {problem.examples.map((example, i) => (
                      <div key={i} className="rounded-lg bg-muted p-4">
                        <p>
                          <strong>Input:</strong> {example.input}
                        </p>
                        <p>
                          <strong>Output:</strong> {example.output}
                        </p>
                        {example.explanation && (
                          <p>
                            <strong>Explanation:</strong> {example.explanation}
                          </p>
                        )}
                      </div>
                    ))}

                    <h3>Constraints</h3>
                    <ul>
                      {problem.constraints.map((constraint, i) => (
                        <li key={i}>{constraint}</li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="solutions">
                  <p className="text-sm text-muted-foreground">
                    Solutions will be available after you solve the problem.
                  </p>
                </TabsContent>

                <TabsContent value="submissions">
                  <p className="text-sm text-muted-foreground">No submissions yet.</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Code Editor & Results */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <Card className="flex-1 overflow-hidden">
            <CardContent className="h-full p-4">
              <MonacoEditor
                defaultValue={starterCode}
                language="javascript"
                onChange={(value) => setCode(value || '')}
                onRun={handleRun}
              />
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card className="max-h-64 overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-base">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {!testResults ? (
                <p className="text-sm text-muted-foreground">
                  Run your code to see test results
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {testResults.passed}/{testResults.total} tests passed
                    </span>
                    {testResults.passed === testResults.total ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        Accepted
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-4 w-4" />
                        Wrong Answer
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    {testResults.cases.map((testCase: any, i: number) => (
                      <div
                        key={i}
                        className={`rounded-lg border p-3 text-sm ${
                          testCase.passed ? 'border-green-200 bg-green-50 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:bg-red-950'
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium">Test Case {i + 1}</span>
                          {testCase.passed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="space-y-1 text-xs">
                          <p>
                            <span className="text-muted-foreground">Input:</span> {testCase.input}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Expected:</span>{' '}
                            {testCase.expected}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Output:</span> {testCase.output}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full" disabled={testResults.passed !== testResults.total}>
                    Submit Solution
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
