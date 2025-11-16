import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QuestionModule } from './modules/question/question.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { DsaSheetModule } from './modules/dsa-sheet/dsa-sheet.module';
import { AdvancedAssessmentModule } from './modules/advanced-assessment/advanced-assessment.module';
import { DatabaseModule } from './database/database.module';

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
})
export class AppModule {}
