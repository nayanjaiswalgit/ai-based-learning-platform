import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateModuleDto } from '../dto/create-module.dto';

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  async create(createModuleDto: CreateModuleDto) {
    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: createModuleDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.prisma.courseModule.create({
      data: createModuleDto,
      include: {
        lessons: true,
      },
    });
  }

  async findAll(courseId: string) {
    return this.prisma.courseModule.findMany({
      where: { courseId },
      include: {
        lessons: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
        _count: {
          select: {
            lessons: true,
          },
        },
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const module = await this.prisma.courseModule.findUnique({
      where: { id },
      include: {
        course: true,
        lessons: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    return module;
  }

  async update(id: string, updateData: Partial<CreateModuleDto>) {
    await this.findOne(id);

    return this.prisma.courseModule.update({
      where: { id },
      data: updateData,
      include: {
        lessons: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check if module has lessons
    const lessonsCount = await this.prisma.lesson.count({
      where: { moduleId: id },
    });

    if (lessonsCount > 0) {
      throw new BadRequestException('Cannot delete module with existing lessons. Delete lessons first.');
    }

    await this.prisma.courseModule.delete({
      where: { id },
    });

    return { message: 'Module deleted successfully' };
  }

  /**
   * Reorder modules within a course
   */
  async reorder(courseId: string, moduleOrders: { id: string; orderIndex: number }[]) {
    const updates = moduleOrders.map(({ id, orderIndex }) =>
      this.prisma.courseModule.update({
        where: { id },
        data: { orderIndex },
      })
    );

    await Promise.all(updates);

    return { message: 'Modules reordered successfully' };
  }
}
