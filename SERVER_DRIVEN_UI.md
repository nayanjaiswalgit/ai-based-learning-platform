# 🎨 Server-Driven UI Architecture

## Overview

This platform uses a **hybrid server-driven UI** approach, combining the flexibility of server-controlled layouts with the performance of client-side rendering.

---

## 🎯 Why Server-Driven UI?

### Benefits
1. **Dynamic Updates**: Change UI without deploying new code
2. **Personalization**: Different users see different layouts based on their data
3. **A/B Testing**: Easy to test different UI variations
4. **Rapid Iteration**: Product team can modify UI without engineering
5. **Consistency**: Single source of truth for UI structure
6. **Adaptive Learning**: UI adapts based on user progress and behavior

### Use Cases in Our Platform
- **Dashboard widgets**: Different layouts for beginners vs advanced users
- **Roadmap visualization**: Dynamic based on user goals
- **Course content**: Adaptive based on learning style
- **Challenge difficulty**: Progressive disclosure of features
- **Onboarding flow**: Personalized based on skill assessment

---

## 🏗️ Architecture Pattern

### Hybrid Approach

```typescript
// Static UI: Performance-critical, rarely changes
- Navigation bar
- Footer
- Basic layouts
- Core components

// Server-Driven UI: Dynamic, personalized
- Dashboard widgets
- Course recommendations
- Roadmap structure
- Challenge layouts
- Feature flags
```

### Data Flow

```
┌──────────────┐
│   Client     │
│  (Next.js)   │
└──────┬───────┘
       │
       │ 1. Request page config
       │
┌──────▼───────┐
│  API Server  │
│              │
│  ┌────────┐  │
│  │ Config │  │ 2. Build UI config based on:
│  │Builder │  │    - User profile
│  └────┬───┘  │    - Current progress
└───────┼──────┘    - Feature flags
        │           - A/B test variant
        │
        │ 3. Return JSON config
        │
┌───────▼──────┐
│   Client     │
│ ┌──────────┐ │
│ │Component │ │ 4. Render components
│ │ Registry │ │    based on config
│ └──────────┘ │
└──────────────┘
```

---

## 📋 UI Configuration Schema

### Component Configuration Format

```typescript
// Example: Dashboard configuration
interface UIConfig {
  version: string
  layout: LayoutConfig
  components: ComponentConfig[]
  theme?: ThemeConfig
  features?: FeatureFlags
}

interface ComponentConfig {
  id: string
  type: string  // Component type from registry
  props: Record<string, any>
  children?: ComponentConfig[]
  conditions?: RenderCondition[]
  analytics?: AnalyticsConfig
}

interface RenderCondition {
  type: 'skill_level' | 'feature_flag' | 'subscription' | 'progress'
  operator: 'eq' | 'gt' | 'lt' | 'in'
  value: any
}

// Example configuration
const dashboardConfig: UIConfig = {
  version: "1.0",
  layout: {
    type: "grid",
    columns: 12,
    gap: 4
  },
  components: [
    {
      id: "welcome-banner",
      type: "Banner",
      props: {
        title: "Welcome back, {{user.firstName}}!",
        variant: "gradient",
        dismissible: true
      }
    },
    {
      id: "daily-challenge",
      type: "DailyChallenge",
      props: {
        gridColumn: "span 8",
        challengeId: "{{daily.challenge.id}}"
      },
      conditions: [
        {
          type: "subscription",
          operator: "in",
          value: ["pro", "enterprise"]
        }
      ]
    },
    {
      id: "progress-chart",
      type: "ProgressChart",
      props: {
        gridColumn: "span 4",
        timeRange: "week"
      }
    },
    {
      id: "roadmap-widget",
      type: "RoadmapWidget",
      props: {
        gridColumn: "span 12",
        roadmapId: "{{user.activeRoadmap.id}}",
        maxMilestones: 5
      },
      conditions: [
        {
          type: "progress",
          operator: "gt",
          value: 0
        }
      ]
    }
  ]
}
```

---

## 🔧 Implementation with Best Libraries

### 1. Component Registry Pattern

