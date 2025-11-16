import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import geoip from 'geoip-lite';

@Injectable()
export class PppService {
  private readonly logger = new Logger(PppService.name);

  // World Bank PPP conversion factors (simplified)
  private readonly pppFactors: Record<string, number> = {
    // Developed countries (minimal discount)
    US: 1.0,
    CA: 0.95,
    GB: 0.92,
    AU: 0.90,
    DE: 0.88,
    FR: 0.88,
    JP: 0.85,
    CH: 0.80,
    SE: 0.85,
    NO: 0.75,

    // Middle income countries (moderate discount)
    BR: 0.50,
    MX: 0.55,
    RU: 0.45,
    CN: 0.60,
    TR: 0.50,
    AR: 0.40,
    ZA: 0.45,
    TH: 0.55,
    MY: 0.60,
    PL: 0.65,

    // Developing countries (higher discount)
    IN: 0.30,
    PK: 0.25,
    BD: 0.20,
    NG: 0.25,
    EG: 0.35,
    ID: 0.40,
    PH: 0.40,
    VN: 0.35,
    KE: 0.30,
    GH: 0.25,

    // Eastern Europe
    UA: 0.35,
    RO: 0.55,
    BG: 0.50,
    RS: 0.45,

    // Latin America
    CO: 0.45,
    PE: 0.45,
    CL: 0.60,
    VE: 0.20,

    // Africa
    MA: 0.40,
    TN: 0.40,
    ET: 0.15,
    TZ: 0.20,

    // Asia Pacific
    LK: 0.30,
    NP: 0.20,
    MM: 0.25,
    KH: 0.25,
  };

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // =====================================================
  // PPP PRICING CALCULATION
  // =====================================================

  calculatePppPrice(basePrice: number, countryCode: string): {
    originalPrice: number;
    pppPrice: number;
    discount: number;
    discountPercentage: number;
    currency: string;
  } {
    const pppEnabled = this.configService.get<string>('PPP_ENABLED') === 'true';
    if (!pppEnabled) {
      return {
        originalPrice: basePrice,
        pppPrice: basePrice,
        discount: 0,
        discountPercentage: 0,
        currency: 'USD',
      };
    }

    const pppFactor = this.pppFactors[countryCode] || 1.0;
    const minDiscount = parseFloat(this.configService.get<string>('PPP_MIN_DISCOUNT') || '0.1');
    const maxDiscount = parseFloat(this.configService.get<string>('PPP_MAX_DISCOUNT') || '0.7');

    // Ensure PPP factor is within bounds
    const adjustedFactor = Math.max(minDiscount, Math.min(maxDiscount, pppFactor));

    const pppPrice = Math.round(basePrice * adjustedFactor * 100) / 100;
    const discount = basePrice - pppPrice;
    const discountPercentage = Math.round(((basePrice - pppPrice) / basePrice) * 100);

    return {
      originalPrice: basePrice,
      pppPrice,
      discount,
      discountPercentage,
      currency: 'USD',
    };
  }

  detectCountryFromIP(ipAddress: string): string | null {
    const geo = geoip.lookup(ipAddress);
    return geo?.country || null;
  }

  getPppForCountry(countryCode: string) {
    return {
      countryCode,
      pppFactor: this.pppFactors[countryCode] || 1.0,
      hasDiscount: (this.pppFactors[countryCode] || 1.0) < 1.0,
    };
  }

  // =====================================================
  // REGIONAL PRICING MANAGEMENT
  // =====================================================

  async createRegionalPricing(data: {
    planId: string;
    countryCode: string;
    countryName: string;
    currency: string;
    priceMonthly: number;
    priceYearly: number;
  }) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: data.planId },
    });

    if (!plan) {
      throw new Error(`Plan not found: ${data.planId}`);
    }

    const discountMonthly = ((plan.priceMonthly.toNumber() - data.priceMonthly) / plan.priceMonthly.toNumber()) * 100;

    return this.prisma.regionalPricing.create({
      data: {
        planId: data.planId,
        countryCode: data.countryCode,
        countryName: data.countryName,
        currency: data.currency,
        priceMonthly: data.priceMonthly,
        priceYearly: data.priceYearly,
        discountPercentage: discountMonthly,
      },
    });
  }

  async getRegionalPricing(planId: string, countryCode: string) {
    return this.prisma.regionalPricing.findFirst({
      where: {
        planId,
        countryCode,
        isActive: true,
      },
      include: {
        plan: true,
      },
    });
  }

  async getAllRegionalPricing(planId: string) {
    return this.prisma.regionalPricing.findMany({
      where: {
        planId,
        isActive: true,
      },
      orderBy: {
        countryCode: 'asc',
      },
    });
  }

  async updateRegionalPricing(id: string, data: any) {
    return this.prisma.regionalPricing.update({
      where: { id },
      data,
    });
  }

  async deleteRegionalPricing(id: string) {
    return this.prisma.regionalPricing.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // =====================================================
  // BULK PPP GENERATION
  // =====================================================

  async generatePppForAllPlans() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
    });

    const results = [];

    for (const plan of plans) {
      for (const [countryCode, factor] of Object.entries(this.pppFactors)) {
        if (factor < 1.0) {
          // Only create for discounted countries
          const countryName = this.getCountryName(countryCode);
          const currency = this.getCurrencyForCountry(countryCode);

          const pppMonthly = Math.round(plan.priceMonthly.toNumber() * factor * 100) / 100;
          const pppYearly = Math.round(plan.priceYearly.toNumber() * factor * 100) / 100;

          try {
            const existing = await this.prisma.regionalPricing.findFirst({
              where: {
                planId: plan.id,
                countryCode,
              },
            });

            if (existing) {
              await this.prisma.regionalPricing.update({
                where: { id: existing.id },
                data: {
                  priceMonthly: pppMonthly,
                  priceYearly: pppYearly,
                  discountPercentage: (1 - factor) * 100,
                },
              });
            } else {
              await this.prisma.regionalPricing.create({
                data: {
                  planId: plan.id,
                  countryCode,
                  countryName,
                  currency,
                  priceMonthly: pppMonthly,
                  priceYearly: pppYearly,
                  discountPercentage: (1 - factor) * 100,
                },
              });
            }

            results.push({ plan: plan.name, countryCode, status: 'success' });
          } catch (error) {
            this.logger.error(`Error creating PPP for ${plan.name} - ${countryCode}: ${error.message}`);
            results.push({ plan: plan.name, countryCode, status: 'error', error: error.message });
          }
        }
      }
    }

    this.logger.log(`Generated PPP pricing for ${results.length} plan-country combinations`);
    return results;
  }

  private getCountryName(countryCode: string): string {
    const countryNames: Record<string, string> = {
      US: 'United States',
      CA: 'Canada',
      GB: 'United Kingdom',
      IN: 'India',
      BR: 'Brazil',
      AU: 'Australia',
      DE: 'Germany',
      FR: 'France',
      JP: 'Japan',
      CN: 'China',
      // Add more as needed
    };

    return countryNames[countryCode] || countryCode;
  }

  private getCurrencyForCountry(countryCode: string): string {
    const currencies: Record<string, string> = {
      US: 'USD',
      CA: 'CAD',
      GB: 'GBP',
      IN: 'INR',
      BR: 'BRL',
      AU: 'AUD',
      DE: 'EUR',
      FR: 'EUR',
      JP: 'JPY',
      CN: 'CNY',
      // Add more as needed
    };

    return currencies[countryCode] || 'USD';
  }
}
