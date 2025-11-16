# System Architecture - Personalized Learning Platform

## Architecture Overview

This document outlines the detailed technical architecture for the personalized learning platform.

## 🏛️ Architecture Pattern: Microservices + Monorepo

### Why Microservices?
- **Scalability**: Scale individual services based on load
- **Isolation**: Code execution service isolated for security
- **Technology Flexibility**: Different services can use different tech if needed
- **Team Organization**: Teams can own specific services
- **Fault Isolation**: One service failure doesn't crash entire system

### Why Monorepo?
- **Code Sharing**: Shared types, utilities, components
- **Atomic Changes**: Update multiple services in one PR
- **Easier Development**: Single clone, unified tooling
- **Consistent Versioning**: All services versioned together

---

## 📁 Project Structure

```
ai-learning-platform/
├── apps/
│   ├── web/                      # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/              # App router (Next.js 14)
│   │   │   ├── components/       # React components
│   │   │   ├── hooks/            # Custom React hooks
│   │   │   ├── lib/              # Utilities, API clients
│   │   │   └── styles/           # Global styles
│   │   ├── public/
│   │   └── package.json
│   │
│   ├── api-gateway/              # Main API gateway (NestJS)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   ├── guards/           # Auth guards
│   │   │   ├── filters/          # Exception filters
│   │   │   └── middleware/       # Middlewares
│   │   └── package.json
│   │
│   └── admin-dashboard/          # Admin panel (Next.js)
│       └── src/
│
├── services/
│   ├── auth-service/             # Authentication & Authorization
│   ├── user-service/             # User management
│   ├── course-service/           # Courses & content
│   ├── bootcamp-service/         # Bootcamps & cohorts
│   ├── assessment-service/       # MCQs, quizzes
│   ├── code-execution-service/   # Code runner (Docker)
│   ├── terminal-service/         # Interactive terminals
│   ├── recommendation-service/   # AI recommendations
│   ├── progress-service/         # Progress tracking
│   ├── notification-service/     # Emails, push notifications
│   ├── analytics-service/        # Learning analytics
│   └── payment-service/          # Payments, subscriptions
│
├── packages/
│   ├── shared-types/             # Shared TypeScript types
│   ├── ui-components/            # Shared React components
│   ├── utils/                    # Shared utilities
│   ├── config/                   # Shared configs (ESLint, TS)
│   └── database/                 # Database schemas, migrations
│       ├── prisma/
│       └── migrations/
│
├── infrastructure/
│   ├── docker/                   # Dockerfiles
│   ├── kubernetes/               # K8s manifests
│   ├── terraform/                # Infrastructure as Code
│   └── nginx/                    # Nginx configs
│
├── docs/
│   ├── api/                      # API documentation
│   ├── architecture/             # Architecture docs
│   └── guides/                   # Development guides
│
├── scripts/
│   ├── setup.sh
│   ├── db-seed.ts
│   └── deploy.sh
│
├── package.json                  # Root package.json
├── pnpm-workspace.yaml           # PNPM workspace config
├── turbo.json                    # Turborepo config
├── .env.example
└── README.md
```

---

## 🔧 Service Architecture Details

### 1. API Gateway

**Responsibilities**:
- Single entry point for all client requests
- Route requests to appropriate microservices
- Authentication & authorization
- Rate limiting
- Request/response transformation
- API versioning
- Logging and monitoring

**Technology**: NestJS + Express

**Key Components**:
```typescript
// Example structure
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── strategies/
│   │       ├── jwt.strategy.ts
│   │       └── local.strategy.ts
│   ├── courses/
│   │   └── courses.proxy.controller.ts
│   └── users/
│       └── users.proxy.controller.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── interceptors/
│   ├── logging.interceptor.ts
│   └── transform.interceptor.ts
├── filters/
│   └── http-exception.filter.ts
└── config/
    ├── app.config.ts
    └── microservices.config.ts
```

**Communication**:
- Client ↔ API Gateway: REST/GraphQL over HTTPS
- API Gateway ↔ Services: gRPC or HTTP/REST

---

### 2. Auth Service

**Responsibilities**:
- User registration and login
- JWT token generation and validation
- Password reset flow
- OAuth integration (Google, GitHub)
- Session management
- 2FA (future)

**Database Tables**:
- `users`
- `refresh_tokens`
- `oauth_providers`
- `password_reset_tokens`

