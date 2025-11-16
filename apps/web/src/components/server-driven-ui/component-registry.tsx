'use client'

import { lazy, Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'

// Component registry using React.lazy
const componentRegistry: Record<string, React.LazyExoticComponent<any>> = {
  HeroSection: lazy(() => import('@/components/landing/hero-section').then(m => ({ default: m.HeroSection }))),
  FeaturesSection: lazy(() => import('@/components/landing/features-section').then(m => ({ default: m.FeaturesSection }))),
  CTASection: lazy(() => import('@/components/landing/cta-section').then(m => ({ default: m.CTASection }))),
  VideoPlayer: lazy(() => import('@/components/video-player/video-player').then(m => ({ default: m.VideoPlayer }))),
  MonacoEditor: lazy(() => import('@/components/code-editor/monaco-editor').then(m => ({ default: m.MonacoEditor }))),
  XtermTerminal: lazy(() => import('@/components/terminal/xterm-terminal').then(m => ({ default: m.XtermTerminal }))),
}

interface ComponentRegistryProps {
  componentName: string
  props?: Record<string, any>
  fallback?: React.ReactNode
}

export function DynamicComponent({
  componentName,
  props = {},
  fallback
}: ComponentRegistryProps) {
  const Component = componentRegistry[componentName]

  if (!Component) {
    console.error(`Component "${componentName}" not found in registry`)
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Component not found: {componentName}</p>
        </CardContent>
      </Card>
    )
  }

  const defaultFallback = (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <Component {...props} />
    </Suspense>
  )
}

export function getRegisteredComponents() {
  return Object.keys(componentRegistry)
}
