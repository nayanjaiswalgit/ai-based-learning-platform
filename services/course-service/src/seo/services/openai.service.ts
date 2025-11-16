import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.warn('OpenAI API key not configured');
      return;
    }

    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generate SEO-optimized course description using AI
   */
  async generateCourseDescription(
    title: string,
    shortDescription: string,
    skills: string[],
  ): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    try {
      const prompt = `Generate an SEO-optimized, engaging course description for an online learning platform.

Course Title: ${title}
Brief Description: ${shortDescription}
Skills Covered: ${skills.join(', ')}

Requirements:
- Write 2-3 paragraphs (200-300 words)
- Include relevant keywords naturally
- Highlight what students will learn
- Mention who the course is for
- Use an engaging, professional tone
- Focus on outcomes and benefits

Generate the description:`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });

      const description = completion.choices[0]?.message?.content || '';

      this.logger.log(`Generated AI description for: ${title}`);

      return description.trim();
    } catch (error) {
      this.logger.error('Failed to generate AI description', error);
      throw error;
    }
  }

  /**
   * Generate meta tags suggestions
   */
  async generateMetaTags(courseTitle: string, courseDescription: string): Promise<{
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  }> {
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    try {
      const prompt = `Generate SEO meta tags for this online course:

Title: ${courseTitle}
Description: ${courseDescription}

Generate:
1. An optimized meta title (max 60 characters)
2. A meta description (max 160 characters)
3. 5-10 relevant keywords

Format your response as JSON:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "keywords": ["...", "..."]
}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || '{}');

      return result;
    } catch (error) {
      this.logger.error('Failed to generate meta tags', error);
      throw error;
    }
  }
}