**APIs**:
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/verify-email/:token
POST   /auth/oauth/google
POST   /auth/oauth/github
```

**Authentication Flow**:
```
1. User submits credentials
2. Auth service validates
3. Generate JWT (access token - 15min, refresh token - 7 days)
4. Return tokens to client
5. Client stores in httpOnly cookies
6. Subsequent requests include access token
7. API Gateway validates token
```

---

### 3. Course Service

**Responsibilities**:
- Course CRUD operations
- Module and lesson management
- Content upload and storage
- Course search and filtering
- Instructor management
- Course enrollment

**Database Tables**:
- `courses`
- `course_modules`
- `lessons`
- `lesson_resources`
- `course_tags`
- `course_enrollments`

**Key Features**:
- **Content Storage**: S3 for videos, PDFs
- **Video Processing**: Integration with Mux or AWS MediaConvert
- **Search**: Elasticsearch for full-text search
- **Caching**: Redis for popular courses

---

### 4. Code Execution Service

**Critical Service - Requires Maximum Security**

**Responsibilities**:
- Execute user code safely
- Run test cases
- Return results (pass/fail, output, errors)
- Resource monitoring
- Security enforcement

**Architecture**:
```
┌──────────────┐
│   Request    │
│   Queue      │  (Redis/RabbitMQ)
└──────┬───────┘
       │
┌──────▼───────┐
│   Worker     │
│   Pool       │  (Multiple workers)
└──────┬───────┘
       │
┌──────▼───────┐
│   Docker     │
│   Containers │  (Isolated execution)
└──────────────┘
```

**Execution Flow**:
```
1. Receive code submission
2. Add to queue (prevents overload)
3. Worker picks up job
4. Spin up Docker container with:
   - Selected language runtime
   - Resource limits (CPU, memory, time)
   - No network access
   - Read-only filesystem (except /tmp)
5. Execute code with test cases
6. Capture stdout, stderr, exit code
7. Kill container
8. Return results
9. Clean up
```

**Security Measures**:
```yaml
- Container Isolation: Each execution in fresh container
- Resource Limits:
    CPU: 0.5 cores
    Memory: 256MB
    Time: 10 seconds
    Disk: 100MB
- No Network: Disabled internet access
- No Privileged Mode: Can't access host
- Seccomp Profile: Restrict system calls
- AppArmor/SELinux: Additional sandboxing
- Input Validation: Sanitize code before execution
```

**Supported Languages**:
- Python (3.x)
- JavaScript/Node.js
- Java (11, 17)
- C++ (GCC)
- C (GCC)
- Go
- Rust (future)

**Technology Options**:

**Option 1: Judge0 (Recommended for MVP)**
- Pros: Ready-made, reliable, handles all languages
- Cons: External dependency, cost for high volume
- Use Case: Quick launch, focus on features

**Option 2: Custom Docker Solution**
- Pros: Full control, no per-execution cost
- Cons: Complex to build and maintain
- Use Case: Long-term scalability, cost optimization

---

### 5. Terminal Service

**Responsibilities**:
- Create interactive terminal sessions
- Execute shell commands
- Scenario-based challenges (DevOps)
- Environment validation

**Architecture**:
```
┌────────────┐        WebSocket        ┌─────────────┐
│   Client   │ ◄───────────────────── ►│   Backend   │
│  (Xterm.js)│                         │  (Node.js)  │
└────────────┘                         └──────┬──────┘
                                              │
                                       ┌──────▼──────┐
                                       │   Docker    │
                                       │  Container  │
                                       │  (Ubuntu +  │
                                       │   Tools)    │
                                       └─────────────┘
```

**Session Lifecycle**:
```
1. User starts challenge
2. Backend creates Docker container with scenario
3. Run setup scripts (e.g., install packages)
4. Establish WebSocket connection
5. Stream terminal I/O bidirectionally
6. User executes commands
7. Backend validates completion
8. Destroy container on exit/timeout
```

**Scenarios**:
- Linux basics: File operations, permissions
- Git workflows: Branching, merging
- Docker: Build images, run containers
- Kubernetes: Deploy apps, manage pods
- AWS CLI: S3, EC2 operations

**Technology**:
- Frontend: Xterm.js
- Backend: Node.js + Socket.io + node-pty
- Containers: Docker with custom images
- Validation: Custom scripts to check task completion

---

### 6. Recommendation Service

**Responsibilities**:
- Generate personalized roadmaps
- Daily content recommendations
- Skill gap analysis
- Learning pattern analysis

**AI Integration**:
```typescript
// Recommendation Engine
interface RecommendationEngine {
  generateRoadmap(user: User, goal: LearningGoal): Roadmap
  getDailyTasks(user: User): Task[]
  analyzeSkillGaps(user: User): SkillGap[]
  suggestNextContent(user: User): Content[]
}
```

**AI Workflow**:
```
1. Collect user data:
   - Current skills (from assessment)
   - Learning goals
   - Past activity
   - Strengths/weaknesses

