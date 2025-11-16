import { Module } from '@nestjs/common';
import { SkillAssessmentController } from './skill-assessment.controller';
import { SkillAssessmentService } from './skill-assessment.service';

@Module({
  controllers: [SkillAssessmentController],
  providers: [SkillAssessmentService],
  exports: [SkillAssessmentService],
})
export class SkillAssessmentModule {}
