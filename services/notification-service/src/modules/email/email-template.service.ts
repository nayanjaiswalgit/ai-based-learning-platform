import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailTemplateType } from '@prisma/client';

@Injectable()
export class EmailTemplateService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Initialize default email templates on startup
    await this.seedDefaultTemplates();
  }

  private async seedDefaultTemplates() {
    const templates = [
      {
        name: 'Welcome Email',
        type: EmailTemplateType.WELCOME,
        subject: 'Welcome to {{platformName}}! 🎉',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome, {{userName}}!</h1>
              </div>
              <div class="content">
                <p>We're excited to have you join our learning community! 🚀</p>
                <p>Your learning journey starts now. Here's what you can do:</p>
                <ul>
                  <li>Browse thousands of courses</li>
                  <li>Practice coding challenges</li>
                  <li>Get personalized learning roadmaps</li>
                  <li>Join bootcamps and cohorts</li>
                  <li>Earn achievements and certificates</li>
                </ul>
                <p style="text-align: center;">
                  <a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>
                </p>
                <p>Happy learning!</p>
              </div>
              <div class="footer">
                <p>© 2024 Learning Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: 'Welcome to the platform, {{userName}}! Visit {{dashboardUrl}} to get started.',
        variables: { userName: 'string', dashboardUrl: 'string', platformName: 'string' },
      },
      {
        name: 'Email Verification',
        type: EmailTemplateType.EMAIL_VERIFICATION,
        subject: 'Please verify your email address',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
              .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Thanks for signing up! Please click the button below to verify your email address:</p>
                <p style="text-align: center;">
                  <a href="{{verificationUrl}}" class="button">Verify Email</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">{{verificationUrl}}</p>
                <div class="warning">
                  <strong>⚠️ This link will expire in {{expiryHours}} hours.</strong>
                </div>
                <p>If you didn't create an account, please ignore this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: 'Verify your email: {{verificationUrl}}',
        variables: { verificationUrl: 'string', expiryHours: 'number' },
      },
      {
        name: 'Password Reset',
        type: EmailTemplateType.PASSWORD_RESET,
        subject: 'Reset your password',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
              .button { display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <h2>Reset Your Password</h2>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <p style="text-align: center;">
                  <a href="{{resetUrl}}" class="button">Reset Password</a>
                </p>
                <p><strong>This link will expire in {{expiryHours}} hour.</strong></p>
                <p>If you didn't request a password reset, please ignore this email or contact support if you're concerned.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: 'Reset your password: {{resetUrl}}',
        variables: { resetUrl: 'string', expiryHours: 'number' },
      },
      {
        name: 'Course Enrollment',
        type: EmailTemplateType.COURSE_ENROLLMENT,
        subject: 'You\'re enrolled in {{courseTitle}}',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
              .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <h2>🎉 Enrollment Confirmed!</h2>
                <p>Great news! You're now enrolled in <strong>{{courseTitle}}</strong> by {{instructorName}}.</p>
                <p>You can start learning right away:</p>
                <p style="text-align: center;">
                  <a href="{{courseUrl}}" class="button">Start Learning</a>
                </p>
                <p>Happy learning!</p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: 'You\'re enrolled in {{courseTitle}}! Start learning: {{courseUrl}}',
        variables: { courseTitle: 'string', instructorName: 'string', courseUrl: 'string' },
      },
      {
        name: 'Weekly Progress',
        type: EmailTemplateType.WEEKLY_PROGRESS,
        subject: 'Your learning progress this week 📊',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
              .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
              .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .stat-number { font-size: 32px; font-weight: bold; color: #667eea; }
              .stat-label { color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <h2>📊 Your Week in Review</h2>
                <p>Here's what you accomplished this week:</p>
                <div class="stats">
                  <div class="stat-card">
                    <div class="stat-number">{{coursesCompleted}}</div>
                    <div class="stat-label">Courses Completed</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number">{{problemsSolved}}</div>
                    <div class="stat-label">Problems Solved</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number">{{hoursLearned}}</div>
                    <div class="stat-label">Hours Learned</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number">{{streak}}</div>
                    <div class="stat-label">Day Streak 🔥</div>
                  </div>
                </div>
                {{#if achievements}}
                <p><strong>New Achievements:</strong></p>
                <ul>
                  {{#each achievements}}
                  <li>{{this}}</li>
                  {{/each}}
                </ul>
                {{/if}}
                <p>Keep up the great work!</p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: 'Your weekly progress: {{coursesCompleted}} courses, {{problemsSolved}} problems, {{hoursLearned}} hours',
        variables: { coursesCompleted: 'number', problemsSolved: 'number', hoursLearned: 'number', streak: 'number', achievements: 'array' },
      },
    ];

    for (const template of templates) {
      await this.prisma.emailTemplate.upsert({
        where: { name: template.name },
        update: {},
        create: template as any,
      });
    }

    console.log('📧 Email templates initialized');
  }

  async getAllTemplates() {
    return this.prisma.emailTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTemplate(id: string) {
    return this.prisma.emailTemplate.findUnique({
      where: { id },
    });
  }

  async createCustomTemplate(data: any) {
    return this.prisma.emailTemplate.create({
      data: {
        ...data,
        isCustom: true,
      },
    });
  }

  async updateTemplate(id: string, data: any) {
    return this.prisma.emailTemplate.update({
      where: { id },
      data,
    });
  }

  async getEmailPreferences(userId: string) {
    return this.prisma.emailPreference.findUnique({
      where: { userId },
    });
  }
}
