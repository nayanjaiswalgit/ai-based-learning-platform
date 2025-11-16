import { Injectable } from '@nestjs/common';
import * as Docker from 'dockerode';
import { SupportedLanguage } from './dto/execute-code.dto';

@Injectable()
export class DockerService {
  private docker: Docker;

  // Language configurations
  private languageConfigs = {
    python: {
      image: 'python:3.11-alpine',
      command: (fileName: string) => ['python', fileName],
      fileName: 'main.py',
    },
    javascript: {
      image: 'node:20-alpine',
      command: (fileName: string) => ['node', fileName],
      fileName: 'main.js',
    },
    typescript: {
      image: 'node:20-alpine',
      command: (fileName: string) => ['ts-node', fileName],
      fileName: 'main.ts',
    },
    java: {
      image: 'openjdk:17-alpine',
      command: (fileName: string) => ['java', fileName],
      fileName: 'Main.java',
    },
    cpp: {
      image: 'gcc:latest',
      command: (fileName: string) => ['sh', '-c', `g++ ${fileName} -o /tmp/a.out && /tmp/a.out`],
      fileName: 'main.cpp',
    },
    c: {
      image: 'gcc:latest',
      command: (fileName: string) => ['sh', '-c', `gcc ${fileName} -o /tmp/a.out && /tmp/a.out`],
      fileName: 'main.c',
    },
    go: {
      image: 'golang:1.21-alpine',
      command: (fileName: string) => ['go', 'run', fileName],
      fileName: 'main.go',
    },
    rust: {
      image: 'rust:1.75-alpine',
      command: (fileName: string) => ['sh', '-c', `rustc ${fileName} -o /tmp/main && /tmp/main`],
      fileName: 'main.rs',
    },
  };

  constructor() {
    this.docker = new Docker();
  }

  async runCode(options: {
    code: string;
    language: SupportedLanguage;
    stdin: string;
    timeLimit: number;
    memoryLimit: number;
  }) {
    const config = this.languageConfigs[options.language];
    if (!config) {
      throw new Error(`Unsupported language: ${options.language}`);
    }

    const startTime = Date.now();

    try {
      // Create container with resource limits
      const container = await this.docker.createContainer({
        Image: config.image,
        Cmd: config.command(config.fileName),
        Tty: false,
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        OpenStdin: true,
        StdinOnce: true,
        HostConfig: {
          Memory: options.memoryLimit * 1024 * 1024, // Convert MB to bytes
          MemorySwap: options.memoryLimit * 1024 * 1024, // No swap
          CpuQuota: 50000, // 50% CPU
          NetworkMode: 'none', // No network access
          ReadonlyRootfs: false, // Need write for compilation
          PidsLimit: 50, // Limit process count
          Ulimits: [
            { Name: 'nofile', Soft: 100, Hard: 100 }, // Limit file descriptors
          ],
        },
        // Write code to file inside container
        // In production, use volumes or copy files
      });

      // Start container
      await container.start();

      // Set timeout
      const timeout = setTimeout(async () => {
        await container.kill();
      }, options.timeLimit * 1000);

      // Get output
      const stream = await container.attach({
        stream: true,
        stdout: true,
        stderr: true,
        stdin: true,
      });

      let output = '';
      let error = '';

      stream.on('data', (chunk) => {
        const data = chunk.toString('utf8');
        // Docker multiplexes stdout/stderr, need to parse
        // Simplified here - in production use proper demuxing
        if (data.includes('error') || data.includes('Error')) {
          error += data;
        } else {
          output += data;
        }
      });

      // Send stdin if provided
      if (options.stdin) {
        stream.write(options.stdin);
      }
      stream.end();

      // Wait for container to finish
      await container.wait();

      clearTimeout(timeout);

      const executionTime = Date.now() - startTime;

      // Cleanup
      await container.remove();

      return {
        success: !error,
        output: output.trim(),
        error: error.trim(),
        executionTime,
        memoryUsed: 0, // Get from container stats in production
      };
    } catch (err) {
      return {
        success: false,
        output: '',
        error: err.message || 'Execution failed',
        executionTime: Date.now() - startTime,
      };
    }
  }

  async pullImages() {
    // Pull all language images
    for (const config of Object.values(this.languageConfigs)) {
      try {
        await this.docker.pull(config.image);
        console.log(`Pulled image: ${config.image}`);
      } catch (err) {
        console.error(`Failed to pull ${config.image}:`, err.message);
      }
    }
  }
}
