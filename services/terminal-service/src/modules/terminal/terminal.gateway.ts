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
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const sessionId = this.socketToSession.get(client.id);

    if (sessionId) {
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
    @MessageBody() data: { userId: string; scenarioId: string },
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
        },
      );

      this.socketToSession.set(client.id, session.sessionId);

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
        client.emit('terminal-output', {
          sessionId: session.sessionId,
          data: chunk.toString('utf-8'),
        });
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

      // Get container
      const container = this.dockerService.getContainer(sessionId);

      if (!container) {
        client.emit('error', { message: 'Session not found' });
        return;
      }

      // Write to container stdin
      container.stream.write(input);

      // Add to session history
      if (input.trim()) {
        await this.sessionService.addToHistory(sessionId, input.trim());
      }

      // Extend session expiration on activity
      await this.sessionService.extendSession(sessionId);
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
   * Helper method to stop a session
   */
  private async stopSession(sessionId: string): Promise<void> {
    try {
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
