import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationModule } from './modules/notification/notification.module';
import { EmailModule } from './modules/email/email.module';
import { PushNotificationModule } from './modules/push-notification/push-notification.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { ForumModule } from './modules/forum/forum.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    NotificationModule,
    EmailModule,
    PushNotificationModule,
    MessagingModule,
    ForumModule,
  ],
})
export class AppModule {}
