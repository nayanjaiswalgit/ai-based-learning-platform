import { Injectable } from '@nestjs/common';

// Type for similarity function
const similarity: (s1: string, s2: string) => number = require('similarity');

@Injectable()
export class AntiCheatService {
  // Store submitted code for each problem (in production, use database)
  private submissions: Map<string, Array<{ userId: string; code: string }>> = new Map();

  /**
   * Check code similarity against previous submissions
   */
  async checkCodeSimilarity(code: string, problemId: string, userId: string): Promise<number> {
    const previousSubmissions = this.submissions.get(problemId) || [];

    let maxSimilarity = 0;

    // Compare with other users' submissions
    for (const submission of previousSubmissions) {
      if (submission.userId === userId) continue; // Skip own submissions

      const normalizedCode1 = this.normalizeCode(code);
      const normalizedCode2 = this.normalizeCode(submission.code);

      const sim = similarity(normalizedCode1, normalizedCode2);
      if (sim > maxSimilarity) {
        maxSimilarity = sim;
      }
    }

    // Store this submission
    if (!this.submissions.has(problemId)) {
      this.submissions.set(problemId, []);
    }
    this.submissions.get(problemId)!.push({ userId, code });

    return maxSimilarity;
  }

  /**
   * Normalize code for comparison (remove comments, whitespace, etc.)
   */
  private normalizeCode(code: string): string {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/\/\/.*/g, '') // Remove single-line comments
      .replace(/#.*/g, '') // Remove Python comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/['"]/g, '') // Remove quotes
      .trim()
      .toLowerCase();
  }

  /**
   * Detect suspicious patterns
   */
  detectSuspiciousPatterns(code: string): string[] {
    const warnings = [];

    // Check for obfuscation
    if (code.includes('eval(') || code.includes('exec(')) {
      warnings.push('Code uses eval/exec which may indicate obfuscation');
    }

    // Check for very long variable names (possible obfuscation)
    const varNames = code.match(/\b[a-zA-Z_][a-zA-Z0-9_]{20,}\b/g);
    if (varNames && varNames.length > 5) {
      warnings.push('Code contains unusually long variable names');
    }

    // Check code density (too compact might be copied)
    const lines = code.split('\n').filter((line) => line.trim().length > 0);
    const avgLineLength = code.length / lines.length;
    if (avgLineLength > 100) {
      warnings.push('Code is unusually compact');
    }

    return warnings;
  }
}
