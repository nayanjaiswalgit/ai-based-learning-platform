import { Controller, Post, Delete, Body, Param } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';

@Controller('push-notifications')
export class PushNotificationController {
  constructor(private pushService: PushNotificationService) {}

  @Post('subscribe')
  async subscribe(@Body() body: { userId: string; subscription: any }) {
    return this.pushService.subscribeToPush(body.userId, body.subscription);
  }

  @Delete('unsubscribe/:userId')
  async unsubscribe(@Param('userId') userId: string, @Body() body: { endpoint: string }) {
    return this.pushService.unsubscribeFromPush(userId, body.endpoint);
  }

  @Post('send')
  async sendPush(@Body() body: { userId: string; title: string; body: string; data?: any }) {
    return this.pushService.sendPushToUser(body.userId, {
      title: body.title,
      body: body.body,
      data: body.data,
    });
  }
}
