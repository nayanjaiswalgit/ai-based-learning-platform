import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StripeService } from './stripe.service';

@ApiTags('stripe')
@ApiBearerAuth()
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('customer')
  @ApiOperation({ summary: 'Create Stripe customer' })
  async createCustomer(
    @Body() body: { userId: string; email: string; name?: string },
  ) {
    return this.stripeService.createCustomer(body.userId, body.email, body.name);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get Stripe customer' })
  async getCustomer(@Param('customerId') customerId: string) {
    return this.stripeService.getCustomer(customerId);
  }

  @Post('checkout-session')
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  async createCheckoutSession(@Body() body: any) {
    return this.stripeService.createCheckoutSession(body);
  }

  @Get('checkout-session/:sessionId')
  @ApiOperation({ summary: 'Get checkout session' })
  async getCheckoutSession(@Param('sessionId') sessionId: string) {
    return this.stripeService.getCheckoutSession(sessionId);
  }

  @Post('customer-portal')
  @ApiOperation({ summary: 'Create customer portal session' })
  async createPortalSession(
    @Body() body: { customerId: string; returnUrl: string },
  ) {
    return this.stripeService.createCustomerPortalSession(
      body.customerId,
      body.returnUrl,
    );
  }

  @Post('payment-intent')
  @ApiOperation({ summary: 'Create payment intent' })
  async createPaymentIntent(@Body() body: any) {
    return this.stripeService.createPaymentIntent(body);
  }

  @Get('payment-intent/:paymentIntentId')
  @ApiOperation({ summary: 'Get payment intent' })
  async getPaymentIntent(@Param('paymentIntentId') paymentIntentId: string) {
    return this.stripeService.getPaymentIntent(paymentIntentId);
  }

  @Post('refund')
  @ApiOperation({ summary: 'Create refund' })
  async createRefund(@Body() body: any) {
    return this.stripeService.createRefund(body);
  }

  @Get('products')
  @ApiOperation({ summary: 'List Stripe products' })
  async listProducts(@Query() query: any) {
    return this.stripeService.listProducts(query);
  }

  @Get('prices')
  @ApiOperation({ summary: 'List Stripe prices' })
  async listPrices(@Query() query: any) {
    return this.stripeService.listPrices(query);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get Stripe balance' })
  async getBalance() {
    return this.stripeService.getBalance();
  }
}
