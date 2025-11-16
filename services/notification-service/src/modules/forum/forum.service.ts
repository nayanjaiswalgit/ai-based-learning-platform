import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VoteType, ModerationAction, ModerationTargetType } from '@prisma/client';

@Injectable()
export class ForumService {
  constructor(private prisma: PrismaService) {}

  // Categories
  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    courseId?: string;
  }) {
    return this.prisma.forumCategory.create({ data });
  }

  async getCategories(courseId?: string) {
    return this.prisma.forumCategory.findMany({
      where: {
        isActive: true,
        ...(courseId ? { courseId } : {}),
      },
      orderBy: { position: 'asc' },
      include: {
        _count: {
          select: { threads: true },
        },
      },
    });
  }

  // Threads
  async createThread(data: {
    categoryId: string;
    authorId: string;
    title: string;
    slug: string;
    content: string;
    tags?: string[];
  }) {
    const thread = await this.prisma.forumThread.create({
      data,
      include: {
        category: true,
        _count: {
          select: { replies: true, votes: true },
        },
      },
    });

    // Subscribe author to their own thread
    await this.subscribeToThread(thread.id, data.authorId);

    return thread;
  }

  async getThreads(categoryId?: string, limit = 50, offset = 0) {
    return this.prisma.forumThread.findMany({
      where: {
        deletedAt: null,
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: true,
        _count: {
          select: { replies: true, votes: true },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { lastReplyAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    });
  }

  async getThread(threadId: string, incrementViews = true) {
    if (incrementViews) {
      await this.prisma.forumThread.update({
        where: { id: threadId },
        data: { views: { increment: 1 } },
      });
    }

    return this.prisma.forumThread.findUnique({
      where: { id: threadId },
      include: {
        category: true,
        _count: {
          select: { replies: true, votes: true },
        },
      },
    });
  }

  async searchThreads(query: string, limit = 20) {
    return this.prisma.forumThread.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } },
        ],
      },
      include: {
        category: true,
        _count: {
          select: { replies: true, votes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getThreadsByTag(tag: string, limit = 50) {
    return this.prisma.forumThread.findMany({
      where: {
        deletedAt: null,
        tags: { has: tag },
      },
      include: {
        category: true,
        _count: {
          select: { replies: true, votes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Replies
  async createReply(data: {
    threadId: string;
    authorId: string;
    content: string;
    replyToId?: string;
  }) {
    const reply = await this.prisma.forumReply.create({
      data,
      include: {
        replyTo: true,
        _count: {
          select: { votes: true },
        },
      },
    });

    // Update thread's last reply timestamp
    await this.prisma.forumThread.update({
      where: { id: data.threadId },
      data: { lastReplyAt: new Date() },
    });

    // Notify thread subscribers
    await this.notifyThreadSubscribers(data.threadId, data.authorId, reply);

    return reply;
  }

  async getReplies(threadId: string, limit = 100, offset = 0) {
    return this.prisma.forumReply.findMany({
      where: {
        threadId,
        deletedAt: null,
      },
      include: {
        replyTo: true,
        _count: {
          select: { votes: true, replies: true },
        },
      },
      orderBy: [
        { isBestAnswer: 'desc' },
        { createdAt: 'asc' },
      ],
      take: limit,
      skip: offset,
    });
  }

  // Voting
  async voteThread(threadId: string, userId: string, voteType: VoteType) {
    const existing = await this.prisma.forumVote.findUnique({
      where: {
        userId_threadId: {
          userId,
          threadId,
        },
      },
    });

    if (existing) {
      if (existing.voteType === voteType) {
        // Remove vote if same type
        await this.prisma.forumVote.delete({
          where: { id: existing.id },
        });
        return { action: 'removed', voteType };
      } else {
        // Update vote type
        await this.prisma.forumVote.update({
          where: { id: existing.id },
          data: { voteType },
        });
        return { action: 'updated', voteType };
      }
    }

    // Create new vote
    await this.prisma.forumVote.create({
      data: {
        userId,
        threadId,
        voteType,
      },
    });

    return { action: 'created', voteType };
  }

  async voteReply(replyId: string, userId: string, voteType: VoteType) {
    const existing = await this.prisma.forumVote.findUnique({
      where: {
        userId_replyId: {
          userId,
          replyId,
        },
      },
    });

    if (existing) {
      if (existing.voteType === voteType) {
        await this.prisma.forumVote.delete({
          where: { id: existing.id },
        });
        return { action: 'removed', voteType };
      } else {
        await this.prisma.forumVote.update({
          where: { id: existing.id },
          data: { voteType },
        });
        return { action: 'updated', voteType };
      }
    }

    await this.prisma.forumVote.create({
      data: {
        userId,
        replyId,
        voteType,
      },
    });

    return { action: 'created', voteType };
  }

  async getVoteScore(threadId?: string, replyId?: string) {
    const votes = await this.prisma.forumVote.findMany({
      where: threadId ? { threadId } : { replyId },
    });

    const upvotes = votes.filter((v) => v.voteType === 'UPVOTE').length;
    const downvotes = votes.filter((v) => v.voteType === 'DOWNVOTE').length;

    return {
      score: upvotes - downvotes,
      upvotes,
      downvotes,
    };
  }

  // Best Answer
  async markBestAnswer(replyId: string, threadId: string, authorId: string) {
    // Check if user is thread author
    const thread = await this.prisma.forumThread.findUnique({
      where: { id: threadId },
    });

    if (thread.authorId !== authorId) {
      throw new Error('Only thread author can mark best answer');
    }

    // Remove existing best answer
    await this.prisma.forumReply.updateMany({
      where: {
        threadId,
        isBestAnswer: true,
      },
      data: { isBestAnswer: false },
    });

    // Mark new best answer
    await this.prisma.forumReply.update({
      where: { id: replyId },
      data: { isBestAnswer: true },
    });

    // Mark thread as solved
    await this.prisma.forumThread.update({
      where: { id: threadId },
      data: { isSolved: true },
    });

    return { success: true };
  }

  // Subscriptions
  async subscribeToThread(threadId: string, userId: string) {
    return this.prisma.forumSubscription.upsert({
      where: {
        userId_threadId: {
          userId,
          threadId,
        },
      },
      update: {},
      create: {
        userId,
        threadId,
      },
    });
  }

  async unsubscribeFromThread(threadId: string, userId: string) {
    return this.prisma.forumSubscription.delete({
      where: {
        userId_threadId: {
          userId,
          threadId,
        },
      },
    });
  }

  private async notifyThreadSubscribers(threadId: string, authorId: string, reply: any) {
    const subscriptions = await this.prisma.forumSubscription.findMany({
      where: {
        threadId,
        userId: { not: authorId }, // Don't notify the author
      },
    });

    // In production, send actual notifications
    console.log(`📧 Notifying ${subscriptions.length} subscribers about new reply`);
  }

  // Moderation
  async pinThread(threadId: string, moderatorId: string) {
    await this.prisma.forumThread.update({
      where: { id: threadId },
      data: { isPinned: true },
    });

    await this.logModerationAction(
      moderatorId,
      ModerationTargetType.THREAD,
      threadId,
      ModerationAction.PIN,
    );

    return { success: true };
  }

  async unpinThread(threadId: string, moderatorId: string) {
    await this.prisma.forumThread.update({
      where: { id: threadId },
      data: { isPinned: false },
    });

    await this.logModerationAction(
      moderatorId,
      ModerationTargetType.THREAD,
      threadId,
      ModerationAction.UNPIN,
    );

    return { success: true };
  }

  async lockThread(threadId: string, moderatorId: string, reason?: string) {
    await this.prisma.forumThread.update({
      where: { id: threadId },
      data: { isLocked: true },
    });

    await this.logModerationAction(
      moderatorId,
      ModerationTargetType.THREAD,
      threadId,
      ModerationAction.LOCK,
      reason,
    );

    return { success: true };
  }

  async deleteThread(threadId: string, moderatorId: string, reason?: string) {
    await this.prisma.forumThread.update({
      where: { id: threadId },
      data: { deletedAt: new Date() },
    });

    await this.logModerationAction(
      moderatorId,
      ModerationTargetType.THREAD,
      threadId,
      ModerationAction.DELETE,
      reason,
    );

    return { success: true };
  }

  async deleteReply(replyId: string, moderatorId: string, reason?: string) {
    await this.prisma.forumReply.update({
      where: { id: replyId },
      data: { deletedAt: new Date() },
    });

    await this.logModerationAction(
      moderatorId,
      ModerationTargetType.REPLY,
      replyId,
      ModerationAction.DELETE,
      reason,
    );

    return { success: true };
  }

  async restoreThread(threadId: string, moderatorId: string) {
    await this.prisma.forumThread.update({
      where: { id: threadId },
      data: { deletedAt: null, isLocked: false },
    });

    await this.logModerationAction(
      moderatorId,
      ModerationTargetType.THREAD,
      threadId,
      ModerationAction.RESTORE,
    );

    return { success: true };
  }

  private async logModerationAction(
    moderatorId: string,
    targetType: ModerationTargetType,
    targetId: string,
    action: ModerationAction,
    reason?: string,
  ) {
    return this.prisma.forumModeration.create({
      data: {
        moderatorId,
        targetType,
        targetId,
        action,
        reason,
      },
    });
  }

  async getModerationLogs(limit = 100) {
    return this.prisma.forumModeration.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
