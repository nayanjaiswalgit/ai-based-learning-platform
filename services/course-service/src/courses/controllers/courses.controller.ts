import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CoursesService } from '../services/courses.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses with filters' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'instructorId', required: false, type: String })
  @ApiQuery({ name: 'difficulty', required: false, type: String })
  @ApiQuery({ name: 'isFree', required: false, type: Boolean })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
    @Query('instructorId') instructorId?: string,
    @Query('difficulty') difficulty?: string,
    @Query('isFree') isFree?: string,
  ) {
    return this.coursesService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      search,
      instructorId,
      difficulty,
      isFree: isFree ? isFree === 'true' : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single course by ID or slug' })
  @ApiResponse({ status: 200, description: 'Course found' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a course' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish or unpublish a course' })
  @ApiResponse({ status: 200, description: 'Course publish status updated' })
  togglePublish(@Param('id') id: string, @Body('isPublished') isPublished: boolean) {
    return this.coursesService.togglePublish(id, isPublished);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get course analytics' })
  @ApiResponse({ status: 200, description: 'Course analytics retrieved' })
  getAnalytics(@Param('id') id: string) {
    return this.coursesService.getCourseAnalytics(id);
  }
}
