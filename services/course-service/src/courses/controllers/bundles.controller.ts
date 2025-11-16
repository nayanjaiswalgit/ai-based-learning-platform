import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BundlesService } from '../services/bundles.service';
import { CreateBundleDto } from '../dto/create-bundle.dto';

@ApiTags('bundles')
@Controller('bundles')
export class BundlesController {
  constructor(private readonly bundlesService: BundlesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course bundle' })
  create(@Body() createBundleDto: CreateBundleDto) {
    return this.bundlesService.create(createBundleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bundles' })
  findAll(@Query('isActive') isActive?: string) {
    return this.bundlesService.findAll(isActive ? isActive === 'true' : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single bundle' })
  findOne(@Param('id') id: string) {
    return this.bundlesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a bundle' })
  update(@Param('id') id: string, @Body() updateData: Partial<CreateBundleDto>) {
    return this.bundlesService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bundle' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.bundlesService.remove(id);
  }

  @Get(':id/value')
  @ApiOperation({ summary: 'Calculate bundle value and savings' })
  calculateValue(@Param('id') id: string) {
    return this.bundlesService.calculateBundleValue(id);
  }
}
