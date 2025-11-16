import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailTemplateService } from './email-template.service';
import { EmailController } from './email.controller';
import { EmailScheduler } from './email.scheduler';

@Module({
  providers: [EmailService, EmailTemplateService, EmailScheduler],
  controllers: [EmailController],
  exports: [EmailService, EmailTemplateService],
})
export class EmailModule {}
