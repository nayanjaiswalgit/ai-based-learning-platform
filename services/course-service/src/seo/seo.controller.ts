import { Controller, Get, Post, Put, Param, Body, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SEOService } from './services/seo.service';
import { SitemapService } from './services/sitemap.service';

@ApiTags('seo')
@Controller('seo')
export class SEOController {
  constructor(
    private readonly seoService: SEOService,
    private readonly sitemapService: SitemapService,
  ) {}

  @Post('generate/:courseId')
  @ApiOperation({ summary: 'Generate SEO metadata for a course' })
  generateSEO(@Param('courseId') courseId: string) {
    return this.seoService.generateCourseSEO(courseId);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get SEO metadata for a course' })
  getCourseSEO(@Param('courseId') courseId: string) {
    return this.seoService.getCourseSEO(courseId);
  }

  @Put('course/:courseId')
  @ApiOperation({ summary: 'Update SEO metadata for a course' })
  updateCourseSEO(@Param('courseId') courseId: string, @Body() seoData: any) {
    return this.seoService.updateCourseSEO(courseId, seoData);
  }

  @Post('regenerate-all')
  @ApiOperation({ summary: 'Regenerate SEO for all published courses' })
  regenerateAll() {
    return this.seoService.regenerateAllSEO();
  }

  @Get('sitemap.xml')
  @ApiOperation({ summary: 'Get course sitemap XML' })
  @Header('Content-Type', 'application/xml')
  @ApiResponse({ status: 200, description: 'Returns sitemap XML' })
  async getSitemap() {
    return this.sitemapService.generateFullSitemap();
  }

  @Get('robots.txt')
  @ApiOperation({ summary: 'Get robots.txt' })
  @Header('Content-Type', 'text/plain')
  getRobotsTxt() {
    return this.sitemapService.generateRobotsTxt();
  }

  @Post('submit-sitemap')
  @ApiOperation({ summary: 'Submit sitemap to search engines' })
  submitSitemap(@Body('sitemapUrl') sitemapUrl: string) {
    return this.sitemapService.submitToSearchEngines(sitemapUrl);
  }
}
