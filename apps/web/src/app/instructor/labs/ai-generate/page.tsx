'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface GenerationParams {
  topic: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  labType: 'coding' | 'terminal';
  context?: string;
  courseTitle?: string;
  moduleTitle?: string;
}

interface GeneratedLab {
  title: string;
  description: string;
  difficulty: string;
  estimatedMinutes: number;
  starterCode?: Record<string, string>;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    explanation: string;
    isHidden: boolean;
  }>;
  hints?: string[];
  constraints?: string;
  scenario?: string;
  dockerImage?: string;
  setupScript?: string;
  validationScript?: string;
  tasks?: Array<{
    title: string;
    description: string;
    order: number;
    hintCommand?: string;
    validationString: string;
  }>;
}

export default function AIGenerateLabPage() {
  const router = useRouter();
  const [step, setStep] = useState<'configure' | 'generating' | 'review'>('configure');
  const [params, setParams] = useState<GenerationParams>({
    topic: '',
    difficulty: 'INTERMEDIATE',
    labType: 'coding',
    context: '',
    courseTitle: '',
    moduleTitle: '',
  });
  const [generatedLab, setGeneratedLab] = useState<GeneratedLab | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setStep('generating');
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AI_SERVICE_URL}/content-generation/generate-coding-lab`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

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

  const handleSaveToDatabase = async () => {
    if (!generatedLab) return;

    try {
      // First, save to the questions database
      const response = await fetch(`${process.env.NEXT_PUBLIC_ASSESSMENT_SERVICE_URL}/questions/from-ai-generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generatedContent: generatedLab,
          labType: params.labType,
          createdBy: 'current-user-id', // TODO: Get from auth context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save lab');
      }

      const savedQuestion = await response.json();

      // Redirect to add this lab to a lesson
      router.push(`/instructor/labs/add-to-lesson?questionId=${savedQuestion.id}&labType=${params.labType}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save lab');
    }
  };

  const handleEditField = (field: string, value: any) => {
    if (!generatedLab) return;
    setGeneratedLab({
      ...generatedLab,
      [field]: value,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI-Powered Lab Generation</h1>
        <p className="text-gray-600 mt-2">
          Generate coding challenges or terminal labs using AI based on your course content
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${step === 'configure' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'configure' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2 font-medium">Configure</span>
          </div>
          <div className="w-16 h-1 bg-gray-200"></div>
          <div className={`flex items-center ${step === 'generating' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'generating' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2 font-medium">Generating</span>
          </div>
          <div className="w-16 h-1 bg-gray-200"></div>
          <div className={`flex items-center ${step === 'review' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2 font-medium">Review & Save</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Step 1: Configuration */}
      {step === 'configure' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Lab Configuration</h2>

          <div className="space-y-6">
            {/* Lab Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lab Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setParams({ ...params, labType: 'coding' })}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    params.labType === 'coding'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg font-semibold">Coding Challenge</div>
                  <div className="text-sm text-gray-600 mt-1">
                    LeetCode-style programming problems with test cases
                  </div>
                </button>
                <button
                  onClick={() => setParams({ ...params, labType: 'terminal' })}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    params.labType === 'terminal'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg font-semibold">Terminal Lab</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Hands-on command-line challenges with Docker
                  </div>
                </button>
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={params.topic}
                onChange={(e) => setParams({ ...params, topic: e.target.value })}
                placeholder="e.g., Binary Search Trees, Docker Networking, Array Manipulation"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Be specific about what you want students to learn
              </p>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level <span className="text-red-500">*</span>
              </label>
              <select
                value={params.difficulty}
                onChange={(e) => setParams({ ...params, difficulty: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            {/* Context (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Context (Optional)
              </label>
              <textarea
                value={params.context}
                onChange={(e) => setParams({ ...params, context: e.target.value })}
                placeholder="Provide any specific requirements or focus areas..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Course Info (Optional) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title (Optional)
                </label>
                <input
                  type="text"
                  value={params.courseTitle}
                  onChange={(e) => setParams({ ...params, courseTitle: e.target.value })}
                  placeholder="e.g., Data Structures and Algorithms"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module Title (Optional)
                </label>
                <input
                  type="text"
                  value={params.moduleTitle}
                  onChange={(e) => setParams({ ...params, moduleTitle: e.target.value })}
                  placeholder="e.g., Trees and Graphs"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={!params.topic}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Generate Lab with AI
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Generating */}
      {step === 'generating' && (
        <div className="bg-white rounded-lg shadow-md p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <h3 className="text-xl font-semibold mt-6">Generating Your Lab...</h3>
            <p className="text-gray-600 mt-2">
              Our AI is creating a {params.labType} lab about {params.topic}
            </p>
            <p className="text-sm text-gray-500 mt-4">This usually takes 10-30 seconds</p>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 'review' && generatedLab && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Review & Edit Generated Lab</h2>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={generatedLab.title}
                onChange={(e) => handleEditField('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={generatedLab.description}
                onChange={(e) => handleEditField('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={generatedLab.difficulty}
                  onChange={(e) => handleEditField('difficulty', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Time (minutes)
                </label>
                <input
                  type="number"
                  value={generatedLab.estimatedMinutes}
                  onChange={(e) => handleEditField('estimatedMinutes', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Coding-specific fields */}
            {params.labType === 'coding' && generatedLab.starterCode && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starter Code Preview
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-64 overflow-auto">
                    {Object.entries(generatedLab.starterCode).map(([lang, code]) => (
                      <div key={lang} className="mb-4">
                        <div className="text-sm font-semibold text-gray-700 mb-1">{lang}</div>
                        <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
                          {code}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Cases ({generatedLab.testCases?.length || 0})
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-64 overflow-auto">
                    {generatedLab.testCases?.map((tc, idx) => (
                      <div key={idx} className="mb-3 pb-3 border-b border-gray-200 last:border-0">
                        <div className="text-sm">
                          <strong>Input:</strong> {tc.input}
                        </div>
                        <div className="text-sm">
                          <strong>Output:</strong> {tc.expectedOutput}
                        </div>
                        <div className="text-sm text-gray-600">{tc.explanation}</div>
                        {tc.isHidden && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Hidden
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Terminal-specific fields */}
            {params.labType === 'terminal' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Docker Image
                  </label>
                  <input
                    type="text"
                    value={generatedLab.dockerImage}
                    onChange={(e) => handleEditField('dockerImage', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tasks ({generatedLab.tasks?.length || 0})
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-64 overflow-auto">
                    {generatedLab.tasks?.map((task, idx) => (
                      <div key={idx} className="mb-3 pb-3 border-b border-gray-200 last:border-0">
                        <div className="font-semibold">{task.title}</div>
                        <div className="text-sm text-gray-600">{task.description}</div>
                        {task.hintCommand && (
                          <code className="text-xs bg-gray-900 text-gray-100 px-2 py-1 rounded">
                            {task.hintCommand}
                          </code>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Hints */}
            {generatedLab.hints && generatedLab.hints.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hints ({generatedLab.hints.length})
                </label>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {generatedLab.hints.map((hint, idx) => (
                    <li key={idx}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep('configure')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Regenerate
            </button>
            <button
              onClick={handleSaveToDatabase}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Save & Add to Lesson
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
