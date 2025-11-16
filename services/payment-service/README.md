# Payment Service

Complete payment and subscription management service for the AI-based Learning Platform.

## Features

### Phase 1: Stripe Integration ✅
- Stripe customer management
- Payment intent creation
- Checkout sessions
- Customer portal
- Webhook handling
- Refund processing

### Phase 2: Subscription Management ✅
- Free, Pro, and Enterprise plans
- Monthly and yearly billing cycles
- 7-day trial period
- Subscription upgrades/downgrades
- Cancellation and resumption
- MRR (Monthly Recurring Revenue) tracking

### Phase 3: Multi-Gateway Support ✅
- **Stripe** (Primary, Global)
- **Razorpay** (India)
- **PayPal** (Global)
- **Paddle** (Europe)
- Automatic gateway selection based on country
- Currency conversion
- 30+ supported currencies

### Phase 4: Purchase Power Parity (PPP) ✅
- Automatic country detection via IP
- Regional pricing for 50+ countries
- 20-70% discounts for developing countries
- Manual pricing overrides
- Bulk PPP generation

### Phase 5: Coupons & Affiliates ✅
- Percentage and fixed amount coupons
- Usage limits (total and per user)
- Minimum purchase requirements
- Expiration dates
- Affiliate program with commission tracking
- Referral tracking
- Automated payouts
- **Gift subscriptions** - Send subscriptions as gifts with custom messages
- Course purchases with coupon support
- Bundle purchases

### Phase 6: Revenue Management ✅
- Instructor revenue sharing (70/30 split)
- Automated monthly payouts
- Revenue analytics
- Payout history
- Invoice generation

### Phase 7: Digital Products ✅
- E-books, templates, resource packs
- License key generation and activation
- Download tracking
- Purchase history

### Additional Features ✅
- **Tax Management** - VAT, GST, Sales Tax support for 50+ countries
- **Course Purchases** - One-time and bundle purchases with full payment flow
- **Gift Subscriptions** - Send gift codes with personalized messages
- **Notification Integration** - Email notifications for all payment events
- **Database Seeding** - Production-ready seed data for plans, coupons, tax rates
- **Docker Support** - Multi-stage production Dockerfile + docker-compose

## API Endpoints

### Subscriptions
- `GET /subscriptions/plans` - Get all subscription plans
- `POST /subscriptions` - Create subscription
- `PUT /subscriptions/:userId/upgrade` - Upgrade subscription
- `PUT /subscriptions/:userId/downgrade` - Downgrade subscription
- `DELETE /subscriptions/:userId/cancel` - Cancel subscription
- `PUT /subscriptions/:userId/resume` - Resume subscription
- `GET /subscriptions/stats` - Get subscription statistics

### Payments
- `POST /payment-gateway/payment` - Create payment (multi-gateway)
- `POST /payment-gateway/verify` - Verify payment
- `POST /payment-gateway/refund` - Refund payment
- `GET /payment-gateway/select` - Get recommended gateway
- `POST /payment-gateway/convert-currency` - Convert currency

### Stripe
- `POST /stripe/customer` - Create Stripe customer
- `POST /stripe/checkout-session` - Create checkout session
- `POST /stripe/customer-portal` - Create customer portal session
- `POST /stripe/payment-intent` - Create payment intent
- `POST /stripe/refund` - Create refund

### Purchase Power Parity
- `GET /ppp/calculate` - Calculate PPP price
- `GET /ppp/country/:countryCode` - Get PPP info for country
- `GET /ppp/detect` - Detect country from IP
- `POST /ppp/regional-pricing` - Create regional pricing
- `POST /ppp/generate-all` - Generate PPP for all plans

### Coupons
- `POST /coupons` - Create coupon
- `POST /coupons/validate` - Validate coupon
- `POST /coupons/apply` - Apply coupon
- `GET /coupons` - Get all coupons
- `GET /coupons/:code` - Get coupon by code

### Affiliates
- `POST /affiliates` - Create affiliate account
- `POST /affiliates/track` - Track affiliate referral
- `GET /affiliates/stats/:userId` - Get affiliate statistics
- `POST /affiliates/payout/:userId` - Request affiliate payout

### Payouts
- `GET /payouts/earnings/:instructorId` - Get instructor earnings
- `POST /payouts/create/:instructorId` - Create payout
- `GET /payouts/history/:instructorId` - Get payout history

