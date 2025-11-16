'use client'

import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Flag, TrendingUp, Users, Activity } from 'lucide-react'

export default function FeatureFlagsPage() {
  const { data: flags, isLoading: flagsLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: () => analyticsApi.getAllFlags(),
  })

  const { data: tests, isLoading: testsLoading } = useQuery({
    queryKey: ['ab-tests'],
    queryFn: () => analyticsApi.getAllTests(),
  })

  if (flagsLoading || testsLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Feature Flags & A/B Testing</h1>
          <p className="text-gray-600 mt-2">Manage feature rollouts and experiments</p>
        </div>

        {/* Feature Flags */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Feature Flags
            </CardTitle>
            <CardDescription>Control feature availability and rollout</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {flags && flags.map((flag: any) => (
                <div
                  key={flag.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${flag.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <h4 className="font-semibold">{flag.name}</h4>
                        <p className="text-sm text-gray-600">{flag.description}</p>
                        <p className="text-xs text-gray-400 mt-1">Key: {flag.key}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{flag.rolloutPercentage}%</div>
                    <p className="text-xs text-gray-500">Rollout</p>
                    {flag.targetSegments && flag.targetSegments.length > 0 && (
                      <div className="mt-2 flex gap-1">
                        {flag.targetSegments.map((segment: string) => (
                          <span
                            key={segment}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                          >
                            {segment}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* A/B Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              A/B Tests
            </CardTitle>
            <CardDescription>Active experiments and their performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tests && tests.map((test: any) => (
                <div
                  key={test.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{test.name}</h4>
                      <p className="text-sm text-gray-600">{test.description}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        test.status === 'running'
                          ? 'bg-green-100 text-green-700'
                          : test.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {test.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {test.variants.map((variant: any) => (
                      <div key={variant.id} className="bg-gray-50 rounded p-3">
                        <div className="text-sm font-medium">{variant.name}</div>
                        <div className="text-2xl font-bold mt-1">{variant.allocation}%</div>
                        <div className="text-xs text-gray-500">Allocation</div>
                      </div>
                    ))}
                  </div>

                  {test.metrics && test.metrics.length > 0 && (
                    <div className="mt-4 flex gap-2">
                      {test.metrics.map((metric: any) => (
                        <span
                          key={metric.name}
                          className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded"
                        >
                          {metric.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
