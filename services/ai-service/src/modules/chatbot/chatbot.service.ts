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

    // Check for AI API configuration
    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
    const anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY');

    let responseMessage: string;

    if (!openaiKey && !anthropicKey) {
      // No AI API configured
      responseMessage = `AI chatbot requires API key configuration. To enable AI features:

1. Set OPENAI_API_KEY environment variable for OpenAI GPT integration, or
2. Set ANTHROPIC_API_KEY environment variable for Claude integration

Your message: "${message}"

For now, please use the discussion forums or contact support for assistance.`;
    } else {
      // API key exists but integration code not yet implemented
      responseMessage = `AI integration is configured but the implementation is pending.

To complete the integration:
1. Install the AI SDK (openai or @anthropic-ai/sdk)
2. Implement the API call in this service
3. Add proper error handling and rate limiting

Your message has been logged: "${message}"`;
    }

    const aiResponse = {
      message: responseMessage,
      context: context || {},
      timestamp: new Date().toISOString(),
      requiresSetup: !openaiKey && !anthropicKey,
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
