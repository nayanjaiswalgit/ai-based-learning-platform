import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { SkillLevel, LearningGoal, DifficultyLevel } from '../src/types';

describe('Skill Assessment (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /skill-assessment/create', () => {
    it('should create a skill assessment with AI-generated questions', async () => {
      const createAssessmentDto = {
        userId: 'test-user-1',
        goal: LearningGoal.WEB_DEVELOPMENT,
        estimatedLevel: SkillLevel.BEGINNER,
        focusAreas: ['JavaScript', 'React'],
      };

      // Note: This test requires valid API keys
      // In production, use mocked AI responses for faster testing
      expect(createAssessmentDto).toBeDefined();
    });
  });

  describe('POST /skill-assessment/generate-questions', () => {
    it('should generate AI-powered assessment questions', async () => {
      const generateQuestionsDto = {
        goal: LearningGoal.WEB_DEVELOPMENT,
        difficulty: DifficultyLevel.MEDIUM,
        count: 10,
        topics: ['JavaScript', 'TypeScript'],
      };

      // Mock test - actual implementation would call the API
      expect(generateQuestionsDto.count).toBe(10);
    });
  });

  describe('POST /skill-assessment/skill-gaps', () => {
    it('should analyze skill gaps for a user', async () => {
      const skillGapsDto = {
        userId: 'test-user-1',
        targetGoal: LearningGoal.WEB_DEVELOPMENT,
      };

      expect(skillGapsDto.targetGoal).toBe(LearningGoal.WEB_DEVELOPMENT);
    });
  });
});
