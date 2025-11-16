# 📈 Scalability Architecture

Comprehensive guide for building a platform that scales from 100 to 10 million users.

---

## 🎯 Scalability Goals

### Target Scale
- **Users**: 10M+ registered users
- **Concurrent Users**: 100K+ simultaneous active users
- **Code Executions**: 1M+ per day
- **Video Playback**: 50K+ concurrent streams
- **API Requests**: 10K+ requests per second
- **Database Operations**: 100K+ queries per second
- **Storage**: Petabytes of course content

---

## 🏗️ Scalable Architecture Pattern

### Multi-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CDN Layer (Cloudflare)                   │
│          Global edge caching for static assets              │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│               Load Balancer (AWS ALB/NLB)                    │
│       Distribute traffic across application servers         │
└────┬──────────┬──────────┬──────────┬───────────────────────┘
     │          │          │          │
┌────▼─────┐┌──▼──────┐┌──▼──────┐┌──▼──────┐
│ Frontend ││Frontend ││Frontend ││Frontend │  Auto-scaling
│ Server 1 ││Server 2 ││Server 3 ││Server N │  Next.js/Vercel
└────┬─────┘└──┬──────┘└──┬──────┘└──┬──────┘
     └─────────┴──────────┴──────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  API Gateway (Kong/AWS API Gateway)          │
│       Rate limiting, auth, routing, caching                 │
└────┬──────────┬──────────┬──────────┬───────────────────────┘
     │          │          │          │
┌────▼─────┐┌──▼──────┐┌──▼──────┐┌──▼──────┐
│ Service  ││Service  ││Service  ││Service  │  Microservices
│ Instance ││Instance ││Instance ││Instance │  (Kubernetes)
│    1     ││   2     ││   3     ││   N     │  Auto-scaling
└────┬─────┘└──┬──────┘└──┬──────┘└──┬──────┘
     └─────────┴──────────┴──────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Message Queue (RabbitMQ/SQS)               │
│       Async processing, event-driven communication          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Caching Layer (Redis Cluster)              │
│       Session, API cache, leaderboards, hot data            │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Database Layer (PostgreSQL)                     │
│    Primary + Read Replicas + Connection Pooling             │
│           Sharding for horizontal scaling                   │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Object Storage (S3/R2)                          │
│       Videos, images, course materials (CDN-backed)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Horizontal Scaling Strategies

### 1. Frontend Scaling (Next.js)

#### Vercel Edge Network
```yaml
Deployment Strategy:
  Platform: Vercel
  Edge Locations: 100+ globally
  Auto-scaling: Automatic
  Features:
    - Serverless functions
    - Edge middleware
    - Incremental Static Regeneration (ISR)
    - Image optimization
    - DDoS protection

Configuration:
  # vercel.json
  {
    "regions": ["all"],
    "functions": {
      "api/**/*.ts": {
        "memory": 1024,
        "maxDuration": 10
      }
    },
    "crons": [{
      "path": "/api/cron/daily-challenges",
      "schedule": "0 0 * * *"
    }]
  }
```

#### Self-Hosted Alternative (Kubernetes)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-frontend
spec:
  replicas: 10  # Start with 10, auto-scale to 100+
  selector:
    matchLabels:
      app: web-frontend
  template:
    metadata:
      labels:
        app: web-frontend
    spec:
      containers:
      - name: nextjs
        image: your-registry/web:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-frontend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-frontend
  minReplicas: 10
  maxReplicas: 100
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

### 2. Backend Scaling (Microservices)

#### Kubernetes Deployment
```yaml
# Auth Service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 5
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth
        image: your-registry/auth-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secrets
              key: url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 5
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 75
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300  # Wait 5 min before scaling down
    scaleUp:
      stabilizationWindowSeconds: 0    # Scale up immediately
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
```

#### Service Mesh (Istio) for Advanced Scaling
```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: auth-service
spec:
  hosts:
  - auth-service
  http:
  - match:
    - headers:
        user-tier:
          exact: "premium"
    route:
    - destination:
        host: auth-service
        subset: high-performance
      weight: 100
  - route:
    - destination:
        host: auth-service
        subset: standard
      weight: 100
    retries:
      attempts: 3
      perTryTimeout: 2s
    timeout: 10s
---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: auth-service
spec:
  host: auth-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        http2MaxRequests: 100
        maxRequestsPerConnection: 2
    loadBalancer:
      simple: LEAST_REQUEST  # Intelligent load balancing
  subsets:
  - name: high-performance
    labels:
      version: v1
      tier: premium
  - name: standard
    labels:
      version: v1
      tier: standard
```

