import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@learning-platform/database';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CourseGenerationService {
  private readonly logger = new Logger(CourseGenerationService.name);
  private readonly aiServiceUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:3006';
  }

  /**
   * Generate a complete course using AI from a single prompt
   */
  async generateCourse(
    instructorId: string,
    prompt: string,
    options?: {
      difficulty?: string;
      estimatedHours?: number;
      moduleCount?: number;
    },
  ) {
    this.logger.log(`Generating course for instructor ${instructorId}`);

    try {
      // Call AI service to generate course content
      const response = await axios.post(`${this.aiServiceUrl}/api/v1/content-generation/generate-course`, {
        prompt,
        difficulty: options?.difficulty,
        estimatedHours: options?.estimatedHours,
        moduleCount: options?.moduleCount,
      });

      const { content, tokensUsed } = response.data;

      // Create a generation session to store the draft
      const session = await this.prisma.courseGenerationSession.create({
        data: {
          instructorId,
          prompt,
          status: 'review',
          generatedContent: content,
          refinementHistory: {
            generations: [
              {
                timestamp: new Date().toISOString(),
                action: 'initial_generation',
                tokensUsed,
              },
            ],
          },
        },
      });

      this.logger.log(`Created generation session ${session.id}`);

      return {
        sessionId: session.id,
        content,
        status: 'review',
        message: 'Course generated successfully. Review and refine as needed, then publish.',
      };
    } catch (error) {
      this.logger.error('Error generating course:', error);
      throw new BadRequestException(`Failed to generate course: ${error.message}`);
    }
  }

  /**
   * Get a generation session with its content
   */
  async getGenerationSession(sessionId: string, instructorId: string) {
    const session = await this.prisma.courseGenerationSession.findFirst({
      where: {
        id: sessionId,
        instructorId,
      },
    });

    if (!session) {
      throw new NotFoundException('Generation session not found');
    }

    return session;
  }

  /**
   * List all generation sessions for an instructor
   */
  async listGenerationSessions(instructorId: string) {
    const sessions = await this.prisma.courseGenerationSession.findMany({
      where: { instructorId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        prompt: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        publishedCourseId: true,
      },
    });

    return sessions;
  }

  /**
   * Refine a specific section of the generated course
   */
  async refineSection(
    sessionId: string,
    instructorId: string,
    sectionType: string,
    sectionId: string,
    refinementPrompt: string,
  ) {
    const session = await this.getGenerationSession(sessionId, instructorId);

    const content = session.generatedContent as any;

    // Extract the section to refine
    let currentContent;
    let sectionPath = '';

    switch (sectionType) {
      case 'course':
        currentContent = content;
        sectionPath = 'entire course';
        break;
      case 'module':
        const moduleIndex = parseInt(sectionId);
        if (content.modules && content.modules[moduleIndex]) {
          currentContent = content.modules[moduleIndex];
          sectionPath = `modules[${moduleIndex}]`;
        }
        break;
      case 'lesson':
        const [modIdx, lessonIdx] = sectionId.split('-').map(Number);
        if (content.modules?.[modIdx]?.lessons?.[lessonIdx]) {
          currentContent = content.modules[modIdx].lessons[lessonIdx];
          sectionPath = `modules[${modIdx}].lessons[${lessonIdx}]`;
        }
        break;
      case 'quiz':
      case 'coding-question':
      case 'terminal-lab':
        const [mIdx, lIdx] = sectionId.split('-').map(Number);
        const lesson = content.modules?.[mIdx]?.lessons?.[lIdx];
        if (lesson) {
          if (sectionType === 'quiz' && lesson.quiz) {
            currentContent = lesson.quiz;
            sectionPath = `modules[${mIdx}].lessons[${lIdx}].quiz`;
          } else if (sectionType === 'coding-question' && lesson.codingQuestion) {
            currentContent = lesson.codingQuestion;
            sectionPath = `modules[${mIdx}].lessons[${lIdx}].codingQuestion`;
          } else if (sectionType === 'terminal-lab' && lesson.terminalLab) {
            currentContent = lesson.terminalLab;
            sectionPath = `modules[${mIdx}].lessons[${lIdx}].terminalLab`;
          }
        }
        break;
    }

    if (!currentContent) {
      throw new BadRequestException('Section not found or invalid section identifier');
    }

    try {
      // Call AI service to refine content
      const response = await axios.post(`${this.aiServiceUrl}/api/v1/content-generation/refine-content`, {
        sectionType,
        sectionId,
        refinementPrompt,
        currentContent,
      });

      const { content: refinedContent, tokensUsed } = response.data;

      // Update the content in the session
      const updatedContent = this.updateNestedContent(content, sectionPath, refinedContent);

      // Update refinement history
      const history = (session.refinementHistory as any) || { generations: [] };
      history.generations.push({
        timestamp: new Date().toISOString(),
        action: 'refinement',
        sectionType,
        sectionId,
        refinementPrompt,
        tokensUsed,
      });

      // Save updated session
      const updatedSession = await this.prisma.courseGenerationSession.update({
        where: { id: sessionId },
        data: {
          generatedContent: updatedContent,
          refinementHistory: history,
          updatedAt: new Date(),
        },
      });

      return {
        sessionId,
        content: updatedContent,
        refinedSection: refinedContent,
        message: 'Content refined successfully',
      };
    } catch (error) {
      this.logger.error('Error refining content:', error);
      throw new BadRequestException(`Failed to refine content: ${error.message}`);
    }
  }

  /**
   * Publish the generated course to create actual course records
   */
  async publishGeneratedCourse(sessionId: string, instructorId: string) {
    const session = await this.getGenerationSession(sessionId, instructorId);

    if (session.status === 'published') {
      throw new BadRequestException('This course has already been published');
    }

    const content = session.generatedContent as any;

    try {
      // Generate slug from title
      const slug = this.generateSlug(content.title);

      // Create the course
      const course = await this.prisma.course.create({
        data: {
          title: content.title,
          slug,
          description: content.description,
          longDescription: content.longDescription,
          instructorId,
          difficultyLevel: content.difficultyLevel,
          estimatedDurationHours: content.estimatedDurationHours,
          isPublished: false, // Save as draft initially
          language: 'en',
        },
      });

      // Create modules and lessons
      for (const moduleData of content.modules || []) {
        const module = await this.prisma.courseModule.create({
          data: {
            courseId: course.id,
            title: moduleData.title,
            description: moduleData.description,
            orderIndex: moduleData.orderIndex,
          },
        });

        // Create lessons for this module
        for (const lessonData of moduleData.lessons || []) {
          const lesson = await this.prisma.lesson.create({
            data: {
              moduleId: module.id,
              title: lessonData.title,
              contentType: lessonData.contentType,
              contentText: lessonData.contentText,
              durationMinutes: lessonData.durationMinutes,
              orderIndex: lessonData.orderIndex,
            },
          });

          // Create quiz if present
          if (lessonData.quiz && lessonData.quiz.questions) {
            for (const questionData of lessonData.quiz.questions) {
              await this.createQuestion(questionData, instructorId, course.id, lesson.id);
            }
          }

          // Create coding question if present
          if (lessonData.codingQuestion) {
            await this.createQuestion(lessonData.codingQuestion, instructorId, course.id, lesson.id);
          }

          // Create terminal lab if present
          if (lessonData.terminalLab) {
            await this.createQuestion(lessonData.terminalLab, instructorId, course.id, lesson.id);
          }
        }
      }

      // Update session status
      await this.prisma.courseGenerationSession.update({
        where: { id: sessionId },
        data: {
          status: 'published',
          publishedCourseId: course.id,
        },
      });

      this.logger.log(`Published course ${course.id} from session ${sessionId}`);

      return {
        courseId: course.id,
        slug: course.slug,
        message: 'Course published successfully',
      };
    } catch (error) {
      this.logger.error('Error publishing course:', error);
      throw new BadRequestException(`Failed to publish course: ${error.message}`);
    }
  }

  /**
   * Delete a generation session
   */
  async deleteGenerationSession(sessionId: string, instructorId: string) {
    const session = await this.getGenerationSession(sessionId, instructorId);

    if (session.publishedCourseId) {
      throw new BadRequestException('Cannot delete a published generation session');
    }

    await this.prisma.courseGenerationSession.delete({
      where: { id: sessionId },
    });

    return { message: 'Generation session deleted successfully' };
  }

  /**
   * Helper: Update nested content in the generated course object
   */
  private updateNestedContent(content: any, path: string, newValue: any): any {
    if (path === 'entire course') {
      return newValue;
    }

    const clone = JSON.parse(JSON.stringify(content));
    const parts = path.match(/([^\[\]\.]+)|\[(\d+)\]/g);

    if (!parts) return clone;

    let current = clone;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i].replace(/\[|\]/g, '');
      current = current[part];
    }

    const lastPart = parts[parts.length - 1].replace(/\[|\]/g, '');
    current[lastPart] = newValue;

    return clone;
  }

  /**
   * Helper: Create question (MCQ, coding, or terminal challenge)
   */
  private async createQuestion(questionData: any, createdBy: string, courseId: string, lessonId: string) {
    const question = await this.prisma.question.create({
      data: {
        questionType: questionData.questionType,
        title: questionData.title,
        description: questionData.description,
        difficulty: questionData.difficulty,
        topics: questionData.topics || [],
        companyTags: [],
        createdBy,
        isPublic: false,
      },
    });

    // Create type-specific data
    if (questionData.questionType === 'MULTIPLE_CHOICE' && questionData.options) {
      for (let i = 0; i < questionData.options.length; i++) {
        const option = questionData.options[i];
        await this.prisma.mcqOption.create({
          data: {
            questionId: question.id,
            optionText: option.optionText,
            isCorrect: option.isCorrect,
            explanation: option.explanation,
            orderIndex: i,
          },
        });
      }
    } else if (questionData.questionType === 'CODING_QUESTION') {
      await this.prisma.codingQuestion.create({
        data: {
          questionId: question.id,
          starterCode: questionData.starterCode || {},
          testCases: questionData.testCases || [],
          constraints: questionData.constraints,
          hints: questionData.hints || [],
          timeLimitSeconds: 10,
          memoryLimitMb: 256,
          allowedLanguages: ['python', 'javascript', 'java', 'cpp'],
        },
      });
    } else if (questionData.questionType === 'TERMINAL_CHALLENGE') {
      await this.prisma.terminalChallenge.create({
        data: {
          questionId: question.id,
          scenarioDescription: questionData.scenarioDescription,
          dockerImage: 'ubuntu:22.04',
          setupScript: questionData.setupScript,
          validationScript: questionData.validationScript,
          expectedCommands: questionData.expectedCommands || [],
          timeLimitMinutes: questionData.timeLimitMinutes || 30,
          hints: questionData.hints || [],
        },
      });
    }

    return question;
  }

  /**
   * Helper: Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