```typescript
// packages/ui-components/src/registry.tsx

import { lazy } from 'react'

// Use React.lazy for code splitting
export const ComponentRegistry = {
  // Layout components
  Grid: lazy(() => import('./components/layouts/Grid')),
  Stack: lazy(() => import('./components/layouts/Stack')),
  Flex: lazy(() => import('./components/layouts/Flex')),

  // Dashboard widgets
  Banner: lazy(() => import('./components/widgets/Banner')),
  DailyChallenge: lazy(() => import('./components/widgets/DailyChallenge')),
  ProgressChart: lazy(() => import('./components/widgets/ProgressChart')),
  RoadmapWidget: lazy(() => import('./components/widgets/RoadmapWidget')),
  StreakCounter: lazy(() => import('./components/widgets/StreakCounter')),
  RecommendedCourses: lazy(() => import('./components/widgets/RecommendedCourses')),

  // Course components
  VideoPlayer: lazy(() => import('./components/course/VideoPlayer')),
  LessonContent: lazy(() => import('./components/course/LessonContent')),
  QuizCard: lazy(() => import('./components/course/QuizCard')),

  // Assessment components
  CodeEditor: lazy(() => import('./components/assessment/CodeEditor')),
  MCQQuestion: lazy(() => import('./components/assessment/MCQQuestion')),
  Terminal: lazy(() => import('./components/assessment/Terminal')),

  // Community
  DiscussionThread: lazy(() => import('./components/community/DiscussionThread')),
  CommentSection: lazy(() => import('./components/community/CommentSection'))
} as const

export type ComponentType = keyof typeof ComponentRegistry
```

### 2. Dynamic Component Renderer

```typescript
// apps/web/src/components/DynamicRenderer.tsx

import { Suspense } from 'react'
import { ComponentRegistry, type ComponentType } from '@/registry'
import { evaluateConditions } from '@/lib/conditions'
import { interpolateProps } from '@/lib/template'

interface DynamicRendererProps {
  config: ComponentConfig
  context: Record<string, any>
}

export function DynamicRenderer({ config, context }: DynamicRendererProps) {
  // Check render conditions
  if (config.conditions && !evaluateConditions(config.conditions, context)) {
    return null
  }

  // Get component from registry
  const Component = ComponentRegistry[config.type as ComponentType]

  if (!Component) {
    console.warn(`Component ${config.type} not found in registry`)
    return null
  }

  // Interpolate props with context data
  const interpolatedProps = interpolateProps(config.props, context)

  return (
    <Suspense fallback={<ComponentSkeleton />}>
      <Component {...interpolatedProps}>
        {config.children?.map((child) => (
          <DynamicRenderer key={child.id} config={child} context={context} />
        ))}
      </Component>
    </Suspense>
  )
}
```

### 3. Server-Side Config Builder

```typescript
// services/ui-config-service/src/builders/dashboard.builder.ts

import { Injectable } from '@nestjs/common'
import { UIConfig, ComponentConfig } from '@shared/types'

@Injectable()
export class DashboardConfigBuilder {
  async buildConfig(userId: string): Promise<UIConfig> {
    // Fetch user data
    const user = await this.userService.findById(userId)
    const progress = await this.progressService.getUserProgress(userId)
    const subscription = await this.subscriptionService.getSubscription(userId)

    const components: ComponentConfig[] = []

    // Welcome banner (always show)
    components.push({
      id: 'welcome-banner',
      type: 'Banner',
      props: {
        title: `Welcome back, ${user.firstName}!`,
        subtitle: this.getMotivationalMessage(progress)
      }
    })

    // Streak counter (show if user has activity)
    if (progress.currentStreak > 0) {
      components.push({
        id: 'streak-counter',
        type: 'StreakCounter',
        props: {
          currentStreak: progress.currentStreak,
          longestStreak: progress.longestStreak
        }
      })
    }

    // Daily challenge (pro users only)
    if (subscription.plan !== 'free') {
      const dailyChallenge = await this.challengeService.getDailyChallenge(userId)
      components.push({
        id: 'daily-challenge',
        type: 'DailyChallenge',
        props: {
          challenge: dailyChallenge,
          difficulty: user.experienceLevel
        }
      })
    }

    // Roadmap widget (if user has active roadmap)
    if (user.activeRoadmapId) {
      const roadmap = await this.roadmapService.getRoadmap(user.activeRoadmapId)
      components.push({
        id: 'roadmap-widget',
        type: 'RoadmapWidget',
        props: {
          roadmap: roadmap,
          currentPhase: roadmap.currentPhase,
          progress: this.calculateRoadmapProgress(roadmap)
        }
      })
    }

    // Recommended courses (AI-powered)
    const recommendations = await this.recommendationService.getRecommendations(userId)
    components.push({
      id: 'recommended-courses',
      type: 'RecommendedCourses',
      props: {
        courses: recommendations,
        limit: 3
      }
    })

    // Progress chart
    components.push({
      id: 'progress-chart',
      type: 'ProgressChart',
      props: {
        data: await this.analyticsService.getWeeklyProgress(userId),
        timeRange: 'week'
      }
    })

    return {
      version: '1.0',
      layout: this.getLayoutForUser(user),
      components,
      features: this.getFeatureFlags(subscription)
    }
  }

  private getLayoutForUser(user: User): LayoutConfig {
    // Beginners get single column for simplicity
    if (user.experienceLevel === 'beginner') {
      return {
        type: 'stack',
        direction: 'vertical',
        gap: 6
      }
    }

    // Advanced users get multi-column dashboard
    return {
      type: 'grid',
      columns: 12,
      gap: 4,
      responsive: {
        sm: { columns: 1 },
        md: { columns: 6 },
        lg: { columns: 12 }
      }
    }
  }
}
```

