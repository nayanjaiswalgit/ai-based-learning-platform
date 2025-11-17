import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
        model: this.configService.get('ai.openai.model'),
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

      const response = JSON.parse(completion.choices[0].message.content);
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

    const question = assessment.questions.find((q) => q.id === dto.questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    const userAnswersMap = this.userAnswers.get(dto.assessmentId);
    userAnswersMap.set(dto.questionId, dto.selectedAnswer);

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

    questions.forEach((question) => {
      const userAnswer = userAnswersMap.get(question.id);
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }

      // Track performance by topic
      if (!topicPerformance.has(question.topic)) {
        topicPerformance.set(question.topic, { correct: 0, total: 0 });
      }
      const topicStats = topicPerformance.get(question.topic);
      topicStats.total++;
      if (userAnswer === question.correctAnswer) {
        topicStats.correct++;
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
    // TODO: Implement database query to calculate real skill levels
    // Query UserSubmission table grouped by topic/skill:
    //   - Count total submissions per topic
    //   - Calculate success rate per topic
    //   - Determine skill level based on:
    //     * Success rate: >80% = ADVANCED, 60-80% = INTERMEDIATE, <60% = BEGINNER
    //     * Number of problems solved per topic
    //     * Difficulty progression (easy -> medium -> hard)
    // Example query:
    // const submissions = await prisma.userSubmission.findMany({
    //   where: { userId: dto.userId },
    //   include: { question: { select: { topics: true, difficulty: true } } }
    // });
    // const currentSkills = this.calculateSkillLevelsFromSubmissions(submissions);

    const currentSkills = await this.getUserCurrentSkills(dto.userId);

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
        model: this.configService.get('ai.openai.model'),
        messages: [
          { role: 'system', content: 'You are a learning advisor.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      });

      const response = JSON.parse(completion.choices[0].message.content);
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
    // TODO: Query real courses and problems from database
    // Query Course and Question tables:
    // const resources = await prisma.course.findMany({
    //   where: {
    //     topics: { has: skill },
    //     difficulty: this.getDifficultyForLevel(targetLevel)
    //   },
    //   take: 5
    // });
    return [
      {
        id: '1',
        type: 'COURSE',
        title: `Advanced ${skill} Course`,
        estimatedTime: 600,
        difficulty: DifficultyLevel.MEDIUM,
      },
      {
        id: '2',
        type: 'PROBLEM',
        title: `${skill} Practice Problems`,
        estimatedTime: 180,
        difficulty: DifficultyLevel.MEDIUM,
      },
    ];
  }

  /**
   * Helper: Get user's current skill levels from submission history
   */
  private async getUserCurrentSkills(userId: string): Promise<Record<string, SkillLevel>> {
    // TODO: Implement real skill calculation from database
    // This should:
    // 1. Query all user submissions from UserSubmission table
    // 2. Group by topics/skills
    // 3. Calculate success rate and difficulty progression per skill
    // 4. Determine skill level based on performance metrics
    //
    // Temporary: Return default skill levels until database integration is complete
    this.logger.warn(`Using default skill levels for user ${userId} - database integration pending`);

    return {
      'JavaScript': SkillLevel.INTERMEDIATE,
      'React': SkillLevel.BEGINNER,
      'Node.js': SkillLevel.BEGINNER,
      'TypeScript': SkillLevel.BEGINNER,
      'System Design': SkillLevel.BEGINNER,
    };
  }
}
