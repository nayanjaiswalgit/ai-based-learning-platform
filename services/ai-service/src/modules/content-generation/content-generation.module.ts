import { Module } from '@nestjs/common';
import { ContentGenerationController } from './content-generation.controller';
import { ContentGenerationService } from './content-generation.service';
import { OpenAIService } from '../../common/services/openai.service';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  controllers: [ContentGenerationController],
  providers: [ContentGenerationService, OpenAIService, PrismaService],
  exports: [ContentGenerationService],
})
export class ContentGenerationModule {}
