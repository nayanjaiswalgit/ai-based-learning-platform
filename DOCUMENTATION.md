# 📚 Documentation Index

Complete guide to all documentation in this repository.

## 🚀 Getting Started

Start here if you're new to the project:

1. **[README.md](./README.md)** - Project overview, features, and tech stack
2. **[WINDOWS_QUICKSTART.md](./WINDOWS_QUICKSTART.md)** - Quick start for Windows developers (5 minutes)
3. **[WINDOWS_SETUP.md](./WINDOWS_SETUP.md)** - Detailed Windows setup guide with troubleshooting
4. **[SETUP.md](./SETUP.md)** - Complete setup guide for all platforms
5. **[COMMANDS.md](./COMMANDS.md)** - Command reference for daily development

## 🏗️ Architecture & Planning

Understand the system design and technical decisions:

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture, microservices design, security
- **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** - Complete project plan with 24-week roadmap
- **[TECH_STACK.md](./TECH_STACK.md)** - Technology stack with versions and package.json files
- **[SCALABILITY.md](./SCALABILITY.md)** - Scaling to 10M+ users, Kubernetes, performance
- **[SERVER_DRIVEN_UI.md](./SERVER_DRIVEN_UI.md)** - Server-driven UI architecture and patterns
- **[AI_AGENT_TASKS.md](./AI_AGENT_TASKS.md)** - Task breakdown for parallel development

## 🔨 Development

Best practices and guidelines for development:

- **[BEST_PRACTICES.md](./BEST_PRACTICES.md)** - TypeScript, React, NestJS patterns and security
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[TESTING.md](./TESTING.md)** - Testing strategies and examples
- **[COMMANDS.md](./COMMANDS.md)** - Development command reference

## 🚢 Deployment & Production

Deploy and run in production:

- **[DOCKER.md](./DOCKER.md)** - Docker setup and deployment
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Complete deployment guide
- **[PRODUCTION_FEATURES.md](./PRODUCTION_FEATURES.md)** - Production-ready features (Stripe, Sentry, etc.)

## 📊 Project Status

Track progress and completed work:

- **[MERGE_SUMMARY_AND_REMAINING_TASKS.md](./MERGE_SUMMARY_AND_REMAINING_TASKS.md)** - Merge summary and task status

## 🎯 Feature Documentation

### Organization Management System

Complete documentation for the organization types, roles, and dynamic permission system:

- **[docs/organization/](./docs/organization/)** - Organization feature documentation
  - [Quick Start](./docs/organization/QUICK_START.md) - Get started in 5 minutes
  - [Implementation Summary](./docs/organization/IMPLEMENTATION_SUMMARY.md) - Complete overview
  - [Permission System Usage](./docs/organization/PERMISSION_SYSTEM_USAGE.md) - How to use permissions
  - [E2E Testing Guide](./docs/organization/E2E_TESTING_GUIDE.md) - Testing guide
  - [Review Summary](./docs/organization/REVIEW_SUMMARY.md) - Implementation review

### Terminal Service

Interactive terminal challenges and DevOps scenarios:

- **[docs/TERMINAL_SERVICE.md](./docs/TERMINAL_SERVICE.md)** - Terminal service documentation

## 📁 Directory Structure

### Root Level Documentation

Essential documentation at project root:

```
├── README.md                              # Main project overview
├── DOCUMENTATION.md                       # This file - documentation index
├── WINDOWS_QUICKSTART.md                  # Windows quick start
├── WINDOWS_SETUP.md                       # Windows detailed setup
├── SETUP.md                               # General setup guide
├── COMMANDS.md                            # Command reference
├── ARCHITECTURE.md                        # System architecture
├── PROJECT_PLAN.md                        # Project planning
├── TECH_STACK.md                          # Technology stack
├── SCALABILITY.md                         # Scaling guide
├── SERVER_DRIVEN_UI.md                    # UI architecture
├── BEST_PRACTICES.md                      # Development best practices
├── CONTRIBUTING.md                        # Contribution guidelines
├── TESTING.md                             # Testing guide
├── DOCKER.md                              # Docker guide
├── PRODUCTION_FEATURES.md                 # Production features
├── AI_AGENT_TASKS.md                      # Task breakdown
└── MERGE_SUMMARY_AND_REMAINING_TASKS.md   # Project status
```

