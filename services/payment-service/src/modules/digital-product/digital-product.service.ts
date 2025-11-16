import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { nanoid } from 'nanoid';

@Injectable()
export class DigitalProductService {
  private readonly logger = new Logger(DigitalProductService.name);

  constructor(private prisma: PrismaService) {}

  async createProduct(data: {
    creatorId: string;
    title: string;
    slug: string;
    description?: string;
    productType: string;
    price: number;
    currency?: string;
    fileUrl?: string;
    coverImageUrl?: string;
    licenseType: string;
    downloadLimit?: number;
  }) {
    const product = await this.prisma.digitalProduct.create({
      data: {
        creatorId: data.creatorId,
        title: data.title,
        slug: data.slug,
        description: data.description,
        productType: data.productType,
        price: data.price,
        currency: data.currency || 'USD',
        fileUrl: data.fileUrl,
        coverImageUrl: data.coverImageUrl,
        licenseType: data.licenseType,
        downloadLimit: data.downloadLimit,
      },
    });

    this.logger.log(`Created digital product: ${product.id}`);
    return product;
  }

  async purchaseProduct(userId: string, productId: string, transactionId: string) {
    const product = await this.prisma.digitalProduct.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      throw new BadRequestException('Product not found or inactive');
    }

    const purchase = await this.prisma.digitalProductPurchase.create({
      data: {
        userId,
        productId,
        amount: product.price,
        currency: product.currency,
        transactionId,
      },
    });

    await this.prisma.digitalProduct.update({
      where: { id: productId },
      data: { salesCount: { increment: 1 } },
    });

    if (product.licenseType !== 'unlimited') {
      const licenseKey = await this.generateLicenseKey(productId, userId);
      await this.prisma.digitalProductPurchase.update({
        where: { id: purchase.id },
        data: { licenseKeyId: licenseKey.id },
      });
    }

    this.logger.log(`User ${userId} purchased product ${productId}`);
    return purchase;
  }

  async generateLicenseKey(productId: string, userId?: string) {
    const key = `${nanoid(8).toUpperCase()}-${nanoid(8).toUpperCase()}-${nanoid(8).toUpperCase()}`;

    const licenseKey = await this.prisma.licenseKey.create({
      data: {
        productId,
        key,
        userId,
        activatedAt: userId ? new Date() : null,
        activationCount: userId ? 1 : 0,
      },
    });

    this.logger.log(`Generated license key for product ${productId}`);
    return licenseKey;
  }

  async activateLicenseKey(key: string, userId: string) {
    const licenseKey = await this.prisma.licenseKey.findUnique({
      where: { key },
      include: { product: true },
    });

    if (!licenseKey || !licenseKey.isActive) {
      throw new BadRequestException('Invalid or inactive license key');
    }

    if (licenseKey.userId && licenseKey.userId !== userId) {
      throw new BadRequestException('License key already activated by another user');
    }

    if (licenseKey.activationCount >= licenseKey.maxActivations) {
      throw new BadRequestException('License key activation limit reached');
    }

    await this.prisma.licenseKey.update({
      where: { id: licenseKey.id },
      data: {
        userId,
        activatedAt: new Date(),
        activationCount: { increment: 1 },
      },
    });

    this.logger.log(`License key ${key} activated by user ${userId}`);
    return licenseKey;
  }

  async getUserPurchases(userId: string) {
    return this.prisma.digitalProductPurchase.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async trackDownload(purchaseId: string) {
    await this.prisma.digitalProductPurchase.update({
      where: { id: purchaseId },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadedAt: new Date(),
      },
    });
  }
}
