# Deployment Guide

Complete deployment guide for the AI-Based Learning Platform.

## Quick Start (Docker)

### Development

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f course-service

# Stop all services
docker-compose down
```

### Production

```bash
# Build production image
docker build -f services/course-service/Dockerfile -t course-service:latest .

# Run production container
docker run -d \
  -p 4001:4001 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_HOST="redis" \
  --name course-service \
  course-service:latest
```

## Database Setup

### 1. Install Dependencies

```bash
cd packages/database
pnpm install
```

### 2. Configure Database URL

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_learning_platform"
```

### 3. Run Migrations

```bash
cd packages/database
pnpm exec prisma migrate deploy
```

### 4. Generate Prisma Client

```bash
pnpm exec prisma generate
```

### 5. Seed Database (Optional)

```bash
pnpm exec tsx prisma/seed.ts
```

## Course Service Deployment

### Local Development

```bash
cd services/course-service

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run in development mode
pnpm dev

# API will be available at http://localhost:4001
# Swagger docs at http://localhost:4001/api/docs
```

### Production Build

```bash
# Build the service
pnpm build

# Start production server
pnpm start:prod
```

## Frontend (Next.js) Deployment

### Development

```bash
cd apps/web

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Available at http://localhost:3000
```

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
cd apps/web
vercel

# Production deployment
vercel --prod
```

## Environment Variables

### Course Service

Required environment variables:

```env
# Server
PORT=4001
NODE_ENV=production

# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AWS S3 (or Cloudflare R2)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket

# Mux
MUX_TOKEN_ID=your-token-id
MUX_TOKEN_SECRET=your-token-secret
MUX_SIGNING_KEY_ID=your-signing-key-id
MUX_SIGNING_KEY_PRIVATE_KEY=your-private-key

# OpenAI
OPENAI_API_KEY=sk-...
```

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:4001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Kubernetes Deployment (Advanced)

### 1. Build and Push Image

```bash
# Build image
docker build -t your-registry/course-service:v1.0.0 \
  -f services/course-service/Dockerfile .

# Push to registry
docker push your-registry/course-service:v1.0.0
```

### 2. Create Kubernetes Manifests

```yaml
# k8s/course-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: course-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: course-service
  template:
    metadata:
      labels:
        app: course-service
    spec:
      containers:
      - name: course-service
        image: your-registry/course-service:v1.0.0
        ports:
        - containerPort: 4001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: course-service-secrets
              key: database-url
        - name: REDIS_HOST
          value: redis-service
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: course-service
spec:
  selector:
    app: course-service
  ports:
  - port: 80
    targetPort: 4001
  type: LoadBalancer
```

### 3. Apply Manifests

```bash
kubectl apply -f k8s/course-service-deployment.yaml
```

## Monitoring & Health Checks

### Health Check Endpoint

```bash
curl http://localhost:4001/health
```

### Logs

```bash
# Docker logs
docker logs -f course-service

# Kubernetes logs
kubectl logs -f deployment/course-service
```

### Metrics

The service exposes metrics for monitoring:
- Request count
- Response times
- Error rates
- Database connections

## Scaling

### Horizontal Scaling (Docker Compose)

```yaml
# docker-compose.yml
services:
  course-service:
    deploy:
      replicas: 3
```

### Kubernetes Autoscaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: course-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: course-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
cd packages/database
pnpm exec prisma db pull

# Reset database (WARNING: Deletes all data)
pnpm exec prisma migrate reset
```

### Mux Integration Issues

```bash
# Verify Mux credentials
curl -u $MUX_TOKEN_ID:$MUX_TOKEN_SECRET https://api.mux.com/video/v1/assets
```

### Redis Connection

```bash
# Test Redis connection
redis-cli -h localhost -p 6379 ping
```

## Performance Optimization

### Database

- Enable connection pooling (PgBouncer)
- Set up read replicas
- Configure indexes
- Enable query caching

### Caching

- Redis caching for frequently accessed data
- CDN for static assets
- Mux CDN for video delivery

### Code

- Enable compression (gzip)
- Optimize bundle size
- Lazy loading for large modules
- Database query optimization

## Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] DRM enabled for premium content
- [ ] Signed URLs for video playback
- [ ] Regular security updates

## Backup & Recovery

### Database Backups

```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

### Automated Backups

Set up automated daily backups using cron or cloud provider tools.

## Support

For deployment issues, check:
1. Service logs
2. Database connectivity
3. Environment variables
4. External service status (Mux, S3, OpenAI)

---

**Deployment Status**: Ready for production ✅
