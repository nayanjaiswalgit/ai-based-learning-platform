import { cacheService, CacheKeys } from './cache';
import { prisma } from './client';
import { searchService } from './search';

/**
 * Cache Warming Service
 * Pre-loads frequently accessed data into cache on application startup
 */
export class CacheWarmingService {
  /**
   * Warm all caches with popular data
   */
  async warmAllCaches(): Promise<void> {
    console.log('🔥 Starting cache warming...');

    const startTime = Date.now();

    try {
      await Promise.all([
        this.warmPopularCourses(),
        this.warmPopularQuestions(),
        this.warmSkills(),
        this.warmOfficialDsaSheets(),
        this.warmPopularInstructors(),
      ]);

      const duration = Date.now() - startTime;
      console.log(`✅ Cache warming completed in ${duration}ms`);
    } catch (error) {
      console.error('❌ Cache warming failed:', error);
      throw error;
    }
  }

  /**
   * Warm popular courses (top 100 by enrollment)
   */
  private async warmPopularCourses(): Promise<void> {
    try {
      const popularCourses = await prisma.course.findMany({
        where: { isPublished: true },
        include: {
          instructor: { include: { profile: true } },
          courseSkills: { include: { skill: true } },
          modules: {
            include: {
              lessons: {
                orderBy: { orderIndex: 'asc' },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
        orderBy: { enrollmentCount: 'desc' },
        take: 100,
      });

      // Cache each course
      for (const course of popularCourses) {
        await cacheService.set(
          CacheKeys.course(course.id),
          course,
          3600 * 24 // 24 hours for popular courses
        );

        // Cache course modules
        await cacheService.set(
          CacheKeys.courseModules(course.id),
          course.modules,
          3600 * 12 // 12 hours
        );
      }

      console.log(`✅ Warmed ${popularCourses.length} popular courses`);
    } catch (error) {
      console.error('Error warming popular courses:', error);
    }
  }

  /**
   * Warm popular coding questions
   */
  private async warmPopularQuestions(): Promise<void> {
    try {
      const popularQuestions = await prisma.question.findMany({
        where: { isPublic: true },
        include: {
          mcqOptions: true,
          codingQuestion: true,
          terminalChallenge: true,
        },
        orderBy: { likesCount: 'desc' },
        take: 200,
      });

      for (const question of popularQuestions) {
        await cacheService.set(
          CacheKeys.question(question.id),
          question,
          3600 * 24 // 24 hours
        );
      }

      console.log(`✅ Warmed ${popularQuestions.length} popular questions`);
    } catch (error) {
      console.error('Error warming popular questions:', error);
    }
  }

  /**
   * Warm all skills (small dataset, long TTL)
   */
  private async warmSkills(): Promise<void> {
    try {
      const skills = await prisma.skill.findMany({
        orderBy: { name: 'asc' },
      });

      await cacheService.set(
        'skills:all',
        skills,
        3600 * 24 * 7 // 7 days (rarely changes)
      );

      console.log(`✅ Warmed ${skills.length} skills`);
    } catch (error) {
      console.error('Error warming skills:', error);
    }
  }

  /**
   * Warm official DSA sheets
   */
  private async warmOfficialDsaSheets(): Promise<void> {
    try {
      const dsaSheets = await prisma.dsaSheet.findMany({
        where: { isOfficial: true, isPublic: true },
        include: {
          problems: {
            include: {
              question: {
                include: {
                  codingQuestion: true,
                },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      for (const sheet of dsaSheets) {
        await cacheService.set(
          CacheKeys.dsaSheet(sheet.id),
          sheet,
          3600 * 24 // 24 hours
        );
      }

      console.log(`✅ Warmed ${dsaSheets.length} DSA sheets`);
    } catch (error) {
      console.error('Error warming DSA sheets:', error);
    }
  }

  /**
   * Warm popular instructors
   */
  private async warmPopularInstructors(): Promise<void> {
    try {
      const instructors = await prisma.user.findMany({
        where: { role: 'INSTRUCTOR' },
        include: {
          profile: true,
          courses: {
            where: { isPublished: true },
            select: {
              id: true,
              title: true,
              enrollmentCount: true,
              ratingAverage: true,
            },
          },
        },
        take: 50,
      });

      for (const instructor of instructors) {
        await cacheService.set(
          CacheKeys.user(instructor.id),
          instructor,
          3600 * 6 // 6 hours
        );
      }

      console.log(`✅ Warmed ${instructors.length} popular instructors`);
    } catch (error) {
      console.error('Error warming instructors:', error);
    }
  }

  /**
   * Warm leaderboards
   */
  async warmLeaderboards(): Promise<void> {
    try {
      // Top problem solvers
      const topSolvers = await prisma.$queryRaw`
        SELECT
          u.id,
          u.username,
          up.full_name,
          COUNT(DISTINCT us.question_id) as problems_solved
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN user_submissions us ON u.id = us.user_id AND us.status = 'accepted'
        GROUP BY u.id, u.username, up.full_name
        ORDER BY problems_solved DESC
        LIMIT 100
      `;

      await cacheService.set(
        CacheKeys.leaderboard('problem-solvers'),
        topSolvers,
        3600 // 1 hour
      );

      // Top course creators
      const topCreators = await prisma.user.findMany({
        where: { role: 'INSTRUCTOR' },
        include: {
          profile: true,
          _count: {
            select: {
              courses: {
                where: { isPublished: true },
              },
            },
          },
        },
        orderBy: {
          courses: {
            _count: 'desc',
          },
        },
        take: 50,
      });

      await cacheService.set(
        CacheKeys.leaderboard('top-creators'),
        topCreators,
        3600 // 1 hour
      );

      console.log('✅ Warmed leaderboards');
    } catch (error) {
      console.error('Error warming leaderboards:', error);
    }
  }

  /**
   * Warm search indexes (ensure Meilisearch has latest data)
   */
  async warmSearchIndexes(): Promise<void> {
    try {
      console.log('🔍 Warming search indexes...');

      // This would trigger a full reindex in production
      // For now, just verify indexes exist
      const coursesStats = await searchService.getIndexStats('courses' as any);
      const questionsStats = await searchService.getIndexStats('questions' as any);

      console.log(`✅ Search indexes ready: ${coursesStats.numberOfDocuments} courses, ${questionsStats.numberOfDocuments} questions`);
    } catch (error) {
      console.error('Error warming search indexes:', error);
    }
  }

  /**
   * Refresh cache for a specific resource type
   */
  async refreshCache(resourceType: 'courses' | 'questions' | 'skills'): Promise<void> {
    console.log(`🔄 Refreshing ${resourceType} cache...`);

    switch (resourceType) {
      case 'courses':
        await this.warmPopularCourses();
        break;
      case 'questions':
        await this.warmPopularQuestions();
        break;
      case 'skills':
        await this.warmSkills();
        break;
    }
  }

  /**
   * Get cache warming statistics
   */
  async getCacheWarmingStats(): Promise<{
    totalKeys: number;
    popularCourses: number;
    popularQuestions: number;
    skills: number;
    dsaSheets: number;
  }> {
    // This is a simplified version
    // In production, you'd query Redis for actual counts
    return {
      totalKeys: 0, // Would come from Redis
      popularCourses: 100,
      popularQuestions: 200,
      skills: 10,
      dsaSheets: 5,
    };
  }
}

// Singleton instance
export const cacheWarmingService = new CacheWarmingService();

/**
 * Initialize cache warming on application startup
 */
export async function initializeCacheWarming(): Promise<void> {
  console.log('🔥 Initializing cache warming on startup...');

  try {
    await cacheWarmingService.warmAllCaches();
    await cacheWarmingService.warmLeaderboards();
    await cacheWarmingService.warmSearchIndexes();

    console.log('✅ Cache warming initialization complete');
  } catch (error) {
    console.error('❌ Cache warming initialization failed:', error);
    // Don't throw - app can start without warm cache
  }
}

/**
 * Schedule periodic cache refresh (every 6 hours)
 */
export function scheduleCacheRefresh(): void {
  // Refresh every 6 hours
  setInterval(
    async () => {
      console.log('🔄 Periodic cache refresh triggered');
      await cacheWarmingService.warmAllCaches();
    },
    6 * 60 * 60 * 1000 // 6 hours
  );

  console.log('✅ Cache refresh scheduled (every 6 hours)');
}

export default cacheWarmingService;
