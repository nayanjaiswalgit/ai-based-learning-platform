import { Controller, Post, Get, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { CourseGenerationService } from '../services/course-generation.service';

@ApiTags('Course Generation')
@Controller('course-generation')
// @ApiBearerAuth() // Uncomment when auth is implemented
export class CourseGenerationController {
  constructor(private readonly courseGenerationService: CourseGenerationService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Generate a complete course using AI',
    description:
      'Provide a prompt and the AI will generate a complete course with modules, lessons, quizzes, coding questions, and labs',
  })
  @ApiResponse({ status: 201, description: 'Course generated successfully' })
  async generateCourse(
    @Body()
    body: {
      prompt: string;
      difficulty?: string;
      estimatedHours?: number;
      moduleCount?: number;
    },
    @CurrentUser() user: any,
  ) {
    const instructorId = user.id || user.sub;

    return this.courseGenerationService.generateCourse(instructorId, body.prompt, {
      difficulty: body.difficulty,
      estimatedHours: body.estimatedHours,
      moduleCount: body.moduleCount,
    });
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all course generation sessions for the instructor' })
  async listSessions(@CurrentUser() user: any) {
    const instructorId = user.id || user.sub;
    return this.courseGenerationService.listGenerationSessions(instructorId);
  }

  @Get('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific generation session with full content' })
  async getSession(@Param('sessionId') sessionId: string, @CurrentUser() user: any) {
    const instructorId = user.id || user.sub;
    return this.courseGenerationService.getGenerationSession(sessionId, instructorId);
  }

  @Patch('sessions/:sessionId/refine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Refine a specific section of the generated course',
    description:
      'Provide refinement instructions for a specific section (module, lesson, quiz, etc.) and the AI will regenerate it',
  })
  @ApiResponse({ status: 200, description: 'Content refined successfully' })
  async refineSection(
    @Param('sessionId') sessionId: string,
    @Body()
    body: {
      sectionType: string;
      sectionId: string;
      refinementPrompt: string;
    },
    @CurrentUser() user: any,
  ) {
    const instructorId = user.id || user.sub;

    return this.courseGenerationService.refineSection(
      sessionId,
      instructorId,
      body.sectionType,
      body.sectionId,
      body.refinementPrompt,
    );
  }

  @Post('sessions/:sessionId/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Publish the generated course',
    description: 'Convert the AI-generated draft into an actual published course with all modules and lessons',
  })
  @ApiResponse({ status: 200, description: 'Course published successfully' })
  async publishCourse(@Param('sessionId') sessionId: string, @CurrentUser() user: any) {
    const instructorId = user.id || user.sub;
    return this.courseGenerationService.publishGeneratedCourse(sessionId, instructorId);
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a generation session' })
  async deleteSession(@Param('sessionId') sessionId: string, @CurrentUser() user: any) {
    const instructorId = user.id || user.sub;
    return this.courseGenerationService.deleteGenerationSession(sessionId, instructorId);
  }
}
