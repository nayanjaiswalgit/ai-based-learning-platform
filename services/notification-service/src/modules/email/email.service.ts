import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';
import { EmailTemplateType, EmailStatus } from './email-types';
import Handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private resend: Resend;
  private fromEmail: string;
  private fromName: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get('RESEND_API_KEY');
    if (!apiKey) {
      console.warn('⚠️  RESEND_API_KEY not configured. Email sending will be disabled.');
    }
    this.resend = new Resend(apiKey);
    this.fromEmail = this.configService.get('EMAIL_FROM') || 'noreply@platform.com';
    this.fromName = this.configService.get('EMAIL_FROM_NAME') || 'Learning Platform';
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
    templateId?: string,
    recipientId?: string,
  ) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to,
        subject,
        html: htmlContent,
        text: textContent,
      });

      if (error) {
        console.error('❌ Email send error:', error);

        // Log failed email
        if (recipientId) {
          await this.prisma.sentEmail.create({
            data: {
              templateId,
              recipientId,
              email: to,
              subject,
              status: EmailStatus.FAILED,
              errorMessage: error.message,
            },
          });
        }

        return { success: false, error: error.message };
      }

      console.log(`📧 Email sent to ${to} (ID: ${data?.id})`);

      // Log successful email
      if (recipientId) {
        await this.prisma.sentEmail.create({
          data: {
            templateId,
            recipientId,
            email: to,
            subject,
            status: EmailStatus.SENT,
            sentAt: new Date(),
            metadata: { emailId: data?.id },
          },
        });
      }

      return { success: true, emailId: data?.id };
    } catch (error) {
      console.error('❌ Email send exception:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTemplateEmail(
    templateType: EmailTemplateType,
    to: string,
    recipientId: string,
    variables: Record<string, any>,
    customTemplateId?: string,
  ) {
    // Get template (custom if instructor specified, otherwise default)
    const template = await this.prisma.emailTemplate.findFirst({
      where: customTemplateId
        ? { id: customTemplateId }
        : { type: templateType, isCustom: false, isActive: true },
    });

    if (!template) {
      console.error(`❌ Template not found: ${templateType}`);
      return { success: false, error: 'Template not found' };
    }

    // Compile template with Handlebars
    const htmlTemplate = Handlebars.compile(template.htmlContent);
    const subjectTemplate = Handlebars.compile(template.subject);

    const htmlContent = htmlTemplate(variables);
    const subject = subjectTemplate(variables);

    let textContent = template.textContent;
    if (textContent) {
      const textTemplate = Handlebars.compile(textContent);
      textContent = textTemplate(variables);
    }

    return this.sendEmail(
      to,
      subject,
      htmlContent,
      textContent,
      template.id,
      recipientId,
    );
  }

  // Transactional Emails

  async sendWelcomeEmail(userId: string, email: string, userName: string) {
    return this.sendTemplateEmail(
      EmailTemplateType.WELCOME,
      email,
      userId,
      {
        userName,
        loginUrl: `${this.configService.get('FRONTEND_URL')}/login`,
        dashboardUrl: `${this.configService.get('FRONTEND_URL')}/dashboard`,
      },
    );
  }

  async sendEmailVerification(userId: string, email: string, verificationToken: string) {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${verificationToken}`;

    return this.sendTemplateEmail(
      EmailTemplateType.EMAIL_VERIFICATION,
      email,
      userId,
      {
        verificationUrl,
        expiryHours: 24,
      },
    );
  }

  async sendPasswordReset(userId: string, email: string, resetToken: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    return this.sendTemplateEmail(
      EmailTemplateType.PASSWORD_RESET,
      email,
      userId,
      {
        resetUrl,
        expiryHours: 1,
      },
    );
  }

  async sendPaymentConfirmation(
    userId: string,
    email: string,
    paymentDetails: {
      amount: number;
      currency: string;
      itemName: string;
      transactionId: string;
    },
  ) {
    return this.sendTemplateEmail(
      EmailTemplateType.PAYMENT_CONFIRMATION,
      email,
      userId,
      {
        ...paymentDetails,
        receiptUrl: `${this.configService.get('FRONTEND_URL')}/receipts/${paymentDetails.transactionId}`,
      },
    );
  }

  async sendCourseEnrollment(
    userId: string,
    email: string,
    courseTitle: string,
    courseId: string,
    instructorName: string,
  ) {
    return this.sendTemplateEmail(
      EmailTemplateType.COURSE_ENROLLMENT,
      email,
      userId,
      {
        courseTitle,
        instructorName,
        courseUrl: `${this.configService.get('FRONTEND_URL')}/courses/${courseId}`,
      },
    );
  }

  // Marketing Emails

  async sendWeeklyProgress(
    userId: string,
    email: string,
    progressData: {
      coursesCompleted: number;
      problemsSolved: number;
      hoursLearned: number;
      streak: number;
      achievements: string[];
    },
  ) {
    return this.sendTemplateEmail(
      EmailTemplateType.WEEKLY_PROGRESS,
      email,
      userId,
      {
        ...progressData,
        dashboardUrl: `${this.configService.get('FRONTEND_URL')}/dashboard`,
      },
    );
  }

  async sendCourseRecommendations(
    userId: string,
    email: string,
    recommendations: Array<{ title: string; instructor: string; id: string }>,
  ) {
    return this.sendTemplateEmail(
      EmailTemplateType.NEW_COURSE_RECOMMENDATION,
      email,
      userId,
      {
        recommendations: recommendations.map((course) => ({
          ...course,
          url: `${this.configService.get('FRONTEND_URL')}/courses/${course.id}`,
        })),
        browseUrl: `${this.configService.get('FRONTEND_URL')}/courses`,
      },
    );
  }

  async sendBootcampAnnouncement(
    userIds: string[],
    bootcampName: string,
    bootcampId: string,
    startDate: Date,
    announcementMessage: string,
  ) {
    // Fetch users with email preferences
    const users = await this.prisma.emailPreference.findMany({
      where: {
        userId: { in: userIds },
        bootcampNotifications: true,
      },
      select: {
        userId: true,
      },
    });

    // In production, use a proper user service to get email addresses
    // For now, this is a placeholder
    const results = await Promise.all(
      users.map(async (user) => {
        // Get user email from user service
        const userEmail = `user-${user.userId}@example.com`; // Placeholder

        return this.sendTemplateEmail(
          EmailTemplateType.BOOTCAMP_ANNOUNCEMENT,
          userEmail,
          user.userId,
          {
            bootcampName,
            startDate: startDate.toLocaleDateString(),
            announcementMessage,
            bootcampUrl: `${this.configService.get('FRONTEND_URL')}/bootcamps/${bootcampId}`,
          },
        );
      }),
    );

    return results;
  }

  async sendInstructorBroadcast(
    instructorId: string,
    studentIds: string[],
    subject: string,
    message: string,
    customTemplateId?: string,
  ) {
    const results = await Promise.all(
      studentIds.map(async (studentId) => {
        // Get student email from user service
        const studentEmail = `student-${studentId}@example.com`; // Placeholder

        return this.sendTemplateEmail(
          EmailTemplateType.INSTRUCTOR_BROADCAST,
          studentEmail,
          studentId,
          {
            subject,
            message,
            instructorId,
          },
          customTemplateId,
        );
      }),
    );

    return results;
  }

  // Email Preference Management

  async checkEmailPreference(userId: string, preferenceType: string): Promise<boolean> {
    const preferences = await this.prisma.emailPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      return true; // Default to sending if no preferences set
    }

    return preferences[preferenceType] ?? true;
  }

  async updateEmailPreferences(userId: string, preferences: Partial<any>) {
    return this.prisma.emailPreference.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...preferences,
      },
    });
  }
}
