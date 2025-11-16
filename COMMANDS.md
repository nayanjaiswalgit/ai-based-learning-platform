# 🎮 Command Reference Guide

Quick reference for all commands you'll need.

## 🚀 Initial Setup

### One-Time Setup (New Developer)
```bash
# Run the automated setup script
./setup.sh
```

This will:
- Install Docker, Node.js, pnpm (if needed)
- Create `.env` with secure secrets
- Start Docker containers
- Install dependencies
- Setup database
- Create helper scripts

---

## 🔧 Daily Development Commands

### Start Everything
```bash
# Option 1: Use helper script (recommended)
./start.sh

# Option 2: Manual
docker-compose up -d        # Start infrastructure
pnpm dev                    # Start all dev servers
```

### Stop Everything
```bash
# Option 1: Use helper script
./stop.sh

# Option 2: Manual
docker-compose down         # Stop infrastructure
# Ctrl+C to stop dev servers
```

### View Logs
```bash
# All Docker services
./logs.sh

# Specific service
./logs.sh postgres
./logs.sh redis
./logs.sh meilisearch

# Follow logs in real-time
docker-compose logs -f

# Application logs (in terminal running pnpm dev)
# Just check the terminal output
```

---

## 🗄️ Database Commands

### Reset Database (Delete All Data)
```bash
./reset.sh
```

### Manual Database Operations
```bash
# Navigate to database package
cd packages/database

# Generate Prisma Client
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Create migration
pnpm db:migrate

# Seed database
pnpm db:seed

# Open Prisma Studio (Database GUI)
pnpm db:studio
```

### Database Access
```bash
# Using Docker
docker exec -it learning-platform-db psql -U postgres -d learning_platform

# Using pgAdmin (if running with --profile tools)
# Open: http://localhost:5050
# Email: admin@localhost.com
# Password: admin
```

---

## 📦 Package Management

### Install Dependencies
```bash
# Install all packages
pnpm install

# Install for specific workspace
pnpm --filter @learning-platform/web add package-name
pnpm --filter auth-service add package-name
pnpm --filter @repo/database add package-name
```

### Update Dependencies
```bash
# Update all dependencies
pnpm update

# Update specific package
pnpm update package-name

# Check outdated packages
pnpm outdated
```

### Clean Install
```bash
# Remove node_modules and reinstall
pnpm clean
rm -rf node_modules
pnpm install
```

---

## 🏗️ Build Commands

### Build All
```bash
pnpm build
```

### Build Specific Package
```bash
pnpm --filter @repo/database build
pnpm --filter @learning-platform/web build
pnpm --filter auth-service build
```

### Production Build
```bash
NODE_ENV=production pnpm build
```

---

## 🧪 Testing Commands

### Run Tests
```bash
# All tests
pnpm test

# Specific package
pnpm --filter @learning-platform/web test
pnpm --filter auth-service test

# Watch mode
pnpm test --watch

# Coverage
pnpm test --coverage
```

### Integration Tests
```bash
pnpm test:integration
```

---

## 🔍 Linting & Formatting

### Lint Code
```bash
# Lint all
pnpm lint

# Lint specific package
pnpm --filter @learning-platform/web lint

# Auto-fix
pnpm lint --fix
```

### Format Code
```bash
# Format all
pnpm format

# Format specific files
pnpm format "apps/web/**/*.{ts,tsx}"
```

### Type Check
```bash
# Check all types
pnpm type-check

# Check specific package
pnpm --filter @learning-platform/web type-check
```

---

## 🐳 Docker Commands

### Infrastructure Services

#### Start
```bash
# Basic services
docker-compose up -d

# With optional tools (pgAdmin, Redis Commander)
docker-compose --profile tools up -d

# Rebuild images
docker-compose up -d --build
```

#### Stop
```bash
docker-compose down

# Remove volumes (deletes data)
docker-compose down -v
```

#### Restart
```bash
docker-compose restart

# Restart specific service
docker-compose restart postgres
```

#### View Status
```bash
docker-compose ps
```

#### View Logs
```bash
# All services
docker-compose logs

# Follow logs
docker-compose logs -f

# Specific service
docker-compose logs postgres
docker-compose logs -f redis
```

#### Execute Commands in Container
```bash
# PostgreSQL
docker exec -it learning-platform-db psql -U postgres

# Redis
docker exec -it learning-platform-redis redis-cli

# Shell access
docker exec -it learning-platform-db sh
```

---

## 🌐 Accessing Services

### Web Applications
```bash
# Main web app
open http://localhost:3000

# Admin dashboard
open http://localhost:3001
```

### Infrastructure Services
```bash
# PostgreSQL (via pgAdmin)
open http://localhost:5050

# Redis Commander
open http://localhost:8081

# Meilisearch
open http://localhost:7700

# Mailpit (Email testing)
open http://localhost:8025
```

