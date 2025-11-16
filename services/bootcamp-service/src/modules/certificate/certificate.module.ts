import { Module } from '@nestjs/common';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { TemplateService } from './template.service';
import { PdfGeneratorService } from './pdf-generator.service';

@Module({
  controllers: [CertificateController],
  providers: [CertificateService, TemplateService, PdfGeneratorService],
  exports: [CertificateService],
})
export class CertificateModule {}
