import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

export interface TerminalSession {
  sessionId: string;
  userId: string;
  scenarioId: string;
  containerId?: string;
  status: 'initializing' | 'active' | 'completed' | 'timeout' | 'error';
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  history: string[];
  checkpoints: Record<string, boolean>;
  metadata?: Record<string, any>;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly redis: Redis;
  private readonly SESSION_PREFIX = 'terminal:session:';
  private readonly SESSION_TTL = 30 * 60; // 30 minutes in seconds

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      db: this.configService.get('REDIS_DB', 0),
    });

    this.redis.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error', error);
    });

    // Start session cleanup interval
    this.startSessionCleanup();
  }

  /**
   * Create a new terminal session
   */
  async createSession(
    userId: string,
    scenarioId: string,
    metadata?: Record<string, any>,
  ): Promise<TerminalSession> {
    const sessionId = uuidv4();
    const now = new Date();

    const session: TerminalSession = {
      sessionId,
      userId,
      scenarioId,
      status: 'initializing',
      createdAt: now,
      lastActivity: now,
      expiresAt: new Date(now.getTime() + this.SESSION_TTL * 1000),
      history: [],
      checkpoints: {},
      metadata,
    };

    await this.saveSession(session);

    this.logger.log(`Session ${sessionId} created for user ${userId}`);

    return session;
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<TerminalSession | null> {
    const key = this.SESSION_PREFIX + sessionId;
    const data = await this.redis.get(key);

    if (!data) {
      return null;
    }

    const session = JSON.parse(data);
    session.createdAt = new Date(session.createdAt);
    session.lastActivity = new Date(session.lastActivity);
    session.expiresAt = new Date(session.expiresAt);

    return session;
  }

  /**
   * Update session
   */
  async updateSession(session: TerminalSession): Promise<void> {
    session.lastActivity = new Date();
    await this.saveSession(session);
  }

  /**
   * Save session to Redis
   */
  private async saveSession(session: TerminalSession): Promise<void> {
    const key = this.SESSION_PREFIX + session.sessionId;
    await this.redis.setex(key, this.SESSION_TTL, JSON.stringify(session));
  }

  /**
   * Update session status
   */
  async updateSessionStatus(
    sessionId: string,
    status: TerminalSession['status'],
  ): Promise<void> {
    const session = await this.getSession(sessionId);

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.status = status;
    await this.updateSession(session);

    this.logger.log(`Session ${sessionId} status updated to ${status}`);
  }

  /**
   * Add command to session history
   */
  async addToHistory(sessionId: string, command: string): Promise<void> {
    const session = await this.getSession(sessionId);

    if (!session) {
      return;
    }

    session.history.push(`${new Date().toISOString()}: ${command}`);

    // Keep only last 100 commands
    if (session.history.length > 100) {
      session.history = session.history.slice(-100);
    }

    await this.updateSession(session);
  }

  /**
   * Update checkpoint status
   */
  async updateCheckpoint(
    sessionId: string,
    checkpointId: string,
    completed: boolean,
  ): Promise<void> {
    const session = await this.getSession(sessionId);

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.checkpoints[checkpointId] = completed;
    await this.updateSession(session);

    this.logger.log(
      `Checkpoint ${checkpointId} for session ${sessionId}: ${completed}`,
    );
  }

  /**
   * Get all checkpoints status
   */
  async getCheckpoints(sessionId: string): Promise<Record<string, boolean>> {
    const session = await this.getSession(sessionId);

    if (!session) {
      return {};
    }

    return session.checkpoints;
  }

  /**
   * Set container ID for session
   */
  async setContainerId(sessionId: string, containerId: string): Promise<void> {
    const session = await this.getSession(sessionId);

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.containerId = containerId;
    await this.updateSession(session);
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const key = this.SESSION_PREFIX + sessionId;
    await this.redis.del(key);

    this.logger.log(`Session ${sessionId} deleted`);
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<TerminalSession[]> {
    const pattern = this.SESSION_PREFIX + '*';
    const keys = await this.redis.keys(pattern);

    const sessions: TerminalSession[] = [];

    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        const session = JSON.parse(data);
        if (session.userId === userId) {
          session.createdAt = new Date(session.createdAt);
          session.lastActivity = new Date(session.lastActivity);
          session.expiresAt = new Date(session.expiresAt);
          sessions.push(session);
        }
      }
    }

    return sessions;
  }

  /**
   * Extend session expiration
   */
  async extendSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);

    if (!session) {
      return;
    }

    session.expiresAt = new Date(Date.now() + this.SESSION_TTL * 1000);
    await this.saveSession(session);
  }

  /**
   * Start periodic session cleanup
   */
  private startSessionCleanup(): void {
    setInterval(
      async () => {
        try {
          const pattern = this.SESSION_PREFIX + '*';
          const keys = await this.redis.keys(pattern);

          for (const key of keys) {
            const data = await this.redis.get(key);
            if (data) {
              const session = JSON.parse(data);
              const expiresAt = new Date(session.expiresAt);

              if (expiresAt < new Date()) {
                await this.redis.del(key);
                this.logger.log(`Cleaned up expired session: ${session.sessionId}`);
              }
            }
          }
        } catch (error) {
          this.logger.error('Session cleanup error', error);
        }
      },
      5 * 60 * 1000,
    ); // Run every 5 minutes
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    error: number;
  }> {
    const pattern = this.SESSION_PREFIX + '*';
    const keys = await this.redis.keys(pattern);

    const stats = {
      total: keys.length,
      active: 0,
      completed: 0,
      error: 0,
    };

    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        const session = JSON.parse(data);
        if (session.status === 'active') stats.active++;
        if (session.status === 'completed') stats.completed++;
        if (session.status === 'error') stats.error++;
      }
    }

    return stats;
  }
}
