# Docker Setup Guide

This guide explains how to run the AI-Based Learning Platform using Docker.

## 📋 Prerequisites

- Docker Engine 24.0+ ([Install Docker](https://docs.docker.com/get-docker/))
- Docker Compose 2.20+ (included with Docker Desktop)
- 8GB+ RAM available for Docker
- 20GB+ free disk space

## 🚀 Quick Start

### Option 1: Development Mode (Recommended for Development)

Infrastructure services in Docker + Application services with hot reload:

```bash
# Start infrastructure (PostgreSQL, Redis, etc.)
./scripts/docker-start.sh
# Choose option 1

# In another terminal, start app services with hot reload
pnpm dev
```

This gives you:
- Infrastructure in Docker containers
- Application code running locally with hot reload
- Fast development iteration

### Option 2: Production Mode (Full Docker)

All services running in Docker containers:

```bash
# Start everything in Docker
./scripts/docker-start.sh
# Choose option 2

# Wait for build (5-10 minutes first time)
# Access services once ready
```

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `./scripts/docker-start.sh` | Interactive startup - choose dev or prod mode |
| `./scripts/docker-stop.sh` | Stop all running containers |
| `./scripts/docker-clean.sh` | Remove all volumes and data (⚠️ destructive) |
| `./scripts/docker-logs.sh [service]` | View logs for all or specific service |

## 🌐 Service Ports

### Applications
- **Web App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001
- **API Gateway**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api/docs

### Microservices
- **Auth Service**: http://localhost:3002
- **Course Service**: http://localhost:3003
- **AI Service**: http://localhost:3004
- **Code Runner**: http://localhost:3005
- **Assessment Service**: http://localhost:3006
- **Payment Service**: http://localhost:3007
- **Notification Service**: http://localhost:3008
- **Analytics Service**: http://localhost:3009
- **Recommendation Service**: http://localhost:3010
- **Bootcamp Service**: http://localhost:3011
- **Terminal Service**: http://localhost:3012
- **Code Execution Service**: http://localhost:3013

### Infrastructure
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Meilisearch**: http://localhost:7700
- **Mailpit (Email UI)**: http://localhost:8025
- **pgAdmin**: http://localhost:5050 (dev mode only)
- **Redis Commander**: http://localhost:8081 (dev mode only)

## 🔧 Manual Docker Commands

### Development Mode

```bash
# Start infrastructure only
docker-compose -f docker-compose.dev.yml up -d

# Stop infrastructure
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Restart specific service
docker-compose -f docker-compose.dev.yml restart postgres
```

### Production Mode

```bash
# Build and start all services
docker-compose up -d --build

# Start without rebuilding
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f web
docker-compose logs -f api-gateway

# Restart specific service
docker-compose restart web

# Scale a service (e.g., run 3 instances of web)
docker-compose up -d --scale web=3
```

## 🗃️ Database Management

### Run Migrations

```bash
# Development mode (pnpm dev running)
pnpm prisma:migrate

# Production mode (Docker)
docker-compose exec api-gateway npx prisma migrate deploy
```

### Seed Database

```bash
# Development mode
pnpm db:seed

# Production mode
docker-compose exec api-gateway npm run db:seed
```

### Access Database

```bash
# Via psql CLI
docker-compose exec postgres psql -U postgres -d learning_platform

# Via pgAdmin (dev mode)
# Open http://localhost:5050
# Login: admin@localhost.com / admin
# Add server: postgres / postgres / postgres123

# Via Prisma Studio
docker-compose exec api-gateway npx prisma studio
```

## 🐛 Debugging

### Check Service Health

```bash
# Check all running containers
docker ps

# Check health status
docker-compose ps

# Inspect specific service
docker inspect learning-platform-web
```

### Access Service Shell

```bash
# Access web app shell
docker-compose exec web sh

# Access API gateway shell
docker-compose exec api-gateway sh

# Access database shell
docker-compose exec postgres sh
```

### View Resource Usage

```bash
# See CPU, Memory, Network usage
docker stats

# See only platform services
docker stats $(docker ps --filter name=learning-platform --format "{{.Names}}")
```

## 🔄 Updating Services

### Update Single Service

```bash
# Rebuild and restart single service
docker-compose up -d --build --no-deps web

# --no-deps prevents restarting dependencies
```

### Update All Services

```bash
# Rebuild all and restart
docker-compose up -d --build

# Or stop, rebuild, start
docker-compose down
docker-compose build
docker-compose up -d
```

## 🧹 Cleanup

### Remove Stopped Containers

```bash
docker container prune
```

### Remove Unused Images

```bash
docker image prune -a
```

### Remove Unused Volumes

```bash
docker volume prune
```

### Full Cleanup (⚠️ Removes all data)

```bash
./scripts/docker-clean.sh
# Or manually:
docker-compose down -v
docker volume rm $(docker volume ls -q | grep learning-platform)
```

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
# Database
DB_USER=postgres
DB_PASSWORD=postgres123
DB_NAME=learning_platform

# Redis
REDIS_PASSWORD=redis123

# JWT
JWT_SECRET=your-secret-key-min-32-characters

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI (for AI features)
OPENAI_API_KEY=sk-...

# Meilisearch
MEILISEARCH_API_KEY=masterKey

# pgAdmin (dev mode)
PGADMIN_EMAIL=admin@localhost.com
PGADMIN_PASSWORD=admin
```

## 🏗️ Architecture

### Multi-Stage Builds

Our Dockerfiles use multi-stage builds for optimal image size:

1. **base**: Node.js + pnpm setup
2. **deps**: Install dependencies
3. **builder**: Build application
4. **runner**: Minimal production image

### Networking

All services communicate via the `learning-platform-network` bridge network.

Internal service communication uses service names:
- `http://api-gateway:3000`
- `postgres:5432`
- `redis:6379`

### Volumes

Persistent data is stored in named volumes:
- `postgres_data`: Database data
- `redis_data`: Redis persistence
- `meilisearch_data`: Search index

## 🚨 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000
# Or on Linux
sudo netstat -tulpn | grep 3000

# Kill process
kill -9 <PID>
```

### Out of Disk Space

```bash
# Check Docker disk usage
docker system df

# Clean up
docker system prune -a --volumes
```

### Container Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Check events
docker events

# Inspect container
docker inspect <container-name>
```

### Build Fails

```bash
# Clean build cache
docker builder prune

# Rebuild without cache
docker-compose build --no-cache

# Check BuildKit logs
BUILDKIT_PROGRESS=plain docker-compose build
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Best Practices for Writing Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

## 🆘 Getting Help

If you encounter issues:

1. Check logs: `./scripts/docker-logs.sh`
2. Verify environment: `docker-compose config`
3. Check health: `docker-compose ps`
4. Clean restart: `./scripts/docker-clean.sh` then `./scripts/docker-start.sh`

For persistent issues, please create an issue on GitHub.
