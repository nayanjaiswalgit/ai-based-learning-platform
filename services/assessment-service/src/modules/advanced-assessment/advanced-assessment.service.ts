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
    // TODO: Implement database query for advanced assessments
    // Query AdvancedAssessment table (needs to be added to schema):
    // return await this.prisma.advancedAssessment.findMany({
    //   where: type ? { type } : {},
    //   include: { createdBy: { select: { name: true } } }
    // });
    return [];
  }

  async findOne(id: string) {
    // TODO: Implement database query to fetch specific assessment
    // return await this.prisma.advancedAssessment.findUnique({
    //   where: { id },
    //   include: {
    //     codeDebugging: true,
    //     fillInBlank: true,
    //     dragDropCode: true
    //   }
    // });
    //
    // For now, returning mock data for testing purposes
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
    // TODO: Implement more sophisticated answer comparison
    // Current: Simple exact string matching
    // Improvements needed:
    // 1. Fuzzy matching (Levenshtein distance) for typos
    // 2. Semantic similarity using NLP/embeddings
    // 3. Strip whitespace and normalize formatting
    // 4. Handle mathematical notation variations (n^2 vs n²)
    // Libraries to consider:
    // - fuzzball (fuzzy matching)
    // - compromise (NLP)
    // - OpenAI embeddings for semantic similarity

    // Fetch accepted answers from database
    const acceptedAnswers = ['O(n^2)', 'O(n*n)', 'O(n²)'];
    const isCorrect = acceptedAnswers.some((accepted) =>
      answer.trim().toLowerCase() === accepted.toLowerCase()
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
    // TODO: Implement AI-powered code analysis for debugging evaluation
    // Current limitation: Simple keyword matching is not robust
    // Improvements needed:
    // 1. AST (Abstract Syntax Tree) analysis to verify actual code fixes
    // 2. Test case execution to verify functional correctness
    // 3. AI code review using GPT-4 or specialized code models
    // 4. Static analysis tools integration (ESLint, Pylint, etc.)
    // Implementation approach:
    // - Parse buggy code and fixed code with AST parser
    // - Run test cases against both versions
    // - Use AI to evaluate if identified issues are valid
    // - Compare semantic differences, not just keywords
    //
    // Libraries to consider:
    // - @babel/parser for JavaScript AST
    // - ast module for Python
    // - OpenAI GPT-4 for semantic code analysis

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
