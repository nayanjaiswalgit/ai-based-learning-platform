/**
 * Course Form Configurations
 * Config-driven forms for course creation, editing, and management
 */

import { FormConfig } from '../types';

export const createCourseFormConfig: FormConfig = {
  id: 'create-course-form',
  title: 'Create New Course',
  description: 'Fill in the details to create a new course',
  method: 'POST',
  action: '/api/courses',
  sections: [
    {
      id: 'basic-info',
      title: 'Basic Information',
      fields: [
        {
          id: 'title',
          name: 'title',
          label: 'Course Title',
          type: 'text',
          placeholder: 'e.g., Complete Web Development Bootcamp',
          validation: [
            { type: 'required', message: 'Course title is required' },
            { type: 'minLength', value: 10, message: 'Title must be at least 10 characters' },
            { type: 'maxLength', value: 100, message: 'Title must be less than 100 characters' },
          ],
        },
        {
          id: 'slug',
          name: 'slug',
          label: 'URL Slug',
          type: 'text',
          placeholder: 'web-development-bootcamp',
          helpText: 'This will be used in the course URL',
          validation: [
            { type: 'required', message: 'Slug is required' },
            { type: 'pattern', value: '^[a-z0-9-]+$', message: 'Slug can only contain lowercase letters, numbers, and hyphens' },
          ],
        },
        {
          id: 'description',
          name: 'description',
          label: 'Description',
          type: 'textarea',
          placeholder: 'Describe what students will learn in this course...',
          rows: 4,
          validation: [
            { type: 'required', message: 'Description is required' },
            { type: 'minLength', value: 50, message: 'Description must be at least 50 characters' },
            { type: 'maxLength', value: 500, message: 'Description must be less than 500 characters' },
          ],
        },
      ],
    },
    {
      id: 'course-details',
      title: 'Course Details',
      layout: 'grid',
      columns: 2,
      fields: [
        {
          id: 'category',
          name: 'category',
          label: 'Category',
          type: 'select',
          options: [
            { label: 'Web Development', value: 'web-development' },
            { label: 'Mobile Development', value: 'mobile-development' },
            { label: 'Data Science', value: 'data-science' },
            { label: 'Machine Learning', value: 'machine-learning' },
            { label: 'DevOps', value: 'devops' },
            { label: 'Cloud Computing', value: 'cloud-computing' },
            { label: 'Cybersecurity', value: 'cybersecurity' },
            { label: 'UI/UX Design', value: 'ui-ux-design' },
          ],
          validation: [
            { type: 'required', message: 'Category is required' },
          ],
        },
        {
          id: 'difficulty',
          name: 'difficulty',
          label: 'Difficulty Level',
          type: 'select',
          options: [
            { label: 'Beginner', value: 'BEGINNER' },
            { label: 'Intermediate', value: 'INTERMEDIATE' },
            { label: 'Advanced', value: 'ADVANCED' },
          ],
          validation: [
            { type: 'required', message: 'Difficulty level is required' },
          ],
        },
        {
          id: 'price',
          name: 'price',
          label: 'Price (USD)',
          type: 'number',
          placeholder: '49.99',
          min: 0,
          step: 0.01,
          validation: [
            { type: 'required', message: 'Price is required' },
            { type: 'min', value: 0, message: 'Price must be 0 or greater' },
          ],
        },
        {
          id: 'duration',
          name: 'duration',
          label: 'Duration (hours)',
          type: 'number',
          placeholder: '40',
          min: 1,
          validation: [
            { type: 'required', message: 'Duration is required' },
            { type: 'min', value: 1, message: 'Duration must be at least 1 hour' },
          ],
        },
      ],
    },
    {
      id: 'media',
      title: 'Media',
      fields: [
        {
          id: 'thumbnail',
          name: 'thumbnail',
          label: 'Course Thumbnail',
          type: 'file',
          accept: 'image/*',
          helpText: 'Upload a course thumbnail image (recommended: 1200x630px)',
          validation: [
            { type: 'required', message: 'Thumbnail is required' },
          ],
        },
        {
          id: 'previewVideo',
          name: 'previewVideo',
          label: 'Preview Video (Optional)',
          type: 'url',
          placeholder: 'https://youtube.com/watch?v=...',
          helpText: 'Add a preview video URL to showcase your course',
        },
      ],
    },
    {
      id: 'prerequisites',
      title: 'Prerequisites',
      fields: [
        {
          id: 'prerequisites',
          name: 'prerequisites',
          label: 'Prerequisites',
          type: 'textarea',
          placeholder: 'List any prerequisites for this course (one per line)',
          rows: 3,
          helpText: 'What should students know before taking this course?',
        },
      ],
    },
    {
      id: 'settings',
      title: 'Course Settings',
      fields: [
        {
          id: 'isPublished',
          name: 'isPublished',
          label: 'Publish immediately',
          type: 'checkbox',
          defaultValue: false,
          helpText: 'You can always publish later',
        },
        {
          id: 'allowCertificates',
          name: 'allowCertificates',
          label: 'Enable certificates upon completion',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          id: 'enableForum',
          name: 'enableForum',
          label: 'Enable discussion forum',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
  ],
  actions: [
    {
      type: 'button',
      label: 'Cancel',
      variant: 'outline',
    },
    {
      type: 'submit',
      label: 'Create Course',
      variant: 'default',
      loadingText: 'Creating course...',
      className: 'btn-modern',
    },
  ],
  onSuccess: {
    message: 'Course created successfully!',
    redirect: '/instructor/courses',
  },
};

export const editCourseFormConfig: FormConfig = {
  ...createCourseFormConfig,
  id: 'edit-course-form',
  title: 'Edit Course',
  description: 'Update course information',
  method: 'PATCH',
  action: '/api/courses/:id',
  actions: [
    {
      type: 'button',
      label: 'Cancel',
      variant: 'outline',
    },
    {
      type: 'submit',
      label: 'Save Changes',
      variant: 'default',
      loadingText: 'Saving...',
      className: 'btn-modern',
    },
  ],
  onSuccess: {
    message: 'Course updated successfully!',
  },
};

export const createModuleFormConfig: FormConfig = {
  id: 'create-module-form',
  title: 'Add Module',
  description: 'Create a new module for your course',
  method: 'POST',
  action: '/api/courses/:courseId/modules',
  sections: [
    {
      id: 'module-info',
      fields: [
        {
          id: 'title',
          name: 'title',
          label: 'Module Title',
          type: 'text',
          placeholder: 'e.g., Introduction to JavaScript',
          validation: [
            { type: 'required', message: 'Module title is required' },
            { type: 'minLength', value: 5, message: 'Title must be at least 5 characters' },
          ],
        },
        {
          id: 'description',
          name: 'description',
          label: 'Description',
          type: 'textarea',
          placeholder: 'Describe what this module covers...',
          rows: 3,
          validation: [
            { type: 'required', message: 'Description is required' },
          ],
        },
        {
          id: 'order',
          name: 'order',
          label: 'Order',
          type: 'number',
          placeholder: '1',
          min: 1,
          helpText: 'The order in which this module appears',
          validation: [
            { type: 'required', message: 'Order is required' },
            { type: 'min', value: 1, message: 'Order must be at least 1' },
          ],
        },
      ],
    },
  ],
  actions: [
    {
      type: 'button',
      label: 'Cancel',
      variant: 'outline',
    },
    {
      type: 'submit',
      label: 'Add Module',
      variant: 'default',
      loadingText: 'Adding...',
      className: 'btn-modern',
    },
  ],
  onSuccess: {
    message: 'Module added successfully!',
  },
};

export const createLessonFormConfig: FormConfig = {
  id: 'create-lesson-form',
  title: 'Add Lesson',
  description: 'Create a new lesson for this module',
  method: 'POST',
  action: '/api/modules/:moduleId/lessons',
  sections: [
    {
      id: 'lesson-info',
      fields: [
        {
          id: 'title',
          name: 'title',
          label: 'Lesson Title',
          type: 'text',
          placeholder: 'e.g., Variables and Data Types',
          validation: [
            { type: 'required', message: 'Lesson title is required' },
            { type: 'minLength', value: 5, message: 'Title must be at least 5 characters' },
          ],
        },
        {
          id: 'type',
          name: 'type',
          label: 'Lesson Type',
          type: 'select',
          options: [
            { label: 'Video', value: 'video' },
            { label: 'Article', value: 'article' },
            { label: 'Quiz', value: 'quiz' },
            { label: 'Assignment', value: 'assignment' },
            { label: 'Live Session', value: 'live-session' },
          ],
          validation: [
            { type: 'required', message: 'Lesson type is required' },
          ],
        },
        {
          id: 'content',
          name: 'content',
          label: 'Content',
          type: 'textarea',
          placeholder: 'Lesson content or video URL...',
          rows: 5,
          validation: [
            { type: 'required', message: 'Content is required' },
          ],
        },
        {
          id: 'duration',
          name: 'duration',
          label: 'Duration (minutes)',
          type: 'number',
          placeholder: '15',
          min: 1,
          validation: [
            { type: 'required', message: 'Duration is required' },
          ],
        },
        {
          id: 'order',
          name: 'order',
          label: 'Order',
          type: 'number',
          placeholder: '1',
          min: 1,
          validation: [
            { type: 'required', message: 'Order is required' },
          ],
        },
        {
          id: 'isFree',
          name: 'isFree',
          label: 'Free preview',
          type: 'checkbox',
          defaultValue: false,
          helpText: 'Allow non-enrolled students to preview this lesson',
        },
      ],
    },
  ],
  actions: [
    {
      type: 'button',
      label: 'Cancel',
      variant: 'outline',
    },
    {
      type: 'submit',
      label: 'Add Lesson',
      variant: 'default',
      loadingText: 'Adding...',
      className: 'btn-modern',
    },
  ],
  onSuccess: {
    message: 'Lesson added successfully!',
  },
};
