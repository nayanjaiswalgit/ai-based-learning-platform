# Terminal Service

Interactive terminal service for DevOps challenges and scenarios powered by Docker and WebSocket.

## Features

- 🖥️ **Interactive Terminals**: Full terminal emulation with Xterm.js
- 🐳 **Docker Isolation**: Each session in isolated container
- 🔒 **Security**: Network isolation, resource limits, read-only filesystem
- 📚 **Pre-built Scenarios**: Linux, Git, Docker, Kubernetes, AWS, Nginx, CI/CD
- ✅ **Checkpoints**: Guided learning with validation
- 👥 **Collaboration**: Shared sessions for instructor-student interaction
- 📹 **Recording**: Record and replay sessions
- 🎨 **Customization**: Themes, fonts, and terminal settings

## Quick Start

### Prerequisites

- Node.js 18+
- Docker
- Redis
- PNPM

### Installation

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env

# Build Docker images
cd ../../infrastructure/docker/terminal-images
./build-images.sh

# Start Redis
docker run -d -p 6379:6379 redis:7.4

# Start service
pnpm run start:dev
```

The service will be available at `http://localhost:3007`

## Architecture

```
Client (Xterm.js) → WebSocket → Terminal Service → Docker Containers
                                        ↓
                                     Redis
```

## API Endpoints

### REST API

- `GET /terminal/sessions?userId={userId}` - Get user sessions
- `GET /terminal/sessions/:sessionId` - Get session details
- `DELETE /terminal/sessions/:sessionId` - Delete session
- `GET /terminal/stats` - Get service statistics
- `GET /scenarios` - List all scenarios
- `GET /scenarios/:id` - Get scenario details

### WebSocket Events

**Client → Server**:
- `start-session` - Start new session
- `terminal-input` - Send input
- `terminal-resize` - Resize terminal
- `validate-checkpoint` - Validate checkpoint
- `stop-session` - Stop session

**Server → Client**:
- `session-started` - Session created
- `terminal-output` - Output data
- `checkpoint-validated` - Validation result
- `scenario-completed` - All checkpoints done
- `error` - Error message

## Available Scenarios

1. **Linux File Operations** (Beginner, 15min)
2. **Git Basics** (Beginner, 20min)
3. **Docker Basics** (Beginner, 25min)
4. **Kubernetes Pods** (Intermediate, 30min)
5. **AWS S3 Operations** (Intermediate, 20min)
6. **Nginx Reverse Proxy** (Intermediate, 30min)
7. **GitHub Actions CI/CD** (Advanced, 40min)

## Security

- ✅ Network isolation (no internet)
- ✅ Read-only root filesystem
- ✅ Resource limits (0.5 CPU, 256MB RAM)
- ✅ No privileged mode
- ✅ Session timeout (30 minutes)
- ✅ Automatic cleanup

## Development

```bash
# Run in watch mode
pnpm run start:dev

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage
pnpm test:cov

# Lint
pnpm run lint

# Build
pnpm run build

# Start production
pnpm run start:prod
```

## Configuration

Environment variables (see `.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3007 | Service port |
| REDIS_HOST | localhost | Redis host |
| REDIS_PORT | 6379 | Redis port |
| DOCKER_SOCKET_PATH | /var/run/docker.sock | Docker socket |
| SESSION_TTL | 1800 | Session timeout (seconds) |
| CORS_ORIGIN | http://localhost:3000 | Allowed CORS origin |

## Docker Images

Build custom Docker images for scenarios:

```bash
cd infrastructure/docker/terminal-images

# Build all images
./build-images.sh

# Build specific image
docker build -t ai-learning/ubuntu-base:latest -f ubuntu/Dockerfile ubuntu/
```

Available images:
- `ai-learning/ubuntu-base:latest` - Linux basics
- `ai-learning/ubuntu-git:latest` - Git scenarios
- `ai-learning/k8s-tools:latest` - Kubernetes
- `ai-learning/aws-cli:latest` - AWS CLI
- `ai-learning/nginx-tools:latest` - Nginx

## Testing

```bash
# Unit tests
pnpm test

# E2E tests (requires running service)
pnpm test:e2e

# Coverage
pnpm test:cov
```

## Deployment

### Docker Compose

```bash
docker-compose up -d
```

### Kubernetes

```bash
kubectl apply -f infrastructure/kubernetes/terminal-service/
```

## Monitoring

Get service statistics:

```bash
curl http://localhost:3007/terminal/stats
```

Response:
```json
{
  "sessions": {
    "total": 10,
    "active": 5,
    "completed": 4,
    "error": 1
  },
  "containers": {
    "active": 5
  }
}
```

## Troubleshooting

### Cannot connect to Docker

```bash
# Check Docker is running
docker ps

# Verify socket path
ls -la /var/run/docker.sock

# Fix permissions
sudo chmod 666 /var/run/docker.sock
```

### Redis connection failed

```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

### Session timeout

Increase SESSION_TTL in `.env`:
```
SESSION_TTL=3600  # 1 hour
```

## Documentation

Full documentation available in [docs/TERMINAL_SERVICE.md](../../docs/TERMINAL_SERVICE.md)

## License

MIT

## Support

- Issues: [GitHub Issues]
- Docs: [Documentation]
- Community: [Discord/Slack]
