import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { VectorSearchService } from './vector-search.service';
import { SearchDto, IndexContentDto, SimilarContentDto, StudentsAlsoTookDto } from './dto/vector-search.dto';

@Controller('vector-search')
export class VectorSearchController {
  constructor(private readonly vectorSearchService: VectorSearchService) {}

  /**
   * POST /vector-search
   * Semantic search for content
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async search(@Body() dto: SearchDto) {
    return this.vectorSearchService.search(dto);
  }

  /**
   * POST /vector-search/index
   * Index content for semantic search
   */
  @Post('index')
  @HttpCode(HttpStatus.CREATED)
  async indexContent(@Body() dto: IndexContentDto) {
    return this.vectorSearchService.indexContent(dto);
  }

  /**
   * POST /vector-search/batch-index
   * Batch index multiple content items
   */
  @Post('batch-index')
  @HttpCode(HttpStatus.CREATED)
  async batchIndexContent(@Body() items: IndexContentDto[]) {
    return this.vectorSearchService.batchIndexContent(items);
  }

  /**
   * POST /vector-search/similar
   * Find similar content
   */
  @Post('similar')
  @HttpCode(HttpStatus.OK)
  async findSimilarContent(@Body() dto: SimilarContentDto) {
    return this.vectorSearchService.findSimilarContent(dto);
  }

  /**
   * POST /vector-search/students-also-took
   * Get courses students also took
   */
  @Post('students-also-took')
  @HttpCode(HttpStatus.OK)
  async getStudentsAlsoTook(@Body() dto: StudentsAlsoTookDto) {
    return this.vectorSearchService.getStudentsAlsoTook(dto);
  }
}
