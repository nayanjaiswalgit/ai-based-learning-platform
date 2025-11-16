import { Controller, Post, Get, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { SendMessageDto, GetChatHistoryDto, GetHintDto } from './dto/chatbot.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  /**
   * POST /chatbot/message
   * Send a message to the AI chatbot
   */
  @Post('message')
  @HttpCode(HttpStatus.OK)
  async sendMessage(@Body() dto: SendMessageDto) {
    return this.chatbotService.sendMessage(dto);
  }

  /**
   * POST /chatbot/hint
   * Get a hint for a problem without revealing the solution
   */
  @Post('hint')
  @HttpCode(HttpStatus.OK)
  async getHint(@Body() dto: GetHintDto) {
    return this.chatbotService.getHint(dto);
  }

  /**
   * POST /chatbot/explain/:concept
   * Get an ELI5 explanation of a concept
   */
  @Post('explain/:userId')
  @HttpCode(HttpStatus.OK)
  async explainConcept(@Param('userId') userId: string, @Body('concept') concept: string) {
    return this.chatbotService.explainConcept(userId, concept);
  }

  /**
   * POST /chatbot/resolve-doubt
   * Get help resolving a programming doubt
   */
  @Post('resolve-doubt')
  @HttpCode(HttpStatus.OK)
  async resolveDoubt(
    @Body('userId') userId: string,
    @Body('doubt') doubt: string,
    @Body('code') code?: string,
  ) {
    return this.chatbotService.resolveDoubt(userId, doubt, code);
  }

  /**
   * GET /chatbot/history/:userId
   * Get chat history for a user
   */
  @Get('history/:userId')
  async getChatHistory(@Param('userId') userId: string, @Query('limit') limit?: number) {
    return this.chatbotService.getChatHistory({ userId, limit });
  }

  /**
   * DELETE /chatbot/history/:userId
   * Clear chat history for a user
   */
  @Delete('history/:userId')
  @HttpCode(HttpStatus.OK)
  async clearChatHistory(@Param('userId') userId: string) {
    return this.chatbotService.clearChatHistory(userId);
  }
}
