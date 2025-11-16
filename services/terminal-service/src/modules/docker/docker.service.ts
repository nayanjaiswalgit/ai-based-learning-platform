import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';

export interface ContainerConfig {
  image: string;
  cpuQuota?: number;
  memory?: number;
  networkDisabled?: boolean;
  readOnlyRootfs?: boolean;
  env?: string[];
  cmd?: string[];
}

export interface TerminalContainer {
  containerId: string;
  sessionId: string;
  stream: NodeJS.ReadWriteStream;
  container: Docker.Container;
  createdAt: Date;
}

@Injectable()
export class DockerService implements OnModuleInit {
  private readonly logger = new Logger(DockerService.name);
  private docker: Docker;
  private containers: Map<string, TerminalContainer> = new Map();

  constructor() {
    // Initialize Docker client
    this.docker = new Docker({
      socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock',
    });
  }

  async onModuleInit() {
    try {
      // Verify Docker connection
      const info = await this.docker.info();
      this.logger.log(`Connected to Docker: ${info.Name}`);

      // Clean up any stale containers on startup
      await this.cleanupStaleContainers();
    } catch (error) {
      this.logger.error('Failed to connect to Docker', error);
      throw new Error('Docker connection failed');
    }
  }

  /**
   * Create a new terminal container
   */
  async createTerminalContainer(
    sessionId: string,
    config: ContainerConfig,
  ): Promise<TerminalContainer> {
    try {
      this.logger.log(`Creating container for session ${sessionId}`);

      // Pull image if not exists
      await this.ensureImageExists(config.image);

      // Create container with security restrictions
      const container = await this.docker.createContainer({
        Image: config.image,
        Cmd: config.cmd || ['/bin/bash'],
        Env: config.env || [],
        Tty: true,
        OpenStdin: true,
        StdinOnce: false,
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Labels: {
          'ai-learning.session-id': sessionId,
          'ai-learning.service': 'terminal',
          'ai-learning.created-at': new Date().toISOString(),
        },
        HostConfig: {
          // Resource limits
          Memory: config.memory || 256 * 1024 * 1024, // 256MB default
          MemorySwap: config.memory || 256 * 1024 * 1024, // No swap
          CpuQuota: config.cpuQuota || 50000, // 0.5 CPU cores
          CpuPeriod: 100000,

          // Security settings
          NetworkMode: config.networkDisabled !== false ? 'none' : 'bridge',
          ReadonlyRootfs: config.readOnlyRootfs !== false,

          // Allow /tmp to be writable
          Binds: config.readOnlyRootfs !== false ? ['tmpfs:/tmp:rw'] : [],

          // Prevent privileged operations
          Privileged: false,
          CapDrop: ['ALL'],
          CapAdd: ['CHOWN', 'SETUID', 'SETGID'],

          // Prevent fork bombs
          PidsLimit: 100,

          // Auto-remove container when stopped
          AutoRemove: true,
        },
        // Security options
        SecurityOpt: ['no-new-privileges'],
      });

      // Start container
      await container.start();

      // Attach to container
      const stream = await container.attach({
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true,
      });

      const terminalContainer: TerminalContainer = {
        containerId: container.id,
        sessionId,
        stream,
        container,
        createdAt: new Date(),
      };

      this.containers.set(sessionId, terminalContainer);

      this.logger.log(
        `Container ${container.id} created for session ${sessionId}`,
      );

      return terminalContainer;
    } catch (error) {
      this.logger.error(
        `Failed to create container for session ${sessionId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Execute command in container
   */
  async executeCommand(
    containerId: string,
    command: string[],
  ): Promise<{ output: string; exitCode: number }> {
    try {
      const container = this.docker.getContainer(containerId);

      const exec = await container.exec({
        Cmd: command,
        AttachStdout: true,
        AttachStderr: true,
      });

      const stream = await exec.start({ Detach: false });

      let output = '';
      stream.on('data', (chunk: Buffer) => {
        output += chunk.toString();
      });

      await new Promise((resolve) => stream.on('end', resolve));

      const inspection = await exec.inspect();

      return {
        output,
        exitCode: inspection.ExitCode,
      };
    } catch (error) {
      this.logger.error(`Failed to execute command in ${containerId}`, error);
      throw error;
    }
  }

  /**
   * Stop and remove container
   */
  async stopContainer(sessionId: string): Promise<void> {
    try {
      const terminalContainer = this.containers.get(sessionId);

      if (!terminalContainer) {
        this.logger.warn(`Container for session ${sessionId} not found`);
        return;
      }

      const { container } = terminalContainer;

      try {
        await container.stop({ t: 5 }); // 5 seconds grace period
      } catch (error) {
        // Container might already be stopped
        this.logger.warn(`Container ${container.id} already stopped`);
      }

      try {
        await container.remove({ force: true });
      } catch (error) {
        // Container might already be removed (AutoRemove)
        this.logger.warn(`Container ${container.id} already removed`);
      }

      this.containers.delete(sessionId);

      this.logger.log(`Container ${container.id} stopped and removed`);
    } catch (error) {
      this.logger.error(`Failed to stop container for session ${sessionId}`, error);
      throw error;
    }
  }

  /**
   * Get container by session ID
   */
  getContainer(sessionId: string): TerminalContainer | undefined {
    return this.containers.get(sessionId);
  }

  /**
   * List all active containers
   */
  listActiveContainers(): TerminalContainer[] {
    return Array.from(this.containers.values());
  }

  /**
   * Ensure Docker image exists (pull if needed)
   */
  private async ensureImageExists(imageName: string): Promise<void> {
    try {
      const images = await this.docker.listImages({
        filters: { reference: [imageName] },
      });

      if (images.length === 0) {
        this.logger.log(`Pulling image: ${imageName}`);

        await new Promise((resolve, reject) => {
          this.docker.pull(imageName, (err: Error, stream: NodeJS.ReadableStream) => {
            if (err) return reject(err);

            this.docker.modem.followProgress(stream, (err, output) => {
              if (err) return reject(err);
              resolve(output);
            });
          });
        });

        this.logger.log(`Image ${imageName} pulled successfully`);
      }
    } catch (error) {
      this.logger.error(`Failed to ensure image ${imageName}`, error);
      throw error;
    }
  }

  /**
   * Clean up stale containers on startup
   */
  private async cleanupStaleContainers(): Promise<void> {
    try {
      const containers = await this.docker.listContainers({
        all: true,
        filters: {
          label: ['ai-learning.service=terminal'],
        },
      });

      for (const containerInfo of containers) {
        const container = this.docker.getContainer(containerInfo.Id);

        try {
          await container.stop({ t: 0 });
          await container.remove({ force: true });
          this.logger.log(`Cleaned up stale container: ${containerInfo.Id}`);
        } catch (error) {
          this.logger.warn(`Failed to clean up container ${containerInfo.Id}`, error);
        }
      }
    } catch (error) {
      this.logger.error('Failed to cleanup stale containers', error);
    }
  }

  /**
   * Get container statistics
   */
  async getContainerStats(sessionId: string): Promise<any> {
    const terminalContainer = this.containers.get(sessionId);

    if (!terminalContainer) {
      throw new Error(`Container for session ${sessionId} not found`);
    }

    const stats = await terminalContainer.container.stats({ stream: false });
    return stats;
  }

  /**
   * Resize container TTY
   */
  async resizeTerminal(sessionId: string, rows: number, cols: number): Promise<void> {
    const terminalContainer = this.containers.get(sessionId);

    if (!terminalContainer) {
      throw new Error(`Container for session ${sessionId} not found`);
    }

    await terminalContainer.container.resize({
      h: rows,
      w: cols,
    });
  }
}
