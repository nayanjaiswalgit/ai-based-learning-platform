import { Module } from '@nestjs/common'
import { FeatureFlagsController } from './feature-flags.controller'
import { FeatureFlagsService } from './feature-flags.service'
import { PostHogService } from './posthog.service'
import { ABTestingService } from './ab-testing.service'

@Module({
  controllers: [FeatureFlagsController],
  providers: [FeatureFlagsService, PostHogService, ABTestingService],
  exports: [FeatureFlagsService, PostHogService, ABTestingService],
})
export class FeatureFlagsModule {}
