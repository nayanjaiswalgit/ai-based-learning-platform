import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { SubmissionService } from './submission.service';
import { PeerReviewService } from './peer-review.service';
import { ProjectShowcaseService } from './project-showcase.service';

@Module({
  controllers: [AssignmentController],
  providers: [AssignmentService, SubmissionService, PeerReviewService, ProjectShowcaseService],
  exports: [AssignmentService],
})
export class AssignmentModule {}
