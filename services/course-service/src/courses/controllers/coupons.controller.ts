import { Controller, Get, Post, Put, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CouponsService } from '../services/coupons.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new coupon' })
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all coupons' })
  findAll(@Query('isActive') isActive?: string) {
    return this.couponsService.findAll(isActive ? isActive === 'true' : undefined);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get a coupon by code' })
  findOne(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }

  @Put(':code')
  @ApiOperation({ summary: 'Update a coupon' })
  update(@Param('code') code: string, @Body() updateData: Partial<CreateCouponDto>) {
    return this.couponsService.update(code, updateData);
  }

  @Patch(':code/deactivate')
  @ApiOperation({ summary: 'Deactivate a coupon' })
  deactivate(@Param('code') code: string) {
    return this.couponsService.deactivate(code);
  }

  @Post(':code/validate')
  @ApiOperation({ summary: 'Validate a coupon code' })
  validate(@Param('code') code: string, @Body('courseId') courseId?: string) {
    return this.couponsService.validateCoupon(code, courseId);
  }

  @Post(':code/use')
  @ApiOperation({ summary: 'Mark coupon as used' })
  incrementUsage(@Param('code') code: string) {
    return this.couponsService.incrementUsage(code);
  }
}
