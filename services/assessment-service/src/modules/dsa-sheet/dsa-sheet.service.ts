import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProblemDto, ProblemDifficulty, ProblemCategory, ProblemStatus } from './dto/create-problem.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class DsaSheetService {
  constructor(private prisma: PrismaService) {}

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
    // Mock implementation - return sample problems
    return [
      {
        id: 'p1',
        title: 'Two Sum',
        difficulty: 'EASY',
        categories: ['ARRAY', 'HASH_MAP'],
        companyTags: ['Google', 'Meta', 'Amazon'],
        userProgress: {
          status: 'SOLVED',
          attempts: 2,
          lastAttempted: new Date(),
        },
      },
      {
        id: 'p2',
        title: 'Binary Tree Inorder Traversal',
        difficulty: 'MEDIUM',
        categories: ['TREE', 'STACK'],
        companyTags: ['Microsoft', 'Amazon'],
        userProgress: {
          status: 'TODO',
          attempts: 0,
        },
      },
    ];
  }

  async getProblemById(id: string, userId: string) {
    // Mock implementation
    return {
      id,
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target...',
      difficulty: 'EASY',
      categories: ['ARRAY'],
      companyTags: ['Google', 'Meta'],
      hints: '1. Use a hash map\n2. Store complement',
      timeLimit: 45,
      memoryLimit: 256,
      userProgress: {
        status: 'SOLVED',
        attempts: 2,
        personalNotes: 'Used hash map approach',
        confidenceLevel: 90,
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
    // Calculate statistics
    const stats = {
      totalProblems: 450,
      todo: 320,
      attempted: 45,
      solved: 75,
      mastered: 10,
      byDifficulty: {
        easy: { total: 150, solved: 40 },
        medium: { total: 200, solved: 30 },
        hard: { total: 100, solved: 5 },
      },
      byCategory: {
        ARRAY: { total: 60, solved: 15 },
        TREE: { total: 45, solved: 10 },
        GRAPH: { total: 35, solved: 5 },
        DYNAMIC_PROGRAMMING: { total: 50, solved: 8 },
      },
      streak: 15,
      lastPracticedAt: new Date(),
    };

    return stats;
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
    // Full-text search implementation
    return [];
  }

  async getProgressChart(userId: string, period: 'week' | 'month' | 'year') {
    // Return data for visualization
    const dataPoints = [];
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      dataPoints.push({
        date: date.toISOString().split('T')[0],
        problemsSolved: Math.floor(Math.random() * 5),
        totalTime: Math.floor(Math.random() * 180),
      });
    }

    return dataPoints.reverse();
  }

  async getCompanyWiseStats(userId: string) {
    return [
      { company: 'Google', total: 120, solved: 45 },
      { company: 'Meta', total: 95, solved: 30 },
      { company: 'Amazon', total: 110, solved: 40 },
      { company: 'Microsoft', total: 85, solved: 25 },
    ];
  }

  private calculateNextReviewDate(lastReview: Date, daysToAdd: number): Date {
    const nextDate = new Date(lastReview);
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    return nextDate;
  }

  private generateId(): string {
    return `dsa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
