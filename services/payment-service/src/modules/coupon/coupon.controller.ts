import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponService } from './coupon.service';

@ApiTags('coupons')
@ApiBearerAuth()
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @ApiOperation({ summary: 'Create coupon (Admin only)' })
  async createCoupon(@Body() data: any) {
    return this.couponService.createCoupon(data);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate coupon' })
  async validateCoupon(
    @Body() data: { code: string; userId: string; amount: number; type: string },
  ) {
    return this.couponService.validateCoupon(
      data.code,
      data.userId,
      data.amount,
      data.type,
    );
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply coupon to calculate discount' })
  async applyCoupon(
    @Body() data: { code: string; userId: string; amount: number; type: string },
  ) {
    return this.couponService.applyCoupon(
      data.code,
      data.userId,
      data.amount,
      data.type,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all coupons' })
  async getAllCoupons() {
    return this.couponService.getAllCoupons();
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get coupon by code' })
  async getCoupon(@Param('code') code: string) {
    return this.couponService.getCoupon(code);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update coupon (Admin only)' })
  async updateCoupon(@Param('id') id: string, @Body() data: any) {
    return this.couponService.updateCoupon(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate coupon (Admin only)' })
  async deactivateCoupon(@Param('id') id: string) {
    return this.couponService.deactivateCoupon(id);
  }
}
