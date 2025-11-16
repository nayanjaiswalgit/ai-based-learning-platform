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
    // Mock implementation
    return [];
  }

  async findOne(id: string) {
    // Mock implementation
    throw new NotFoundException(`Quiz with ID ${id} not found`);
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
    // Mock implementation
    return {
      attemptId,
      score: 85,
      passed: true,
    };
  }

  /**
   * Get user's attempt history for a quiz
   */
  async getUserAttemptHistory(quizId: string, userId: string) {
    return [];
  }

  private async getUserAttempts(quizId: string, userId: string): Promise<number> {
    // Mock - return number of attempts
    return 0;
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
