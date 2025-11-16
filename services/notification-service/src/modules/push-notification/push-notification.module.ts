import { Module } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { PushNotificationController } from './push-notification.controller';

@Module({
  providers: [PushNotificationService],
  controllers: [PushNotificationController],
  exports: [PushNotificationService],
})
export class PushNotificationModule {}
