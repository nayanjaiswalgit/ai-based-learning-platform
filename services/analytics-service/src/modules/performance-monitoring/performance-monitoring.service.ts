import { Injectable, Logger } from '@nestjs/common'
import type { PerformanceMetrics } from '@repo/shared-types'

interface ApiMetric {
  endpoint: string
  duration: number
  statusCode: number
  timestamp: Date
}

interface QueryMetric {
  query: string
  duration: number
  timestamp: Date
}

@Injectable()
export class PerformanceMonitoringService {
  private readonly logger = new Logger(PerformanceMonitoringService.name)
  private apiMetrics: ApiMetric[] = []
  private queryMetrics: QueryMetric[] = []
  private errorCount = 0
  private totalRequests = 0

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    // API Response Time
    const responseTimes = this.apiMetrics.map((m) => m.duration).sort((a, b) => a - b)
    const p50 = this.getPercentile(responseTimes, 50)
    const p95 = this.getPercentile(responseTimes, 95)
    const p99 = this.getPercentile(responseTimes, 99)

    // Database Query Performance
    const queryDurations = this.queryMetrics.map((m) => m.duration)
    const avgQueryTime =
      queryDurations.length > 0
        ? queryDurations.reduce((a, b) => a + b, 0) / queryDurations.length
        : 0

    // Get slow queries (>1000ms)
    const slowQueries = this.queryMetrics
      .filter((m) => m.duration > 1000)
      .slice(-10)
      .map((m) => ({
        query: m.query,
        duration: m.duration,
        timestamp: m.timestamp,
      }))

    // Code execution metrics (placeholder)
    const codeExecutionMetrics = {
      queueLength: 0,
      averageExecutionTime: 0,
      timeouts: 0,
      errors: 0,
    }

    // Video metrics (placeholder)
    const videoMetrics = {
      averageBufferTime: 0,
      playbackQuality: {
        '1080p': 0,
        '720p': 0,
        '480p': 0,
      },
    }

    // Error rate
    const errorRate = this.totalRequests > 0 ? (this.errorCount / this.totalRequests) * 100 : 0

    // Uptime (calculate from start time)
    const uptime = 99.9 // Placeholder

    return {
      apiResponseTime: { p50, p95, p99 },
      databaseQueryPerformance: {
        averageQueryTime,
        slowQueries,
      },
      codeExecutionMetrics,
      videoMetrics,
      errorRate,
      uptime,
    }
  }

  async trackApiCall(data: { endpoint: string; duration: number; statusCode: number }) {
    this.apiMetrics.push({
      ...data,
      timestamp: new Date(),
    })

    this.totalRequests++

    if (data.statusCode >= 500) {
      this.errorCount++
    }

    // Keep only last 10000 metrics
    if (this.apiMetrics.length > 10000) {
      this.apiMetrics = this.apiMetrics.slice(-5000)
    }

    // Log slow requests
    if (data.duration > 1000) {
      this.logger.warn(`Slow API request: ${data.endpoint} took ${data.duration}ms`)
    }
  }

  async trackDatabaseQuery(data: { query: string; duration: number }) {
    this.queryMetrics.push({
      ...data,
      timestamp: new Date(),
    })

    // Keep only last 5000 queries
    if (this.queryMetrics.length > 5000) {
      this.queryMetrics = this.queryMetrics.slice(-2500)
    }

    // Log slow queries
    if (data.duration > 1000) {
      this.logger.warn(`Slow query: ${data.query.substring(0, 100)}... took ${data.duration}ms`)
    }
  }

  private getPercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0

    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1
    return sortedArray[Math.max(0, index)] || 0
  }
}
