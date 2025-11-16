import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data (optional - comment out in production)
  // await prisma.subscriptionPlan.deleteMany();

  // Create Subscription Plans
  console.log('Creating subscription plans...');

  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'free' },
    update: {},
    create: {
      name: 'free',
      displayName: 'Free',
      description: 'Get started with basic features',
      priceMonthly: 0,
      priceYearly: 0,
      currency: 'USD',
      features: {
        courses: 3,
        projects: 1,
        aiFeatures: false,
        prioritySupport: false,
        certificates: false,
        communityAccess: true,
        videoQuality: 'HD',
      },
      maxCourses: 3,
      maxProjects: 1,
      hasAIFeatures: false,
      hasPrioritySupport: false,
      trialDays: 0,
    },
  });

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'pro' },
    update: {},
    create: {
      name: 'pro',
      displayName: 'Pro',
      description: 'Unlock unlimited learning with AI assistance',
      priceMonthly: 29,
      priceYearly: 290,
      currency: 'USD',
      features: {
        courses: -1, // unlimited
        projects: -1, // unlimited
        aiFeatures: true,
        prioritySupport: true,
        certificates: true,
        communityAccess: true,
        videoQuality: 'Full HD',
        aiRoadmaps: true,
        aiChatbot: true,
        codeExecution: true,
        terminalAccess: true,
      },
      maxCourses: null, // unlimited
      maxProjects: null, // unlimited
      hasAIFeatures: true,
      hasPrioritySupport: true,
      trialDays: 7,
    },
  });

  const enterprisePlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'enterprise' },
    update: {},
    create: {
      name: 'enterprise',
      displayName: 'Enterprise',
      description: 'Custom solutions for teams and organizations',
      priceMonthly: 999,
      priceYearly: 9990,
      currency: 'USD',
      features: {
        courses: -1, // unlimited
        projects: -1, // unlimited
        aiFeatures: true,
        prioritySupport: true,
        certificates: true,
        communityAccess: true,
        videoQuality: '4K',
        aiRoadmaps: true,
        aiChatbot: true,
        codeExecution: true,
        terminalAccess: true,
        sso: true,
        customDomain: true,
        whiteLabel: true,
        analytics: true,
        apiAccess: true,
        dedicatedSupport: true,
        teamManagement: true,
      },
      maxCourses: null, // unlimited
      maxProjects: null, // unlimited
      hasAIFeatures: true,
      hasPrioritySupport: true,
      trialDays: 14,
    },
  });

  console.log('✅ Created subscription plans:', {
    free: freePlan.id,
    pro: proPlan.id,
    enterprise: enterprisePlan.id,
  });

  // Create Affiliate Program
  console.log('Creating affiliate program...');

  const affiliateProgram = await prisma.affiliateProgram.upsert({
    where: { name: 'default' },
    update: {},
    create: {
      name: 'default',
      commissionType: 'percentage',
      commissionValue: 10, // 10%
      cookieDuration: 30, // 30 days
      minPayout: 50, // $50 minimum
    },
  });

  console.log('✅ Created affiliate program:', affiliateProgram.id);

  // Create Sample Coupons
  console.log('Creating sample coupons...');

  const welcomeCoupon = await prisma.coupon.upsert({
    where: { code: 'WELCOME25' },
    update: {},
    create: {
      code: 'WELCOME25',
      name: 'Welcome Discount',
      description: '25% off for first-time users',
      discountType: 'percentage',
      discountValue: 25,
      applicableTo: 'all',
      currency: 'USD',
      usageLimit: 1000,
      perUserLimit: 1,
      validFrom: new Date(),
      validUntil: new Date('2025-12-31'),
      isActive: true,
    },
  });

  const blackFridayCoupon = await prisma.coupon.upsert({
    where: { code: 'BLACKFRIDAY50' },
    update: {},
    create: {
      code: 'BLACKFRIDAY50',
      name: 'Black Friday Sale',
      description: '50% off everything',
      discountType: 'percentage',
      discountValue: 50,
      applicableTo: 'all',
      currency: 'USD',
      usageLimit: 5000,
      perUserLimit: 1,
      validFrom: new Date('2025-11-25'),
      validUntil: new Date('2025-11-30'),
      isActive: false, // Inactive until Black Friday
    },
  });

  console.log('✅ Created sample coupons:', {
    welcome: welcomeCoupon.code,
    blackFriday: blackFridayCoupon.code,
  });

  // Create Common Tax Rates
  console.log('Creating common tax rates...');

  const taxRates = [
    // US States
    { countryCode: 'US', countryName: 'United States', stateCode: 'CA', stateName: 'California', taxType: 'sales_tax', taxRate: 7.25 },
    { countryCode: 'US', countryName: 'United States', stateCode: 'NY', stateName: 'New York', taxType: 'sales_tax', taxRate: 4.0 },
    { countryCode: 'US', countryName: 'United States', stateCode: 'TX', stateName: 'Texas', taxType: 'sales_tax', taxRate: 6.25 },

    // EU VAT
    { countryCode: 'GB', countryName: 'United Kingdom', taxType: 'vat', taxRate: 20.0 },
    { countryCode: 'DE', countryName: 'Germany', taxType: 'vat', taxRate: 19.0 },
    { countryCode: 'FR', countryName: 'France', taxType: 'vat', taxRate: 20.0 },

    // Other
    { countryCode: 'IN', countryName: 'India', taxType: 'gst', taxRate: 18.0 },
    { countryCode: 'AU', countryName: 'Australia', taxType: 'gst', taxRate: 10.0 },
    { countryCode: 'CA', countryName: 'Canada', taxType: 'gst', taxRate: 5.0 },
  ];

  let createdTaxRates = 0;
  for (const rate of taxRates) {
    await prisma.taxRate.upsert({
      where: {
        countryCode_stateCode: {
          countryCode: rate.countryCode,
          stateCode: rate.stateCode || null,
        },
      },
      update: {},
      create: rate,
    });
    createdTaxRates++;
  }

  console.log(`✅ Created ${createdTaxRates} tax rates`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
