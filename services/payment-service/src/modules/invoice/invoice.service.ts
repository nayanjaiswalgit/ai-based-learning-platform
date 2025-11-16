import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(private prisma: PrismaService) {}

  async createInvoice(data: {
    userId: string;
    amount: number;
    tax?: number;
    currency?: string;
    dueDate: Date;
    items: any[];
    billingAddress?: any;
  }) {
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const total = data.amount + (data.tax || 0);

    const invoice = await this.prisma.invoice.create({
      data: {
        userId: data.userId,
        invoiceNumber,
        amount: data.amount,
        tax: data.tax || 0,
        total,
        currency: data.currency || 'USD',
        status: 'issued',
        dueDate: data.dueDate,
        items: data.items,
        billingAddress: data.billingAddress,
      },
    });

    this.logger.log(`Created invoice: ${invoiceNumber}`);
    return invoice;
  }

  async markAsPaid(invoiceId: string) {
    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'paid',
        paidAt: new Date(),
      },
    });
  }

  async getUserInvoices(userId: string) {
    return this.prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
