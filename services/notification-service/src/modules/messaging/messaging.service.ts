import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessagingGateway } from './messaging.gateway';

// Local type definitions (not in Prisma schema yet)
enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
}

enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
}

@Injectable()
export class MessagingService {
  constructor(
    private prisma: PrismaService,
    private messagingGateway: MessagingGateway,
  ) {}

  // Create a new conversation
  async createConversation(
    createdBy: string,
    type: ConversationType,
    participantIds: string[],
    name?: string,
    cohortId?: string,
  ) {
    const conversation = await this.prisma.conversation.create({
      data: {
        type,
        name,
        cohortId,
        createdBy,
        participants: {
          create: participantIds.map((userId) => ({
            userId,
            role: userId === createdBy ? 'ADMIN' : 'MEMBER',
          })),
        },
      },
      include: {
        participants: true,
      },
    });

    // Notify all participants
    for (const participant of conversation.participants) {
      this.messagingGateway.sendToUser(participant.userId, 'conversation-created', conversation);
    }

    return conversation;
  }

  // Send a message
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: MessageType = MessageType.TEXT,
    replyToId?: string,
    attachments?: Array<{ fileName: string; fileUrl: string; fileType: string; fileSize: number }>,
  ) {
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        type,
        replyToId,
        attachments: attachments
          ? {
              create: attachments,
            }
          : undefined,
      },
      include: {
        attachments: true,
        sender: false, // Would include user details from user service
        replyTo: true,
      },
    });

    // Update conversation's last message timestamp
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Get all participants
    const participants = await this.prisma.conversationParticipant.findMany({
      where: { conversationId },
      select: { userId: true },
    });

    // Send real-time message to all participants
    for (const participant of participants) {
      if (participant.userId !== senderId) {
        this.messagingGateway.sendToUser(participant.userId, 'new-message', {
          ...message,
          conversationId,
        });
      }
    }

    return message;
  }

  // Get conversation messages
  async getMessages(conversationId: string, limit = 50, before?: string) {
    return this.prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
        ...(before ? { id: { lt: before } } : {}),
      },
      include: {
        attachments: true,
        replyTo: {
          select: {
            id: true,
            content: true,
            senderId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Mark messages as read
  async markAsRead(messageId: string, userId: string) {
    const existing = await this.prisma.messageReadReceipt.findUnique({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
    });

    if (!existing) {
      await this.prisma.messageReadReceipt.create({
        data: {
          messageId,
          userId,
        },
      });

      // Notify sender about read receipt
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
        select: { senderId: true, conversationId: true },
      });

      if (message && message.senderId !== userId) {
        this.messagingGateway.sendToUser(message.senderId, 'message-read', {
          messageId,
          userId,
          conversationId: message.conversationId,
        });
      }
    }

    return { success: true };
  }

  // Mark all messages in conversation as read
  async markConversationAsRead(conversationId: string, userId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
        senderId: { not: userId },
      },
      select: { id: true },
    });

    const receipts = messages.map((msg) => ({
      messageId: msg.id,
      userId,
    }));

    await this.prisma.messageReadReceipt.createMany({
      data: receipts,
      skipDuplicates: true,
    });

    // Update participant's last read timestamp
    await this.prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    return { success: true };
  }

  // Get user conversations
  async getUserConversations(userId: string) {
    const participants = await this.prisma.conversationParticipant.findMany({
      where: {
        userId,
        leftAt: null,
      },
      include: {
        conversation: {
          include: {
            participants: {
              select: {
                userId: true,
                role: true,
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                readReceipts: true,
              },
            },
          },
        },
      },
      orderBy: {
        conversation: {
          lastMessageAt: 'desc',
        },
      },
    });

    return participants.map((p) => ({
      ...p.conversation,
      unreadCount: p.conversation.messages[0]
        ? p.conversation.messages[0].readReceipts.filter((r) => r.userId === userId).length === 0
          ? 1
          : 0
        : 0,
      lastMessage: p.conversation.messages[0],
    }));
  }

  // Create direct message conversation (or get existing)
  async getOrCreateDirectConversation(userId1: string, userId2: string) {
    // Check if conversation already exists
    const existingConversations = await this.prisma.conversation.findMany({
      where: {
        type: ConversationType.DIRECT,
        participants: {
          every: {
            userId: { in: [userId1, userId2] },
          },
        },
      },
      include: {
        participants: true,
      },
    });

    const existing = existingConversations.find(
      (conv) =>
        conv.participants.length === 2 &&
        conv.participants.some((p) => p.userId === userId1) &&
        conv.participants.some((p) => p.userId === userId2),
    );

    if (existing) {
      return existing;
    }

    // Create new conversation
    return this.createConversation(userId1, ConversationType.DIRECT, [userId1, userId2]);
  }

  // Delete message (soft delete)
  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.senderId !== userId) {
      throw new Error('Unauthorized');
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });

    // Notify participants
    this.messagingGateway.sendToRoom(`conversation:${message.conversationId}`, 'message-deleted', {
      messageId,
      conversationId: message.conversationId,
    });

    return { success: true };
  }

  // Edit message
  async editMessage(messageId: string, userId: string, newContent: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.senderId !== userId) {
      throw new Error('Unauthorized');
    }

    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: newContent,
        isEdited: true,
        editedAt: new Date(),
      },
    });

    // Notify participants
    this.messagingGateway.sendToRoom(`conversation:${message.conversationId}`, 'message-edited', updated);

    return updated;
  }

  // Add participants to group conversation
  async addParticipants(conversationId: string, userId: string, newParticipantIds: string[]) {
    // Check if user is admin
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant || participant.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    await this.prisma.conversationParticipant.createMany({
      data: newParticipantIds.map((id) => ({
        conversationId,
        userId: id,
        role: 'MEMBER',
      })),
      skipDuplicates: true,
    });

    return { success: true };
  }

  // Leave conversation
  async leaveConversation(conversationId: string, userId: string) {
    await this.prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        leftAt: new Date(),
      },
    });

    return { success: true };
  }

  // Get unread count for user
  async getUnreadCount(userId: string): Promise<number> {
    const conversations = await this.getUserConversations(userId);
    return conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
  }
}
