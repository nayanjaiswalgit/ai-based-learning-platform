import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
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

interface CodingLabGenerationOptions {
  topic: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  labType: 'coding' | 'terminal';
  context?: string;
  courseTitle?: string;
  moduleTitle?: string;
}

interface GeneratedCodingLab {
  title: string;
  description: string;
  difficulty: string;
  estimatedMinutes: number;
  starterCode?: Record<string, string>;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    explanation: string;
    isHidden: boolean;
  }>;
  hints?: string[];
  constraints?: string;
}

interface GeneratedTerminalLab {
  title: string;
  description: string;
  difficulty: string;
  estimatedMinutes: number;
  scenario: string;
  dockerImage: string;
  setupScript?: string;
  validationScript: string;
  tasks: Array<{
    title: string;
    description: string;
    order: number;
    hintCommand?: string;
    validationString: string;
  }>;
}

@Injectable()
export class ContentGenerationService {
  private readonly logger = new Logger(ContentGenerationService.name);
  private readonly anthropic: Anthropic;

  constructor(
    private readonly configService: ConfigService,
    private readonly openaiService: OpenAIService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (apiKey) {
      this.anthropic = new Anthropic({ apiKey });
    } else {
      this.logger.warn('ANTHROPIC_API_KEY not configured. AI generation features will be disabled.');
    }
  }

  /**
   * Generate coding lab or terminal challenge using Anthropic AI
   */
  async generateCodingLab(options: CodingLabGenerationOptions): Promise<GeneratedCodingLab | GeneratedTerminalLab> {
    if (!this.anthropic) {
      throw new Error('AI service not configured. Please set ANTHROPIC_API_KEY environment variable.');
    }

    this.logger.log(`Generating ${options.labType} lab for topic: ${options.topic}`);

    if (options.labType === 'coding') {
      return this.generateCodingQuestion(options);
    } else {
      return this.generateTerminalChallenge(options);
    }
  }

  /**
   * Generate coding question with test cases
   */
  private async generateCodingQuestion(options: CodingLabGenerationOptions): Promise<GeneratedCodingLab> {
    const contextInfo = options.context
      ? `\n\nAdditional Context:\n${options.context}`
      : '';

    const courseInfo = options.courseTitle
      ? `\n\nCourse: ${options.courseTitle}${options.moduleTitle ? `, Module: ${options.moduleTitle}` : ''}`
      : '';

    const prompt = `Generate a coding challenge for an online learning platform with the following specifications:

Topic: ${options.topic}
Difficulty: ${options.difficulty}${courseInfo}${contextInfo}

Please generate a complete coding challenge in JSON format with the following structure:
{
  "title": "Brief, engaging title for the problem",
  "description": "Detailed problem description with examples (use markdown formatting)",
  "difficulty": "${options.difficulty}",
  "estimatedMinutes": <number between 15-60>,
  "starterCode": {
    "python": "# Python starter code",
    "javascript": "// JavaScript starter code",
    "java": "// Java starter code",
    "cpp": "// C++ starter code"
  },
  "testCases": [
    {
      "input": "sample input",
      "expectedOutput": "expected output",
      "explanation": "why this is the expected output",
      "isHidden": false
    },
    // Include at least 3 visible test cases and 2 hidden test cases
  ],
  "hints": [
    "First hint",
    "Second hint",
    "Third hint if needed"
  ],
  "constraints": "Time and space complexity requirements, input constraints"
}

Make the problem:
- Relevant to ${options.topic}
- Appropriate for ${options.difficulty} level
- Educational and engaging
- Include clear examples in the description
- Provide helpful hints
- Have comprehensive test cases

Return ONLY valid JSON, no additional text or markdown formatting.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Parse the JSON response
      const generatedLab = JSON.parse(content.text);

      this.logger.log(`Successfully generated coding lab: ${generatedLab.title}`);
      return generatedLab;
    } catch (error) {
      this.logger.error(`Error generating coding lab: ${error.message}`, error.stack);
      throw new Error(`Failed to generate coding lab: ${error.message}`);
    }
  }

  /**
   * Generate terminal challenge with validation scripts
   */
  private async generateTerminalChallenge(options: CodingLabGenerationOptions): Promise<GeneratedTerminalLab> {
    const contextInfo = options.context
      ? `\n\nAdditional Context:\n${options.context}`
      : '';

    const courseInfo = options.courseTitle
      ? `\n\nCourse: ${options.courseTitle}${options.moduleTitle ? `, Module: ${options.moduleTitle}` : ''}`
      : '';

    const prompt = `Generate a terminal/command-line challenge for an online learning platform with the following specifications:

Topic: ${options.topic}
Difficulty: ${options.difficulty}${courseInfo}${contextInfo}

Please generate a complete terminal challenge in JSON format with the following structure:
{
  "title": "Brief, engaging title for the lab",
  "description": "Detailed scenario description explaining what the student will learn and do",
  "difficulty": "${options.difficulty}",
  "estimatedMinutes": <number between 20-90>,
  "scenario": "<docker|kubernetes|linux|git|aws|nginx|python|node>",
  "dockerImage": "appropriate docker image (e.g., ubuntu:22.04, node:18, python:3.11)",
  "setupScript": "#!/bin/bash\\n# Commands to set up the environment before student starts",
  "validationScript": "#!/bin/bash\\n# Script to validate all tasks are completed",
  "tasks": [
    {
      "title": "Task name",
      "description": "What the student needs to do",
      "order": 1,
      "hintCommand": "example command to help",
      "validationString": "string to look for in output or file to verify completion"
    }
    // Include 4-8 progressive tasks
  ]
}

Make the challenge:
- Relevant to ${options.topic}
- Appropriate for ${options.difficulty} level (BEGINNER: basic commands, INTERMEDIATE: combining concepts, ADVANCED: complex scenarios)
- Hands-on and practical
- Include progressive tasks that build on each other
- Provide helpful hint commands
- Include realistic validation checks

Return ONLY valid JSON, no additional text or markdown formatting.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Parse the JSON response
      const generatedLab = JSON.parse(content.text);

      this.logger.log(`Successfully generated terminal lab: ${generatedLab.title}`);
      return generatedLab;
    } catch (error) {
      this.logger.error(`Error generating terminal lab: ${error.message}`, error.stack);
      throw new Error(`Failed to generate terminal lab: ${error.message}`);
    }
  }

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
