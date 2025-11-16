# 🏆 Best Practices Guide

This document outlines best practices for building a world-class learning platform. Follow these guidelines to ensure code quality, security, performance, and maintainability.

---

## 📁 Project Structure & Organization

### Monorepo Structure (Turborepo + PNPM)

```bash
# Use workspaces for better dependency management
pnpm-workspace.yaml:
  packages:
    - 'apps/*'
    - 'services/*'
    - 'packages/*'

# Benefits:
✅ Shared dependencies
✅ Atomic commits across packages
✅ Better caching with Turborepo
✅ Type safety across packages
```

### Folder Naming Conventions

```
✅ Use kebab-case for folders: code-execution-service
✅ Use PascalCase for React components: UserProfile.tsx
✅ Use camelCase for utilities: formatDate.ts
✅ Group by feature, not by type

Good:
src/
  features/
    auth/
      components/
      hooks/
      api/
      types.ts
    courses/
      components/
      hooks/
      api/

Bad:
src/
  components/  # All components mixed together
  hooks/       # All hooks mixed together
```

---

## 💻 Code Quality

### TypeScript Best Practices

```typescript
// ✅ DO: Use strict mode
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}

// ✅ DO: Define explicit types
interface User {
  id: string
  email: string
  role: 'student' | 'instructor' | 'admin'
}

function getUser(id: string): Promise<User> {
  return fetch(`/api/users/${id}`).then(res => res.json())
}

// ❌ DON'T: Use 'any'
function badFunction(data: any) { // ❌
  return data.something
}

// ✅ DO: Use generics
function getData<T>(url: string): Promise<T> {
  return fetch(url).then(res => res.json())
}

// ✅ DO: Use utility types
type PartialUser = Partial<User>
type RequiredUser = Required<User>
type UserWithoutId = Omit<User, 'id'>
type UserEmailAndRole = Pick<User, 'email' | 'role'>

// ✅ DO: Use const assertions for better inference
const CONFIG = {
  API_URL: 'https://api.example.com',
  TIMEOUT: 5000
} as const

// ✅ DO: Use discriminated unions for state
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }
```

### React Best Practices

```typescript
// ✅ DO: Use Server Components by default (Next.js 14)
// app/courses/page.tsx
export default async function CoursesPage() {
  const courses = await getCourses() // Fetch on server
  return <CourseList courses={courses} />
}

// ✅ DO: Use 'use client' only when needed
'use client'
import { useState } from 'react'

export function InteractiveComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}

// ✅ DO: Memoize expensive computations
import { useMemo } from 'react'

function CourseStats({ submissions }) {
  const stats = useMemo(() => {
    return calculateComplexStats(submissions)
  }, [submissions])

  return <StatsDisplay stats={stats} />
}

// ✅ DO: Use React.memo for expensive components
import { memo } from 'react'

export const CodeEditor = memo(function CodeEditor({ code, onChange }) {
  // Expensive Monaco editor component
  return <Editor value={code} onChange={onChange} />
})

// ✅ DO: Custom hooks for logic reuse
function useCourseProgress(courseId: string) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const unsubscribe = subscribeToProgress(courseId, setProgress)
    return unsubscribe
  }, [courseId])

  return progress
}

// ✅ DO: Proper error boundaries
'use client'
import { Component, type ReactNode } from 'react'

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo)
    // Send to error tracking service
    Sentry.captureException(error)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
```

### NestJS Best Practices

```typescript
// ✅ DO: Use DTOs with validation
import { IsEmail, IsString, MinLength } from 'class-validator'

export class CreateUserDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string

  @IsString()
  firstName: string
}

// ✅ DO: Use dependency injection
@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly logger: LoggerService
  ) {}

  async findAll() {
    return this.prisma.course.findMany()
  }
}

// ✅ DO: Use guards for auth
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('instructor', 'admin')
@Post('courses')
async createCourse(@Body() dto: CreateCourseDto, @CurrentUser() user: User) {
  return this.coursesService.create(dto, user.id)
}

// ✅ DO: Use interceptors for logging
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const now = Date.now()
    const request = context.switchToHttp().getRequest()

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now
        console.log(`${request.method} ${request.url} - ${responseTime}ms`)
      })
    )
  }
}

// ✅ DO: Use pipes for transformation
@Injectable()
export class ParseUuidPipe implements PipeTransform {
  transform(value: string): string {
    if (!isUUID(value)) {
      throw new BadRequestException('Invalid UUID')
    }
    return value
  }
}

@Get(':id')
async findOne(@Param('id', ParseUuidPipe) id: string) {
  return this.coursesService.findOne(id)
}
```

