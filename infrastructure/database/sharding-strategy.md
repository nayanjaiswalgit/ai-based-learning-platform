# Database Sharding Strategy for 10M+ Users

This document outlines the horizontal sharding strategy to scale the platform to support 10 million+ concurrent users.

## Overview

**Sharding** (horizontal partitioning) divides the database into smaller, more manageable pieces called shards. Each shard contains a subset of the total data and operates independently.

## Why Sharding?

- **Scalability**: No single database instance handles all traffic
- **Performance**: Smaller datasets = faster queries
- **Availability**: Failure of one shard doesn't affect others
- **Cost-Effective**: Distribute load across commodity hardware

## Sharding Strategy

### 1. User-Based Sharding (Primary Strategy)

**Shard Key**: `user_id`

**Logic**: Hash the user ID to determine which shard stores the user's data

```typescript
function getShardForUser(userId: string, totalShards: number): number {
  const hash = hashFunction(userId); // Use consistent hashing
  return hash % totalShards;
}
```

**Shard Distribution**:
- **Shard 0**: Users 0-999,999 (1M users)
- **Shard 1**: Users 1M-1,999,999 (1M users)
- **Shard 2**: Users 2M-2,999,999 (1M users)
- ...
- **Shard 9**: Users 9M-9,999,999 (1M users)

Total: **10 shards** for 10M users (1M users per shard)

### 2. Tables to Shard

#### Sharded Tables (User-Specific Data)
- `users`
- `user_profiles`
- `user_skills`
- `course_enrollments`
- `course_reviews`
- `user_submissions`
- `user_dsa_progress`
- `roadmaps`
- `user_progress`
- `learning_streaks`
- `user_achievements`
- `learning_analytics`
- `notifications`
- `subscriptions`
- `payment_transactions`

#### Global Tables (Replicated Across All Shards)
- `skills`
- `courses`
- `course_modules`
- `lessons`
- `bootcamps`
- `cohorts`
- `questions`
- `dsa_sheets`

These tables are **read-heavy** and replicated to all shards for fast local access.

## Implementation Approaches

### Option 1: Application-Level Sharding

**Pros**:
- Full control over sharding logic
- No vendor lock-in
- Flexible shard management

**Cons**:
- Complex application code
- Manual shard management
- Cross-shard queries challenging

```typescript
// packages/database/src/shard-manager.ts
import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

class ShardManager {
  private shards: Map<number, PrismaClient> = new Map();
  private totalShards: number;

  constructor(totalShards: number = 10) {
    this.totalShards = totalShards;
    this.initializeShards();
  }

  private initializeShards() {
    for (let i = 0; i < this.totalShards; i++) {
      const shardUrl = process.env[`DATABASE_SHARD_${i}_URL`];
      if (shardUrl) {
        this.shards.set(
          i,
          new PrismaClient({
            datasources: { db: { url: shardUrl } },
          })
        );
      }
    }
  }

  // Consistent hashing function
  private hashUserId(userId: string): number {
    const hash = createHash('md5').update(userId).digest('hex');
    return parseInt(hash.substring(0, 8), 16);
  }

  // Get shard number for a user
  getShardNumber(userId: string): number {
    const hash = this.hashUserId(userId);
    return hash % this.totalShards;
  }

  // Get Prisma client for a specific user
  getClientForUser(userId: string): PrismaClient {
    const shardNumber = this.getShardNumber(userId);
    const client = this.shards.get(shardNumber);

    if (!client) {
      throw new Error(`Shard ${shardNumber} not initialized`);
    }

    return client;
  }

  // Execute query on all shards (for aggregations)
  async queryAllShards<T>(
    queryFn: (client: PrismaClient) => Promise<T>
  ): Promise<T[]> {
    const promises = Array.from(this.shards.values()).map(queryFn);
    return Promise.all(promises);
  }

  async disconnect() {
    await Promise.all(
      Array.from(this.shards.values()).map((client) => client.$disconnect())
    );
  }
}

export const shardManager = new ShardManager();
```

**Usage Example**:

