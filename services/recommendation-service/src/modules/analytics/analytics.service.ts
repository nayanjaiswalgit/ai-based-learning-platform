import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LearningAnalytics,
  LearningPattern,
  TimeSlot,
  TopicAnalysis,
  Prediction,
  StudyPlan,
  DailyStudyRecommendation,
  Activity,
  SkillLevel,
} from '@/types';
import { GetAnalyticsDto, RecordActivityDto, GetStudyPlanDto, PredictSuccessDto, AnalyticsPeriod } from './dto/analytics.dto';
import dayjs from 'dayjs';

interface UserActivityData {
  userId: string;
  activities: Activity[];
  problemAttempts: Map<
    string,
    {
      attempts: number;
      successes: number;
      totalTime: number;
      topic: string;
    }
  >;
  sessionTimes: Map<number, { count: number; totalDuration: number; avgPerformance: number }>;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  // In-memory storage (replace with database in production)
  private userActivityData = new Map<string, UserActivityData>();

  constructor(private configService: ConfigService) {}

  /**
   * Phase 6.1: Record user activity for analytics
   */
  async recordActivity(dto: RecordActivityDto): Promise<{ success: boolean }> {
    const userData = this.getUserActivityData(dto.userId);

    const activity: Activity = {
      type: dto.type,
      resourceId: dto.resourceId,
      timestamp: dto.timestamp || new Date(),
      duration: dto.duration,
    };

    userData.activities.push(activity);

    // Update specific tracking based on activity type
    if (dto.type === 'PROBLEM_ATTEMPT') {
      this.updateProblemAttempts(userData, dto);
    }

    // Track session times
    const hourOfDay = activity.timestamp.getHours();
    this.updateSessionTimes(userData, hourOfDay, dto.duration, dto.metadata?.success ? 1 : 0);

    return { success: true };
  }

  /**
   * Phase 6.2: Get comprehensive learning analytics
   */
  async getLearningAnalytics(dto: GetAnalyticsDto): Promise<LearningAnalytics> {
    this.logger.log(`Generating analytics for user ${dto.userId} for ${dto.period} period`);

    const userData = this.getUserActivityData(dto.userId);

    // Filter activities by date range
    const filteredActivities = this.filterActivitiesByPeriod(userData.activities, dto);

    // Analyze learning patterns
    const patterns = this.analyzeLearningPatterns(filteredActivities, userData);

    // Find optimal learning times
    const optimalLearningTimes = this.findOptimalLearningTimes(userData);

    // Analyze topic strengths and weaknesses
    const { topicStrengths, topicWeaknesses } = this.analyzeTopics(userData);

    // Generate predictions
    const predictions = this.generatePredictions(userData);

    // Create personalized study plan
    const studyPlan = await this.generateStudyPlan(dto.userId, userData);

    return {
      userId: dto.userId,
      period: dto.period,
      patterns,
      optimalLearningTimes,
      topicStrengths,
      topicWeaknesses,
      predictions,
      studyPlan,
    };
  }

