import { Injectable } from '@nestjs/common';

export interface TestCase {
  id: string;
  problemId: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean; // Hidden test cases not shown to users
  points: number;
  description?: string;
}

@Injectable()
export class TestCaseService {
  // In production, this would use a database
  private testCases: Map<string, TestCase[]> = new Map();

  async createTestCase(problemId: string, testCase: Omit<TestCase, 'id'>): Promise<TestCase> {
    const id = this.generateId();
    const newTestCase = { id, ...testCase };

    if (!this.testCases.has(problemId)) {
      this.testCases.set(problemId, []);
    }

    this.testCases.get(problemId)!.push(newTestCase);
    return newTestCase;
  }

  async getTestCases(problemId: string, includeHidden: boolean = false): Promise<TestCase[]> {
    const testCases = this.testCases.get(problemId) || [];

    if (includeHidden) {
      return testCases;
    }

    return testCases.filter((tc) => !tc.isHidden);
  }

  async getTestCaseById(id: string): Promise<TestCase | null> {
    for (const cases of this.testCases.values()) {
      const found = cases.find((tc) => tc.id === id);
      if (found) return found;
    }
    return null;
  }

  async updateTestCase(id: string, updates: Partial<TestCase>): Promise<TestCase | null> {
    for (const cases of this.testCases.values()) {
      const index = cases.findIndex((tc) => tc.id === id);
      if (index !== -1) {
        cases[index] = { ...cases[index], ...updates };
        return cases[index];
      }
    }
    return null;
  }

  async deleteTestCase(id: string): Promise<boolean> {
    for (const [problemId, cases] of this.testCases.entries()) {
      const index = cases.findIndex((tc) => tc.id === id);
      if (index !== -1) {
        cases.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  private generateId(): string {
    return `tc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