---

### 3. Database Scaling Strategies

#### PostgreSQL Read Replicas
```yaml
Architecture:
  Primary (Write):
    - Single primary instance
    - Handles all writes
    - Replicates to read replicas

  Read Replicas (Read):
    - 5+ read replicas
    - Distributed across regions
    - Handle all read queries
    - Auto-failover

Load Distribution:
  - Writes: 20%
  - Reads: 80%
  - Use read replicas for:
    * Course listings
    * User profiles
    * Analytics
    * Leaderboards
    * Search results
```

```typescript
// Database connection with read replica support
import { PrismaClient } from '@prisma/client'

// Primary database (writes)
const prismaWrite = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_PRIMARY_URL
    }
  }
})

// Read replicas (reads)
const prismaRead = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_REPLICA_URL  // Round-robin DNS to multiple replicas
    }
  }
})

// Service implementation
@Injectable()
export class CoursesService {
  // Read operations use replica
  async findAll() {
    return prismaRead.course.findMany()
  }

  async findById(id: string) {
    return prismaRead.course.findUnique({ where: { id } })
  }

  // Write operations use primary
  async create(data: CreateCourseDto) {
    return prismaWrite.course.create({ data })
  }

  async update(id: string, data: UpdateCourseDto) {
    const updated = await prismaWrite.course.update({
      where: { id },
      data
    })

    // Invalidate cache
    await this.cache.del(`course:${id}`)

    return updated
  }
}
```

#### Database Connection Pooling
```typescript
// Use PgBouncer for connection pooling
// docker-compose.yml
services:
  pgbouncer:
    image: pgbouncer/pgbouncer:latest
    environment:
      - DATABASES_HOST=postgres
      - DATABASES_PORT=5432
      - DATABASES_DBNAME=learning_platform
      - DATABASES_USER=postgres
      - POOL_MODE=transaction
      - MAX_CLIENT_CONN=10000
      - DEFAULT_POOL_SIZE=25
      - RESERVE_POOL_SIZE=5
      - RESERVE_POOL_TIMEOUT=3
    ports:
      - "6432:6432"

# Application connects to PgBouncer instead of PostgreSQL directly
DATABASE_URL="postgresql://user:pass@pgbouncer:6432/learning_platform?pgbouncer=true"
```

#### Database Sharding (Future Scale)
```typescript
// Shard by user_id for horizontal scaling beyond 10M users
interface ShardConfig {
  shard1: {
    url: 'postgresql://shard1.example.com',
    userRange: { min: 0, max: 2499999 }  // 2.5M users
  },
  shard2: {
    url: 'postgresql://shard2.example.com',
    userRange: { min: 2500000, max: 4999999 }
  },
  shard3: {
    url: 'postgresql://shard3.example.com',
    userRange: { min: 5000000, max: 7499999 }
  },
  shard4: {
    url: 'postgresql://shard4.example.com',
    userRange: { min: 7500000, max: 9999999 }
  }
}

function getShardForUser(userId: number): PrismaClient {
  const userIdNum = parseInt(userId.toString().slice(-7), 10) // Last 7 digits

  for (const [shardName, config] of Object.entries(ShardConfig)) {
    if (userIdNum >= config.userRange.min && userIdNum <= config.userRange.max) {
      return shardClients[shardName]
    }
  }

  return shardClients.shard1 // Default
}

// Usage
const userShard = getShardForUser(user.id)
const userProgress = await userShard.progress.findMany({
  where: { userId: user.id }
})
```

---

### 4. Caching Layer (Redis)

#### Redis Cluster Setup
```yaml
# Redis Cluster for high availability and horizontal scaling
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis-cluster
spec:
  serviceName: redis-cluster
  replicas: 6  # 3 masters + 3 slaves
  selector:
    matchLabels:
      app: redis-cluster
  template:
    metadata:
      labels:
        app: redis-cluster
    spec:
      containers:
      - name: redis
        image: redis:7.4-alpine
        ports:
        - containerPort: 6379
          name: client
        - containerPort: 16379
          name: gossip
        command:
        - redis-server
        - --cluster-enabled
        - "yes"
        - --cluster-config-file
        - /data/nodes.conf
        - --cluster-node-timeout
        - "5000"
        - --appendonly
        - "yes"
        - --maxmemory
        - "2gb"
        - --maxmemory-policy
        - allkeys-lru
        volumeMounts:
        - name: data
          mountPath: /data
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 50Gi
```

