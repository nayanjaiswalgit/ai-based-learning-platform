# 🛠️ Technology Stack - Latest Versions

Complete tech stack with latest stable versions and best-in-class libraries.

---

## 📦 Package Versions (Updated: November 2025)

### Frontend Core

```json
{
  "dependencies": {
    // Core Framework
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "next": "^15.0.3",

    // TypeScript
    "typescript": "^5.6.3",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@types/node": "^22.9.1",

    // UI Components & Styling
    "tailwindcss": "^3.4.15",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "@radix-ui/react-avatar": "^1.1.2",
    "@radix-ui/react-dialog": "^1.1.3",
    "@radix-ui/react-dropdown-menu": "^2.1.3",
    "@radix-ui/react-select": "^2.1.3",
    "@radix-ui/react-tabs": "^1.1.2",
    "@radix-ui/react-tooltip": "^1.1.5",
    "@radix-ui/react-slot": "^1.1.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",

    // Icons
    "lucide-react": "^0.462.0",

    // State Management
    "zustand": "^5.0.2",
    "@tanstack/react-query": "^5.62.3",
    "@tanstack/react-query-devtools": "^5.62.3",

    // Forms & Validation
    "react-hook-form": "^7.53.2",
    "zod": "^3.23.8",
    "@hookform/resolvers": "^3.9.1",

    // Code Editor
    "@monaco-editor/react": "^4.6.0",
    "monaco-editor": "^0.52.2",

    // Terminal
    "@xterm/xterm": "^5.5.0",
    "@xterm/addon-fit": "^0.10.0",
    "@xterm/addon-web-links": "^0.11.0",

    // Charts & Visualization
    "recharts": "^2.14.1",

    // Animation
    "framer-motion": "^11.13.1",

    // Date & Time
    "date-fns": "^4.1.0",

    // Real-time
    "socket.io-client": "^4.8.1",

    // Utilities
    "nanoid": "^5.0.9",
    "lodash-es": "^4.17.21",
    "@types/lodash-es": "^4.17.12",

    // Feature Flags & Analytics
    "posthog-js": "^1.181.0",

    // Error Tracking
    "@sentry/nextjs": "^8.40.0"
  },
  "devDependencies": {
    // Testing
    "vitest": "^2.1.8",
    "@testing-library/react": "^16.0.1",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/user-event": "^14.5.2",
    "@vitejs/plugin-react": "^4.3.4",
    "playwright": "^1.49.1",
    "@playwright/test": "^1.49.1",

    // Linting & Formatting
    "eslint": "^9.15.0",
    "eslint-config-next": "^15.0.3",
    "@typescript-eslint/eslint-plugin": "^8.15.0",
    "@typescript-eslint/parser": "^8.15.0",
    "prettier": "^3.3.3",
    "prettier-plugin-tailwindcss": "^0.6.9",

    // Build Tools
    "turbo": "^2.3.1",
    "tsup": "^8.3.5"
  }
}
```

---

### Backend Core