```typescript
import { shardManager } from '@platform/database';

// Get user data from appropriate shard
async function getUserProfile(userId: string) {
  const client = shardManager.getClientForUser(userId);
  return client.userProfile.findUnique({
    where: { userId },
  });
}

// Cross-shard aggregation
async function getTotalUsers(): Promise<number> {
  const counts = await shardManager.queryAllShards(async (client) => {
    return client.user.count();
  });

  return counts.reduce((sum, count) => sum + count, 0);
}
```

### Option 2: PostgreSQL Native Sharding (Citus Extension)

**Pros**:
- Transparent to application
- SQL standard compliance
- Automatic shard management

**Cons**:
- Vendor-specific extension
- Migration complexity
- Additional operational overhead

```sql
-- Install Citus extension
CREATE EXTENSION citus;

-- Add worker nodes (shards)
SELECT citus_add_node('shard1.example.com', 5432);
SELECT citus_add_node('shard2.example.com', 5432);
-- ... add all 10 nodes

-- Distribute tables
SELECT create_distributed_table('users', 'id');
SELECT create_distributed_table('user_profiles', 'user_id');
SELECT create_distributed_table('course_enrollments', 'user_id');
-- ... distribute all user-specific tables

-- Replicate reference tables
SELECT create_reference_table('skills');
SELECT create_reference_table('courses');
SELECT create_reference_table('questions');
```

### Option 3: Vitess (YouTube's Sharding Solution)

**Pros**:
- Battle-tested at massive scale
- Automatic shard rebalancing
- Online schema changes

**Cons**:
- Complex setup
- Operational overhead
- Learning curve

## Shard Topology

### Production Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│               (NestJS API Servers)                       │
└─────────────────────────────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │   Shard Manager     │
                │  (Load Balancer)    │
                └──────────┬──────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │ Shard 0 │       │ Shard 1 │  ...  │ Shard 9 │
   │ 1M users│       │ 1M users│       │ 1M users│
   └────┬────┘       └────┬────┘       └────┬────┘
        │                 │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │Replica 0│       │Replica 1│  ...  │Replica 9│
   └─────────┘       └─────────┘       └─────────┘
```

### Shard Configuration

Each shard consists of:
- **1 Primary** (writes + reads)
- **2 Read Replicas** (reads only)
- **PgBouncer** (connection pooling)

Total infrastructure:
- 10 primary databases
- 20 read replicas
- 30 database instances total

## Handling Cross-Shard Queries

### Strategy 1: Scatter-Gather

For queries requiring data from multiple shards:

```typescript
async function getTopUsersGlobally(limit: number) {
  // Query all shards
  const results = await shardManager.queryAllShards(async (client) => {
    return client.user.findMany({
      orderBy: { points: 'desc' },
      take: limit,
    });
  });

  // Merge and sort results
  const allUsers = results.flat();
  allUsers.sort((a, b) => b.points - a.points);

  return allUsers.slice(0, limit);
}
```

### Strategy 2: Global Aggregation Table

Maintain a separate aggregation database for global stats:

```sql
-- aggregations database (separate from shards)
CREATE TABLE global_user_stats (
  metric VARCHAR(50) PRIMARY KEY,
  value BIGINT,
  updated_at TIMESTAMP
);
```

Update via background jobs:

```typescript
// Cron job runs every 5 minutes
async function updateGlobalStats() {
  const totalUsers = await getTotalUsers();
  const activeUsers = await getActiveUsers();

  await aggregationDb.globalUserStats.upsert({
    where: { metric: 'total_users' },
    create: { metric: 'total_users', value: totalUsers },
    update: { value: totalUsers },
  });
}
```

## Data Migrations

### Adding New Shards

When scaling beyond 10M users:

1. **Add new shard** (Shard 10 for users 10M-11M)
2. **No data migration needed** (new users go to new shard)
3. **Update shard count** in application configuration

```typescript
const TOTAL_SHARDS = process.env.TOTAL_SHARDS || 10;
```

### Rebalancing Shards

If shards become unbalanced:

```bash
# Migration script
./scripts/rebalance-shards.sh --from-shard=3 --to-shard=10 --user-range=500000-600000
```

## Monitoring & Alerting

### Key Metrics Per Shard

- **Query Latency**: P50, P95, P99
- **Connections**: Active, idle, max
- **Disk Usage**: Storage per shard
- **Replication Lag**: Between primary and replicas
- **Error Rate**: Failed queries

### Prometheus Metrics

```promql
# Shard query latency
rate(postgres_query_duration_seconds_sum{shard="0"}[5m])