### Health Checks
```bash
# Check PostgreSQL
docker exec learning-platform-db pg_isready -U postgres

# Check Redis
docker exec learning-platform-redis redis-cli ping

# Check Meilisearch
curl http://localhost:7700/health
```

---

## 🔄 Git Workflow

### Branch Management
```bash
# Create feature branch
git checkout -b feature/my-feature

# Push to remote
git push -u origin feature/my-feature

# Pull latest changes
git pull origin main
```

### Commit Changes
```bash
# Stage changes
git add .

# Commit (will trigger pre-commit hooks)
git commit -m "feat: add new feature"

# Push
git push
```

### Conventional Commits
```bash
# Feature
git commit -m "feat: add user authentication"

# Bug fix
git commit -m "fix: resolve login issue"

# Documentation
git commit -m "docs: update README"

# Refactor
git commit -m "refactor: improve database queries"

# Test
git commit -m "test: add unit tests for auth"

# Chore
git commit -m "chore: update dependencies"
```

---

## 🛠️ Troubleshooting Commands

### Clear Everything and Restart
```bash
# Stop all services
./stop.sh

# Clean Docker
docker-compose down -v
docker system prune -a

# Clean node_modules
rm -rf node_modules apps/*/node_modules services/*/node_modules packages/*/node_modules

# Fresh install
pnpm install

# Restart
./start.sh
```

### Check Ports
```bash
# Check if port is in use
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :3000  # Web app
lsof -i :4000  # API (when running)

# Kill process on port
kill -9 $(lsof -t -i:3000)
```

### Docker Cleanup
```bash
# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune

# Remove all unused networks
docker network prune

# Clean everything
docker system prune -a --volumes
```

### Database Issues
```bash
# Reset database completely
./reset.sh

# Or manually
docker-compose down -v
docker-compose up -d postgres
cd packages/database
pnpm db:push --force-reset
pnpm db:seed
```

---

## 📊 Monitoring Commands

### Resource Usage
```bash
# Docker container stats
docker stats

# Disk usage
docker system df

# Database size
docker exec learning-platform-db psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('learning_platform'));"
```

### Process Monitoring
```bash
# Node processes
ps aux | grep node

# pnpm processes
ps aux | grep pnpm

# Docker processes
docker ps
```

---

## 🚀 Production Commands

### Build for Production
```bash
# Build all services
NODE_ENV=production pnpm build

# Build specific service
NODE_ENV=production pnpm --filter @learning-platform/web build
```

### Run Production Mode
```bash
# Start production build
pnpm start

# Or specific service
pnpm --filter @learning-platform/web start
```

### Deploy
```bash
# Deploy to Vercel (frontend)
vercel deploy

# Deploy to Railway (backend)
railway up

# Deploy to Kubernetes
kubectl apply -f k8s/
```

---

## 📝 Useful Shortcuts

### Aliases (Add to ~/.bashrc or ~/.zshrc)
```bash
# Setup aliases
alias lp-start="./start.sh"
alias lp-stop="./stop.sh"
alias lp-logs="./logs.sh"
alias lp-reset="./reset.sh"
alias lp-install="pnpm install"
alias lp-dev="pnpm dev"
alias lp-build="pnpm build"
alias lp-test="pnpm test"

# Docker aliases
alias dc="docker-compose"
alias dcu="docker-compose up -d"
alias dcd="docker-compose down"
alias dcl="docker-compose logs -f"
alias dcp="docker-compose ps"
```

After adding, reload shell:
```bash
source ~/.bashrc  # or ~/.zshrc
```

---

## 🎯 Common Workflows

### New Feature Development
```bash
# 1. Create branch
git checkout -b feature/my-feature

# 2. Start development
./start.sh

# 3. Make changes
# ... edit files ...

# 4. Test changes
pnpm lint
pnpm test

# 5. Commit
git add .
git commit -m "feat: add my feature"

# 6. Push
git push -u origin feature/my-feature
```

### Bug Fix
```bash
# 1. Create branch
git checkout -b fix/bug-description

# 2. Start services
./start.sh

# 3. Fix bug
# ... edit files ...

# 4. Test fix
pnpm test

# 5. Commit and push
git add .
git commit -m "fix: resolve bug description"
git push
```

### Database Schema Change
```bash
# 1. Edit schema
nano packages/database/prisma/schema.prisma

# 2. Push changes
cd packages/database
pnpm db:push

# 3. Regenerate client
pnpm db:generate

# 4. Test changes
cd ../..
pnpm dev
```

---

**For more help, see:**
- `QUICKSTART.md` - Getting started guide
- `MERGE_SUMMARY_AND_REMAINING_TASKS.md` - Project status
- `ARCHITECTURE.md` - System architecture
- Individual service READMEs in `services/*/README.md`
