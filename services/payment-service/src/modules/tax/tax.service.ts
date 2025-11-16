import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TaxService {
  private readonly logger = new Logger(TaxService.name);

  constructor(private prisma: PrismaService) {}

  async createTaxRate(data: {
    countryCode: string;
    countryName: string;
    stateCode?: string;
    stateName?: string;
    taxType: string;
    taxRate: number;
  }) {
    const taxRate = await this.prisma.taxRate.create({
      data: {
        countryCode: data.countryCode,
        countryName: data.countryName,
        stateCode: data.stateCode,
        stateName: data.stateName,
        taxType: data.taxType,
        taxRate: data.taxRate,
      },
    });

    this.logger.log(`Created tax rate for ${data.countryCode}: ${data.taxRate}%`);
    return taxRate;
  }

  async getTaxRate(countryCode: string, stateCode?: string) {
    const taxRate = await this.prisma.taxRate.findFirst({
      where: {
        countryCode,
        stateCode: stateCode || null,
        isActive: true,
      },
    });

    return taxRate;
  }

  async calculateTax(amount: number, countryCode: string, stateCode?: string) {
    const taxRate = await this.getTaxRate(countryCode, stateCode);

    if (!taxRate) {
      return {
        amount,
        tax: 0,
        taxRate: 0,
        total: amount,
        taxType: null,
      };
    }

    const tax = (amount * taxRate.taxRate.toNumber()) / 100;
    const total = amount + tax;

    return {
      amount,
      tax: Math.round(tax * 100) / 100,
      taxRate: taxRate.taxRate.toNumber(),
      total: Math.round(total * 100) / 100,
      taxType: taxRate.taxType,
      countryCode: taxRate.countryCode,
      stateCode: taxRate.stateCode,
    };
  }

  async getAllTaxRates() {
    return this.prisma.taxRate.findMany({
      where: { isActive: true },
      orderBy: [{ countryCode: 'asc' }, { stateCode: 'asc' }],
    });
  }

  async updateTaxRate(id: string, data: any) {
    return this.prisma.taxRate.update({
      where: { id },
      data,
    });
  }

  async deactivateTaxRate(id: string) {
    return this.prisma.taxRate.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async seedCommonTaxRates() {
    const commonTaxRates = [
      // US States
      { countryCode: 'US', countryName: 'United States', stateCode: 'CA', stateName: 'California', taxType: 'sales_tax', taxRate: 7.25 },
      { countryCode: 'US', countryName: 'United States', stateCode: 'NY', stateName: 'New York', taxType: 'sales_tax', taxRate: 4.0 },
      { countryCode: 'US', countryName: 'United States', stateCode: 'TX', stateName: 'Texas', taxType: 'sales_tax', taxRate: 6.25 },
      { countryCode: 'US', countryName: 'United States', stateCode: 'FL', stateName: 'Florida', taxType: 'sales_tax', taxRate: 6.0 },

      // European VAT
      { countryCode: 'GB', countryName: 'United Kingdom', taxType: 'vat', taxRate: 20.0 },
      { countryCode: 'DE', countryName: 'Germany', taxType: 'vat', taxRate: 19.0 },
      { countryCode: 'FR', countryName: 'France', taxType: 'vat', taxRate: 20.0 },
      { countryCode: 'IT', countryName: 'Italy', taxType: 'vat', taxRate: 22.0 },
      { countryCode: 'ES', countryName: 'Spain', taxType: 'vat', taxRate: 21.0 },
      { countryCode: 'NL', countryName: 'Netherlands', taxType: 'vat', taxRate: 21.0 },

      // Asia
      { countryCode: 'IN', countryName: 'India', taxType: 'gst', taxRate: 18.0 },
      { countryCode: 'SG', countryName: 'Singapore', taxType: 'gst', taxRate: 9.0 },
      { countryCode: 'AU', countryName: 'Australia', taxType: 'gst', taxRate: 10.0 },
      { countryCode: 'CA', countryName: 'Canada', taxType: 'gst', taxRate: 5.0 },
    ];

    const results = [];
    for (const rate of commonTaxRates) {
      try {
        const existing = await this.prisma.taxRate.findFirst({
          where: {
            countryCode: rate.countryCode,
            stateCode: rate.stateCode || null,
          },
        });

        if (!existing) {
          await this.createTaxRate(rate);
          results.push({ ...rate, status: 'created' });
        } else {
          results.push({ ...rate, status: 'exists' });
        }
      } catch (error) {
        this.logger.error(`Error seeding tax rate for ${rate.countryCode}: ${error.message}`);
        results.push({ ...rate, status: 'error', error: error.message });
      }
    }

    this.logger.log(`Seeded ${results.filter(r => r.status === 'created').length} tax rates`);
    return results;
  }
}
