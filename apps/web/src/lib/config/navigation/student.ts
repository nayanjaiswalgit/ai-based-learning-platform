/**
 * Student Navigation Configuration
 */

import { NavigationConfig } from '../types';

export const studentNavigationConfig: NavigationConfig = {
  id: 'student-nav',
  type: 'sidebar',
  branding: {
    name: 'Learning Platform',
    logo: '/logo.svg',
    logoSmall: '/logo-small.svg',
    href: '/dashboard',
  },
  sections: [
    {
      id: 'main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'home',
          href: '/dashboard',
          activeMatch: ['/dashboard', '/'],
        },
        {
          id: 'my-courses',
          label: 'My Courses',
          icon: 'courses',
          href: '/courses/enrolled',
          activeMatch: '/courses/enrolled',
          badge: {
            text: '3',
            variant: 'primary',
          },
        },
        {
          id: 'browse-courses',
          label: 'Browse Courses',
          icon: 'search',
          href: '/courses/browse',
        },
        {
          id: 'calendar',
          label: 'Calendar',
          icon: 'calendar',
          href: '/calendar',
        },
      ],
    },
    {
      id: 'learning',
      title: 'Learning',
      items: [
        {
          id: 'assignments',
          label: 'Assignments',
          icon: 'file-text',
          href: '/assignments',
          badge: {
            text: '2',
            variant: 'warning',
            pulse: true,
          },
        },
        {
          id: 'dsa-practice',
          label: 'DSA Practice',
          icon: 'code',
          href: '/dsa',
          children: [
            {
              id: 'dsa-problems',
              label: 'Problems',
              href: '/dsa/problems',
            },
            {
              id: 'dsa-sheets',
              label: 'My Sheets',
              href: '/dsa/sheets',
            },
            {
              id: 'dsa-contests',
              label: 'Contests',
              href: '/dsa/contests',
            },
          ],
        },
        {
          id: 'labs',
          label: 'Labs',
          icon: 'flask',
          href: '/labs',
        },
        {
          id: 'certificates',
          label: 'Certificates',
          icon: 'award',
          href: '/certificates',
        },
      ],
    },
    {
      id: 'community',
      title: 'Community',
      items: [
        {
          id: 'forum',
          label: 'Forum',
          icon: 'message-square',
          href: '/forum',
        },
        {
          id: 'leaderboard',
          label: 'Leaderboard',
          icon: 'trophy',
          href: '/leaderboard',
        },
        {
          id: 'study-groups',
          label: 'Study Groups',
          icon: 'users',
          href: '/groups',
        },
      ],
    },
  ],
  user: {
    show: true,
    position: 'bottom',
    showAvatar: true,
    showName: true,
    showEmail: false,
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
        id: 'divider-1',
        label: '',
        divider: true,
      },
      {
        id: 'help',
        label: 'Help & Support',
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
    placeholder: 'Search courses, problems, forums...',
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
