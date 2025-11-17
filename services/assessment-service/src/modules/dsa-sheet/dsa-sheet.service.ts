import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProblemDto, ProblemDifficulty, ProblemCategory, ProblemStatus } from './dto/create-problem.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class DsaSheetService {
  private readonly logger = new Logger(DsaSheetService.name);
  private readonly openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async createProblem(createProblemDto: CreateProblemDto, userId: string) {
    return {
      id: this.generateId(),
      ...createProblemDto,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      timeLimit: createProblemDto.timeLimit || 45,
      memoryLimit: createProblemDto.memoryLimit || 256,
    };
  }

  async getAllProblems(filters?: {
    difficulty?: ProblemDifficulty;
    category?: ProblemCategory;
    company?: string;
    status?: ProblemStatus;
  }) {
    const where: any = {
      isPublic: true,
    };

    if (filters?.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters?.category) {
      where.topics = {
        path: '$',
        array_contains: filters.category,
      };
    }

    if (filters?.company) {
      where.companyTags = {
        path: '$',
        array_contains: filters.company,
      };
    }

    const problems = await this.prisma.question.findMany({
      where,
      select: {
        id: true,
        title: true,
        difficulty: true,
        topics: true,
        companyTags: true,
        questionType: true,
        likesCount: true,
        dislikesCount: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    return problems.map(problem => ({
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty || 'MEDIUM',
      categories: Array.isArray(problem.topics) ? problem.topics : [],
      companyTags: Array.isArray(problem.companyTags) ? problem.companyTags : [],
      likesCount: problem.likesCount,
      dislikesCount: problem.dislikesCount,
    }));
  }

  async getProblemById(id: string, userId: string) {
    const problem = await this.prisma.question.findUnique({
      where: { id },
      include: {
        mcqOptions: true,
        codingQuestion: true,
        terminalChallenge: true,
      },
    });

    if (!problem) {
      throw new Error('Problem not found');
    }

    // Get user's submission history for this problem
    const submissions = await this.prisma.userSubmission.findMany({
      where: {
        userId,
        questionId: id,
      },
      orderBy: {
        submittedAt: 'desc',
      },
      take: 10,
    });

    const solvedSubmissions = submissions.filter(s => s.status === 'ACCEPTED');
    const status = solvedSubmissions.length > 0 ? 'SOLVED' :
                   submissions.length > 0 ? 'ATTEMPTED' : 'TODO';

    return {
      id: problem.id,
      title: problem.title,
      description: problem.description || '',
      difficulty: problem.difficulty || 'MEDIUM',
      categories: Array.isArray(problem.topics) ? problem.topics : [],
      companyTags: Array.isArray(problem.companyTags) ? problem.companyTags : [],
      hints: problem.codingQuestion?.hints || problem.terminalChallenge?.hints || [],
      timeLimit: problem.codingQuestion?.timeLimitSeconds || 45,
      memoryLimit: problem.codingQuestion?.memoryLimitMb || 256,
      mcqOptions: problem.mcqOptions || [],
      codingQuestion: problem.codingQuestion || null,
      terminalChallenge: problem.terminalChallenge || null,
      userProgress: {
        status,
        attempts: submissions.length,
        lastAttempted: submissions[0]?.submittedAt || null,
      },
    };
  }

  async updateProgress(problemId: string, userId: string, updateProgressDto: UpdateProgressDto) {
    const now = new Date();
    const progress = {
      userId,
      problemId,
      ...updateProgressDto,
      lastAttempted: now,
      updatedAt: now,
    };

    // Calculate next review date for spaced repetition
    if (updateProgressDto.status === ProblemStatus.MASTERED) {
      progress['nextReviewDate'] = this.calculateNextReviewDate(now, 30);
    } else if (updateProgressDto.status === ProblemStatus.SOLVED) {
      progress['nextReviewDate'] = this.calculateNextReviewDate(now, 7);
    }

    return progress;
  }

  async getUserProgress(userId: string) {
    // Get total problems count
    const totalProblems = await this.prisma.question.count({
      where: { isPublic: true },
    });

    // Get user submissions
    const submissions = await this.prisma.userSubmission.findMany({
      where: { userId },
      include: {
        question: {
          select: {
            difficulty: true,
            topics: true,
          },
        },
      },
    });

    // Get unique question IDs that were attempted and solved
    const attemptedQuestions = new Set(submissions.map(s => s.questionId));
    const solvedQuestions = new Set(
      submissions.filter(s => s.status === 'ACCEPTED').map(s => s.questionId)
    );

    // Calculate stats by difficulty
    const allQuestions = await this.prisma.question.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        difficulty: true,
        topics: true,
      },
    });

    const byDifficulty = {
      easy: { total: 0, solved: 0 },
      medium: { total: 0, solved: 0 },
      hard: { total: 0, solved: 0 },
    };

    const categoryMap = new Map<string, { total: number; solved: number }>();

    allQuestions.forEach(q => {
      const diff = (q.difficulty || 'MEDIUM').toLowerCase();
      if (diff === 'easy' || diff === 'medium' || diff === 'hard') {
        byDifficulty[diff].total++;
        if (solvedQuestions.has(q.id)) {
          byDifficulty[diff].solved++;
        }
      }

      // Count by category
      const topics = Array.isArray(q.topics) ? q.topics : [];
      topics.forEach(topic => {
        if (!categoryMap.has(topic)) {
          categoryMap.set(topic, { total: 0, solved: 0 });
        }
        const cat = categoryMap.get(topic)!;
        cat.total++;
        if (solvedQuestions.has(q.id)) {
          cat.solved++;
        }
      });
    });

    // Convert category map to object
    const byCategory: any = {};
    categoryMap.forEach((value, key) => {
      byCategory[key] = value;
    });

    // Calculate streak (simplified - days with submissions)
    const recentSubmissions = await this.prisma.userSubmission.findMany({
      where: {
        userId,
        submittedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
      select: {
        submittedAt: true,
      },
    });

    const lastPracticedAt = recentSubmissions[0]?.submittedAt || null;

    const stats = {
      totalProblems,
      todo: totalProblems - attemptedQuestions.size,
      attempted: attemptedQuestions.size,
      solved: solvedQuestions.size,
      mastered: 0, // Can be enhanced with confidence tracking
      byDifficulty,
      byCategory,
      streak: this.calculateStreak(recentSubmissions.map(s => s.submittedAt)),
      lastPracticedAt,
    };

    return stats;
  }

  private calculateStreak(dates: Date[]): number {
    if (dates.length === 0) return 0;

    const uniqueDays = new Set(
      dates.map(d => d.toISOString().split('T')[0])
    );
    const sortedDays = Array.from(uniqueDays).sort().reverse();

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDay = new Date(today);

    for (const day of sortedDays) {
      const checkDay = currentDay.toISOString().split('T')[0];
      if (day === checkDay) {
        streak++;
        currentDay.setDate(currentDay.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  async getProblemsForReview(userId: string) {
    // Spaced repetition - problems due for review
    const now = new Date();

    return [
      {
        id: 'p1',
        title: 'Two Sum',
        difficulty: 'EASY',
        lastSolved: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextReviewDate: now,
        reviewCount: 2,
      },
    ];
  }

  async searchProblems(query: string, filters?: any) {
    const where: any = {
      isPublic: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (filters?.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters?.category) {
      where.topics = {
        path: '$',
        array_contains: filters.category,
      };
    }

    const problems = await this.prisma.question.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        topics: true,
        companyTags: true,
      },
      take: 50,
      orderBy: {
        likesCount: 'desc',
      },
    });

    return problems.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      difficulty: p.difficulty,
      categories: Array.isArray(p.topics) ? p.topics : [],
      companyTags: Array.isArray(p.companyTags) ? p.companyTags : [],
    }));
  }

  async getProgressChart(userId: string, period: 'week' | 'month' | 'year') {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all submissions in the period
    const submissions = await this.prisma.userSubmission.findMany({
      where: {
        userId,
        submittedAt: {
          gte: startDate,
        },
        status: 'ACCEPTED', // Only count solved problems
      },
      select: {
        submittedAt: true,
        questionId: true,
        executionTimeMs: true,
      },
      orderBy: {
        submittedAt: 'asc',
      },
    });

    // Group by date
    const dateMap = new Map<string, { problemsSolved: Set<string>; totalTime: number }>();

    submissions.forEach(sub => {
      const dateKey = sub.submittedAt.toISOString().split('T')[0];
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { problemsSolved: new Set(), totalTime: 0 });
      }
      const entry = dateMap.get(dateKey)!;
      entry.problemsSolved.add(sub.questionId);
      entry.totalTime += sub.executionTimeMs || 0;
    });

    // Create data points for all days in range
    const dataPoints = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateKey = date.toISOString().split('T')[0];

      const entry = dateMap.get(dateKey);
      dataPoints.push({
        date: dateKey,
        problemsSolved: entry ? entry.problemsSolved.size : 0,
        totalTime: entry ? Math.round(entry.totalTime / 1000 / 60) : 0, // Convert to minutes
      });
    }

    return dataPoints;
  }

  async getCompanyWiseStats(userId: string) {
    // Get all questions with company tags
    const questions = await this.prisma.question.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        companyTags: true,
      },
    });

    // Get user's solved questions
    const solvedQuestions = await this.prisma.userSubmission.findMany({
      where: {
        userId,
        status: 'ACCEPTED',
      },
      select: {
        questionId: true,
      },
    });

    const solvedSet = new Set(solvedQuestions.map(s => s.questionId));

    // Calculate company-wise stats
    const companyMap = new Map<string, { total: number; solved: number }>();

    questions.forEach(q => {
      const companies = Array.isArray(q.companyTags) ? q.companyTags : [];
      companies.forEach(company => {
        if (!companyMap.has(company)) {
          companyMap.set(company, { total: 0, solved: 0 });
        }
        const stats = companyMap.get(company)!;
        stats.total++;
        if (solvedSet.has(q.id)) {
          stats.solved++;
        }
      });
    });

    // Convert to array and sort by total descending
    const result = Array.from(companyMap.entries())
      .map(([company, stats]) => ({
        company,
        total: stats.total,
        solved: stats.solved,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20); // Top 20 companies

    return result;
  }

  private calculateNextReviewDate(lastReview: Date, daysToAdd: number): Date {
    const nextDate = new Date(lastReview);
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    return nextDate;
  }

  private generateId(): string {
    return `dsa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate DSA sheet with AI based on criteria
   */
  async generateDsaSheet(dto: {
    targetCompany?: string;
    difficulty: string;
    problemCount: number;
    focusTopics?: string[];
    userId: string;
  }) {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    this.logger.log(`Generating DSA sheet with ${dto.problemCount} problems`);

    const prompt = `Generate ${dto.problemCount} DSA (Data Structures and Algorithms) coding problems for ${dto.targetCompany || 'general interview preparation'} at ${dto.difficulty} difficulty level.
${dto.focusTopics ? `Focus on these topics: ${dto.focusTopics.join(', ')}` : ''}

Return a JSON object with a "problems" array containing problem objects with these fields:
- title: string (problem title)
- description: string (detailed problem description with examples)
- difficulty: "EASY" | "MEDIUM" | "HARD"
- category: string (e.g., "Arrays", "Strings", "Trees", "Graphs", etc.)
- hints: string[] (array of 2-3 hints)
- companies: string[] (companies that ask this problem)
- topics: string[] (relevant topics/tags)
- constraints: string (time/space complexity constraints)
- timeLimit: number (seconds)
- memoryLimit: number (MB)

Make the problems realistic, practical, and similar to actual interview questions.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert coding interviewer and problem setter specializing in data structures and algorithms.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      });

      const result = JSON.parse(completion.choices[0].message.content);

      if (!result.problems || !Array.isArray(result.problems)) {
        throw new Error('Invalid response format from AI');
      }

      // Bulk insert into database
      return this.bulkCreateProblems(result.problems, dto.userId);
    } catch (error) {
      this.logger.error('Error generating DSA sheet:', error);
      throw new Error(`Failed to generate DSA sheet: ${error.message}`);
    }
  }

  /**
   * Bulk create problems
   */
  async bulkCreateProblems(problems: any[], userId: string) {
    const createdProblems = [];

    for (const problemData of problems) {
      try {
        // Create the question
        const question = await this.prisma.question.create({
          data: {
            questionType: 'CODING_QUESTION',
            title: problemData.title,
            description: problemData.description,
            difficulty: problemData.difficulty || 'MEDIUM',
            topics: problemData.topics || [problemData.category],
            companyTags: problemData.companies || [],
            createdBy: userId,
            isPublic: true,
          },
        });

        // Create coding question details
        const codingQuestion = await this.prisma.codingQuestion.create({
          data: {
            questionId: question.id,
            starterCode: {
              python: `def solution():\n    # Your code here\n    pass`,
              javascript: `function solution() {\n    // Your code here\n}`,
              java: `public class Solution {\n    public void solution() {\n        // Your code here\n    }\n}`,
              cpp: `class Solution {\npublic:\n    void solution() {\n        // Your code here\n    }\n};`,
            },
            testCases: [],
            constraints: problemData.constraints || 'Standard constraints apply',
            hints: problemData.hints || [],
            timeLimitSeconds: problemData.timeLimit || 10,
            memoryLimitMb: problemData.memoryLimit || 256,
            allowedLanguages: ['python', 'javascript', 'java', 'cpp'],
          },
        });

        createdProblems.push({
          ...question,
          codingQuestion,
        });
      } catch (error) {
        this.logger.error(`Error creating problem: ${problemData.title}`, error);
      }
    }

    return {
      created: createdProblems.length,
      problems: createdProblems,
    };
  }

  /**
   * Update a problem
   */
  async updateProblem(id: string, updates: Partial<any>) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new Error('Problem not found');
    }

    return this.prisma.question.update({
      where: { id },
      data: {
        title: updates.title,
        description: updates.description,
        difficulty: updates.difficulty,
        topics: updates.topics,
        companyTags: updates.companyTags,
        updatedAt: new Date(),
      },
      include: {
        codingQuestion: true,
        mcqOptions: true,
        terminalChallenge: true,
      },
    });
  }

  /**
   * Delete a problem
   */
  async deleteProblem(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new Error('Problem not found');
    }

    // Delete related data first (cascade delete if not configured in Prisma)
    await this.prisma.question.delete({
      where: { id },
    });

    return { message: 'Problem deleted successfully' };
  }
}
