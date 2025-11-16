import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { MessagingService } from './messaging.service';

@Controller('messaging')
export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  @Get('conversations/user/:userId')
  async getUserConversations(@Param('userId') userId: string) {
    return this.messagingService.getUserConversations(userId);
  }

  @Get('conversations/:conversationId/messages')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.messagingService.getMessages(
      conversationId,
      limit ? parseInt(limit) : 50,
      before,
    );
  }

  @Post('conversations')
  async createConversation(@Body() body: {
    createdBy: string;
    type: string;
    participantIds: string[];
    name?: string;
    cohortId?: string;
  }) {
    return this.messagingService.createConversation(
      body.createdBy,
      body.type as any,
      body.participantIds,
      body.name,
      body.cohortId,
    );
  }

  @Post('conversations/direct')
  async getOrCreateDirectConversation(@Body() body: { userId1: string; userId2: string }) {
    return this.messagingService.getOrCreateDirectConversation(body.userId1, body.userId2);
  }

  @Post('messages')
  async sendMessage(@Body() body: {
    conversationId: string;
    senderId: string;
    content: string;
    type?: string;
    replyToId?: string;
    attachments?: any[];
  }) {
    return this.messagingService.sendMessage(
      body.conversationId,
      body.senderId,
      body.content,
      body.type as any,
      body.replyToId,
      body.attachments,
    );
  }

  @Put('messages/:messageId')
  async editMessage(
    @Param('messageId') messageId: string,
    @Body() body: { userId: string; content: string },
  ) {
    return this.messagingService.editMessage(messageId, body.userId, body.content);
  }

  @Delete('messages/:messageId/:userId')
  async deleteMessage(@Param('messageId') messageId: string, @Param('userId') userId: string) {
    return this.messagingService.deleteMessage(messageId, userId);
  }

  @Post('messages/:messageId/read')
  async markAsRead(@Param('messageId') messageId: string, @Body() body: { userId: string }) {
    return this.messagingService.markAsRead(messageId, body.userId);
  }

  @Post('conversations/:conversationId/read')
  async markConversationAsRead(
    @Param('conversationId') conversationId: string,
    @Body() body: { userId: string },
  ) {
    return this.messagingService.markConversationAsRead(conversationId, body.userId);
  }

  @Get('unread-count/:userId')
  async getUnreadCount(@Param('userId') userId: string) {
    const count = await this.messagingService.getUnreadCount(userId);
    return { unreadCount: count };
  }
}
