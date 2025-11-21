/**
 * Forum/Community Form Configurations
 * Config-driven forms for threads, replies, and community interactions
 */

import { FormConfig } from '../types';

export const createThreadFormConfig: FormConfig = {
  id: 'create-thread-form',
  title: 'Start a Discussion',
  description: 'Ask a question or start a conversation',
  method: 'POST',
  action: '/api/forum/threads',
  sections: [
    {
      id: 'thread-info',
      fields: [
        {
          id: 'title',
          name: 'title',
          label: 'Title',
          type: 'text',
          placeholder: 'What do you want to discuss?',
          validation: [
            { type: 'required', message: 'Title is required' },
            { type: 'minLength', value: 10, message: 'Title must be at least 10 characters' },
            { type: 'maxLength', value: 200, message: 'Title must be less than 200 characters' },
          ],
        },
        {
          id: 'category',
          name: 'category',
          label: 'Category',
          type: 'select',
          options: [
            { label: 'General Discussion', value: 'general' },
            { label: 'Questions', value: 'questions' },
            { label: 'Course Content', value: 'course-content' },
            { label: 'Technical Help', value: 'technical-help' },
            { label: 'Feedback', value: 'feedback' },
            { label: 'Showcase', value: 'showcase' },
          ],
          validation: [
            { type: 'required', message: 'Category is required' },
          ],
        },
        {
          id: 'content',
          name: 'content',
          label: 'Content',
          type: 'textarea',
          placeholder: 'Provide details about your question or discussion...',
          rows: 6,
          validation: [
            { type: 'required', message: 'Content is required' },
            { type: 'minLength', value: 20, message: 'Content must be at least 20 characters' },
          ],
        },
        {
          id: 'tags',
          name: 'tags',
          label: 'Tags (Optional)',
          type: 'text',
          placeholder: 'javascript, react, api',
          helpText: 'Comma-separated tags to help others find your post',
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
      label: 'Post Discussion',
      variant: 'default',
      loadingText: 'Posting...',
      className: 'btn-modern',
    },
  ],
  onSuccess: {
    message: 'Discussion posted successfully!',
  },
};

export const replyFormConfig: FormConfig = {
  id: 'reply-form',
  title: 'Reply',
  description: '',
  method: 'POST',
  action: '/api/forum/threads/:threadId/replies',
  sections: [
    {
      id: 'reply-content',
      fields: [
        {
          id: 'content',
          name: 'content',
          label: 'Your Reply',
          type: 'textarea',
          placeholder: 'Share your thoughts...',
          rows: 4,
          validation: [
            { type: 'required', message: 'Reply content is required' },
            { type: 'minLength', value: 10, message: 'Reply must be at least 10 characters' },
          ],
        },
      ],
    },
  ],
  actions: [
    {
      type: 'submit',
      label: 'Post Reply',
      variant: 'default',
      loadingText: 'Posting...',
      className: 'btn-modern',
    },
  ],
  onSuccess: {
    message: 'Reply posted successfully!',
  },
};
