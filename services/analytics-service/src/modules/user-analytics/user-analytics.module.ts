import { Module } from '@nestjs/common'
import { UserAnalyticsController } from './user-analytics.controller'
import { UserAnalyticsService } from './user-analytics.service'
import { LearningStreakService } from './services/learning-streak.service'
import { TimeTrackingService } from './services/time-tracking.service'
import { CourseProgressService } from './services/course-progress.service'
import { ProblemSolvingService } from './services/problem-solving.service'
import { SkillProgressionService } from './services/skill-progression.service'
import { AchievementService } from './services/achievement.service'

@Module({
  controllers: [UserAnalyticsController],
  providers: [
    UserAnalyticsService,
    LearningStreakService,
    TimeTrackingService,
    CourseProgressService,
    ProblemSolvingService,
    SkillProgressionService,
    AchievementService,
  ],
  exports: [UserAnalyticsService],
})
export class UserAnalyticsModule {}
