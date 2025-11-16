import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ModulesService } from '../services/modules.service';
import { CreateModuleDto } from '../dto/create-module.dto';

@ApiTags('modules')
@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new module' })
  create(@Body() createModuleDto: CreateModuleDto) {
    return this.modulesService.create(createModuleDto);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all modules for a course' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.modulesService.findAll(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single module' })
  findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a module' })
  update(@Param('id') id: string, @Body() updateData: Partial<CreateModuleDto>) {
    return this.modulesService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a module' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.modulesService.remove(id);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder modules' })
  reorder(@Body() data: { courseId: string; moduleOrders: { id: string; orderIndex: number }[] }) {
    return this.modulesService.reorder(data.courseId, data.moduleOrders);
  }
}
