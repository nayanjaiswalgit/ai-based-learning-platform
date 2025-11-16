import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { Roadmap, Milestone, Task, SkillLevel, LearningGoal } from '@/types';
import { GenerateRoadmapDto, UpdateRoadmapProgressDto } from './dto/roadmap.dto';

@Injectable()
export class RoadmapService {
  private readonly logger = new Logger(RoadmapService.name);
  private readonly openai: OpenAI;
  private readonly anthropic: Anthropic;

  // In-memory storage (replace with database in production)
  private roadmaps = new Map<string, Roadmap>();

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('ai.openai.apiKey'),
    });

    this.anthropic = new Anthropic({
      apiKey: this.configService.get('ai.anthropic.apiKey'),
    });
  }

  /**
   * Phase 2.1: Generate AI-powered personalized roadmap
   * Uses GPT-4 or Claude based on configuration
   */
  async generateRoadmap(dto: GenerateRoadmapDto): Promise<Roadmap> {
    this.logger.log(`Generating roadmap for user ${dto.userId} with goal ${dto.goal}`);

    // Choose AI provider (use Claude for better planning, GPT-4 as fallback)
    const useAnthropic = !!this.configService.get('ai.anthropic.apiKey');

    let roadmapData: any;

    if (useAnthropic) {
      roadmapData = await this.generateRoadmapWithClaude(dto);
    } else {
      roadmapData = await this.generateRoadmapWithGPT4(dto);
    }

    const roadmapId = `roadmap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const roadmap: Roadmap = {
      id: roadmapId,
      userId: dto.userId,
      goal: dto.goal,
      title: roadmapData.title,
      description: roadmapData.description,
      totalDuration: roadmapData.totalDuration,
      milestones: roadmapData.milestones,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.roadmaps.set(roadmapId, roadmap);
    return roadmap;
  }

  /**
   * Phase 2.2: Generate roadmap using Anthropic Claude
   */
  private async generateRoadmapWithClaude(dto: GenerateRoadmapDto): Promise<any> {
    const prompt = this.buildRoadmapPrompt(dto);

    try {
      const message = await this.anthropic.messages.create({
        model: this.configService.get('ai.anthropic.model'),
        max_tokens: this.configService.get('ai.anthropic.maxTokens'),
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        return JSON.parse(content.text);
      }

      throw new Error('Unexpected response format from Claude');
    } catch (error) {
      this.logger.error('Failed to generate roadmap with Claude:', error);
      throw error;
    }
  }

  /**
   * Phase 2.3: Generate roadmap using OpenAI GPT-4
   */
  private async generateRoadmapWithGPT4(dto: GenerateRoadmapDto): Promise<any> {
    const prompt = this.buildRoadmapPrompt(dto);

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.configService.get('ai.openai.model'),
        messages: [
          {
            role: 'system',
            content: 'You are an expert career coach and learning path designer. Create detailed, actionable learning roadmaps.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      this.logger.error('Failed to generate roadmap with GPT-4:', error);
      throw error;
    }
  }

  /**
   * Phase 2.4: Build roadmap generation prompt
   */
  private buildRoadmapPrompt(dto: GenerateRoadmapDto): string {
    return `Create a comprehensive, personalized learning roadmap with the following requirements:

**User Profile:**
- Learning Goal: ${dto.goal}
- Current Skill Level: ${dto.currentSkillLevel}
- Available Study Time: ${dto.availableHoursPerWeek} hours per week
- Learning Style: ${dto.preferredLearningStyle || 'MIXED'}
${dto.specificInterests?.length ? `- Specific Interests: ${dto.specificInterests.join(', ')}` : ''}

**Requirements:**
1. Create a structured roadmap with clear milestones and tasks
2. Break down into weekly phases
3. Include specific courses, coding problems, and projects
4. Provide realistic time estimates
5. Progress from fundamentals to advanced topics
6. Include hands-on projects for practical experience

**Response Format (JSON):**
{
  "title": "Roadmap title",
  "description": "Brief overview of the learning path",
  "totalDuration": 16,
  "milestones": [
    {
      "id": "milestone_1",
      "title": "Milestone title",
      "description": "What will be learned",
      "phase": 1,
      "weekStart": 1,
      "weekEnd": 4,
      "tasks": [
        {
          "id": "task_1",
          "title": "Task title",
          "description": "Detailed description",
          "type": "COURSE|PROBLEM|PROJECT|READING",
          "estimatedHours": 10,
          "isCompleted": false
        }
      ],
      "isCompleted": false
    }
  ]
}

Create 4-6 milestones covering ${Math.ceil(dto.availableHoursPerWeek * 16 / 40)} weeks of learning.`;
  }

  /**
   * Phase 2.5: Update roadmap progress
   */
  async updateProgress(dto: UpdateRoadmapProgressDto): Promise<Roadmap> {
    const roadmap = this.roadmaps.get(dto.roadmapId);
    if (!roadmap) {
      throw new Error('Roadmap not found');
    }

    // Find and update the task
    for (const milestone of roadmap.milestones) {
      if (milestone.id === dto.milestoneId) {
        for (const task of milestone.tasks) {
          if (task.id === dto.taskId) {
            task.isCompleted = dto.completed ?? true;
            task.completedAt = new Date();
          }
        }

        // Check if all tasks in milestone are completed
        milestone.isCompleted = milestone.tasks.every((t) => t.isCompleted);
      }
    }

    roadmap.updatedAt = new Date();

    // Check if roadmap needs dynamic updates based on progress
    const shouldUpdate = await this.shouldUpdateRoadmap(roadmap);
    if (shouldUpdate) {
      await this.dynamicallyUpdateRoadmap(roadmap);
    }

    return roadmap;
  }

  /**
   * Phase 2.6: Dynamically update roadmap based on progress
   */
  private async shouldUpdateRoadmap(roadmap: Roadmap): Promise<boolean> {
    // Check if user is progressing faster/slower than expected
    const completedMilestones = roadmap.milestones.filter((m) => m.isCompleted).length;
    const totalMilestones = roadmap.milestones.length;
    const expectedProgress = this.calculateExpectedProgress(roadmap);

    const actualProgress = completedMilestones / totalMilestones;

    // Update if deviation is more than 20%
    return Math.abs(actualProgress - expectedProgress) > 0.2;
  }

  /**
   * Phase 2.7: Dynamically adjust roadmap
   */
  private async dynamicallyUpdateRoadmap(roadmap: Roadmap): Promise<void> {
    this.logger.log(`Dynamically updating roadmap ${roadmap.id}`);

    const completedMilestones = roadmap.milestones.filter((m) => m.isCompleted);
    const upcomingMilestones = roadmap.milestones.filter((m) => !m.isCompleted);

    // Use AI to adjust remaining milestones
    const prompt = `Given a learning roadmap where the user has completed:
${completedMilestones.map((m) => `- ${m.title}`).join('\n')}

Adjust the following upcoming milestones to better match the user's pace and learning:
${upcomingMilestones.map((m) => `- ${m.title}`).join('\n')}

Return adjusted milestones in the same JSON format, optimizing for the user's demonstrated learning pace.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.configService.get('ai.openai.model'),
        messages: [
          {
            role: 'system',
            content: 'You are an adaptive learning system that optimizes roadmaps based on user progress.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const adjustedData = JSON.parse(completion.choices[0].message.content);

      // Update upcoming milestones
      if (adjustedData.milestones) {
        const completedCount = completedMilestones.length;
        adjustedData.milestones.forEach((adjustedMilestone, index) => {
          const originalMilestone = upcomingMilestones[index];
          if (originalMilestone) {
            originalMilestone.title = adjustedMilestone.title || originalMilestone.title;
            originalMilestone.description = adjustedMilestone.description || originalMilestone.description;
            originalMilestone.tasks = adjustedMilestone.tasks || originalMilestone.tasks;
          }
        });
      }

      roadmap.updatedAt = new Date();
    } catch (error) {
      this.logger.error('Failed to dynamically update roadmap:', error);
    }
  }

  /**
   * Helper: Calculate expected progress
   */
  private calculateExpectedProgress(roadmap: Roadmap): number {
    const daysSinceCreation = Math.floor(
      (Date.now() - roadmap.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    const weeksSinceCreation = daysSinceCreation / 7;
    const totalWeeks = roadmap.totalDuration;

    return weeksSinceCreation / totalWeeks;
  }

  /**
   * Get user's roadmap
   */
  async getRoadmap(userId: string, roadmapId?: string): Promise<Roadmap | Roadmap[]> {
    if (roadmapId) {
      const roadmap = this.roadmaps.get(roadmapId);
      if (!roadmap || roadmap.userId !== userId) {
        throw new Error('Roadmap not found');
      }
      return roadmap;
    }

    // Get all roadmaps for user
    const userRoadmaps = Array.from(this.roadmaps.values()).filter((r) => r.userId === userId);
    return userRoadmaps;
  }
}
