# 🏭 Production-Ready Features

Comprehensive guide for enterprise-grade features: subscriptions, feature flags, error handling, monitoring, and more.

---

## 💳 Subscription Management (Stripe)

### Subscription Plans

```typescript
// packages/shared-types/src/subscription.ts
export enum SubscriptionPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export interface PlanFeatures {
  plan: SubscriptionPlan
  price: number
  interval: 'month' | 'year'
  features: {
    coursesAccess: 'limited' | 'unlimited'
    codeExecutionsPerDay: number
    aiRecommendations: boolean
    bootcampAccess: boolean
    prioritySupport: boolean
    downloadContent: boolean
    certificateGeneration: boolean
    customRoadmaps: boolean
    teamSeats?: number
  }
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, PlanFeatures> = {
  [SubscriptionPlan.FREE]: {
    plan: SubscriptionPlan.FREE,
    price: 0,
    interval: 'month',
    features: {
      coursesAccess: 'limited',
      codeExecutionsPerDay: 10,
      aiRecommendations: false,
      bootcampAccess: false,
      prioritySupport: false,
      downloadContent: false,
      certificateGeneration: false,
      customRoadmaps: false
    }
  },
  [SubscriptionPlan.PRO]: {
    plan: SubscriptionPlan.PRO,
    price: 19,
    interval: 'month',
    features: {
      coursesAccess: 'unlimited',
      codeExecutionsPerDay: 1000,
      aiRecommendations: true,
      bootcampAccess: true,
      prioritySupport: false,
      downloadContent: true,
      certificateGeneration: true,
      customRoadmaps: true
    }
  },
  [SubscriptionPlan.ENTERPRISE]: {
    plan: SubscriptionPlan.ENTERPRISE,
    price: 99,
    interval: 'month',
    features: {
      coursesAccess: 'unlimited',
      codeExecutionsPerDay: Infinity,
      aiRecommendations: true,
      bootcampAccess: true,
      prioritySupport: true,
      downloadContent: true,
      certificateGeneration: true,
      customRoadmaps: true,
      teamSeats: 10
    }
  }
}
```

### Stripe Integration (Backend)

```typescript
// services/payment-service/src/stripe.service.ts
import Stripe from 'stripe'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class StripeService {
  private stripe: Stripe
  private readonly logger = new Logger(StripeService.name)

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-11-20.acacia'
    })
  }

  // Create checkout session
  async createCheckoutSession(
    userId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: await this.getOrCreateCustomer(userId),
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId
        },
        subscription_data: {
          metadata: {
            userId
          },
          trial_period_days: 7 // 7-day free trial
        }
      })

      return session
    } catch (error) {
      this.logger.error('Error creating checkout session', error)
      throw error
    }
  }

  // Create customer portal session
  async createPortalSession(userId: string, returnUrl: string) {
    const customerId = await this.getOrCreateCustomer(userId)

    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl
    })

    return session
  }

  // Get or create Stripe customer
  private async getOrCreateCustomer(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { stripeCustomer: true }
    })

    if (user.stripeCustomer?.customerId) {
      return user.stripeCustomer.customerId
    }

    // Create new Stripe customer
    const customer = await this.stripe.customers.create({
      email: user.email,
      metadata: {
        userId: user.id
      }
    })

    // Save customer ID
    await this.prisma.stripeCustomer.create({
      data: {
        userId: user.id,
        customerId: customer.id
      }
    })

    return customer.id
  }

  // Handle webhook events
  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET')

    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      )

      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object)
          break

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object)
          break

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object)
          break

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object)
          break

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object)
          break

        default:
          this.logger.log(`Unhandled event type: ${event.type}`)
      }

      return { received: true }
    } catch (error) {
      this.logger.error('Webhook error', error)
      throw error
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.userId

    await this.prisma.subscription.create({
      data: {
        userId,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        plan: this.getPlanFromPriceId(subscription.items.data[0].price.id),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    })

    this.logger.log(`Subscription created for user ${userId}`)
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    await this.prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status,
        plan: this.getPlanFromPriceId(subscription.items.data[0].price.id),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    })
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    await this.prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date()
      }
    })
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    // Log successful payment
    await this.prisma.paymentTransaction.create({
      data: {
        userId: invoice.metadata.userId,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        status: 'succeeded',
        stripeInvoiceId: invoice.id,
        type: 'subscription'
      }
    })
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    // Send email notification about failed payment
    await this.emailService.sendPaymentFailedEmail(invoice.metadata.userId)

    // Log failed payment
    await this.prisma.paymentTransaction.create({
      data: {
        userId: invoice.metadata.userId,
        amount: invoice.amount_due / 100,
        currency: invoice.currency,
        status: 'failed',
        stripeInvoiceId: invoice.id,
        type: 'subscription'
      }
    })
  }

  private getPlanFromPriceId(priceId: string): SubscriptionPlan {
    const mapping = {
      [this.configService.get('STRIPE_PRO_PRICE_ID')]: SubscriptionPlan.PRO,
      [this.configService.get('STRIPE_ENTERPRISE_PRICE_ID')]: SubscriptionPlan.ENTERPRISE
    }
    return mapping[priceId] || SubscriptionPlan.FREE
  }
}
```