---

## 📦 Recommended Libraries

### UI Rendering & Components

```typescript
// 1. Component Library: shadcn/ui (Radix UI + Tailwind)
// ✅ Accessible, customizable, no runtime overhead
import { Button, Card, Dialog, DropdownMenu } from '@/components/ui'

// 2. Layout: CSS Grid + Flexbox with Tailwind
// ✅ Server-driven class names
<div className={cn("grid", `grid-cols-${config.columns}`, `gap-${config.gap}`)}>

// 3. Icons: Lucide React
// ✅ Tree-shakeable, consistent design
import { Home, BookOpen, Code, Trophy } from 'lucide-react'

// 4. Animations: Framer Motion
// ✅ Declarative animations, server-driven variants
import { motion } from 'framer-motion'

const variants = config.animation || {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

<motion.div variants={variants} initial="hidden" animate="visible">
```

### Form Handling

```typescript
// 1. React Hook Form + Zod
// ✅ Server-driven validation schemas
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Server returns validation schema
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

const form = useForm({
  resolver: zodResolver(schema)
})

// 2. Server-side validation with class-validator (NestJS)
import { IsEmail, MinLength } from 'class-validator'

export class CreateUserDto {
  @IsEmail()
  email: string

  @MinLength(8)
  password: string
}
```

### State Management

```typescript
// 1. Zustand for client state
// ✅ Simple, no boilerplate
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  config: UIConfig | null
  setConfig: (config: UIConfig) => void
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      config: null,
      setConfig: (config) => set({ config }),
      theme: 'light',
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      }))
    }),
    { name: 'ui-storage' }
  )
)

// 2. TanStack Query for server state
// ✅ Caching, optimistic updates, auto-refetch
import { useQuery, useMutation } from '@tanstack/react-query'

function useDashboardConfig() {
  return useQuery({
    queryKey: ['dashboard-config'],
    queryFn: async () => {
      const res = await fetch('/api/ui/dashboard')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  })
}
```

### Real-time Updates

```typescript
// Socket.io for real-time UI updates
import { io } from 'socket.io-client'

const socket = io(process.env.NEXT_PUBLIC_WS_URL)

socket.on('ui:config:updated', (newConfig) => {
  // Update UI config without page reload
  queryClient.setQueryData(['dashboard-config'], newConfig)
})

// Use case: Push new daily challenge at midnight
socket.on('daily:challenge:new', (challenge) => {
  toast('New daily challenge available!', {
    action: {
      label: 'View',
      onClick: () => router.push('/challenges/daily')
    }
  })
})
```

### Code Editor

```typescript
// Monaco Editor (VS Code's editor)
// ✅ Full IDE features, syntax highlighting, IntelliSense
import Editor from '@monaco-editor/react'

<Editor
  height="400px"
  language={config.language} // Server-driven language
  theme={config.theme || 'vs-dark'}
  value={code}
  onChange={(value) => setCode(value)}
  options={{
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    ...config.editorOptions // Server-driven options
  }}
/>
```

### Terminal

