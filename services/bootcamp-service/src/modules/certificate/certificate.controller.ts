import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CertificateService } from './certificate.service';
import { TemplateService } from './template.service';

@ApiTags('Certificates')
@Controller('certificates')
export class CertificateController {
  constructor(
    private certificateService: CertificateService,
    private templateService: TemplateService,
  ) {}

  @Post('generate/:enrollmentId')
  @ApiOperation({ summary: 'Generate certificate for bootcamp completion' })
  @ApiBearerAuth()
  async generateCertificate(@Param('enrollmentId') enrollmentId: string) {
    return this.certificateService.generateBootcampCertificate(enrollmentId);
  }

  @Get('verify/:certificateNumber')
  @ApiOperation({ summary: 'Verify certificate' })
  async verifyCertificate(@Param('certificateNumber') certificateNumber: string) {
    return this.certificateService.verifyCertificate(certificateNumber);
  }

  @Get('my/certificates')
  @ApiOperation({ summary: 'Get my certificates' })
  @ApiBearerAuth()
  async getMyCertificates(
    @Request() req: any,
    @Query('type') type?: string,
  ) {
    return this.certificateService.getUserCertificates(req.user.id, { type });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get certificate details' })
  async findOne(@Param('id') id: string) {
    return this.certificateService.findOne(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download certificate PDF' })
  async downloadCertificate(@Param('id') id: string) {
    return this.certificateService.downloadCertificate(id);
  }

  @Get(':id/linkedin-share')
  @ApiOperation({ summary: 'Get LinkedIn share URL' })
  async getLinkedInShareUrl(@Param('id') id: string) {
    return this.certificateService.getLinkedInShareUrl(id);
  }

  @Put(':id/revoke')
  @ApiOperation({ summary: 'Revoke certificate' })
  @ApiBearerAuth()
  async revokeCertificate(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.certificateService.revoke(id, reason);
  }

  // Template endpoints
  @Post('templates')
  @ApiOperation({ summary: 'Create certificate template' })
  @ApiBearerAuth()
  async createTemplate(@Request() req: any, @Body() data: any) {
    return this.templateService.create({
      ...data,
      createdBy: req.user.id,
    });
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all templates' })
  async getTemplates(
    @Query('bootcampId') bootcampId?: string,
    @Query('templateType') templateType?: string,
    @Query('activeOnly') activeOnly?: boolean,
  ) {
    return this.templateService.findAll({ bootcampId, templateType, activeOnly });
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get template details' })
  async getTemplate(@Param('id') id: string) {
    return this.templateService.findOne(id);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Update template' })
  @ApiBearerAuth()
  async updateTemplate(@Param('id') id: string, @Body() data: any) {
    return this.templateService.update(id, data);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete template' })
  @ApiBearerAuth()
  async deleteTemplate(@Param('id') id: string) {
    return this.templateService.delete(id);
  }

  @Put('templates/:id/toggle-active')
  @ApiOperation({ summary: 'Toggle template active status' })
  @ApiBearerAuth()
  async toggleTemplateActive(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.templateService.toggleActive(id, isActive);
  }
}
