import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../../src/app.module';

describe('Terminal Service Integration Tests', () => {
  let app: INestApplication;
  let client: Socket;
  let sessionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(3007);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach((done) => {
    client = io('http://localhost:3007/terminal', {
      withCredentials: true,
    });

    client.on('connect', () => {
      done();
    });
  });

  afterEach(() => {
    if (client.connected) {
      client.disconnect();
    }
  });

  describe('Session Lifecycle', () => {
    it('should start a new terminal session', (done) => {
      client.emit('start-session', {
        userId: 'test-user',
        scenarioId: 'scenario-linux-basics',
      });

      client.on('session-started', (data) => {
        expect(data.sessionId).toBeDefined();
        expect(data.scenario).toBeDefined();
        expect(data.scenario.title).toBe('Linux File Operations - Basics');
        sessionId = data.sessionId;
        done();
      });
    });

    it('should receive terminal output', (done) => {
      client.emit('start-session', {
        userId: 'test-user',
        scenarioId: 'scenario-linux-basics',
      });

      client.on('session-started', (data) => {
        sessionId = data.sessionId;

        // Send a command
        client.emit('terminal-input', {
          sessionId: data.sessionId,
          data: 'ls\n',
        });
      });

      client.on('terminal-output', (data) => {
        expect(data.sessionId).toBe(sessionId);
        expect(data.data).toBeDefined();
        done();
      });
    }, 10000);

    it('should validate checkpoint', (done) => {
      client.emit('start-session', {
        userId: 'test-user',
        scenarioId: 'scenario-linux-basics',
      });

      client.on('session-started', (data) => {
        sessionId = data.sessionId;

        // Validate first checkpoint
        client.emit('validate-checkpoint', {
          sessionId: data.sessionId,
          checkpointId: 'cp1',
        });
      });

      client.on('checkpoint-validated', (data) => {
        expect(data.sessionId).toBe(sessionId);
        expect(data.checkpointId).toBe('cp1');
        expect(typeof data.isValid).toBe('boolean');
        done();
      });
    }, 10000);

    it('should stop a session', (done) => {
      client.emit('start-session', {
        userId: 'test-user',
        scenarioId: 'scenario-linux-basics',
      });

      client.on('session-started', (data) => {
        sessionId = data.sessionId;

        client.emit('stop-session', {
          sessionId: data.sessionId,
        });
      });

      client.on('session-stopped', (data) => {
        expect(data.sessionId).toBe(sessionId);
        done();
      });
    }, 10000);
  });

  describe('Scenario Management', () => {
    it('should list all scenarios', async () => {
      const response = await fetch('http://localhost:3007/scenarios');
      const scenarios = await response.json();

      expect(Array.isArray(scenarios)).toBe(true);
      expect(scenarios.length).toBeGreaterThan(0);
    });

    it('should get a specific scenario', async () => {
      const response = await fetch('http://localhost:3007/scenarios');
      const scenarios = await response.json();

      const scenarioId = scenarios[0].id;
      const detailResponse = await fetch(
        `http://localhost:3007/scenarios/${scenarioId}`,
      );
      const scenario = await detailResponse.json();

      expect(scenario.id).toBe(scenarioId);
      expect(scenario.title).toBeDefined();
      expect(scenario.checkpoints).toBeDefined();
    });

    it('should filter scenarios by category', async () => {
      const response = await fetch(
        'http://localhost:3007/scenarios?category=linux',
      );
      const scenarios = await response.json();

      expect(Array.isArray(scenarios)).toBe(true);
      scenarios.forEach((scenario) => {
        expect(scenario.category).toBe('linux');
      });
    });
  });

  describe('Session Recording', () => {
    it('should record a session when enabled', (done) => {
      client.emit('start-session', {
        userId: 'test-user',
        scenarioId: 'scenario-linux-basics',
        enableRecording: true,
      });

      client.on('session-started', (data) => {
        sessionId = data.sessionId;

        // Send some commands
        client.emit('terminal-input', {
          sessionId: data.sessionId,
          data: 'echo "test"\n',
        });

        setTimeout(() => {
          // Stop session to save recording
          client.emit('stop-session', {
            sessionId: data.sessionId,
          });
        }, 2000);
      });

      client.on('session-stopped', () => {
        done();
      });
    }, 10000);
  });

  describe('Collaboration', () => {
    let client2: Socket;

    beforeEach((done) => {
      client2 = io('http://localhost:3007/terminal', {
        withCredentials: true,
      });

      client2.on('connect', () => {
        done();
      });
    });

    afterEach(() => {
      if (client2.connected) {
        client2.disconnect();
      }
    });

    it('should share a session', (done) => {
      client.emit('start-session', {
        userId: 'instructor-123',
        scenarioId: 'scenario-linux-basics',
      });

      client.on('session-started', (data) => {
        sessionId = data.sessionId;

        client.emit('share-session', {
          sessionId: data.sessionId,
          userId: 'instructor-123',
        });
      });

      client.on('session-shared', (data) => {
        expect(data.sessionId).toBe(sessionId);
        done();
      });
    }, 10000);

    it('should allow another user to join shared session', (done) => {
      // Start session with first client
      client.emit('start-session', {
        userId: 'instructor-123',
        scenarioId: 'scenario-linux-basics',
      });

      client.on('session-started', (data) => {
        sessionId = data.sessionId;

        // Share the session
        client.emit('share-session', {
          sessionId: data.sessionId,
          userId: 'instructor-123',
        });

        client.on('session-shared', () => {
          // Second client joins
          client2.emit('join-shared-session', {
            sessionId: data.sessionId,
            userId: 'student-123',
            role: 'viewer',
          });
        });
      });

      client2.on('joined-shared-session', (data) => {
        expect(data.sessionId).toBe(sessionId);
        expect(data.role).toBe('viewer');
        expect(data.participants).toBeDefined();
        done();
      });
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should handle non-existent scenario', (done) => {
      client.emit('start-session', {
        userId: 'test-user',
        scenarioId: 'non-existent-scenario',
      });

      client.on('error', (data) => {
        expect(data.message).toBe('Scenario not found');
        done();
      });
    });

    it('should handle invalid session ID', (done) => {
      client.emit('terminal-input', {
        sessionId: 'invalid-session-id',
        data: 'ls\n',
      });

      client.on('error', (data) => {
        expect(data.message).toBe('Session not found');
        done();
      });
    });
  });

  describe('Terminal Resize', () => {
    it('should resize terminal', (done) => {
      client.emit('start-session', {
        userId: 'test-user',
        scenarioId: 'scenario-linux-basics',
      });

      client.on('session-started', (data) => {
        sessionId = data.sessionId;

        client.emit('terminal-resize', {
          sessionId: data.sessionId,
          rows: 40,
          cols: 120,
        });

        // If no error, resize was successful
        setTimeout(done, 1000);
      });
    }, 10000);
  });

  describe('Hints System', () => {
    it('should provide hints', (done) => {
      client.emit('start-session', {
        userId: 'test-user',
        scenarioId: 'scenario-linux-basics',
      });

      client.on('session-started', (data) => {
        sessionId = data.sessionId;

        client.emit('get-hint', {
          sessionId: data.sessionId,
          hintIndex: 0,
        });
      });

      client.on('hint', (data) => {
        expect(data.sessionId).toBe(sessionId);
        expect(data.hint).toBeDefined();
        expect(data.index).toBe(0);
        done();
      });
    }, 10000);
  });
});
