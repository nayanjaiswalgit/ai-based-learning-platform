import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TaxService } from './tax.service';

@ApiTags('tax')
@ApiBearerAuth()
@Controller('tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Post('rates')
  @ApiOperation({ summary: 'Create tax rate (Admin only)' })
  async createTaxRate(@Body() data: any) {
    return this.taxService.createTaxRate(data);
  }

  @Get('rates')
  @ApiOperation({ summary: 'Get all tax rates' })
  async getAllTaxRates() {
    return this.taxService.getAllTaxRates();
  }

  @Get('calculate')
  @ApiOperation({ summary: 'Calculate tax for amount' })
  async calculateTax(
    @Query('amount') amount: number,
    @Query('countryCode') countryCode: string,
    @Query('stateCode') stateCode?: string,
  ) {
    return this.taxService.calculateTax(amount, countryCode, stateCode);
  }

  @Get('rate/:countryCode')
  @ApiOperation({ summary: 'Get tax rate for country' })
  async getTaxRate(
    @Param('countryCode') countryCode: string,
    @Query('stateCode') stateCode?: string,
  ) {
    return this.taxService.getTaxRate(countryCode, stateCode);
  }

  @Put('rates/:id')
  @ApiOperation({ summary: 'Update tax rate (Admin only)' })
  async updateTaxRate(@Param('id') id: string, @Body() data: any) {
    return this.taxService.updateTaxRate(id, data);
  }

  @Delete('rates/:id')
  @ApiOperation({ summary: 'Deactivate tax rate (Admin only)' })
  async deactivateTaxRate(@Param('id') id: string) {
    return this.taxService.deactivateTaxRate(id);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed common tax rates (Admin only)' })
  async seedTaxRates() {
    return this.taxService.seedCommonTaxRates();
  }
}
