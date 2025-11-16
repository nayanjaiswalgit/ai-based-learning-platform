import { Controller, Get, Post, Body, Param, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CoursePurchaseService } from './course-purchase.service';

@ApiTags('course-purchases')
@ApiBearerAuth()
@Controller('course-purchases')
export class CoursePurchaseController {
  constructor(private readonly coursePurchaseService: CoursePurchaseService) {}

  @Post('purchase')
  @ApiOperation({ summary: 'Purchase a course' })
  async purchaseCourse(@Body() data: any, @Ip() ipAddress: string) {
    return this.coursePurchaseService.purchaseCourse({
      ...data,
      ipAddress,
    });
  }

  @Post('bundle')
  @ApiOperation({ summary: 'Purchase course bundle' })
  async purchaseBundle(@Body() data: any) {
    return this.coursePurchaseService.purchaseBundle(data);
  }

  @Post(':transactionId/complete')
  @ApiOperation({ summary: 'Complete course purchase' })
  async completePurchase(@Param('transactionId') transactionId: string) {
    return this.coursePurchaseService.completePurchase(transactionId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user course purchases' })
  async getUserPurchases(@Param('userId') userId: string) {
    return this.coursePurchaseService.getUserPurchases(userId);
  }
}