---

## 🗄️ Database Best Practices

### Prisma Schema Design

```prisma
// ✅ DO: Use meaningful names
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // ✅ DO: Define explicit relations
  courses   CourseEnrollment[]
  submissions Submission[]

  @@index([email])
  @@map("users")
}

// ✅ DO: Use enums for fixed values
enum UserRole {
  STUDENT
  INSTRUCTOR
  ADMIN
}

// ✅ DO: Add indexes for frequently queried fields
model Submission {
  id         String   @id @default(uuid())
  userId     String
  questionId String
  status     String
  createdAt  DateTime @default(now())

  @@index([userId, questionId])
  @@index([status])
  @@index([createdAt])
}

// ✅ DO: Use cascade deletes appropriately
model Course {
  id      String @id @default(uuid())
  modules Module[]
}

model Module {
  id       String  @id @default(uuid())
  courseId String
  course   Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)
}
```

### Query Optimization

```typescript
// ✅ DO: Use select to fetch only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    // Don't fetch password_hash
  }
})

// ✅ DO: Use proper pagination
async function getPaginatedCourses(page: number, limit: number) {
  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.course.count()
  ])

  return {
    courses,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  }
}

// ✅ DO: Use transactions for related operations
async function enrollUserInCourse(userId: string, courseId: string) {
  return await prisma.$transaction(async (tx) => {
    // Create enrollment
    const enrollment = await tx.courseEnrollment.create({
      data: { userId, courseId }
    })

    // Update enrollment count
    await tx.course.update({
      where: { id: courseId },
      data: { enrollmentCount: { increment: 1 } }
    })

    return enrollment
  })
}

// ✅ DO: Use findUnique instead of findFirst when possible
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
})

// ❌ DON'T: N+1 queries
const courses = await prisma.course.findMany()
for (const course of courses) {
  const instructor = await prisma.user.findUnique({
    where: { id: course.instructorId }
  })
}

// ✅ DO: Use include/nested queries
const courses = await prisma.course.findMany({
  include: {
    instructor: {
      select: { id: true, firstName: true, lastName: true }
    }
  }
})
```

### Caching Strategy

```typescript
// ✅ DO: Cache frequently accessed data
import { Injectable } from '@nestjs/common'
import { Redis } from 'ioredis'

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: Redis
  ) {}

  async findById(id: string) {
    // Check cache first
    const cached = await this.redis.get(`course:${id}`)
    if (cached) {
      return JSON.parse(cached)
    }

    // Cache miss - fetch from DB
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { instructor: true, modules: true }
    })

    // Store in cache (1 hour)
    await this.redis.setex(`course:${id}`, 3600, JSON.stringify(course))

    return course
  }

  async update(id: string, data: UpdateCourseDto) {
    const course = await this.prisma.course.update({
      where: { id },
      data
    })

    // Invalidate cache
    await this.redis.del(`course:${id}`)

    return course
  }
}

// ✅ DO: Use cache-aside pattern with helpers
class CacheService {
  async wrap<T>(
    key: string,
    ttl: number,
    fn: () => Promise<T>
  ): Promise<T> {
    const cached = await this.redis.get(key)
    if (cached) return JSON.parse(cached)

    const result = await fn()
    await this.redis.setex(key, ttl, JSON.stringify(result))
    return result
  }
}

// Usage
const course = await cacheService.wrap(
  `course:${id}`,
  3600,
  () => prisma.course.findUnique({ where: { id } })
)
```

---

## 🔐 Security Best Practices

### Authentication & Authorization

