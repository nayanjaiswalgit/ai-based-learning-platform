import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBundleDto } from '../dto/create-bundle.dto';
import slugify from 'slugify';

@Injectable()
export class BundlesService {
  constructor(private prisma: PrismaService) {}

  async create(createBundleDto: CreateBundleDto) {
    const slug = slugify(createBundleDto.title, { lower: true, strict: true });

    const { courseIds, ...bundleData } = createBundleDto;

    // Verify all courses exist
    const courses = await this.prisma.course.findMany({
      where: {
        id: { in: courseIds },
      },
    });

    if (courses.length !== courseIds.length) {
      throw new BadRequestException('One or more courses not found');
    }

    return this.prisma.courseBundle.create({
      data: {
        ...bundleData,
        slug,
        courses: {
          create: courseIds.map((courseId) => ({
            courseId,
          })),
        },
      },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                price: true,
                thumbnailUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(isActive?: boolean) {
    const where = isActive !== undefined ? { isActive } : {};

    return this.prisma.courseBundle.findMany({
      where,
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                price: true,
                thumbnailUrl: true,
                difficultyLevel: true,
              },
            },
          },
        },
        _count: {
          select: {
            courses: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(identifier: string) {
    const bundle = await this.prisma.courseBundle.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier },
        ],
      },
      include: {
        courses: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!bundle) {
      throw new NotFoundException('Bundle not found');
    }

    return bundle;
  }

  async update(id: string, updateData: Partial<CreateBundleDto>) {
    await this.findOne(id);

    const { courseIds, ...bundleData } = updateData;

    const updatePayload: any = { ...bundleData };

    if (courseIds) {
      updatePayload.courses = {
        deleteMany: {},
        create: courseIds.map((courseId) => ({
          courseId,
        })),
      };
    }

    return this.prisma.courseBundle.update({
      where: { id },
      data: updatePayload,
      include: {
        courses: {
          include: {
            course: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.courseBundle.delete({
      where: { id },
    });

    return { message: 'Bundle deleted successfully' };
  }

  /**
   * Calculate total value and savings for a bundle
   */
  async calculateBundleValue(bundleId: string) {
    const bundle = await this.findOne(bundleId);

    const courses = bundle.courses.map((c) => c.course);
    const totalValue = courses.reduce((sum, course) => sum + Number(course.price), 0);
    const discountAmount = (totalValue * Number(bundle.discount)) / 100;
    const finalPrice = Number(bundle.price);
    const savings = totalValue - finalPrice;
    const savingsPercentage = (savings / totalValue) * 100;

    return {
      bundleId,
      bundleTitle: bundle.title,
      coursesIncluded: courses.length,
      totalValue: parseFloat(totalValue.toFixed(2)),
      bundlePrice: parseFloat(finalPrice.toFixed(2)),
      savings: parseFloat(savings.toFixed(2)),
      savingsPercentage: parseFloat(savingsPercentage.toFixed(2)),
    };
  }
}
