import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto, userId: string) {
    // Store questions in a flexible JSON structure
    // In production, this would use proper Prisma schema
    return {
      id: this.generateId(),
      ...createQuestionDto,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      timeLimit: createQuestionDto.timeLimit || 60,
      points: createQuestionDto.points || 5,
    };
  }

  async findAll(filters?: {
    difficulty?: string;
    type?: string;
    tags?: string[];
    courseId?: string;
  }) {
    // Mock implementation - in production, use Prisma queries
    return [];
  }

  async findOne(id: string) {
    // Mock implementation
    throw new NotFoundException(`Question with ID ${id} not found`);
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    return {
      id,
      ...updateQuestionDto,
      updatedAt: new Date(),
    };
  }

  async remove(id: string) {
    return { deleted: true, id };
  }

  /**
   * Shuffle answer options to prevent cheating
   */
  shuffleOptions(question: any) {
    const shuffled = { ...question };
    shuffled.options = [...question.options].sort(() => Math.random() - 0.5);
    return shuffled;
  }

  /**
   * Remove correct answers from question (for student view)
   */
  sanitizeQuestion(question: any) {
    const sanitized = { ...question };
    sanitized.options = question.options.map((opt: any) => ({
      text: opt.text,
      // Don't include isCorrect or explanation
    }));
    return sanitized;
  }

  /**
   * Check answer and provide feedback
   */
  checkAnswer(questionId: string, selectedAnswers: string[]) {
    // In production, fetch question from DB and validate
    return {
      isCorrect: true,
      score: 5,
      explanation: 'Correct! Binary search has O(log n) time complexity.',
      correctAnswers: ['Option B'],
    };
  }

  /**
   * Create a question from AI-generated content
   */
  async createFromAIGeneration(
    generatedContent: any,
    labType: 'coding' | 'terminal',
    createdBy?: string,
  ) {
    if (labType === 'coding') {
      return this.createCodingQuestion(generatedContent, createdBy);
    } else {
      return this.createTerminalChallenge(generatedContent, createdBy);
    }
  }

  private async createCodingQuestion(content: any, createdBy?: string) {
    // Extract topics from the content
    const topics = content.topics || [];

    // Create the main question
    const question = await this.prisma.question.create({
      data: {
        questionType: 'coding',
        title: content.title,
        description: content.description,
        difficulty: content.difficulty,
        topics: topics,
        createdBy: createdBy,
        isPublic: true,
        codingQuestion: {
          create: {
            starterCode: content.starterCode || {},
            testCases: content.testCases || [],
            constraints: content.constraints,
            hints: content.hints || [],
            timeLimitSeconds: Math.floor((content.estimatedMinutes || 30) * 60),
            memoryLimitMb: 256,
            allowedLanguages: Object.keys(content.starterCode || {}).length > 0
              ? Object.keys(content.starterCode)
              : ['python', 'javascript', 'java', 'cpp'],
          },
        },
      },
      include: {
        codingQuestion: true,
      },
    });

    return question;
  }

  private async createTerminalChallenge(content: any, createdBy?: string) {
    const question = await this.prisma.question.create({
      data: {
        questionType: 'terminal',
        title: content.title,
        description: content.description,
        difficulty: content.difficulty,
        createdBy: createdBy,
        isPublic: true,
        terminalChallenge: {
          create: {
            scenarioDescription: content.description,
            dockerImage: content.dockerImage || 'ubuntu:22.04',
            setupScript: content.setupScript,
            validationScript: content.validationScript,
            expectedCommands: content.tasks?.map((task: any) => task.hintCommand).filter(Boolean) || [],
            timeLimitMinutes: content.estimatedMinutes || 30,
            hints: content.tasks?.map((task: any) => ({
              title: task.title,
              description: task.description,
              hintCommand: task.hintCommand,
            })) || [],
          },
        },
      },
      include: {
        terminalChallenge: true,
      },
    });

    return question;
  }

  private generateId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
