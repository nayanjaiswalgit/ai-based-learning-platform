# 🚀 AI-Based Personalized Learning Platform

A next-generation learning platform that solves common problems in online education through AI-powered personalization, hands-on practice, and cohort-based learning.

---

## 📚 Documentation

This repository contains comprehensive planning documents for building a world-class learning platform:

### Planning Documents

1. **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** - Complete project overview
   - Problems we're solving
   - Feature specifications
   - Technology stack
   - Development phases (24-week roadmap)
   - API design
   - Success metrics

2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture
   - System architecture diagrams
   - Microservices design
   - Service-by-service breakdown
   - Code execution security
   - Terminal environment setup
   - Deployment strategies
   - Monitoring & observability

3. **[SERVER_DRIVEN_UI.md](./SERVER_DRIVEN_UI.md)** - Server-driven UI architecture ⭐ NEW
   - Hybrid UI configuration system
   - Component registry pattern
   - Dynamic rendering with React 19.2
   - Real-time UI updates
   - Feature flags & A/B testing
   - Best libraries for each feature

4. **[SCALABILITY.md](./SCALABILITY.md)** - Scalability & performance ⭐ NEW
   - Scale to 10M+ users
   - Kubernetes auto-scaling
   - Database sharding & read replicas
   - Redis cluster setup
   - CDN & caching strategies
   - Performance targets
   - Cost optimization

5. **[TECH_STACK.md](./TECH_STACK.md)** - Complete technology stack ⭐ NEW
   - React 19.2 + Next.js 15
   - Latest versions of all libraries
   - Complete package.json files
   - Installation commands
   - Version compatibility matrix

6. **[BEST_PRACTICES.md](./BEST_PRACTICES.md)** - Development best practices ⭐ NEW
   - TypeScript strict mode
   - React & NestJS patterns
   - Security best practices
   - Performance optimization
   - Testing strategies
   - Code review checklist

7. **[DATABASE_SCHEMA.sql](./DATABASE_SCHEMA.sql)** - Database design
   - Complete PostgreSQL schema
   - All tables with relationships
   - Indexes for performance
   - Triggers and functions
   - Sample data

8. **[PRODUCTION_FEATURES.md](./PRODUCTION_FEATURES.md)** - Production-ready features ⭐ NEW
   - Stripe subscription system
   - Feature flags with PostHog
   - Error boundaries & handling
   - Sentry error tracking
   - Real-time notifications
   - Email templates
   - Rate limiting
   - Logging with Winston

9. **[AI_AGENT_TASKS.md](./AI_AGENT_TASKS.md)** - Task breakdown for parallel development ⭐ NEW
   - 13 specialized AI agent roles
   - Week-by-week deliverables
   - Dependencies and critical path
   - Features from Teachyst.com
   - White-label, DRM, PPP pricing
   - SAML/SSO, 1:1 meetings
   - Multi-payment gateways

10. **[NEXT_STEPS.md](./NEXT_STEPS.md)** - Implementation guide
    - Week-by-week breakdown
    - Decision points
    - Required services
    - Development workflow

---

## 🎯 What Makes This Platform Unique?

### Problems We Solve

❌ **Current Problems in Online Learning:**
- Students waste time on content they already know
- Long, boring videos without practical application
- Fixed learning paths that don't adapt to individual needs
- Passive learning (just watching videos)
- No clear roadmap or guidance

✅ **Our Solutions:**
- AI-powered skill assessment to skip what you know
- Bite-sized, practical content (10-20 min modules)
- Personalized roadmaps generated for each learner
- Active learning: MCQs, coding challenges, terminal exercises
- Daily fresh content based on your progress
- Cohort-based bootcamps for peer learning

---

## 🌟 Key Features

### 1. Personalized Learning Engine
- Initial skill assessment via AI-driven quiz
- Custom roadmap generation based on goals
- Daily adaptive content recommendations
- Dynamic difficulty adjustment

### 2. Comprehensive Assessment System

#### A. MCQ Testing
- Topic-wise question banks
- Instant feedback with explanations
- Timed assessments

#### B. Coding Challenges (LeetCode-style)
- Multi-language code editor (Monaco Editor)
- Test case execution and validation
- Performance metrics (time/space complexity)
- DSA sheet tracking

