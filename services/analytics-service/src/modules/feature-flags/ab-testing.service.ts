import { Injectable, Logger, Inject } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import type { ABTest } from '@repo/shared-types'

@Injectable()
export class ABTestingService {
  private readonly logger = new Logger(ABTestingService.name)
  private tests: Map<string, ABTest> = new Map()
  private userVariants: Map<string, Map<string, string>> = new Map()

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.initializeDefaultTests()
  }

  private initializeDefaultTests() {
    const defaultTests: ABTest[] = [
      {
        id: 'test1',
        name: 'Checkout Button Color',
        description: 'Test different button colors on checkout page',
        variants: [
          { id: 'control', name: 'Blue (Control)', allocation: 50, config: { color: 'blue' } },
          { id: 'variant_a', name: 'Green', allocation: 50, config: { color: 'green' } },
        ],
        status: 'running',
        startDate: new Date(),
        endDate: null,
        metrics: [
          { name: 'conversion_rate', type: 'conversion' },
          { name: 'revenue', type: 'revenue' },
        ],
      },
    ]

    defaultTests.forEach((test) => {
      this.tests.set(test.id, test)
    })
  }

  async getAllTests(): Promise<ABTest[]> {
    return Array.from(this.tests.values())
  }

  async getTest(testId: string): Promise<ABTest | null> {
    return this.tests.get(testId) || null
  }

  async createTest(data: Omit<ABTest, 'id'>): Promise<ABTest> {
    const test: ABTest = {
      id: Date.now().toString(),
      ...data,
    }

    this.tests.set(test.id, test)
    this.logger.log(`Created A/B test: ${test.name}`)

    return test
  }

  async getVariant(testId: string, userId: string): Promise<string | null> {
    const test = this.tests.get(testId)

    if (!test || test.status !== 'running') {
      return null
    }

    // Check if user already has a variant
    const userVariant = this.userVariants.get(testId)?.get(userId)
    if (userVariant) {
      return userVariant
    }

    // Assign variant based on allocation
    const hash = this.hashUserId(userId)
    const randomValue = hash % 100

    let cumulative = 0
    for (const variant of test.variants) {
      cumulative += variant.allocation
      if (randomValue < cumulative) {
        // Store variant assignment
        if (!this.userVariants.has(testId)) {
          this.userVariants.set(testId, new Map())
        }
        this.userVariants.get(testId)!.set(userId, variant.id)

        return variant.id
      }
    }

    return test.variants[0].id // Fallback to first variant
  }

  async getTestResults(testId: string): Promise<any> {
    const test = this.tests.get(testId)

    if (!test) {
      return null
    }

    // Calculate results for each variant
    const results = test.variants.map((variant) => {
      const users = Array.from(this.userVariants.get(testId)?.entries() || []).filter(
        ([_, v]) => v === variant.id,
      )

      return {
        variant: variant.name,
        users: users.length,
        // In production, calculate actual metrics from event data
        conversionRate: Math.random() * 20 + 5, // Placeholder
        revenue: Math.random() * 10000 + 1000, // Placeholder
      }
    })

    return {
      testId,
      testName: test.name,
      status: test.status,
      variants: results,
    }
  }

  private hashUserId(userId: string): number {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }
}