#### Multi-Layer Caching Strategy
```typescript
@Injectable()
export class CacheService {
  constructor(
    private readonly redis: Redis,
    private readonly local: NodeCache  // In-memory cache
  ) {}

  async get<T>(key: string): Promise<T | null> {
    // Layer 1: Local cache (in-memory, fastest)
    const localValue = this.local.get<T>(key)
    if (localValue) {
      return localValue
    }

    // Layer 2: Redis (distributed, fast)
    const redisValue = await this.redis.get(key)
    if (redisValue) {
      const parsed = JSON.parse(redisValue) as T
      // Store in local cache for next time
      this.local.set(key, parsed, 60) // 60 seconds
      return parsed
    }

    return null
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    // Set in both caches
    this.local.set(key, value, Math.min(ttl, 300)) // Max 5 min in local
    await this.redis.setex(key, ttl, JSON.stringify(value))
  }

  async invalidate(pattern: string): Promise<void> {
    // Invalidate in both caches
    this.local.flushAll()

    // Use Redis SCAN for safe pattern deletion
    const keys = await this.scanKeys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }

  private async scanKeys(pattern: string): Promise<string[]> {
    const keys: string[] = []
    let cursor = '0'

    do {
      const [nextCursor, matchedKeys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        '100'
      )
      cursor = nextCursor
      keys.push(...matchedKeys)
    } while (cursor !== '0')

    return keys
  }
}

// Cache usage patterns
@Injectable()
export class CoursesService {
  async getCourse(id: string) {
    // Try cache first
    const cached = await this.cache.get<Course>(`course:${id}`)
    if (cached) return cached

    // Cache miss - fetch from DB
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { modules: true, instructor: true }
    })

    // Store in cache (1 hour)
    await this.cache.set(`course:${id}`, course, 3600)

    return course
  }

  // Cache popular courses (refreshed every 5 minutes)
  async getPopularCourses() {
    return this.cache.wrap(
      'courses:popular',
      300, // 5 minutes
      async () => {
        return this.prisma.course.findMany({
          take: 20,
          orderBy: { enrollmentCount: 'desc' }
        })
      }
    )
  }
}
```

---

### 5. Code Execution Scaling

#### Kubernetes Job Queue Pattern
```typescript
// Code execution service with queue
import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: 6379,
  maxRetriesPerRequest: null
})

// Create queue
const codeExecutionQueue = new Queue('code-execution', { connection })

// Add job to queue
async function executeCode(submission: Submission) {
  const job = await codeExecutionQueue.add('execute', {
    submissionId: submission.id,
    code: submission.code,
    language: submission.language,
    testCases: submission.testCases
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    timeout: 30000  // 30 seconds max
  })

  return job.id
}

// Worker pool (run multiple instances)
const worker = new Worker('code-execution', async (job) => {
  const { submissionId, code, language, testCases } = job.data

  // Create isolated Docker container
  const container = await docker.createContainer({
    Image: `code-runner-${language}:latest`,
    Cmd: ['run', code],
    HostConfig: {
      Memory: 256 * 1024 * 1024,
      CpuQuota: 50000,
      NetworkMode: 'none',
      ReadonlyRootfs: true,
      AutoRemove: true
    }
  })

  await container.start()

  // Wait for execution with timeout
  const result = await Promise.race([
    container.wait(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 10000)
    )
  ])

  // Get logs
  const logs = await container.logs({
    stdout: true,
    stderr: true
  })

  // Update submission with result
  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: result.StatusCode === 0 ? 'accepted' : 'failed',
      output: logs.toString()
    }
  })

  return { success: true, submissionId }
}, {
  connection,
  concurrency: 10  // Process 10 jobs concurrently per worker
})

// Scale workers horizontally in Kubernetes
// Deploy 10+ worker pods to handle high load
```

```yaml
# Kubernetes deployment for code execution workers
apiVersion: apps/v1
kind: Deployment
metadata:
  name: code-execution-worker
spec:
  replicas: 20  # Scale based on queue length
  selector:
    matchLabels:
      app: code-execution-worker
  template:
    metadata:
      labels:
        app: code-execution-worker
    spec:
      containers:
      - name: worker
        image: your-registry/code-execution-worker:latest
        env:
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secrets
              key: url
        - name: CONCURRENCY
          value: "10"
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        volumeMounts:
        - name: docker-sock
          mountPath: /var/run/docker.sock
      volumes:
      - name: docker-sock
        hostPath:
          path: /var/run/docker.sock
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: code-execution-worker-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: code-execution-worker
  minReplicas: 20
  maxReplicas: 200
  metrics:
  - type: External
    external:
      metric:
        name: redis_queue_length
        selector:
          matchLabels:
            queue_name: code-execution
      target:
        type: AverageValue
        averageValue: "100"  # Scale when queue > 100 jobs per pod
```

