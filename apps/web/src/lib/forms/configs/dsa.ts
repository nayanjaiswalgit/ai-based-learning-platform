/**
 * DSA Form Configurations
 * Config-driven forms for DSA problems, sheets, and challenges
 */

import { FormConfig } from '../types';

export const createDSAProblemFormConfig: FormConfig = {
  id: 'create-dsa-problem-form',
  title: 'Create DSA Problem',
  description: 'Add a new data structures and algorithms problem',
  method: 'POST',
  action: '/api/dsa/problems',
  sections: [
    {
      id: 'problem-info',
      title: 'Problem Information',
      fields: [
        {
          id: 'title',
          name: 'title',
          label: 'Problem Title',
          type: 'text',
          placeholder: 'e.g., Two Sum',
          validation: [
            { type: 'required', message: 'Title is required' },
            { type: 'minLength', value: 5, message: 'Title must be at least 5 characters' },
          ],
        },
        {
          id: 'difficulty',
          name: 'difficulty',
          label: 'Difficulty',
          type: 'select',
          options: [
            { label: 'Easy', value: 'EASY' },
            { label: 'Medium', value: 'MEDIUM' },
            { label: 'Hard', value: 'HARD' },
          ],
          validation: [
            { type: 'required', message: 'Difficulty is required' },
          ],
        },
        {
          id: 'description',
          name: 'description',
          label: 'Problem Description',
          type: 'textarea',
          placeholder: 'Describe the problem statement...',
          rows: 6,
          validation: [
            { type: 'required', message: 'Description is required' },
            { type: 'minLength', value: 50, message: 'Description must be at least 50 characters' },
          ],
        },
      ],
    },
    {
      id: 'categorization',
      title: 'Categorization',
      layout: 'grid',
      columns: 2,
      fields: [
        {
          id: 'category',
          name: 'category',
          label: 'Category',
          type: 'select',
          options: [
            { label: 'Array', value: 'array' },
            { label: 'String', value: 'string' },
            { label: 'Linked List', value: 'linked-list' },
            { label: 'Stack', value: 'stack' },
            { label: 'Queue', value: 'queue' },
            { label: 'Tree', value: 'tree' },
            { label: 'Graph', value: 'graph' },
            { label: 'Dynamic Programming', value: 'dynamic-programming' },
            { label: 'Greedy', value: 'greedy' },
            { label: 'Backtracking', value: 'backtracking' },
            { label: 'Binary Search', value: 'binary-search' },
            { label: 'Sorting', value: 'sorting' },
          ],
          validation: [
            { type: 'required', message: 'Category is required' },
          ],
        },
        {
          id: 'tags',
          name: 'tags',
          label: 'Tags',
          type: 'text',
          placeholder: 'hash-table, two-pointers',
          helpText: 'Comma-separated tags',
        },
      ],
    },
    {
      id: 'examples',
      title: 'Examples',
      fields: [
        {
          id: 'examples',
          name: 'examples',
          label: 'Example Test Cases',
          type: 'textarea',
          placeholder: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]',
          rows: 4,
          helpText: 'Provide example inputs and outputs',
          validation: [
            { type: 'required', message: 'At least one example is required' },
          ],
        },
        {
          id: 'constraints',
          name: 'constraints',
          label: 'Constraints',
          type: 'textarea',
          placeholder: '1 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9',
          rows: 3,
          validation: [
            { type: 'required', message: 'Constraints are required' },
          ],
        },
      ],
    },
    {
      id: 'solution',
      title: 'Solution (Optional)',
      fields: [
        {
          id: 'hints',
          name: 'hints',
          label: 'Hints',
          type: 'textarea',
          placeholder: 'Hint 1: Try using a hash map...\nHint 2: ...',
          rows: 3,
        },
        {
          id: 'solutionApproach',
          name: 'solutionApproach',
          label: 'Solution Approach',
          type: 'textarea',
          placeholder: 'Explain the approach to solve this problem...',
          rows: 4,
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
      label: 'Create Problem',
      variant: 'default',
      loadingText: 'Creating...',
      className: 'btn-modern',
    },
  ],
  onSuccess: {
    message: 'DSA problem created successfully!',
  },
};

export const generateDSASheetFormConfig: FormConfig = {
  id: 'generate-dsa-sheet-form',
  title: 'Generate DSA Sheet',
  description: 'Create a personalized DSA practice sheet',
  method: 'POST',
  action: '/api/dsa/sheets/generate',
  sections: [
    {
      id: 'sheet-config',
      fields: [
        {
          id: 'name',
          name: 'name',
          label: 'Sheet Name',
          type: 'text',
          placeholder: 'My DSA Practice Sheet',
          validation: [
            { type: 'required', message: 'Sheet name is required' },
          ],
        },
        {
          id: 'difficulty',
          name: 'difficulty',
          label: 'Target Difficulty',
          type: 'radio',
          options: [
            { label: 'Easy', value: 'EASY' },
            { label: 'Medium', value: 'MEDIUM' },
            { label: 'Hard', value: 'HARD' },
            { label: 'Mixed', value: 'MIXED' },
          ],
          defaultValue: 'MEDIUM',
          validation: [
            { type: 'required', message: 'Difficulty is required' },
          ],
        },
        {
          id: 'problemCount',
          name: 'problemCount',
          label: 'Number of Problems',
          type: 'number',
          placeholder: '50',
          min: 10,
          max: 200,
          defaultValue: 50,
          helpText: 'Choose between 10 and 200 problems',
          validation: [
            { type: 'required', message: 'Problem count is required' },
            { type: 'min', value: 10, message: 'Minimum 10 problems' },
            { type: 'max', value: 200, message: 'Maximum 200 problems' },
          ],
        },
        {
          id: 'categories',
          name: 'categories',
          label: 'Focus Categories',
          type: 'textarea',
          placeholder: 'array, string, tree, graph',
          rows: 2,
          helpText: 'Comma-separated list of categories (leave empty for all)',
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
      label: 'Generate Sheet',
      variant: 'default',
      loadingText: 'Generating...',
      className: 'btn-modern',
    },
  ],
  onSuccess: {
    message: 'DSA sheet generated successfully!',
  },
};
