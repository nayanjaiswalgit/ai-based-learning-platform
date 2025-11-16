import { prisma } from '../src/client';
import { cacheService } from '../src/cache';
import { searchService } from '../src/search';
import { performance } from 'perf_hooks';

/**
 * Database Performance Benchmark Tool
 * Tests various database operations to measure performance
 */

interface BenchmarkResult {
  operation: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  opsPerSecond: number;
}

class DatabaseBenchmark {
  private results: BenchmarkResult[] = [];

  /**
   * Benchmark a function
   */
  private async benchmark(
    name: string,
    fn: () => Promise<any>,
    iterations: number = 100
  ): Promise<BenchmarkResult> {
    const times: number[] = [];

    console.log(`\n🔄 Running benchmark: ${name} (${iterations} iterations)...`);

    // Warm-up run
    await fn();

    // Actual benchmark runs
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);

      if ((i + 1) % 10 === 0) {
        process.stdout.write(`\r  Progress: ${i + 1}/${iterations}`);
      }
    }

    console.log(); // New line after progress

    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const avgTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const opsPerSecond = 1000 / avgTime;

    const result: BenchmarkResult = {
      operation: name,
      iterations,
      totalTime,
      avgTime,
      minTime,
      maxTime,
      opsPerSecond,
    };

    this.results.push(result);
    this.printResult(result);

    return result;
  }

  /**
   * Print benchmark result
   */
  private printResult(result: BenchmarkResult): void {
    console.log(`✅ ${result.operation}:`);
    console.log(`   Avg: ${result.avgTime.toFixed(2)}ms`);
    console.log(`   Min: ${result.minTime.toFixed(2)}ms`);
    console.log(`   Max: ${result.maxTime.toFixed(2)}ms`);
    console.log(`   Ops/sec: ${result.opsPerSecond.toFixed(0)}`);
  }

  /**
   * Benchmark database reads
   */
  async benchmarkDatabaseReads(): Promise<void> {
    console.log('\n📊 Benchmarking Database Reads...');

    // Single user query by ID
    const testUserId = await this.getTestUserId();
    await this.benchmark(
      'User by ID',
      async () => {
        await prisma.user.findUnique({
          where: { id: testUserId },
          include: { profile: true },
        });
      },
      100
    );

    // Course list query
    await this.benchmark(
      'Course List (20 items)',
      async () => {
        await prisma.course.findMany({
          where: { isPublished: true },
          include: {
            instructor: { include: { profile: true } },
            courseSkills: { include: { skill: true } },
          },
          take: 20,
        });
      },
      50
    );

    // Questions with filters
    await this.benchmark(
      'Filtered Questions',
      async () => {
        await prisma.question.findMany({
          where: {
            difficulty: 'EASY',
            questionType: 'CODING',
            isPublic: true,
          },
          take: 20,
        });
      },
      50
    );
  }

  /**
   * Benchmark database writes
   */
  async benchmarkDatabaseWrites(): Promise<void> {
    console.log('\n📝 Benchmarking Database Writes...');

    const testUserId = await this.getTestUserId();

    // User progress update
    await this.benchmark(
      'User Progress Update',
      async () => {
        await prisma.userProgress.upsert({
          where: {
            userId_resourceType_resourceId: {
              userId: testUserId,
              resourceType: 'LESSON',
              resourceId: 'test-resource-id',
            },
          },
          create: {
            userId: testUserId,
            resourceType: 'LESSON',
            resourceId: 'test-resource-id',
            progressPercentage: 50,
            timeSpentMinutes: 30,
          },
          update: {
            progressPercentage: 75,
            timeSpentMinutes: 45,
          },
        });
      },
      50
    );
  }

  /**
   * Benchmark cache operations
   */
  async benchmarkCache(): Promise<void> {
    console.log('\n💾 Benchmarking Cache Operations...');

    const testKey = 'benchmark:test';
    const testData = { name: 'Test Data', value: 12345 };

    // Cache SET
    await this.benchmark(
      'Cache SET',
      async () => {
        await cacheService.set(testKey, testData, 3600);
      },
      100
    );

    // Cache GET
    await this.benchmark(
      'Cache GET',
      async () => {
        await cacheService.get(testKey);
      },
      100
    );

    // Cache GET (local cache hit)
    await this.benchmark(
      'Cache GET (L1 hit)',
      async () => {
        await cacheService.get(testKey);
      },
      100
    );

    // Cache DELETE
    await this.benchmark(
      'Cache DELETE',
      async () => {
        await cacheService.delete(testKey);
      },
      100
    );
  }

  /**
   * Benchmark search operations
   */
  async benchmarkSearch(): Promise<void> {
    console.log('\n🔍 Benchmarking Search Operations...');

    // Course search
    await this.benchmark(
      'Course Search',
      async () => {
        await searchService.searchCourses('javascript', undefined, {
          limit: 20,
        });
      },
      50
    );

    // Filtered course search
    await this.benchmark(
      'Filtered Course Search',
      async () => {
        await searchService.searchCourses(
          'web development',
          {
            difficultyLevel: ['beginner'],
            minRating: 4.0,
          },
          { limit: 20 }
        );
      },
      50
    );

    // Question search
    await this.benchmark(
      'Question Search',
      async () => {
        await searchService.searchQuestions(
          'two sum',
          {
            difficulty: ['easy'],
          },
          { limit: 20 }
        );
      },
      50
    );
  }

  /**
   * Benchmark complex queries
   */
  async benchmarkComplexQueries(): Promise<void> {
    console.log('\n🔬 Benchmarking Complex Queries...');

    const testUserId = await this.getTestUserId();

    // User dashboard query (multiple joins)
    await this.benchmark(
      'User Dashboard Query',
      async () => {
        await Promise.all([
          // User enrollments
          prisma.courseEnrollment.findMany({
            where: { userId: testUserId },
            include: {
              course: {
                include: {
                  instructor: { include: { profile: true } },
                },
              },
            },
            take: 10,
          }),
          // User progress
          prisma.userProgress.findMany({
            where: { userId: testUserId },
            take: 10,
          }),
          // Learning streak
          prisma.learningStreak.findUnique({
            where: { userId: testUserId },
          }),
        ]);
      },
      20
    );
  }

  /**
   * Get test user ID
   */
  private async getTestUserId(): Promise<string> {
    const user = await prisma.user.findFirst({
      where: { email: 'student@learning-platform.com' },
    });

    if (!user) {
      throw new Error('Test user not found. Please run seeding first.');
    }

    return user.id;
  }

  /**
   * Print final summary
   */
  printSummary(): void {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 BENCHMARK SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\nOperation                        Avg Time    Ops/sec');
    console.log('───────────────────────────────────────────────────────');

    this.results.forEach((result) => {
      const operation = result.operation.padEnd(30);
      const avgTime = `${result.avgTime.toFixed(2)}ms`.padStart(10);
      const opsPerSec = result.opsPerSecond.toFixed(0).padStart(8);

      console.log(`${operation} ${avgTime} ${opsPerSec}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Run all benchmarks
   */
  async runAll(): Promise<void> {
    console.log('🚀 Starting Database Performance Benchmarks...\n');

    await this.benchmarkDatabaseReads();
    await this.benchmarkDatabaseWrites();
    await this.benchmarkCache();
    await this.benchmarkSearch();
    await this.benchmarkComplexQueries();

    this.printSummary();
  }
}

// Main execution
async function main() {
  const benchmark = new DatabaseBenchmark();

  try {
    await benchmark.runAll();
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default DatabaseBenchmark;
