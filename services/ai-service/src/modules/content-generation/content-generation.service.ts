import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

interface CodingLabGenerationOptions {
  topic: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  labType: 'coding' | 'terminal';
  context?: string;
  courseTitle?: string;
  moduleTitle?: string;
}

interface GeneratedCodingLab {
  title: string;
  description: string;
  difficulty: string;
  estimatedMinutes: number;
  starterCode?: Record<string, string>;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    explanation: string;
    isHidden: boolean;
  }>;
  hints?: string[];
  constraints?: string;
}

interface GeneratedTerminalLab {
  title: string;
  description: string;
  difficulty: string;
  estimatedMinutes: number;
  scenario: string;
  dockerImage: string;
  setupScript?: string;
  validationScript: string;
  tasks: Array<{
    title: string;
    description: string;
    order: number;
    hintCommand?: string;
    validationString: string;
  }>;
}

@Injectable()
export class ContentGenerationService {
  private readonly logger = new Logger(ContentGenerationService.name);
  private readonly anthropic: Anthropic;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (apiKey) {
      this.anthropic = new Anthropic({ apiKey });
    } else {
      this.logger.warn('ANTHROPIC_API_KEY not configured. AI generation features will be disabled.');
    }
  }

  async generateCodingLab(options: CodingLabGenerationOptions): Promise<GeneratedCodingLab | GeneratedTerminalLab> {
    if (!this.anthropic) {
      throw new Error('AI service not configured. Please set ANTHROPIC_API_KEY environment variable.');
    }

    this.logger.log(`Generating ${options.labType} lab for topic: ${options.topic}`);

    if (options.labType === 'coding') {
      return this.generateCodingQuestion(options);
    } else {
      return this.generateTerminalChallenge(options);
    }
  }

  private async generateCodingQuestion(options: CodingLabGenerationOptions): Promise<GeneratedCodingLab> {
    const contextInfo = options.context
      ? `\n\nAdditional Context:\n${options.context}`
      : '';

    const courseInfo = options.courseTitle
      ? `\n\nCourse: ${options.courseTitle}${options.moduleTitle ? `, Module: ${options.moduleTitle}` : ''}`
      : '';

    const prompt = `Generate a coding challenge for an online learning platform with the following specifications:

Topic: ${options.topic}
Difficulty: ${options.difficulty}${courseInfo}${contextInfo}

Please generate a complete coding challenge in JSON format with the following structure:
{
  "title": "Brief, engaging title for the problem",
  "description": "Detailed problem description with examples (use markdown formatting)",
  "difficulty": "${options.difficulty}",
  "estimatedMinutes": <number between 15-60>,
  "starterCode": {
    "python": "# Python starter code",
    "javascript": "// JavaScript starter code",
    "java": "// Java starter code",
    "cpp": "// C++ starter code"
  },
  "testCases": [
    {
      "input": "sample input",
      "expectedOutput": "expected output",
      "explanation": "why this is the expected output",
      "isHidden": false
    },
    // Include at least 3 visible test cases and 2 hidden test cases
  ],
  "hints": [
    "First hint",
    "Second hint",
    "Third hint if needed"
  ],
  "constraints": "Time and space complexity requirements, input constraints"
}

Make the problem:
- Relevant to ${options.topic}
- Appropriate for ${options.difficulty} level
- Educational and engaging
- Include clear examples in the description
- Provide helpful hints
- Have comprehensive test cases

Return ONLY valid JSON, no additional text or markdown formatting.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Parse the JSON response
      const generatedLab = JSON.parse(content.text);

      this.logger.log(`Successfully generated coding lab: ${generatedLab.title}`);
      return generatedLab;
    } catch (error) {
      this.logger.error(`Error generating coding lab: ${error.message}`, error.stack);
      throw new Error(`Failed to generate coding lab: ${error.message}`);
    }
  }

  private async generateTerminalChallenge(options: CodingLabGenerationOptions): Promise<GeneratedTerminalLab> {
    const contextInfo = options.context
      ? `\n\nAdditional Context:\n${options.context}`
      : '';

    const courseInfo = options.courseTitle
      ? `\n\nCourse: ${options.courseTitle}${options.moduleTitle ? `, Module: ${options.moduleTitle}` : ''}`
      : '';

    const prompt = `Generate a terminal/command-line challenge for an online learning platform with the following specifications:

Topic: ${options.topic}
Difficulty: ${options.difficulty}${courseInfo}${contextInfo}

Please generate a complete terminal challenge in JSON format with the following structure:
{
  "title": "Brief, engaging title for the lab",
  "description": "Detailed scenario description explaining what the student will learn and do",
  "difficulty": "${options.difficulty}",
  "estimatedMinutes": <number between 20-90>,
  "scenario": "<docker|kubernetes|linux|git|aws|nginx|python|node>",
  "dockerImage": "appropriate docker image (e.g., ubuntu:22.04, node:18, python:3.11)",
  "setupScript": "#!/bin/bash\\n# Commands to set up the environment before student starts",
  "validationScript": "#!/bin/bash\\n# Script to validate all tasks are completed",
  "tasks": [
    {
      "title": "Task name",
      "description": "What the student needs to do",
      "order": 1,
      "hintCommand": "example command to help",
      "validationString": "string to look for in output or file to verify completion"
    }
    // Include 4-8 progressive tasks
  ]
}

Make the challenge:
- Relevant to ${options.topic}
- Appropriate for ${options.difficulty} level (BEGINNER: basic commands, INTERMEDIATE: combining concepts, ADVANCED: complex scenarios)
- Hands-on and practical
- Include progressive tasks that build on each other
- Provide helpful hint commands
- Include realistic validation checks

Return ONLY valid JSON, no additional text or markdown formatting.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Parse the JSON response
      const generatedLab = JSON.parse(content.text);

      this.logger.log(`Successfully generated terminal lab: ${generatedLab.title}`);
      return generatedLab;
    } catch (error) {
      this.logger.error(`Error generating terminal lab: ${error.message}`, error.stack);
      throw new Error(`Failed to generate terminal lab: ${error.message}`);
    }
  }

  async generateQuiz(topic: string, difficulty: string, count: number) {
    this.logger.log(`Generating ${count} ${difficulty} quiz questions for ${topic}`);

    // TODO: Implement AI-powered quiz generation
    return {
      topic,
      difficulty,
      questions: [],
      message: 'Quiz generation will be implemented with AI integration',
    };
  }

  async generateExplanation(concept: string, level: string) {
    this.logger.log(`Generating explanation for ${concept} at ${level} level`);

    // TODO: Implement AI-powered explanation generation
    return {
      concept,
      level,
      explanation: 'Explanation generation will be implemented with AI integration',
    };
  }
}