2. Build context for LLM:
   - Available courses/problems
   - User profile
   - Learning patterns

3. Prompt LLM (GPT-4/Claude):
   "Create a personalized roadmap for [user]
    Goal: [goal]
    Current skills: [skills]
    Available time: [hours/week]
    Learning style: [style]"

4. LLM returns structured roadmap

5. Store in database

6. Daily: Generate fresh recommendations based on progress
```

**Data Flow**:
```
User Data → Vector Embeddings → Similarity Search → Content Matching → LLM Ranking → Recommendations
```

**Technology**:
- LLM: OpenAI GPT-4 / Anthropic Claude
- Vector DB: Pinecone (for semantic search)
- Framework: LangChain
- Caching: Redis (avoid redundant AI calls)

---

### 7. Progress Service

**Responsibilities**:
- Track lesson/course completions
- Monitor learning streaks
- Calculate progress percentages
- Award achievements
- Generate analytics

**Real-time Updates**:
- Use Socket.io for live progress updates
- Update dashboard without page refresh

**Gamification**:
```typescript
interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  criteria: AchievementCriteria
}

// Examples:
- "7-Day Streak" - Learn for 7 days straight
- "100 Problems Solved" - Complete 100 coding problems
- "Course Completionist" - Finish first course
- "Night Owl" - Study after midnight
- "Early Bird" - Study before 6 AM
```

---

## 🗄️ Database Architecture

### Database Selection: PostgreSQL

**Why PostgreSQL?**
- Excellent for relational data (users, courses, enrollments)
- ACID compliance
- JSON support for flexible fields
- Full-text search capabilities
- Mature, reliable, well-documented

### Database Optimization

**Indexes**:
```sql
-- Frequent queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_submissions_user_question ON user_submissions(user_id, question_id);
CREATE INDEX idx_progress_user_resource ON user_progress(user_id, resource_type, resource_id);

-- Composite indexes
CREATE INDEX idx_cohort_enrollments_lookup ON cohort_enrollments(user_id, cohort_id, enrollment_status);
```

**Partitioning** (for large tables):
```sql
-- Partition submissions by month
CREATE TABLE user_submissions_2024_01 PARTITION OF user_submissions
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

**Connection Pooling**:
- Use PgBouncer or built-in connection pools
- Limit: 100 connections per service

### Redis Usage

**Use Cases**:
1. **Session Storage**: User sessions and JWT blacklist
2. **Caching**:
   - Popular courses
   - User profiles
   - Leaderboards
3. **Rate Limiting**: Track API request counts
4. **Job Queues**: Background jobs (Bull/BullMQ)
5. **Real-time Data**: Online users, live leaderboards

**Example Caching Strategy**:
```typescript
async getCourse(courseId: string) {
  // Check cache first
  const cached = await redis.get(`course:${courseId}`)
  if (cached) return JSON.parse(cached)

  // Cache miss - fetch from DB
  const course = await db.courses.findUnique({ where: { id: courseId } })

  // Store in cache (expire in 1 hour)
  await redis.setex(`course:${courseId}`, 3600, JSON.stringify(course))

  return course
}
```

---

## 🔄 Communication Between Services

### Option 1: HTTP/REST (Simpler, Recommended for MVP)
```
API Gateway → HTTP Request → Course Service
                  ↓
            JSON Response
```

**Pros**: Easy to implement, debug, and test
**Cons**: Slower than gRPC, no type safety

### Option 2: gRPC (Production-Grade)
```
API Gateway → gRPC Call → Course Service
                  ↓
          Protobuf Response
```

**Pros**: Fast, type-safe, efficient
**Cons**: More complex setup

**Recommendation**: Start with REST, migrate to gRPC later for performance-critical services

### Service Discovery

For local development:
```
- Hardcoded service URLs in config
- Example: COURSE_SERVICE_URL=http://localhost:3001
```

For production:
```
- Use Kubernetes service discovery
- Or Consul/Eureka for service registry
```

---

## 📡 Real-Time Features

### WebSocket Connections

**Use Cases**:
1. **Terminal Sessions**: Bidirectional terminal I/O
2. **Live Coding**: Real-time code collaboration
3. **Notifications**: Instant alerts
4. **Progress Updates**: Live dashboard updates
5. **Chat**: Cohort discussions

**Technology**: Socket.io

**Architecture**:
```
Client (Socket.io-client)
    ↓ WebSocket
API Gateway (Socket.io server)
    ↓ Pub/Sub
Redis (Message broker)
    ↓
Notification Service (Subscribers)
```

