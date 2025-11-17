'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_BASE = process.env.NEXT_PUBLIC_COURSE_SERVICE_URL || 'http://localhost:3002';

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId: string;
  onImportComplete?: (result: any) => void;
}

interface PreviewData {
  lessons?: any[];
  questions?: any[];
  errors?: string[];
}

interface FieldMapping {
  [key: string]: string;
}

export function BulkImportDialog({
  open,
  onOpenChange,
  moduleId,
  onImportComplete,
}: BulkImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'csv' | 'json'>('csv');
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [step, setStep] = useState<'upload' | 'preview' | 'map' | 'complete'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !['csv', 'json'].includes(extension)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV or JSON file',
        variant: 'destructive',
      });
      return;
    }

    setFileType(extension as 'csv' | 'json');
    setSelectedFile(file);
    parseFile(file, extension as 'csv' | 'json');
  };

  const parseFile = async (file: File, type: 'csv' | 'json') => {
    try {
      const text = await file.text();

      if (type === 'json') {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          setPreviewData({ lessons: data });
          setStep('preview');
        } else if (data.lessons && Array.isArray(data.lessons)) {
          setPreviewData({ lessons: data.lessons });
          setStep('preview');
        } else {
          throw new Error('Invalid JSON structure. Expected array or object with "lessons" array');
        }
      } else {
        // Parse CSV
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          throw new Error('CSV file must have at least a header row and one data row');
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index];
          });
          return obj;
        });

        setPreviewData({ lessons: rows });

        // Auto-detect field mappings
        const mapping: FieldMapping = {};
        headers.forEach(header => {
          const lower = header.toLowerCase();
          if (lower.includes('title')) mapping.title = header;
          if (lower.includes('description')) mapping.description = header;
          if (lower.includes('content')) mapping.content = header;
          if (lower.includes('duration')) mapping.durationMinutes = header;
          if (lower.includes('preview')) mapping.isFreePreview = header;
          if (lower.includes('order')) mapping.order = header;
        });

        setFieldMapping(mapping);
        setStep('map');
      }
    } catch (error) {
      toast({
        title: 'Failed to parse file',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async () => {
    if (!previewData?.lessons) return;

    setIsUploading(true);
    try {
      // Transform data based on field mapping (for CSV)
      let lessonsToImport = previewData.lessons;

      if (fileType === 'csv' && Object.keys(fieldMapping).length > 0) {
        lessonsToImport = previewData.lessons.map(lesson => {
          const transformed: any = {};
          Object.entries(fieldMapping).forEach(([targetField, sourceField]) => {
            if (sourceField && lesson[sourceField] !== undefined) {
              let value = lesson[sourceField];

              // Type conversions
              if (targetField === 'durationMinutes') {
                value = parseInt(value) || 30;
              } else if (targetField === 'isFreePreview') {
                value = value.toLowerCase() === 'true' || value === '1';
              } else if (targetField === 'order') {
                value = parseInt(value) || 0;
              }

              transformed[targetField] = value;
            }
          });
          return transformed;
        });
      }

      const response = await fetch(`${API_BASE}/lessons/module/${moduleId}/bulk-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessons: lessonsToImport }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to import lessons');
      }

      const result = await response.json();
      setStep('complete');

      toast({
        title: 'Import successful!',
        description: `Imported ${lessonsToImport.length} lessons`,
      });

      onImportComplete?.(result);
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setFieldMapping({});
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sampleCSV = `title,description,content,durationMinutes,isFreePreview,order
Introduction to React,Learn React basics,React is a JavaScript library...,30,true,0
React Components,Understanding components,Components are the building blocks...,45,false,1
State Management,Managing state in React,State allows components to be dynamic...,60,false,2`;

  const sampleJSON = {
    lessons: [
      {
        title: 'Introduction to React',
        description: 'Learn React basics',
        content: 'React is a JavaScript library...',
        durationMinutes: 30,
        isFreePreview: true,
        order: 0,
      },
      {
        title: 'React Components',
        description: 'Understanding components',
        content: 'Components are the building blocks...',
        durationMinutes: 45,
        isFreePreview: false,
        order: 1,
      },
    ],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Lessons</DialogTitle>
          <DialogDescription>
            Import multiple lessons from CSV or JSON files
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload File</CardTitle>
                <CardDescription>Select a CSV or JSON file to import</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium mb-2">
                    {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500">CSV or JSON files supported</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Format Examples */}
            <Card>
              <CardHeader>
                <CardTitle>File Format Examples</CardTitle>
                <CardDescription>Use these templates for your import file</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="csv">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="csv">CSV Format</TabsTrigger>
                    <TabsTrigger value="json">JSON Format</TabsTrigger>
                  </TabsList>

                  <TabsContent value="csv" className="space-y-2">
                    <pre className="bg-gray-50 p-4 rounded text-xs overflow-x-auto">
                      {sampleCSV}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(sampleCSV);
                        toast({ title: 'Copied to clipboard!' });
                      }}
                    >
                      Copy CSV Template
                    </Button>
                  </TabsContent>

                  <TabsContent value="json" className="space-y-2">
                    <pre className="bg-gray-50 p-4 rounded text-xs overflow-x-auto">
                      {JSON.stringify(sampleJSON, null, 2)}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(sampleJSON, null, 2));
                        toast({ title: 'Copied to clipboard!' });
                      }}
                    >
                      Copy JSON Template
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'map' && previewData && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Field Mapping</CardTitle>
                <CardDescription>
                  Map your CSV columns to lesson fields
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {['title', 'description', 'content', 'durationMinutes', 'isFreePreview', 'order'].map(
                  field => (
                    <div key={field} className="grid grid-cols-2 gap-4 items-center">
                      <Label>{field}</Label>
                      <Select
                        value={fieldMapping[field]}
                        onValueChange={(value) =>
                          setFieldMapping({ ...fieldMapping, [field]: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {previewData.lessons && previewData.lessons[0] &&
                            Object.keys(previewData.lessons[0]).map(col => (
                              <SelectItem key={col} value={col}>
                                {col}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => setStep('preview')} className="flex-1">
                Continue to Preview
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && previewData && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preview Import Data</CardTitle>
                <CardDescription>
                  Review {previewData.lessons?.length || 0} lessons before importing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {previewData.lessons?.map((lesson, index) => (
                    <div key={index} className="p-3 border rounded bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{lesson.title || 'Untitled'}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {lesson.description || 'No description'}
                          </p>
                          <div className="flex gap-2 mt-2 text-xs text-gray-500">
                            <span>{lesson.durationMinutes || 30} min</span>
                            {lesson.isFreePreview && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                Free Preview
                              </span>
                            )}
                          </div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>

                {previewData.errors && previewData.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center gap-2 text-red-700 mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <p className="font-medium">Validation Errors</p>
                    </div>
                    <ul className="text-sm text-red-600 list-disc list-inside">
                      {previewData.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={isUploading || (previewData.errors?.length || 0) > 0}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Import {previewData.lessons?.length || 0} Lessons
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Import Complete!</h3>
              <p className="text-gray-600">
                Successfully imported {previewData?.lessons?.length || 0} lessons
              </p>
            </div>
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
