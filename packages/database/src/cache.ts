import Redis, { Cluster } from 'ioredis';
import { LRUCache } from 'lru-cache';

// Redis Cluster Configuration
const redisClusterNodes = (process.env.REDIS_CLUSTER_NODES || 'localhost:7001')
  .split(',')
  .map((node) => {
    const [host, port] = node.split(':');
    return { host, port: parseInt(port, 10) };
  });

// Initialize Redis Cluster
export const redisCluster = new Redis.Cluster(redisClusterNodes, {
  redisOptions: {
    password: process.env.REDIS_PASSWORD,
    lazyConnect: true,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
  },
  clusterRetryStrategy: (times) => {
    const delay = Math.min(100 + times * 2, 2000);
    return delay;
  },
});

// Local in-memory cache (L1 cache)
const localCache = new LRUCache<string, any>({
  max: 1000, // Maximum 1000 items
  ttl: 1000 * 60 * 5, // 5 minutes TTL
  updateAgeOnGet: true,
  updateAgeOnHas: true,
});

// Multi-layer cache implementation
export class CacheService {
  private localCache: LRUCache<string, any>;
  private redisCluster: Cluster;

  constructor() {
    this.localCache = localCache;
    this.redisCluster = redisCluster;
  }

  /**
   * Get value from cache (checks local cache first, then Redis)
   */
  async get<T = any>(key: string): Promise<T | null> {
    // L1: Check local cache
    const localValue = this.localCache.get(key);
    if (localValue !== undefined) {
      return localValue as T;
    }

    // L2: Check Redis
    try {
      const redisValue = await this.redisCluster.get(key);
      if (redisValue) {
        const parsedValue = JSON.parse(redisValue);

        // Warm local cache
        this.localCache.set(key, parsedValue);

        return parsedValue as T;
      }
    } catch (error) {
      console.error('Redis get error:', error);
    }

    return null;
  }

  /**
   * Set value in cache (both local and Redis)
   */
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    const serializedValue = JSON.stringify(value);

    // Set in local cache
    this.localCache.set(key, value);

    // Set in Redis with TTL
    try {
      await this.redisCluster.setex(key, ttlSeconds, serializedValue);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    // Delete from local cache
    this.localCache.delete(key);

    // Delete from Redis
    try {
      await this.redisCluster.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redisCluster.keys(pattern);
      if (keys.length > 0) {
        await this.redisCluster.del(...keys);
      }

      // Clear local cache (no pattern matching in LRU)
      this.localCache.clear();
    } catch (error) {
      console.error('Redis delete pattern error:', error);
    }
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    // Check local cache
    if (this.localCache.has(key)) {
      return true;
    }

    // Check Redis
    try {
      const exists = await this.redisCluster.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  /**
   * Get or set pattern (fetch from cache or execute function and cache result)
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const freshData = await fetchFn();

    // Cache the result
    await this.set(key, freshData, ttlSeconds);

    return freshData;
  }

  /**
   * Increment counter in Redis
   */
  async increment(key: string, by: number = 1): Promise<number> {
    try {
      return await this.redisCluster.incrby(key, by);
    } catch (error) {
      console.error('Redis increment error:', error);
      return 0;
    }
  }

  /**
   * Set expiration on existing key
   */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await this.redisCluster.expire(key, ttlSeconds);
    } catch (error) {
      console.error('Redis expire error:', error);
    }
  }

  /**
   * Add item to sorted set (for leaderboards, etc.)
   */
  async zAdd(key: string, score: number, member: string): Promise<void> {
    try {
      await this.redisCluster.zadd(key, score, member);
    } catch (error) {
      console.error('Redis zadd error:', error);
    }
  }