```typescript
// Xterm.js for terminal emulation
// ✅ Full terminal features, VT100 compatible
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'

const terminal = new Terminal({
  theme: config.terminalTheme,
  fontSize: config.fontSize || 14,
  fontFamily: 'JetBrains Mono, monospace',
  cursorBlink: true
})

terminal.loadAddon(new FitAddon())
terminal.loadAddon(new WebLinksAddon())
```

### Data Visualization

```typescript
// Recharts for charts
// ✅ Declarative, responsive, server-driven configs
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

<LineChart data={config.data} width={config.width} height={config.height}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey={config.xAxis.key} />
  <YAxis />
  <Tooltip />
  {config.lines.map((line) => (
    <Line
      key={line.key}
      type={line.type}
      dataKey={line.key}
      stroke={line.color}
      strokeWidth={line.width}
    />
  ))}
</LineChart>
```

### Video Player

```typescript
// Video.js or Mux Player
// ✅ Adaptive streaming, analytics built-in

// Option 1: Mux Player (recommended)
import MuxPlayer from '@mux/mux-player-react'

<MuxPlayer
  playbackId={config.videoId}
  metadata={{
    video_id: config.lessonId,
    video_title: config.title,
    viewer_user_id: user.id
  }}
  streamType="on-demand"
  onTimeUpdate={(e) => saveProgress(e.detail.currentTime)}
/>

// Option 2: Plyr
import Plyr from 'plyr-react'

<Plyr
  source={config.videoSource}
  options={config.playerOptions}
/>
```

---

## 🔄 Feature Flags & A/B Testing

### Feature Flag Management

```typescript
// Use Vercel Edge Config or custom solution
import { get } from '@vercel/edge-config'

// Server-side
export async function getFeatureFlags(userId: string) {
  const flags = await get('feature-flags')

  return {
    newDashboard: flags.newDashboard.enabled,
    aiRecommendations: flags.aiRecommendations.enabled,
    peerReview: isUserInExperiment(userId, 'peer-review'),
    ...flags
  }
}

// Client-side with PostHog
import { useFeatureFlagEnabled } from 'posthog-js/react'

function DashboardWidget() {
  const showNewWidget = useFeatureFlagEnabled('new-dashboard-widget')

  if (showNewWidget) {
    return <NewDashboardWidget />
  }

  return <OldDashboardWidget />
}
```

### A/B Testing

```typescript
// PostHog for experiments
import { usePostHog } from 'posthog-js/react'

function CourseCard({ course }) {
  const posthog = usePostHog()
  const variant = posthog?.getFeatureFlag('course-card-layout')

  // variant could be 'control' or 'variant-a'
  return variant === 'variant-a'
    ? <CourseCardNewLayout course={course} />
    : <CourseCardOldLayout course={course} />
}
```

---

## 🎨 Theme Configuration

### Server-Driven Theming

```typescript
// Server returns theme config
interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    // ... more colors
  }
  fonts: {
    heading: string
    body: string
    mono: string
  }
  spacing: {
    unit: number
    scale: number[]
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
  }
}

// Apply theme dynamically
import { createGlobalStyle } from 'styled-components'

const GlobalStyles = createGlobalStyle<{ theme: ThemeConfig }>`
  :root {
    --color-primary: ${(props) => props.theme.colors.primary};
    --color-secondary: ${(props) => props.theme.colors.secondary};
    --font-heading: ${(props) => props.theme.fonts.heading};
    --font-body: ${(props) => props.theme.fonts.body};
  }
`

// Or with Tailwind CSS variables
document.documentElement.style.setProperty('--color-primary', theme.colors.primary)
```

---

## 📱 Responsive Configuration

```typescript
// Server defines breakpoints and responsive behavior
interface ResponsiveConfig {
  breakpoints: {
    sm: number   // 640px
    md: number   // 768px
    lg: number   // 1024px
    xl: number   // 1280px
  }
  layout: {
    sm: LayoutConfig
    md: LayoutConfig
    lg: LayoutConfig
  }
}

// Client renders based on viewport
import { useMediaQuery } from '@/hooks/useMediaQuery'

function ResponsiveLayout({ config }: { config: ResponsiveConfig }) {
  const isLarge = useMediaQuery(`(min-width: ${config.breakpoints.lg}px)`)
  const isMedium = useMediaQuery(`(min-width: ${config.breakpoints.md}px)`)

  const layout = isLarge
    ? config.layout.lg
    : isMedium
    ? config.layout.md
    : config.layout.sm

  return <DynamicLayout config={layout} />
}
```

