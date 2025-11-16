import { Module } from '@nestjs/common';
import { AdvancedAssessmentService } from './advanced-assessment.service';
import { AdvancedAssessmentController } from './advanced-assessment.controller';

@Module({
  controllers: [AdvancedAssessmentController],
  providers: [AdvancedAssessmentService],
  exports: [AdvancedAssessmentService],
})
export class AdvancedAssessmentModule {}
