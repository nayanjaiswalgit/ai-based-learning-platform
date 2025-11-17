import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExecuteCodeDto } from './dto/execute-code.dto';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const execPromise = promisify(exec);

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);
  private readonly supportedLanguages = ['javascript', 'typescript', 'python', 'java', 'cpp', 'go'];

  constructor(private readonly configService: ConfigService) {}

  async executeCode(executeCodeDto: ExecuteCodeDto) {
    const { code, language, testCases, timeLimit = 10000, memoryLimit = 256 } = executeCodeDto;

    this.logger.log(`Executing ${language} code`);

    // Validate language
    const normalizedLang = language.toLowerCase();
    if (!this.supportedLanguages.includes(normalizedLang)) {
      throw new BadRequestException(`Unsupported language: ${language}`);
    }

    const startTime = Date.now();

    try {
      // Execute code based on language
      let output: string;
      let error: string | null = null;
      let executionTime: number;

      switch (normalizedLang) {
        case 'javascript':
        case 'typescript':
          ({ output, error, executionTime } = await this.executeJavaScript(code, timeLimit));
          break;
        case 'python':
          ({ output, error, executionTime } = await this.executePython(code, timeLimit));
          break;
        default:
          // For other languages, return a helpful message
          return {
            status: 'error',
            output: '',
            error: `Code execution for ${language} requires Docker setup. Please configure Docker for full language support.`,
            executionTime: 0,
            memoryUsed: 0,
            testResults: testCases?.map((tc, i) => ({
              testCase: i + 1,
              passed: false,
              expected: tc.expected,
              actual: null,
              error: 'Language not supported without Docker',
            })),
          };
      }

      // Run test cases if provided
      let testResults = null;
      if (testCases && testCases.length > 0) {
        testResults = await this.runTestCases(code, language, testCases, timeLimit);
      }

      return {
        status: error ? 'error' : 'success',
        output: output.trim(),
        error,
        executionTime,
        memoryUsed: 0, // Basic implementation doesn't track memory
        testResults,
      };
    } catch (err) {
      this.logger.error(`Code execution failed: ${err.message}`);
      return {
        status: 'error',
        output: '',
        error: err.message,
        executionTime: Date.now() - startTime,
        memoryUsed: 0,
      };
    }
  }

  private async executeJavaScript(code: string, timeLimit: number): Promise<{ output: string; error: string | null; executionTime: number }> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-exec-'));
    const filePath = path.join(tempDir, 'code.js');

    try {
      await fs.writeFile(filePath, code);

      const startTime = Date.now();
      const { stdout, stderr } = await execPromise(`node ${filePath}`, {
        timeout: timeLimit,
        maxBuffer: 1024 * 1024, // 1MB
      });
      const executionTime = Date.now() - startTime;

      return {
        output: stdout || '',
        error: stderr || null,
        executionTime,
      };
    } finally {
      // Cleanup
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  private async executePython(code: string, timeLimit: number): Promise<{ output: string; error: string | null; executionTime: number }> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-exec-'));
    const filePath = path.join(tempDir, 'code.py');

    try {
      await fs.writeFile(filePath, code);

      const startTime = Date.now();
      const { stdout, stderr } = await execPromise(`python3 ${filePath}`, {
        timeout: timeLimit,
        maxBuffer: 1024 * 1024, // 1MB
      });
      const executionTime = Date.now() - startTime;

      return {
        output: stdout || '',
        error: stderr || null,
        executionTime,
      };
    } catch (err) {
      // Try with 'python' command if 'python3' not found
      try {
        const startTime = Date.now();
        const { stdout, stderr } = await execPromise(`python ${filePath}`, {
          timeout: timeLimit,
          maxBuffer: 1024 * 1024,
        });
        const executionTime = Date.now() - startTime;

        return {
          output: stdout || '',
          error: stderr || null,
          executionTime,
        };
      } catch (fallbackErr) {
        return {
          output: '',
          error: err.message,
          executionTime: Date.now() - startTime,
        };
      }
    } finally {
      // Cleanup
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  private async runTestCases(code: string, language: string, testCases: any[], timeLimit: number): Promise<any[]> {
    // Simplified test case execution
    // In production, this should wrap the code with test harness
    return testCases.map((tc, i) => ({
      testCase: i + 1,
      passed: false,
      expected: tc.expected,
      actual: null,
      note: 'Test case execution requires test harness integration',
    }));
  }

  async validateCode(executeCodeDto: ExecuteCodeDto) {
    const { code, language } = executeCodeDto;

    this.logger.log(`Validating ${language} code`);

    // Basic validation
    if (!code || code.trim().length === 0) {
      throw new BadRequestException('Code cannot be empty');
    }

    if (!this.supportedLanguages.includes(language.toLowerCase())) {
      throw new BadRequestException(`Unsupported language: ${language}`);
    }

    // TODO: Add syntax validation for each language
    // This could use language-specific linters/parsers

    return {
      valid: true,
      language,
      linesOfCode: code.split('\n').length,
      message: 'Code structure is valid (syntax validation to be implemented)',
    };
  }
}