```json
{
  "dependencies": {
    // Framework
    "@nestjs/common": "^10.4.11",
    "@nestjs/core": "^10.4.11",
    "@nestjs/platform-express": "^10.4.11",
    "@nestjs/platform-socket.io": "^10.4.11",

    // Database
    "@prisma/client": "^6.0.1",
    "prisma": "^6.0.1",

    // Authentication
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-google-oauth20": "^2.0.0",
    "passport-github2": "^0.1.12",
    "bcrypt": "^5.1.1",
    "@types/bcrypt": "^5.0.2",

    // Validation
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",

    // Redis
    "ioredis": "^5.4.1",
    "@types/ioredis": "^5.0.0",

    // Caching
    "@nestjs/cache-manager": "^2.2.2",
    "cache-manager": "^5.7.6",
    "cache-manager-ioredis-yet": "^2.1.1",

    // Rate Limiting
    "@nestjs/throttler": "^6.2.1",

    // Configuration
    "@nestjs/config": "^3.3.0",
    "dotenv": "^16.4.7",

    // Logging
    "winston": "^3.17.0",
    "nest-winston": "^1.10.0",

    // Real-time
    "socket.io": "^4.8.1",
    "@nestjs/websockets": "^10.4.11",

    // File Upload
    "@nestjs/platform-multer": "^10.4.11",
    "multer": "^1.4.5-lts.1",
    "@types/multer": "^1.4.12",

    // AWS SDK
    "@aws-sdk/client-s3": "^3.705.0",
    "@aws-sdk/s3-request-presigner": "^3.705.0",

    // Email
    "@nestjs/mailer": "^2.0.2",
    "nodemailer": "^6.9.16",
    "@types/nodemailer": "^6.4.17",
    "resend": "^4.0.1",

    // Payments
    "stripe": "^17.4.0",

    // AI & ML
    "openai": "^4.76.0",
    "@anthropic-ai/sdk": "^0.32.1",
    "langchain": "^0.3.7",
    "@langchain/openai": "^0.3.14",
    "@langchain/anthropic": "^0.3.8",
    "@pinecone-database/pinecone": "^4.0.0",

    // Code Execution
    "dockerode": "^4.0.2",
    "@types/dockerode": "^3.3.31",
    "axios": "^1.7.9",

    // Utilities
    "uuid": "^11.0.3",
    "@types/uuid": "^10.0.0",
    "dayjs": "^1.11.13",

    // TypeScript
    "typescript": "^5.6.3",
    "@types/node": "^22.9.1",
    "@types/express": "^5.0.0"
  },
  "devDependencies": {
    // Testing
    "@nestjs/testing": "^10.4.11",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.14",
    "ts-jest": "^29.2.5",
    "supertest": "^7.0.0",
    "@types/supertest": "^6.0.2",

    // Linting
    "eslint": "^9.15.0",
    "@typescript-eslint/eslint-plugin": "^8.15.0",
    "@typescript-eslint/parser": "^8.15.0",
    "prettier": "^3.3.3",

    // Build
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0"
  }
}
```

---

## 🏗️ Architecture Stack

### Monorepo Management

```bash
# Package Manager
pnpm v9.14.4

# Monorepo Tool
turbo v2.3.1

# Workspace Structure
pnpm-workspace.yaml
turbo.json
```

### Infrastructure

```yaml
# Containerization
Docker: v27.0.0+
Docker Compose: v2.29.0+

# Orchestration (Production)
Kubernetes: v1.30+
Helm: v3.15+

# CI/CD
GitHub Actions: latest

# Infrastructure as Code
Terraform: v1.9+
```

---

## 🗄️ Database & Storage

### Primary Database

```yaml
PostgreSQL: v16.4
# Extensions
- uuid-ossp
- pgcrypto
- pg_trgm (full-text search)
```

### ORM

```yaml
Prisma: v6.0.1
# Features
- Type-safe queries
- Migrations
- Seeding
- Client generation
```

### Caching

```yaml
Redis: v7.4
# Use cases
- Session storage
- API caching
- Rate limiting
- Job queues
```

### Search

```yaml
Elasticsearch: v8.15
# or
Meilisearch: v1.10 (lighter alternative)
# Use cases
- Course search
- Problem search
- Full-text search
```

### Vector Database

```yaml
Pinecone: Cloud (latest)
# or
Qdrant: v1.12 (self-hosted)
# Use cases
- AI embeddings
- Semantic search
- Recommendation engine
```

### Object Storage

```yaml
AWS S3
# or
Cloudflare R2 (S3-compatible, cheaper)
# Use cases
- Video storage
- Course materials
- User uploads
- Static assets
```

---

## 🎨 UI/UX Libraries

### Component Library

```bash
# shadcn/ui (Radix UI + Tailwind)
npx shadcn@latest init

# Components
- Button
- Dialog
- Dropdown Menu
- Select
- Tabs
- Tooltip
- Card
- Avatar
- Badge
- Input
- Textarea
- ... 50+ components
```

### Styling