```typescript
// ✅ DO: Hash passwords properly
import * as bcrypt from 'bcrypt'

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ✅ DO: Use JWT with short expiry
import { JwtService } from '@nestjs/jwt'

async function generateTokens(userId: string) {
  const accessToken = this.jwtService.sign(
    { sub: userId },
    { expiresIn: '15m' } // Short-lived
  )

  const refreshToken = this.jwtService.sign(
    { sub: userId, type: 'refresh' },
    { expiresIn: '7d' } // Long-lived
  )

  return { accessToken, refreshToken }
}

// ✅ DO: Implement rate limiting
import { ThrottlerGuard } from '@nestjs/throttler'

@UseGuards(ThrottlerGuard)
@Post('login')
async login(@Body() dto: LoginDto) {
  return this.authService.login(dto)
}

// ✅ DO: Validate user input
import { IsEmail, IsStrongPassword, Length } from 'class-validator'

export class RegisterDto {
  @IsEmail()
  email: string

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })
  password: string

  @Length(2, 50)
  firstName: string
}

// ✅ DO: Sanitize HTML input
import DOMPurify from 'isomorphic-dompurify'

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre'],
    ALLOWED_ATTR: []
  })
}

// ✅ DO: Use CSRF protection
import { csrf } from '@hono/csrf'

app.use(csrf())

// ✅ DO: Set security headers
import helmet from 'helmet'

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.openai.com']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))
```

### Code Execution Security

```typescript
// ✅ DO: Use strict Docker security
const dockerConfig = {
  Image: 'python:3.11-slim',
  Cmd: ['python', '-c', code],
  HostConfig: {
    Memory: 256 * 1024 * 1024, // 256MB limit
    MemorySwap: 256 * 1024 * 1024, // No swap
    CpuQuota: 50000, // 0.5 CPU
    NetworkMode: 'none', // No network access
    ReadonlyRootfs: true, // Read-only filesystem
    SecurityOpt: ['no-new-privileges'],
    CapDrop: ['ALL'], // Drop all capabilities
    Tmpfs: {
      '/tmp': 'rw,noexec,nosuid,size=65536k' // 64MB temp
    }
  },
  WorkingDir: '/app',
  User: 'nobody' // Run as non-root user
}

// ✅ DO: Validate code before execution
function validateCode(code: string, language: string): void {
  // Check code length
  if (code.length > 10000) {
    throw new Error('Code too long')
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    /require\s*\(\s*['"]child_process['"]\s*\)/,
    /exec\s*\(/,
    /eval\s*\(/,
    /Function\s*\(/,
    /__import__\s*\(\s*['"]os['"]\s*\)/
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      throw new Error('Code contains dangerous patterns')
    }
  }
}

// ✅ DO: Set execution timeout
import { setTimeout } from 'timers/promises'

async function executeWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  const timeoutPromise = setTimeout(timeoutMs).then(() => {
    throw new Error('Execution timeout')
  })

  return Promise.race([fn(), timeoutPromise])
}
```

---

## ⚡ Performance Best Practices

### Frontend Performance

```typescript
// ✅ DO: Use Next.js Image component
import Image from 'next/image'

<Image
  src={course.thumbnail}
  alt={course.title}
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL={course.blurHash}
  loading="lazy"
/>

// ✅ DO: Code splitting with dynamic imports
import dynamic from 'next/dynamic'

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), {
  loading: () => <EditorSkeleton />,
  ssr: false // Don't render on server
})

// ✅ DO: Prefetch data on hover
import { prefetchQuery } from '@tanstack/react-query'

<Link
  href={`/courses/${course.id}`}
  onMouseEnter={() => {
    prefetchQuery({
      queryKey: ['course', course.id],
      queryFn: () => fetchCourse(course.id)
    })
  }}
>

// ✅ DO: Use virtual scrolling for long lists
import { useVirtualizer } from '@tanstack/react-virtual'

function ProblemList({ problems }) {
  const parentRef = useRef(null)

  const virtualizer = useVirtualizer({
    count: problems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80
  })

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((item) => (
          <div
            key={item.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${item.size}px`,
              transform: `translateY(${item.start}px)`
            }}
          >
            <ProblemCard problem={problems[item.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ✅ DO: Debounce expensive operations
import { useDebouncedCallback } from 'use-debounce'

function SearchBar() {
  const [search, setSearch] = useState('')

  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      // Expensive search operation
      performSearch(value)
    },
    500 // Wait 500ms after user stops typing
  )

  return (
    <input
      value={search}
      onChange={(e) => {
        setSearch(e.target.value)
        debouncedSearch(e.target.value)
      }}
    />
  )
}

