import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { QuestionService } from '../question/question.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    private prisma: PrismaService,
    private questionService: QuestionService,
  ) {}

  async create(createQuizDto: CreateQuizDto, userId: string) {
    return {
      id: this.generateId(),
      ...createQuizDto,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      passingPercentage: createQuizDto.passingPercentage || 70,
      randomizeQuestions: createQuizDto.randomizeQuestions ?? true,
      shuffleAnswers: createQuizDto.shuffleAnswers ?? true,
      showResultsImmediately: createQuizDto.showResultsImmediately ?? true,
      maxAttempts: createQuizDto.maxAttempts || 3,
    };
  }

  async findAll(filters?: { courseId?: string }) {
    // For now, return dynamically generated quizzes based on question categories
    // In the future, this should query a Quiz model
    const questionTypes = await this.prisma.question.groupBy({
      by: ['questionType'],
      where: {
        isPublic: true,
        questionType: 'MCQ', // Only MCQ questions for quizzes
      },
      _count: {
        id: true,
      },
    });

    return questionTypes.map((type, index) => ({
      id: `quiz_${type.questionType}_${index}`,
      title: `${type.questionType} Quiz`,
      description: `Test your knowledge with ${type._count.id} questions`,
      questionCount: type._count.id,
      questionType: type.questionType,
    }));
  }

  async findOne(id: string) {
    // For now, return a dynamic quiz based on question type
    // Extract question type from id (format: quiz_{type}_{index})
    const parts = id.split('_');
    if (parts.length < 2) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    const questionType = parts[1];
    const questions = await this.prisma.question.findMany({
      where: {
        isPublic: true,
        questionType,
      },
      include: {
        mcqOptions: true,
      },
      take: 20, // Limit to 20 questions per quiz
    });

    if (questions.length === 0) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return {
      id,
      title: `${questionType} Quiz`,
      description: `Test your knowledge`,
      timeLimit: 1800, // 30 minutes
      questionCount: questions.length,
      questions: questions.map(q => ({
        id: q.id,
        title: q.title,
        description: q.description,
        questionType: q.questionType,
        options: q.mcqOptions,
      })),
    };
  }

  /**
   * Start a quiz attempt - returns questions with shuffling/randomization applied
   */
  async startQuizAttempt(quizId: string, userId: string) {
    // Mock quiz data
    const quiz = {
      id: quizId,
      title: 'Data Structures Quiz 1',
      description: 'Test your knowledge',
      timeLimit: 1800,
      questionIds: ['q1', 'q2', 'q3'],
      randomizeQuestions: true,
      shuffleAnswers: true,
    };

    // Check if user has attempts remaining
    const userAttempts = await this.getUserAttempts(quizId, userId);
    if (userAttempts >= 3) {
      throw new BadRequestException('Maximum attempts reached');
    }

    // Create attempt record
    const attemptId = this.generateId();
    const startTime = new Date();

    // Get questions
    let questions = quiz.questionIds.map((id) => ({
      id,
      questionText: 'Sample question',
      type: 'MULTIPLE_CHOICE',
      options: [],
    }));

    // Randomize question order
    if (quiz.randomizeQuestions) {
      questions = this.shuffleArray(questions);
    }

    // Shuffle answers for each question
    if (quiz.shuffleAnswers) {
      questions = questions.map((q) => this.questionService.shuffleOptions(q));
    }

    // Sanitize questions (remove correct answers)
    questions = questions.map((q) => this.questionService.sanitizeQuestion(q));

    return {
      attemptId,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
      },
      questions,
      startTime,
      expiresAt: new Date(startTime.getTime() + quiz.timeLimit * 1000),
    };
  }

  /**
   * Submit quiz and get auto-graded results
   */
  async submitQuiz(attemptId: string, submitQuizDto: SubmitQuizDto, userId: string) {
    // Validate attempt exists and belongs to user
    // Check if time limit was exceeded

    const results = {
      attemptId,
      userId,
      submittedAt: new Date(),
      totalQuestions: submitQuizDto.answers.length,
      correctAnswers: 0,
      incorrectAnswers: 0,
      skippedAnswers: 0,
      score: 0,
      totalPoints: 0,
      percentage: 0,
      passed: false,
      timeSpent: submitQuizDto.totalTime,
      questionResults: [] as any[],
    };

    // Auto-grade each question
    for (const answer of submitQuizDto.answers) {
      const questionResult = this.questionService.checkAnswer(
        answer.questionId,
        answer.selectedAnswers,
      );

      if (questionResult.isCorrect) {
        results.correctAnswers++;
        results.score += questionResult.score;
      } else {
        results.incorrectAnswers++;
      }

      results.totalPoints += questionResult.score;

      results.questionResults.push({
        questionId: answer.questionId,
        selectedAnswers: answer.selectedAnswers,
        correctAnswers: questionResult.correctAnswers,
        isCorrect: questionResult.isCorrect,
        score: questionResult.score,
        explanation: questionResult.explanation,
        timeSpent: answer.timeSpent,
      });
    }

    results.percentage = (results.score / results.totalPoints) * 100;
    results.passed = results.percentage >= 70; // Get from quiz settings

    return results;
  }

  /**
   * Get quiz results for a specific attempt
   */
  async getAttemptResults(attemptId: string, userId: string) {
    // Find submissions for this attempt
    // attemptId format: attempt_{timestamp}_{userId}_{quizId}
    const parts = attemptId.split('_');
    if (parts.length < 4) {
      throw new NotFoundException('Invalid attempt ID');
    }

    const timestamp = parts[1];
    const quizId = parts.slice(3).join('_');

    // Get the quiz details
    const quiz = await this.findOne(quizId);

    // Get all submissions from this user around the attempt time
    const attemptTime = new Date(parseInt(timestamp));
    const submissions = await this.prisma.userSubmission.findMany({
      where: {
        userId,
        questionId: {
          in: quiz.questions.map(q => q.id),
        },
        submittedAt: {
          gte: new Date(attemptTime.getTime() - 60 * 60 * 1000), // 1 hour window
          lte: new Date(attemptTime.getTime() + 60 * 60 * 1000),
        },
      },
      include: {
        question: {
          include: {
            mcqOptions: true,
          },
        },
      },
    });

    const totalQuestions = quiz.questionCount;
    const correctAnswers = submissions.filter(s => s.status === 'ACCEPTED').length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return {
      attemptId,
      quizId,
      quizTitle: quiz.title,
      score: percentage,
      correctAnswers,
      totalQuestions,
      passed: percentage >= 70,
      timeTaken: null, // Can be calculated if we store attempt start/end times
      submittedAt: submissions[0]?.submittedAt || attemptTime,
      questionResults: submissions.map(s => ({
        questionId: s.questionId,
        question: s.question.title,
        userAnswer: s.submissionData,
        isCorrect: s.status === 'ACCEPTED',
      })),
    };
  }

  /**
   * Get user's attempt history for a quiz
   */
  async getUserAttemptHistory(quizId: string, userId: string) {
    const quiz = await this.findOne(quizId);

    // Get all submissions for questions in this quiz
    const submissions = await this.prisma.userSubmission.findMany({
      where: {
        userId,
        questionId: {
          in: quiz.questions.map(q => q.id),
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
      select: {
        submittedAt: true,
        status: true,
        questionId: true,
      },
    });

    // Group submissions by date to identify attempts
    const attemptsByDate = new Map<string, typeof submissions>();
    submissions.forEach(sub => {
      const dateKey = sub.submittedAt.toISOString().split('T')[0];
      if (!attemptsByDate.has(dateKey)) {
        attemptsByDate.set(dateKey, []);
      }
      attemptsByDate.get(dateKey)!.push(sub);
    });

    // Convert to attempt history
    const history = Array.from(attemptsByDate.entries()).map(([date, subs]) => {
      const uniqueQuestions = new Set(subs.map(s => s.questionId));
      const correctAnswers = subs.filter(s => s.status === 'ACCEPTED').length;
      const percentage = Math.round((correctAnswers / uniqueQuestions.size) * 100);

      return {
        attemptId: `attempt_${new Date(date).getTime()}_${userId}_${quizId}`,
        attemptDate: date,
        score: percentage,
        questionsAnswered: uniqueQuestions.size,
        passed: percentage >= 70,
      };
    });

    return history.slice(0, 10); // Return last 10 attempts
  }

  private async getUserAttempts(quizId: string, userId: string): Promise<number> {
    const history = await this.getUserAttemptHistory(quizId, userId);
    return history.length;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private generateId(): string {
    return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
