import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { ChatMessageDto } from './dto/chat-message.dto';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send a message to the AI chatbot' })
  async chat(@Body() chatMessageDto: ChatMessageDto) {
    return this.chatbotService.processMessage(chatMessageDto);
  }

  @Post('clear-context')
  @ApiOperation({ summary: 'Clear chat context for a user' })
  async clearContext(@Body('userId') userId: string) {
    return this.chatbotService.clearContext(userId);
  }
}
