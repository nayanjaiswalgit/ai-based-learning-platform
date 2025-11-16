'use client'

import posthog from 'posthog-js'

// Initialize PostHog
export function initializePostHog() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
      },
    })
  }
}

// Feature flags
export function isFeatureEnabled(flagName: string): boolean {
  if (typeof window === 'undefined') return false
  return posthog.isFeatureEnabled(flagName) || false
}

export function getFeatureFlag(flagName: string): string | boolean | undefined {
  if (typeof window === 'undefined') return undefined
  return posthog.getFeatureFlag(flagName)
}

// Identify user
export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (typeof window === 'undefined') return
  posthog.identify(userId, traits)
}

// Track events
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return
  posthog.capture(eventName, properties)
}

// A/B Testing
export function getABTestVariant(testName: string): string | undefined {
  const variant = getFeatureFlag(testName)
  return typeof variant === 'string' ? variant : undefined
}

// Reset on logout
export function resetUser() {
  if (typeof window === 'undefined') return
  posthog.reset()
}

// Common feature flags
export const FeatureFlags = {
  NEW_DASHBOARD: 'new-dashboard',
  AI_RECOMMENDATIONS: 'ai-recommendations',
  LIVE_CHAT: 'live-chat',
  ADVANCED_ANALYTICS: 'advanced-analytics',
  GAMIFICATION: 'gamification',
  WHITE_LABEL: 'white-label',
  BOOTCAMPS: 'bootcamps',
  CODE_EXECUTION: 'code-execution',
} as const

// A/B Tests
export const ABTests = {
  PRICING_PAGE: 'pricing-page-test',
  CTA_BUTTON: 'cta-button-test',
  ONBOARDING_FLOW: 'onboarding-flow-test',
} as const
