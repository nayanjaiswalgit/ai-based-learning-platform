import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { prisma } from '@repo/database';
import OpenAI from 'openai';
import {
  SkillAssessmentQuestion,
  SkillAssessmentResult,
  SkillGap,
  SkillLevel,
  DifficultyLevel,
  LearningGoal,
  Resource,
} from '@/types';
import {
  CreateAssessmentDto,
  SubmitAssessmentAnswerDto,
  GetSkillGapsDto,
  GenerateQuestionsDto,
} from './dto/skill-assessment.dto';

@Injectable()
export class SkillAssessmentService {
  private readonly logger = new Logger(SkillAssessmentService.name);
  private readonly openai: OpenAI;

  // In-memory storage (replace with database in production)
  private assessments = new Map<string, any>();
  private userAnswers = new Map<string, Map<string, number>>();

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('ai.openai.apiKey'),
    });
  }

  /**
   * Phase 1.1: Generate AI-powered assessment questions
   */
  async generateQuestions(dto: GenerateQuestionsDto): Promise<SkillAssessmentQuestion[]> {
    this.logger.log(`Generating ${dto.count} questions for ${dto.goal} at ${dto.difficulty} level`);

    const prompt = this.buildQuestionGenerationPrompt(dto);

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.configService.get('ai.openai.model') || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator creating skill assessment questions. Generate questions in valid JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');
      return response.questions || [];
    } catch (error) {
      this.logger.error('Failed to generate questions:', error);
      throw error;
    }
  }

  /**
   * Phase 1.2: Create initial skill assessment
   */
  async createAssessment(dto: CreateAssessmentDto): Promise<{ assessmentId: string; questions: SkillAssessmentQuestion[] }> {
    this.logger.log(`Creating assessment for user ${dto.userId} with goal ${dto.goal}`);

    // Generate questions based on learning goal
    const questions = await this.generateQuestions({
      goal: dto.goal,
      difficulty: dto.estimatedLevel === SkillLevel.BEGINNER ? DifficultyLevel.EASY : DifficultyLevel.MEDIUM,
      count: 20,
      topics: dto.focusAreas,
    });

    const assessmentId = `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store assessment
    this.assessments.set(assessmentId, {
      id: assessmentId,
      userId: dto.userId,
      goal: dto.goal,
      questions,
      createdAt: new Date(),
    });

    // Initialize user answers
    this.userAnswers.set(assessmentId, new Map());

    return { assessmentId, questions };
  }

  /**
   * Phase 1.3: Submit assessment answer
   */
  async submitAnswer(dto: SubmitAssessmentAnswerDto): Promise<{ correct: boolean; explanation?: string }> {
    const assessment = this.assessments.get(dto.assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    const question = assessment.questions.find((q: any) => q.id === dto.questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    const userAnswersMap = this.userAnswers.get(dto.assessmentId);
    userAnswersMap!.set(dto.questionId, dto.selectedAnswer);

    const correct = dto.selectedAnswer === question.correctAnswer;

    return {
      correct,
      explanation: question.explanation,
    };
  }

  /**
   * Phase 1.4: Calculate skill level based on assessment results
   */
  async calculateSkillLevel(userId: string, assessmentId: string): Promise<SkillAssessmentResult> {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    const userAnswersMap = this.userAnswers.get(assessmentId);
    const questions = assessment.questions;

    let correctAnswers = 0;
    const topicPerformance = new Map<string, { correct: number; total: number }>();

    questions.forEach((question: any) => {
      const userAnswer = userAnswersMap!.get(question.id);
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }

      // Track performance by topic
      if (!topicPerformance.has(question.topic)) {
        topicPerformance.set(question.topic, { correct: 0, total: 0 });
      }
      const topicStats = topicPerformance.get(question.topic);
      topicStats!.total++;
      if (userAnswer === question.correctAnswer) {
        topicStats!.correct++;
      }
    });

    const score = (correctAnswers / questions.length) * 100;
    const skillLevel = this.determineSkillLevel(score);

    // Analyze strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    topicPerformance.forEach((stats, topic) => {
      const topicScore = (stats.correct / stats.total) * 100;
      if (topicScore >= 70) {
        strengths.push(topic);
      } else if (topicScore < 50) {
        weaknesses.push(topic);
      }
    });

    // Generate AI recommendations
    const recommendations = await this.generateRecommendations(
      assessment.goal,
      skillLevel,
      strengths,
      weaknesses,
    );

    return {
      userId,
      assessmentId,
      score,
      totalQuestions: questions.length,
      skillLevel,
      strengths,
      weaknesses,
      recommendations,
      completedAt: new Date(),
    };
  }

  /**
   * Phase 1.5: Analyze skill gaps
   */
  async analyzeSkillGaps(dto: GetSkillGapsDto): Promise<SkillGap[]> {
    this.logger.log(`Analyzing skill gaps for user ${dto.userId} with target goal ${dto.targetGoal}`);

    // Calculate user's current skills from submission history
    const currentSkills = await this.calculateRealSkillLevels(dto.userId);

    // Define target skills for the goal
    const targetSkills = this.getTargetSkillsForGoal(dto.targetGoal);

    const skillGaps: SkillGap[] = [];

    for (const [skill, targetLevel] of Object.entries(targetSkills)) {
      const currentLevel = currentSkills[skill] || SkillLevel.BEGINNER;
      const gap = this.calculateSkillGapValue(currentLevel, targetLevel);

      if (gap > 0) {
        const suggestedResources = await this.getSuggestedResourcesForSkill(skill, currentLevel, targetLevel);

        skillGaps.push({
          skill,
          currentLevel,
          targetLevel,
          gap,
          suggestedResources,
        });
      }
    }

    return skillGaps;
  }

  /**
   * Helper: Build question generation prompt
   */
  private buildQuestionGenerationPrompt(dto: GenerateQuestionsDto): string {
    return `Generate ${dto.count} multiple-choice questions for ${dto.goal} at ${dto.difficulty} difficulty level.

${dto.topics?.length ? `Focus on these topics: ${dto.topics.join(', ')}` : ''}

Return a JSON object with this structure:
{
  "questions": [
    {
      "id": "unique_id",
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "topic": "Topic name",
      "difficulty": "${dto.difficulty}",
      "explanation": "Detailed explanation of the correct answer"
    }
  ]
}

Make questions practical, relevant, and challenging for the specified difficulty level.`;
  }

  /**
   * Helper: Determine skill level from score
   */
  private determineSkillLevel(score: number): SkillLevel {
    if (score >= 85) return SkillLevel.EXPERT;
    if (score >= 70) return SkillLevel.ADVANCED;
    if (score >= 50) return SkillLevel.INTERMEDIATE;
    return SkillLevel.BEGINNER;
  }

  /**
   * Helper: Generate personalized recommendations
   */
  private async generateRecommendations(
    goal: LearningGoal,
    skillLevel: SkillLevel,
    strengths: string[],
    weaknesses: string[],
  ): Promise<string[]> {
    const prompt = `Based on a user's skill assessment for ${goal}:
- Skill Level: ${skillLevel}
- Strengths: ${strengths.join(', ')}
- Weaknesses: ${weaknesses.join(', ')}

Provide 5 personalized learning recommendations. Return as JSON array of strings.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.configService.get('ai.openai.model') || 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a learning advisor.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');
      return response.recommendations || [];
    } catch (error) {
      this.logger.error('Failed to generate recommendations:', error);
      return [
        'Focus on your weak areas first',
        'Practice daily coding challenges',
        'Build real-world projects',
      ];
    }
  }

  /**
   * Helper: Get target skills for a learning goal
   */
  private getTargetSkillsForGoal(goal: LearningGoal): Record<string, SkillLevel> {
    const targetSkills: Record<LearningGoal, Record<string, SkillLevel>> = {
      [LearningGoal.WEB_DEVELOPMENT]: {
        'HTML/CSS': SkillLevel.ADVANCED,
        'JavaScript': SkillLevel.ADVANCED,
        'React': SkillLevel.ADVANCED,
        'Node.js': SkillLevel.INTERMEDIATE,
        'TypeScript': SkillLevel.INTERMEDIATE,
        'System Design': SkillLevel.INTERMEDIATE,
      },
      [LearningGoal.DATA_SCIENCE]: {
        'Python': SkillLevel.ADVANCED,
        'Statistics': SkillLevel.ADVANCED,
        'Pandas': SkillLevel.ADVANCED,
        'Machine Learning': SkillLevel.INTERMEDIATE,
      },
      // Add more goals...
      [LearningGoal.MACHINE_LEARNING]: {},
      [LearningGoal.MOBILE_DEVELOPMENT]: {},
      [LearningGoal.DEVOPS]: {},
      [LearningGoal.CLOUD_COMPUTING]: {},
      [LearningGoal.CYBERSECURITY]: {},
      [LearningGoal.GAME_DEVELOPMENT]: {},
      [LearningGoal.BLOCKCHAIN]: {},
      [LearningGoal.SYSTEM_DESIGN]: {},
    };

    return targetSkills[goal] || {};
  }

  /**
   * Helper: Calculate numerical skill gap
   */
  private calculateSkillGapValue(current: SkillLevel, target: SkillLevel): number {
    const levels = {
      [SkillLevel.BEGINNER]: 1,
      [SkillLevel.INTERMEDIATE]: 2,
      [SkillLevel.ADVANCED]: 3,
      [SkillLevel.EXPERT]: 4,
    };

    return levels[target] - levels[current];
  }

  /**
   * Helper: Get suggested resources for skill improvement
   */
  private async getSuggestedResourcesForSkill(
    skill: string,
    currentLevel: SkillLevel,
    targetLevel: SkillLevel,
  ): Promise<Resource[]> {
    try {
      const resources: Resource[] = [];
      const targetDifficulty = this.getDifficultyForSkillLevel(targetLevel);

      // Query relevant courses from database
      const courses = await prisma.course.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: skill, mode: 'insensitive' } },
            { description: { contains: skill, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          duration: true,
        },
        take: 3,
      });

      courses.forEach((course: any) => {
        resources.push({
          id: course.id,
          type: 'COURSE',
          title: course.title,
          estimatedTime: course.duration || 600,
          difficulty: DifficultyLevel.MEDIUM,
        });
      });

      // Query practice problems from database
      const problems = await prisma.question.findMany({
        where: {
          isPublic: true,
          topics: { has: skill },
          difficulty: targetDifficulty,
        },
        select: {
          id: true,
          title: true,
          difficulty: true,
        },
        take: 5,
      });

      problems.forEach((problem: any) => {
        resources.push({
          id: problem.id,
          type: 'PROBLEM',
          title: problem.title,
          estimatedTime: 60, // Estimate 60 minutes per problem
          difficulty: this.mapQuestionDifficultyToDifficultyLevel(problem.difficulty),
        });
      });

      return resources;
    } catch (error) {
      this.logger.error(`Error fetching resources for skill ${skill}:`, error);
      // Return empty array on error
      return [];
    }
  }

  /**
   * Helper: Map skill level to question difficulty
   */
  private getDifficultyForSkillLevel(level: SkillLevel): string {
    switch (level) {
      case SkillLevel.EXPERT:
        return 'HARD';
      case SkillLevel.ADVANCED:
        return 'MEDIUM';
      case SkillLevel.INTERMEDIATE:
        return 'MEDIUM';
      default:
        return 'EASY';
    }
  }

  /**
   * Helper: Map question difficulty to DifficultyLevel enum
   */
  private mapQuestionDifficultyToDifficultyLevel(difficulty: string): DifficultyLevel {
    switch (difficulty) {
      case 'HARD':
        return DifficultyLevel.HARD;
      case 'MEDIUM':
        return DifficultyLevel.MEDIUM;
      default:
        return DifficultyLevel.EASY;
    }
  }

  /**
   * Helper: Get user's current skill levels from submission history
   */
  private async getUserCurrentSkills(userId: string): Promise<Record<string, SkillLevel>> {
    try {
      // Query all accepted submissions for this user with question topics
      const submissions = await prisma.userSubmission.findMany({
        where: {
          userId,
          status: 'ACCEPTED',
        },
        include: {
          question: {
            select: {
              topics: true,
              difficulty: true,
            },
          },
        },
      });

      if (submissions.length === 0) {
        this.logger.debug(`No submissions found for user ${userId}, returning beginner levels`);
        return {};
      }

      // Group submissions by topic and calculate skill levels
      const topicStats = new Map<string, { total: number; easy: number; medium: number; hard: number }>();

      submissions.forEach((submission: any) => {
        const topics = submission.question.topics as string[];
        const difficulty = submission.question.difficulty;

        if (Array.isArray(topics)) {
          topics.forEach((topic: any) => {
            if (!topicStats.has(topic)) {
              topicStats.set(topic, { total: 0, easy: 0, medium: 0, hard: 0 });
            }

            const stats = topicStats.get(topic)!;
            stats.total++;

            if (difficulty === 'EASY') stats.easy++;
            else if (difficulty === 'MEDIUM') stats.medium++;
            else if (difficulty === 'HARD') stats.hard++;
          });
        }
      });

      // Calculate skill level for each topic based on problem count and difficulty distribution
      const skillLevels: Record<string, SkillLevel> = {};

      topicStats.forEach((stats, topic) => {
        skillLevels[topic] = this.determineSkillLevelFromStats(stats);
      });

      return skillLevels;
    } catch (error) {
      this.logger.error(`Error calculating user skills for ${userId}:`, error);
      // Return empty object on error - caller will handle missing skills
      return {};
    }
  }

  /**
   * Helper: Determine skill level from submission statistics
   */
  private determineSkillLevelFromStats(stats: {
    total: number;
    easy: number;
    medium: number;
    hard: number;
  }): SkillLevel {
    // Skill level criteria:
    // BEGINNER: < 10 problems or only easy problems
    // INTERMEDIATE: 10-30 problems with some medium, or < 50% hard
    // ADVANCED: 30-50 problems with good medium/hard mix
    // EXPERT: 50+ problems with significant hard problem count

    if (stats.total < 10 || stats.easy === stats.total) {
      return SkillLevel.BEGINNER;
    }

    const hardPercentage = (stats.hard / stats.total) * 100;
    const mediumPercentage = (stats.medium / stats.total) * 100;

    if (stats.total >= 50 && hardPercentage >= 30) {
      return SkillLevel.EXPERT;
    }

    if (stats.total >= 30 && (hardPercentage >= 20 || mediumPercentage >= 40)) {
      return SkillLevel.ADVANCED;
    }

    if (stats.total >= 10 && mediumPercentage >= 20) {
      return SkillLevel.INTERMEDIATE;
    }

    return SkillLevel.BEGINNER;
  }

  /**
   * Calculate real skill levels from database
   * Implements comprehensive skill analysis based on quiz results and coding submissions
   */
  private async calculateRealSkillLevels(userId: string): Promise<Record<string, number>> {
    // Get user's quiz results
    const quizResults = await prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                topics: true,
              },
            },
          },
        },
      },
    });

    // Get coding submissions
    const codingSubmissions = await prisma.codingSubmission.findMany({
      where: { userId, status: 'PASSED' },
      include: {
        question: {
          include: {
            topics: true,
          },
        },
      },
    });

    // Calculate skill levels by topic
    const skillLevels: Record<string, { correct: number; total: number }> = {};

    quizResults.forEach((attempt: any) => {
      attempt.quiz.questions.forEach((question: any) => {
        question.topics.forEach((topic: any) => {
          if (!skillLevels[topic.name]) {
            skillLevels[topic.name] = { correct: 0, total: 0 };
          }
          skillLevels[topic.name].total++;
          if (attempt.answers[question.id] === question.correctAnswer) {
            skillLevels[topic.name].correct++;
          }
        });
      });
    });

    codingSubmissions.forEach((submission: any) => {
      submission.question.topics.forEach((topic: any) => {
        if (!skillLevels[topic.name]) {
          skillLevels[topic.name] = { correct: 0, total: 0 };
        }
        skillLevels[topic.name].total++;
        skillLevels[topic.name].correct++;
      });
    });

    // Convert to percentages
    const result: Record<string, number> = {};
    Object.entries(skillLevels).forEach(([skill, stats]) => {
      result[skill] = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    });

    return result;
  }
}
