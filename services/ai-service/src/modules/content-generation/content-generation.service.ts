import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { OpenAIService } from '../../common/services/openai.service';
import { PrismaService } from '../../common/services/prisma.service';
import {
  GenerateMcqDto,
  GeneratedMcqDto,
  GenerateMcqResponseDto,
  ContentSource,
  QuestionType,
  QuestionDifficulty,
} from './dto/generate-mcq.dto';

@Injectable()
export class ContentGenerationService {
  private readonly logger = new Logger(ContentGenerationService.name);

  constructor(
    private readonly openaiService: OpenAIService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Generate MCQs with AI based on content source
   */
  async generateMcqs(dto: GenerateMcqDto): Promise<GenerateMcqResponseDto> {
    this.logger.log(
      `Generating ${dto.count} ${dto.difficulty} MCQs from ${dto.contentSource}`,
    );

    // Get content context based on source
    const context = await this.getContentContext(dto);

    // Generate MCQs using AI
    const questions = await this.generateMcqsWithAI(
      context.content,
      context.title,
      dto.count,
      dto.difficulty,
      dto.questionType,
      dto.topics,
    );

    // Add source metadata to questions
    const questionsWithMetadata = questions.map((q) => ({
      ...q,
      courseId: context.courseId,
      moduleId: context.moduleId,
      lessonId: context.lessonId,
    }));

    return {
      questions: questionsWithMetadata,
      sourceId: dto.contentId,
      sourceType: dto.contentSource,
      topic: context.title,
      count: questions.length,
    };
  }

  /**
   * Get content context based on source type
   */
  private async getContentContext(dto: GenerateMcqDto): Promise<{
    content: string;
    title: string;
    courseId?: string;
    moduleId?: string;
    lessonId?: string;
  }> {
    switch (dto.contentSource) {
      case ContentSource.LESSON:
        return this.getLessonContext(dto.contentId!);

      case ContentSource.MODULE:
        return this.getModuleContext(dto.contentId!);

      case ContentSource.COURSE:
        return this.getCourseContext(dto.contentId!);

      case ContentSource.CUSTOM_TOPIC:
        if (!dto.customTopic) {
          throw new BadRequestException('Custom topic is required for CUSTOM_TOPIC source');
        }
        return {
          content: dto.additionalContext || dto.customTopic,
          title: dto.customTopic,
        };

      default:
        throw new BadRequestException(`Invalid content source: ${dto.contentSource}`);
    }
  }

  /**
   * Get lesson context for MCQ generation
   */
  private async getLessonContext(lessonId: string): Promise<{
    content: string;
    title: string;
    courseId: string;
    moduleId: string;
    lessonId: string;
  }> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    const content = [
      `Course: ${lesson.module.course.title}`,
      `Course Description: ${lesson.module.course.description || 'N/A'}`,
      `Module: ${lesson.module.title}`,
      `Module Description: ${lesson.module.description || 'N/A'}`,
      `Lesson: ${lesson.title}`,
      `Content Type: ${lesson.contentType}`,
      lesson.contentText ? `Content: ${lesson.contentText}` : '',
      lesson.videoTranscript ? `Video Transcript: ${lesson.videoTranscript}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    return {
      content,
      title: `${lesson.module.course.title} - ${lesson.title}`,
      courseId: lesson.module.course.id,
      moduleId: lesson.module.id,
      lessonId: lesson.id,
    };
  }

  /**
   * Get module context for MCQ generation
   */
  private async getModuleContext(moduleId: string): Promise<{
    content: string;
    title: string;
    courseId: string;
    moduleId: string;
  }> {
    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        lessons: {
          select: {
            title: true,
            contentText: true,
            videoTranscript: true,
            contentType: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    const lessonsContent = module.lessons
      .map((lesson, index) => {
        const parts = [
          `Lesson ${index + 1}: ${lesson.title}`,
          lesson.contentText ? `Content: ${lesson.contentText.substring(0, 500)}...` : '',
          lesson.videoTranscript ? `Transcript: ${lesson.videoTranscript.substring(0, 500)}...` : '',
        ].filter(Boolean);
        return parts.join('\n');
      })
      .join('\n\n');

    const content = [
      `Course: ${module.course.title}`,
      `Course Description: ${module.course.description || 'N/A'}`,
      `Module: ${module.title}`,
      `Module Description: ${module.description || 'N/A'}`,
      `Lessons Overview:\n${lessonsContent}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    return {
      content,
      title: `${module.course.title} - ${module.title}`,
      courseId: module.course.id,
      moduleId: module.id,
    };
  }

  /**
   * Get course context for MCQ generation
   */
  private async getCourseContext(courseId: string): Promise<{
    content: string;
    title: string;
    courseId: string;
  }> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          select: {
            title: true,
            description: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
        skills: {
          include: {
            skill: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const modulesContent = course.modules
      .map((module, index) => `Module ${index + 1}: ${module.title}\n${module.description || ''}`)
      .join('\n\n');

    const skills = course.skills.map((cs) => cs.skill.name).join(', ');

    const content = [
      `Course: ${course.title}`,
      `Description: ${course.description || 'N/A'}`,
      `Long Description: ${course.longDescription || 'N/A'}`,
      `Difficulty Level: ${course.difficultyLevel || 'N/A'}`,
      `Skills: ${skills}`,
      `Modules Overview:\n${modulesContent}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    return {
      content,
      title: course.title,
      courseId: course.id,
    };
  }

  /**
   * Generate MCQs using OpenAI
   */
  private async generateMcqsWithAI(
    contentContext: string,
    topic: string,
    count: number,
    difficulty: QuestionDifficulty,
    questionType: QuestionType,
    topics?: string[],
  ): Promise<GeneratedMcqDto[]> {
    const systemPrompt = `You are an expert educational content creator specializing in creating high-quality multiple-choice questions (MCQs) for online learning platforms.

Your task is to generate ${count} ${difficulty} difficulty ${questionType} questions based on the provided content.

Guidelines:
1. Questions should be clear, unambiguous, and directly related to the content
2. For MULTIPLE_CHOICE: Provide 4 options with exactly ONE correct answer
3. For MULTIPLE_SELECT: Provide 4-6 options with 2-3 correct answers
4. For TRUE_FALSE: Provide 2 options (True/False)
5. Each option should have an explanation of why it's correct or incorrect
6. Include a comprehensive explanation for the correct answer(s)
7. Questions should test understanding, not just memorization
8. Vary the question types and difficulty within the set
9. Use practical examples and real-world scenarios when possible
10. Ensure questions are appropriate for the ${difficulty} difficulty level

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "questionText": "Clear, specific question text",
      "options": [
        {
          "text": "Option text",
          "isCorrect": true/false,
          "explanation": "Why this option is correct/incorrect"
        }
      ],
      "explanation": "Detailed explanation of the correct answer and concept",
      "tags": ["tag1", "tag2"]
    }
  ]
}`;

    const userPrompt = `Generate ${count} ${difficulty} ${questionType} questions based on this content:

TOPIC: ${topic}

CONTENT:
${contentContext}

${topics && topics.length > 0 ? `FOCUS TOPICS: ${topics.join(', ')}` : ''}

Generate ${count} high-quality questions that test understanding of the key concepts in this content.`;

    try {
      const response = await this.openaiService.generateJsonCompletion(
        systemPrompt,
        userPrompt,
        {
          temperature: 0.8,
          maxTokens: 3000,
        },
      );

      // Transform AI response to GeneratedMcqDto format
      const questions: GeneratedMcqDto[] = response.questions.map((q: any, index: number) => ({
        id: `temp-${Date.now()}-${index}`,
        questionText: q.questionText,
        options: q.options,
        difficulty,
        questionType,
        explanation: q.explanation,
        tags: q.tags || [],
      }));

      return questions;
    } catch (error) {
      this.logger.error('Failed to generate MCQs with AI:', error);
      throw new BadRequestException('Failed to generate MCQs. Please try again.');
    }
  }

  /**
   * Legacy method - kept for backward compatibility
   */
  async generateQuiz(topic: string, difficulty: string, count: number) {
    this.logger.log(`Generating ${count} ${difficulty} quiz questions for ${topic}`);

    // Use the new AI-powered method
    const dto: GenerateMcqDto = {
      contentSource: ContentSource.CUSTOM_TOPIC,
      customTopic: topic,
      count,
      difficulty: difficulty.toUpperCase() as QuestionDifficulty,
      questionType: QuestionType.MULTIPLE_CHOICE,
    };

    return this.generateMcqs(dto);
  }

  /**
   * Generate explanation using AI
   */
  async generateExplanation(concept: string, level: string): Promise<{
    concept: string;
    level: string;
    explanation: string;
  }> {
    this.logger.log(`Generating explanation for ${concept} at ${level} level`);

    const systemPrompt = `You are an expert educator who explains complex concepts in a clear, engaging way.
Adapt your explanation to the specified learning level (beginner, intermediate, advanced).`;

    const userPrompt = `Explain the concept of "${concept}" at a ${level} level.

Guidelines:
- Use clear, simple language appropriate for ${level} learners
- Include practical examples and analogies
- Break down complex ideas into digestible parts
- Highlight key takeaways
- Keep the explanation concise (200-400 words)`;

    try {
      const explanation = await this.openaiService.generateTextCompletion(
        systemPrompt,
        userPrompt,
        { temperature: 0.7, maxTokens: 800 },
      );

      return {
        concept,
        level,
        explanation,
      };
    } catch (error) {
      this.logger.error('Failed to generate explanation:', error);
      throw new BadRequestException('Failed to generate explanation. Please try again.');
    }
  }
}