```json
{
  "tailwindcss": "^3.4.15",
  "tailwindcss-animate": "^1.0.7",
  "tailwind-scrollbar-hide": "^1.1.7"
}
```

### Icons

```json
{
  "lucide-react": "^0.462.0"
  // 1400+ consistent icons
}
```

### Animation

```json
{
  "framer-motion": "^11.13.1",
  // Declarative animations
  // Server-driven variants
}
```

### Charts

```json
{
  "recharts": "^2.14.1",
  // Declarative charts
  // Responsive
  // Server-driven configs
}
```

---

## 🔧 Developer Tools

### Code Quality

```json
{
  "eslint": "^9.15.0",
  "prettier": "^3.3.3",
  "husky": "^9.1.7",
  "lint-staged": "^15.2.11",
  "commitlint": "^19.6.1",
  "@commitlint/config-conventional": "^19.6.0"
}
```

### Testing

```json
{
  // Unit & Integration
  "vitest": "^2.1.8",
  "@testing-library/react": "^16.0.1",

  // E2E
  "playwright": "^1.49.1",

  // API Testing
  "supertest": "^7.0.0",

  // Coverage
  "@vitest/coverage-v8": "^2.1.8"
}
```

### Documentation

```json
{
  "typedoc": "^0.26.11",
  "@compodoc/compodoc": "^1.1.26",
  "swagger-ui-express": "^5.0.1",
  "@nestjs/swagger": "^8.0.3"
}
```

---

## 🚀 Deployment Stack

### Frontend Hosting

```yaml
Vercel:
  version: latest
  features:
    - Edge Functions
    - Image Optimization
    - Analytics
    - Preview Deployments
    - Serverless Functions

# Alternative
Netlify:
  version: latest
```

### Backend Hosting

```yaml
# Option 1: AWS ECS
AWS ECS Fargate:
  - Auto-scaling
  - Load balancing
  - Container management

# Option 2: Railway
Railway:
  version: latest
  features:
    - Easy deployment
    - Automatic HTTPS
    - Database included

# Option 3: Kubernetes
AWS EKS / Google GKE:
  - Full control
  - Scalability
```

### Database Hosting

```yaml
# PostgreSQL
AWS RDS PostgreSQL: v16.4
# or
Neon: latest (serverless)
# or
Supabase: latest (includes auth, storage)

# Redis
AWS ElastiCache: v7.1
# or
Upstash Redis: latest (serverless)
```

### CDN

```yaml
Cloudflare:
  version: latest
  features:
    - Global CDN
    - DDoS protection
    - WAF
    - R2 storage
```

---

## 🔐 Security & Auth

### Authentication

```json
{
  "@nestjs/jwt": "^10.2.0",
  "@nestjs/passport": "^10.0.3",
  "passport-jwt": "^4.0.1",
  "passport-google-oauth20": "^2.0.0",
  "passport-github2": "^0.1.12"
}
```

### Security Headers

```json
{
  "helmet": "^8.0.0"
}
```

### CORS

```json
{
  "@nestjs/common": "^10.4.11"
  // Built-in CORS support
}
```

### Rate Limiting

```json
{
  "@nestjs/throttler": "^6.2.1"
}
```

---

## 📊 Monitoring & Analytics

### Application Monitoring

```yaml
Sentry:
  version: "^8.40.0"
  features:
    - Error tracking
    - Performance monitoring
    - Session replay
```

### APM (Application Performance Monitoring)

```yaml
# Option 1
Datadog:
  features:
    - Logs
    - Metrics
    - Traces
    - Dashboards

# Option 2 (lighter)
New Relic:
  features:
    - APM
    - Browser monitoring
    - Synthetics
```

### Product Analytics

```yaml
PostHog:
  version: "^1.181.0"
  features:
    - Feature flags
    - A/B testing
    - Product analytics
    - Session recording
```

### Logging

```json
{
  "winston": "^3.17.0",
  "nest-winston": "^1.10.0"
}
```

---

## 🎥 Video Platform

