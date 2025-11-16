import { Module } from '@nestjs/common';
import { ContentGenerationController } from './content-generation.controller';
import { ContentGenerationService } from './content-generation.service';

@Module({
  controllers: [ContentGenerationController],
  providers: [ContentGenerationService],
  exports: [ContentGenerationService],
})
export class ContentGenerationModule {}