### Frontend: Subscription UI

```typescript
// apps/web/src/components/subscription/PricingCards.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@shared/types'

export function PricingCards() {
  const [interval, setInterval] = useState<'month' | 'year'>('month')

  const handleSubscribe = async (plan: string) => {
    const response = await fetch('/api/subscriptions/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, interval })
    })

    const { url } = await response.json()
    window.location.href = url
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
        <Card key={plan.plan} className={plan.plan === 'pro' ? 'border-primary' : ''}>
          <CardHeader>
            <CardTitle className="text-2xl">{plan.plan.toUpperCase()}</CardTitle>
            <CardDescription>
              {plan.plan === 'free' && 'Get started with basic features'}
              {plan.plan === 'pro' && 'Perfect for serious learners'}
              {plan.plan === 'enterprise' && 'For teams and organizations'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-4xl font-bold">${plan.price}</span>
              <span className="text-muted-foreground">/{interval}</span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>
                  {plan.features.coursesAccess === 'unlimited' ? 'Unlimited' : 'Limited'} course access
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>{plan.features.codeExecutionsPerDay} code executions/day</span>
              </li>
              {plan.features.aiRecommendations && (
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>AI-powered recommendations</span>
                </li>
              )}
              {plan.features.bootcampAccess && (
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Bootcamp access</span>
                </li>
              )}
              {plan.features.customRoadmaps && (
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Custom roadmaps</span>
                </li>
              )}
              {plan.features.prioritySupport && (
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Priority support</span>
                </li>
              )}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={plan.plan === 'pro' ? 'default' : 'outline'}
              onClick={() => handleSubscribe(plan.plan)}
              disabled={plan.plan === 'free'}
            >
              {plan.plan === 'free' ? 'Current Plan' : 'Upgrade Now'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
```

---

## 🎛️ Feature Flags

### PostHog Integration (Recommended)

```typescript
// apps/web/src/lib/posthog.ts
import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug()
    },
    capture_pageview: false, // We'll do this manually
    autocapture: false // Disable for privacy
  })
}

export { posthog }
```

```typescript
// apps/web/src/providers/PostHogProvider.tsx
'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { posthog } from '@/lib/posthog'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Track page views
  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture('$pageview', {
        $current_url: url
      })
    }
  }, [pathname, searchParams])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
```

### Using Feature Flags

```typescript
// apps/web/src/hooks/useFeatureFlag.ts
import { useFeatureFlagEnabled } from 'posthog-js/react'

export function useFeatureFlag(flag: string): boolean {
  return useFeatureFlagEnabled(flag) ?? false
}

// Usage in components
'use client'

import { useFeatureFlag } from '@/hooks/useFeatureFlag'

export function DashboardWidget() {
  const showNewDashboard = useFeatureFlag('new-dashboard-layout')
  const enableAIChat = useFeatureFlag('ai-chat-assistant')

  if (showNewDashboard) {
    return <NewDashboardLayout />
  }

  return (
    <div>
      <OldDashboardLayout />
      {enableAIChat && <AIChatWidget />}
    </div>
  )
}
```

