import { Controller, Get, Post, Put, Delete, Body, Param, Query, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PppService } from './ppp.service';

@ApiTags('ppp')
@ApiBearerAuth()
@Controller('ppp')
export class PppController {
  constructor(private readonly pppService: PppService) {}

  @Get('calculate')
  @ApiOperation({ summary: 'Calculate PPP price for country' })
  async calculatePrice(
    @Query('price') price: number,
    @Query('countryCode') countryCode?: string,
    @Ip() ipAddress?: string,
  ) {
    const country = countryCode || this.pppService.detectCountryFromIP(ipAddress!);

    if (!country) {
      return {
        error: 'Could not detect country',
        originalPrice: price,
        pppPrice: price,
      };
    }

    return this.pppService.calculatePppPrice(price, country);
  }

  @Get('country/:countryCode')
  @ApiOperation({ summary: 'Get PPP info for country' })
  async getPppForCountry(@Param('countryCode') countryCode: string) {
    return this.pppService.getPppForCountry(countryCode);
  }

  @Get('detect')
  @ApiOperation({ summary: 'Detect country from IP' })
  async detectCountry(@Ip() ipAddress: string) {
    const countryCode = this.pppService.detectCountryFromIP(ipAddress);
    return {
      ipAddress,
      countryCode,
      ppp: countryCode ? this.pppService.getPppForCountry(countryCode) : null,
    };
  }

  @Post('regional-pricing')
  @ApiOperation({ summary: 'Create regional pricing (Admin only)' })
  async createRegionalPricing(
    @Body()
    data: {
      planId: string;
      countryCode: string;
      countryName: string;
      currency: string;
      priceMonthly: number;
      priceYearly: number;
    },
  ) {
    return this.pppService.createRegionalPricing(data);
  }

  @Get('regional-pricing/:planId/:countryCode')
  @ApiOperation({ summary: 'Get regional pricing for plan and country' })
  async getRegionalPricing(
    @Param('planId') planId: string,
    @Param('countryCode') countryCode: string,
  ) {
    return this.pppService.getRegionalPricing(planId, countryCode);
  }

  @Get('regional-pricing/:planId')
  @ApiOperation({ summary: 'Get all regional pricing for plan' })
  async getAllRegionalPricing(@Param('planId') planId: string) {
    return this.pppService.getAllRegionalPricing(planId);
  }

  @Put('regional-pricing/:id')
  @ApiOperation({ summary: 'Update regional pricing (Admin only)' })
  async updateRegionalPricing(@Param('id') id: string, @Body() data: any) {
    return this.pppService.updateRegionalPricing(id, data);
  }

  @Delete('regional-pricing/:id')
  @ApiOperation({ summary: 'Delete regional pricing (Admin only)' })
  async deleteRegionalPricing(@Param('id') id: string) {
    return this.pppService.deleteRegionalPricing(id);
  }

  @Post('generate-all')
  @ApiOperation({ summary: 'Generate PPP for all plans (Admin only)' })
  async generatePppForAllPlans() {
    return this.pppService.generatePppForAllPlans();
  }
}