#### C. Terminal Challenges (Killercoda-style)
- Browser-based interactive terminal
- DevOps scenarios (Docker, Kubernetes, Linux, Git)
- Auto-validation of tasks
- Real containerized environments

### 3. Bootcamp & Cohort Learning
- Structured 4-16 week intensive programs
- Cohort-based learning with peers
- Live sessions with mentors
- Group projects and collaboration
- Certification upon completion

### 4. Course Marketplace
- Modular course creation
- Multi-format content (video, articles, interactive)
- Instructor tools for content management
- Student reviews and ratings

### 5. AI-Powered Recommendations
- Skill gap analysis
- Smart content suggestions
- Learning pattern optimization
- AI chatbot for doubt resolution

---

## 🛠️ Technology Stack (Latest Versions)

### Frontend
```
- Framework: Next.js 15.0.3 with Turbopack
- Runtime: React 19.2 (latest stable)
- Language: TypeScript 5.6.3
- UI Library: Tailwind CSS 3.4.15 + shadcn/ui (Radix UI)
- Code Editor: Monaco Editor 0.52.2
- Terminal: Xterm.js 5.5.0
- State: Zustand 5.0.2 + TanStack Query 5.62.3
- Forms: React Hook Form 7.53.2 + Zod 3.23.8
- Charts: Recharts 2.14.1
- Animation: Framer Motion 11.13.1
- Icons: Lucide React 0.462.0
```

### Backend
```
- Framework: NestJS 10.4.11 (Node.js 22+)
- Language: TypeScript 5.6.3
- API: RESTful + GraphQL (optional)
- Real-time: Socket.io 4.8.1
- Validation: class-validator + Zod
- Auth: Passport JWT + OAuth2
- Monorepo: Turborepo 2.3.1 + PNPM 9.14.4
```

### Database & Storage
```
- Primary DB: PostgreSQL 16.4 with Prisma 6.0.1
- Caching: Redis 7.4 (cluster mode)
- Search: Elasticsearch 8.15 or Meilisearch 1.10
- File Storage: AWS S3 / Cloudflare R2
- Vector DB: Pinecone (latest) or Qdrant 1.12
- ORM: Prisma with strict type safety
```

### DevOps & Infrastructure
```
- Containers: Docker
- Orchestration: Kubernetes
- CI/CD: GitHub Actions
- Hosting: Vercel (Frontend) + AWS (Backend)
- Monitoring: Sentry + Datadog
```

### Code Execution
```
- Option 1: Judge0 API (recommended for MVP)
- Option 2: Custom Docker-based engine
- Security: Isolated containers, resource limits
```

### AI/ML
```
- LLM: OpenAI GPT-4 / Anthropic Claude
- Framework: LangChain
- Embeddings: OpenAI text-embedding-3
- Vector Store: Pinecone
```

---

## 📋 Development Roadmap

### Phase 1: Foundation (Weeks 1-4)
- Project setup and monorepo structure
- User authentication system
- Database schema implementation
- Basic course CRUD
- UI/UX framework

### Phase 2: Assessment System (Weeks 5-8)
- MCQ question bank
- Code editor integration
- Code execution service
- DSA sheet structure
- Basic analytics

### Phase 3: Personalization Engine (Weeks 9-12)
- AI integration (OpenAI/Claude)
- Skill assessment quiz
- Roadmap generation
- Daily recommendations
- Learning pattern analysis

### Phase 4: Bootcamp & Cohorts (Weeks 13-16)
- Bootcamp creation
- Cohort management
- Live session scheduling
- Discussion forums
- Mentor assignment

### Phase 5: Advanced Features (Weeks 17-20)
- Terminal environment (Docker)
- DevOps challenges
- Project submissions
- Peer review system
- Gamification

### Phase 6: Polish & Launch (Weeks 21-24)
- Performance optimization
- Security audit
- Payment integration
- Mobile responsiveness
- Beta testing

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│              (Next.js Web Application)                   │
└────────────────┬────────────────────────────────────────┘
                 │ HTTPS
┌────────────────▼────────────────────────────────────────┐
│                   API Gateway (NestJS)                   │
│        (Authentication, Rate Limiting, Routing)          │
└────┬────────┬──────────┬──────────┬───────────────────┘
     │        │          │          │