### Server-Side Feature Flags

```typescript
// services/feature-flag-service/src/feature-flag.service.ts
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PostHog } from 'posthog-node'

@Injectable()
export class FeatureFlagService {
  private posthog: PostHog

  constructor(private configService: ConfigService) {
    this.posthog = new PostHog(
      configService.get('POSTHOG_API_KEY'),
      { host: configService.get('POSTHOG_HOST') }
    )
  }

  async isFeatureEnabled(
    featureFlag: string,
    userId: string,
    userProperties?: Record<string, any>
  ): Promise<boolean> {
    return await this.posthog.isFeatureEnabled(featureFlag, userId, {
      personProperties: userProperties
    })
  }

  async getAllFlags(userId: string): Promise<Record<string, boolean>> {
    return await this.posthog.getAllFlags(userId)
  }

  // Gradual rollout example
  async isEnabledWithRollout(
    featureFlag: string,
    userId: string,
    rolloutPercentage: number = 100
  ): Promise<boolean> {
    const enabled = await this.isFeatureEnabled(featureFlag, userId)

    if (!enabled) return false

    // Additional percentage-based rollout
    const hash = this.hashUserId(userId)
    return (hash % 100) < rolloutPercentage
  }

  private hashUserId(userId: string): number {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i)
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  async shutdown() {
    await this.posthog.shutdown()
  }
}
```

### Feature Flag Guard (NestJS)

```typescript
// services/api-gateway/src/guards/feature-flag.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { FeatureFlagService } from '../feature-flag/feature-flag.service'

export const RequireFeatureFlag = (flag: string) =>
  SetMetadata('featureFlag', flag)

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private featureFlagService: FeatureFlagService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const featureFlag = this.reflector.get<string>(
      'featureFlag',
      context.getHandler()
    )

    if (!featureFlag) {
      return true // No feature flag required
    }

    const request = context.switchToHttp().getRequest()
    const userId = request.user?.id

    if (!userId) {
      return false // Feature requires authentication
    }

    return await this.featureFlagService.isFeatureEnabled(featureFlag, userId)
  }
}

// Usage
@Controller('beta')
export class BetaFeaturesController {
  @Get('new-roadmap')
  @UseGuards(JwtAuthGuard, FeatureFlagGuard)
  @RequireFeatureFlag('new-roadmap-feature')
  async getNewRoadmap(@CurrentUser() user: User) {
    return this.roadmapService.generateV2(user.id)
  }
}
```

---

## 🛡️ Error Boundaries

### React Error Boundary

```typescript
// apps/web/src/components/ErrorBoundary.tsx
'use client'

import { Component, type ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    })

    // Call custom error handler
    this.props.onError?.(error, errorInfo)

    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <ErrorFallback error={this.state.error} reset={() => this.setState({ hasError: false })} />
    }

    return this.props.children
  }
}

// Default fallback UI
function ErrorFallback({ error, reset }: { error?: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground max-w-md">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-4">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### Usage in App

```typescript
// apps/web/src/app/layout.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PostHogProvider } from '@/providers/PostHogProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </PostHogProvider>
      </body>
    </html>
  )
}
```

### Granular Error Boundaries

```typescript
// Wrap specific features with their own boundaries
'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'

export function CoursePage({ course }) {
  return (
    <div>
      <h1>{course.title}</h1>

      {/* Video player with its own error boundary */}
      <ErrorBoundary fallback={<VideoErrorFallback />}>
        <VideoPlayer videoUrl={course.videoUrl} />
      </ErrorBoundary>

      {/* Code editor with its own error boundary */}
      <ErrorBoundary fallback={<CodeEditorErrorFallback />}>
        <CodeEditor language="python" />
      </ErrorBoundary>

      {/* Rest of the page */}
      <CourseContent content={course.content} />
    </div>
  )
}

