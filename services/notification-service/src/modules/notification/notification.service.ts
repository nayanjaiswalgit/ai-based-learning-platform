import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';

// Local type definition (not in Prisma schema yet)
enum NotificationType {
  ACHIEVEMENT = 'ACHIEVEMENT',
  COURSE_UPDATE = 'COURSE_UPDATE',
  MESSAGE = 'MESSAGE',
  SYSTEM = 'SYSTEM',
  COURSE_ENROLLMENT = 'COURSE_ENROLLMENT',
  NEW_LESSON = 'NEW_LESSON',
  CODE_EXECUTION_COMPLETE = 'CODE_EXECUTION_COMPLETE',
  DAILY_CHALLENGE = 'DAILY_CHALLENGE',
  BOOTCAMP_SESSION_REMINDER = 'BOOTCAMP_SESSION_REMINDER',
  ASSIGNMENT_DUE = 'ASSIGNMENT_DUE',
  MENTOR_REPLY = 'MENTOR_REPLY',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
}

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {}

  async createNotification(dto: CreateNotificationDto) {
    // Save to database
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data || {},
      },
    });

    // Send real-time notification if user is online
    if (this.notificationGateway.isUserOnline(dto.userId)) {
      await this.notificationGateway.sendToUser(dto.userId, 'new-notification', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  }

  async createBulkNotifications(notifications: CreateNotificationDto[]) {
    const created = await this.prisma.notification.createMany({
      data: notifications.map((dto) => ({
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data || {},
      })),
    });

    // Send real-time notifications to online users
    for (const notification of notifications) {
      if (this.notificationGateway.isUserOnline(notification.userId)) {
        await this.notificationGateway.sendToUser(
          notification.userId,
          'new-notification',
          notification,
        );
      }
    }

    return created;
  }

  async getUserNotifications(userId: string, limit = 50, offset = 0) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const unreadCount = await this.prisma.notification.count({
      where: {
        userId,
        read: false,
        deletedAt: null,
      },
    });

    return {
      notifications,
      unreadCount,
      total: notifications.length,
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    // Emit updated unread count
    const unreadCount = await this.getUnreadCount(userId);
    await this.notificationGateway.sendToUser(userId, 'unread-count-updated', {
      unreadCount,
    });

    return notification;
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    // Emit updated unread count (should be 0)
    await this.notificationGateway.sendToUser(userId, 'unread-count-updated', {
      unreadCount: 0,
    });

    return { success: true };
  }

  async deleteNotification(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        read: false,
        deletedAt: null,
      },
    });
  }

  // Notification type specific methods

  async notifyCourseEnrollment(userId: string, courseTitle: string, courseId: string) {
    return this.createNotification({
      userId,
      type: 'COURSE_ENROLLMENT',
      title: 'Course Enrollment Successful',
      message: `You have successfully enrolled in "${courseTitle}"`,
      data: { courseId, courseTitle },
    });
  }

  async notifyNewLesson(userId: string, lessonTitle: string, courseTitle: string, lessonId: string) {
    return this.createNotification({
      userId,
      type: 'NEW_LESSON',
      title: 'New Lesson Available',
      message: `A new lesson "${lessonTitle}" is now available in "${courseTitle}"`,
      data: { lessonId, lessonTitle, courseTitle },
    });
  }

  async notifyCodeExecutionComplete(
    userId: string,
    questionTitle: string,
    passed: boolean,
    submissionId: string,
  ) {
    return this.createNotification({
      userId,
      type: 'CODE_EXECUTION_COMPLETE',
      title: passed ? 'Code Execution Passed! ✅' : 'Code Execution Failed ❌',
      message: passed
        ? `Your solution for "${questionTitle}" passed all test cases!`
        : `Your solution for "${questionTitle}" failed some test cases.`,
      data: { questionTitle, passed, submissionId },
    });
  }

  async notifyDailyChallenge(userId: string, challengeTitle: string, challengeId: string) {
    return this.createNotification({
      userId,
      type: 'DAILY_CHALLENGE',
      title: 'Daily Challenge Available',
      message: `Today's challenge: "${challengeTitle}"`,
      data: { challengeId, challengeTitle },
    });
  }

  async notifyBootcampSession(
    userId: string,
    sessionTitle: string,
    sessionTime: Date,
    sessionId: string,
  ) {
    return this.createNotification({
      userId,
      type: 'BOOTCAMP_SESSION_REMINDER',
      title: 'Bootcamp Session Reminder',
      message: `"${sessionTitle}" starts at ${sessionTime.toLocaleString()}`,
      data: { sessionId, sessionTitle, sessionTime },
    });
  }

  async notifyAssignmentDue(
    userId: string,
    assignmentTitle: string,
    dueDate: Date,
    assignmentId: string,
  ) {
    return this.createNotification({
      userId,
      type: 'ASSIGNMENT_DUE',
      title: 'Assignment Due Soon',
      message: `"${assignmentTitle}" is due on ${dueDate.toLocaleDateString()}`,
      data: { assignmentId, assignmentTitle, dueDate },
    });
  }

  async notifyMentorReply(userId: string, mentorName: string, threadTitle: string, replyId: string) {
    return this.createNotification({
      userId,
      type: 'MENTOR_REPLY',
      title: 'Mentor Replied',
      message: `${mentorName} replied to your question in "${threadTitle}"`,
      data: { mentorName, threadTitle, replyId },
    });
  }

  async notifyAchievementUnlocked(
    userId: string,
    achievementTitle: string,
    achievementDescription: string,
    achievementId: string,
  ) {
    return this.createNotification({
      userId,
      type: 'ACHIEVEMENT_UNLOCKED',
      title: '🏆 Achievement Unlocked!',
      message: `You earned "${achievementTitle}": ${achievementDescription}`,
      data: { achievementId, achievementTitle, achievementDescription },
    });
  }
}
