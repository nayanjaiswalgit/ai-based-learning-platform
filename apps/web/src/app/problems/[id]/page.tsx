'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MonacoEditor } from '@/components/code-editor/monaco-editor'
import { Play, CheckCircle2, XCircle, Clock, Send, Trophy, Loader2, Code2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

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

const starterCodeTemplates: Record<string, string> = {
  javascript: `function twoSum(nums, target) {
    // Write your code here

}

// Test
console.log(twoSum([2,7,11,15], 9)); // Expected: [0,1]`,
  python: `def two_sum(nums, target):
    # Write your code here
    pass

# Test
print(two_sum([2,7,11,15], 9))  # Expected: [0,1]`,
  java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[0];
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] result = sol.twoSum(new int[]{2,7,11,15}, 9);
        System.out.println(Arrays.toString(result));
    }
}`,
  cpp: `#include <vector>
#include <iostream>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Write your code here
    return {};
}

int main() {
    vector<int> nums = {2,7,11,15};
    vector<int> result = twoSum(nums, 9);
    return 0;
}`,
}

export default function ProblemSolvePage() {
  const router = useRouter()
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState(starterCodeTemplates['javascript'])
  const [testResults, setTestResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    setCode(starterCodeTemplates[newLanguage] || '')
    setTestResults(null)
  }

  const handleRun = async () => {
    setIsRunning(true)
    setTestResults(null)

    // Simulate API call to code execution service
    setTimeout(() => {
      const allPassed = Math.random() > 0.3
      setTestResults({
        passed: allPassed ? 3 : 2,
        total: 3,
        runtime: '52 ms',
        memory: '14.2 MB',
        cases: [
          { input: '[2,7,11,15], 9', expected: '[0,1]', output: '[0,1]', passed: true, runtime: '1 ms' },
          { input: '[3,2,4], 6', expected: '[1,2]', output: '[1,2]', passed: true, runtime: '0 ms' },
          { input: '[3,3], 6', expected: '[0,1]', output: allPassed ? '[0,1]' : '[1,1]', passed: allPassed, runtime: '1 ms' },
        ],
      })
      setIsRunning(false)
    }, 2000)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false)
      router.push('/problems/submission-success')
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="grid h-[calc(100vh-8rem)] gap-4 lg:grid-cols-[1fr_1fr]">
        {/* Problem Description */}
        <div className="flex flex-col overflow-hidden">
          <Card className="flex-1 overflow-y-auto border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-slate-900 dark:text-white">{problem.title}</CardTitle>
                <Badge
                  className={
                    problem.difficulty === 'Easy'
                      ? 'bg-green-600'
                      : problem.difficulty === 'Medium'
                      ? 'bg-yellow-600'
                      : 'bg-red-600'
                  }
                >
                  {problem.difficulty}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
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
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="solutions">Solutions</TabsTrigger>
                  <TabsTrigger value="submissions">Submissions</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="space-y-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{problem.description}</p>

                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Examples</h3>
                    {problem.examples.map((example, i) => (
                      <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                        <p className="text-slate-700 dark:text-slate-300">
                          <strong className="text-slate-900 dark:text-white">Input:</strong> {example.input}
                        </p>
                        <p className="text-slate-700 dark:text-slate-300">
                          <strong className="text-slate-900 dark:text-white">Output:</strong> {example.output}
                        </p>
                        {example.explanation && (
                          <p className="text-slate-700 dark:text-slate-300">
                            <strong className="text-slate-900 dark:text-white">Explanation:</strong> {example.explanation}
                          </p>
                        )}
                      </div>
                    ))}

                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Constraints</h3>
                    <ul className="list-disc pl-5 text-slate-700 dark:text-slate-300">
                      {problem.constraints.map((constraint, i) => (
                        <li key={i}>{constraint}</li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="solutions">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Solutions will be available after you solve the problem.
                  </p>
                </TabsContent>

                <TabsContent value="submissions">
                  <p className="text-sm text-slate-600 dark:text-slate-400">No submissions yet.</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Code Editor & Results */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <Card className="flex-1 overflow-hidden border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardContent className="h-full p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Code2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRun}
                    disabled={isRunning}
                  >
                    {isRunning ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Running...</>
                    ) : (
                      <><Play className="mr-2 h-4 w-4" />Run Code</>
                    )}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!testResults || testResults.passed !== testResults.total || isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" />Submit</>
                    )}
                  </Button>
                </div>
              </div>
              <MonacoEditor
                key={language}
                defaultValue={code}
                language={language === 'cpp' ? 'cpp' : language}
                onChange={(value) => setCode(value || '')}
              />
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card className="max-h-64 overflow-y-auto border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <CardTitle className="text-base text-slate-900 dark:text-white">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {isRunning ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Running test cases...</span>
                </div>
              ) : !testResults ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Click "Run Code" to test your solution
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {testResults.passed}/{testResults.total} tests passed
                      </span>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                        <span>Runtime: {testResults.runtime}</span>
                        <span>•</span>
                        <span>Memory: {testResults.memory}</span>
                      </div>
                    </div>
                    {testResults.passed === testResults.total ? (
                      <Badge className="bg-green-600">
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        All Tests Passed
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-4 w-4" />
                        Failed
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    {testResults.cases.map((testCase: any, i: number) => (
                      <div
                        key={i}
                        className={`rounded-lg border p-3 text-sm ${
                          testCase.passed
                            ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30'
                            : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 dark:text-white">Test Case {i + 1}</span>
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              ({testCase.runtime})
                            </span>
                          </div>
                          {testCase.passed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="space-y-1 text-xs">
                          <p className="text-slate-700 dark:text-slate-300">
                            <span className="font-medium text-slate-600 dark:text-slate-400">Input:</span>{' '}
                            <code className="rounded bg-white/50 px-1 py-0.5 dark:bg-slate-900/50">
                              {testCase.input}
                            </code>
                          </p>
                          <p className="text-slate-700 dark:text-slate-300">
                            <span className="font-medium text-slate-600 dark:text-slate-400">Expected:</span>{' '}
                            <code className="rounded bg-white/50 px-1 py-0.5 dark:bg-slate-900/50">
                              {testCase.expected}
                            </code>
                          </p>
                          <p className="text-slate-700 dark:text-slate-300">
                            <span className="font-medium text-slate-600 dark:text-slate-400">Your Output:</span>{' '}
                            <code className={`rounded px-1 py-0.5 ${
                              testCase.passed
                                ? 'bg-white/50 dark:bg-slate-900/50'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                            }`}>
                              {testCase.output}
                            </code>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {testResults.passed === testResults.total && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <Trophy className="h-5 w-5" />
                        <span className="font-semibold">Great job!</span>
                      </div>
                      <p className="mt-1 text-sm text-green-600 dark:text-green-500">
                        All test cases passed. Click Submit to save your solution.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