---

## ✅ Best Practices

### 1. **Cache UI Configs**
```typescript
// Cache configs in Redis with user-specific keys
const cacheKey = `ui:dashboard:${userId}:${userHash}`
const cachedConfig = await redis.get(cacheKey)

if (cachedConfig) {
  return JSON.parse(cachedConfig)
}

const config = await buildConfig(userId)
await redis.setex(cacheKey, 300, JSON.stringify(config)) // 5 min cache
```

### 2. **Version UI Configs**
```typescript
// Include version to handle breaking changes
interface UIConfig {
  version: string  // "2.1.0"
  schemaVersion: number  // 2
  // ...
}

// Client checks version compatibility
if (config.schemaVersion > SUPPORTED_SCHEMA_VERSION) {
  // Fetch app update or show message
  showUpdateRequiredMessage()
}
```

### 3. **Graceful Degradation**
```typescript
// Fallback to default UI if config fails
function Dashboard() {
  const { data: config, error } = useDashboardConfig()

  if (error) {
    console.error('Failed to load UI config:', error)
    return <DefaultDashboard />
  }

  if (!config) {
    return <DashboardSkeleton />
  }

  return <DynamicRenderer config={config} />
}
```

### 4. **Analytics Integration**
```typescript
// Track component renders and interactions
interface ComponentConfig {
  // ...
  analytics?: {
    trackView: boolean
    trackClicks: boolean
    customEvents: string[]
  }
}

function DynamicComponent({ config }) {
  useEffect(() => {
    if (config.analytics?.trackView) {
      analytics.track('Component Viewed', {
        componentId: config.id,
        componentType: config.type
      })
    }
  }, [])

  const handleClick = () => {
    if (config.analytics?.trackClicks) {
      analytics.track('Component Clicked', {
        componentId: config.id
      })
    }
  }
}
```

### 5. **Prefetch Configs**
```typescript
// Prefetch UI configs for better UX
import { prefetchQuery } from '@tanstack/react-query'

// On login, prefetch dashboard config
await prefetchQuery({
  queryKey: ['dashboard-config'],
  queryFn: fetchDashboardConfig
})

// Prefetch course config when hovering
<Link
  href={`/courses/${courseId}`}
  onMouseEnter={() => {
    prefetchQuery({
      queryKey: ['course-config', courseId],
      queryFn: () => fetchCourseConfig(courseId)
    })
  }}
>
```

---

## 🚀 Implementation Priority

### Phase 1: Basic Server-Driven UI
1. Set up component registry
2. Implement dynamic renderer
3. Create dashboard config endpoint
4. Build 5-10 core components
5. Test with simple layouts

### Phase 2: Advanced Features
1. Add conditional rendering
2. Implement feature flags
3. Add A/B testing
4. Build config builder service
5. Add real-time updates

### Phase 3: Optimization
1. Add config caching
2. Implement prefetching
3. Optimize component loading
4. Add analytics tracking
5. Performance monitoring

---

## 📊 Example: Complete Dashboard Flow

```typescript
// 1. API Endpoint (NestJS)
@Get('ui/dashboard')
async getDashboardConfig(@CurrentUser() user: User) {
  const config = await this.dashboardBuilder.buildConfig(user.id)
  return config
}

// 2. Client Query (React)
function Dashboard() {
  const { data: config, isLoading } = useQuery({
    queryKey: ['dashboard-config'],
    queryFn: async () => {
      const res = await fetch('/api/ui/dashboard')
      return res.json()
    }
  })

  if (isLoading) return <DashboardSkeleton />

  return <DynamicRenderer config={config} context={{ user }} />
}

// 3. Dynamic Renderer
function DynamicRenderer({ config, context }) {
  return (
    <div className={config.layout.className}>
      {config.components.map((component) => (
        <DynamicComponent
          key={component.id}
          config={component}
          context={context}
        />
      ))}
    </div>
  )
}

// 4. Component Renders
function DynamicComponent({ config, context }) {
  const Component = ComponentRegistry[config.type]
  const props = interpolateProps(config.props, context)

  return (
    <Suspense fallback={<Skeleton />}>
      <Component {...props} />
    </Suspense>
  )
}
```

---

**With this architecture, your UI becomes truly adaptive, personalized, and maintainable!** 🎨
