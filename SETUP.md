# 🚀 AI-Based Learning Platform - Setup Guide

Complete guide to set up and run the AI-Based Learning Platform.

## 📋 Prerequisites

- **Node.js**: v20.18.0 or higher
- **pnpm**: v9.15.1 or higher
- **Docker** & **Docker Compose**: Latest version (for databases)
- **PostgreSQL**: 16+ (if running locally without Docker)
- **Redis**: 7+ (if running locally without Docker)

## 🛠️ Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure your environment variables (see [Configuration](#configuration) below).

### 3. Start Databases (Using Docker)

Start PostgreSQL, Redis, and other infrastructure services:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This starts:

- **PostgreSQL** on port `5432`
- **Redis** on port `6379`
- **Meilisearch** on port `7700`
- **Mailpit** (Email testing UI) on port `8025`
- **pgAdmin** (PostgreSQL GUI) on port `5050`
- **Redis Commander** (Redis GUI) on port `8081`

### 4. Run Database Migrations

```bash
# For each service that uses Prisma
cd services/auth-service
pnpm prisma migrate dev

cd ../analytics-service
pnpm prisma migrate dev

# Repeat for other services...
```

### 5. Start All Services

#### Option A: Start All at Once (Recommended for Development)

```bash
chmod +x start-all-services.sh
./start-all-services.sh
```

#### Option B: Start Services Individually

**Frontend:**

```bash
cd apps/web
pnpm dev
```

**Backend Services:**

```bash
# Auth Service (Port 3002)
cd services/auth-service
pnpm dev

# Analytics Service (Port 3003)
cd services/analytics-service
pnpm dev

# AI Service (Port 3004)
cd services/ai-service
pnpm dev

# Continue for other services...
```

### 6. Stop All Services

```bash
chmod +x stop-all-services.sh
./stop-all-services.sh
```

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/learning_platform
REDIS_URL=redis://:redis123@localhost:6379

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=your-jwt-secret-min-32-characters
NEXTAUTH_SECRET=your-nextauth-secret-min-32-characters

# Frontend URLs
NEXT_PUBLIC_API_URL=http://localhost:3003
FRONTEND_URL=http://localhost:3000

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Optional: AI Services
OPENAI_API_KEY=sk-your-openai-api-key
```

### OAuth Setup (Optional)

To enable social login:

1. **Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create credentials → OAuth 2.0 Client ID
   - Add redirect URI: `http://localhost:3002/auth/google/callback`

2. **GitHub OAuth:**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create new OAuth app
   - Add callback URL: `http://localhost:3002/auth/github/callback`

## 🏗️ Architecture

### Service Ports

| Service              | Port | Description                    |
| -------------------- | ---- | ------------------------------ |
| Web Frontend         | 3000 | Main Next.js application       |
| API Gateway          | 3001 | Central API gateway            |
| Auth Service         | 3002 | Authentication & authorization |
| Analytics Service    | 3003 | Analytics & reporting          |
| AI Service           | 3004 | AI-powered features            |
| Assessment Service   | 3005 | Quizzes & assessments          |
| Bootcamp Service     | 3006 | Bootcamp management            |
| Course Service       | 3007 | Course management              |
| Notification Service | 3008 | Email & push notifications     |
| Payment Service      | 3009 | Payment processing             |
| Code Execution       | 3010 | Code running sandbox           |
| Terminal Service     | 3011 | Web terminal                   |
| Recommendation       | 3012 | Content recommendations        |

### Database Ports

| Service     | Port | Credentials           |
| ----------- | ---- | --------------------- |
| PostgreSQL  | 5432 | postgres/postgres123  |
| Redis       | 6379 | Password: redis123    |
| Meilisearch | 7700 | Master key: masterKey |

### Admin Tools

| Tool               | Port | Credentials                 |
| ------------------ | ---- | --------------------------- |
| Mailpit (Email UI) | 8025 | No auth required            |
| pgAdmin            | 5050 | admin@localhost.com / admin |
| Redis Commander    | 8081 | No auth required            |

## 🧪 Testing

### E2E Tests

Run end-to-end tests with Playwright:

```bash
cd apps/web
pnpm test:e2e
```

Run tests in UI mode:

```bash
pnpm test:e2e:ui
```

### Unit Tests

Run unit tests for a specific service:

```bash
cd services/auth-service
pnpm test
```

### Integration Tests

```bash
pnpm test:integration
```

## 📊 Monitoring

### Health Checks

Check service health:

```bash
# Frontend
curl http://localhost:3000/api/health

# Auth Service
curl http://localhost:3002/health

# Analytics Service
curl http://localhost:3003/health
```

### Logs

View service logs:

```bash
# Using the script (if started with start-all-services.sh)
tail -f logs/auth-service.log
tail -f logs/analytics-service.log

# Or view all logs
ls -la logs/
```

## 🔍 Troubleshooting

### Port Already in Use

If a port is already in use:

```bash
# Find process using the port
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)
```

### Database Connection Issues

1. Ensure Docker containers are running:

   ```bash
   docker ps
   ```

2. Check PostgreSQL is accessible:

   ```bash
   docker exec -it learning-platform-db-dev psql -U postgres
   ```

3. Check Redis is accessible:
   ```bash
   docker exec -it learning-platform-redis-dev redis-cli -a redis123 ping
   ```

### Dependency Issues

Clear and reinstall dependencies:

```bash
pnpm clean
rm -rf node_modules
pnpm install
```

### Type Checking Errors

Run type checking:

```bash
pnpm type-check
```

Fix auto-fixable issues:

```bash
pnpm lint --fix
```

## 📦 Production Deployment

### Using Docker Compose

Build and start all services in production mode:

```bash
docker-compose up -d
```

This starts all backend services, frontend, and databases.

### Environment Variables for Production

Update `.env` with production values:

```bash
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=strong-random-secret-min-32-chars
NEXTAUTH_SECRET=another-strong-secret
```

### Database Migrations

Run migrations in production:

```bash
cd services/auth-service
pnpm prisma migrate deploy
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `pnpm test`
4. Run type checking: `pnpm type-check`
5. Submit a pull request

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Documentation](https://docs.docker.com/)

## 🆘 Getting Help

- Check the logs in `logs/` directory
- Review service health endpoints
- Check Docker container status: `docker ps`
- View container logs: `docker logs <container-name>`

---

**Happy Coding! 🎉**
