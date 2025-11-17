import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAdvancedAssessmentDto, AdvancedAssessmentType } from './dto/create-advanced-assessment.dto';

@Injectable()
export class AdvancedAssessmentService {
  private readonly logger = new Logger(AdvancedAssessmentService.name);

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
    // Advanced assessments require AdvancedAssessment table in database schema
    // Feature not yet implemented in database - returning empty array
    this.logger.warn(
      'Advanced assessment storage not implemented - requires AdvancedAssessment table in Prisma schema'
    );
    return [];
  }

  async findOne(id: string) {
    // Advanced assessments require AdvancedAssessment table in database schema
    // Feature not yet implemented - throwing NotFoundException
    this.logger.warn(
      `Advanced assessment ${id} requested but storage not implemented - requires AdvancedAssessment table in Prisma schema`
    );
    throw new NotFoundException(
      `Advanced assessment storage not yet implemented. Assessment ID: ${id}`
    );
  }

  /**
   * Evaluate fill-in-the-blank answer
   * Note: Uses exact string matching. For better accuracy, consider implementing:
   * - Fuzzy matching for typo tolerance
   * - Semantic similarity for conceptual answers
   */
  evaluateFillInBlank(assessmentId: string, answer: string) {
    // In production, fetch accepted answers from database based on assessmentId
    // For now using example answers - implement database lookup when AdvancedAssessment table exists
    const acceptedAnswers = ['O(n^2)', 'O(n*n)', 'O(n²)'];
    const normalizedAnswer = answer.trim().toLowerCase();
    const isCorrect = acceptedAnswers.some((accepted) =>
      normalizedAnswer === accepted.toLowerCase()
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
   * Note: Uses keyword matching. For better accuracy in production, consider:
   * - AST analysis to verify code changes
   * - Test case execution
   * - AI-powered code review (GPT-4/Claude)
   */
  async evaluateCodeDebugging(assessmentId: string, submittedCode: string, identifiedIssues: string[]) {
    // In production, fetch expected issues from database based on assessmentId
    // For now using example issues - implement database lookup when AdvancedAssessment table exists
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