  /**
   * Phase 6.3: Analyze learning patterns
   */
  private analyzeLearningPatterns(activities: Activity[], userData: UserActivityData): LearningPattern[] {
    const patterns: LearningPattern[] = [];

    // Pattern 1: Time of day preference
    const hourCounts = new Map<number, number>();
    activities.forEach((activity: any) => {
      const hour = activity.timestamp.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    const mostActiveHour = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0];
    if (mostActiveHour) {
      const timeOfDay = this.getTimeOfDayLabel(mostActiveHour[0]);
      patterns.push({
        type: 'TIME_OF_DAY',
        pattern: `Most active during ${timeOfDay} (${mostActiveHour[0]}:00)`,
        confidence: Math.min(mostActiveHour[1] / activities.length, 1),
        recommendation: `Schedule your most challenging tasks during ${timeOfDay} when you're most engaged`,
      });
    }

    // Pattern 2: Day of week preference
    const dayCounts = new Map<number, number>();
    activities.forEach((activity: any) => {
      const day = activity.timestamp.getDay();
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    });

    const mostActiveDay = Array.from(dayCounts.entries()).sort((a, b) => b[1] - a[1])[0];
    if (mostActiveDay) {
      const dayName = this.getDayName(mostActiveDay[0]);
      patterns.push({
        type: 'DAY_OF_WEEK',
        pattern: `Most productive on ${dayName}`,
        confidence: Math.min(mostActiveDay[1] / activities.length, 1),
        recommendation: `Plan important learning milestones for ${dayName}`,
      });
    }

    // Pattern 3: Session length preference
    const avgSessionLength = activities.reduce((sum, a) => sum + a.duration, 0) / activities.length;
    const sessionCategory =
      avgSessionLength < 1800 ? 'short (< 30 min)' : avgSessionLength < 3600 ? 'medium (30-60 min)' : 'long (> 60 min)';

    patterns.push({
      type: 'SESSION_LENGTH',
      pattern: `Prefers ${sessionCategory} study sessions`,
      confidence: 0.8,
      recommendation:
        avgSessionLength < 1800
          ? 'Try gradually extending your sessions for deeper learning'
          : 'Your longer sessions are great for deep work. Take regular breaks.',
    });

    // Pattern 4: Topic preference (based on time spent)
    const topicTimes = new Map<string, number>();
    userData.problemAttempts.forEach((data, problemId) => {
      topicTimes.set(data.topic, (topicTimes.get(data.topic) || 0) + data.totalTime);
    });

    const favoriteTopics = Array.from(topicTimes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);

    if (favoriteTopics.length > 0) {
      patterns.push({
        type: 'TOPIC_PREFERENCE',
        pattern: `Spends most time on: ${favoriteTopics.join(', ')}`,
        confidence: 0.9,
        recommendation: `Continue building expertise in ${favoriteTopics[0]} while exploring related advanced topics`,
      });
    }

    return patterns;
  }

  /**
   * Phase 6.4: Find optimal learning times
   */
  private findOptimalLearningTimes(userData: UserActivityData): TimeSlot[] {
    const timeSlots: TimeSlot[] = [];

    userData.sessionTimes.forEach((data, hourOfDay) => {
      if (data.count >= 3) {
        // Only include if enough data
        timeSlots.push({
          hourOfDay,
          avgPerformance: data.avgPerformance,
          avgFocusTime: data.totalDuration / data.count,
        });
      }
    });

    // Sort by performance
    return timeSlots.sort((a, b) => b.avgPerformance - a.avgPerformance).slice(0, 5);
  }

  /**
   * Phase 6.5: Analyze topic strengths and weaknesses
   */
  private analyzeTopics(userData: UserActivityData): {
    topicStrengths: TopicAnalysis[];
    topicWeaknesses: TopicAnalysis[];
  } {
    const topicAnalyses: TopicAnalysis[] = [];

    userData.problemAttempts.forEach((data, problemId) => {
      const successRate = data.attempts > 0 ? data.successes / data.attempts : 0;
      const avgTimePerProblem = data.attempts > 0 ? data.totalTime / data.attempts : 0;

      // Determine skill level based on success rate
      let skillLevel: SkillLevel;
      if (successRate >= 0.8) skillLevel = SkillLevel.EXPERT;
      else if (successRate >= 0.6) skillLevel = SkillLevel.ADVANCED;
      else if (successRate >= 0.4) skillLevel = SkillLevel.INTERMEDIATE;
      else skillLevel = SkillLevel.BEGINNER;

      // Determine trend (simplified - in production, use time-series analysis)
      const trend = successRate >= 0.6 ? 'IMPROVING' : successRate >= 0.4 ? 'STABLE' : 'DECLINING';

      topicAnalyses.push({
        topic: data.topic,
        skillLevel,
        problemsSolved: data.successes,
        successRate,
        avgTimePerProblem,
        trend: trend as any,
      });
    });

    // Separate strengths and weaknesses
    const topicStrengths = topicAnalyses.filter((t: any) => t.successRate >= 0.6).slice(0, 5);
    const topicWeaknesses = topicAnalyses.filter((t: any) => t.successRate < 0.5).slice(0, 5);

    return { topicStrengths, topicWeaknesses };
  }

  /**
   * Phase 6.6: Generate predictions for success rate and completion time
   */
  private generatePredictions(userData: UserActivityData): Prediction[] {
    const predictions: Prediction[] = [];

    // Predict overall success rate for next problem
    const totalAttempts = Array.from(userData.problemAttempts.values()).reduce((sum, d) => sum + d.attempts, 0);
    const totalSuccesses = Array.from(userData.problemAttempts.values()).reduce((sum, d) => sum + d.successes, 0);

    if (totalAttempts > 0) {
      const overallSuccessRate = totalSuccesses / totalAttempts;

      predictions.push({
        type: 'SUCCESS_RATE',
        target: 'Next Problem',
        value: overallSuccessRate,
        confidence: Math.min(totalAttempts / 50, 0.95), // More data = higher confidence
      });
    }

    // Predict completion time
    const avgProblemTime =
      Array.from(userData.problemAttempts.values()).reduce((sum, d) => sum + d.totalTime, 0) / totalAttempts;

    if (!isNaN(avgProblemTime)) {
      predictions.push({
        type: 'COMPLETION_TIME',
        target: 'Average Problem',
        value: avgProblemTime,
        confidence: 0.7,
      });
    }

    return predictions;
  }

  /**
   * Phase 6.7: Generate personalized study plan
   */
  private async generateStudyPlan(userId: string, userData: UserActivityData): Promise<StudyPlan> {
    // Calculate recommended weekly goal based on current activity
    const recentActivities = userData.activities.filter((a: any) => {
      const weekAgo = dayjs().subtract(7, 'days');
      return dayjs(a.timestamp).isAfter(weekAgo);
    });

    const currentWeeklyHours = recentActivities.reduce((sum, a) => sum + a.duration, 0) / 3600;
    const recommendedWeeklyGoal = Math.max(5, Math.min(20, Math.ceil(currentWeeklyHours * 1.2))); // 20% increase

    // Get weak topics for focus areas
    const { topicWeaknesses } = this.analyzeTopics(userData);
    const focusAreas = topicWeaknesses.slice(0, 3).map((t: any) => t.topic);

    // Get topics that need review (haven't practiced recently)
    const reviewTopics = this.getTopicsNeedingReview(userData);

    // Generate daily recommendations
    const dailyRecommendations = this.generateDailyStudyRecommendations(
      recommendedWeeklyGoal,
      focusAreas,
      reviewTopics,
    );

    return {
      weeklyGoal: recommendedWeeklyGoal,
      dailyRecommendations,
      focusAreas,
      reviewTopics,
    };
  }

  /**
   * Phase 6.8: Predict success probability for a specific problem
   */
  async predictSuccess(dto: PredictSuccessDto): Promise<Prediction> {
    const userData = this.getUserActivityData(dto.userId);

    // Get problem details (mock - replace with database)
    const problem = await this.fetchProblem(dto.problemId);

    // Find similar problems user has attempted
    const similarAttempts = Array.from(userData.problemAttempts.values()).filter(
      (data) => data.topic === problem.topic,
    );

    let successProbability = 0.5; // Default
    let confidence = 0.5;

    if (similarAttempts.length > 0) {
      const totalAttempts = similarAttempts.reduce((sum, d) => sum + d.attempts, 0);
      const totalSuccesses = similarAttempts.reduce((sum, d) => sum + d.successes, 0);

      successProbability = totalSuccesses / totalAttempts;
      confidence = Math.min(totalAttempts / 20, 0.95);
    }

    return {
      type: 'SUCCESS_RATE',
      target: dto.problemId,
      value: successProbability,
      confidence,
    };
  }

  /**
   * Helper: Get or create user activity data
   */
  private getUserActivityData(userId: string): UserActivityData {
    if (!this.userActivityData.has(userId)) {
      this.userActivityData.set(userId, {
        userId,
        activities: [],
        problemAttempts: new Map(),
        sessionTimes: new Map(),
      });
    }

    return this.userActivityData.get(userId)!!;
  }

  /**
   * Helper: Update problem attempts tracking
   */
  private updateProblemAttempts(userData: UserActivityData, dto: RecordActivityDto) {
    const problemId = dto.resourceId;
    const topic = dto.metadata?.topic || 'General';
    const success = dto.metadata?.success || false;

    if (!userData.problemAttempts.has(problemId)) {
      userData.problemAttempts.set(problemId, {
        attempts: 0,
        successes: 0,
        totalTime: 0,
        topic,
      });
    }

    const data = userData.problemAttempts.get(problemId)!;
    data.attempts++;
    if (success) data.successes++;
    data.totalTime += dto.duration;
  }

  /**
   * Helper: Update session times tracking
   */
  private updateSessionTimes(userData: UserActivityData, hourOfDay: number, duration: number, performance: number) {
    if (!userData.sessionTimes.has(hourOfDay)) {
      userData.sessionTimes.set(hourOfDay, {
        count: 0,
        totalDuration: 0,
        avgPerformance: 0,
      });
    }

    const data = userData.sessionTimes.get(hourOfDay)!;
    data.count++;
    data.totalDuration += duration;
    data.avgPerformance = (data.avgPerformance * (data.count - 1) + performance) / data.count;
  }

  /**
   * Helper: Filter activities by period
   */
  private filterActivitiesByPeriod(activities: Activity[], dto: GetAnalyticsDto): Activity[] {
    let startDate: dayjs.Dayjs;
    let endDate = dayjs(dto.endDate || new Date());

    if (dto.startDate) {
      startDate = dayjs(dto.startDate);
    } else {
      switch (dto.period) {
        case AnalyticsPeriod.DAILY:
          startDate = endDate.subtract(1, 'day');
          break;
        case AnalyticsPeriod.WEEKLY:
          startDate = endDate.subtract(7, 'days');
          break;
        case AnalyticsPeriod.MONTHLY:
          startDate = endDate.subtract(30, 'days');
          break;
      }
    }

    return activities.filter((a: any) => {
      const activityDate = dayjs(a.timestamp);
      return activityDate.isAfter(startDate) && activityDate.isBefore(endDate);
    });
  }

  /**
   * Helper: Get time of day label
   */
  private getTimeOfDayLabel(hour: number): string {
    if (hour < 6) return 'early morning';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  /**
   * Helper: Get day name
   */
  private getDayName(day: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  }

  /**
   * Helper: Get topics needing review
   */
  private getTopicsNeedingReview(userData: UserActivityData): string[] {
    const topicLastPracticed = new Map<string, Date>();

    userData.activities.forEach((activity: any) => {
      if (activity.type === 'PROBLEM_ATTEMPT') {
        const problem = userData.problemAttempts.get(activity.resourceId);
        if (problem) {
          const lastDate = topicLastPracticed.get(problem.topic);
          if (!lastDate || activity.timestamp > lastDate) {
            topicLastPracticed.set(problem.topic, activity.timestamp);
          }
        }
      }
    });

    const weekAgo = dayjs().subtract(7, 'days');
    const reviewTopics: string[] = [];

    topicLastPracticed.forEach((lastDate, topic) => {
      if (dayjs(lastDate).isBefore(weekAgo)) {
        reviewTopics.push(topic);
      }
    });

    return reviewTopics.slice(0, 3);
  }

  /**
   * Helper: Generate daily study recommendations
   */
  private generateDailyStudyRecommendations(
    weeklyGoal: number,
    focusAreas: string[],
    reviewTopics: string[],
  ): DailyStudyRecommendation[] {
    const dailyHours = weeklyGoal / 7;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return days.map((day, index) => {
      const topics = index % 2 === 0 && focusAreas.length > 0 ? focusAreas : reviewTopics;
      const activities =
        index % 2 === 0
          ? ['Practice problems', 'Learn new concepts', 'Watch tutorial']
          : ['Review previous topics', 'Work on projects', 'Solve challenges'];

      return {
        day,
        recommendedHours: dailyHours,
        topics: topics.slice(0, 2),
        activities,
      };
    });
  }

  /**
   * Helper: Fetch problem details (mock)
   */
  private async fetchProblem(problemId: string): Promise<any> {
    return {
      id: problemId,
      title: 'Sample Problem',
      topic: 'Arrays',
      difficulty: 'MEDIUM',
    };
  }
}
