import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SEOController } from './seo.controller';
import { SEOService } from './services/seo.service';
import { SitemapService } from './services/sitemap.service';
import { OpenAIService } from './services/openai.service';

@Module({
  imports: [ConfigModule],
  controllers: [SEOController],
  providers: [SEOService, SitemapService, OpenAIService],
  exports: [SEOService, SitemapService],
})
export class SEOModule {}
