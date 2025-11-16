# 🚀 Quick Start Guide

Get the AI-Based Learning Platform up and running in minutes!

## Prerequisites

- **Linux** (Ubuntu 20.04+, Debian 11+, or similar)
- **4GB+ RAM** recommended
- **10GB+ free disk space**

## One-Command Setup

Run this single command to set up everything:

```bash
./setup.sh
```

That's it! The script will:
- ✅ Install Docker, Node.js, and pnpm (if needed)
- ✅ Set up environment variables
- ✅ Start PostgreSQL, Redis, and Meilisearch
- ✅ Install all dependencies
- ✅ Initialize the database
- ✅ Generate Prisma client
- ✅ Create helper scripts

## What Gets Installed

### Automatic Installations
- **Docker** (if not present)
- **Node.js 20.x** via nvm (if not present)
- **pnpm 9.14.2** (if not present)
- **Git** (if not present)

### Docker Containers
- PostgreSQL 16.4 on port `5432`
- Redis 7.4 on port `6379`
- Meilisearch on port `7700`
- Mailpit (email testing) on port `8025`

## Starting Development

### Start Everything
```bash
./start.sh
```
Or manually:
```bash
pnpm dev
```

### Access the Application
- **Web App**: http://localhost:3000
- **Admin Panel**: http://localhost:3001
- **Mailpit UI**: http://localhost:8025 (view test emails)

### View Logs
```bash
./logs.sh
```
Or for specific service:
```bash
./logs.sh postgres
```

### Stop Everything
```bash
./stop.sh
```
Or manually:
```bash
docker-compose down
```

### Reset Database
```bash
./reset.sh
```
⚠️ This will delete all data!

## Optional Tools

Start additional admin tools:
```bash
docker-compose --profile tools up -d
```

This adds:
- **pgAdmin**: http://localhost:5050 (PostgreSQL GUI)
  - Email: `admin@localhost.com`
  - Password: `admin`
- **Redis Commander**: http://localhost:8081 (Redis GUI)

## Project Structure

```
ai-based-learning-platform/
├── apps/
│   ├── web/              # Next.js frontend (port 3000)
│   └── admin/            # Admin dashboard (port 3001)
├── services/
│   ├── auth-service/     # Authentication
│   ├── course-service/   # Course management
│   ├── payment-service/  # Payments & subscriptions
│   └── ... (10 services total)
├── packages/
│   ├── database/         # Prisma schema & utilities
│   ├── ui/               # Shared UI components
│   └── types/            # Shared TypeScript types
└── docker-compose.yml    # Infrastructure services
```

## Environment Variables

The setup script creates a `.env` file with secure random secrets.

To customize:
```bash
nano .env
```

### Required for Full Functionality
- `OPENAI_API_KEY` - For AI features
- `STRIPE_SECRET_KEY` - For payments
- `RESEND_API_KEY` - For email sending

See `.env.example` for all available options.

## Troubleshooting

### Docker Permission Denied
```bash
sudo usermod -aG docker $USER
# Log out and back in
```

### Port Already in Use
Check what's using the port:
```bash
sudo lsof -i :5432  # PostgreSQL
sudo lsof -i :6379  # Redis
sudo lsof -i :3000  # Web app
```

Kill the process or change the port in `docker-compose.yml`.

### Database Connection Error
Reset the database:
```bash
./reset.sh
```

### pnpm Install Fails
Clear cache and retry:
```bash
pnpm store prune
pnpm install
```

## Development Workflow

### 1. Make Changes
Edit files in `apps/`, `services/`, or `packages/`

### 2. Auto-Reload
All services have hot-reload enabled. Save and refresh!

### 3. Database Changes
```bash
cd packages/database
# Edit schema.prisma
pnpm db:push
pnpm db:generate
```

### 4. Add Dependencies
```bash
# For web app
pnpm --filter @learning-platform/web add package-name

# For a service
pnpm --filter auth-service add package-name

# For database package
pnpm --filter @repo/database add package-name
```

### 5. Run Tests
```bash
pnpm test
```

### 6. Lint & Format
```bash
pnpm lint
pnpm format
```

## Next Steps

1. **Read the docs**: Check `MERGE_SUMMARY_AND_REMAINING_TASKS.md` for current status
2. **Explore services**: Each service has its own README
3. **Check architecture**: See `ARCHITECTURE.md` for system design
4. **Review tasks**: See `AI_AGENT_TASKS.md` for development roadmap

## Getting Help

- **Documentation**: `README.md` and `docs/` folder
- **Issues**: Create a GitHub issue
- **Architecture**: See `ARCHITECTURE.md`
- **Tasks**: See `MERGE_SUMMARY_AND_REMAINING_TASKS.md`

## Production Deployment

For production deployment instructions, see:
- `docs/DEPLOYMENT.md` - Deployment guide
- `k8s/` - Kubernetes manifests
- `monitoring/` - Prometheus & Grafana setup

---

**Happy coding! 🚀**
