import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AffiliateService } from './affiliate.service';

@ApiTags('affiliates')
@ApiBearerAuth()
@Controller('affiliates')
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Post()
  @ApiOperation({ summary: 'Create affiliate account' })
  async createAffiliate(@Body() data: { userId: string; programId: string }) {
    return this.affiliateService.createAffiliate(data.userId, data.programId);
  }

  @Post('track')
  @ApiOperation({ summary: 'Track affiliate referral' })
  async trackReferral(
    @Body() data: { affiliateCode: string; userId: string },
  ) {
    return this.affiliateService.trackReferral(data.affiliateCode, data.userId);
  }

  @Get('stats/:userId')
  @ApiOperation({ summary: 'Get affiliate statistics' })
  async getStats(@Param('userId') userId: string) {
    return this.affiliateService.getAffiliateStats(userId);
  }

  @Post('payout/:userId')
  @ApiOperation({ summary: 'Request affiliate payout' })
  async requestPayout(@Param('userId') userId: string) {
    return this.affiliateService.requestPayout(userId);
  }
}
