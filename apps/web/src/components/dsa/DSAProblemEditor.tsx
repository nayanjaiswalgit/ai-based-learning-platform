'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Loader2, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

const API_BASE = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3009';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  category: z.string().min(1, 'Category is required'),
  companies: z.array(z.string()).min(1, 'Select at least one company'),
  tags: z.array(z.string()).min(1, 'Add at least one tag'),
  hints: z.array(z.string()),
  timeComplexity: z.string().optional(),
  spaceComplexity: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface DSAProblemEditorProps {
  problemId?: string;
  onSave?: (problem: any) => void;
  onCancel?: () => void;
}

const CATEGORIES = [
  'Array',
  'String',
  'Linked List',
  'Tree',
  'Graph',
  'Dynamic Programming',
  'Recursion',
  'Backtracking',
  'Greedy',
  'Binary Search',
  'Two Pointers',
  'Sliding Window',
  'Hash Table',
  'Stack',
  'Queue',
  'Heap',
  'Sorting',
  'Math',
  'Bit Manipulation',
];

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
  'Adobe',
  'Bloomberg',
];

const COMMON_TAGS = [
  'Array',
  'String',
  'Hash Table',
  'Dynamic Programming',
  'Math',
  'Sorting',
  'Greedy',
  'Depth-First Search',
  'Binary Search',
  'Database',
  'Breadth-First Search',
  'Tree',
  'Matrix',
  'Two Pointers',
  'Binary Tree',
  'Bit Manipulation',
  'Stack',
  'Design',
  'Heap',
  'Graph',
];

export function DSAProblemEditor({ problemId, onSave, onCancel }: DSAProblemEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hints, setHints] = useState<string[]>(['']);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      difficulty: 'MEDIUM',
      category: '',
      companies: [],
      tags: [],
      hints: [],
      timeComplexity: '',
      spaceComplexity: '',
      url: '',
    },
  });

  useEffect(() => {
    if (problemId) {
      fetchProblem();
    }
  }, [problemId]);

  const fetchProblem = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/dsa-sheet/problems/${problemId}`);
      if (!response.ok) throw new Error('Failed to fetch problem');

      const problem = await response.json();
      form.reset({
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        category: problem.category,
        companies: problem.companies || [],
        tags: problem.tags || [],
        hints: problem.hints || [],
        timeComplexity: problem.timeComplexity || '',
        spaceComplexity: problem.spaceComplexity || '',
        url: problem.url || '',
      });
      setHints(problem.hints || ['']);
      setSelectedCompanies(problem.companies || []);
      setSelectedTags(problem.tags || []);
    } catch (error) {
      toast({
        title: 'Failed to load problem',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: FormData) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        companies: selectedCompanies,
        tags: selectedTags,
        hints: hints.filter((h) => h.trim()),
      };

      const url = problemId
        ? `${API_BASE}/dsa-sheet/problems/${problemId}`
        : `${API_BASE}/dsa-sheet/problems`;

      const response = await fetch(url, {
        method: problemId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save problem');

      const savedProblem = await response.json();

      toast({
        title: problemId ? 'Problem updated!' : 'Problem created!',
        description: `${savedProblem.title} has been saved`,
      });

      onSave?.(savedProblem);
    } catch (error) {
      toast({
        title: 'Failed to save',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddHint = () => {
    setHints([...hints, '']);
  };

  const handleUpdateHint = (index: number, value: string) => {
    const newHints = [...hints];
    newHints[index] = value;
    setHints(newHints);
    form.setValue('hints', newHints);
  };

  const handleRemoveHint = (index: number) => {
    const newHints = hints.filter((_, i) => i !== index);
    setHints(newHints);
    form.setValue('hints', newHints);
  };

  const handleCompanyToggle = (company: string) => {
    const newCompanies = selectedCompanies.includes(company)
      ? selectedCompanies.filter((c) => c !== company)
      : [...selectedCompanies, company];
    setSelectedCompanies(newCompanies);
    form.setValue('companies', newCompanies);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    form.setValue('tags', newTags);
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      const newTags = [...selectedTags, customTag.trim()];
      setSelectedTags(newTags);
      form.setValue('tags', newTags);
      setCustomTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = selectedTags.filter((t) => t !== tag);
    setSelectedTags(newTags);
    form.setValue('tags', newTags);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(handleSave)} className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {problemId ? 'Edit DSA Problem' : 'Create DSA Problem'}
          </h2>
          <p className="text-gray-600 mt-1">
            Add or update a data structures and algorithms problem
          </p>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {problemId ? 'Update' : 'Create'} Problem
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Problem Title</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="e.g., Two Sum"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...form.register('description')}
              className="w-full min-h-[150px] px-3 py-2 border rounded-md"
              placeholder="Describe the problem in detail..."
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                onValueChange={(value) => form.setValue('difficulty', value as any)}
                defaultValue={form.watch('difficulty')}
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
              <Label htmlFor="category">Category</Label>
              <Select
                onValueChange={(value) => form.setValue('category', value)}
                value={form.watch('category')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timeComplexity">Time Complexity (Optional)</Label>
              <Input
                id="timeComplexity"
                {...form.register('timeComplexity')}
                placeholder="e.g., O(n)"
              />
            </div>

            <div>
              <Label htmlFor="spaceComplexity">Space Complexity (Optional)</Label>
              <Input
                id="spaceComplexity"
                {...form.register('spaceComplexity')}
                placeholder="e.g., O(1)"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="url">Problem URL (Optional)</Label>
            <Input
              id="url"
              {...form.register('url')}
              placeholder="https://leetcode.com/problems/..."
            />
            {form.formState.errors.url && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.url.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company Tags</CardTitle>
          <CardDescription>Select companies that ask this problem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {COMPANIES.map((company) => (
              <Badge
                key={company}
                variant={selectedCompanies.includes(company) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleCompanyToggle(company)}
              >
                {company}
              </Badge>
            ))}
          </div>
          {form.formState.errors.companies && (
            <p className="text-sm text-red-500 mt-2">
              {form.formState.errors.companies.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Problem Tags</CardTitle>
          <CardDescription>Add tags to categorize this problem</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded">
              {selectedTags.map((tag) => (
                <Badge key={tag} className="gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* Common Tags */}
          <div>
            <Label className="text-xs text-gray-600 mb-2">Common Tags</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom Tag Input */}
          <div>
            <Label className="text-xs text-gray-600 mb-2">Add Custom Tag</Label>
            <div className="flex gap-2">
              <Input
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Enter custom tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
              />
              <Button type="button" onClick={handleAddCustomTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {form.formState.errors.tags && (
            <p className="text-sm text-red-500">
              {form.formState.errors.tags.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hints</CardTitle>
          <CardDescription>Add hints to help students solve the problem</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {hints.map((hint, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs text-gray-600">Hint {index + 1}</Label>
                <Input
                  value={hint}
                  onChange={(e) => handleUpdateHint(index, e.target.value)}
                  placeholder={`Enter hint ${index + 1}`}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveHint(index)}
                className="mt-5"
                disabled={hints.length === 1}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={handleAddHint} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Hint
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