function VideoErrorFallback() {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <p className="text-sm text-destructive">
        Unable to load video player. Please refresh the page.
      </p>
    </div>
  )
}
```

### Next.js Error Pages

```typescript
// apps/web/src/app/error.tsx
'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h1 className="text-4xl font-bold">Oops! Something went wrong</h1>
        <p className="text-muted-foreground max-w-md">
          We're sorry for the inconvenience. Our team has been notified and is working on a fix.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
        )}
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  )
}

// apps/web/src/app/global-error.tsx
'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <h1>Application Error</h1>
        <p>Something went wrong. Please try refreshing the page.</p>
      </body>
    </html>
  )
}

// apps/web/src/app/not-found.tsx
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <FileQuestion className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
        <p className="text-muted-foreground max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}
```

---

## 📊 Error Tracking & Monitoring (Sentry)

### Sentry Setup

```typescript
// apps/web/sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Error filtering
  beforeSend(event, hint) {
    // Filter out certain errors
    const error = hint.originalException

    // Ignore network errors
    if (error && error.message?.includes('Network request failed')) {
      return null
    }

    // Ignore ad blocker errors
    if (error && error.message?.includes('blocked by client')) {
      return null
    }

    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies
      if (event.request.headers) {
        delete event.request.headers['authorization']
      }
    }

    return event
  },

  // Integration configurations
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', /^https:\/\/yourapp\.com/]
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true
    })
  ]
})

// apps/web/sentry.server.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,

  beforeSend(event) {
    // Remove sensitive server data
    if (event.request?.headers) {
      delete event.request.headers['cookie']
      delete event.request.headers['authorization']
    }
    return event
  }
})
```

### Custom Error Logging

```typescript
// apps/web/src/lib/error-logger.ts
import * as Sentry from '@sentry/nextjs'

export class ErrorLogger {
  static captureException(error: Error, context?: Record<string, any>) {
    Sentry.captureException(error, {
      contexts: {
        custom: context
      }
    })
  }

  static captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    Sentry.captureMessage(message, level)
  }

  static setUser(user: { id: string; email: string; username: string }) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username
    })
  }

  static clearUser() {
    Sentry.setUser(null)
  }

  static addBreadcrumb(message: string, data?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message,
      data,
      level: 'info'
    })
  }

  static setContext(name: string, context: Record<string, any>) {
    Sentry.setContext(name, context)
  }

  // Track API errors
  static async trackAPIError(
    endpoint: string,
    method: string,
    statusCode: number,
    error: any
  ) {
    Sentry.captureException(error, {
      tags: {
        api_endpoint: endpoint,
        http_method: method,
        status_code: statusCode
      },
      contexts: {
        api: {
          endpoint,
          method,
          statusCode,
          errorMessage: error.message
        }
      }
    })
  }
}

// Usage
try {
  await fetchCourseData(courseId)
} catch (error) {
  ErrorLogger.captureException(error, {
    courseId,
    userId: user.id,
    action: 'fetch_course_data'
  })
  throw error
}
```

---

## 🔔 Notification System

### Real-time Notifications (Socket.io)

```typescript
// services/notification-service/src/notification.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private logger = new Logger(NotificationGateway.name)
  private userSockets = new Map<string, Set<string>>() // userId -> Set of socket IDs

  handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId

    if (!userId) {
      client.disconnect()
      return
    }

    // Add socket to user's connections
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set())
    }
    this.userSockets.get(userId)!.add(client.id)

    // Join user's personal room
    client.join(`user:${userId}`)

    this.logger.log(`Client connected: ${client.id} (User: ${userId})`)
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.auth.userId

    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id)

      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId)
      }
    }

    this.logger.log(`Client disconnected: ${client.id}`)
  }

  // Send notification to specific user
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data)
  }

  // Send notification to multiple users
  sendToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach((userId) => {
      this.sendToUser(userId, event, data)
    })
  }

  // Broadcast to all connected users
  broadcast(event: string, data: any) {
    this.server.emit(event, data)
  }
}

// Notification service
@Injectable()
export class NotificationService {
  constructor(
    private notificationGateway: NotificationGateway,
    private prisma: PrismaService
  ) {}