┌────▼────┐ ┌▼─────┐ ┌──▼──────┐ ┌▼──────────┐
│ Auth    │ │Course│ │Assessment│ │ Code Exec │
│ Service │ │Service│ │ Service  │ │ Service   │
└────┬────┘ └┬─────┘ └──┬──────┘ └┬──────────┘
     │       │           │          │
     └───────┴───────────┴──────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│              Data Layer                                  │
│  PostgreSQL | Redis | S3 | Elasticsearch | Pinecone    │
└─────────────────────────────────────────────────────────┘
```

**Microservices:**
- Auth Service: Authentication & authorization
- User Service: Profile management
- Course Service: Course & content management
- Bootcamp Service: Bootcamps & cohorts
- Assessment Service: MCQs, quizzes, tests
- Code Execution Service: Safe code execution
- Terminal Service: Interactive shells
- Recommendation Service: AI-powered suggestions
- Progress Service: Learning analytics
- Notification Service: Emails & alerts
- Payment Service: Subscriptions & payments

---

## 🔐 Security

### Code Execution Security
- **Sandboxing**: Each execution in isolated Docker container
- **Resource Limits**: CPU, memory, time constraints
- **Network Isolation**: No internet access
- **Read-only Filesystem**: Prevent file system changes
- **Input Validation**: Sanitize all code inputs

### Application Security
- **Authentication**: JWT with refresh tokens
- **Encryption**: Bcrypt for passwords, TLS for transit
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization
- **CSRF Protection**: CSRF tokens
- **Rate Limiting**: Prevent abuse

---

## 💰 Monetization Strategy

### Revenue Models

1. **Freemium Subscription**
   - Free: Limited courses, basic features, 10 code runs/day
   - Pro ($19/month): Unlimited access, AI features, all courses

2. **Course Marketplace**
   - Instructors sell courses (70/30 revenue split)
   - One-time purchases or bundles

3. **Bootcamp Fees**
   - Premium bootcamps ($499-$2999)
   - Includes mentorship and certification

4. **B2B/Enterprise**
   - Corporate training programs
   - Team licenses for companies

---

## 📊 Success Metrics (KPIs)

### User Engagement
- Daily Active Users (DAU)
- Learning streak retention (7-day, 30-day)
- Course completion rate
- Problem-solving success rate

### Business Metrics
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Conversion rate (free → paid)

### Learning Effectiveness
- Skill improvement scores
- Job placement rate (for bootcamps)
- User satisfaction (NPS)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.18.0+
- PostgreSQL 16+
- Redis 7+
- Docker
- pnpm 9.15.1+

### Option 1: Quick Start (Automated - Recommended)

The fastest way to get started is using our automated setup script:

```bash
# Clone repository
git clone https://github.com/yourusername/ai-learning-platform.git
cd ai-learning-platform

# Make setup script executable
chmod +x scripts/setup.sh

# Run automated setup (checks dependencies, installs, starts services, seeds database)
./scripts/setup.sh
```

**What the setup script does:**
- ✅ Checks Docker, Docker Compose, and pnpm installation
- ✅ Creates .env file from .env.example
- ✅ Installs all dependencies with pnpm
- ✅ Starts infrastructure services (PostgreSQL, Redis, Meilisearch)
- ✅ Generates Prisma Client
- ✅ Runs database migrations
- ✅ Seeds database with sample data (users, courses, questions, labs)

After setup completes, start the development servers:

```bash
pnpm dev
```

### Option 2: Docker Compose (Full Stack)

Run the entire application stack in Docker:

```bash
# Clone and setup
git clone https://github.com/yourusername/ai-learning-platform.git
cd ai-learning-platform
cp .env.example .env

# Start infrastructure services
docker compose up -d postgres redis meilisearch

# Seed the database (first time only)
docker compose --profile seed up db-seed

