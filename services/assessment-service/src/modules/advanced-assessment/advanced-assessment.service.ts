import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAdvancedAssessmentDto, AdvancedAssessmentType } from './dto/create-advanced-assessment.dto';

@Injectable()
export class AdvancedAssessmentService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateAdvancedAssessmentDto, userId: string) {
    return {
      id: this.generateId(),
      ...createDto,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async findAll(type?: AdvancedAssessmentType) {
    // Mock implementation
    return [];
  }

  async findOne(id: string) {
    // Mock implementation
    return {
      id,
      title: 'Debug Binary Search',
      type: 'CODE_DEBUGGING',
      codeDebugging: {
        description: 'Find and fix the bug',
        buggyCode: 'def binary_search(arr, target):\n  left = 0\n  right = len(arr)\n  ...',
        language: 'python',
      },
    };
  }

  /**
   * Evaluate fill-in-the-blank answer
   */
  evaluateFillInBlank(assessmentId: string, answer: string) {
    // Mock - compare with accepted answers
    const acceptedAnswers = ['O(n^2)', 'O(n*n)', 'O(n²)'];
    const isCorrect = acceptedAnswers.some((accepted) =>
      answer.toLowerCase() === accepted.toLowerCase()
    );

    return {
      isCorrect,
      score: isCorrect ? 10 : 0,
      feedback: isCorrect
        ? 'Correct! Bubble sort has quadratic time complexity.'
        : 'Incorrect. Think about nested loops.',
      correctAnswers: acceptedAnswers,
    };
  }

  /**
   * Evaluate drag-drop code ordering
   */
  evaluateDragDropCode(assessmentId: string, userOrder: number[]) {
    const correctOrder = [0, 1, 2, 3, 4];

    // Calculate how many are in correct positions
    let correctPositions = 0;
    for (let i = 0; i < userOrder.length; i++) {
      if (userOrder[i] === correctOrder[i]) {
        correctPositions++;
      }
    }

    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
    const partialScore = (correctPositions / correctOrder.length) * 10;

    return {
      isCorrect,
      score: isCorrect ? 10 : partialScore,
      correctPositions,
      totalPositions: correctOrder.length,
      feedback: isCorrect
        ? 'Perfect! Code blocks are in correct order.'
        : `${correctPositions}/${correctOrder.length} blocks are correctly positioned.`,
      correctOrder,
    };
  }

  /**
   * Evaluate code debugging submission
   */
  async evaluateCodeDebugging(assessmentId: string, submittedCode: string, identifiedIssues: string[]) {
    // In production, use AI to compare with expected fix
    // For now, simple keyword matching

    const expectedIssues = ['base case', 'stack overflow'];
    const foundIssues = identifiedIssues.filter((issue) =>
      expectedIssues.some((expected) =>
        issue.toLowerCase().includes(expected.toLowerCase())
      )
    );

    return {
      issuesIdentified: foundIssues.length,
      totalIssues: expectedIssues.length,
      score: (foundIssues.length / expectedIssues.length) * 10,
      feedback: `You identified ${foundIssues.length} out of ${expectedIssues.length} issues.`,
      missingIssues: expectedIssues.filter((exp) =>
        !foundIssues.some((found) => found.toLowerCase().includes(exp.toLowerCase()))
      ),
    };
  }

  /**
   * Evaluate code review comments
   */
  async evaluateCodeReview(assessmentId: string, reviewComments: string[]) {
    // AI-based evaluation in production
    const expectedTopics = ['const/let', 'input validation', 'error handling'];

    const coveredTopics = expectedTopics.filter((topic) =>
      reviewComments.some((comment) =>
        comment.toLowerCase().includes(topic.toLowerCase())
      )
    );

    return {
      topicsCovered: coveredTopics.length,
      totalTopics: expectedTopics.length,
      score: (coveredTopics.length / expectedTopics.length) * 10,
      feedback: 'Good review! Consider also mentioning error handling.',
      suggestions: expectedTopics.filter((t) => !coveredTopics.includes(t)),
    };
  }

  /**
   * Evaluate system design answer (text-based)
   */
  async evaluateSystemDesign(assessmentId: string, designAnswer: string) {
    // AI-based evaluation using GPT-4/Claude
    // Check for required components: database, cache, load balancer, etc.

    const requiredComponents = ['database', 'cache', 'hash function', 'api'];
    const mentionedComponents = requiredComponents.filter((component) =>
      designAnswer.toLowerCase().includes(component)
    );

    return {
      componentsIncluded: mentionedComponents.length,
      totalComponents: requiredComponents.length,
      score: (mentionedComponents.length / requiredComponents.length) * 10,
      feedback: 'Good design! Consider adding discussion about scaling and caching.',
      missingComponents: requiredComponents.filter((c) => !mentionedComponents.includes(c)),
      aiReview: 'Overall solid approach. Database sharding strategy could be improved.',
    };
  }

  private generateId(): string {
    return `adv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
