import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface SharedSession {
  sessionId: string;
  ownerId: string;
  participants: Map<string, { userId: string; socket: Socket; role: 'viewer' | 'collaborator' }>;
  createdAt: Date;
}

@Injectable()
export class CollaborationService {
  private readonly logger = new Logger(CollaborationService.name);
  private sharedSessions: Map<string, SharedSession> = new Map();

  /**
   * Create a shared session
   */
  createSharedSession(sessionId: string, ownerId: string): SharedSession {
    const sharedSession: SharedSession = {
      sessionId,
      ownerId,
      participants: new Map(),
      createdAt: new Date(),
    };

    this.sharedSessions.set(sessionId, sharedSession);

    this.logger.log(`Shared session created: ${sessionId} by ${ownerId}`);

    return sharedSession;
  }

  /**
   * Add participant to shared session
   */
  addParticipant(
    sessionId: string,
    userId: string,
    socket: Socket,
    role: 'viewer' | 'collaborator' = 'viewer',
  ): boolean {
    const sharedSession = this.sharedSessions.get(sessionId);

    if (!sharedSession) {
      return false;
    }

    sharedSession.participants.set(socket.id, {
      userId,
      socket,
      role,
    });

    this.logger.log(
      `User ${userId} joined shared session ${sessionId} as ${role}`,
    );

    // Notify other participants
    this.broadcastToSession(
      sessionId,
      'participant-joined',
      {
        userId,
        role,
      },
      socket.id,
    );

    return true;
  }

  /**
   * Remove participant from shared session
   */
  removeParticipant(sessionId: string, socketId: string): void {
    const sharedSession = this.sharedSessions.get(sessionId);

    if (!sharedSession) {
      return;
    }

    const participant = sharedSession.participants.get(socketId);

    if (participant) {
      sharedSession.participants.delete(socketId);

      this.logger.log(
        `User ${participant.userId} left shared session ${sessionId}`,
      );

      // Notify other participants
      this.broadcastToSession(
        sessionId,
        'participant-left',
        {
          userId: participant.userId,
        },
        socketId,
      );
    }

    // If no participants left and owner is gone, delete session
    if (sharedSession.participants.size === 0) {
      this.sharedSessions.delete(sessionId);
      this.logger.log(`Shared session ${sessionId} deleted (no participants)`);
    }
  }

  /**
   * Broadcast message to all participants in a session
   */
  broadcastToSession(
    sessionId: string,
    event: string,
    data: any,
    excludeSocketId?: string,
  ): void {
    const sharedSession = this.sharedSessions.get(sessionId);

    if (!sharedSession) {
      return;
    }

    sharedSession.participants.forEach((participant, socketId) => {
      if (socketId !== excludeSocketId) {
        participant.socket.emit(event, data);
      }
    });
  }

  /**
   * Get shared session
   */
  getSharedSession(sessionId: string): SharedSession | undefined {
    return this.sharedSessions.get(sessionId);
  }

  /**
   * Check if user can write to session
   */
  canWrite(sessionId: string, socketId: string): boolean {
    const sharedSession = this.sharedSessions.get(sessionId);

    if (!sharedSession) {
      return false;
    }

    const participant = sharedSession.participants.get(socketId);

    if (!participant) {
      return false;
    }

    // Owner and collaborators can write
    return (
      participant.userId === sharedSession.ownerId ||
      participant.role === 'collaborator'
    );
  }

  /**
   * Change participant role
   */
  changeParticipantRole(
    sessionId: string,
    userId: string,
    newRole: 'viewer' | 'collaborator',
  ): boolean {
    const sharedSession = this.sharedSessions.get(sessionId);

    if (!sharedSession) {
      return false;
    }

    // Find participant by userId
    for (const [socketId, participant] of sharedSession.participants) {
      if (participant.userId === userId) {
        participant.role = newRole;

        this.logger.log(
          `User ${userId} role changed to ${newRole} in session ${sessionId}`,
        );

        // Notify participant
        participant.socket.emit('role-changed', { role: newRole });

        // Notify other participants
        this.broadcastToSession(
          sessionId,
          'participant-role-changed',
          {
            userId,
            role: newRole,
          },
          socketId,
        );

        return true;
      }
    }

    return false;
  }

  /**
   * Get list of participants
   */
  getParticipants(sessionId: string): Array<{
    userId: string;
    role: string;
  }> {
    const sharedSession = this.sharedSessions.get(sessionId);

    if (!sharedSession) {
      return [];
    }

    return Array.from(sharedSession.participants.values()).map((p) => ({
      userId: p.userId,
      role: p.role,
    }));
  }

  /**
   * End shared session
   */
  endSharedSession(sessionId: string): void {
    const sharedSession = this.sharedSessions.get(sessionId);

    if (!sharedSession) {
      return;
    }

    // Notify all participants
    this.broadcastToSession(sessionId, 'session-ended', {});

    // Remove session
    this.sharedSessions.delete(sessionId);

    this.logger.log(`Shared session ${sessionId} ended`);
  }
}
