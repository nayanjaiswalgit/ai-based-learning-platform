import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLessonDto } from '../dto/create-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async create(createLessonDto: CreateLessonDto) {
    // Verify module exists
    const module = await this.prisma.courseModule.findUnique({
      where: { id: createLessonDto.moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    return this.prisma.lesson.create({
      data: createLessonDto,
      include: {
        module: {
          include: {
            course: true,
          },
        },
        resources: true,
      },
    });
  }

  async findAll(moduleId: string) {
    return this.prisma.lesson.findMany({
      where: { moduleId },
      include: {
        resources: true,
        videoBookmarks: true,
        _count: {
          select: {
            resources: true,
          },
        },
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: true,
          },
        },
        resources: true,
        videoBookmarks: {
          orderBy: {
            timestampSeconds: 'asc',
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async update(id: string, updateData: Partial<CreateLessonDto>) {
    await this.findOne(id);

    return this.prisma.lesson.update({
      where: { id },
      data: updateData,
      include: {
        module: true,
        resources: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.lesson.delete({
      where: { id },
    });

    return { message: 'Lesson deleted successfully' };
  }

  /**
   * Update Mux asset details for a video lesson
   */
  async updateMuxAsset(lessonId: string, muxAssetId: string, muxPlaybackId: string) {
    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        muxAssetId,
        muxPlaybackId,
      },
    });
  }

  /**
   * Add video bookmarks/chapters
   */
  async addBookmark(lessonId: string, title: string, timestampSeconds: number, description?: string) {
    await this.findOne(lessonId);

    return this.prisma.videoBookmark.create({
      data: {
        lessonId,
        title,
        timestampSeconds,
        description,
      },
    });
  }

  /**
   * Get watch progress for a user on a lesson
   */
  async getWatchProgress(userId: string, lessonId: string) {
    return this.prisma.watchProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });
  }

  /**
   * Update watch progress
   */
  async updateWatchProgress(
    userId: string,
    lessonId: string,
    currentTimeSeconds: number,
    totalTimeSeconds: number,
    completed: boolean = false,
  ) {
    return this.prisma.watchProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      create: {
        userId,
        lessonId,
        currentTimeSeconds,
        totalTimeSeconds,
        completed,
        lastWatchedAt: new Date(),
      },
      update: {
        currentTimeSeconds,
        totalTimeSeconds,
        completed,
        lastWatchedAt: new Date(),
      },
    });
  }
}
