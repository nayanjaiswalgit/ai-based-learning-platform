import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentService } from './assignment.service';
import { SubmissionService } from './submission.service';
import { PeerReviewService } from './peer-review.service';
import { ProjectShowcaseService } from './project-showcase.service';

@ApiTags('Assignments')
@Controller('assignments')
export class AssignmentController {
  constructor(
    private assignmentService: AssignmentService,
    private submissionService: SubmissionService,
    private peerReviewService: PeerReviewService,
    private projectShowcaseService: ProjectShowcaseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create assignment' })
  @ApiBearerAuth()
  async create(@Request() req: any, @Body() data: any) {
    return this.assignmentService.create({
      ...data,
      createdBy: req.user.id,
    });
  }

  @Get('cohort/:cohortId')
  @ApiOperation({ summary: 'Get assignments for cohort' })
  async findAllByCohort(
    @Param('cohortId') cohortId: string,
    @Query('upcoming') upcoming?: boolean,
    @Query('overdue') overdue?: boolean,
  ) {
    return this.assignmentService.findAllByCohort(cohortId, { upcoming, overdue });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment details' })
  async findOne(@Param('id') id: string) {
    return this.assignmentService.findOne(id);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get assignment statistics' })
  @ApiBearerAuth()
  async getStatistics(@Param('id') id: string) {
    return this.assignmentService.getStatistics(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update assignment' })
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() data: any) {
    return this.assignmentService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete assignment' })
  @ApiBearerAuth()
  async delete(@Param('id') id: string) {
    return this.assignmentService.delete(id);
  }

  // Submissions
  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit assignment' })
  @ApiBearerAuth()
  async submit(@Param('id') id: string, @Request() req: any, @Body() data: any) {
    return this.submissionService.submit({
      assignmentId: id,
      userId: req.user.id,
      ...data,
    });
  }

  @Put('submissions/:submissionId/grade')
  @ApiOperation({ summary: 'Grade submission' })
  @ApiBearerAuth()
  async grade(
    @Param('submissionId') id: string,
    @Request() req: any,
    @Body() body: { grade: number; feedback?: string },
  ) {
    return this.submissionService.grade(id, req.user.id, body.grade, body.feedback);
  }

  @Get('my/submissions')
  @ApiOperation({ summary: 'Get my submissions' })
  @ApiBearerAuth()
  async getMySubmissions(@Request() req: any, @Query('cohortId') cohortId?: string) {
    return this.submissionService.getUserSubmissions(req.user.id, cohortId);
  }

  // Peer Reviews
  @Post(':id/assign-peer-reviews')
  @ApiOperation({ summary: 'Assign peer reviews' })
  @ApiBearerAuth()
  async assignPeerReviews(@Param('id') id: string) {
    return this.peerReviewService.assignPeerReviews(id);
  }

  @Post('submissions/:submissionId/peer-review')
  @ApiOperation({ summary: 'Submit peer review' })
  @ApiBearerAuth()
  async submitPeerReview(
    @Param('submissionId') id: string,
    @Request() req: any,
    @Body() data: any,
  ) {
    return this.peerReviewService.submitReview({
      submissionId: id,
      reviewerId: req.user.id,
      ...data,
    });
  }

  @Get('submissions/:submissionId/peer-reviews')
  @ApiOperation({ summary: 'Get peer reviews for submission' })
  async getPeerReviews(@Param('submissionId') id: string) {
    return this.peerReviewService.getReviews(id);
  }

  // Project Showcase
  @Post('cohort/:cohortId/showcase')
  @ApiOperation({ summary: 'Create project showcase' })
  @ApiBearerAuth()
  async createShowcase(
    @Param('cohortId') cohortId: string,
    @Request() req: any,
    @Body() data: any,
  ) {
    return this.projectShowcaseService.create({
      cohortId,
      userId: req.user.id,
      ...data,
    });
  }

  @Get('cohort/:cohortId/showcases')
  @ApiOperation({ summary: 'Get project showcases for cohort' })
  async getShowcases(
    @Param('cohortId') cohortId: string,
    @Query('featured') featured?: boolean,
  ) {
    return this.projectShowcaseService.findAllByCohort(cohortId, { featured });
  }

  @Put('showcases/:id/like')
  @ApiOperation({ summary: 'Like project' })
  @ApiBearerAuth()
  async likeProject(@Param('id') id: string, @Request() req: any) {
    return this.projectShowcaseService.toggleLike(id, req.user.id);
  }
}
