import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

@Injectable()
export class LearningPathService {
  private readonly logger = new Logger(LearningPathService.name);
  private readonly openai: OpenAI;
  private readonly prisma: PrismaClient;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    this.prisma = new PrismaClient();
  }

  async generatePath(userId: string, goal: string, currentSkillLevel: string, timeCommitment: number = 10) {
    this.logger.log(`Generating learning path for user ${userId}`);

    const prompt = `Generate a personalized learning path for a student with the following profile:

  Goal: ${goal}
  Current Skill Level: ${currentSkillLevel}
  Time Commitment: ${timeCommitment} hours per week

  Create a structured learning path with:
  1. Phases (beginner, intermediate, advanced)
  2. Topics to learn in each phase
  3. Recommended resources (courses, articles, projects)
  4. Estimated time for each topic
  5. Prerequisites
  6. Practice projects

  Return as JSON with structure:
  {
    "phases": [
      {
        "name": "Phase 1: Foundations",
        "duration": "4 weeks",
        "topics": [
          {
            "name": "Topic name",
            "description": "What to learn",
            "resources": ["resource1", "resource2"],
            "estimatedHours": 10,
            "projects": ["project1"]
          }
        ]
      }
    ]
  }`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const learningPath = JSON.parse(response.choices[0].message.content);

      // Save to database
      const savedPath = await this.prisma.learningPath.create({
        data: {
          userId,
          goal,
          content: learningPath,
          createdAt: new Date(),
        },
      });

      return savedPath;
    } catch (error) {
      this.logger.error(`Failed to generate learning path: ${error.message}`);
      throw error;
    }
  }

  async optimizePath(pathId: string, userProgress: any) {
    this.logger.log(`Optimizing learning path ${pathId}`);

    try {
      const path = await this.prisma.learningPath.findUnique({ where: { id: pathId } });

      if (!path) {
        throw new Error('Learning path not found');
      }

      const prompt = `Based on the user's progress, optimize this learning path:

  Current Path: ${JSON.stringify(path.content)}
  User Progress: ${JSON.stringify(userProgress)}

  Suggestions:
  - Skip topics they already know
  - Add more practice for weak areas
  - Adjust time estimates based on actual progress
  - Recommend additional resources for struggling topics

  Return optimized path in same JSON format.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const optimizedPath = JSON.parse(response.choices[0].message.content);

      const updatedPath = await this.prisma.learningPath.update({
        where: { id: pathId },
        data: { content: optimizedPath },
      });

      return updatedPath;
    } catch (error) {
      this.logger.error(`Failed to optimize learning path: ${error.message}`);
      throw error;
    }
  }
}