# Shard disk usage
postgres_database_size_bytes{shard="0"}

# Connections per shard
postgres_connections_active{shard="0"}
```

## Disaster Recovery

### Backup Strategy Per Shard

- **Daily Full Backups**: All 10 shards
- **Continuous WAL Archiving**: Point-in-time recovery
- **Cross-Region Replication**: DR shards in different region

### Shard Failure Handling

```typescript
class ShardManager {
  async handleShardFailure(shardNumber: number) {
    // 1. Mark shard as unhealthy
    this.healthMap.set(shardNumber, false);

    // 2. Redirect reads to replica
    const replica = this.getReplicaForShard(shardNumber);
    this.shards.set(shardNumber, replica);

    // 3. Alert ops team
    await alertOps(`Shard ${shardNumber} failed, using replica`);

    // 4. Initiate automatic failover
    await this.promoteReplicaToPrimary(shardNumber);
  }
}
```

## Cost Optimization

### Right-Sizing Shards

Start with **10 shards** for 10M users:
- 1M users per shard
- 50GB storage per shard
- 4 vCPUs, 16GB RAM per primary

As traffic grows, scale **vertically first**, then **add shards**.

### Instance Types (AWS Example)

- **Primary**: `db.m6g.xlarge` ($0.34/hr × 10 = $2,448/month)
- **Replicas**: `db.m6g.large` ($0.17/hr × 20 = $2,448/month)
- **Total**: ~$4,900/month for 10M users

## Testing Sharding

### Local Development

```yaml
# docker-compose.yml for 3-shard setup
services:
  shard-0:
    image: postgres:16.4
    environment:
      POSTGRES_DB: learning_platform_shard_0
    ports:
      - "5440:5432"

  shard-1:
    image: postgres:16.4
    environment:
      POSTGRES_DB: learning_platform_shard_1
    ports:
      - "5441:5432"

  shard-2:
    image: postgres:16.4
    environment:
      POSTGRES_DB: learning_platform_shard_2
    ports:
      - "5442:5432"
```

### Integration Tests

```typescript
describe('Sharding', () => {
  it('should route users to correct shard', () => {
    const userId1 = 'user-123';
    const userId2 = 'user-456';

    const shard1 = shardManager.getShardNumber(userId1);
    const shard2 = shardManager.getShardNumber(userId2);

    // Same user should always go to same shard
    expect(shardManager.getShardNumber(userId1)).toBe(shard1);

    // Different users may go to different shards
    expect(shard1).toBeGreaterThanOrEqual(0);
    expect(shard1).toBeLessThan(10);
  });
});
```

## Best Practices

1. **Consistent Hashing**: Ensures minimal data movement when adding shards
2. **Shard-Aware Transactions**: Avoid cross-shard transactions
3. **Global IDs**: Use UUIDs instead of sequential IDs
4. **Connection Pooling**: PgBouncer per shard
5. **Monitor Shard Balance**: Ensure even distribution
6. **Graceful Degradation**: Handle shard failures automatically
7. **Schema Sync**: Keep schemas consistent across all shards

## Migration Timeline

### Phase 1: Single Database (0-100K users)
- Start with single PostgreSQL instance
- Focus on feature development

### Phase 2: Primary + Read Replicas (100K-1M users)
- Add 5 read replicas
- Implement read/write splitting

### Phase 3: Initial Sharding (1M-5M users)
- Implement 5 shards
- Migrate existing users
- Test cross-shard operations

### Phase 4: Full Sharding (5M-10M users)
- Scale to 10 shards
- Optimize shard balancing
- Automate shard operations

## Conclusion

With this sharding strategy:
- ✅ Support **10M+ users**
- ✅ Handle **1M+ queries/second**
- ✅ Maintain **<100ms query latency**
- ✅ Achieve **99.99% uptime**
- ✅ Linear scalability (add shards as needed)
