# @platform/database

Database package for the AI-based learning platform, including Prisma ORM, caching, search, and vector database integrations.

## Features

- **PostgreSQL 16.4** with Prisma ORM
- **Redis Cluster** (6 nodes) for caching
- **Meilisearch** for full-text search
- **Pinecone** for vector search and AI recommendations
- **PgBouncer** for connection pooling
- **Read Replicas** for horizontal scaling
- **Sharding Strategy** for 10M+ users
- **Automated Backups** with PITR

## Installation

```bash
pnpm install
```

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/learning_platform"
REDIS_CLUSTER_NODES="localhost:7001,localhost:7002,localhost:7003"
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_MASTER_KEY="masterKey"
PINECONE_API_KEY="your-api-key"
```

### 2. Start Infrastructure

```bash
# Start all services (PostgreSQL, Redis, Meilisearch)
docker-compose -f ../../infrastructure/docker-compose.dev.yml up -d
```

### 3. Initialize Database

```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed database with sample data
pnpm prisma:seed
```

### 4. Initialize Search Indexes

```typescript
import { searchService } from '@platform/database';

await searchService.initializeIndexes();
```

### 5. Initialize Vector Database

```typescript
import { vectorSearchService } from '@platform/database';

await vectorSearchService.initializeIndex();
```

## Usage

### Database Queries

```typescript
import { prisma } from '@platform/database';

// Get user
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { profile: true },
});

// Create course
const course = await prisma.course.create({
  data: {
    title: 'Web Development Bootcamp',
    slug: 'web-dev-bootcamp',
    instructorId: instructorId,
    // ... other fields
  },
});
```

### Caching

```typescript
import { cacheService, CacheKeys } from '@platform/database';

// Get from cache
const user = await cacheService.get(CacheKeys.user(userId));

// Set cache
await cacheService.set(CacheKeys.user(userId), userData, 3600);

// Get or set pattern
const courses = await cacheService.getOrSet(
  CacheKeys.courseEnrollments(userId),
  async () => {
    return prisma.course.findMany({ where: { userId } });
  },
  3600
);

// Invalidate cache
await cacheInvalidation.invalidateUser(userId);
```

### Search

```typescript
import { searchService } from '@platform/database';

// Search courses
const results = await searchService.searchCourses(
  'javascript',
  {
    difficultyLevel: ['beginner', 'intermediate'],
    isFree: true,
    minRating: 4.0,
  },
  {
    limit: 20,
    offset: 0,
    sort: ['ratingAverage:desc'],
  }
);

// Search questions
const questions = await searchService.searchQuestions(
  'two sum',
  {
    difficulty: ['easy'],
    topics: ['arrays', 'hash-table'],
  }
);
```

### Vector Search (AI Recommendations)

```typescript
import { vectorSearchService, generateEmbedding } from '@platform/database';

// Generate embedding for user interests
const userInterests = "I want to learn React and Node.js for web development";
const embedding = await generateEmbedding(userInterests);

// Get personalized recommendations
const recommendations = await vectorSearchService.getPersonalizedRecommendations(
  embedding,
  userId,
  10
);

// Find similar courses
const similarCourses = await vectorSearchService.findSimilarCourses(
  courseEmbedding,
  {
    difficultyLevel: 'beginner',
    maxPrice: 100,
  },
  5
);
```

## Database Architecture

### Read/Write Splitting

```typescript
import { getDbClient } from '@platform/database';

// Write operation (uses primary)
const writeClient = getDbClient(false);
await writeClient.user.create({ data: userData });

// Read operation (uses read replica)
const readClient = getDbClient(true);
const users = await readClient.user.findMany();
```

### Sharding (for 10M+ users)

```typescript
import { shardManager } from '@platform/database';

// Get client for specific user
const client = shardManager.getClientForUser(userId);
const user = await client.user.findUnique({ where: { id: userId } });

// Query all shards
const totalUsers = await shardManager.queryAllShards(async (client) => {
  return client.user.count();
});
```

## Scripts

```bash
# Generate Prisma client
pnpm prisma:generate

# Create migration
pnpm prisma:migrate

# Push schema to database (dev only)
pnpm prisma:push

# Seed database
pnpm prisma:seed

# Open Prisma Studio
pnpm prisma:studio

# Build TypeScript
pnpm build

# Watch mode
pnpm dev
```

## Migrations

### Create a new migration

```bash
pnpm prisma migrate dev --name add_new_field
```

### Apply migrations in production

```bash
pnpm prisma migrate deploy
```

### Reset database (dev only)

```bash
pnpm prisma migrate reset
```

## Backup & Recovery

### Create backup

```bash
# Daily backup
/scripts/backup-manager.sh daily

# Weekly backup
/scripts/backup-manager.sh weekly
```

### Restore from backup

```bash
# Point-in-time recovery
/scripts/restore-pitr.sh "2024-11-16 10:30:00"
```

## Performance Optimization

### Indexes

All critical queries have indexes defined in the Prisma schema:

- User lookups: email, username
- Course queries: slug, instructor, published status
- Question filters: difficulty, type, topics
- Submissions: user, question, status

### Caching Strategy

**Multi-layer caching:**

1. **L1 Cache**: In-memory LRU (5 min TTL)
2. **L2 Cache**: Redis Cluster (1 hour TTL)

**Cache warming**: Popular content cached on startup

**Cache invalidation**: Event-driven invalidation on data changes

### Connection Pooling

- **PgBouncer**: 1000 max connections, pool size 25
- **Read Replicas**: 5 replicas for read scaling
- **Sharding**: 10 shards for horizontal scaling

## Monitoring

### Database Metrics

- Query latency (P50, P95, P99)
- Connection pool utilization
- Replication lag
- Disk usage per shard

### Cache Metrics

- Hit rate
- Memory usage
- Eviction count

### Search Metrics

- Index size
- Search latency
- Query volume

## Documentation

- [Read Replicas Setup](../../infrastructure/database/read-replicas-setup.md)
- [Sharding Strategy](../../infrastructure/database/sharding-strategy.md)
- [Backup Strategy](../../infrastructure/database/backup-strategy.md)
- [PgBouncer Configuration](../../infrastructure/pgbouncer/pgbouncer.ini)

## Tech Stack

- **Database**: PostgreSQL 16.4
- **ORM**: Prisma 6.0.1
- **Cache**: Redis 7.4 (Cluster mode)
- **Search**: Meilisearch 1.10
- **Vector DB**: Pinecone
- **Connection Pool**: PgBouncer

## License

MIT
