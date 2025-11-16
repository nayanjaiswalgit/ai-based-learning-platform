import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create invoice' })
  async createInvoice(@Body() data: any) {
    return this.invoiceService.createInvoice(data);
  }

  @Put(':id/paid')
  @ApiOperation({ summary: 'Mark invoice as paid' })
  async markAsPaid(@Param('id') id: string) {
    return this.invoiceService.markAsPaid(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user invoices' })
  async getUserInvoices(@Param('userId') userId: string) {
    return this.invoiceService.getUserInvoices(userId);
  }
}
