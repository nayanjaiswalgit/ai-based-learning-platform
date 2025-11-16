import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { DockerService } from '../docker/docker.service';
import { SessionService } from '../session/session.service';
import { ScenarioService } from '../scenario/scenario.service';
import { RecordingService } from './recording.service';
import { CollaborationService } from './collaboration.service';

interface TerminalInput {
  sessionId: string;
  data: string;
}

interface TerminalResize {
  sessionId: string;
  rows: number;
  cols: number;
}

@WebSocketGateway({
  namespace: '/terminal',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class TerminalGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TerminalGateway.name);
  private readonly socketToSession = new Map<string, string>();

  constructor(
    private readonly dockerService: DockerService,
    private readonly sessionService: SessionService,
    private readonly scenarioService: ScenarioService,
    private readonly recordingService: RecordingService,
    private readonly collaborationService: CollaborationService,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const sessionId = this.socketToSession.get(client.id);

    if (sessionId) {
      // Remove from collaboration if in shared session
      this.collaborationService.removeParticipant(sessionId, client.id);

      // Clean up container
      await this.stopSession(sessionId);
      this.socketToSession.delete(client.id);
    }
  }

  /**
   * Start a new terminal session
   */
  @SubscribeMessage('start-session')
  async handleStartSession(
    @MessageBody() data: { userId: string; scenarioId: string; enableRecording?: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(
        `Starting session for user ${data.userId}, scenario ${data.scenarioId}`,
      );

      // Get scenario
      const scenario = this.scenarioService.getScenario(data.scenarioId);

      if (!scenario) {
        client.emit('error', { message: 'Scenario not found' });
        return;
      }

      // Create session
      const session = await this.sessionService.createSession(
        data.userId,
        data.scenarioId,
        {
          scenarioTitle: scenario.title,
          recordingEnabled: data.enableRecording || false,
        },
      );

      this.socketToSession.set(client.id, session.sessionId);

      // Start recording if enabled
      if (data.enableRecording) {
        await this.recordingService.startRecording(
          session.sessionId,
          data.userId,
          data.scenarioId,
          { scenarioTitle: scenario.title },
        );
      }

      // Create Docker container
      const container = await this.dockerService.createTerminalContainer(
        session.sessionId,
        {
          image: scenario.dockerImage,
          networkDisabled: true,
          readOnlyRootfs: true,
        },
      );

      // Update session with container ID
      await this.sessionService.setContainerId(
        session.sessionId,
        container.containerId,
      );

      // Update session status
      await this.sessionService.updateSessionStatus(session.sessionId, 'active');

      // Send session started event
      client.emit('session-started', {
        sessionId: session.sessionId,
        scenario: {
          title: scenario.title,
          description: scenario.description,
          checkpoints: scenario.checkpoints,
        },
      });

      // Run setup script if exists
      if (scenario.setupScript) {
        await this.dockerService.executeCommand(container.containerId, [
          '/bin/sh',
          '-c',
          scenario.setupScript,
        ]);
      }

      // Stream container output to client
      container.stream.on('data', (chunk: Buffer) => {
        const output = chunk.toString('utf-8');

        // Record output if recording enabled
        if (data.enableRecording) {
          this.recordingService.recordFrame(session.sessionId, 'output', output);
        }

        // Emit to primary client
        client.emit('terminal-output', {
          sessionId: session.sessionId,
          data: output,
        });

        // Broadcast to shared session participants
        this.collaborationService.broadcastToSession(
          session.sessionId,
          'terminal-output',
          {
            sessionId: session.sessionId,
            data: output,
          },
          client.id,
        );
      });

      container.stream.on('end', () => {
        client.emit('terminal-closed', { sessionId: session.sessionId });
      });

      this.logger.log(`Session ${session.sessionId} started successfully`);
    } catch (error) {
      this.logger.error('Failed to start session', error);
      client.emit('error', { message: 'Failed to start session' });
    }
  }

  /**
   * Handle terminal input from client
   */
  @SubscribeMessage('terminal-input')
  async handleTerminalInput(
    @MessageBody() data: TerminalInput,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionId, data: input } = data;

      // Check if user can write (for collaborative sessions)
      if (!this.collaborationService.canWrite(sessionId, client.id)) {
        const sharedSession = this.collaborationService.getSharedSession(sessionId);
        if (sharedSession && this.socketToSession.get(client.id) !== sessionId) {
          client.emit('error', { message: 'You do not have write permission' });
          return;
        }
      }

      // Get container
      const container = this.dockerService.getContainer(sessionId);

      if (!container) {
        client.emit('error', { message: 'Session not found' });
        return;
      }

      // Record input
      const session = await this.sessionService.getSession(sessionId);
      if (session?.metadata?.recordingEnabled) {
        this.recordingService.recordFrame(sessionId, 'input', input);
      }

      // Write to container stdin
      container.stream.write(input);

      // Add to session history
      if (input.trim()) {
        await this.sessionService.addToHistory(sessionId, input.trim());
      }

      // Extend session expiration on activity
      await this.sessionService.extendSession(sessionId);

      // Broadcast input to collaborators (echo for visibility)
      this.collaborationService.broadcastToSession(
        sessionId,
        'terminal-input-echo',
        { sessionId, data: input },
        client.id,
      );
    } catch (error) {
      this.logger.error('Failed to handle terminal input', error);
      client.emit('error', { message: 'Failed to send input' });
    }
  }

  /**
   * Resize terminal
   */
  @SubscribeMessage('terminal-resize')
  async handleTerminalResize(
    @MessageBody() data: TerminalResize,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionId, rows, cols } = data;

      await this.dockerService.resizeTerminal(sessionId, rows, cols);
    } catch (error) {
      this.logger.error('Failed to resize terminal', error);
    }
  }

  /**
   * Validate checkpoint
   */
  @SubscribeMessage('validate-checkpoint')
  async handleValidateCheckpoint(
    @MessageBody() data: { sessionId: string; checkpointId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionId, checkpointId } = data;

      const session = await this.sessionService.getSession(sessionId);

      if (!session) {
        client.emit('error', { message: 'Session not found' });
        return;
      }

      // Get scenario
      const scenario = this.scenarioService.getScenario(session.scenarioId);

      if (!scenario) {
        client.emit('error', { message: 'Scenario not found' });
        return;
      }

      // Get container output for validation
      const container = this.dockerService.getContainer(sessionId);

      if (!container) {
        client.emit('error', { message: 'Container not found' });
        return;
      }

      // Execute validation command
      const result = await this.dockerService.executeCommand(
        container.containerId,
        ['/bin/sh', '-c', 'ls -la /workspace'],
      );

      // Validate checkpoint
      const isValid = await this.scenarioService.validateCheckpoint(
        session.scenarioId,
        checkpointId,
        result.output,
      );

      // Update checkpoint status
      await this.sessionService.updateCheckpoint(
        sessionId,
        checkpointId,
        isValid,
      );

      // Send validation result
      client.emit('checkpoint-validated', {
        sessionId,
        checkpointId,
        isValid,
      });

      // Check if all checkpoints completed
      const checkpoints = await this.sessionService.getCheckpoints(sessionId);
      const allCompleted = scenario.checkpoints.every(
        (cp) => checkpoints[cp.id] === true,
      );

      if (allCompleted) {
        await this.sessionService.updateSessionStatus(sessionId, 'completed');
        client.emit('scenario-completed', { sessionId });
      }
    } catch (error) {
      this.logger.error('Failed to validate checkpoint', error);
      client.emit('error', { message: 'Failed to validate checkpoint' });
    }
  }

  /**
   * Get hint
   */
  @SubscribeMessage('get-hint')
  async handleGetHint(
    @MessageBody() data: { sessionId: string; hintIndex: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionId, hintIndex } = data;

      const session = await this.sessionService.getSession(sessionId);

      if (!session) {
        client.emit('error', { message: 'Session not found' });
        return;
      }

      const hints = this.scenarioService.getHints(session.scenarioId);

      if (hintIndex < hints.length) {
        client.emit('hint', {
          sessionId,
          hint: hints[hintIndex],
          index: hintIndex,
        });
      }
    } catch (error) {
      this.logger.error('Failed to get hint', error);
    }
  }

  /**
   * Stop session
   */
  @SubscribeMessage('stop-session')
  async handleStopSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionId } = data;
      await this.stopSession(sessionId);
      client.emit('session-stopped', { sessionId });
    } catch (error) {
      this.logger.error('Failed to stop session', error);
      client.emit('error', { message: 'Failed to stop session' });
    }
  }

  /**
   * Get session status
   */
  @SubscribeMessage('get-session-status')
  async handleGetSessionStatus(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionId } = data;

      const session = await this.sessionService.getSession(sessionId);

      if (!session) {
        client.emit('error', { message: 'Session not found' });
        return;
      }

      client.emit('session-status', {
        sessionId,
        status: session.status,
        checkpoints: session.checkpoints,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      });
    } catch (error) {
      this.logger.error('Failed to get session status', error);
    }
  }

  /**
   * Share session for collaboration
   */
  @SubscribeMessage('share-session')
  async handleShareSession(
    @MessageBody() data: { sessionId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionId, userId } = data;

      // Create shared session
      this.collaborationService.createSharedSession(sessionId, userId);

      client.emit('session-shared', {
        sessionId,
        message: 'Session is now shared',
      });

      this.logger.log(`Session ${sessionId} shared by user ${userId}`);
    } catch (error) {
      this.logger.error('Failed to share session', error);
      client.emit('error', { message: 'Failed to share session' });
    }
  }

  /**
   * Join shared session
   */
  @SubscribeMessage('join-shared-session')
  async handleJoinSharedSession(
    @MessageBody() data: { sessionId: string; userId: string; role?: 'viewer' | 'collaborator' },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionId, userId, role } = data;

      // Add participant to shared session
      const success = this.collaborationService.addParticipant(
        sessionId,
        userId,
        client,
        role || 'viewer',
      );

      if (!success) {
        client.emit('error', { message: 'Shared session not found' });
        return;
      }

      // Get participants list
      const participants = this.collaborationService.getParticipants(sessionId);

      client.emit('joined-shared-session', {
        sessionId,
        role: role || 'viewer',
        participants,
      });

      this.logger.log(`User ${userId} joined shared session ${sessionId} as ${role || 'viewer'}`);
    } catch (error) {
      this.logger.error('Failed to join shared session', error);
      client.emit('error', { message: 'Failed to join shared session' });
    }
  }

  /**
   * Change participant role
   */
  @SubscribeMessage('change-participant-role')
  async handleChangeParticipantRole(
    @MessageBody() data: { sessionId: string; userId: string; newRole: 'viewer' | 'collaborator' },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionId, userId, newRole } = data;

      const success = this.collaborationService.changeParticipantRole(
        sessionId,
        userId,
        newRole,
      );

      if (success) {
        client.emit('role-changed-success', {
          sessionId,
          userId,
          newRole,
        });
      } else {
        client.emit('error', { message: 'Failed to change role' });
      }
    } catch (error) {
      this.logger.error('Failed to change participant role', error);
      client.emit('error', { message: 'Failed to change role' });
    }
  }

  /**
   * Get session recording
   */
  @SubscribeMessage('get-recording')
  async handleGetRecording(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionId } = data;

      // In a real implementation, you'd load the recording from storage
      client.emit('recording-info', {
        sessionId,
        message: 'Recording available',
      });
    } catch (error) {
      this.logger.error('Failed to get recording', error);
      client.emit('error', { message: 'Failed to get recording' });
    }
  }

  /**
   * Helper method to stop a session
   */
  private async stopSession(sessionId: string): Promise<void> {
    try {
      // Stop recording if enabled
      const session = await this.sessionService.getSession(sessionId);
      if (session?.metadata?.recordingEnabled) {
        try {
          const filename = await this.recordingService.stopRecording(sessionId);
          this.logger.log(`Recording saved: ${filename}`);
        } catch (error) {
          this.logger.error('Failed to stop recording', error);
        }
      }

      // End shared session if exists
      this.collaborationService.endSharedSession(sessionId);

      // Stop Docker container
      await this.dockerService.stopContainer(sessionId);

      // Update session status
      await this.sessionService.updateSessionStatus(sessionId, 'completed');

      this.logger.log(`Session ${sessionId} stopped`);
    } catch (error) {
      this.logger.error(`Failed to stop session ${sessionId}`, error);
      throw error;
    }
  }
}
