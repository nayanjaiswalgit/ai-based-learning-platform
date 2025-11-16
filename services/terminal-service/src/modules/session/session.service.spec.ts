import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: any) => defaultValue),
          },
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession', () => {
    it('should create a new session', async () => {
      const session = await service.createSession(
        'test-user',
        'test-scenario',
      );

      expect(session).toBeDefined();
      expect(session.userId).toBe('test-user');
      expect(session.scenarioId).toBe('test-scenario');
      expect(session.status).toBe('initializing');
    });
  });

  describe('getSession', () => {
    it('should retrieve an existing session', async () => {
      const created = await service.createSession(
        'test-user',
        'test-scenario',
      );

      const retrieved = await service.getSession(created.sessionId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.sessionId).toBe(created.sessionId);
    });

    it('should return null for non-existent session', async () => {
      const session = await service.getSession('non-existent');
      expect(session).toBeNull();
    });
  });

  describe('updateSessionStatus', () => {
    it('should update session status', async () => {
      const session = await service.createSession(
        'test-user',
        'test-scenario',
      );

      await service.updateSessionStatus(session.sessionId, 'active');

      const updated = await service.getSession(session.sessionId);
      expect(updated?.status).toBe('active');
    });
  });

  describe('checkpoint management', () => {
    it('should update checkpoint status', async () => {
      const session = await service.createSession(
        'test-user',
        'test-scenario',
      );

      await service.updateCheckpoint(session.sessionId, 'cp1', true);

      const checkpoints = await service.getCheckpoints(session.sessionId);
      expect(checkpoints['cp1']).toBe(true);
    });
  });
});
