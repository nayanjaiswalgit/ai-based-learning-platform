'use client'

import { createContext, useContext, ReactNode } from 'react'

export interface BrandingConfig {
  logo?: string
  companyName?: string
  primaryColor?: string
  secondaryColor?: string
  fontFamily?: string
  favicon?: string
  customCSS?: string
  showPoweredBy?: boolean
}

const defaultBranding: BrandingConfig = {
  companyName: 'AI Learn',
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
  fontFamily: 'Inter, sans-serif',
  showPoweredBy: true,
}

const BrandingContext = createContext<BrandingConfig>(defaultBranding)

export function useBranding() {
  return useContext(BrandingContext)
}

interface BrandingProviderProps {
  config?: BrandingConfig
  children: ReactNode
}

export function BrandingProvider({ config, children }: BrandingProviderProps) {
  const branding = { ...defaultBranding, ...config }

  return (
    <BrandingContext.Provider value={branding}>
      <style>{`
        :root {
          --brand-primary: ${branding.primaryColor};
          --brand-secondary: ${branding.secondaryColor};
          --brand-font: ${branding.fontFamily};
        }
        ${branding.customCSS || ''}
      `}</style>
      {children}
    </BrandingContext.Provider>
  )
}

// Branding configuration UI component
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

export function BrandingConfig() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Brand Identity</CardTitle>
          <CardDescription>Customize your platform&apos;s appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input id="company-name" defaultValue="AI Learn" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo-url">Logo URL</Label>
            <Input id="logo-url" placeholder="https://example.com/logo.png" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <Input id="primary-color" type="color" defaultValue="#3b82f6" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <Input id="secondary-color" type="color" defaultValue="#8b5cf6" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-family">Font Family</Label>
            <Input id="font-family" defaultValue="Inter, sans-serif" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show &quot;Powered by AI Learn&quot;</Label>
              <p className="text-sm text-muted-foreground">
                Display attribution in footer
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-css">Custom CSS</Label>
            <textarea
              id="custom-css"
              className="min-h-[150px] w-full resize-none rounded-md border bg-background p-3 font-mono text-sm"
              placeholder="/* Add custom CSS here */"
            />
          </div>

          <Button className="w-full">Save Branding Settings</Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>See how your branding looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-8 text-center">
            <div className="mb-4 text-2xl font-bold" style={{ color: '#3b82f6' }}>
              Your Company Name
            </div>
            <Button style={{ backgroundColor: '#3b82f6' }}>Sample Button</Button>
            <p className="mt-4 text-sm text-muted-foreground">
              This is how your brand colors will appear
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
