/**
 * Instructor Navigation Configuration
 */

import { NavigationConfig } from '../types';

export const instructorNavigationConfig: NavigationConfig = {
  id: 'instructor-nav',
  type: 'sidebar',
  branding: {
    name: 'Learning Platform',
    logo: '/logo.svg',
    logoSmall: '/logo-small.svg',
    href: '/instructor/dashboard',
  },
  sections: [
    {
      id: 'main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'home',
          href: '/instructor/dashboard',
          activeMatch: '/instructor/dashboard',
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: 'analytics',
          href: '/instructor/analytics',
        },
      ],
    },
    {
      id: 'content',
      title: 'Content Management',
      items: [
        {
          id: 'courses',
          label: 'My Courses',
          icon: 'courses',
          href: '/instructor/courses',
          badge: {
            text: '8',
            variant: 'primary',
          },
        },
        {
          id: 'modules',
          label: 'Modules',
          icon: 'layers',
          href: '/instructor/modules',
        },
        {
          id: 'assignments',
          label: 'Assignments',
          icon: 'file-text',
          href: '/instructor/assignments',
        },
        {
          id: 'dsa-problems',
          label: 'DSA Problems',
          icon: 'code',
          href: '/instructor/dsa-problems',
        },
        {
          id: 'labs',
          label: 'Labs',
          icon: 'flask',
          href: '/instructor/labs',
        },
      ],
    },
    {
      id: 'students',
      title: 'Students',
      items: [
        {
          id: 'enrolled-students',
          label: 'Enrolled Students',
          icon: 'users',
          href: '/instructor/students',
        },
        {
          id: 'submissions',
          label: 'Submissions',
          icon: 'inbox',
          href: '/instructor/submissions',
          badge: {
            text: '15',
            variant: 'warning',
            pulse: true,
          },
        },
        {
          id: 'grading',
          label: 'Grading',
          icon: 'check-square',
          href: '/instructor/grading',
        },
        {
          id: 'discussions',
          label: 'Discussions',
          icon: 'message-square',
          href: '/instructor/discussions',
        },
      ],
    },
    {
      id: 'tools',
      title: 'Tools',
      items: [
        {
          id: 'ai-generator',
          label: 'AI Content Generator',
          icon: 'sparkles',
          href: '/instructor/ai-generator',
        },
        {
          id: 'bulk-import',
          label: 'Bulk Import',
          icon: 'upload',
          href: '/instructor/bulk-import',
        },
        {
          id: 'certificates',
          label: 'Certificates',
          icon: 'award',
          href: '/instructor/certificates',
        },
      ],
    },
  ],
  user: {
    show: true,
    position: 'bottom',
    showAvatar: true,
    showName: true,
    showRole: true,
    dropdownItems: [
      {
        id: 'profile',
        label: 'Profile',
        icon: 'user',
        href: '/profile',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: 'settings',
        href: '/settings',
      },
      {
        id: 'switch-to-student',
        label: 'Switch to Student View',
        icon: 'repeat',
        onClick: 'switchToStudentView',
      },
      {
        id: 'divider-1',
        label: '',
        divider: true,
      },
      {
        id: 'help',
        label: 'Help Center',
        icon: 'help-circle',
        href: '/help',
      },
      {
        id: 'logout',
        label: 'Logout',
        icon: 'log-out',
        onClick: 'handleLogout',
      },
    ],
  },
  search: {
    show: true,
    placeholder: 'Search courses, students, content...',
    endpoint: '/api/search',
  },
  notifications: {
    show: true,
    endpoint: '/api/notifications',
  },
  theme: {
    position: 'user-menu',
  },
  settings: {
    collapsible: true,
    width: 280,
    position: 'left',
  },
};
