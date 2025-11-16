import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('user/:userId')
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.notificationService.getUserNotifications(
      userId,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get('user/:userId/unread-count')
  async getUnreadCount(@Param('userId') userId: string) {
    const count = await this.notificationService.getUnreadCount(userId);
    return { unreadCount: count };
  }

  @Patch(':id/read/:userId')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') id: string, @Param('userId') userId: string) {
    return this.notificationService.markAsRead(id, userId);
  }

  @Patch('mark-all-read/:userId')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Param('userId') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Delete(':id/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(@Param('id') id: string, @Param('userId') userId: string) {
    await this.notificationService.deleteNotification(id, userId);
  }

  @Post('test')
  async createTestNotification(@Body() body: any) {
    return this.notificationService.createNotification(body);
  }
}