### Feature Documentation

Feature-specific documentation in `docs/` folder:

```
docs/
├── DEPLOYMENT.md                          # Deployment guide
├── TERMINAL_SERVICE.md                    # Terminal service
└── organization/                          # Organization feature
    ├── README.md                          # Organization feature index
    ├── QUICK_START.md                     # Quick start guide
    ├── IMPLEMENTATION_SUMMARY.md          # Implementation details
    ├── PERMISSION_SYSTEM_USAGE.md         # Permission usage guide
    ├── E2E_TESTING_GUIDE.md               # Testing guide
    └── REVIEW_SUMMARY.md                  # Implementation review
```

### Service Documentation

Each service has its own README:

```
services/
├── auth-service/README.md                 # Authentication service
├── course-service/README.md               # Course management
├── payment-service/README.md              # Payment processing
├── notification-service/README.md         # Notifications
├── notification-service/INTEGRATION_EXAMPLES.md
├── recommendation-service/README.md       # AI recommendations
└── terminal-service/README.md             # Terminal challenges
```

### Package Documentation

Shared packages documentation:

```
packages/
└── database/README.md                     # Database schema and Prisma
```

### Infrastructure Documentation

Infrastructure-specific guides:

```
infrastructure/database/
├── backup-strategy.md                     # Database backup
├── read-replicas-setup.md                 # Read replicas
└── sharding-strategy.md                   # Database sharding

k8s/
├── README.md                              # Kubernetes setup
└── istio/README.md                        # Service mesh

monitoring/
└── README.md                              # Monitoring setup
```

## 🎯 Quick Navigation

### I want to...

**...get started quickly**
→ [WINDOWS_QUICKSTART.md](./WINDOWS_QUICKSTART.md) or [SETUP.md](./SETUP.md)

**...understand the architecture**
→ [ARCHITECTURE.md](./ARCHITECTURE.md)

**...learn about the tech stack**
→ [TECH_STACK.md](./TECH_STACK.md)

**...follow best practices**
→ [BEST_PRACTICES.md](./BEST_PRACTICES.md)

**...deploy to production**
→ [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) and [DOCKER.md](./DOCKER.md)

**...work with organizations**
→ [docs/organization/](./docs/organization/)

**...check project status**
→ [MERGE_SUMMARY_AND_REMAINING_TASKS.md](./MERGE_SUMMARY_AND_REMAINING_TASKS.md)

**...contribute to the project**
→ [CONTRIBUTING.md](./CONTRIBUTING.md)

**...use daily commands**
→ [COMMANDS.md](./COMMANDS.md)

**...scale the platform**
→ [SCALABILITY.md](./SCALABILITY.md)

## 📝 Documentation Standards

When adding new documentation:

1. **Root Level** - Only for project-wide documentation
2. **docs/** - Feature-specific documentation goes here
3. **Service README** - Each service should have its own README
4. **Update this index** - Add new docs to DOCUMENTATION.md

### File Naming Conventions

- `README.md` - Overview of a directory
- `SETUP.md` - Setup and installation guides
- `ARCHITECTURE.md` - Architecture and design docs
- Feature docs should be in `docs/feature-name/`
- Use UPPERCASE for root-level docs
- Use kebab-case for feature directories

## 🔍 Search Tips

**Find by topic:**
- Authentication → [services/auth-service/README.md](./services/auth-service/README.md)
- Courses → [services/course-service/README.md](./services/course-service/README.md)
- Payments → [services/payment-service/README.md](./services/payment-service/README.md)
- Organizations → [docs/organization/](./docs/organization/)
- Database → [packages/database/README.md](./packages/database/README.md)
- Deployment → [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- Testing → [TESTING.md](./TESTING.md)

**Find by use case:**
- New developer setup → [SETUP.md](./SETUP.md)
- Windows issues → [WINDOWS_SETUP.md](./WINDOWS_SETUP.md)
- Command reference → [COMMANDS.md](./COMMANDS.md)
- Scaling concerns → [SCALABILITY.md](./SCALABILITY.md)
- Security best practices → [BEST_PRACTICES.md](./BEST_PRACTICES.md)
- Production deployment → [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## 📚 External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React 19 Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

**Last Updated**: November 17, 2025

**Maintained by**: Development Team

**Questions?** Check the relevant documentation above or reach out to the team.
