import { Injectable, Logger, Inject } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import type { FeatureFlag } from '@repo/shared-types'

interface FlagData {
  key: string
  name: string
  description: string
  enabled: boolean
  rolloutPercentage: number
  targetSegments: string[]
}

@Injectable()
export class FeatureFlagsService {
  private readonly logger = new Logger(FeatureFlagsService.name)
  private flags: Map<string, FeatureFlag> = new Map()

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.initializeDefaultFlags()
  }

  private initializeDefaultFlags() {
    const defaultFlags: FeatureFlag[] = [
      {
        id: '1',
        key: 'new_dashboard',
        name: 'New Dashboard UI',
        description: 'Enable the redesigned dashboard',
        enabled: false,
        rolloutPercentage: 0,
        targetSegments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        key: 'ai_recommendations',
        name: 'AI Recommendations',
        description: 'Enable AI-powered course recommendations',
        enabled: true,
        rolloutPercentage: 50,
        targetSegments: ['pro', 'enterprise'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        key: 'code_execution_v2',
        name: 'Code Execution V2',
        description: 'New code execution engine with better performance',
        enabled: false,
        rolloutPercentage: 10,
        targetSegments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    defaultFlags.forEach((flag) => {
      this.flags.set(flag.key, flag)
    })
  }

  async getAllFlags(): Promise<FeatureFlag[]> {
    return Array.from(this.flags.values())
  }

  async getFlag(key: string): Promise<FeatureFlag | null> {
    return this.flags.get(key) || null
  }

  async isEnabled(key: string, userId: string, userSegment?: string): Promise<boolean> {
    const cacheKey = `flag:${key}:${userId}`
    const cached = await this.cacheManager.get<boolean>(cacheKey)

    if (cached !== undefined) {
      return cached
    }

    const flag = this.flags.get(key)

    if (!flag || !flag.enabled) {
      await this.cacheManager.set(cacheKey, false, 300) // Cache for 5 minutes
      return false
    }

    // Check target segments
    if (flag.targetSegments.length > 0 && userSegment) {
      if (!flag.targetSegments.includes(userSegment)) {
        await this.cacheManager.set(cacheKey, false, 300)
        return false
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      // Deterministic rollout based on user ID
      const hash = this.hashUserId(userId)
      const isInRollout = (hash % 100) < flag.rolloutPercentage

      await this.cacheManager.set(cacheKey, isInRollout, 300)
      return isInRollout
    }

    await this.cacheManager.set(cacheKey, true, 300)
    return true
  }

  async createFlag(data: FlagData): Promise<FeatureFlag> {
    const flag: FeatureFlag = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.flags.set(flag.key, flag)
    this.logger.log(`Created feature flag: ${flag.key}`)

    return flag
  }

  async updateFlag(key: string, data: Partial<FlagData>): Promise<FeatureFlag | null> {
    const flag = this.flags.get(key)

    if (!flag) {
      return null
    }

    const updated: FeatureFlag = {
      ...flag,
      ...data,
      updatedAt: new Date(),
    }

    this.flags.set(key, updated)
    this.logger.log(`Updated feature flag: ${key}`)

    return updated
  }

  async deleteFlag(key: string): Promise<boolean> {
    const deleted = this.flags.delete(key)
    if (deleted) {
      this.logger.log(`Deleted feature flag: ${key}`)
    }
    return deleted
  }

  private hashUserId(userId: string): number {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }
}
