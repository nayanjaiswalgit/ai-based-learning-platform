import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GenerateCourseDto, RefineCourseContentDto } from './dto/generate-course.dto';

@Injectable()
export class ContentGenerationService {
  private readonly logger = new Logger(ContentGenerationService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn('OPENAI_API_KEY not configured. AI features will be limited.');
    }
  }

  async generateCompleteCourse(dto: GenerateCourseDto) {
    this.logger.log('Generating complete course with AI');

    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert course creator and instructional designer.
Generate a comprehensive, well-structured online course based on the user's requirements.

Return a JSON object with the following structure:
{
  "title": "Course Title",
  "description": "Brief course description",
  "longDescription": "Detailed course description",
  "difficultyLevel": "beginner|intermediate|advanced",
  "estimatedDurationHours": 40,
  "learningOutcomes": ["outcome1", "outcome2", ...],
  "prerequisites": ["prerequisite1", ...],
  "targetAudience": ["audience1", ...],
  "modules": [
    {
      "title": "Module Title",
      "description": "Module description",
      "orderIndex": 0,
      "lessons": [
        {
          "title": "Lesson Title",
          "contentType": "VIDEO|ARTICLE|QUIZ|CODING|LAB",
          "contentText": "Markdown content for ARTICLE type",
          "durationMinutes": 15,
          "orderIndex": 0,
          "videoScript": "Script for video lessons (optional)",
          "quiz": {
            "title": "Quiz Title",
            "description": "Quiz description",
            "passingPercentage": 70,
            "questions": [
              {
                "questionType": "MULTIPLE_CHOICE",
                "title": "Question text",
                "description": "Additional context",
                "difficulty": "EASY|MEDIUM|HARD",
                "options": [
                  {
                    "optionText": "Option text",
                    "isCorrect": true|false,
                    "explanation": "Why this is correct/incorrect"
                  }
                ],
                "topics": ["topic1", "topic2"]
              }
            ]
          },
          "codingQuestion": {
            "questionType": "CODING_QUESTION",
            "title": "Problem title",
            "description": "Problem description with examples",
            "difficulty": "EASY|MEDIUM|HARD",
            "starterCode": {
              "python": "def solution():\\n    pass",
              "javascript": "function solution() {\\n    \\n}"
            },
            "testCases": [
              {
                "input": "test input",
                "expectedOutput": "expected output",
                "isHidden": false
              }
            ],
            "hints": ["hint1", "hint2"],
            "constraints": "Constraints text",
            "topics": ["topic1"]
          },
          "terminalLab": {
            "questionType": "TERMINAL_CHALLENGE",
            "title": "Lab title",
            "description": "Lab scenario",
            "scenarioDescription": "Detailed scenario",
            "setupScript": "#!/bin/bash\\n# Setup commands",
            "validationScript": "#!/bin/bash\\n# Validation logic",
            "expectedCommands": ["command1", "command2"],
            "hints": ["hint1"],
            "timeLimitMinutes": 30
          }
        }
      ]
    }
  ]
}

Important guidelines:
1. Create a logical progression from basics to advanced topics
2. Mix content types: articles for theory, videos for demonstrations, quizzes for assessment, coding for practice
3. Include at least one quiz per module for knowledge checks
4. Add coding questions for programming courses
5. Terminal labs are great for DevOps, Linux, networking topics
6. Make content engaging and practical with real-world examples
7. Ensure quiz questions have clear explanations
8. Coding problems should have multiple test cases
9. Video scripts should be detailed and educational`;

    const userPrompt = `Generate a complete course with the following requirements:

${dto.prompt}

Difficulty Level: ${dto.difficulty || 'beginner'}
Estimated Duration: ${dto.estimatedHours || 'auto-determine'} hours
Number of Modules: ${dto.moduleCount || 'auto-determine based on content'}

Make sure to include:
- Multiple content types (articles, quizzes, coding questions, labs where appropriate)
- Clear learning objectives
- Progressive difficulty
- Practical examples and exercises
- Comprehensive assessments`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 16000,
      });

      const generatedContent = JSON.parse(completion.choices[0].message.content);

      this.logger.log(`Successfully generated course: ${generatedContent.title}`);

      return {
        success: true,
        content: generatedContent,
        tokensUsed: completion.usage,
      };
    } catch (error) {
      this.logger.error('Error generating course:', error);
      throw new Error(`Failed to generate course: ${error.message}`);
    }
  }

  async refineContent(dto: RefineCourseContentDto) {
    this.logger.log(`Refining ${dto.sectionType} with ID ${dto.sectionId}`);

    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert course content editor.
Refine the provided course content based on the user's feedback.
Maintain the same JSON structure but improve the content quality.
Return the refined content in the same format as the input.`;

    const userPrompt = `Current content:
${JSON.stringify(dto.currentContent, null, 2)}

Refinement instructions:
${dto.refinementPrompt}

Please refine this ${dto.sectionType} while maintaining the structure.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 8000,
      });

      const refinedContent = JSON.parse(completion.choices[0].message.content);

      return {
        success: true,
        content: refinedContent,
        tokensUsed: completion.usage,
      };
    } catch (error) {
      this.logger.error('Error refining content:', error);
      throw new Error(`Failed to refine content: ${error.message}`);
    }
  }

  async generateQuiz(topic: string, difficulty: string, count: number) {
    this.logger.log(`Generating ${count} ${difficulty} quiz questions for ${topic}`);

    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `Generate ${count} multiple choice quiz questions about ${topic} at ${difficulty} level.
Return JSON array with structure:
[{
  "questionType": "MULTIPLE_CHOICE",
  "title": "Question text",
  "difficulty": "${difficulty}",
  "options": [
    {"optionText": "Option A", "isCorrect": false, "explanation": "Why wrong"},
    {"optionText": "Option B", "isCorrect": true, "explanation": "Why correct"}
  ],
  "topics": ["${topic}"]
}]`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'system', content: systemPrompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const questions = JSON.parse(completion.choices[0].message.content);

      return {
        topic,
        difficulty,
        questions: questions.questions || questions,
      };
    } catch (error) {
      this.logger.error('Error generating quiz:', error);
      throw new Error(`Failed to generate quiz: ${error.message}`);
    }
  }

  async generateExplanation(concept: string, level: string) {
    this.logger.log(`Generating explanation for ${concept} at ${level} level`);

    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert educator. Explain concepts clearly at the ${level} level.`,
          },
          {
            role: 'user',
            content: `Explain: ${concept}`,
          },
        ],
        temperature: 0.7,
      });

      return {
        concept,
        level,
        explanation: completion.choices[0].message.content,
      };
    } catch (error) {
      this.logger.error('Error generating explanation:', error);
      throw new Error(`Failed to generate explanation: ${error.message}`);
    }
  }
}
