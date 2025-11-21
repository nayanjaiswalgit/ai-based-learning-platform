/**
 * Students Table Configuration
 */

import { TableConfig } from '../types';

export const studentsTableConfig: TableConfig = {
  id: 'students-table',
  title: 'Enrolled Students',
  description: 'Manage students enrolled in your courses',
  columns: [
    {
      id: 'avatar',
      key: 'avatar',
      label: '',
      type: 'avatar',
      width: 60,
      sortable: false,
    },
    {
      id: 'name',
      key: 'name',
      label: 'Name',
      type: 'text',
      sortable: true,
      filterable: true,
      filter: {
        type: 'text',
        placeholder: 'Search by name...',
      },
    },
    {
      id: 'email',
      key: 'email',
      label: 'Email',
      type: 'text',
      sortable: true,
      filterable: true,
    },
    {
      id: 'course',
      key: 'course.title',
      label: 'Course',
      type: 'text',
      sortable: true,
      filterable: true,
      filter: {
        type: 'select',
        options: [],
      },
    },
    {
      id: 'enrolledAt',
      key: 'enrolledAt',
      label: 'Enrolled',
      type: 'date',
      sortable: true,
      format: {
        type: 'date',
        options: { dateStyle: 'medium' },
      },
    },
    {
      id: 'progress',
      key: 'progress',
      label: 'Progress',
      type: 'custom',
      render: 'renderProgressBar',
      sortable: true,
    },
    {
      id: 'lastActive',
      key: 'lastActive',
      label: 'Last Active',
      type: 'date',
      sortable: true,
      format: {
        type: 'relative-time',
      },
    },
    {
      id: 'grade',
      key: 'grade',
      label: 'Grade',
      type: 'badge',
      sortable: true,
      badge: {
        variants: {
          A: 'success',
          B: 'primary',
          C: 'warning',
          D: 'destructive',
          F: 'destructive',
          '-': 'secondary',
        },
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
    endpoint: '/api/students',
    method: 'GET',
  },
  rowActions: [
    {
      id: 'view-profile',
      label: 'View Profile',
      icon: 'user',
      variant: 'outline',
      onClick: 'handleViewProfile',
    },
    {
      id: 'view-submissions',
      label: 'View Submissions',
      icon: 'file-text',
      variant: 'outline',
      onClick: 'handleViewSubmissions',
    },
    {
      id: 'send-message',
      label: 'Send Message',
      icon: 'message-circle',
      variant: 'outline',
      onClick: 'handleSendMessage',
    },
    {
      id: 'unenroll',
      label: 'Unenroll',
      icon: 'user-minus',
      variant: 'destructive',
      onClick: 'handleUnenroll',
      confirm: {
        title: 'Unenroll Student',
        description: 'Are you sure you want to unenroll this student?',
      },
    },
  ],
  bulkActions: [
    {
      id: 'export-grades',
      label: 'Export Grades',
      icon: 'download',
      variant: 'outline',
      onClick: 'handleExportGrades',
    },
    {
      id: 'send-announcement',
      label: 'Send Announcement',
      icon: 'megaphone',
      variant: 'default',
      onClick: 'handleSendAnnouncement',
    },
  ],
  selection: {
    enabled: true,
    mode: 'multiple',
    showSelectAll: true,
  },
  pagination: {
    enabled: true,
    pageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
    showTotal: true,
    position: 'bottom',
  },
  sorting: {
    enabled: true,
    defaultSort: {
      column: 'name',
      direction: 'asc',
    },
    serverSide: true,
  },
  filtering: {
    enabled: true,
    serverSide: true,
    searchEnabled: true,
    searchPlaceholder: 'Search students...',
    searchColumns: ['name', 'email'],
  },
  export: {
    enabled: true,
    formats: ['csv', 'excel'],
    filename: 'students-export',
  },
  refresh: {
    enabled: true,
  },
  emptyState: {
    title: 'No students enrolled',
    description: 'Share your course to get students enrolled',
    icon: 'users',
  },
  loading: {
    type: 'skeleton',
    rows: 10,
  },
  responsive: {
    mobile: 'cards',
  },
  density: 'normal',
  striped: true,
  hoverable: true,
};