// ✅ DO: Use React Server Components for data fetching
// app/courses/[id]/page.tsx
export default async function CoursePage({ params }) {
  // Fetch on server - no client-side loading state needed
  const course = await getCourse(params.id)

  return <CourseContent course={course} />
}
```

### Backend Performance

```typescript
// ✅ DO: Use connection pooling
// Database connection pool
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Connection pool settings
  connection: {
    pool: {
      min: 2,
      max: 10
    }
  }
})

// ✅ DO: Use batch operations
// ❌ Bad: Multiple individual queries
for (const userId of userIds) {
  await prisma.user.update({
    where: { id: userId },
    data: { lastActive: new Date() }
  })
}

// ✅ Good: Single batch operation
await prisma.user.updateMany({
  where: { id: { in: userIds } },
  data: { lastActive: new Date() }
})

// ✅ DO: Use DataLoader for batching
import DataLoader from 'dataloader'

const userLoader = new DataLoader(async (ids: string[]) => {
  const users = await prisma.user.findMany({
    where: { id: { in: ids } }
  })

  return ids.map((id) => users.find((u) => u.id === id))
})

// ✅ DO: Implement cursor-based pagination for large datasets
async function getPaginatedSubmissions(cursor?: string, limit = 20) {
  const submissions = await prisma.submission.findMany({
    take: limit + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1
    }),
    orderBy: { createdAt: 'desc' }
  })

  const hasMore = submissions.length > limit
  const items = hasMore ? submissions.slice(0, -1) : submissions

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null
  }
}

// ✅ DO: Use Redis for session storage
@Injectable()
export class SessionService {
  constructor(private readonly redis: Redis) {}

  async set(sessionId: string, data: any, ttl = 3600) {
    await this.redis.setex(
      `session:${sessionId}`,
      ttl,
      JSON.stringify(data)
    )
  }

  async get(sessionId: string) {
    const data = await this.redis.get(`session:${sessionId}`)
    return data ? JSON.parse(data) : null
  }
}
```

---

## 🧪 Testing Best Practices

### Unit Tests

```typescript
// ✅ DO: Write descriptive test names
import { describe, it, expect, beforeEach } from 'vitest'

describe('CoursesService', () => {
  describe('createCourse', () => {
    it('should create a course with valid data', async () => {
      const dto = { title: 'Test Course', description: 'Test' }
      const course = await service.createCourse(dto, 'user-id')

      expect(course).toMatchObject(dto)
      expect(course.id).toBeDefined()
    })

    it('should throw error if title is empty', async () => {
      const dto = { title: '', description: 'Test' }

      await expect(
        service.createCourse(dto, 'user-id')
      ).rejects.toThrow('Title is required')
    })
  })
})

// ✅ DO: Use test fixtures
const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'user-123',
  email: 'test@example.com',
  role: 'student',
  ...overrides
})

// ✅ DO: Mock external dependencies
import { vi } from 'vitest'

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn()
  }
}

// ✅ DO: Test edge cases
describe('validateCode', () => {
  it('should accept valid Python code', () => {
    expect(() => validateCode('print("hello")', 'python')).not.toThrow()
  })

  it('should reject code with eval', () => {
    expect(() => validateCode('eval("malicious")', 'python')).toThrow()
  })

  it('should reject code exceeding length limit', () => {
    const longCode = 'a'.repeat(10001)
    expect(() => validateCode(longCode, 'python')).toThrow('Code too long')
  })
})
```

### Integration Tests

```typescript
// ✅ DO: Test API endpoints
import { Test } from '@nestjs/testing'
import * as request from 'supertest'

