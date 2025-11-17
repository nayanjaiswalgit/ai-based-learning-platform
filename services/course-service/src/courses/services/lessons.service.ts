import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLessonDto } from '../dto/create-lesson.dto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class LessonsService {
  private readonly aiServiceUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:3006';
  }

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

  /**
   * Bulk create lessons for a module
   */
  async bulkCreateLessons(moduleId: string, lessons: any[]) {
    // Verify module exists
    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const createdLessons = [];

    for (const lessonData of lessons) {
      const lesson = await this.prisma.lesson.create({
        data: {
          moduleId,
          title: lessonData.title,
          contentType: lessonData.contentType || 'text',
          contentUrl: lessonData.contentUrl,
          contentText: lessonData.contentText,
          durationMinutes: lessonData.durationMinutes || 0,
          orderIndex: lessonData.orderIndex,
          isFreePreview: lessonData.isFreePreview || false,
          videoTranscript: lessonData.videoTranscript,
        },
        include: {
          module: {
            include: {
              course: true,
            },
          },
        },
      });

      createdLessons.push(lesson);
    }

    return {
      count: createdLessons.length,
      lessons: createdLessons,
    };
  }

  /**
   * Get free preview lessons for a course
   */
  async getFreePreviews(courseId: string) {
    return this.prisma.lesson.findMany({
      where: {
        module: {
          courseId,
        },
        isFreePreview: true,
      },
      include: {
        module: true,
      },
      orderBy: [
        { module: { orderIndex: 'asc' } },
        { orderIndex: 'asc' },
      ],
    });
  }

  /**
   * Toggle free preview status for a lesson
   */
  async toggleFreePreview(lessonId: string) {
    const lesson = await this.findOne(lessonId);

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: { isFreePreview: !lesson.isFreePreview },
      include: {
        module: true,
      },
    });
  }

  /**
   * Generate quiz for a lesson using AI
   */
  async generateQuizForLesson(lessonId: string, count: number = 5) {
    const lesson = await this.findOne(lessonId);

    if (!lesson.contentText && !lesson.videoTranscript) {
      throw new NotFoundException('Lesson must have content text or video transcript to generate quiz');
    }

    try {
      // Call AI service to generate MCQs based on lesson content
      const response = await axios.post(
        `${this.aiServiceUrl}/api/v1/content-generation/mcq/generate`,
        {
          contentSource: 'LESSON',
          contentId: lessonId,
          content: lesson.contentText || lesson.videoTranscript,
          count,
          difficulty: 'MEDIUM',
          questionType: 'MULTIPLE_CHOICE',
          context: {
            courseTitle: lesson.module.course.title,
            moduleTitle: lesson.module.title,
            lessonTitle: lesson.title,
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to generate quiz: ${error.message}`);
    }
  }

  /**
   * Generate coding lab for a lesson using AI
   */
  async generateCodingLabForLesson(lessonId: string, topic: string) {
    const lesson = await this.findOne(lessonId);

    try {
      // Call AI service to generate coding lab
      const response = await axios.post(
        `${this.aiServiceUrl}/api/v1/content-generation/generate-coding-lab`,
        {
          topic,
          difficulty: 'INTERMEDIATE',
          labType: 'coding',
          context: lesson.contentText || lesson.videoTranscript,
          courseTitle: lesson.module.course.title,
          moduleTitle: lesson.module.title,
          lessonTitle: lesson.title,
        },
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to generate coding lab: ${error.message}`);
    }
  }
}
