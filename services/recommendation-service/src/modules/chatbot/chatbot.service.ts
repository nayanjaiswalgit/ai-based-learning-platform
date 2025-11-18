import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { BufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatMessage, ChatResponse, UserProgress, SkillLevel } from '@/types';
import { SendMessageDto, GetChatHistoryDto, GetHintDto, HintLevel } from './dto/chatbot.dto';

interface UserChatSession {
  userId: string;
  memory: BufferMemory;
  chain: ConversationChain;
  messages: ChatMessage[];
  progress?: UserProgress;
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly chatModel: ChatOpenAI | ChatAnthropic;

  // In-memory chat sessions (replace with database + Redis in production)
  private sessions = new Map<string, UserChatSession>();

  constructor(private configService: ConfigService) {
    // Initialize chat model (prefer Claude for better reasoning)
    const useAnthropic = !!this.configService.get('ai.anthropic.apiKey');

    if (useAnthropic) {
      this.chatModel = new ChatAnthropic({
        apiKey: this.configService.get('ai.anthropic.apiKey'),
        modelName: this.configService.get('ai.anthropic.model'),
        temperature: 0.7,
      });
    } else {
      this.chatModel = new ChatOpenAI({
        openAIApiKey: this.configService.get('ai.openai.apiKey'),
        modelName: this.configService.get('ai.openai.model'),
        temperature: 0.7,
      });
    }
  }

