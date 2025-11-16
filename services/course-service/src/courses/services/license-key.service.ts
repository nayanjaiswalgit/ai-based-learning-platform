import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { nanoid } from 'nanoid';

@Injectable()
export class LicenseKeyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a license key for a user and course
   */
  async generateLicenseKey(
    userId: string,
    courseId: string,
    expiresAt?: Date,
    deviceId?: string,
    ipAddress?: string,
  ) {
    // Check if user already has an active license for this course
    const existingLicense = await this.prisma.licenseKey.findFirst({
      where: {
        userId,
        courseId,
        isActive: true,
      },
    });

    if (existingLicense) {
      return existingLicense;
    }

    const licenseKey = `LIC-${nanoid(16)}`;

    return this.prisma.licenseKey.create({
      data: {
        userId,
        courseId,
        licenseKey,
        expiresAt,
        deviceId,
        ipAddress,
      },
    });
  }

  /**
   * Validate a license key
   */
  async validateLicense(licenseKey: string, deviceId?: string, ipAddress?: string) {
    const license = await this.prisma.licenseKey.findUnique({
      where: { licenseKey },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!license) {
      throw new NotFoundException('License key not found');
    }

    if (!license.isActive) {
      throw new BadRequestException('License key is inactive');
    }

    if (license.expiresAt && license.expiresAt < new Date()) {
      throw new BadRequestException('License key has expired');
    }

    // Optional: Device binding
    if (license.deviceId && deviceId && license.deviceId !== deviceId) {
      throw new BadRequestException('License key is bound to a different device');
    }

    // Update last used timestamp
    await this.prisma.licenseKey.update({
      where: { licenseKey },
      data: {
        lastUsedAt: new Date(),
        ...(deviceId && !license.deviceId && { deviceId }),
        ...(ipAddress && { ipAddress }),
      },
    });

    return {
      valid: true,
      userId: license.userId,
      courseId: license.courseId,
      courseTitle: license.course.title,
      expiresAt: license.expiresAt,
    };
  }

  /**
   * Deactivate a license key
   */
  async deactivateLicense(licenseKey: string) {
    return this.prisma.licenseKey.update({
      where: { licenseKey },
      data: { isActive: false },
    });
  }

  /**
   * Get all licenses for a user
   */
  async getUserLicenses(userId: string) {
    return this.prisma.licenseKey.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