# Start all application services
docker compose up -d
```

**Two deployment modes:**
1. **Development Mode**: Infrastructure in Docker + Apps with hot reload
   - Start infrastructure: `docker compose up -d postgres redis meilisearch`
   - Run apps locally: `pnpm dev`
   - Fast iteration, code changes instantly reflected
2. **Production Mode**: Everything in Docker
   - Start all services: `docker compose up -d`
   - Full production-like environment

📚 **Full Docker documentation**: See [DOCKER.md](./DOCKER.md)

### Option 3: Local Development (Manual Setup)

```bash
# Clone repository
git clone https://github.com/yourusername/ai-learning-platform.git
cd ai-based-learning-platform

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Start infrastructure (PostgreSQL, Redis, Meilisearch)
docker compose up -d postgres redis meilisearch

# Wait for services to be ready (10-15 seconds)
sleep 10

# Generate Prisma Client
cd packages/database && pnpm db:generate && cd ../..

# Run database migrations
cd packages/database && pnpm db:migrate && cd ../..

# Seed database with sample data
cd packages/database && pnpm db:seed && cd ../..

# Start development server
pnpm dev
```

**Database Seed Data Includes:**
- 5 users (1 admin, 2 instructors, 2 students) with secure passwords
- 3 complete courses with modules and lessons
- 2 coding questions (Two Sum, Valid Parentheses) with test cases
- 3 terminal labs (Docker, Linux, Git basics)
- 12 achievement definitions
- Sample enrollments and 30 days of learning analytics per student

All seed data is config-driven from JSON files in `packages/database/seed/config/`

### Available Services

After starting, access:
- **Web App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001
- **API Gateway**: http://localhost:4000
- **API Docs**: http://localhost:4000/api/docs
- **Mailpit (Email UI)**: http://localhost:8025
- **pgAdmin**: http://localhost:5050 (dev mode)

### Platform-Specific Setup

- **Windows Users**: See [WINDOWS_SETUP.md](./WINDOWS_SETUP.md) and [QUICKSTART.md](./QUICKSTART.md) for detailed Windows setup instructions
- **macOS/Linux**: The above quick start should work without issues

### Helpful Commands

```bash
# Development
pnpm dev                    # Start all services with hot reload
pnpm build                  # Build all services
pnpm lint                   # Lint all code
pnpm test                   # Run tests

# Database Management (from packages/database)
cd packages/database
pnpm db:generate           # Generate Prisma client
pnpm db:migrate            # Run database migrations
pnpm db:seed               # Seed database with sample data
pnpm db:reset              # Reset database (drop, migrate, seed)
pnpm db:setup              # Complete setup (generate, migrate, seed)
pnpm db:studio             # Open Prisma Studio (GUI)

# Docker - Infrastructure Only
docker compose up -d postgres redis meilisearch  # Start infrastructure
docker compose --profile seed up db-seed         # Run database seed
docker compose down                               # Stop all services
docker compose logs -f [service-name]            # View logs

# Docker - Full Stack
docker compose up -d                             # Start all services
docker compose ps                                 # View running services
docker compose down --volumes                     # Stop and remove volumes

