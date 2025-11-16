import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RefundService } from './refund.service';

@ApiTags('refunds')
@ApiBearerAuth()
@Controller('refunds')
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Post()
  @ApiOperation({ summary: 'Request refund' })
  async requestRefund(@Body() data: any) {
    return this.refundService.requestRefund(data);
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Process refund (Admin only)' })
  async processRefund(
    @Param('id') id: string,
    @Body() data: { processedBy: string },
  ) {
    return this.refundService.processRefund(id, data.processedBy);
  }

  @Get('history/:userId')
  @ApiOperation({ summary: 'Get refund history' })
  async getRefundHistory(@Param('userId') userId: string) {
    return this.refundService.getRefundHistory(userId);
  }
}
