import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QuestionModule } from './modules/question/question.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { DsaSheetModule } from './modules/dsa-sheet/dsa-sheet.module';
import { AdvancedAssessmentModule } from './modules/advanced-assessment/advanced-assessment.module';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    QuestionModule,
    QuizModule,
    DsaSheetModule,
    AdvancedAssessmentModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
