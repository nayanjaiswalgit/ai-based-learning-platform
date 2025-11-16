import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common'
import { FeatureFlagsService } from './feature-flags.service'
import { ABTestingService } from './ab-testing.service'

@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly abTestingService: ABTestingService,
  ) {}

  @Get()
  async getAllFlags() {
    return this.featureFlagsService.getAllFlags()
  }

  @Get(':key')
  async getFlag(@Param('key') key: string) {
    return this.featureFlagsService.getFlag(key)
  }

  @Get(':key/user/:userId')
  async isEnabled(@Param('key') key: string, @Param('userId') userId: string) {
    return this.featureFlagsService.isEnabled(key, userId)
  }

  @Post()
  async createFlag(@Body() data: any) {
    return this.featureFlagsService.createFlag(data)
  }

  @Put(':key')
  async updateFlag(@Param('key') key: string, @Body() data: any) {
    return this.featureFlagsService.updateFlag(key, data)
  }

  @Delete(':key')
  async deleteFlag(@Param('key') key: string) {
    return this.featureFlagsService.deleteFlag(key)
  }

  // A/B Testing endpoints
  @Get('ab-tests')
  async getAllTests() {
    return this.abTestingService.getAllTests()
  }

  @Post('ab-tests')
  async createTest(@Body() data: any) {
    return this.abTestingService.createTest(data)
  }

  @Get('ab-tests/:testId/results')
  async getTestResults(@Param('testId') testId: string) {
    return this.abTestingService.getTestResults(testId)
  }
}
