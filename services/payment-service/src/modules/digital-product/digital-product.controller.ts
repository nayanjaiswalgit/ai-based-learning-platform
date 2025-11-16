import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DigitalProductService } from './digital-product.service';

@ApiTags('digital-products')
@ApiBearerAuth()
@Controller('digital-products')
export class DigitalProductController {
  constructor(private readonly digitalProductService: DigitalProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create digital product' })
  async createProduct(@Body() data: any) {
    return this.digitalProductService.createProduct(data);
  }

  @Post('purchase')
  @ApiOperation({ summary: 'Purchase digital product' })
  async purchaseProduct(
    @Body() data: { userId: string; productId: string; transactionId: string },
  ) {
    return this.digitalProductService.purchaseProduct(
      data.userId,
      data.productId,
      data.transactionId,
    );
  }

  @Post('license/generate')
  @ApiOperation({ summary: 'Generate license key' })
  async generateLicenseKey(@Body() data: { productId: string; userId?: string }) {
    return this.digitalProductService.generateLicenseKey(
      data.productId,
      data.userId,
    );
  }

  @Post('license/activate')
  @ApiOperation({ summary: 'Activate license key' })
  async activateLicenseKey(@Body() data: { key: string; userId: string }) {
    return this.digitalProductService.activateLicenseKey(data.key, data.userId);
  }

  @Get('purchases/:userId')
  @ApiOperation({ summary: 'Get user purchases' })
  async getUserPurchases(@Param('userId') userId: string) {
    return this.digitalProductService.getUserPurchases(userId);
  }

  @Post('download/:purchaseId')
  @ApiOperation({ summary: 'Track download' })
  async trackDownload(@Param('purchaseId') purchaseId: string) {
    return this.digitalProductService.trackDownload(purchaseId);
  }
}