---

### 6. CDN & Static Asset Scaling

#### Cloudflare Configuration
```typescript
// Next.js Image Optimization with Cloudflare
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn.example.com'],
    loader: 'custom',
    loaderFile: './lib/cloudflare-image-loader.ts'
  }
}

// lib/cloudflare-image-loader.ts
export default function cloudflareLoader({ src, width, quality }) {
  const params = [`width=${width}`]
  if (quality) {
    params.push(`quality=${quality}`)
  }

  return `https://your-cdn.example.com/cdn-cgi/image/${params.join(',')}/${src}`
}

// Cache-Control headers for static assets
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*.{jpg,jpeg,png,gif,svg,ico,webp}',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/:path*.{js,css}',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300'
          }
        ]
      }
    ]
  }
}
```

---

### 7. Message Queue for Async Processing

#### RabbitMQ/SQS Pattern
```typescript
// Event-driven architecture for scalability
import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class CourseService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async enrollUser(userId: string, courseId: string) {
    // Synchronous: Create enrollment
    const enrollment = await this.prisma.courseEnrollment.create({
      data: { userId, courseId }
    })

    // Asynchronous: Emit events for background processing
    this.eventEmitter.emit('user.enrolled', {
      userId,
      courseId,
      timestamp: new Date()
    })

    return enrollment
  }
}

// Event handlers (run in background workers)
@Injectable()
export class EnrollmentHandlers {
  @OnEvent('user.enrolled', { async: true })
  async handleUserEnrolled(payload: any) {
    // Send welcome email (async)
    await this.emailService.sendCourseWelcome(payload.userId, payload.courseId)
  }

  @OnEvent('user.enrolled', { async: true })
  async updateAnalytics(payload: any) {
    // Update analytics (async)
    await this.analyticsService.trackEnrollment(payload)
  }

  @OnEvent('user.enrolled', { async: true })
  async generateRoadmap(payload: any) {
    // AI roadmap generation (async, heavy)
    await this.roadmapService.generate(payload.userId, payload.courseId)
  }
}
```

---

## 📊 Performance Targets

### API Response Times
```
GET  /api/courses          < 100ms  (cached)
GET  /api/courses/:id      < 200ms  (cached)
POST /api/submissions      < 500ms  (async job created)
GET  /api/dashboard        < 300ms  (server-driven UI config)
```

### Database Query Performance
```
Simple queries:     < 10ms
Join queries:       < 50ms
Complex analytics:  < 500ms
```

### Code Execution
```
Queue time:    < 1s
Execution:     < 10s
Total:         < 15s
```

---

## 🔍 Monitoring & Auto-Scaling

### Prometheus Metrics
```typescript
// Expose custom metrics
import { Registry, Counter, Histogram } from 'prom-client'

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
})

const codeExecutionCounter = new Counter({
  name: 'code_executions_total',
  help: 'Total number of code executions',
  labelNames: ['language', 'status']
})

// Middleware to track metrics
app.use((req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration)
  })

  next()
})
```

### Auto-Scaling Rules
```yaml
# Scale based on multiple metrics
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 10
  maxReplicas: 500
  metrics:
  # CPU utilization
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  # Memory utilization
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  # Custom metric: requests per second
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "1000"  # Scale when > 1000 req/s per pod
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 10
        periodSeconds: 15
      selectPolicy: Max
```

---

## 💰 Cost Optimization at Scale

### Infrastructure Costs (10M users, 100K concurrent)

```yaml
Estimated Monthly Costs:

Compute (Kubernetes):
  - 50 nodes (m5.2xlarge): $15,000
  - Auto-scaling up to 200 nodes

Database:
  - PostgreSQL (RDS): $5,000
  - Read replicas (5x): $20,000

Cache:
  - Redis cluster: $3,000

Storage:
  - S3/R2 (1 PB): $20,000
  - CloudFront/CDN: $10,000

Code Execution:
  - Dedicated nodes: $10,000

Monitoring & Logging:
  - Datadog/Sentry: $2,000

Total: ~$85,000/month

Cost per active user: $0.85/month
```

### Optimization Strategies
1. Use spot instances for code execution workers (70% cost savings)
2. Implement aggressive caching (reduce DB load by 90%)
3. Use Cloudflare R2 instead of S3 (50% cheaper)
4. Auto-scale down during off-peak hours
5. Use ARM-based instances (20% cheaper)

---

**This architecture scales from 0 to millions with proper implementation!** 🚀
