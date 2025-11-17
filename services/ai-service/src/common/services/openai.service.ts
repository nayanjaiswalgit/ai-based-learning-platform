import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private openai: OpenAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('ai.openai.apiKey');

    if (!apiKey) {
      this.logger.warn('OpenAI API key not configured. AI features will be disabled.');
      return;
    }

    this.openai = new OpenAI({ apiKey });
    this.logger.log('OpenAI service initialized successfully');
  }

  /**
   * Check if OpenAI is configured and available
   */
  isAvailable(): boolean {
    return this.openai !== null;
  }

  /**
   * Ensure OpenAI is available before making requests
   */
  private ensureAvailable(): void {
    if (!this.openai) {
      throw new Error('OpenAI is not configured. Please set OPENAI_API_KEY in environment variables.');
    }
  }

  /**
   * Generate AI completion with structured JSON response
   */
  async generateJsonCompletion(
    systemPrompt: string,
    userPrompt: string,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {},
  ): Promise<any> {
    this.ensureAvailable();

    try {
      const model = options.model || this.configService.get('ai.openai.model', 'gpt-4-turbo-preview');
      const temperature = options.temperature ?? 0.7;
      const maxTokens = options.maxTokens || 2000;

      this.logger.log(`Generating JSON completion with model: ${model}`);

      const completion = await this.openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      return JSON.parse(content);
    } catch (error) {
      this.logger.error('Failed to generate JSON completion:', error);
      throw error;
    }
  }

  /**
   * Generate AI completion with text response
   */
  async generateTextCompletion(
    systemPrompt: string,
    userPrompt: string,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {},
  ): Promise<string> {
    this.ensureAvailable();

    try {
      const model = options.model || this.configService.get('ai.openai.model', 'gpt-4-turbo-preview');
      const temperature = options.temperature ?? 0.7;
      const maxTokens = options.maxTokens || 2000;

      this.logger.log(`Generating text completion with model: ${model}`);

      const completion = await this.openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      return content.trim();
    } catch (error) {
      this.logger.error('Failed to generate text completion:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    this.ensureAvailable();

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error('Failed to generate embedding:', error);
      throw error;
    }
  }
}
