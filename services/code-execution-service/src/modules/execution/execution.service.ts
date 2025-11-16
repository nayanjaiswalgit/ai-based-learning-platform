import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';
import { ExecuteCodeDto, SupportedLanguage } from './dto/execute-code.dto';
import { RunTestsDto } from './dto/run-tests.dto';
import { DockerService } from './docker.service';
import { AntiCheatService } from './anti-cheat.service';

@Injectable()
export class ExecutionService {
  constructor(
    @InjectQueue('code-execution') private executionQueue: Queue,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private dockerService: DockerService,
    private antiCheatService: AntiCheatService,
  ) {}

  /**
   * Execute code and return result
   */
  async executeCode(executeCodeDto: ExecuteCodeDto, userId: string) {
    // Check cache first
    const cacheKey = this.generateCacheKey(executeCodeDto);
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    // Add to queue
    const job = await this.executionQueue.add('execute', {
      ...executeCodeDto,
      userId,
      submittedAt: new Date(),
    });

    return {
      jobId: job.id,
      status: 'QUEUED',
      message: 'Code submitted for execution',
    };
  }

  /**
   * Run code against test cases
   */
  async runTests(runTestsDto: RunTestsDto, userId: string) {
    const results = {
      totalTests: runTestsDto.testCases.length,
      passedTests: 0,
      failedTests: 0,
      testResults: [] as any[],
    };

    for (const testCase of runTestsDto.testCases) {
      const result = await this.executeWithTestCase(
        runTestsDto.code,
        runTestsDto.language,
        testCase.input,
        testCase.expectedOutput,
      );

      results.testResults.push({
        description: testCase.description,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.output,
        passed: result.passed,
        executionTime: result.executionTime,
        error: result.error,
      });

      if (result.passed) {
        results.passedTests++;
      } else {
        results.failedTests++;
      }
    }

    results['allPassed'] = results.passedTests === results.totalTests;

    // Check for plagiarism/code similarity if all tests pass
    if (results.allPassed && runTestsDto.problemId) {
      const similarityScore = await this.antiCheatService.checkCodeSimilarity(
        runTestsDto.code,
        runTestsDto.problemId,
        userId,
      );
      results['similarityWarning'] = similarityScore > 0.9;
    }

    return results;
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(jobId: string) {
    const job = await this.executionQueue.getJob(jobId);
    if (!job) {
      return { error: 'Job not found' };
    }

    const state = await job.getState();

    if (state === 'completed') {
      return {
        status: 'COMPLETED',
        result: job.returnvalue,
      };
    } else if (state === 'failed') {
      return {
        status: 'FAILED',
        error: job.failedReason,
      };
    } else {
      return {
        status: state.toUpperCase(),
        position: await job.getState() === 'waiting' ? job.opts.priority : null,
      };
    }
  }

  /**
   * Execute code with Docker sandbox
   */
  private async executeWithDocker(code: string, language: SupportedLanguage, stdin: string = '', timeLimit: number = 10, memoryLimit: number = 256) {
    try {
      const result = await this.dockerService.runCode({
        code,
        language,
        stdin,
        timeLimit,
        memoryLimit,
      });

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: '',
        executionTime: 0,
      };
    }
  }

  /**
   * Execute code with test case
   */
  private async executeWithTestCase(code: string, language: SupportedLanguage, input: string, expectedOutput: string) {
    const result = await this.executeWithDocker(code, language, input);

    return {
      ...result,
      passed: result.output?.trim() === expectedOutput.trim(),
      expectedOutput,
    };
  }

  /**
   * Generate cache key for execution
   */
  private generateCacheKey(dto: ExecuteCodeDto): string {
    const hash = crypto
      .createHash('sha256')
      .update(`${dto.code}${dto.language}${dto.stdin || ''}`)
      .digest('hex');
    return `exec:${hash}`;
  }
}
