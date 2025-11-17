'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, X, Send, Link as LinkIcon, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SubmitAssignmentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [links, setLinks] = useState<string[]>(['']);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Mock assignment data
  const assignment = {
    id: params.id,
    title: 'Build a Todo Application',
    course: 'Full Stack Web Development',
    dueDate: '2025-11-24',
    maxPoints: 100,
    description: 'Create a fully functional todo application using React and Node.js. The application should allow users to create, read, update, and delete tasks.',
    requirements: [
      'Use React for the frontend',
      'Implement CRUD operations',
      'Add proper error handling',
      'Write clean, commented code',
      'Deploy the application (optional)',
    ],
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const addLink = () => {
    setLinks([...links, '']);
  };

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12">
        <div className="mx-auto max-w-2xl px-4">
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="p-12 text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">
                Assignment Submitted!
              </h1>
              <p className="mb-8 text-lg text-slate-600 dark:text-slate-400">
                Your assignment has been successfully submitted. Your instructor will review it soon.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/dashboard">
                  <Button variant="outline">Back to Dashboard</Button>
                </Link>
                <Link href={`/assignments/${params.id}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    View Assignment
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12">
      <div className="mx-auto max-w-4xl space-y-6 px-4">
        {/* Header */}
        <div>
          <Link href={`/assignments/${params.id}`}>
            <Button variant="ghost" className="mb-4">
              ← Back to Assignment
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Submit Assignment
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {assignment.course} • Due: {new Date(assignment.dueDate).toLocaleDateString()}
          </p>
        </div>

        {/* Assignment Details */}
        <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {assignment.title}
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {assignment.description}
            </p>

            <div className="mt-6">
              <h3 className="font-semibold text-slate-900 dark:text-white">Requirements:</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
                {assignment.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                {assignment.maxPoints} points
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Submission Form */}
        <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Your Submission
            </h3>

            {/* File Upload */}
            <div>
              <Label>Upload Files</Label>
              <div className="mt-2">
                <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-600 dark:hover:bg-slate-900">
                  <Upload className="h-10 w-10 text-slate-400" />
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Click to upload files
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    PDF, ZIP, or any document (max 50MB)
                  </p>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Links */}
            <div>
              <Label>Links (GitHub, Live Demo, etc.)</Label>
              <div className="mt-2 space-y-3">
                {links.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={link}
                        onChange={(e) => updateLink(index, e.target.value)}
                        placeholder="https://github.com/username/project"
                        className="pl-10"
                      />
                    </div>
                    {links.length > 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeLink(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addLink} className="w-full">
                  Add Another Link
                </Button>
              </div>
            </div>

            {/* Description/Comments */}
            <div>
              <Label htmlFor="description">Additional Comments (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any additional information about your submission..."
                className="mt-2"
                rows={6}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Assignment
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Tips */}
        <Card className="border-blue-200 bg-blue-50/80 backdrop-blur-sm dark:border-blue-900 dark:bg-blue-950/80">
          <div className="p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300">
              💡 Submission Tips
            </h3>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-blue-800 dark:text-blue-400">
              <li>Double-check that all required files are uploaded</li>
              <li>Test all links to ensure they work correctly</li>
              <li>Include a README file with setup instructions</li>
              <li>Make sure your code is well-commented</li>
              <li>You can resubmit before the deadline if needed</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
