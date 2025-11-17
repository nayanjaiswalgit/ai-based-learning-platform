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
import { Upload, X, Save, Eye, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { courseApi } from '@/lib/api-client';
import type { CreateCourseRequest } from '@/types/api.types';
import { useToast } from '@/components/ui/use-toast';

type Step = 'basic' | 'details' | 'pricing' | 'curriculum' | 'preview';

export default function CreateCoursePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    category: '',
    difficultyLevel: '',
    language: 'English',
    price: '',
    discountPrice: '',
    duration: '',
    learningOutcomes: [''],
    prerequisites: [''],
    targetAudience: [''],
  });

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate slug from title
    if (field === 'title') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleArrayFieldChange = (field: 'learningOutcomes' | 'prerequisites' | 'targetAudience', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  const addArrayField = (field: 'learningOutcomes' | 'prerequisites' | 'targetAudience') => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayField = (field: 'learningOutcomes' | 'prerequisites' | 'targetAudience', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const uploadThumbnail = async (): Promise<string | undefined> => {
    if (!thumbnail) return undefined;

    // TODO: Implement actual file upload to S3/Cloudinary
    // For now, return a placeholder URL
    // In production, this would upload to S3 and return the URL
    return thumbnailPreview;
  };

  const handleSaveDraft = async () => {
    try {
      setIsLoading(true);

      // Upload thumbnail first
      const thumbnailUrl = await uploadThumbnail();

      // Prepare course data
      const courseData: CreateCourseRequest = {
        title: formData.title,
        description: formData.shortDescription,
        longDescription: formData.description,
        instructorId: 'user_123', // TODO: Get from auth context
        difficultyLevel: formData.difficultyLevel.toUpperCase() as any,
        estimatedDurationHours: formData.duration ? parseFloat(formData.duration) : undefined,
        price: parseFloat(formData.price) || 0,
        isPublished: false,
        isFree: parseFloat(formData.price) === 0,
        thumbnailUrl,
        language: formData.language.toLowerCase(),
      };

      const response = await courseApi.createCourse(courseData);
      setCreatedCourseId((response as any).id);

      toast({
        title: 'Draft Saved',
        description: 'Your course has been saved as a draft.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save draft',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsLoading(true);

      let courseId = createdCourseId;

      // If course doesn't exist, create it first
      if (!courseId) {
        const thumbnailUrl = await uploadThumbnail();

        const courseData: CreateCourseRequest = {
          title: formData.title,
          description: formData.shortDescription,
          longDescription: formData.description,
          instructorId: 'user_123', // TODO: Get from auth context
          difficultyLevel: formData.difficultyLevel.toUpperCase() as any,
          estimatedDurationHours: formData.duration ? parseFloat(formData.duration) : undefined,
          price: parseFloat(formData.price) || 0,
          isPublished: true,
          isFree: parseFloat(formData.price) === 0,
          thumbnailUrl,
          language: formData.language.toLowerCase(),
        };

        const response = await courseApi.createCourse(courseData);
        courseId = (response as any).id;
      } else {
        // Update existing course to published
        await courseApi.publishCourse(courseId, true);
      }

      toast({
        title: 'Course Published!',
        description: 'Your course is now live and visible to students.',
      });

      // Redirect to course management
      setTimeout(() => {
        router.push('/instructor/courses');
      }, 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to publish course',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 'basic', name: 'Basic Info', order: 1 },
    { id: 'details', name: 'Details', order: 2 },
    { id: 'pricing', name: 'Pricing', order: 3 },
    { id: 'curriculum', name: 'Curriculum', order: 4 },
    { id: 'preview', name: 'Preview', order: 5 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Create New Course
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Fill in the details to create your course
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  currentStepIndex >= index
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800'
                }`}
              >
                {step.order}
              </div>
              <span className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-1 flex-1 ${
                  currentStepIndex > index
                    ? 'bg-blue-600'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="p-8">
          {currentStep === 'basic' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Basic Information
              </h2>

              {/* Thumbnail Upload */}
              <div>
                <Label>Course Thumbnail *</Label>
                <div className="mt-2">
                  {thumbnailPreview ? (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="h-64 w-full rounded-lg object-cover"
                      />
                      <button
                        onClick={() => {
                          setThumbnail(null);
                          setThumbnailPreview('');
                        }}
                        className="absolute top-2 right-2 rounded-full bg-red-600 p-2 text-white hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-600 dark:hover:bg-slate-900">
                      <Upload className="h-12 w-12 text-slate-400" />
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Click to upload thumbnail
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        PNG, JPG up to 10MB (1280x720 recommended)
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Course Title */}
              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Complete Web Development Bootcamp"
                  className="mt-2"
                />
              </div>

              {/* Slug */}
              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="complete-web-development-bootcamp"
                  className="mt-2"
                />
                <p className="mt-1 text-xs text-slate-500">
                  This will be part of your course URL
                </p>
              </div>

              {/* Short Description */}
              <div>
                <Label htmlFor="shortDescription">Short Description *</Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="A brief description of your course (max 200 characters)"
                  className="mt-2"
                  rows={3}
                  maxLength={200}
                />
                <p className="mt-1 text-xs text-slate-500">
                  {formData.shortDescription.length}/200 characters
                </p>
              </div>

              {/* Category and Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web-development">Web Development</SelectItem>
                      <SelectItem value="mobile-development">Mobile Development</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                      <SelectItem value="machine-learning">Machine Learning</SelectItem>
                      <SelectItem value="devops">DevOps</SelectItem>
                      <SelectItem value="cloud-computing">Cloud Computing</SelectItem>
                      <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                      <SelectItem value="game-development">Game Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty Level *</Label>
                  <Select
                    value={formData.difficultyLevel}
                    onValueChange={(value) => handleInputChange('difficultyLevel', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'details' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Course Details
              </h2>

              {/* Full Description */}
              <div>
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide a detailed description of your course..."
                  className="mt-2"
                  rows={8}
                />
              </div>

              {/* Learning Outcomes */}
              <div>
                <Label>What will students learn? *</Label>
                <div className="mt-2 space-y-3">
                  {formData.learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={outcome}
                        onChange={(e) =>
                          handleArrayFieldChange('learningOutcomes', index, e.target.value)
                        }
                        placeholder="e.g., Build full-stack web applications"
                      />
                      {formData.learningOutcomes.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeArrayField('learningOutcomes', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addArrayField('learningOutcomes')}
                    className="w-full"
                  >
                    Add Learning Outcome
                  </Button>
                </div>
              </div>

              {/* Prerequisites */}
              <div>
                <Label>Prerequisites</Label>
                <div className="mt-2 space-y-3">
                  {formData.prerequisites.map((prereq, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={prereq}
                        onChange={(e) =>
                          handleArrayFieldChange('prerequisites', index, e.target.value)
                        }
                        placeholder="e.g., Basic JavaScript knowledge"
                      />
                      {formData.prerequisites.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeArrayField('prerequisites', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addArrayField('prerequisites')}
                    className="w-full"
                  >
                    Add Prerequisite
                  </Button>
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <Label>Who is this course for?</Label>
                <div className="mt-2 space-y-3">
                  {formData.targetAudience.map((audience, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={audience}
                        onChange={(e) =>
                          handleArrayFieldChange('targetAudience', index, e.target.value)
                        }
                        placeholder="e.g., Aspiring web developers"
                      />
                      {formData.targetAudience.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeArrayField('targetAudience', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addArrayField('targetAudience')}
                    className="w-full"
                  >
                    Add Target Audience
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'pricing' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Pricing & Duration
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="99.99"
                    className="mt-2"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="discountPrice">Discount Price (USD)</Label>
                  <Input
                    id="discountPrice"
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => handleInputChange('discountPrice', e.target.value)}
                    placeholder="79.99"
                    className="mt-2"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="duration">Estimated Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="40"
                  className="mt-2"
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="language">Course Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => handleInputChange('language', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 'curriculum' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Course Curriculum
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                You'll be able to add modules and lessons after creating the course.
              </p>
              <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800">
                <p className="text-slate-600 dark:text-slate-400">
                  Create the course first, then add your curriculum content.
                </p>
              </div>
            </div>
          )}

          {currentStep === 'preview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Preview & Publish
              </h2>

              {/* Preview */}
              <div className="space-y-4">
                {thumbnailPreview && (
                  <img
                    src={thumbnailPreview}
                    alt="Course thumbnail"
                    className="h-48 w-full rounded-lg object-cover"
                  />
                )}
                <h3 className="text-xl font-bold">{formData.title || 'Untitled Course'}</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {formData.shortDescription || 'No description'}
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="rounded-full bg-blue-100 px-3 py-1 dark:bg-blue-950">
                    {formData.category || 'Uncategorized'}
                  </span>
                  <span className="rounded-full bg-green-100 px-3 py-1 dark:bg-green-950">
                    {formData.difficultyLevel || 'No level set'}
                  </span>
                  <span className="rounded-full bg-purple-100 px-3 py-1 dark:bg-purple-950">
                    ${formData.price || '0'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div>
          {currentStepIndex > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(steps[currentStepIndex - 1].id as Step)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>

          {currentStepIndex < steps.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(steps[currentStepIndex + 1].id as Step)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
              <Eye className="mr-2 h-4 w-4" />
              Publish Course
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
