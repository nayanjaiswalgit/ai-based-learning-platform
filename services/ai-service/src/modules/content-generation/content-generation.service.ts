import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
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
import { GenerateCourseDto, RefineCourseContentDto } from './dto/generate-course.dto';

// Interfaces for Coding Lab Generation
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
  private openai: OpenAI;
  private anthropic: Anthropic;

  constructor(
    private readonly configService: ConfigService,
    private readonly openaiService: OpenAIService,
    private readonly prisma: PrismaService,
  ) {
    // Initialize OpenAI directly for course generation
    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
    } else {
      this.logger.warn('OPENAI_API_KEY not configured. Course generation will be limited.');
    }

    // Initialize Anthropic for coding lab generation
    const anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (anthropicKey) {
      this.anthropic = new Anthropic({ apiKey: anthropicKey });
    } else {
      this.logger.warn('ANTHROPIC_API_KEY not configured. Coding lab generation will be limited.');
    }
  }

  // ==================== COURSE GENERATION (OpenAI Direct) ====================

  async generateCompleteCourse(dto: GenerateCourseDto) {
    this.logger.log('Generating complete course with AI');

    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert course creator and instructional designer.
Generate a comprehensive, well-structured online course based on the user's requirements.

Return a JSON object with the following structure:
{
  "title": "Course Title",
  "description": "Brief course description",
  "longDescription": "Detailed course description",
  "difficultyLevel": "beginner|intermediate|advanced",
  "estimatedDurationHours": 40,
  "learningOutcomes": ["outcome1", "outcome2", ...],
  "prerequisites": ["prerequisite1", ...],
  "targetAudience": ["audience1", ...],
  "modules": [
    {
      "title": "Module Title",
      "description": "Module description",
      "orderIndex": 0,
      "lessons": [
        {
          "title": "Lesson Title",
          "contentType": "VIDEO|ARTICLE|QUIZ|CODING|LAB",
          "contentText": "Markdown content for ARTICLE type",
          "durationMinutes": 15,
          "orderIndex": 0,
          "videoScript": "Script for video lessons (optional)",
          "quiz": {
            "title": "Quiz Title",
            "description": "Quiz description",
            "passingPercentage": 70,
            "questions": [
              {
                "questionType": "MULTIPLE_CHOICE",
                "title": "Question text",
                "description": "Additional context",
                "difficulty": "EASY|MEDIUM|HARD",
                "options": [
                  {
                    "optionText": "Option text",
                    "isCorrect": true|false,
                    "explanation": "Why this is correct/incorrect"
                  }
                ],
                "topics": ["topic1", "topic2"]
              }
            ]
          },
          "codingQuestion": {
            "questionType": "CODING_QUESTION",
            "title": "Problem title",
            "description": "Problem description with examples",
            "difficulty": "EASY|MEDIUM|HARD",
            "starterCode": {
              "python": "def solution():\\n    pass",
              "javascript": "function solution() {\\n    \\n}"
            },
            "testCases": [
              {
                "input": "test input",
                "expectedOutput": "expected output",
                "isHidden": false
              }
            ],
            "hints": ["hint1", "hint2"],
            "constraints": "Constraints text",
            "topics": ["topic1"]
          },
          "terminalLab": {
            "questionType": "TERMINAL_CHALLENGE",
            "title": "Lab title",
            "description": "Lab scenario",
            "scenarioDescription": "Detailed scenario",
            "setupScript": "#!/bin/bash\\n# Setup commands",
            "validationScript": "#!/bin/bash\\n# Validation logic",
            "expectedCommands": ["command1", "command2"],
            "hints": ["hint1"],
            "timeLimitMinutes": 30
          }
        }
      ]
    }
  ]
}

Important guidelines:
1. Create a logical progression from basics to advanced topics
2. Mix content types: articles for theory, videos for demonstrations, quizzes for assessment, coding for practice
3. Include at least one quiz per module for knowledge checks
4. Add coding questions for programming courses
5. Terminal labs are great for DevOps, Linux, networking topics
6. Make content engaging and practical with real-world examples
7. Ensure quiz questions have clear explanations
8. Coding problems should have multiple test cases
9. Video scripts should be detailed and educational`;

    const userPrompt = `Generate a complete course with the following requirements:

${dto.prompt}

Difficulty Level: ${dto.difficulty || 'beginner'}
Estimated Duration: ${dto.estimatedHours || 'auto-determine'} hours
Number of Modules: ${dto.moduleCount || 'auto-determine based on content'}

Make sure to include:
- Multiple content types (articles, quizzes, coding questions, labs where appropriate)
- Clear learning objectives
- Progressive difficulty
- Practical examples and exercises
- Comprehensive assessments`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 16000,
      });

      const generatedContent = JSON.parse(completion.choices[0].message.content);

      this.logger.log(`Successfully generated course: ${generatedContent.title}`);

      return {
        success: true,
        content: generatedContent,
        tokensUsed: completion.usage,
      };
    } catch (error) {
      this.logger.error('Error generating course:', error);
      throw new Error(`Failed to generate course: ${error.message}`);
    }
  }

  async refineContent(dto: RefineCourseContentDto) {
    this.logger.log(`Refining ${dto.sectionType} with ID ${dto.sectionId}`);

    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert course content editor.
Refine the provided course content based on the user's feedback.
Maintain the same JSON structure but improve the content quality.
Return the refined content in the same format as the input.`;

    const userPrompt = `Current content:
${JSON.stringify(dto.currentContent, null, 2)}

Refinement instructions:
${dto.refinementPrompt}

Please refine this ${dto.sectionType} while maintaining the structure.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 8000,
      });

      const refinedContent = JSON.parse(completion.choices[0].message.content);

      return {
        success: true,
        content: refinedContent,
        tokensUsed: completion.usage,
      };
    } catch (error) {
      this.logger.error('Error refining content:', error);
      throw new Error(`Failed to refine content: ${error.message}`);
    }
  }

  // ==================== MCQ GENERATION (OpenAI Service Wrapper + Prisma) ====================

  async generateMcqs(dto: GenerateMcqDto): Promise<GenerateMcqResponseDto> {
    this.logger.log(`Generating ${dto.count} MCQs from ${dto.contentSource}`);

    // Get content context based on source
    const context = await this.getContentContext(dto);

    // Generate MCQs with AI
    const questions = await this.generateMcqsWithAI(
      context.topic,
      context.content,
      dto.count,
      dto.difficulty,
      dto.questionType,
      dto.topics,
      dto.additionalContext,
    );

    // Map to response format
    const generatedQuestions: GeneratedMcqDto[] = questions.map((q, index) => ({
      id: `temp-${Date.now()}-${index}`,
      questionText: q.questionText,
      options: q.options,
      difficulty: dto.difficulty,
      questionType: dto.questionType,
      explanation: q.explanation,
      tags: q.tags || dto.topics || [context.topic],
      courseId: context.courseId,
      moduleId: context.moduleId,
      lessonId: context.lessonId,
    }));

    return {
      questions: generatedQuestions,
      sourceId: dto.contentId,
      sourceType: dto.contentSource,
      topic: context.topic,
      count: generatedQuestions.length,
    };
  }

  private async getContentContext(dto: GenerateMcqDto): Promise<{
    topic: string;
    content: string;
    courseId?: string;
    moduleId?: string;
    lessonId?: string;
  }> {
    switch (dto.contentSource) {
      case ContentSource.LESSON:
        if (!dto.contentId) {
          throw new BadRequestException('contentId is required for LESSON source');
        }
        return await this.getLessonContext(dto.contentId);

      case ContentSource.MODULE:
        if (!dto.contentId) {
          throw new BadRequestException('contentId is required for MODULE source');
        }
        return await this.getModuleContext(dto.contentId);

      case ContentSource.COURSE:
        if (!dto.contentId) {
          throw new BadRequestException('contentId is required for COURSE source');
        }
        return await this.getCourseContext(dto.contentId);

      case ContentSource.CUSTOM_TOPIC:
        if (!dto.customTopic) {
          throw new BadRequestException('customTopic is required for CUSTOM_TOPIC source');
        }
        return {
          topic: dto.customTopic,
          content: dto.additionalContext || dto.customTopic,
        };

      default:
        throw new BadRequestException(`Invalid content source: ${dto.contentSource}`);
    }
  }

  private async getLessonContext(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    return {
      topic: lesson.title,
      content: lesson.contentText || lesson.title,
      lessonId: lesson.id,
      moduleId: lesson.moduleId,
      courseId: lesson.module.courseId,
    };
  }

  private async getModuleContext(moduleId: string) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        lessons: {
          select: {
            title: true,
            contentText: true,
          },
        },
        course: true,
      },
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    // Combine all lesson content
    const lessonsContent = module.lessons
      .map((l) => `${l.title}: ${l.contentText || ''}`)
      .join('\n\n');

    return {
      topic: module.title,
      content: `${module.description || ''}\n\n${lessonsContent}`,
      moduleId: module.id,
      courseId: module.courseId,
    };
  }

  private async getCourseContext(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                title: true,
                contentText: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Combine all module and lesson content
    const modulesContent = course.modules
      .map((m) => {
        const lessonsText = m.lessons.map((l) => `- ${l.title}`).join('\n');
        return `Module: ${m.title}\n${m.description || ''}\nLessons:\n${lessonsText}`;
      })
      .join('\n\n');

    return {
      topic: course.title,
      content: `${course.description || ''}\n\n${modulesContent}`,
      courseId: course.id,
    };
  }

  private async generateMcqsWithAI(
    topic: string,
    content: string,
    count: number,
    difficulty: QuestionDifficulty,
    questionType: QuestionType,
    topics?: string[],
    additionalContext?: string,
  ) {
    const systemPrompt = `You are an expert educator and assessment designer.
Generate ${count} high-quality ${questionType} questions based on the provided content.

Requirements:
- Difficulty level: ${difficulty}
- Question type: ${questionType}
- Each question must have 4 options (for MULTIPLE_CHOICE) or 2-6 options (for MULTIPLE_SELECT)
- For TRUE_FALSE, provide exactly 2 options
- Include detailed explanations for each option
- Questions should test understanding, not just memorization
- Ensure questions are clear and unambiguous

Return a JSON object with this structure:
{
  "questions": [
    {
      "questionText": "The question text",
      "options": [
        {
          "text": "Option text",
          "isCorrect": true|false,
          "explanation": "Why this option is correct/incorrect"
        }
      ],
      "explanation": "Overall explanation of the concept",
      "tags": ["tag1", "tag2"]
    }
  ]
}`;

    const userPrompt = `Topic: ${topic}

Content to base questions on:
${content}

${additionalContext ? `Additional context: ${additionalContext}` : ''}
${topics && topics.length > 0 ? `Focus on these topics: ${topics.join(', ')}` : ''}

Generate ${count} ${difficulty} level ${questionType} questions.`;

    try {
      const result = await this.openaiService.generateJsonCompletion(systemPrompt, userPrompt, {
        maxTokens: 3000,
        temperature: 0.8,
      });

      return result.questions || [];
    } catch (error) {
      this.logger.error('Error generating MCQs with AI:', error);
      throw new Error(`Failed to generate MCQs: ${error.message}`);
    }
  }

  // ==================== CODING LAB GENERATION (Anthropic) ====================

  async generateCodingLab(
    options: CodingLabGenerationOptions,
  ): Promise<GeneratedCodingLab | GeneratedTerminalLab> {
    this.logger.log(
      `Generating ${options.labType} lab for topic: ${options.topic} at ${options.difficulty} level`,
    );

    if (!this.anthropic) {
      throw new Error('Anthropic API key not configured');
    }

    if (options.labType === 'coding') {
      return this.generateCodingQuestion(options);
    } else {
      return this.generateTerminalChallenge(options);
    }
  }

  private async generateCodingQuestion(
    options: CodingLabGenerationOptions,
  ): Promise<GeneratedCodingLab> {
    const contextInfo = options.context
      ? `\n\nAdditional Context: ${options.context}`
      : '';
    const courseInfo = options.courseTitle
      ? `\n\nThis lab is for the course: "${options.courseTitle}"${options.moduleTitle ? ` in module: "${options.moduleTitle}"` : ''}`
      : '';

    const prompt = `You are an expert coding instructor. Generate a coding challenge about "${options.topic}" at ${options.difficulty} difficulty level.${contextInfo}${courseInfo}

Create a comprehensive coding problem with the following structure:

1. **Title**: A concise, descriptive title
2. **Description**: Clear problem statement with examples
3. **Difficulty**: ${options.difficulty}
4. **Estimated Time**: Time in minutes to complete
5. **Starter Code**: Provide starter code in Python, JavaScript, Java, and C++
6. **Test Cases**: At least 5 test cases (mix of visible and hidden)
7. **Hints**: 2-3 progressive hints
8. **Constraints**: Time and space complexity expectations

Return a JSON object with this exact structure:
{
  "title": "Problem Title",
  "description": "Detailed problem description with examples and edge cases",
  "difficulty": "${options.difficulty}",
  "estimatedMinutes": 30,
  "starterCode": {
    "python": "def solution():\\n    pass",
    "javascript": "function solution() {\\n  \\n}",
    "java": "class Solution {\\n  public void solution() {\\n    \\n  }\\n}",
    "cpp": "class Solution {\\npublic:\\n  void solution() {\\n    \\n  }\\n};"
  },
  "testCases": [
    {
      "input": "test input",
      "expectedOutput": "expected output",
      "explanation": "why this test case is important",
      "isHidden": false
    }
  ],
  "hints": ["hint 1", "hint 2"],
  "constraints": "Time: O(?), Space: O(?)"
}

Make the problem realistic, educational, and appropriate for ${options.difficulty} level.`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Extract JSON from the response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from Claude response');
      }

      const result = JSON.parse(jsonMatch[0]);
      this.logger.log(`Successfully generated coding lab: ${result.title}`);

      return result;
    } catch (error) {
      this.logger.error('Error generating coding question with Claude:', error);
      throw new Error(`Failed to generate coding question: ${error.message}`);
    }
  }

  private async generateTerminalChallenge(
    options: CodingLabGenerationOptions,
  ): Promise<GeneratedTerminalLab> {
    const contextInfo = options.context
      ? `\n\nAdditional Context: ${options.context}`
      : '';
    const courseInfo = options.courseTitle
      ? `\n\nThis lab is for the course: "${options.courseTitle}"${options.moduleTitle ? ` in module: "${options.moduleTitle}"` : ''}`
      : '';

    const prompt = `You are an expert DevOps and systems instructor. Generate a terminal/command-line lab about "${options.topic}" at ${options.difficulty} difficulty level.${contextInfo}${courseInfo}

Create a comprehensive terminal challenge with the following structure:

1. **Title**: A concise, descriptive title
2. **Description**: Clear lab scenario and objectives
3. **Difficulty**: ${options.difficulty}
4. **Estimated Time**: Time in minutes to complete
5. **Scenario**: The context/environment (e.g., "linux", "docker", "kubernetes")
6. **Docker Image**: Base image to use (e.g., "ubuntu:22.04", "node:18")
7. **Setup Script**: Optional bash script to set up the environment
8. **Validation Script**: Bash script to validate completion
9. **Tasks**: Step-by-step tasks the student must complete

Return a JSON object with this exact structure:
{
  "title": "Lab Title",
  "description": "Detailed lab description and learning objectives",
  "difficulty": "${options.difficulty}",
  "estimatedMinutes": 45,
  "scenario": "linux",
  "dockerImage": "ubuntu:22.04",
  "setupScript": "#!/bin/bash\\n# Setup commands here",
  "validationScript": "#!/bin/bash\\n# Validation logic here\\nif [ -f /expected/file ]; then\\n  echo 'PASS'\\nelse\\n  echo 'FAIL'\\nfi",
  "tasks": [
    {
      "title": "Task 1 Title",
      "description": "What the student needs to do",
      "order": 1,
      "hintCommand": "Optional command hint",
      "validationString": "String to check in validation"
    }
  ]
}

Make the lab realistic, hands-on, and appropriate for ${options.difficulty} level.
Ensure validation script is robust and checks for actual completion.`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Extract JSON from the response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from Claude response');
      }

      const result = JSON.parse(jsonMatch[0]);
      this.logger.log(`Successfully generated terminal lab: ${result.title}`);

      return result;
    } catch (error) {
      this.logger.error('Error generating terminal challenge with Claude:', error);
      throw new Error(`Failed to generate terminal challenge: ${error.message}`);
    }
  }

  // ==================== LEGACY/UTILITY METHODS ====================

  async generateQuiz(topic: string, difficulty: string, count: number) {
    this.logger.log(`Generating ${count} ${difficulty} quiz questions for ${topic}`);

    // Use the new MCQ generation approach via OpenAI Service
    const systemPrompt = `You are an expert educator. Generate ${count} multiple choice quiz questions about "${topic}" at ${difficulty} difficulty level.

Return a JSON object with this structure:
{
  "questions": [
    {
      "questionText": "Question text here?",
      "options": [
        {"text": "Option A", "isCorrect": false, "explanation": "Why this is wrong"},
        {"text": "Option B", "isCorrect": true, "explanation": "Why this is correct"}
      ],
      "explanation": "Overall concept explanation",
      "tags": ["${topic}"]
    }
  ]
}

Make questions clear, educational, and test understanding rather than memorization.`;

    const userPrompt = `Generate ${count} ${difficulty} level quiz questions about: ${topic}`;

    try {
      const result = await this.openaiService.generateJsonCompletion(
        systemPrompt,
        userPrompt,
        {
          maxTokens: 2000,
          temperature: 0.7,
        },
      );

      return {
        topic,
        difficulty,
        questions: result.questions || [],
      };
    } catch (error) {
      this.logger.error('Error generating quiz:', error);
      throw new Error(`Failed to generate quiz: ${error.message}`);
    }
  }

  async generateExplanation(concept: string, level: string) {
    this.logger.log(`Generating explanation for ${concept} at ${level} level`);

    const systemPrompt = `You are an expert educator. Explain concepts clearly and thoroughly at the ${level} level.
Provide explanations that are:
- Clear and easy to understand
- Appropriate for ${level} level students
- Include examples where helpful
- Use analogies when appropriate`;

    const userPrompt = `Explain the following concept: ${concept}`;

    try {
      const explanation = await this.openaiService.generateTextCompletion(
        systemPrompt,
        userPrompt,
        {
          maxTokens: 1000,
          temperature: 0.7,
        },
      );

      return {
        concept,
        level,
        explanation,
      };
    } catch (error) {
      this.logger.error('Error generating explanation:', error);
      throw new Error(`Failed to generate explanation: ${error.message}`);
    }
  }
}
