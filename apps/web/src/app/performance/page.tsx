'use client'

import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Database, Zap, AlertTriangle } from 'lucide-react'

export default function PerformancePage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: () => analyticsApi.getPerformanceMetrics(),
  })

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading metrics...</div>
  }

  if (!metrics) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">Failed to load metrics</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Performance Monitoring</h1>
          <p className="text-gray-600 mt-2">Real-time system performance metrics</p>
        </div>

        {/* API Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">P50 Response Time</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.apiResponseTime.p50}ms</div>
              <p className="text-xs text-muted-foreground mt-2">50th percentile</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">P95 Response Time</CardTitle>
              <Activity className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.apiResponseTime.p95}ms</div>
              <p className="text-xs text-muted-foreground mt-2">95th percentile</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">P99 Response Time</CardTitle>
              <Activity className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.apiResponseTime.p99}ms</div>
              <p className="text-xs text-muted-foreground mt-2">99th percentile</p>
            </CardContent>
          </Card>
        </div>

        {/* Database & System */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Performance
              </CardTitle>
              <CardDescription>Query execution metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Average Query Time</span>
                    <span className="text-sm text-gray-600">
                      {(metrics.databaseQueryPerformance.averageQueryTime || metrics.databaseQueryPerformance.avgTime || 0).toFixed(2)}ms
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          ((metrics.databaseQueryPerformance.averageQueryTime || metrics.databaseQueryPerformance.avgTime || 0) / 1000) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {Array.isArray(metrics.databaseQueryPerformance.slowQueries) && metrics.databaseQueryPerformance.slowQueries.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Recent Slow Queries
                    </h4>
                    <div className="space-y-2">
                      {metrics.databaseQueryPerformance.slowQueries.slice(0, 5).map((query: any, i: number) => (
                        <div key={i} className="text-xs bg-yellow-50 border border-yellow-200 rounded p-2">
                          <div className="flex justify-between mb-1">
                            <span className="font-mono text-gray-700 truncate flex-1">
                              {query.query.substring(0, 50)}...
                            </span>
                            <span className="text-yellow-700 font-medium ml-2">{query.duration}ms</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                System Health
              </CardTitle>
              <CardDescription>Overall system status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Error Rate</span>
                    <span className="text-sm text-gray-600">{(typeof metrics.errorRate === 'number' ? metrics.errorRate : metrics.errorRate.rate).toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (typeof metrics.errorRate === 'number' ? metrics.errorRate : metrics.errorRate.rate) < 1 ? 'bg-green-600' : (typeof metrics.errorRate === 'number' ? metrics.errorRate : metrics.errorRate.rate) < 5 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${Math.min((typeof metrics.errorRate === 'number' ? metrics.errorRate : metrics.errorRate.rate) * 10, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Uptime</span>
                    <span className="text-sm text-green-600">{typeof metrics.uptime === 'number' ? metrics.uptime : metrics.uptime.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${typeof metrics.uptime === 'number' ? metrics.uptime : metrics.uptime.percentage}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.codeExecutionMetrics.queueLength || 0}</div>
                    <p className="text-xs text-gray-500">Queue Length</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.codeExecutionMetrics.errors || 0}</div>
                    <p className="text-xs text-gray-500">Execution Errors</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Overall system performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">Healthy</div>
                <p className="text-sm text-gray-600 mt-1">API Status</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">Optimal</div>
                <p className="text-sm text-gray-600 mt-1">DB Performance</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{typeof metrics.uptime === 'number' ? metrics.uptime : metrics.uptime.percentage}%</div>
                <p className="text-sm text-gray-600 mt-1">Uptime</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">{(typeof metrics.errorRate === 'number' ? metrics.errorRate : metrics.errorRate.rate).toFixed(1)}%</div>
                <p className="text-sm text-gray-600 mt-1">Error Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
