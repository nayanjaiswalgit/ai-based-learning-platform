import { Injectable, Logger } from '@nestjs/common'
import { LearningStreakService } from './services/learning-streak.service'
import { TimeTrackingService } from './services/time-tracking.service'
import { CourseProgressService } from './services/course-progress.service'
import { ProblemSolvingService } from './services/problem-solving.service'
import { SkillProgressionService } from './services/skill-progression.service'
import { AchievementService } from './services/achievement.service'
import type { UserAnalytics } from '@repo/shared-types'

@Injectable()
export class UserAnalyticsService {
  private readonly logger = new Logger(UserAnalyticsService.name)

  constructor(
    private readonly learningStreakService: LearningStreakService,
    private readonly timeTrackingService: TimeTrackingService,
    private readonly courseProgressService: CourseProgressService,
    private readonly problemSolvingService: ProblemSolvingService,
    private readonly skillProgressionService: SkillProgressionService,
    private readonly achievementService: AchievementService,
  ) {}

  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    this.logger.log(`Fetching analytics for user: ${userId}`)

    const [
      learningStreak,
      timeSpent,
      courseProgress,
      problemsSolved,
      skillProgression,
      achievements,
    ] = await Promise.all([
      this.learningStreakService.getStreak(userId),
      this.timeTrackingService.getTimeSpent(userId),
      this.courseProgressService.getProgress(userId),
      this.problemSolvingService.getProblemStats(userId),
      this.skillProgressionService.getProgression(userId),
      this.achievementService.getAchievements(userId),
    ])

    return {
      userId,
      learningStreak,
      timeSpent,
      coursesCompleted: courseProgress.completed,
      coursesInProgress: courseProgress.inProgress,
      problemsSolved,
      skillProgression,
      achievements,
    }
  }

  async getLearningStreak(userId: string) {
    return this.learningStreakService.getStreak(userId)
  }

  async getTimeSpent(userId: string, period?: 'daily' | 'weekly' | 'monthly') {
    return this.timeTrackingService.getTimeSpent(userId, period)
  }

  async getCourseProgress(userId: string) {
    return this.courseProgressService.getProgress(userId)
  }

  async getProblemsSolved(userId: string) {
    return this.problemSolvingService.getProblemStats(userId)
  }

  async getSkillProgression(userId: string) {
    return this.skillProgressionService.getProgression(userId)
  }

  async getAchievements(userId: string) {
    return this.achievementService.getAchievements(userId)
  }
}