### Digital Products
- `POST /digital-products` - Create digital product
- `POST /digital-products/purchase` - Purchase product
- `POST /digital-products/license/generate` - Generate license key
- `POST /digital-products/license/activate` - Activate license key
- `GET /digital-products/purchases/:userId` - Get user purchases

### Course Purchases
- `POST /course-purchases/purchase` - Purchase a course
- `POST /course-purchases/bundle` - Purchase course bundle
- `POST /course-purchases/:transactionId/complete` - Complete purchase
- `GET /course-purchases/user/:userId` - Get user purchases

### Tax
- `POST /tax/rates` - Create tax rate
- `GET /tax/rates` - Get all tax rates
- `GET /tax/calculate` - Calculate tax for amount
- `GET /tax/rate/:countryCode` - Get tax rate for country
- `POST /tax/seed` - Seed common tax rates

### Invoices
- `POST /invoices` - Create invoice
- `PUT /invoices/:id/paid` - Mark invoice as paid
- `GET /invoices/user/:userId` - Get user invoices

### Refunds
- `POST /refunds` - Request refund
- `POST /refunds/:id/process` - Process refund
- `GET /refunds/history/:userId` - Get refund history

## Setup

1. Install dependencies:
```bash
cd services/payment-service
pnpm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run database migrations:
```bash
pnpm db:migrate
pnpm db:generate
pnpm db:seed
```

4. Start the service:
```bash
# Development
pnpm start:dev

# Production
pnpm build
pnpm start:prod
```

## Environment Variables

See `.env.example` for all required environment variables.

### Critical Variables:
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `RAZORPAY_KEY_ID` - Razorpay API key
- `PAYPAL_CLIENT_ID` - PayPal client ID
- `PADDLE_VENDOR_ID` - Paddle vendor ID
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST` - Redis host for caching

## Webhooks

### Stripe Webhooks
Configure the following webhook URL in Stripe Dashboard:
```
POST https://your-domain.com/webhooks/stripe
```

Supported events:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `invoice.paid`
- `invoice.payment_failed`
- `checkout.session.completed`
- `charge.refunded`

## Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## Docker Deployment

### Using Docker Compose (Recommended for Development)
```bash
docker-compose up -d
```

### Production Build
```bash
# Build image
docker build -t payment-service:latest .

# Run container
docker run -p 3003:3003 \
  -e DATABASE_URL=postgresql://... \
  -e STRIPE_SECRET_KEY=... \
  payment-service:latest
```

### Kubernetes Deployment
See `infrastructure/kubernetes/payment-service/` for K8s manifests.

## Architecture

```
payment-service/
├── src/
│   ├── modules/
│   │   ├── stripe/          # Stripe integration
│   │   ├── subscription/    # Subscription management
│   │   ├── payment-gateway/ # Multi-gateway support
│   │   ├── ppp/            # Purchase Power Parity
│   │   ├── coupon/         # Coupon system
│   │   ├── affiliate/      # Affiliate program
│   │   ├── payout/         # Revenue & payouts
│   │   ├── digital-product/# Digital products
│   │   ├── invoice/        # Invoice generation
│   │   └── refund/         # Refund processing
│   ├── database/           # Prisma setup
│   ├── config/             # Configuration
│   └── common/             # Shared utilities
├── prisma/
│   └── schema.prisma       # Database schema
└── test/                   # Tests
```

## Tech Stack

- **Framework**: NestJS 10.4.7
- **Database**: PostgreSQL + Prisma 6.0.1
- **Cache**: Redis + ioredis
- **Queue**: BullMQ
- **Payment Gateways**:
  - Stripe 17.3.1
  - Razorpay 2.9.4
  - PayPal SDK 1.0.3
  - Paddle SDK 1.4.3
- **Validation**: class-validator, zod
- **Documentation**: Swagger/OpenAPI

## Security

- All payment data is encrypted
- PCI-DSS compliant (via payment gateways)
- Webhook signature verification
- Rate limiting on sensitive endpoints
- SQL injection prevention (Prisma)
- XSS protection
- CORS configuration

## Monitoring

- Structured logging with Winston
- Error tracking with Sentry
- Performance monitoring
- Payment success/failure rates
- Revenue metrics

## Support

For issues or questions, please contact the platform team.

## License

Proprietary - AI Learning Platform