**Scaling WebSockets**:
- Use Redis adapter for Socket.io
- Allows multiple server instances
- Messages broadcast across all instances

---

## 🚀 Deployment Architecture

### Development Environment
```
Docker Compose:
  - PostgreSQL
  - Redis
  - All services as containers
  - Hot reload enabled
```

### Production Environment

**Option 1: AWS ECS (Simpler)**
```
- ECS Clusters for services
- RDS for PostgreSQL
- ElastiCache for Redis
- S3 for file storage
- CloudFront for CDN
- ALB for load balancing
```

**Option 2: Kubernetes (Scalable)**
```
- EKS/GKE for K8s cluster
- Managed PostgreSQL (RDS/Cloud SQL)
- Managed Redis
- S3/Cloud Storage
- Ingress controller (Nginx)
```

**Frontend Hosting**:
- Vercel or Netlify (recommended)
- Auto-deploy from GitHub
- Edge network for fast loading

---

## 📊 Monitoring & Observability

### Logging
- **Tool**: Winston (Node.js) or Pino
- **Aggregation**: Datadog, LogRocket, or ELK stack
- **Format**: Structured JSON logs

### Monitoring
- **APM**: Datadog, New Relic
- **Errors**: Sentry
- **Uptime**: Pingdom, UptimeRobot
- **Metrics**: Prometheus + Grafana

### Key Metrics to Track
```
- API response times (P50, P95, P99)
- Error rates (4xx, 5xx)
- Database query performance
- Code execution queue length
- Active WebSocket connections
- Memory/CPU usage per service
```

---

## 🔐 Security Architecture

### Defense in Depth

**Layer 1: Network**
- HTTPS only (TLS 1.3)
- WAF (Web Application Firewall)
- DDoS protection (Cloudflare)

**Layer 2: API Gateway**
- Rate limiting (per IP, per user)
- Request validation
- JWT verification
- CORS configuration

**Layer 3: Application**
- Input sanitization
- Parameterized queries (prevent SQL injection)
- XSS protection
- CSRF tokens
- Secure headers (Helmet.js)

**Layer 4: Data**
- Encryption at rest (database)
- Encryption in transit (TLS)
- Secrets management (AWS Secrets Manager / Vault)
- Regular backups

**Layer 5: Code Execution**
- Complete isolation (Docker containers)
- No network access
- Resource limits
- Read-only filesystem

---

## 🧪 Testing Strategy

### Unit Tests
- Each service: 80%+ code coverage
- Tools: Jest, Vitest

### Integration Tests
- API endpoints
- Database operations
- Service-to-service communication

### E2E Tests
- Critical user flows
- Tools: Playwright, Cypress

### Load Testing
- Simulate high traffic
- Tools: k6, Artillery
- Test code execution under load

---

## 📚 Technology Stack (Final)

| Component | Technology | Reasoning |
|-----------|-----------|-----------|
| **Monorepo** | Turborepo + PNPM | Fast builds, efficient caching |
| **Frontend** | Next.js 14 + TypeScript | Server components, SEO, fast |
| **UI** | Tailwind + shadcn/ui | Modern, accessible components |
| **Backend** | NestJS + TypeScript | Structured, scalable, testable |
| **Database** | PostgreSQL 15+ | Reliable, feature-rich |
| **Cache** | Redis 7+ | In-memory speed |
| **Search** | Elasticsearch | Full-text search |
| **Storage** | AWS S3 / R2 | Scalable object storage |
| **Code Exec** | Docker + Judge0 | Secure sandboxing |
| **Terminal** | Docker + Xterm.js | Interactive shells |
| **Real-time** | Socket.io | WebSocket abstraction |
| **AI** | OpenAI GPT-4 | Advanced reasoning |
| **Vectors** | Pinecone | Semantic search |
| **Payment** | Stripe | Reliable payments |
| **Email** | Resend / SendGrid | Transactional emails |
| **Analytics** | PostHog | Product analytics |
| **Monitoring** | Sentry + Datadog | Error tracking + APM |
| **CI/CD** | GitHub Actions | Automated workflows |
| **Hosting** | Vercel + AWS | Fast frontend, scalable backend |

---

## 🎯 Next Steps

1. **Set up monorepo structure** with Turborepo
2. **Initialize database** with Prisma
3. **Create shared packages** (types, utils, UI)
4. **Build API Gateway** skeleton
5. **Implement Auth Service** first
6. **Follow Phase 1** from PROJECT_PLAN.md

---

**Questions? Review the architecture and let's discuss any adjustments!** 🏗️
