import { Controller, Post, Get, Body, Query, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentGatewayService } from './payment-gateway.service';
import { PaymentGatewayType } from './payment-gateway.interface';

@ApiTags('payment-gateway')
@ApiBearerAuth()
@Controller('payment-gateway')
export class PaymentGatewayController {
  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  @Post('payment')
  @ApiOperation({ summary: 'Create payment (multi-gateway)' })
  async createPayment(
    @Body()
    body: {
      amount: number;
      currency: string;
      userId: string;
      email: string;
      description?: string;
      gateway?: PaymentGatewayType;
      metadata?: Record<string, any>;
    },
    @Ip() ipAddress: string,
  ) {
    return this.paymentGatewayService.createPayment(
      {
        amount: body.amount,
        currency: body.currency,
        userId: body.userId,
        email: body.email,
        description: body.description,
        metadata: body.metadata,
      },
      body.gateway,
      ipAddress,
    );
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify payment' })
  async verifyPayment(
    @Body()
    body: {
      gateway: PaymentGatewayType;
      paymentId: string;
      orderId?: string;
      signature?: string;
    },
  ) {
    return this.paymentGatewayService.verifyPayment(body.gateway, {
      paymentId: body.paymentId,
      orderId: body.orderId,
      signature: body.signature,
    });
  }

  @Post('refund')
  @ApiOperation({ summary: 'Refund payment' })
  async refundPayment(
    @Body()
    body: {
      gateway: PaymentGatewayType;
      paymentId: string;
      amount?: number;
      reason?: string;
    },
  ) {
    return this.paymentGatewayService.refundPayment(body.gateway, {
      paymentId: body.paymentId,
      amount: body.amount,
      reason: body.reason,
    });
  }

  @Get('select')
  @ApiOperation({ summary: 'Get recommended payment gateway for country' })
  async selectGateway(
    @Query('countryCode') countryCode?: string,
    @Ip() ipAddress?: string,
  ) {
    const country = countryCode || this.paymentGatewayService.detectCountryFromIP(ipAddress!);
    const gateway = this.paymentGatewayService.selectGateway(country || undefined);

    return {
      gateway,
      countryCode: country,
      supportedCurrencies: this.paymentGatewayService.getSupportedCurrencies(gateway),
    };
  }

  @Get('currencies')
  @ApiOperation({ summary: 'Get supported currencies for gateway' })
  async getSupportedCurrencies(@Query('gateway') gateway: PaymentGatewayType) {
    return {
      gateway,
      currencies: this.paymentGatewayService.getSupportedCurrencies(gateway),
    };
  }

  @Post('convert-currency')
  @ApiOperation({ summary: 'Convert currency' })
  async convertCurrency(
    @Body()
    body: {
      amount: number;
      from: string;
      to: string;
    },
  ) {
    const converted = await this.paymentGatewayService.convertCurrency(
      body.amount,
      body.from,
      body.to,
    );

    return {
      original: {
        amount: body.amount,
        currency: body.from,
      },
      converted: {
        amount: converted,
        currency: body.to,
      },
    };
  }
}
