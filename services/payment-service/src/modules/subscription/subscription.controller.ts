import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';

@ApiTags('subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get all subscription plans' })
  async getPlans() {
    return this.subscriptionService.getPlans();
  }

  @Get('plans/:planId')
  @ApiOperation({ summary: 'Get subscription plan by ID' })
  async getPlan(@Param('planId') planId: string) {
    return this.subscriptionService.getPlan(planId);
  }

  @Post('plans')
  @ApiOperation({ summary: 'Create subscription plan (Admin only)' })
  async createPlan(@Body() data: any) {
    return this.subscriptionService.createPlan(data);
  }

  @Put('plans/:planId')
  @ApiOperation({ summary: 'Update subscription plan (Admin only)' })
  async updatePlan(@Param('planId') planId: string, @Body() data: any) {
    return this.subscriptionService.updatePlan(planId, data);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user subscription' })
  async getUserSubscription(@Param('userId') userId: string) {
    return this.subscriptionService.getUserSubscription(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new subscription' })
  async createSubscription(
    @Body()
    data: {
      userId: string;
      planId: string;
      billingCycle: 'monthly' | 'yearly';
      paymentMethod?: 'stripe' | 'razorpay' | 'paypal' | 'paddle';
      customerId?: string;
      email: string;
      countryCode?: string;
    },
  ) {
    return this.subscriptionService.createSubscription(data);
  }

  @Put(':userId/upgrade')
  @ApiOperation({ summary: 'Upgrade subscription' })
  async upgradeSubscription(
    @Param('userId') userId: string,
    @Body() data: { newPlanId: string },
  ) {
    return this.subscriptionService.upgradeSubscription(userId, data.newPlanId);
  }

  @Put(':userId/downgrade')
  @ApiOperation({ summary: 'Downgrade subscription' })
  async downgradeSubscription(
    @Param('userId') userId: string,
    @Body() data: { newPlanId: string },
  ) {
    return this.subscriptionService.downgradeSubscription(userId, data.newPlanId);
  }

  @Delete(':userId/cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  async cancelSubscription(
    @Param('userId') userId: string,
    @Query('immediately') immediately?: boolean,
  ) {
    return this.subscriptionService.cancelSubscription(userId, immediately === true);
  }

  @Put(':userId/resume')
  @ApiOperation({ summary: 'Resume cancelled subscription' })
  async resumeSubscription(@Param('userId') userId: string) {
    return this.subscriptionService.resumeSubscription(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get subscription statistics (Admin only)' })
  async getStats() {
    return this.subscriptionService.getSubscriptionStats();
  }
}
