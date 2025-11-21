# Config-Driven Architecture Guide

## Overview

The application uses a comprehensive config-driven architecture that eliminates repetitive code and enables rapid development through JSON-based configurations.

## Table of Contents

1. [Introduction](#introduction)
2. [Navigation System](#navigation-system)
3. [Dashboard System](#dashboard-system)
4. [Table/Grid System](#tablegrid-system)
5. [Form System](#form-system)
6. [Modal/Dialog System](#modaldialog-system)
7. [Settings System](#settings-system)
8. [Benefits](#benefits)
9. [Best Practices](#best-practices)

---

## Introduction

### Why Config-Driven?

**Traditional Approach:**
```tsx
// 500+ lines of repetitive React code
function MyTable() {
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState({});
  const [filtering, setFiltering] = useState({});
  const [pagination, setPagination] = useState({});
  // ... 100+ more lines of state management
  // ... 200+ lines of handler functions
  // ... 200+ lines of JSX
}
```

**Config-Driven Approach:**
```tsx
// 3 lines using configuration
<DataTable config={coursesTableConfig} />
```

### What Can Be Config-Driven?

✅ **Navigation** - Sidebars, headers, breadcrumbs
✅ **Dashboards** - Widgets, charts, stats
✅ **Tables** - Data grids with sorting, filtering, pagination
✅ **Forms** - All input types with validation
✅ **Modals** - Dialogs, drawers, toasts
✅ **Settings** - Preferences and configuration pages

---

## Navigation System

### Quick Start

```tsx
import { NavigationRenderer } from '@/components/navigation';
import { studentNavigationConfig } from '@/lib/config';

export function AppLayout() {
  return (
    <NavigationRenderer config={studentNavigationConfig} />
  );
}
```

### Creating Navigation Configs

```tsx
import { NavigationConfig } from '@/lib/config/types';

const myNav: NavigationConfig = {
  id: 'my-navigation',
  type: 'sidebar',
  branding: {
    name: 'My App',
    logo: '/logo.svg',
    href: '/',
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
          badge: {
            text: 'New',
            variant: 'primary',
            pulse: true,
          },
        },
        {
          id: 'courses',
          label: 'Courses',
          icon: 'book',
          children: [
            {
              id: 'my-courses',
              label: 'My Courses',
              href: '/courses/mine',
            },
            {
              id: 'browse',
              label: 'Browse',
              href: '/courses/browse',
            },
          ],
        },
      ],
    },
  ],
  user: {
    show: true,
    position: 'bottom',
    showAvatar: true,
    showName: true,
    dropdownItems: [
      {
        id: 'profile',
        label: 'Profile',
        icon: 'user',
        href: '/profile',
      },
      {
        id: 'logout',
        label: 'Logout',
        icon: 'log-out',
        onClick: 'handleLogout',
      },
    ],
  },
};
```

### Features

- **Nested Navigation** - Unlimited depth
- **Icons & Badges** - Visual indicators
- **Permissions** - Role-based access
- **Active States** - Automatic highlighting
- **Search & Notifications** - Built-in
- **Responsive** - Mobile drawer on small screens

### Pre-built Configs

- `studentNavigationConfig` - Student portal nav
- `instructorNavigationConfig` - Instructor dashboard nav

---

## Dashboard System

### Quick Start

```tsx
import { DashboardRenderer } from '@/components/dashboard';
import { studentDashboardConfig } from '@/lib/config';

export function Dashboard() {
  return (
    <DashboardRenderer config={studentDashboardConfig} />
  );
}
```

### Widget Types

#### 1. Stat Widgets

```tsx
{
  type: 'stat',
  size: 'small',
  label: 'Total Users',
  value: 1234,
  format: 'number',
  icon: 'users',
  color: 'primary',
  trend: {
    value: 12,
    direction: 'up',
    label: 'from last month',
  },
  onClick: 'navigateToUsers',
}
```

#### 2. Chart Widgets

```tsx
{
  type: 'chart',
  chartType: 'line',
  title: 'Revenue Over Time',
  dataSource: {
    type: 'api',
    endpoint: '/api/analytics/revenue',
    refreshInterval: 60000,
  },
  options: {
    xAxis: 'month',
    yAxis: 'revenue',
    legend: true,
    colors: ['#3b82f6'],
  },
}
```

#### 3. List Widgets

```tsx
{
  type: 'list',
  title: 'Recent Activity',
  dataSource: {
    type: 'api',
    endpoint: '/api/activity',
  },
  itemTemplate: {
    title: 'action',
    subtitle: 'user.name',
    avatar: 'user.avatar',
    timestamp: 'createdAt',
  },
  showMore: {
    enabled: true,
    href: '/activity',
  },
}
```

#### 4. Table Widgets

```tsx
{
  type: 'table',
  title: 'Top Performers',
  dataSource: {
    type: 'api',
    endpoint: '/api/leaderboard',
  },
  columns: [
    { key: 'rank', label: '#' },
    { key: 'name', label: 'Name' },
    { key: 'score', label: 'Score' },
  ],
  maxRows: 10,
}
```

### Layout Options

```tsx
layout: {
  type: 'grid',
  columns: 4,
  gap: 6,
  responsive: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
  },
}
```

### Features

- **Real-time Updates** - WebSocket support
- **Auto-refresh** - Configurable intervals
- **Filtering** - Date ranges and custom filters
- **Export** - PDF, image, JSON
- **Customization** - Drag & drop, resize
- **Permissions** - Widget-level access control

---

## Table/Grid System

### Quick Start

```tsx
import { DataTable } from '@/components/table';
import { coursesTableConfig } from '@/lib/config';

export function CoursesPage() {
  return (
    <DataTable config={coursesTableConfig} />
  );
}
```

### Column Types

```tsx
columns: [
  // Text
  { id: 'title', key: 'title', label: 'Title', type: 'text', sortable: true },

  // Number with formatting
  { id: 'price', key: 'price', label: 'Price', type: 'number', format: { type: 'currency' } },

  // Date with relative time
  { id: 'created', key: 'createdAt', label: 'Created', type: 'date', format: { type: 'relative-time' } },

  // Badge with variants
  {
    id: 'status',
    key: 'status',
    label: 'Status',
    type: 'badge',
    badge: {
      variants: {
        ACTIVE: 'success',
        PENDING: 'warning',
        INACTIVE: 'destructive',
      },
    },
  },

  // Custom render
  { id: 'progress', key: 'progress', label: 'Progress', type: 'custom', render: 'renderProgressBar' },

  // Actions
  { id: 'actions', key: 'actions', label: 'Actions', type: 'actions' },
]
```

### Row Actions

```tsx
rowActions: [
  {
    id: 'edit',
    label: 'Edit',
    icon: 'edit',
    variant: 'outline',
    onClick: 'handleEdit',
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: 'trash',
    variant: 'destructive',
    onClick: 'handleDelete',
    confirm: {
      title: 'Delete Item',
      description: 'Are you sure?',
    },
  },
]
```

### Bulk Actions

```tsx
bulkActions: [
  {
    id: 'export',
    label: 'Export Selected',
    icon: 'download',
    onClick: 'handleBulkExport',
  },
  {
    id: 'delete',
    label: 'Delete Selected',
    icon: 'trash',
    variant: 'destructive',
    onClick: 'handleBulkDelete',
    confirm: {
      title: 'Delete Items',
      description: 'Delete all selected items?',
    },
  },
]
```

### Features

- **Sorting** - Multi-column, server/client side
- **Filtering** - Per-column filters
- **Search** - Global search across columns
- **Pagination** - Configurable page sizes
- **Selection** - Single or multi-select
- **Export** - CSV, Excel, PDF
- **Responsive** - Mobile card view
- **Empty States** - Customizable
- **Loading States** - Skeleton or spinner

### Data Sources

```tsx
// API
dataSource: {
  type: 'api',
  endpoint: '/api/courses',
  method: 'GET',
  params: { status: 'active' },
}

// Static
dataSource: {
  type: 'static',
  data: myArray,
}

// Function
dataSource: {
  type: 'function',
  fetchFunction: 'fetchCourses',
}
```

---

## Form System

See [FORM_SYSTEM_GUIDE.md](./FORM_SYSTEM_GUIDE.md) for complete documentation.

### Quick Example

```tsx
import { FormRenderer } from '@/components/forms';
import { loginFormConfig } from '@/lib/config';

export function LoginPage() {
  return (
    <FormRenderer
      config={loginFormConfig}
      onSubmit={handleLogin}
    />
  );
}
```

---

## Modal/Dialog System

### Confirm Dialog

```tsx
import { useModal } from '@/hooks/useModal';

const confirmConfig = {
  type: 'confirm',
  title: 'Delete Course',
  description: 'This action cannot be undone.',
  confirmText: 'Delete',
  variant: 'destructive',
  onConfirm: 'handleDelete',
};

// Usage
const { open } = useModal();
open(confirmConfig);
```

### Alert Dialog

```tsx
const alertConfig = {
  type: 'alert',
  title: 'Success!',
  description: 'Your changes have been saved.',
  icon: 'success',
  confirmText: 'OK',
};
```

### Custom Modal

```tsx
const modalConfig = {
  type: 'custom',
  size: 'lg',
  title: 'Create Course',
  content: {
    type: 'form',
    formConfig: createCourseFormConfig,
  },
  actions: [
    { label: 'Cancel', variant: 'outline' },
    { label: 'Create', variant: 'default', type: 'submit' },
  ],
};
```

### Toast Notifications

```tsx
import { useToast } from '@/hooks/useToast';

const { toast } = useToast();

toast({
  title: 'Course Published',
  description: 'Your course is now live!',
  variant: 'success',
  duration: 5000,
  action: {
    label: 'View',
    onClick: 'viewCourse',
  },
});
```

---

## Settings System

### Quick Start

```tsx
import { SettingsRenderer } from '@/components/settings';
import { userSettingsConfig } from '@/lib/config';

export function SettingsPage() {
  return (
    <SettingsRenderer config={userSettingsConfig} />
  );
}
```

### Creating Settings Configs

```tsx
const settingsConfig: SettingsConfig = {
  id: 'user-settings',
  title: 'Settings',
  layout: 'tabs',
  tabs: [
    {
      id: 'profile',
      label: 'Profile',
      icon: 'user',
      sections: [
        {
          id: 'basic-info',
          title: 'Basic Information',
          settings: [
            {
              id: 'name',
              key: 'profile.name',
              label: 'Full Name',
              type: 'text',
              validation: { required: true },
            },
            {
              id: 'email',
              key: 'profile.email',
              label: 'Email',
              type: 'email',
              validation: { required: true },
            },
          ],
        },
      ],
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'bell',
      sections: [
        {
          id: 'email-notifications',
          title: 'Email Notifications',
          settings: [
            {
              id: 'newsletter',
              key: 'notifications.newsletter',
              label: 'Newsletter',
              type: 'toggle',
              description: 'Receive weekly newsletter',
            },
            {
              id: 'announcements',
              key: 'notifications.announcements',
              label: 'Announcements',
              type: 'toggle',
            },
          ],
        },
      ],
    },
  ],
  storage: {
    type: 'api',
    endpoint: '/api/settings',
    autoSave: true,
    debounce: 500,
  },
  actions: {
    save: { enabled: true, position: 'bottom' },
    reset: { enabled: true },
  },
};
```

---

## Benefits

### 1. Reduced Code

- **Forms**: 95% less code
- **Tables**: 90% less code
- **Dashboards**: 85% less code
- **Navigation**: 80% less code

### 2. Consistency

- All components follow the same patterns
- Uniform styling and behavior
- Centralized updates affect all instances

### 3. Maintainability

- Single source of truth
- Easy to update and modify
- Less chance of bugs

### 4. Type Safety

- Full TypeScript support
- Auto-completion
- Compile-time checks

### 5. Server-Driven UI

- Fetch configs from API
- Dynamic UIs without deployment
- A/B testing
- Feature flags

### 6. Faster Development

- Build features in minutes, not hours
- Focus on business logic
- Rapid prototyping

---

## Best Practices

### 1. Naming Conventions

```tsx
// Config files
export const studentDashboardConfig = { ... };
export const coursesTableConfig = { ... };
export const loginFormConfig = { ... };

// Use descriptive IDs
id: 'student-dashboard'
id: 'courses-table'
id: 'login-form'
```

### 2. Organize by Feature

```
/lib/config/
├── dashboards/
│   ├── student.ts
│   └── instructor.ts
├── tables/
│   ├── courses.ts
│   └── students.ts
├── forms/
│   ├── auth.ts
│   └── course.ts
└── navigation/
    ├── student.ts
    └── instructor.ts
```

### 3. Reuse and Extend

```tsx
// Base config
const baseTableConfig = { ... };

// Extend for specific use
const coursesConfig = {
  ...baseTableConfig,
  columns: [/* custom columns */],
};
```

### 4. Keep Configs Pure

```tsx
// Good - Pure configuration
const config = {
  onClick: 'handleClick', // Reference function name
};

// Avoid - Inline functions
const config = {
  onClick: () => { /* ... */ }, // Don't do this
};
```

### 5. Validate Configs

```tsx
import { z } from 'zod';

const TableConfigSchema = z.object({
  id: z.string(),
  columns: z.array(z.object({ ... })),
  // ...
});

// Validate at runtime
const config = TableConfigSchema.parse(rawConfig);
```

---

## Migration Guide

### From Hardcoded Components to Config-Driven

#### Before: Hardcoded Table

```tsx
function CoursesTable() {
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState({ column: 'title', direction: 'asc' });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchCourses({ sorting, page, filters }).then(setData);
  }, [sorting, page, filters]);

  return (
    <div>
      {/* 200+ lines of table JSX */}
    </div>
  );
}
```

#### After: Config-Driven

```tsx
function CoursesTable() {
  return <DataTable config={coursesTableConfig} />;
}
```

---

## Advanced Usage

### Dynamic Configs from API

```tsx
function DynamicDashboard() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch('/api/dashboards/student')
      .then(res => res.json())
      .then(setConfig);
  }, []);

  if (!config) return <Loading />;

  return <DashboardRenderer config={config} />;
}
```

### A/B Testing with Configs

```tsx
function MyFeature() {
  const variant = useABTest('feature-x');
  const config = variant === 'A' ? configA : configB;

  return <FeatureRenderer config={config} />;
}
```

### Feature Flags

```tsx
const navigationConfig = {
  sections: [
    {
      items: [
        {
          id: 'new-feature',
          label: 'New Feature',
          href: '/new-feature',
          permissions: {
            featureFlags: ['new-feature-enabled'],
          },
        },
      ],
    },
  ],
};
```

---

## Troubleshooting

### Config Not Updating

- Check if config is memoized
- Verify data source endpoint
- Check cache settings

### Permissions Not Working

- Verify user roles match config
- Check permission middleware
- Ensure permissions are evaluated correctly

### Performance Issues

- Enable server-side sorting/filtering
- Implement pagination
- Use data caching
- Optimize render functions

---

## API Reference

See TypeScript definitions in:
- `/lib/config/types/navigation.ts`
- `/lib/config/types/dashboard.ts`
- `/lib/config/types/table.ts`
- `/lib/config/types/modal.ts`
- `/lib/config/types/settings.ts`

---

## Contributing

To add new config systems:

1. Create type definitions in `/lib/config/types/`
2. Create example configs in `/lib/config/<feature>/`
3. Export from `/lib/config/index.ts`
4. Update documentation
5. Add tests

---

## Examples

See `/docs/examples/` for:
- Complete dashboard examples
- Complex table configurations
- Multi-step form wizards
- Nested navigation structures
- Settings page layouts

---

## Support

- Documentation: This file
- Examples: `/docs/examples/`
- Type Definitions: `/lib/config/types/`
- GitHub Issues: Report bugs and request features