### Video Hosting & Streaming

```yaml
# Option 1 (Recommended)
Mux:
  version: latest
  features:
    - Adaptive streaming
    - Analytics
    - Thumbnails
    - DRM support

# Option 2
Cloudflare Stream:
  version: latest
  features:
    - Simple pricing
    - Good performance

# Option 3 (Self-hosted)
AWS MediaConvert + CloudFront:
  - Full control
  - More complex setup
```

### Video Player

```json
{
  "@mux/mux-player-react": "^2.12.2",
  // or
  "video.js": "^8.21.1",
  "videojs-contrib-quality-levels": "^4.1.0",
  "videojs-http-source-selector": "^1.1.6"
}
```

---

## 🤖 AI & Machine Learning

### LLM Integration

```json
{
  "openai": "^4.76.0",
  "@anthropic-ai/sdk": "^0.32.1",
  "langchain": "^0.3.7",
  "@langchain/openai": "^0.3.14",
  "@langchain/anthropic": "^0.3.8"
}
```

### Vector Database

```json
{
  "@pinecone-database/pinecone": "^4.0.0"
}
```

### ML Utilities

```json
{
  "compromise": "^14.14.3",  // NLP
  "natural": "^8.0.1",       // Natural language processing
  "ml-distance": "^4.0.1"    // Similarity calculations
}
```

---

## ⚡ Code Execution

### Docker Management

```json
{
  "dockerode": "^4.0.2"
}
```

### Judge0 API (Alternative)

```yaml
Judge0:
  version: v1.13.1
  deployment: self-hosted or cloud
  languages: 60+
```

---

## 💳 Payments

```json
{
  "stripe": "^17.4.0"
}
```

---

## 📧 Email

```json
{
  "resend": "^4.0.1",
  // or
  "@sendgrid/mail": "^8.1.4",
  // or
  "nodemailer": "^6.9.16"
}
```

---

## 🔄 Real-time Communication

```json
{
  "socket.io": "^4.8.1",
  "socket.io-client": "^4.8.1",
  "@nestjs/websockets": "^10.4.11",
  "@nestjs/platform-socket.io": "^10.4.11"
}
```

---

## 📱 Progressive Web App (PWA)

```json
{
  "next-pwa": "^5.6.0",
  "workbox-webpack-plugin": "^7.3.0"
}
```

---

## 🌐 Internationalization (Future)

```json
{
  "next-intl": "^3.26.2",
  "date-fns": "^4.1.0"  // For date localization
}
```

---

## 📦 Build & Bundling

### Next.js Built-in (Turbopack)

```yaml
Next.js 15:
  bundler: Turbopack (default)
  features:
    - Fast refresh
    - Tree shaking
    - Code splitting
    - Image optimization
```

### Turborepo

```json
{
  "turbo": "^2.3.1"
}
```

Configuration:
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "outputs": [],
      "cache": false
    }
  }
}
```

---

## 🔧 Utilities

### Date & Time

```json
{
  "date-fns": "^4.1.0"
}
```

### ID Generation

```json
{
  "nanoid": "^5.0.9",
  "uuid": "^11.0.3"
}
```

### Validation

```json
{
  "zod": "^3.23.8"
}
```

### HTTP Client

```json
{
  "axios": "^1.7.9",
  "ky": "^1.7.3"  // Modern fetch wrapper
}
```

---

## 📋 Complete Installation Commands

### Initialize Project

```bash
# Create monorepo
mkdir ai-learning-platform
cd ai-learning-platform

# Initialize PNPM workspace
pnpm init

# Create workspace config
cat > pnpm-workspace.yaml << EOF
packages:
  - 'apps/*'
  - 'services/*'
  - 'packages/*'
EOF

# Initialize Turbo
pnpm add turbo -Dw
pnpm exec turbo init

# Create Next.js app
cd apps
pnpm create next-app@latest web --typescript --tailwind --app --use-pnpm

# Create NestJS app
cd ../services
pnpm nest new auth-service --package-manager pnpm

