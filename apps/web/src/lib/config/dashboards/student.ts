/**
 * Student Dashboard Configuration
 */

import { DashboardConfig } from '../types';

export const studentDashboardConfig: DashboardConfig = {
  id: 'student-dashboard',
  title: 'My Learning Dashboard',
  description: 'Track your progress and stay on top of your courses',
  layout: {
    type: 'grid',
    columns: 4,
    gap: 6,
    responsive: {
      mobile: 1,
      tablet: 2,
      desktop: 4,
    },
  },
  sections: [
    {
      id: 'stats',
      widgets: [
        {
          id: 'enrolled-courses',
          type: 'stat',
          size: 'small',
          label: 'Enrolled Courses',
          value: 8,
          format: 'number',
          icon: 'book-open',
          color: 'primary',
          trend: {
            value: 2,
            direction: 'up',
            label: 'since last month',
          },
          onClick: 'navigateToCourses',
        },
        {
          id: 'completed-lessons',
          type: 'stat',
          size: 'small',
          label: 'Completed Lessons',
          value: 45,
          format: 'number',
          icon: 'check-circle',
          color: 'success',
          trend: {
            value: 12,
            direction: 'up',
            label: 'this week',
          },
        },
        {
          id: 'pending-assignments',
          type: 'stat',
          size: 'small',
          label: 'Pending Assignments',
          value: 3,
          format: 'number',
          icon: 'clock',
          color: 'warning',
          onClick: 'navigateToAssignments',
        },
        {
          id: 'certificates-earned',
          type: 'stat',
          size: 'small',
          label: 'Certificates',
          value: 2,
          format: 'number',
          icon: 'award',
          color: 'secondary',
          onClick: 'navigateToCertificates',
        },
      ],
    },
    {
      id: 'progress',
      title: 'Course Progress',
      widgets: [
        {
          id: 'course-progress-widget',
          type: 'progress',
          size: 'large',
          title: 'Ongoing Courses',
          items: [
            {
              label: 'Web Development Bootcamp',
              value: 75,
              total: 100,
              color: '#3b82f6',
            },
            {
              label: 'Data Structures & Algorithms',
              value: 45,
              total: 100,
              color: '#10b981',
            },
            {
              label: 'React Masterclass',
              value: 90,
              total: 100,
              color: '#8b5cf6',
            },
          ],
        },
        {
          id: 'learning-time-chart',
          type: 'chart',
          size: 'large',
          chartType: 'line',
          title: 'Learning Time (Last 7 Days)',
          dataSource: {
            type: 'api',
            endpoint: '/api/analytics/learning-time',
            refreshInterval: 300000, // 5 minutes
          },
          options: {
            xAxis: 'date',
            yAxis: 'hours',
            legend: true,
            colors: ['#3b82f6', '#10b981'],
            height: 300,
          },
        },
      ],
    },
    {
      id: 'upcoming',
      title: 'Upcoming',
      widgets: [
        {
          id: 'upcoming-assignments',
          type: 'list',
          size: 'medium',
          title: 'Due This Week',
          dataSource: {
            type: 'api',
            endpoint: '/api/assignments/upcoming',
            refreshInterval: 60000,
          },
          itemTemplate: {
            title: 'title',
            subtitle: 'courseName',
            badge: 'priority',
            timestamp: 'dueDate',
            onClick: 'openAssignment',
          },
          emptyState: {
            title: 'No upcoming assignments',
            description: "You're all caught up!",
          },
          showMore: {
            enabled: true,
            onClick: 'navigateToAllAssignments',
            label: 'View all assignments',
          },
        },
        {
          id: 'calendar-widget',
          type: 'calendar',
          size: 'medium',
          title: 'My Schedule',
          dataSource: {
            type: 'api',
            endpoint: '/api/calendar/events',
          },
          view: 'month',
          eventTemplate: {
            title: 'title',
            time: 'startTime',
            color: 'category',
          },
        },
      ],
    },
    {
      id: 'achievements',
      title: 'Recent Activity',
      widgets: [
        {
          id: 'recent-achievements',
          type: 'list',
          size: 'medium',
          title: 'Achievements',
          dataSource: {
            type: 'api',
            endpoint: '/api/achievements/recent',
          },
          itemTemplate: {
            title: 'title',
            subtitle: 'description',
            avatar: 'icon',
            timestamp: 'earnedAt',
          },
          showMore: {
            enabled: true,
            href: '/achievements',
          },
        },
        {
          id: 'leaderboard-widget',
          type: 'table',
          size: 'medium',
          title: 'Class Leaderboard',
          dataSource: {
            type: 'api',
            endpoint: '/api/leaderboard/top',
          },
          columns: [
            { key: 'rank', label: '#' },
            { key: 'name', label: 'Name' },
            { key: 'points', label: 'Points' },
          ],
          maxRows: 5,
          showMore: {
            enabled: true,
            href: '/leaderboard',
          },
        },
      ],
    },
  ],
  filters: {
    dateRange: true,
    customFilters: [
      {
        id: 'course-filter',
        label: 'Course',
        type: 'select',
        options: [
          { label: 'All Courses', value: 'all' },
          { label: 'Web Development', value: 'web-dev' },
          { label: 'DSA', value: 'dsa' },
        ],
        defaultValue: 'all',
      },
    ],
  },
  refresh: {
    enabled: true,
    interval: 300000, // 5 minutes
    manual: true,
  },
  customization: {
    allowReorder: true,
    allowResize: false,
    allowAdd: false,
    allowRemove: false,
    savePreferences: true,
  },
};
