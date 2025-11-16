import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  DailyRecommendation,
  Challenge,
  CourseRecommendation,
  ProblemRecommendation,
  DifficultyLevel,
  SkillLevel,
} from '@/types';
import { GetDailyRecommendationsDto, UpdateStreakDto, SubmitChallengeDto } from './dto/recommendations.dto';

interface UserLearningProfile {
  userId: string;
  skillLevel: SkillLevel;
  topics: string[];
  weakAreas: string[];
  strongAreas: string[];
  successRateByDifficulty: Record<DifficultyLevel, number>;
  avgTimePerProblem: number;
  lastActive: Date;
  streak: number;
}

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);
  private readonly openai: OpenAI;

  // In-memory storage (replace with database + Redis in production)
  private userProfiles = new Map<string, UserLearningProfile>();
  private dailyRecommendations = new Map<string, DailyRecommendation>();
  private userStreaks = new Map<string, number>();

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('ai.openai.apiKey'),
    });
  }

  /**
   * Phase 3.1: Generate daily personalized recommendations
   */
  async getDailyRecommendations(dto: GetDailyRecommendationsDto): Promise<DailyRecommendation> {
    this.logger.log(`Generating daily recommendations for user ${dto.userId}`);

    const date = dto.date || new Date();
    const cacheKey = `${dto.userId}_${date.toISOString().split('T')[0]}`;

    // Check cache
    if (this.dailyRecommendations.has(cacheKey)) {
      return this.dailyRecommendations.get(cacheKey);
    }

    // Get or create user profile
    const profile = this.getUserProfile(dto.userId);

    // Generate daily challenge with adaptive difficulty
    const challenge = await this.generateDailyChallenge(profile);

    // Generate course recommendations
    const courses = await this.generateCourseRecommendations(profile);

    // Generate problem recommendations with success prediction
    const problems = await this.generateProblemRecommendations(profile);

    // Get or initialize streak
    const streakCount = this.userStreaks.get(dto.userId) || 0;

    // Generate motivational message
    const motivationalMessage = this.generateMotivationalMessage(streakCount, profile);

    const recommendation: DailyRecommendation = {
      userId: dto.userId,
      date,
      challenge,
      courses,
      problems,
      motivationalMessage,
      streakCount,
    };

    this.dailyRecommendations.set(cacheKey, recommendation);
    return recommendation;
  }

  /**
   * Phase 3.2: Generate daily challenge with adaptive difficulty
   */
  private async generateDailyChallenge(profile: UserLearningProfile): Promise<Challenge> {
    // Adaptive difficulty based on recent performance
    const difficulty = this.calculateAdaptiveDifficulty(profile);

    const prompt = `Generate a daily coding challenge for a user with:
- Skill Level: ${profile.skillLevel}
- Weak Areas: ${profile.weakAreas.join(', ')}
- Strong Areas: ${profile.strongAreas.join(', ')}
- Target Difficulty: ${difficulty}

Create a challenge that:
1. Focuses on weak areas to improve
2. Is appropriately challenging but achievable
3. Takes approximately 30-45 minutes
4. Provides clear learning value

Return JSON format:
{
  "id": "challenge_id",
  "type": "CODING",
  "title": "Challenge title",
  "description": "Detailed description with examples",
  "difficulty": "${difficulty}",
  "estimatedTime": 35,
  "points": 100
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.configService.get('ai.openai.model'),
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating engaging coding challenges.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const challenge = JSON.parse(completion.choices[0].message.content);
      return challenge as Challenge;
    } catch (error) {
      this.logger.error('Failed to generate daily challenge:', error);
      return this.getFallbackChallenge(difficulty);
    }
  }

  /**
   * Phase 3.3: Calculate adaptive difficulty based on performance
   */
  private calculateAdaptiveDifficulty(profile: UserLearningProfile): DifficultyLevel {
    const { successRateByDifficulty } = profile;

    // Get success rates
    const easySuccess = successRateByDifficulty[DifficultyLevel.EASY] || 0;
    const mediumSuccess = successRateByDifficulty[DifficultyLevel.MEDIUM] || 0;
    const hardSuccess = successRateByDifficulty[DifficultyLevel.HARD] || 0;

    // Adaptive logic: increase difficulty if doing well, decrease if struggling
    if (mediumSuccess >= 0.7 && hardSuccess >= 0.5) {
      return DifficultyLevel.HARD;
    } else if (easySuccess >= 0.8 && mediumSuccess >= 0.5) {
      return DifficultyLevel.MEDIUM;
    } else {
      return DifficultyLevel.EASY;
    }
  }

  /**
   * Phase 3.4: Generate course recommendations based on learning patterns
   */
  private async generateCourseRecommendations(profile: UserLearningProfile): Promise<CourseRecommendation[]> {
    // Mock implementation - in production, use vector search + collaborative filtering
    const recommendations: CourseRecommendation[] = [];

    // Recommend courses for weak areas
    for (const weakArea of profile.weakAreas.slice(0, 3)) {
      recommendations.push({
        courseId: `course_${Math.random().toString(36).substr(2, 9)}`,
        title: `Master ${weakArea}`,
        reason: `Improve your understanding of ${weakArea}, which you're currently struggling with`,
        matchScore: 85,
        estimatedCompletionTime: 600, // 10 hours
      });
    }

    // Add one advanced course in strong area
    if (profile.strongAreas.length > 0) {
      const strongArea = profile.strongAreas[0];
      recommendations.push({
        courseId: `course_${Math.random().toString(36).substr(2, 9)}`,
        title: `Advanced ${strongArea}`,
        reason: `Level up your ${strongArea} skills to expert level`,
        matchScore: 78,
        estimatedCompletionTime: 480,
      });
    }

    return recommendations;
  }

  /**
   * Phase 3.5: Generate problem recommendations with success prediction
   */
  private async generateProblemRecommendations(profile: UserLearningProfile): Promise<ProblemRecommendation[]> {
    const recommendations: ProblemRecommendation[] = [];

    const minProblems = this.configService.get('ai.recommendations.minProblemsPerDay');
    const maxProblems = this.configService.get('ai.recommendations.maxProblemsPerDay');

    // Generate 3-5 problems with varying difficulty
    const problemCount = Math.floor(Math.random() * (maxProblems - minProblems + 1)) + minProblems;

    for (let i = 0; i < problemCount; i++) {
      const difficulty = this.selectProblemDifficulty(i, problemCount);
      const topic = i < profile.weakAreas.length ? profile.weakAreas[i] : profile.topics[i % profile.topics.length];

      const successProbability = this.predictSuccessProbability(profile, difficulty, topic);

      recommendations.push({
        problemId: `problem_${Math.random().toString(36).substr(2, 9)}`,
        title: `${difficulty} ${topic} Problem`,
        difficulty,
        topics: [topic],
        reason: this.generateProblemReason(difficulty, topic, successProbability),
        successProbability,
      });
    }

    return recommendations;
  }

  /**
   * Phase 3.6: Predict success probability for a problem
   */
  private predictSuccessProbability(
    profile: UserLearningProfile,
    difficulty: DifficultyLevel,
    topic: string,
  ): number {
    // Base success rate by difficulty
    let probability = profile.successRateByDifficulty[difficulty] || 0.5;

    // Adjust based on topic strength
    if (profile.weakAreas.includes(topic)) {
      probability *= 0.7;
    } else if (profile.strongAreas.includes(topic)) {
      probability *= 1.2;
    }

    // Ensure probability is between 0 and 1
    return Math.max(0.1, Math.min(0.95, probability));
  }

  /**
   * Phase 3.7: Update user streak
   */
  async updateStreak(dto: UpdateStreakDto): Promise<{ streak: number; message: string }> {
    const currentStreak = this.userStreaks.get(dto.userId) || 0;
    const newStreak = dto.streakCount !== undefined ? dto.streakCount : currentStreak + 1;

    this.userStreaks.set(dto.userId, newStreak);

    let message = '';
    if (newStreak === 1) {
      message = 'Great start! Keep it going! 🎯';
    } else if (newStreak === 7) {
      message = '🔥 Amazing! 7-day streak achieved! Keep the momentum!';
    } else if (newStreak === 30) {
      message = '🏆 Incredible! 30-day streak! You\'re unstoppable!';
    } else if (newStreak % 10 === 0) {
      message = `🌟 ${newStreak}-day streak! You're on fire!`;
    } else {
      message = `${newStreak} days strong! 💪`;
    }

    return { streak: newStreak, message };
  }

  /**
   * Phase 3.8: Submit challenge completion
   */
  async submitChallenge(dto: SubmitChallengeDto): Promise<{ success: boolean; pointsEarned: number }> {
    if (dto.completed) {
      // Update user streak
      await this.updateStreak({ userId: dto.userId });

      // Calculate points based on time taken (bonus for speed)
      const basePoints = 100;
      const speedBonus = dto.timeTaken && dto.timeTaken < 1800 ? 50 : 0; // Bonus if under 30 mins

      return {
        success: true,
        pointsEarned: basePoints + speedBonus,
      };
    }

    return { success: false, pointsEarned: 0 };
  }

  /**
   * Helper: Get or create user profile
   */
  private getUserProfile(userId: string): UserLearningProfile {
    if (!this.userProfiles.has(userId)) {
      // Create default profile
      this.userProfiles.set(userId, {
        userId,
        skillLevel: SkillLevel.INTERMEDIATE,
        topics: ['JavaScript', 'React', 'Node.js', 'Algorithms', 'System Design'],
        weakAreas: ['Algorithms', 'System Design'],
        strongAreas: ['JavaScript', 'React'],
        successRateByDifficulty: {
          [DifficultyLevel.EASY]: 0.8,
          [DifficultyLevel.MEDIUM]: 0.6,
          [DifficultyLevel.HARD]: 0.3,
        },
        avgTimePerProblem: 1200, // 20 minutes
        lastActive: new Date(),
        streak: 0,
      });
    }

    return this.userProfiles.get(userId);
  }

  /**
   * Helper: Select problem difficulty based on position in recommendations
   */
  private selectProblemDifficulty(index: number, total: number): DifficultyLevel {
    const ratio = index / total;
    if (ratio < 0.5) return DifficultyLevel.EASY;
    if (ratio < 0.8) return DifficultyLevel.MEDIUM;
    return DifficultyLevel.HARD;
  }

  /**
   * Helper: Generate reason for problem recommendation
   */
  private generateProblemReason(
    difficulty: DifficultyLevel,
    topic: string,
    successProbability: number,
  ): string {
    if (successProbability > 0.7) {
      return `Good practice for ${topic}. You have a strong chance of solving this!`;
    } else if (successProbability > 0.4) {
      return `Challenge yourself with ${topic}. This will push your skills!`;
    } else {
      return `Stretch goal in ${topic}. Take your time and learn from this!`;
    }
  }

  /**
   * Helper: Generate motivational message
   */
  private generateMotivationalMessage(streak: number, profile: UserLearningProfile): string {
    if (streak === 0) {
      return 'Start your learning journey today! Every expert was once a beginner. 🚀';
    } else if (streak < 7) {
      return `${streak} days down! You're building momentum. Keep it up! 💪`;
    } else if (streak < 30) {
      return `${streak}-day streak! You're forming a powerful habit. Stay consistent! 🔥`;
    } else {
      return `${streak} days strong! You're an inspiration. Keep pushing boundaries! 🏆`;
    }
  }

  /**
   * Helper: Fallback challenge if AI generation fails
   */
  private getFallbackChallenge(difficulty: DifficultyLevel): Challenge {
    return {
      id: `challenge_${Date.now()}`,
      type: 'CODING',
      title: 'Two Sum Problem',
      description: 'Given an array of integers, return indices of two numbers that add up to a specific target.',
      difficulty,
      estimatedTime: 30,
      points: 100,
    };
  }
}