describe('CoursesController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  it('/courses (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/courses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'New Course',
        description: 'Test course'
      })
      .expect(201)

    expect(response.body).toMatchObject({
      title: 'New Course',
      description: 'Test course'
    })
  })

  afterAll(async () => {
    await app.close()
  })
})
```

### E2E Tests

```typescript
// ✅ DO: Test critical user flows with Playwright
import { test, expect } from '@playwright/test'

test('user can enroll in a course', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('[name="email"]', 'student@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  // Navigate to course
  await page.goto('/courses/intro-to-python')

  // Enroll
  await page.click('button:has-text("Enroll Now")')

  // Verify enrollment
  await expect(page.locator('text=You are enrolled')).toBeVisible()

  // Check dashboard
  await page.goto('/dashboard')
  await expect(
    page.locator('text=Introduction to Python')
  ).toBeVisible()
})

// ✅ DO: Test responsive design
test('dashboard is mobile responsive', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/dashboard')

  // Mobile menu should be visible
  await expect(page.locator('[aria-label="Menu"]')).toBeVisible()

  // Desktop navigation should be hidden
  await expect(page.locator('nav.desktop')).toBeHidden()
})
```

---

## 📊 Monitoring & Logging

### Structured Logging

```typescript
// ✅ DO: Use structured logs
import { Logger } from '@nestjs/common'

const logger = new Logger('CoursesService')

logger.log({
  message: 'Course created',
  courseId: course.id,
  userId: user.id,
  timestamp: new Date().toISOString()
})

// ✅ DO: Log errors with context
try {
  await processPayment(paymentData)
} catch (error) {
  logger.error({
    message: 'Payment processing failed',
    error: error.message,
    stack: error.stack,
    userId: user.id,
    amount: paymentData.amount
  })
  throw error
}

// ✅ DO: Use log levels appropriately
logger.debug('Detailed debugging info')
logger.log('General info')
logger.warn('Warning - potential issue')
logger.error('Error occurred')
logger.fatal('Critical error - service down')
```

### Error Tracking

```typescript
// ✅ DO: Integrate Sentry
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers?.['authorization']
    }
    return event
  }
})

// ✅ DO: Add context to errors
Sentry.setUser({
  id: user.id,
  email: user.email
})

Sentry.setContext('course', {
  id: course.id,
  title: course.title
})
```

### Performance Monitoring

```typescript
// ✅ DO: Track performance metrics
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now()
    const request = context.switchToHttp().getRequest()

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start

        // Send to analytics
        analytics.track('API Call', {
          method: request.method,
          url: request.url,
          duration,
          status: 'success'
        })

        // Alert if slow
        if (duration > 1000) {
          logger.warn(`Slow endpoint: ${request.url} took ${duration}ms`)
        }
      })
    )
  }
}
```

---

## 🚀 Deployment Best Practices

### Environment Variables

```bash
# ✅ DO: Use .env files properly
.env.local       # Local development (gitignored)
.env.development # Development defaults (committed)
.env.production  # Production defaults (committed, no secrets)

# ✅ DO: Validate environment variables
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  NODE_ENV: z.enum(['development', 'production', 'test'])
})

const env = envSchema.parse(process.env)
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to production
        run: vercel deploy --prod
```

---

## ✅ Code Review Checklist

Before submitting a PR:

- [ ] Code follows TypeScript strict mode
- [ ] All tests pass
- [ ] New features have tests
- [ ] No console.logs (use proper logging)
- [ ] No hardcoded secrets
- [ ] Errors are properly handled
- [ ] Performance considered (no N+1 queries)
- [ ] Security reviewed (no SQL injection, XSS)
- [ ] Accessibility checked (semantic HTML, ARIA labels)
- [ ] Mobile responsive
- [ ] Comments for complex logic
- [ ] Types are explicit (no `any`)
- [ ] Prisma schema updated if needed
- [ ] API docs updated

---

**Follow these practices religiously for a maintainable, secure, and high-performance platform!** 🏆
