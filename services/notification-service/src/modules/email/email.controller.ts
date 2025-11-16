import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailTemplateService } from './email-template.service';

@Controller('emails')
export class EmailController {
  constructor(
    private emailService: EmailService,
    private emailTemplateService: EmailTemplateService,
  ) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendEmail(@Body() body: {
    to: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
  }) {
    return this.emailService.sendEmail(
      body.to,
      body.subject,
      body.htmlContent,
      body.textContent,
    );
  }

  @Post('welcome')
  @HttpCode(HttpStatus.OK)
  async sendWelcomeEmail(@Body() body: {
    userId: string;
    email: string;
    userName: string;
  }) {
    return this.emailService.sendWelcomeEmail(body.userId, body.email, body.userName);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async sendVerificationEmail(@Body() body: {
    userId: string;
    email: string;
    verificationToken: string;
  }) {
    return this.emailService.sendEmailVerification(
      body.userId,
      body.email,
      body.verificationToken,
    );
  }

  @Post('password-reset')
  @HttpCode(HttpStatus.OK)
  async sendPasswordReset(@Body() body: {
    userId: string;
    email: string;
    resetToken: string;
  }) {
    return this.emailService.sendPasswordReset(
      body.userId,
      body.email,
      body.resetToken,
    );
  }

  @Get('preferences/:userId')
  async getEmailPreferences(@Param('userId') userId: string) {
    return this.emailTemplateService.getEmailPreferences(userId);
  }

  @Put('preferences/:userId')
  @HttpCode(HttpStatus.OK)
  async updateEmailPreferences(
    @Param('userId') userId: string,
    @Body() preferences: any,
  ) {
    return this.emailService.updateEmailPreferences(userId, preferences);
  }

  @Get('templates')
  async getAllTemplates() {
    return this.emailTemplateService.getAllTemplates();
  }

  @Get('templates/:id')
  async getTemplate(@Param('id') id: string) {
    return this.emailTemplateService.getTemplate(id);
  }

  @Post('templates')
  async createCustomTemplate(@Body() body: any) {
    return this.emailTemplateService.createCustomTemplate(body);
  }

  @Put('templates/:id')
  async updateTemplate(@Param('id') id: string, @Body() body: any) {
    return this.emailTemplateService.updateTemplate(id, body);
  }
}
