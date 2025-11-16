import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GeoRestrictionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Set geo restrictions for a course
   */
  async setGeoRestrictions(
    courseId: string,
    allowedCountries?: string[],
    blockedCountries?: string[],
  ) {
    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.prisma.geoRestriction.upsert({
      where: { courseId },
      create: {
        courseId,
        allowedCountries: allowedCountries || undefined,
        blockedCountries: blockedCountries || undefined,
      },
      update: {
        allowedCountries: allowedCountries || undefined,
        blockedCountries: blockedCountries || undefined,
      },
    });
  }

  /**
   * Get geo restrictions for a course
   */
  async getGeoRestrictions(courseId: string) {
    return this.prisma.geoRestriction.findUnique({
      where: { courseId },
    });
  }

  /**
   * Check if user's country is allowed to access the course
   */
  async checkAccess(courseId: string, userCountryCode: string): Promise<boolean> {
    const restrictions = await this.getGeoRestrictions(courseId);

    if (!restrictions) {
      return true; // No restrictions, allow access
    }

    const allowedCountries = restrictions.allowedCountries as string[] | null;
    const blockedCountries = restrictions.blockedCountries as string[] | null;

    // If there's an allowed list, check if country is in it
    if (allowedCountries && allowedCountries.length > 0) {
      if (!allowedCountries.includes(userCountryCode)) {
        throw new ForbiddenException('This course is not available in your country');
      }
    }

    // If country is in blocked list, deny access
    if (blockedCountries && blockedCountries.includes(userCountryCode)) {
      throw new ForbiddenException('This course is blocked in your country');
    }

    return true;
  }

  /**
   * Remove geo restrictions for a course
   */
  async removeGeoRestrictions(courseId: string) {
    const existing = await this.getGeoRestrictions(courseId);

    if (!existing) {
      throw new NotFoundException('No geo restrictions found for this course');
    }

    await this.prisma.geoRestriction.delete({
      where: { courseId },
    });

    return { message: 'Geo restrictions removed successfully' };
  }
}
