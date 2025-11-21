/**
 * Courses Table Configuration
 */

import { TableConfig } from '../types';

export const coursesTableConfig: TableConfig = {
  id: 'courses-table',
  title: 'My Courses',
  description: 'Manage and track all your courses',
  columns: [
    {
      id: 'thumbnail',
      key: 'thumbnail',
      label: '',
      type: 'avatar',
      width: 60,
      sortable: false,
    },
    {
      id: 'title',
      key: 'title',
      label: 'Course Title',
      type: 'text',
      sortable: true,
      filterable: true,
      filter: {
        type: 'text',
        placeholder: 'Search courses...',
      },
    },
    {
      id: 'instructor',
      key: 'instructor.name',
      label: 'Instructor',
      type: 'text',
      sortable: true,
      filterable: true,
      filter: {
        type: 'select',
        options: [],
      },
    },
    {
      id: 'difficulty',
      key: 'difficulty',
      label: 'Difficulty',
      type: 'badge',
      sortable: true,
      filterable: true,
      filter: {
        type: 'select',
        options: [
          { label: 'Beginner', value: 'BEGINNER' },
          { label: 'Intermediate', value: 'INTERMEDIATE' },
          { label: 'Advanced', value: 'ADVANCED' },
        ],
      },
      badge: {
        variants: {
          BEGINNER: 'success',
          INTERMEDIATE: 'warning',
          ADVANCED: 'destructive',
        },
      },
    },
    {
      id: 'status',
      key: 'status',
      label: 'Status',
      type: 'badge',
      sortable: true,
      filterable: true,
      filter: {
        type: 'select',
        options: [
          { label: 'Published', value: 'PUBLISHED' },
          { label: 'Draft', value: 'DRAFT' },
          { label: 'Archived', value: 'ARCHIVED' },
        ],
      },
      badge: {
        variants: {
          PUBLISHED: 'success',
          DRAFT: 'secondary',
          ARCHIVED: 'outline',
        },
      },
    },
    {
      id: 'enrollments',
      key: 'enrollmentCount',
      label: 'Enrollments',
      type: 'number',
      align: 'center',
      sortable: true,
      format: {
        type: 'number',
        options: { useGrouping: true },
      },
    },
    {
      id: 'price',
      key: 'price',
      label: 'Price',
      type: 'number',
      align: 'right',
      sortable: true,
      format: {
        type: 'currency',
        options: { currency: 'USD' },
      },
    },
    {
      id: 'updatedAt',
      key: 'updatedAt',
      label: 'Last Updated',
      type: 'date',
      sortable: true,
      format: {
        type: 'relative-time',
      },
    },
    {
      id: 'actions',
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      align: 'right',
      width: 100,
    },
  ],
  dataSource: {
    type: 'api',
    endpoint: '/api/courses',
    method: 'GET',
    params: {
      include: 'instructor,enrollments',
    },
  },
  rowActions: [
    {
      id: 'edit',
      label: 'Edit',
      icon: 'edit',
      variant: 'outline',
      onClick: 'handleEdit',
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: 'copy',
      variant: 'outline',
      onClick: 'handleDuplicate',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'bar-chart',
      variant: 'outline',
      onClick: 'handleAnalytics',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'trash',
      variant: 'destructive',
      onClick: 'handleDelete',
      confirm: {
        title: 'Delete Course',
        description: 'Are you sure? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    },
  ],
  bulkActions: [
    {
      id: 'publish',
      label: 'Publish Selected',
      icon: 'eye',
      variant: 'default',
      onClick: 'handleBulkPublish',
    },
    {
      id: 'archive',
      label: 'Archive Selected',
      icon: 'archive',
      variant: 'outline',
      onClick: 'handleBulkArchive',
    },
    {
      id: 'delete',
      label: 'Delete Selected',
      icon: 'trash',
      variant: 'destructive',
      onClick: 'handleBulkDelete',
      confirm: {
        title: 'Delete Courses',
        description: 'Are you sure you want to delete the selected courses?',
      },
    },
  ],
  selection: {
    enabled: true,
    mode: 'multiple',
    showSelectAll: true,
  },
  pagination: {
    enabled: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
    showTotal: true,
    position: 'bottom',
  },
  sorting: {
    enabled: true,
    defaultSort: {
      column: 'updatedAt',
      direction: 'desc',
    },
    serverSide: true,
  },
  filtering: {
    enabled: true,
    serverSide: true,
    searchEnabled: true,
    searchPlaceholder: 'Search courses...',
    searchColumns: ['title', 'description', 'instructor.name'],
  },
  export: {
    enabled: true,
    formats: ['csv', 'excel', 'pdf'],
    filename: 'courses-export',
  },
  refresh: {
    enabled: true,
    interval: 0, // Manual only
  },
  emptyState: {
    title: 'No courses found',
    description: 'Get started by creating your first course',
    icon: 'book-open',
    action: {
      label: 'Create Course',
      onClick: 'handleCreateCourse',
    },
  },
  loading: {
    type: 'skeleton',
    rows: 5,
  },
  responsive: {
    mobile: 'cards',
    breakpoint: 768,
  },
  density: 'normal',
  striped: true,
  bordered: false,
  hoverable: true,
};

export const enrolledCoursesTableConfig: TableConfig = {
  ...coursesTableConfig,
  id: 'enrolled-courses-table',
  title: 'My Enrolled Courses',
  description: 'Track your learning progress',
  columns: [
    ...coursesTableConfig.columns.slice(0, -2), // Remove price and actions
    {
      id: 'progress',
      key: 'progress',
      label: 'Progress',
      type: 'custom',
      render: 'renderProgress',
      sortable: true,
    },
    {
      id: 'lastAccessed',
      key: 'lastAccessed',
      label: 'Last Accessed',
      type: 'date',
      sortable: true,
      format: {
        type: 'relative-time',
      },
    },
    {
      id: 'actions',
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      align: 'right',
      width: 100,
    },
  ],
  dataSource: {
    type: 'api',
    endpoint: '/api/courses/enrolled',
    method: 'GET',
  },
  rowActions: [
    {
      id: 'continue',
      label: 'Continue Learning',
      icon: 'play',
      variant: 'default',
      onClick: 'handleContinue',
    },
    {
      id: 'certificate',
      label: 'View Certificate',
      icon: 'award',
      variant: 'outline',
      onClick: 'handleViewCertificate',
      disabled: (row: any) => row.progress < 100,
    },
  ],
  bulkActions: [],
  selection: {
    enabled: false,
    mode: 'single',
  },
};
