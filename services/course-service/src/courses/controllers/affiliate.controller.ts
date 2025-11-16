import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AffiliateService } from '../services/affiliate.service';

@ApiTags('affiliate')
@Controller('affiliate')
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate affiliate link for a course' })
  generate(@Body() data: { courseId: string; commissionRate?: number }) {
    return this.affiliateService.generateAffiliateLink(data.courseId, data.commissionRate);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get affiliate link details' })
  findByCode(@Param('code') code: string) {
    return this.affiliateService.findByCode(code);
  }

  @Post(':code/click')
  @ApiOperation({ summary: 'Track affiliate click' })
  trackClick(@Param('code') code: string) {
    return this.affiliateService.trackClick(code);
  }

  @Post(':code/conversion')
  @ApiOperation({ summary: 'Track affiliate conversion' })
  trackConversion(@Param('code') code: string, @Body('purchaseAmount') purchaseAmount: number) {
    return this.affiliateService.trackConversion(code, purchaseAmount);
  }

  @Get(':code/stats')
  @ApiOperation({ summary: 'Get affiliate statistics' })
  getStats(@Param('code') code: string) {
    return this.affiliateService.getAffiliateStats(code);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all affiliate links for a course' })
  getCourseLinks(@Param('courseId') courseId: string) {
    return this.affiliateService.getCourseAffiliateLinks(courseId);
  }
}