# Useful Scripts
./scripts/setup.sh         # Complete automated setup
chmod +x scripts/*.sh      # Make scripts executable
```

### Database Seed Configuration

The platform uses a **config-driven seeding system** with JSON files. All seed data is located in `packages/database/seed/config/`:

#### Seed Data Files

1. **`users.json`** - User accounts
   - Admin: `admin@example.com` / `Admin123!`
   - Instructor 1: `instructor1@example.com` / `Instructor123!` (Sarah Johnson)
   - Instructor 2: `instructor2@example.com` / `Instructor123!` (Michael Chen)
   - Student 1: `student1@example.com` / `Student123!` (John Doe)
   - Student 2: `student2@example.com` / `Student123!` (Jane Smith)

2. **`courses.json`** - Course catalog
   - Full Stack Web Development (Intermediate, $79.99)
   - Data Structures & Algorithms (Intermediate, $69.99)
   - Machine Learning Fundamentals (Advanced, $99.99)

3. **`questions.json`** - Coding challenges
   - Two Sum (Easy, Array manipulation)
   - Valid Parentheses (Easy, Stack problem)

4. **`labs.json`** - Terminal challenges
   - Docker Basics - Container Management (45 min)
   - Linux Basics - File System Navigation (30 min)
   - Git Basics - Version Control (40 min)

5. **`achievements.json`** - Achievement definitions
   - 12 achievements across Learning, Coding, and Consistency categories

#### Customizing Seed Data

To modify seed data, edit the JSON files in `packages/database/seed/config/` and run:

```bash
cd packages/database
pnpm db:reset  # This will drop, migrate, and re-seed
```

**Example - Adding a new user to `users.json`:**

```json
{
  "email": "newuser@example.com",
  "username": "new_user",
  "password": "SecurePassword123!",
  "role": "STUDENT",
  "fullName": "New User",
  "isEmailVerified": true,
  "profile": {
    "bio": "New student learning web development",
    "location": "San Francisco, CA"
  }
}
```

**Security Note:** Passwords in seed files are automatically hashed using bcrypt before database insertion.

---

## 📁 Project Structure (Planned)

```
ai-learning-platform/
├── apps/
│   ├── web/                  # Next.js frontend
│   ├── api-gateway/          # NestJS API gateway
│   └── admin-dashboard/      # Admin panel
├── services/
│   ├── auth-service/
│   ├── course-service/
│   ├── code-execution-service/
│   └── ...
├── packages/
│   ├── shared-types/
│   ├── ui-components/
│   ├── utils/
│   └── database/
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   └── terraform/
└── docs/
```

---

## 🎨 UI/UX Features

### Student Dashboard
- Personalized roadmap visualization
- Daily recommended tasks
- Learning streak tracker
- Progress charts
- Upcoming cohort sessions

### Code Editor
- Monaco Editor (VS Code's editor)
- Multi-language syntax highlighting
- IntelliSense and autocomplete
- Run code and see results
- Submit and get instant feedback

### Terminal Environment
- Full Linux terminal in browser
- Pre-configured scenarios
- Auto-validation of tasks
- Progress tracking

### DSA Sheet Tracker
- Visual progress (% completed)
- Filter by difficulty, topic, company
- Personal notes on each problem
- Spaced repetition reminders

---

## 🔮 Future Enhancements

- **Mobile Apps**: iOS and Android native apps
- **Offline Mode**: Download content for offline learning
- **Live Coding Interviews**: Practice with AI interviewer
- **Project Showcase**: Portfolio builder
- **Job Board**: Direct job applications
- **AR/VR Learning**: Immersive experiences
- **Blockchain Certificates**: NFT-based credentials

---

## 🤝 Contributing (Future)

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

## 📄 License

This project will be licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 📞 Contact & Support

- **Documentation**: Read the planning docs above
- **Issues**: GitHub Issues (when repo is public)
- **Discussions**: GitHub Discussions (when repo is public)

---

## 🙏 Acknowledgments

Inspired by platforms like:
- LeetCode (coding challenges)
- Killercoda (terminal scenarios)
- Striver's DSA Sheet (problem tracking)
- Coursera/Udemy (course structure)
- Anthropic Claude & OpenAI GPT (AI capabilities)

---

## ✅ Next Steps

### For Project Owner

1. **Review Planning Documents**
   - Read through PROJECT_PLAN.md
   - Review ARCHITECTURE.md
   - Examine DATABASE_SCHEMA.sql

2. **Clarify Requirements**
   - Confirm target audience
   - Decide on primary focus area (DSA, Web Dev, DevOps, etc.)
   - Set timeline for MVP launch
   - Determine budget for infrastructure and APIs

3. **Assemble Team**
   - Frontend developers (React/Next.js)
   - Backend developers (Node.js/NestJS)
   - DevOps engineer
   - UI/UX designer
   - Optional: AI/ML engineer

4. **Set Up Infrastructure**
   - Create GitHub organization/repo
   - Set up project management (Jira, Linear, GitHub Projects)
   - Provision cloud accounts (AWS, Vercel)
   - Register domain name

5. **Begin Phase 1**
   - Initialize monorepo structure
   - Set up basic authentication
   - Design UI mockups
   - Start development!

### For Developers

Once approved, we'll:
- Set up the monorepo with Turborepo
- Initialize Next.js and NestJS apps
- Configure database with Prisma
- Set up CI/CD with GitHub Actions
- Create initial UI components
- Build authentication system

---

**Ready to revolutionize online learning? Let's build this! 🚀**

---

*Last Updated: November 16, 2025*
