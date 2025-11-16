import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatMessageDto } from './dto/chat-message.dto';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly conversationHistory = new Map<string, any[]>();

  constructor(private readonly configService: ConfigService) {}

  async processMessage(chatMessageDto: ChatMessageDto) {
    const { userId, message, context } = chatMessageDto;

    this.logger.log(`Processing message for user ${userId}`);

    // Get or initialize conversation history
    const history = this.conversationHistory.get(userId) || [];

    // Add user message to history
    history.push({ role: 'user', content: message });

    // TODO: Integrate with OpenAI or Anthropic Claude API
    // For now, return a placeholder response
    const aiResponse = {
      message: 'AI response will be implemented with OpenAI/Claude integration',
      context: context || {},
      timestamp: new Date().toISOString(),
    };

    // Add AI response to history
    history.push({ role: 'assistant', content: aiResponse.message });

    // Store updated history (limit to last 10 messages)
    this.conversationHistory.set(userId, history.slice(-10));

    return aiResponse;
  }

  async clearContext(userId: string) {
    this.conversationHistory.delete(userId);
    return { success: true, message: 'Context cleared' };
  }
}
