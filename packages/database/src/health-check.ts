import { prisma } from './client';
import { redisCluster } from './cache';
import { searchService } from './search';
import { vectorSearchService } from './vector';

/**
 * Health check service for all database components
 */
export class HealthCheckService {
  /**
   * Check overall system health
   */
  async checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: {
      postgres: HealthCheckResult;
      redis: HealthCheckResult;
      meilisearch: HealthCheckResult;
      pinecone: HealthCheckResult;
    };
    timestamp: number;
  }> {
    const [postgres, redis, meilisearch, pinecone] = await Promise.all([
      this.checkPostgres(),
      this.checkRedis(),
      this.checkMeilisearch(),
      this.checkPinecone(),
    ]);

    const allHealthy = [postgres, redis, meilisearch, pinecone].every(
      (check) => check.status === 'healthy'
    );

    const anyUnhealthy = [postgres, redis, meilisearch, pinecone].some(
      (check) => check.status === 'unhealthy'
    );

    return {
      status: allHealthy ? 'healthy' : anyUnhealthy ? 'unhealthy' : 'degraded',
      checks: {
        postgres,
        redis,
        meilisearch,
        pinecone,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Check PostgreSQL health
   */
  async checkPostgres(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Simple query to check connection
      await prisma.$queryRaw`SELECT 1`;

      // Check connection pool stats
      const metrics = await prisma.$metrics.json();

      const latency = Date.now() - startTime;

      return {
        status: latency < 100 ? 'healthy' : 'degraded',
        latency,
        message: 'PostgreSQL is responsive',
        details: {
          connectionCount: metrics?.counters?.find(
            (c: any) => c.key === 'prisma_client_queries_active'
          )?.value,
        },
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        message: 'PostgreSQL connection failed',
        error: error.message,
      };
    }
  }

  /**
   * Check Redis cluster health
   */
  async checkRedis(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Ping Redis
      const pong = await redisCluster.ping();

      if (pong !== 'PONG') {
        throw new Error('Redis ping failed');
      }

      // Get cluster info
      const clusterInfo = await redisCluster.cluster('INFO');

      const latency = Date.now() - startTime;

      return {
        status: latency < 50 ? 'healthy' : 'degraded',
        latency,
        message: 'Redis cluster is healthy',
        details: {
          clusterState: clusterInfo.includes('cluster_state:ok')
            ? 'ok'
            : 'fail',
        },
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        message: 'Redis cluster connection failed',
        error: error.message,
      };
    }
  }

  /**
   * Check Meilisearch health
   */
  async checkMeilisearch(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const stats = await searchService.getIndexStats('courses' as any);

      const latency = Date.now() - startTime;

      return {
        status: latency < 200 ? 'healthy' : 'degraded',
        latency,
        message: 'Meilisearch is healthy',
        details: {
          documentsCount: stats.numberOfDocuments,
          isIndexing: stats.isIndexing,
        },
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        message: 'Meilisearch connection failed',
        error: error.message,
      };
    }
  }

  /**
   * Check Pinecone health
   */
  async checkPinecone(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const stats = await vectorSearchService.getIndexStats();

      const latency = Date.now() - startTime;

      return {
        status: latency < 500 ? 'healthy' : 'degraded',
        latency,
        message: 'Pinecone is healthy',
        details: {
          totalVectorCount: stats.totalVectorCount,
          dimension: stats.dimension,
        },
      };
    } catch (error: any) {
      // Pinecone is optional, so degraded if not available
      return {
        status: 'degraded',
        latency: Date.now() - startTime,
        message: 'Pinecone connection failed (optional service)',
        error: error.message,
      };
    }
  }

  /**
   * Check database replication lag (if using read replicas)
   */
  async checkReplicationLag(): Promise<{
    replicas: Array<{
      host: string;
      lagSeconds: number;
      status: 'healthy' | 'degraded' | 'unhealthy';
    }>;
  }> {
    try {
      // This would query actual replica lag
      // Placeholder implementation
      const replicaLag = await prisma.$queryRaw<any[]>`
        SELECT
          client_addr as host,
          EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) as lag_seconds
        FROM pg_stat_replication
      `;

      return {
        replicas: replicaLag.map((replica) => ({
          host: replica.host,
          lagSeconds: parseFloat(replica.lag_seconds || 0),
          status:
            replica.lag_seconds < 5
              ? 'healthy'
              : replica.lag_seconds < 30
              ? 'degraded'
              : 'unhealthy',
        })),
      };
    } catch (error) {
      console.error('Error checking replication lag:', error);
      return { replicas: [] };
    }
  }

  /**
   * Check cache hit rate
   */
  async checkCacheMetrics(): Promise<{
    hitRate: number;
    totalRequests: number;
    hits: number;
    misses: number;
  }> {
    try {
      // This would come from actual cache metrics
      // Placeholder implementation
      const info = await redisCluster.info('stats');

      // Parse Redis INFO output for cache stats
      const hits = parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || '0');
      const misses = parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || '0');
      const totalRequests = hits + misses;

      return {
        hitRate: totalRequests > 0 ? hits / totalRequests : 0,
        totalRequests,
        hits,
        misses,
      };
    } catch (error) {
      console.error('Error checking cache metrics:', error);
      return {
        hitRate: 0,
        totalRequests: 0,
        hits: 0,
        misses: 0,
      };
    }
  }

  /**
   * Get database performance metrics
   */
  async getPerformanceMetrics(): Promise<{
    postgres: {
      activeConnections: number;
      idleConnections: number;
      slowQueries: number;
      avgQueryTime: number;
    };
    redis: {
      memoryUsed: string;
      connectedClients: number;
      opsPerSecond: number;
    };
  }> {
    try {
      // PostgreSQL metrics
      const pgStats = await prisma.$queryRaw<any[]>`
        SELECT
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity
        WHERE datname = current_database()
      `;

      // Redis metrics
      const redisInfo = await redisCluster.info();
      const memoryUsed =
        redisInfo.match(/used_memory_human:([^\r\n]+)/)?.[1] || 'unknown';
      const connectedClients = parseInt(
        redisInfo.match(/connected_clients:(\d+)/)?.[1] || '0'
      );
      const opsPerSecond = parseInt(
        redisInfo.match(/instantaneous_ops_per_sec:(\d+)/)?.[1] || '0'
      );

      return {
        postgres: {
          activeConnections: parseInt(pgStats[0]?.active_connections || 0),
          idleConnections: parseInt(pgStats[0]?.idle_connections || 0),
          slowQueries: 0, // Would need to query pg_stat_statements
          avgQueryTime: 0,
        },
        redis: {
          memoryUsed,
          connectedClients,
          opsPerSecond,
        },
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw error;
    }
  }
}

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  message: string;
  error?: string;
  details?: Record<string, any>;
}

// Singleton instance
export const healthCheckService = new HealthCheckService();

/**
 * Express middleware for health check endpoint
 */
export async function healthCheckMiddleware(
  req: any,
  res: any,
  next: any
): Promise<void> {
  try {
    const health = await healthCheckService.checkHealth();

    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(health);
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      message: 'Health check failed',
      error: error.message,
      timestamp: Date.now(),
    });
  }
}

export default healthCheckService;
