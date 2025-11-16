import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LessonsService } from '../services/lessons.service';
import { CreateLessonDto } from '../dto/create-lesson.dto';

@ApiTags('lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lesson' })
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.create(createLessonDto);
  }

  @Get('module/:moduleId')
  @ApiOperation({ summary: 'Get all lessons for a module' })
  findByModule(@Param('moduleId') moduleId: string) {
    return this.lessonsService.findAll(moduleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single lesson' })
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a lesson' })
  update(@Param('id') id: string, @Body() updateData: Partial<CreateLessonDto>) {
    return this.lessonsService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lesson' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(id);
  }

  @Post(':id/bookmark')
  @ApiOperation({ summary: 'Add a video bookmark/chapter' })
  addBookmark(
    @Param('id') lessonId: string,
    @Body() data: { title: string; timestampSeconds: number; description?: string },
  ) {
    return this.lessonsService.addBookmark(lessonId, data.title, data.timestampSeconds, data.description);
  }

  @Get(':id/progress/:userId')
  @ApiOperation({ summary: 'Get watch progress for a user' })
  getProgress(@Param('id') lessonId: string, @Param('userId') userId: string) {
    return this.lessonsService.getWatchProgress(userId, lessonId);
  }

  @Post(':id/progress')
  @ApiOperation({ summary: 'Update watch progress' })
  updateProgress(
    @Param('id') lessonId: string,
    @Body() data: { userId: string; currentTimeSeconds: number; totalTimeSeconds: number; completed?: boolean },
  ) {
    return this.lessonsService.updateWatchProgress(
      data.userId,
      lessonId,
      data.currentTimeSeconds,
      data.totalTimeSeconds,
      data.completed,
    );
  }
}
