import { Injectable, Logger } from '@nestjs/common'
import { PostHog } from 'posthog-node'

@Injectable()
export class PostHogService {
  private readonly logger = new Logger(PostHogService.name)
  private posthog: PostHog | null = null

  constructor() {
    const apiKey = process.env.POSTHOG_API_KEY
    const host = process.env.POSTHOG_HOST || 'https://app.posthog.com'

    if (apiKey) {
      this.posthog = new PostHog(apiKey, { host })
      this.logger.log('PostHog initialized')
    } else {
      this.logger.warn('PostHog API key not found. Analytics will be disabled.')
    }
  }

  async capture(userId: string, event: string, properties?: Record<string, any>) {
    if (!this.posthog) {
      return
    }

    this.posthog.capture({
      distinctId: userId,
      event,
      properties,
    })
  }

  async identify(userId: string, properties?: Record<string, any>) {
    if (!this.posthog) {
      return
    }

    this.posthog.identify({
      distinctId: userId,
      properties,
    })
  }

  async getFeatureFlag(userId: string, flagKey: string): Promise<boolean | string> {
    if (!this.posthog) {
      return false
    }

    return await this.posthog.isFeatureEnabled(flagKey, userId)
  }

  async getAllFeatureFlags(userId: string): Promise<Record<string, boolean | string>> {
    if (!this.posthog) {
      return {}
    }

    return await this.posthog.getAllFlags(userId)
  }

  async shutdown() {
    if (this.posthog) {
      await this.posthog.shutdown()
    }
  }
}
