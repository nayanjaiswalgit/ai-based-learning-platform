'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface GenerationSession {
  sessionId: string;
  content: any;
  status: string;
}

interface RefineModalState {
  isOpen: boolean;
  sectionType: string;
  sectionId: string;
  sectionTitle: string;
  currentContent: any;
}

export default function AICoursePage() {
  const router = useRouter();
  const [step, setStep] = useState<'prompt' | 'review' | 'refining' | 'publishing'>('prompt');
  const [prompt, setPrompt] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [estimatedHours, setEstimatedHours] = useState<number>(40);
  const [moduleCount, setModuleCount] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState<GenerationSession | null>(null);
  const [refineModal, setRefineModal] = useState<RefineModalState>({
    isOpen: false,
    sectionType: '',
    sectionId: '',
    sectionTitle: '',
    currentContent: null,
  });
  const [refinementPrompt, setRefinementPrompt] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a course description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/v1/course-generation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          difficulty,
          estimatedHours,
          moduleCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate course');
      }

      const data = await response.json();
      setSession(data);
      setStep('review');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRefineSection = (sectionType: string, sectionId: string, sectionTitle: string, content: any) => {
    setRefineModal({
      isOpen: true,
      sectionType,
      sectionId,
      sectionTitle,
      currentContent: content,
    });
    setRefinementPrompt('');
  };

  const handleSubmitRefinement = async () => {
    if (!refinementPrompt.trim() || !session) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:3001/api/v1/course-generation/sessions/${session.sessionId}/refine`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionType: refineModal.sectionType,
          sectionId: refineModal.sectionId,
          refinementPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refine content');
      }

      const data = await response.json();
      setSession({ ...session, content: data.content });
      setRefineModal({ ...refineModal, isOpen: false });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!session) return;

    setLoading(true);
    setError('');
    setStep('publishing');

    try {
      const response = await fetch(`http://localhost:3001/api/v1/course-generation/sessions/${session.sessionId}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to publish course');
      }

      const data = await response.json();
      alert(`Course published successfully! Course ID: ${data.courseId}`);
      router.push('/instructor/courses');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setStep('review');
    } finally {
      setLoading(false);
    }
  };

  const renderPromptStep = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-2">Generate Course with AI</h1>
        <p className="text-gray-600 mb-8">
          Describe your course and let AI create a complete curriculum with modules, lessons, quizzes, coding challenges, and labs.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Description *</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Create a comprehensive Python programming course for beginners. Include basics, data structures, OOP, and practical projects. Focus on hands-on learning with coding exercises."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours</label>
              <input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseInt(e.target.value))}
                min={1}
                max={500}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Modules</label>
              <input
                type="number"
                value={moduleCount}
                onChange={(e) => setModuleCount(parseInt(e.target.value))}
                min={1}
                max={20}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition"
          >
            {loading ? 'Generating Course... (This may take 30-60 seconds)' : 'Generate Course with AI'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    if (!session || !session.content) return null;

    const content = session.content;

    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
              <p className="text-gray-600">{content.description}</p>
            </div>
            <button
              onClick={handlePublish}
              disabled={loading}
              className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 disabled:bg-gray-400 font-medium transition"
            >
              {loading ? 'Publishing...' : 'Publish Course'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-600">Difficulty</div>
              <div className="text-lg font-semibold capitalize">{content.difficultyLevel}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-600">Duration</div>
              <div className="text-lg font-semibold">{content.estimatedDurationHours} hours</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-600">Modules</div>
              <div className="text-lg font-semibold">{content.modules?.length || 0}</div>
            </div>
          </div>

          <div className="border-t pt-6">
            <button
              onClick={() => handleRefineSection('course', '', 'Entire Course', content)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Refine Course Info
            </button>
          </div>
        </div>

        {content.modules?.map((module: any, moduleIdx: number) => (
          <div key={moduleIdx} className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">
                  Module {moduleIdx + 1}: {module.title}
                </h2>
                <p className="text-gray-600 text-sm mt-1">{module.description}</p>
              </div>
              <button
                onClick={() => handleRefineSection('module', moduleIdx.toString(), module.title, module)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Refine Module
              </button>
            </div>

            <div className="space-y-3">
              {module.lessons?.map((lesson: any, lessonIdx: number) => (
                <div key={lessonIdx} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {lesson.contentType}
                        </span>
                        <h3 className="font-semibold">{lesson.title}</h3>
                        <span className="text-sm text-gray-500">({lesson.durationMinutes} min)</span>
                      </div>
                      {lesson.contentText && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{lesson.contentText.substring(0, 150)}...</p>
                      )}
                      {lesson.quiz && (
                        <div className="mt-2 text-sm text-gray-500">
                          Quiz: {lesson.quiz.questions?.length || 0} questions
                        </div>
                      )}
                      {lesson.codingQuestion && (
                        <div className="mt-2 text-sm text-gray-500">
                          Coding Challenge: {lesson.codingQuestion.title}
                        </div>
                      )}
                      {lesson.terminalLab && (
                        <div className="mt-2 text-sm text-gray-500">
                          Terminal Lab: {lesson.terminalLab.title}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        handleRefineSection('lesson', `${moduleIdx}-${lessonIdx}`, lesson.title, lesson)
                      }
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-4"
                    >
                      Refine
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-4">
            {error}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {step === 'prompt' && renderPromptStep()}
      {step === 'review' && renderReviewStep()}

      {refineModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Refine: {refineModal.sectionTitle}</h2>
            <p className="text-gray-600 mb-4">
              Provide instructions on how you'd like to improve this section.
            </p>
            <textarea
              value={refinementPrompt}
              onChange={(e) => setRefinementPrompt(e.target.value)}
              placeholder="Example: Make this more beginner-friendly, add more examples, include practical exercises, simplify the language..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleSubmitRefinement}
                disabled={loading || !refinementPrompt.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Refining...' : 'Refine Section'}
              </button>
              <button
                onClick={() => setRefineModal({ ...refineModal, isOpen: false })}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 disabled:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
