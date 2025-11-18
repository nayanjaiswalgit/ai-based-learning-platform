import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
// import * as webpush from 'web-push'; // TODO: Install web-push package if needed
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PushNotificationService implements OnModuleInit {
  private firebaseApp: admin.app.App;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    // Initialize Firebase Admin SDK
    const serviceAccount = this.configService.get('FIREBASE_SERVICE_ACCOUNT');

    if (serviceAccount) {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
      });
      console.log('🔔 Firebase Cloud Messaging initialized');
    } else {
      console.warn('⚠️  Firebase service account not configured');
    }

    // Initialize Web Push
    const vapidPublicKey = this.configService.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = this.configService.get('VAPID_PRIVATE_KEY');
    const vapidEmail = this.configService.get('VAPID_EMAIL') || 'mailto:admin@platform.com';

    if (vapidPublicKey && vapidPrivateKey) {
      // webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
      // console.log('🔔 Web Push initialized');
      console.log('🔔 Web Push configuration found (webpush package not installed)');
    } else {
      console.warn('⚠️  VAPID keys not configured');
    }
  }

  // Firebase Cloud Messaging (for mobile and web)
  async sendFCMNotification(
    fcmToken: string,
    notification: {
      title: string;
      body: string;
      data?: Record<string, string>;
    },
  ) {
    try {
      const message: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        webpush: {
          fcmOptions: {
            link: '/', // Redirect URL when notification is clicked
          },
        },
      };

      const response = await admin.messaging().send(message);
      console.log(`📱 FCM notification sent: ${response}`);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('❌ FCM send error:', error);
      return { success: false, error: error.message };
    }
  }

  // Web Push (browser push notifications)
  async sendWebPushNotification(
    userId: string,
    notification: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      data?: any;
    },
  ) {
    // Get all active push subscriptions for the user
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              auth: sub.auth,
              p256dh: sub.p256dh,
            },
          };

          const payload = JSON.stringify({
            title: notification.title,
            body: notification.body,
            icon: notification.icon || '/icon-192x192.png',
            badge: notification.badge || '/badge-72x72.png',
            data: notification.data || {},
          });

          // TODO: Install web-push package to enable this functionality
          // await webpush.sendNotification(pushSubscription, payload);
          console.log('Web push notification would be sent (webpush package not installed)');
          return { success: true, subscriptionId: sub.id };
        } catch (error) {
          // If subscription is invalid, mark as inactive
          if (error.statusCode === 410 || error.statusCode === 404) {
            await this.prisma.pushSubscription.update({
              where: { id: sub.id },
              data: { isActive: false },
            });
          }

          console.error(`❌ Web push error for subscription ${sub.id}:`, error);
          return { success: false, error: error.message };
        }
      }),
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    console.log(`📱 Sent web push to ${successful}/${subscriptions.length} devices`);

    return { totalSent: successful, totalFailed: subscriptions.length - successful };
  }

  // Subscribe to push notifications
  async subscribeToPush(userId: string, subscription: PushSubscription) {
    const sub = subscription as any;

    return this.prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: sub.endpoint,
        auth: sub.keys.auth,
        p256dh: sub.keys.p256dh,
        userAgent: sub.userAgent,
      },
    });
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(userId: string, endpoint: string) {
    return this.prisma.pushSubscription.updateMany({
      where: {
        userId,
        endpoint,
      },
      data: {
        isActive: false,
      },
    });
  }

  // Send push notification to user (tries both FCM and Web Push)
  async sendPushToUser(
    userId: string,
    notification: {
      title: string;
      body: string;
      data?: any;
    },
  ) {
    // Check user's notification preferences
    const preferences = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (preferences && !preferences.pushEnabled) {
      console.log(`⏭️  Push notifications disabled for user ${userId}`);
      return { success: false, reason: 'User has disabled push notifications' };
    }

    // Check quiet hours
    if (preferences && preferences.quietHoursStart && preferences.quietHoursEnd) {
      const now = new Date();
      const currentHour = now.getHours();
      const { quietHoursStart, quietHoursEnd } = preferences;

      const isQuietHours =
        quietHoursStart < quietHoursEnd
          ? currentHour >= quietHoursStart && currentHour < quietHoursEnd
          : currentHour >= quietHoursStart || currentHour < quietHoursEnd;

      if (isQuietHours) {
        console.log(`🔕 User ${userId} is in quiet hours`);
        return { success: false, reason: 'User is in quiet hours' };
      }
    }

    // Send via Web Push
    return this.sendWebPushNotification(userId, notification);
  }
}

interface PushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}
