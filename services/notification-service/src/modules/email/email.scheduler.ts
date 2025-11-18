import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { ScheduledStatus } from './email-types';

@Injectable()
export class EmailScheduler {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  // Check for scheduled notifications every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledNotifications() {
    const now = new Date();

    const scheduled = await this.prisma.scheduledNotification.findMany({
      where: {
        scheduledFor: { lte: now },
        status: ScheduledStatus.PENDING,
      },
      take: 100, // Process 100 at a time
    });

    for (const notification of scheduled) {
      try {
        // Send notification
        // Implementation depends on notification type
        // For now, mark as sent
        await this.prisma.scheduledNotification.update({
          where: { id: notification.id },
          data: {
            status: ScheduledStatus.SENT,
            sentAt: new Date(),
          },
        });

        console.log(`📨 Sent scheduled notification ${notification.id}`);
      } catch (error) {
        await this.prisma.scheduledNotification.update({
          where: { id: notification.id },
          data: {
            status: ScheduledStatus.FAILED,
            errorMessage: error.message,
          },
        });

        console.error(`❌ Failed to send notification ${notification.id}:`, error);
      }
    }
  }

  // Send weekly progress emails every Sunday at 9 AM
  @Cron('0 9 * * 0')
  async sendWeeklyProgressEmails() {
    console.log('📊 Sending weekly progress emails...');
    // Implementation to fetch users and send progress emails
  }
}
