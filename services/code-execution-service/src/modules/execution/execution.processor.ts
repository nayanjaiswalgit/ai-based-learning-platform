import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { DockerService } from './docker.service';
import { SupportedLanguage } from './dto/execute-code.dto';

@Processor('code-execution')
@Injectable()
export class ExecutionProcessor {
  constructor(
    private dockerService: DockerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Process('execute')
  async handleExecution(job: Job) {
    const { code, language, stdin, timeLimit, memoryLimit, userId } = job.data;

    // Update job progress
    await job.progress(10);

    try {
      // Execute code
      const result = await this.dockerService.runCode({
        code,
        language: language as SupportedLanguage,
        stdin: stdin || '',
        timeLimit: timeLimit || 10,
        memoryLimit: memoryLimit || 256,
      });

      await job.progress(90);

      // Cache result
      const cacheKey = this.generateCacheKey(code, language, stdin);
      await this.cacheManager.set(cacheKey, result, 3600);

      await job.progress(100);

      return {
        status: result.success ? 'SUCCESS' : 'ERROR',
        output: result.output,
        error: result.error,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
        timestamp: new Date(),
      };
    } catch (error) {
      await job.progress(100);

      return {
        status: 'ERROR',
        error: error.message || 'Execution failed',
        timestamp: new Date(),
      };
    }
  }

  private generateCacheKey(code: string, language: string, stdin: string): string {
    const crypto = require('crypto');
    const hash = crypto
      .createHash('sha256')
      .update(`${code}${language}${stdin || ''}`)
      .digest('hex');
    return `exec:${hash}`;
  }
}
