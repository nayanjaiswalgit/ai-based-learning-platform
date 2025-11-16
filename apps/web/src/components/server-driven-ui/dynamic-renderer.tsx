'use client'

import { DynamicComponent } from './component-registry'

export interface UIConfig {
  id: string
  component: string
  props?: Record<string, any>
  condition?: {
    featureFlag?: string
    userRole?: string[]
    abTestVariant?: string
  }
}

interface DynamicRendererProps {
  config: UIConfig[]
  featureFlags?: Record<string, boolean>
  userRole?: string
  abTestVariants?: Record<string, string>
}

export function DynamicRenderer({
  config,
  featureFlags = {},
  userRole,
  abTestVariants = {}
}: DynamicRendererProps) {
  const shouldRenderComponent = (component: UIConfig): boolean => {
    if (!component.condition) return true

    const { featureFlag, userRole: requiredRoles, abTestVariant } = component.condition

    // Check feature flag
    if (featureFlag && !featureFlags[featureFlag]) {
      return false
    }

    // Check user role
    if (requiredRoles && userRole && !requiredRoles.includes(userRole)) {
      return false
    }

    // Check A/B test variant
    if (abTestVariant) {
      const testName = Object.keys(abTestVariants).find(
        key => abTestVariants[key] === abTestVariant
      )
      if (!testName) return false
    }

    return true
  }

  return (
    <div className="space-y-6">
      {config.map((item) => {
        if (!shouldRenderComponent(item)) {
          return null
        }

        return (
          <div key={item.id}>
            <DynamicComponent
              componentName={item.component}
              props={item.props}
            />
          </div>
        )
      })}
    </div>
  )
}
