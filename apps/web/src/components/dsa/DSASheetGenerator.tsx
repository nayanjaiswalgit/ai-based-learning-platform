'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sparkles, Loader2, Download, FileUp, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

const API_BASE = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3009';

const schema = z.object({
  targetCompany: z.string().min(1, 'Company is required'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  problemCount: z.number().min(10).max(100),
  focusTopics: z.array(z.string()).min(1, 'Select at least one topic'),
});

type FormData = z.infer<typeof schema>;

interface DSAProblem {
  id?: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  tags: string[];
  companies: string[];
  url?: string;
  description?: string;
  acceptanceRate?: number;
}

const COMPANIES = [
  'Google',
  'Amazon',
  'Meta',
  'Microsoft',
  'Apple',
  'Netflix',
  'Uber',
  'Airbnb',
  'LinkedIn',
  'Twitter',
  'Salesforce',
  'Oracle',
];

const TOPICS = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Recursion',
  'Backtracking',
  'Greedy',
  'Binary Search',
  'Two Pointers',
  'Sliding Window',
  'Hash Tables',
  'Stacks',
  'Queues',
  'Heaps',
  'Sorting',
  'Bit Manipulation',
];

export function DSASheetGenerator() {
  const [generatedProblems, setGeneratedProblems] = useState<DSAProblem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      targetCompany: '',
      difficulty: 'MEDIUM',
      problemCount: 50,
      focusTopics: [],
    },
  });

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) => {
      const newTopics = prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic];
      form.setValue('focusTopics', newTopics);
      return newTopics;
    });
  };

  const handleGenerate = async (data: FormData) => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/dsa-sheet/generate-sheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCompany: data.targetCompany,
          difficulty: data.difficulty,
          problemCount: data.problemCount,
          focusTopics: data.focusTopics,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate DSA sheet');

      const result = await response.json();
      setGeneratedProblems(result.problems || []);

      toast({
        title: 'DSA Sheet Generated!',
        description: `Created ${result.problems?.length || 0} problems for ${data.targetCompany}`,
      });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCSV = () => {
    if (generatedProblems.length === 0) return;

    const headers = ['Title', 'Difficulty', 'Category', 'Tags', 'Companies', 'URL'];
    const rows = generatedProblems.map((p) => [
      p.title,
      p.difficulty,
      p.category,
      p.tags.join('; '),
      p.companies.join('; '),
      p.url || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsa-sheet-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Exported!',
      description: 'DSA sheet exported to CSV',
    });
  };

  const handleBulkImport = async () => {
    // This would integrate with your backend to save all problems
    toast({
      title: 'Import started',
      description: `Importing ${generatedProblems.length} problems...`,
    });

    try {
      const response = await fetch(`${API_BASE}/dsa-sheet/bulk-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problems: generatedProblems }),
      });

      if (!response.ok) throw new Error('Failed to import problems');

      toast({
        title: 'Import successful!',
        description: `Imported ${generatedProblems.length} problems`,
      });
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      EASY: 'bg-green-100 text-green-700',
      MEDIUM: 'bg-yellow-100 text-yellow-700',
      HARD: 'bg-red-100 text-red-700',
    };
    return colors[difficulty as keyof typeof colors] || colors.MEDIUM;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DSA Sheet Generator</h1>
          <p className="text-gray-600 mt-1">
            Generate AI-powered problem sets for interview preparation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Generation Settings</CardTitle>
            <CardDescription>Configure your DSA problem sheet</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-4">
              <div>
                <Label htmlFor="targetCompany">Target Company</Label>
                <Select
                  onValueChange={(value) => form.setValue('targetCompany', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANIES.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.targetCompany && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.targetCompany.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  onValueChange={(value) => form.setValue('difficulty', value as any)}
                  defaultValue="MEDIUM"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="problemCount">
                  Number of Problems: {form.watch('problemCount')}
                </Label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  {...form.register('problemCount', { valueAsNumber: true })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>10</span>
                  <span>100</span>
                </div>
              </div>

              <div>
                <Label>Focus Topics</Label>
                <div className="flex flex-wrap gap-2 mt-2 max-h-64 overflow-y-auto p-2 border rounded">
                  {TOPICS.map((topic) => (
                    <Badge
                      key={topic}
                      variant={selectedTopics.includes(topic) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleTopicToggle(topic)}
                    >
                      {selectedTopics.includes(topic) && (
                        <Check className="h-3 w-3 mr-1" />
                      )}
                      {topic}
                    </Badge>
                  ))}
                </div>
                {form.formState.errors.focusTopics && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.focusTopics.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Sheet
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Problems</CardTitle>
                <CardDescription>
                  {generatedProblems.length > 0
                    ? `${generatedProblems.length} problems generated`
                    : 'Generate a sheet to see problems'}
                </CardDescription>
              </div>
              {generatedProblems.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button size="sm" onClick={handleBulkImport}>
                    <FileUp className="h-4 w-4 mr-2" />
                    Bulk Import
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedProblems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No problems generated yet</p>
                <p className="text-sm">Fill out the form and click Generate Sheet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 rounded text-sm font-medium sticky top-0">
                  <div className="col-span-5">Problem</div>
                  <div className="col-span-2">Difficulty</div>
                  <div className="col-span-3">Category</div>
                  <div className="col-span-2">Actions</div>
                </div>

                {/* Table Rows */}
                {generatedProblems.map((problem, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 px-4 py-3 border rounded hover:bg-gray-50 transition"
                  >
                    <div className="col-span-5">
                      <p className="font-medium text-sm">{problem.title}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {problem.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {problem.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{problem.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <Badge className={getDifficultyColor(problem.difficulty)}>
                        {problem.difficulty}
                      </Badge>
                    </div>

                    <div className="col-span-3">
                      <p className="text-sm text-gray-600">{problem.category}</p>
                      <p className="text-xs text-gray-500">
                        {problem.companies.slice(0, 2).join(', ')}
                        {problem.companies.length > 2 && ` +${problem.companies.length - 2}`}
                      </p>
                    </div>

                    <div className="col-span-2 flex items-center gap-1">
                      {problem.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(problem.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Summary */}
      {generatedProblems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sheet Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-700">
                  {generatedProblems.filter((p) => p.difficulty === 'EASY').length}
                </div>
                <div className="text-sm text-gray-600">Easy</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded">
                <div className="text-2xl font-bold text-yellow-700">
                  {generatedProblems.filter((p) => p.difficulty === 'MEDIUM').length}
                </div>
                <div className="text-sm text-gray-600">Medium</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded">
                <div className="text-2xl font-bold text-red-700">
                  {generatedProblems.filter((p) => p.difficulty === 'HARD').length}
                </div>
                <div className="text-sm text-gray-600">Hard</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-700">
                  {new Set(generatedProblems.flatMap((p) => p.tags)).size}
                </div>
                <div className="text-sm text-gray-600">Unique Topics</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