  async notify(userId: string, notification: CreateNotificationDto) {
    // Save to database
    const saved = await this.prisma.notification.create({
      data: {
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        actionUrl: notification.actionUrl
      }
    })

    // Send real-time notification
    this.notificationGateway.sendToUser(userId, 'notification', saved)

    return saved
  }

  async notifyCodeExecutionComplete(userId: string, submissionId: string, status: string) {
    await this.notify(userId, {
      type: 'code_execution',
      title: 'Code Execution Complete',
      message: `Your code submission ${status === 'accepted' ? 'passed' : 'failed'} all test cases`,
      actionUrl: `/submissions/${submissionId}`
    })
  }

  async notifyNewDailyChallenge(userId: string) {
    await this.notify(userId, {
      type: 'daily_challenge',
      title: 'New Daily Challenge Available!',
      message: 'A new coding challenge is ready for you',
      actionUrl: '/challenges/daily'
    })
  }
}
```

### Frontend: Notification Component

```typescript
// apps/web/src/components/Notifications.tsx
'use client'

import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  actionUrl?: string
  isRead: boolean
  createdAt: string
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    // Connect to Socket.io
    const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { userId }
    })

    // Listen for notifications
    socket.on('notification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((count) => count + 1)

      // Show toast
      toast({
        title: notification.title,
        description: notification.message
      })
    })

    // Fetch existing notifications
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      })

    return () => {
      socket.disconnect()
    }
  }, [userId, toast])

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
    setUnreadCount((count) => Math.max(0, count - 1))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} new</Badge>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-4"
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex w-full items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toRelativeTime()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## 📝 Logging System

### Winston Logger Configuration

```typescript
// packages/shared/src/logger/winston.config.ts
import { createLogger, format, transports } from 'winston'

const { combine, timestamp, errors, json, printf, colorize } = format

// Custom format for console
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`

  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`
  }

  return msg
})

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'api',
    environment: process.env.NODE_ENV
  },
  transports: [
    // Console transport
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        consoleFormat
      )
    }),

    // File transport for errors
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),

    // File transport for all logs
    new transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
})

// Production: send logs to external service
if (process.env.NODE_ENV === 'production') {
  // Example: Datadog
  logger.add(
    new transports.Http({
      host: 'http-intake.logs.datadoghq.com',
      path: `/api/v2/logs?dd-api-key=${process.env.DATADOG_API_KEY}&ddsource=nodejs&service=${process.env.SERVICE_NAME}`,
      ssl: true
    })
  )
}
```

### NestJS Logger Module

```typescript
// services/shared/src/logger/logger.module.ts
import { Module } from '@nestjs/common'
import { WinstonModule } from 'nest-winston'
import { logger } from './winston.config'

@Module({
  imports: [
    WinstonModule.forRoot({
      instance: logger
    })
  ],
  exports: [WinstonModule]
})
export class LoggerModule {}
```

---

## 🎯 Rate Limiting

```typescript
// services/api-gateway/src/throttler.config.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10 // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 100 // 100 requests per minute
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 1000 // 1000 requests per hour
      }
    ])
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}

// Custom rate limits per endpoint
@Controller('code-execution')
export class CodeExecutionController {
  @Post('run')
  @Throttle({ short: { limit: 3, ttl: 1000 } }) // 3 per second
  async runCode(@Body() dto: RunCodeDto) {
    return this.codeExecutionService.run(dto)
  }
}

// Subscription-based rate limiting
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.user?.id || req.ip
  }

  protected async getLimit(context: ExecutionContext): Promise<number> {
    const request = context.switchToHttp().getRequest()
    const user = request.user

    // Premium users get higher limits
    if (user?.subscription === 'pro') {
      return 1000
    } else if (user?.subscription === 'enterprise') {
      return Infinity
    }

    return 100 // Free tier
  }
}
```

---

**Your platform now has enterprise-grade production features!** 🏭

See TECH_STACK.md for complete library versions and BEST_PRACTICES.md for implementation patterns.
