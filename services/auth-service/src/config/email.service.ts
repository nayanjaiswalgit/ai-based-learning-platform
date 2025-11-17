import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

    await this.resend.emails.send({
      from: this.configService.get<string>('SMTP_FROM') || 'noreply@example.com',
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to AI Learning Platform!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <a href="${verificationLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Verify Email Address
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #6B7280; font-size: 14px;">${verificationLink}</p>
          <p style="color: #6B7280; font-size: 12px; margin-top: 40px;">
            If you didn't create an account, please ignore this email.
          </p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await this.resend.emails.send({
      from: this.configService.get<string>('SMTP_FROM') || 'noreply@example.com',
      to: email,
      subject: 'Reset your password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Reset Password
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #6B7280; font-size: 14px;">${resetLink}</p>
          <p style="color: #EF4444; font-size: 14px; margin-top: 20px;">
            This link will expire in 1 hour.
          </p>
          <p style="color: #6B7280; font-size: 12px; margin-top: 40px;">
            If you didn't request a password reset, please ignore this email or contact support if you have concerns.
          </p>
        </div>
      `,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.resend.emails.send({
      from: this.configService.get<string>('SMTP_FROM') || 'noreply@example.com',
      to: email,
      subject: 'Welcome to AI Learning Platform!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome ${name}!</h2>
          <p>Your email has been verified successfully. You can now access all features of the AI Learning Platform.</p>
          <p>Start your learning journey today:</p>
          <ul style="line-height: 1.8;">
            <li>Browse our course catalog</li>
            <li>Take skill assessments</li>
            <li>Get personalized roadmaps</li>
            <li>Practice coding challenges</li>
            <li>Join bootcamp cohorts</li>
          </ul>
          <a href="${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/dashboard" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Go to Dashboard
          </a>
        </div>
      `,
    });
  }
}
