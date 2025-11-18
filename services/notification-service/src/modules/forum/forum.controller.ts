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
import { ForumService, VoteType, ModerationAction, ModerationTargetType } from './forum.service';

// Re-export types for external use
export { VoteType, ModerationAction, ModerationTargetType };

@Controller('forum')
export class ForumController {
  constructor(private forumService: ForumService) {}

  // Categories
  @Get('categories')
  async getCategories(@Query('courseId') courseId?: string) {
    return this.forumService.getCategories(courseId);
  }

  @Post('categories')
  async createCategory(@Body() body: any) {
    return this.forumService.createCategory(body);
  }

  // Threads
  @Get('threads')
  async getThreads(
    @Query('categoryId') categoryId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.forumService.getThreads(
      categoryId,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get('threads/search')
  async searchThreads(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.forumService.searchThreads(query, limit ? parseInt(limit) : 20);
  }

  @Get('threads/tag/:tag')
  async getThreadsByTag(@Param('tag') tag: string, @Query('limit') limit?: string) {
    return this.forumService.getThreadsByTag(tag, limit ? parseInt(limit) : 50);
  }

  @Get('threads/:id')
  async getThread(@Param('id') id: string) {
    return this.forumService.getThread(id);
  }

  @Post('threads')
  async createThread(@Body() body: any) {
    return this.forumService.createThread(body);
  }

  @Delete('threads/:id')
  async deleteThread(@Param('id') id: string, @Body() body: { moderatorId: string; reason?: string }) {
    return this.forumService.deleteThread(id, body.moderatorId, body.reason);
  }

  // Replies
  @Get('threads/:threadId/replies')
  async getReplies(
    @Param('threadId') threadId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.forumService.getReplies(
      threadId,
      limit ? parseInt(limit) : 100,
      offset ? parseInt(offset) : 0,
    );
  }

  @Post('replies')
  async createReply(@Body() body: any) {
    return this.forumService.createReply(body);
  }

  @Delete('replies/:id')
  async deleteReply(@Param('id') id: string, @Body() body: { moderatorId: string; reason?: string }) {
    return this.forumService.deleteReply(id, body.moderatorId, body.reason);
  }

  // Voting
  @Post('threads/:id/vote')
  async voteThread(
    @Param('id') id: string,
    @Body() body: { userId: string; voteType: VoteType }
  ): Promise<{ action: string; voteType: VoteType }> {
    return this.forumService.voteThread(id, body.userId, body.voteType);
  }

  @Post('replies/:id/vote')
  async voteReply(
    @Param('id') id: string,
    @Body() body: { userId: string; voteType: VoteType }
  ): Promise<{ action: string; voteType: VoteType }> {
    return this.forumService.voteReply(id, body.userId, body.voteType);
  }

  @Get('threads/:id/score')
  async getThreadScore(@Param('id') id: string) {
    return this.forumService.getVoteScore(id);
  }

  @Get('replies/:id/score')
  async getReplyScore(@Param('id') id: string) {
    return this.forumService.getVoteScore(undefined, id);
  }

  // Best Answer
  @Post('replies/:id/best-answer')
  async markBestAnswer(@Param('id') id: string, @Body() body: { threadId: string; authorId: string }) {
    return this.forumService.markBestAnswer(id, body.threadId, body.authorId);
  }

  // Subscriptions
  @Post('threads/:id/subscribe')
  async subscribeToThread(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.forumService.subscribeToThread(id, body.userId);
  }

  @Delete('threads/:id/subscribe/:userId')
  async unsubscribeFromThread(@Param('id') id: string, @Param('userId') userId: string) {
    return this.forumService.unsubscribeFromThread(id, userId);
  }

  // Moderation
  @Put('threads/:id/pin')
  async pinThread(@Param('id') id: string, @Body() body: { moderatorId: string }) {
    return this.forumService.pinThread(id, body.moderatorId);
  }

  @Put('threads/:id/unpin')
  async unpinThread(@Param('id') id: string, @Body() body: { moderatorId: string }) {
    return this.forumService.unpinThread(id, body.moderatorId);
  }

  @Put('threads/:id/lock')
  async lockThread(@Param('id') id: string, @Body() body: { moderatorId: string; reason?: string }) {
    return this.forumService.lockThread(id, body.moderatorId, body.reason);
  }

  @Put('threads/:id/restore')
  async restoreThread(@Param('id') id: string, @Body() body: { moderatorId: string }) {
    return this.forumService.restoreThread(id, body.moderatorId);
  }

  @Get('moderation/logs')
  async getModerationLogs(@Query('limit') limit?: string) {
    return this.forumService.getModerationLogs(limit ? parseInt(limit) : 100);
  }
}