  /**
   * Get top N items from sorted set
   */
  async zRevRange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.redisCluster.zrevrange(key, start, stop);
    } catch (error) {
      console.error('Redis zrevrange error:', error);
      return [];
    }
  }

  /**
   * Publish message to channel
   */
  async publish(channel: string, message: any): Promise<void> {
    try {
      await this.redisCluster.publish(channel, JSON.stringify(message));
    } catch (error) {
      console.error('Redis publish error:', error);
    }
  }

  /**
   * Subscribe to channel
   */
  subscribe(channel: string, callback: (message: any) => void): void {
    const subscriber = this.redisCluster.duplicate();

    subscriber.subscribe(channel, (err) => {
      if (err) {
        console.error('Redis subscribe error:', err);
      }
    });

    subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        try {
          const parsedMessage = JSON.parse(message);
          callback(parsedMessage);
        } catch (error) {
          console.error('Message parse error:', error);
        }
      }
    });
  }

  /**
   * Clear all caches (local and Redis)
   */
  async clearAll(): Promise<void> {
    this.localCache.clear();

    try {
      await this.redisCluster.flushall();
    } catch (error) {
      console.error('Redis flushall error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      localCache: {
        size: this.localCache.size,
        max: this.localCache.max,
        calculatedSize: this.localCache.calculatedSize,
      },
    };
  }
}

// Singleton instance
export const cacheService = new CacheService();

// Cache key builders
export const CacheKeys = {
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user:${id}:profile`,
  course: (id: string) => `course:${id}`,
  courseModules: (courseId: string) => `course:${courseId}:modules`,
  courseLessons: (moduleId: string) => `module:${moduleId}:lessons`,
  courseEnrollments: (userId: string) => `user:${userId}:enrollments`,
  userProgress: (userId: string, resourceId: string) =>
    `user:${userId}:progress:${resourceId}`,
  question: (id: string) => `question:${id}`,
  dsaSheet: (id: string) => `dsa:sheet:${id}`,
  userDsaProgress: (userId: string, sheetId: string) =>
    `user:${userId}:dsa:${sheetId}`,
  leaderboard: (type: string) => `leaderboard:${type}`,
  dailyRecommendations: (userId: string, date: string) =>
    `user:${userId}:recommendations:${date}`,
  searchResults: (query: string, filters: string) =>
    `search:${query}:${filters}`,
};

// Cache invalidation strategies
export class CacheInvalidationService {
  private cache: CacheService;

  constructor(cache: CacheService) {
    this.cache = cache;
  }

  /**
   * Invalidate user-related caches
   */
  async invalidateUser(userId: string): Promise<void> {
    await Promise.all([
      this.cache.delete(CacheKeys.user(userId)),
      this.cache.delete(CacheKeys.userProfile(userId)),
      this.cache.deletePattern(`user:${userId}:*`),
    ]);
  }

  /**
   * Invalidate course-related caches
   */
  async invalidateCourse(courseId: string): Promise<void> {
    await Promise.all([
      this.cache.delete(CacheKeys.course(courseId)),
      this.cache.delete(CacheKeys.courseModules(courseId)),
      this.cache.deletePattern(`course:${courseId}:*`),
    ]);
  }

  /**
   * Invalidate enrollment caches when user enrolls
   */
  async invalidateEnrollment(userId: string, courseId: string): Promise<void> {
    await Promise.all([
      this.cache.delete(CacheKeys.courseEnrollments(userId)),
      this.cache.deletePattern(`user:${userId}:progress:*`),
      this.cache.invalidateCourse(courseId),
    ]);
  }

  /**
   * Invalidate search caches
   */
  async invalidateSearch(): Promise<void> {
    await this.cache.deletePattern('search:*');
  }

  /**
   * Warm cache with frequently accessed data
   */
  async warmCache(): Promise<void> {
    // This would be called on application startup
    // Preload popular courses, trending questions, etc.
    console.log('Warming cache with popular content...');
    // Implementation depends on your data access patterns
  }
}

export const cacheInvalidation = new CacheInvalidationService(cacheService);

// Graceful shutdown
async function gracefulShutdown() {
  console.log('Disconnecting from Redis...');
  await redisCluster.quit();
  console.log('Redis connections closed');
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default cacheService;