  /**
   * Phase 4.1: Send message to AI chatbot with context awareness
   */
  async sendMessage(dto: SendMessageDto): Promise<ChatResponse> {
    this.logger.log(`Processing message from user ${dto.userId}`);

    // Get or create chat session
    const session = await this.getOrCreateSession(dto.userId);

    // Update context if provided
    if (dto.context) {
      session.progress = await this.fetchUserProgress(dto.userId);
    }

    // Build context-aware prompt
    const contextPrompt = this.buildContextPrompt(dto, session);

    try {
      // Get response from LangChain
      const response = await session.chain.call({
        input: contextPrompt,
      });

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        userId: dto.userId,
        role: 'ASSISTANT',
        content: response.response,
        timestamp: new Date(),
      };

      const userMessage: ChatMessage = {
        id: `msg_${Date.now() - 1}`,
        userId: dto.userId,
        role: 'USER',
        content: dto.message,
        timestamp: new Date(),
        context: dto.context,
      };

      // Save messages
      session.messages.push(userMessage, assistantMessage);

      // Extract suggestions and resources from response
      const suggestions = this.extractSuggestions(response.response);
      const resources = this.extractResources(response.response);
      const code = this.extractCode(response.response);

      return {
        message: response.response,
        suggestions,
        resources,
        code,
      };
    } catch (error) {
      this.logger.error('Failed to process chat message:', error);
      throw error;
    }
  }

  /**
   * Phase 4.2: Provide intelligent hints without giving away the solution
   */
  async getHint(dto: GetHintDto): Promise<ChatResponse> {
    this.logger.log(`Generating hint for user ${dto.userId} on problem ${dto.problemId}`);

    const level = dto.level || HintLevel.SUBTLE;

    // Fetch problem details (mock - replace with database)
    const problem = await this.fetchProblem(dto.problemId);

    const hintPrompt = this.buildHintPrompt(problem, dto.currentCode, level);

    try {
      const response = await this.chatModel.invoke(hintPrompt);

      return {
        message: response.content as string,
      };
    } catch (error) {
      this.logger.error('Failed to generate hint:', error);
      throw error;
    }
  }

  /**
   * Phase 4.3: Explain concepts in ELI5 (Explain Like I'm 5) style
   */
  async explainConcept(userId: string, concept: string): Promise<ChatResponse> {
    const session = await this.getOrCreateSession(userId);

    const prompt = `Explain the concept of "${concept}" in simple terms, as if explaining to a 5-year-old (ELI5).
Include:
1. Simple analogy or real-world example
2. Why it's important
3. A basic code example (if applicable)
4. Common misconceptions

Make it engaging and easy to understand.`;

    const response = await session.chain.call({ input: prompt });

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId,
      role: 'ASSISTANT',
      content: response.response,
      timestamp: new Date(),
    };

    session.messages.push(message);

    return {
      message: response.response,
      code: this.extractCode(response.response),
    };
  }

  /**
   * Phase 4.4: Provide doubt resolution with code examples
   */
  async resolveDoubt(userId: string, doubt: string, code?: string): Promise<ChatResponse> {
    const session = await this.getOrCreateSession(userId);

    let prompt = `Help resolve this programming doubt: "${doubt}"`;

    if (code) {
      prompt += `\n\nUser's current code:\n\`\`\`\n${code}\n\`\`\``;
    }

    prompt += `\n\nProvide:
1. Clear explanation of the issue
2. Step-by-step solution approach
3. Working code example
4. Best practices and tips
5. Common pitfalls to avoid`;

    const response = await session.chain.call({ input: prompt });

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId,
      role: 'ASSISTANT',
      content: response.response,
      timestamp: new Date(),
    };

    session.messages.push(message);

    return {
      message: response.response,
      code: this.extractCode(response.response),
    };
  }

  /**
   * Phase 4.5: Get chat history for a user
   */
  async getChatHistory(dto: GetChatHistoryDto): Promise<ChatMessage[]> {
    const session = this.sessions.get(dto.userId);
    if (!session) {
      return [];
    }

    const limit = dto.limit || 50;
    return session.messages.slice(-limit);
  }

  /**
   * Phase 4.6: Clear chat history and reset context
   */
  async clearChatHistory(userId: string): Promise<{ success: boolean }> {
    this.sessions.delete(userId);
    return { success: true };
  }

  /**
   * Helper: Get or create chat session with LangChain memory
   */
  private async getOrCreateSession(userId: string): Promise<UserChatSession> {
    if (!this.sessions.has(userId)) {
      const memory = new BufferMemory({
        returnMessages: true,
        memoryKey: 'history',
      });

      const prompt = PromptTemplate.fromTemplate(`You are an expert AI tutor helping a student learn programming and computer science.

Context about the student:
- User ID: ${userId}
- Current progress: {progress}
- Recent activity: {activity}

Conversation history:
{history}

Student's question: {input}

Guidelines:
1. Be encouraging and supportive
2. Explain concepts clearly with examples
3. Provide code snippets when helpful
4. Ask clarifying questions if needed
5. Don't give away complete solutions - guide the student to discover answers
6. Adapt your explanations to the student's level
7. Use analogies and real-world examples
8. Point out best practices and common mistakes

Your response:`);

      const chain = new ConversationChain({
        llm: this.chatModel,
        memory,
        prompt,
      });

      this.sessions.set(userId, {
        userId,
        memory,
        chain,
        messages: [],
      });
    }

    return this.sessions.get(userId) || { messages: [], context: {} };
  }

  /**
   * Helper: Build context-aware prompt
   */
  private buildContextPrompt(dto: SendMessageDto, session: UserChatSession): string {
    let prompt = dto.message;

    if (dto.context) {
      prompt += '\n\n**Context:**';

      if (dto.context.currentCourse) {
        prompt += `\n- Currently studying: ${dto.context.currentCourse}`;
      }

      if (dto.context.currentProblem) {
        prompt += `\n- Working on problem: ${dto.context.currentProblem}`;
      }

      if (dto.context.currentCode) {
        prompt += `\n- Current code:\n\`\`\`${dto.context.language || 'javascript'}\n${dto.context.currentCode}\n\`\`\``;
      }
    }

    if (session.progress) {
      prompt += `\n\n**User Progress:**`;
      prompt += `\n- Courses completed: ${session.progress.coursesCompleted}`;
      prompt += `\n- Problems solved: ${session.progress.problemsSolved}`;
      prompt += `\n- Current streak: ${session.progress.currentStreak} days`;
    }

    return prompt;
  }

  /**
   * Helper: Build hint prompt based on level
   */
  private buildHintPrompt(problem: any, currentCode: string | undefined, level: HintLevel): string {
    let prompt = `Problem: ${problem.title}\n${problem.description}\n\n`;

    if (currentCode) {
      prompt += `Student's current attempt:\n\`\`\`\n${currentCode}\n\`\`\`\n\n`;
    }

    switch (level) {
      case HintLevel.SUBTLE:
        prompt += 'Provide a VERY SUBTLE hint that nudges the student in the right direction without revealing the approach. Ask a thought-provoking question.';
        break;
      case HintLevel.MODERATE:
        prompt += 'Provide a MODERATE hint that explains the general approach without giving away implementation details. Mention the algorithm or pattern to consider.';
        break;
      case HintLevel.DETAILED:
        prompt += 'Provide a DETAILED hint that outlines the step-by-step approach. Include pseudocode but not the complete solution.';
        break;
    }

    prompt += '\n\nDo NOT provide the complete solution. Help the student learn by discovering the answer themselves.';

    return prompt;
  }

  /**
   * Helper: Extract code blocks from response
   */
  private extractCode(response: string): string | undefined {
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/;
    const match = response.match(codeBlockRegex);
    return match ? match[1].trim() : undefined;
  }

  /**
   * Helper: Extract suggestions from response
   */
  private extractSuggestions(response: string): string[] | undefined {
    // Look for bullet points or numbered lists
    const suggestions: string[] = [];
    const lines = response.split('\n');

    for (const line of lines) {
      if (line.match(/^[-*•]\s+(.+)/) || line.match(/^\d+\.\s+(.+)/)) {
        const suggestion = line.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '').trim();
        if (suggestion.length < 100) {
          // Only short suggestions
          suggestions.push(suggestion);
        }
      }
    }

    return suggestions.length > 0 ? suggestions.slice(0, 5) : undefined;
  }

  /**
   * Helper: Extract resource links from response
   */
  private extractResources(response: string): any[] | undefined {
    // Mock implementation - in production, parse actual resource links
    return undefined;
  }

  /**
   * Helper: Fetch user progress (mock - replace with database)
   */
  private async fetchUserProgress(userId: string): Promise<UserProgress> {
    return {
      coursesCompleted: 5,
      problemsSolved: 42,
      currentStreak: 7,
      skillLevels: {
        JavaScript: SkillLevel.INTERMEDIATE,
        React: SkillLevel.INTERMEDIATE,
        Algorithms: SkillLevel.BEGINNER,
      },
    };
  }

  /**
   * Helper: Fetch problem details (mock - replace with database)
   */
  private async fetchProblem(problemId: string): Promise<any> {
    return {
      id: problemId,
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      difficulty: 'EASY',
    };
  }
}
