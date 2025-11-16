# 🚀 AI Learning Platform - Setup Guide

Complete setup guide for the AI-based learning platform authentication system.

---

## 📋 Prerequisites

Make sure you have the following installed:

- **Node.js**: >= 18.17.0 (Recommended: 22.11.0)
- **PNPM**: >= 9.0.0
- **Docker**: >= 27.0.0 (for local development)
- **Docker Compose**: >= 2.29.0
- **PostgreSQL**: 16.4+ (or use Docker)
- **Redis**: 7.4+ (or use Docker)

---

## 🏗️ Project Structure

```
ai-learning-platform/
├── apps/
│   └── web/                    # Next.js frontend
├── services/
│   └── auth-service/           # NestJS auth service
├── packages/
│   ├── database/               # Prisma schema
│   └── shared-types/           # Shared TypeScript types
├── infrastructure/
│   └── docker/                 # Dockerfiles
├── docker-compose.yml
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## 🛠️ Quick Start (Docker)

### 1. Clone the repository

```bash
git clone <repository-url>
cd ai-learning-platform
```

### 2. Copy environment variables

```bash
cp .env.example .env
```

### 3. Update environment variables

Edit `.env` and configure:

- Database credentials
- Redis URL
- JWT secret (change from default!)
- OAuth credentials (Google, GitHub, LinkedIn)
- Email service (Resend API key)
- CAPTCHA keys (optional)
- SAML configuration (optional)

### 4. Start services with Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Auth Service (port 3001)
- Next.js Web (port 3000)

### 5. Run database migrations

```bash
cd packages/database
pnpm db:migrate
```

### 6. Access the application

- **Frontend**: http://localhost:3000
- **Auth API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

---

## 💻 Local Development (Without Docker)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start PostgreSQL and Redis

Either use Docker:
```bash
docker-compose up postgres redis -d
```

Or install locally and start the services.

### 3. Set up database

```bash
cd packages/database
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
```

### 4. Start development servers

```bash
# Start all services (root directory)
pnpm dev

# Or start individually:
cd services/auth-service && pnpm dev  # Auth service on :3001
cd apps/web && pnpm dev                # Next.js on :3000
```

---

## 🔐 Authentication Features Implemented

### ✅ Phase 1: Core Authentication
- [x] User registration with email verification
- [x] Login with JWT tokens (15min access, 7 day refresh)
- [x] Password hashing with bcrypt (10 rounds)
- [x] Password reset flow with tokens
- [x] Session management with Redis
- [x] Rate limiting on auth endpoints

### ✅ Phase 2: OAuth Integration
- [x] Google OAuth 2.0
- [x] GitHub OAuth
- [x] LinkedIn OAuth
- [x] Account linking (merge OAuth with email accounts)
- [x] OAuth account management

### ✅ Phase 3: RBAC & Permissions
- [x] Role-based access control (student, instructor, admin, mentor)
- [x] Permission system for resources
- [x] NestJS route guards
- [x] Next.js middleware for frontend protection
- [x] API authorization middleware

### ✅ Phase 4: Enterprise Auth
- [x] SAML integration for enterprise SSO
- [x] OpenID Connect support
- [x] Multi-tenant isolation
- [x] Custom domain authentication
- [x] Team/organization management

### ✅ Phase 5: Security Hardening
- [x] 2FA (TOTP with authenticator apps)
- [x] CAPTCHA on signup/login (Google reCAPTCHA v3)
- [x] Security headers (Helmet.js)
- [x] CSRF protection
- [x] SQL injection prevention (Prisma parameterized queries)
- [x] XSS protection (input sanitization)

---

## 📡 API Endpoints

### Authentication

```
POST   /auth/register              # Register new user
GET    /auth/verify-email?token=   # Verify email
POST   /auth/login                 # Login
POST   /auth/refresh               # Refresh access token
POST   /auth/logout                # Logout
POST   /auth/forgot-password       # Request password reset
POST   /auth/reset-password        # Reset password
GET    /auth/me                    # Get current user
```

### OAuth

```
GET    /auth/google                # Google OAuth
GET    /auth/google/callback       # Google callback
GET    /auth/github                # GitHub OAuth
GET    /auth/github/callback       # GitHub callback
GET    /auth/linkedin              # LinkedIn OAuth
GET    /auth/linkedin/callback     # LinkedIn callback
```

### 2FA

```
GET    /auth/2fa/generate          # Generate 2FA secret
POST   /auth/2fa/enable            # Enable 2FA
POST   /auth/2fa/disable           # Disable 2FA
```

### SAML SSO

```
GET    /auth/saml/:org             # SAML login
POST   /auth/saml/:org/callback    # SAML callback
```

Full API documentation: http://localhost:3001/api/docs

---

## 🧪 Testing

### Run tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

---

## 🔒 Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Configure OAuth credentials
- [ ] Set up HTTPS in production
- [ ] Enable CAPTCHA for public endpoints
- [ ] Configure SAML for enterprise customers
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting
- [ ] Configure email service
- [ ] Set up monitoring (Sentry)
- [ ] Enable database backups
- [ ] Configure Redis persistence

---

## 📚 Environment Variables

### Required

```bash
DATABASE_URL                # PostgreSQL connection string
REDIS_URL                   # Redis connection string
JWT_SECRET                  # Secret for JWT signing (CHANGE THIS!)
FRONTEND_URL                # Frontend URL for CORS
```

### Optional (OAuth)

```bash
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL

GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GITHUB_CALLBACK_URL

LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET
LINKEDIN_CALLBACK_URL
```

### Optional (Email)

```bash
RESEND_API_KEY              # Resend email service
SMTP_HOST                   # Or use SMTP
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
SMTP_FROM
```

### Optional (Security)

```bash
RECAPTCHA_SITE_KEY
RECAPTCHA_SECRET_KEY
```

### Optional (Enterprise)

```bash
SAML_ENTRY_POINT
SAML_ISSUER
SAML_CERT
```

---

## 🚢 Deployment

### Build for production

```bash
pnpm build
```

### Docker production build

```bash
docker-compose -f docker-compose.prod.yml up --build
```

### Deploy to cloud

- **Frontend**: Vercel / Netlify
- **Backend**: AWS ECS / Railway / Render
- **Database**: AWS RDS / Neon / Supabase
- **Redis**: AWS ElastiCache / Upstash

---

## 📖 Additional Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [TECH_STACK.md](./TECH_STACK.md) - Technology stack
- [BEST_PRACTICES.md](./BEST_PRACTICES.md) - Coding standards
- [DATABASE_SCHEMA.sql](./DATABASE_SCHEMA.sql) - Database schema
- [AI_AGENT_TASKS.md](./AI_AGENT_TASKS.md) - Development tasks

---

## 🐛 Troubleshooting

### Port already in use

```bash
# Find process using port 3001
lsof -i :3001
# Kill process
kill -9 <PID>
```

### Database connection error

```bash
# Check if PostgreSQL is running
docker-compose ps postgres
# View logs
docker-compose logs postgres
```

### Prisma client not generated

```bash
cd packages/database
pnpm db:generate
```

### Redis connection error

```bash
# Check Redis
docker-compose ps redis
docker-compose logs redis
```

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Run linting: `pnpm lint`
5. Run tests: `pnpm test`
6. Create a pull request

---

## 📄 License

MIT License

---

**Questions?** Check the documentation or create an issue.

**Status**: ✅ All Agent 3 authentication tasks completed!
