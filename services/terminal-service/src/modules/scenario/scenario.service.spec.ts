import { Test, TestingModule } from '@nestjs/testing';
import { ScenarioService } from './scenario.service';

describe('ScenarioService', () => {
  let service: ScenarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScenarioService],
    }).compile();

    service = module.get<ScenarioService>(ScenarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getScenario', () => {
    it('should return a scenario by ID', () => {
      const scenarios = service.listScenarios();
      const scenario = service.getScenario(scenarios[0].id);

      expect(scenario).toBeDefined();
      expect(scenario?.id).toBe(scenarios[0].id);
    });

    it('should return undefined for non-existent scenario', () => {
      const scenario = service.getScenario('non-existent');
      expect(scenario).toBeUndefined();
    });
  });

  describe('listScenarios', () => {
    it('should list all scenarios', () => {
      const scenarios = service.listScenarios();
      expect(scenarios.length).toBeGreaterThan(0);
    });

    it('should filter scenarios by category', () => {
      const linuxScenarios = service.listScenarios('linux');
      expect(linuxScenarios.every((s) => s.category === 'linux')).toBe(true);
    });
  });

  describe('createScenario', () => {
    it('should create a new scenario', () => {
      const newScenario = service.createScenario({
        title: 'Test Scenario',
        description: 'Test description',
        category: 'linux',
        difficulty: 'beginner',
        estimatedTime: 10,
        dockerImage: 'ubuntu:22.04',
        checkpoints: [],
        hints: [],
        createdBy: 'test-user',
      });

      expect(newScenario).toBeDefined();
      expect(newScenario.title).toBe('Test Scenario');
      expect(newScenario.id).toBeDefined();
    });
  });

  describe('validateCheckpoint', () => {
    it('should validate checkpoint correctly', async () => {
      const scenarios = service.listScenarios();
      const scenario = scenarios[0];
      const checkpoint = scenario.checkpoints[0];

      // Mock validation
      const isValid = await service.validateCheckpoint(
        scenario.id,
        checkpoint.id,
        'test output',
      );

      expect(typeof isValid).toBe('boolean');
    });
  });
});