# Install shared dependencies
cd ../
pnpm add -Dw @types/node typescript prettier eslint

# Install Prisma
cd packages
mkdir database
cd database
pnpm add prisma @prisma/client
pnpm exec prisma init
```

### Install All Frontend Dependencies

```bash
cd apps/web

# Core
pnpm add react@19.2.0 react-dom@19.2.0 next@latest

# UI & Styling
pnpm add tailwindcss postcss autoprefixer
pnpm add class-variance-authority clsx tailwind-merge
pnpm add lucide-react

# shadcn/ui
pnpm dlx shadcn@latest init

# State & Data Fetching
pnpm add zustand @tanstack/react-query

# Forms
pnpm add react-hook-form @hookform/resolvers zod

# Code Editor
pnpm add @monaco-editor/react monaco-editor

# Terminal
pnpm add @xterm/xterm @xterm/addon-fit @xterm/addon-web-links

# Charts
pnpm add recharts

# Animation
pnpm add framer-motion

# Real-time
pnpm add socket.io-client

# Analytics & Monitoring
pnpm add posthog-js @sentry/nextjs

# Utilities
pnpm add date-fns nanoid

# Dev Dependencies
pnpm add -D vitest @testing-library/react @playwright/test
pnpm add -D prettier prettier-plugin-tailwindcss
pnpm add -D @types/react@19.2.0 @types/react-dom@19.2.0
```

### Install All Backend Dependencies

```bash
cd services/auth-service

# NestJS Core
pnpm add @nestjs/common @nestjs/core @nestjs/platform-express

# Database
pnpm add @prisma/client
pnpm add -D prisma

# Auth
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt
pnpm add passport-google-oauth20 passport-github2
pnpm add bcrypt
pnpm add -D @types/bcrypt @types/passport-jwt

# Validation
pnpm add class-validator class-transformer

# Redis & Caching
pnpm add ioredis @nestjs/cache-manager cache-manager
pnpm add -D @types/ioredis

# Configuration
pnpm add @nestjs/config dotenv

# Logging
pnpm add winston nest-winston

# Real-time
pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io

# AWS
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Email
pnpm add resend

# Payments
pnpm add stripe

# AI
pnpm add openai @anthropic-ai/sdk langchain @langchain/openai

# Code Execution
pnpm add dockerode
pnpm add -D @types/dockerode

# Utilities
pnpm add uuid dayjs
pnpm add -D @types/uuid

# Testing
pnpm add -D @nestjs/testing jest ts-jest supertest
pnpm add -D @types/jest @types/supertest
```

---

## 🎯 Version Update Strategy

### Staying Up-to-Date

```bash
# Check for updates
pnpm outdated

# Update all dependencies to latest
pnpm up --latest

# Update specific package
pnpm up react@latest

# Update with interactive mode (recommended)
pnpm up -i --latest
```

### Automated Updates (GitHub Actions)

```yaml
# .github/workflows/update-dependencies.yml
name: Update Dependencies

on:
  schedule:
    - cron: '0 0 * * 1'  # Every Monday
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: Update dependencies
        run: |
          pnpm up -i --latest
          pnpm test

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          title: 'chore: update dependencies'
          commit-message: 'chore: update dependencies'
          branch: update-dependencies
```

---

## 📊 Version Compatibility Matrix

| Category | Package | Minimum | Recommended |
|----------|---------|---------|-------------|
| Runtime | Node.js | 18.17.0 | 22.11.0 |
| Package Manager | PNPM | 8.0.0 | 9.14.4 |
| Frontend | React | 19.0.0 | 19.2.0 |
| Frontend | Next.js | 15.0.0 | 15.0.3 |
| Backend | NestJS | 10.0.0 | 10.4.11 |
| Database | PostgreSQL | 15.0 | 16.4 |
| Cache | Redis | 7.0 | 7.4 |
| ORM | Prisma | 5.0.0 | 6.0.1 |

---

**Always use latest stable versions for security and performance!** 🚀
