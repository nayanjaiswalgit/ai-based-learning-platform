# Terminal Service Quick Start Guide

Get the Terminal Service up and running in minutes!

## Prerequisites

- Node.js 22+
- Docker Desktop running
- Redis running
- PNPM installed

## Quick Setup (5 minutes)

### 1. Start Redis

```bash
docker run -d --name ai-learning-redis -p 6379:6379 redis:7.4-alpine
```

### 2. Build Terminal Docker Images

```bash
cd infrastructure/docker/terminal-images
chmod +x build-images.sh
./build-images.sh
```

This will build:
- `ai-learning/ubuntu-base:latest`
- `ai-learning/ubuntu-git:latest`
- `ai-learning/k8s-tools:latest`
- `ai-learning/aws-cli:latest`
- `ai-learning/nginx-tools:latest`

### 3. Install Dependencies

```bash
cd services/terminal-service
pnpm install
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` if needed (defaults work for local development).

### 5. Start the Service

```bash
pnpm run start:dev
```

The service will be available at `http://localhost:3007`

### 6. Verify Installation

Open another terminal and test:

```bash
# Check service health
curl http://localhost:3007/terminal/stats

# List scenarios
curl http://localhost:3007/scenarios
```

## Using the Frontend Terminal Component

### Add to your Next.js page:

```tsx
import { Terminal } from '@/components/terminal/Terminal';

export default function TerminalPage() {
  return (
    <div>
      <h1>Linux Basics Challenge</h1>
      <Terminal
        userId="user-123"
        scenarioId="scenario-linux-basics"
        theme="dark"
      />
    </div>
  );
}
```

### Set environment variable:

```bash
# In apps/web/.env.local
NEXT_PUBLIC_TERMINAL_SERVICE_URL=http://localhost:3007
```

## Available Scenarios

Try these scenario IDs:

1. **Linux Basics** - `scenario-linux-basics` (15 min, Beginner)
2. **Git Basics** - `scenario-git-basics` (20 min, Beginner)
3. **Docker Basics** - `scenario-docker-basics` (25 min, Beginner)
4. **Kubernetes** - `scenario-k8s-basics` (30 min, Intermediate)
5. **AWS CLI** - `scenario-aws-basics` (20 min, Intermediate)
6. **Nginx** - `scenario-nginx-basics` (30 min, Intermediate)
7. **CI/CD** - `scenario-cicd-basics` (40 min, Advanced)

## Test the WebSocket Connection

Create a simple test file `test-terminal.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Terminal Test</title>
    <script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
</head>
<body>
    <h1>Terminal Service Test</h1>
    <button onclick="startSession()">Start Session</button>
    <button onclick="sendCommand()">Send Command (ls)</button>
    <button onclick="stopSession()">Stop Session</button>
    <pre id="output"></pre>

    <script>
        let socket;
        let sessionId;

        socket = io('http://localhost:3007/terminal');

        socket.on('connect', () => {
            console.log('Connected to terminal service');
            appendOutput('✓ Connected to terminal service\n');
        });

        socket.on('session-started', (data) => {
            sessionId = data.sessionId;
            appendOutput(`✓ Session started: ${sessionId}\n`);
            appendOutput(`Scenario: ${data.scenario.title}\n\n`);
        });

        socket.on('terminal-output', (data) => {
            appendOutput(data.data);
        });

        socket.on('error', (data) => {
            appendOutput(`❌ Error: ${data.message}\n`);
        });

        function startSession() {
            socket.emit('start-session', {
                userId: 'test-user',
                scenarioId: 'scenario-linux-basics'
            });
        }

        function sendCommand() {
            if (!sessionId) {
                alert('Start a session first!');
                return;
            }

            socket.emit('terminal-input', {
                sessionId: sessionId,
                data: 'ls -la\n'
            });
        }

        function stopSession() {
            if (!sessionId) return;

            socket.emit('stop-session', {
                sessionId: sessionId
            });
        }

        function appendOutput(text) {
            document.getElementById('output').textContent += text;
        }
    </script>
</body>
</html>
```

Open this file in your browser to test the connection.

## Run Tests

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov

# E2E tests (requires service running)
pnpm test:e2e
```

## Using Docker Compose (Alternative)

Instead of running components separately:

```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs -f terminal-service

# Stop
docker-compose down
```

## Common Issues

### Docker socket permission denied

```bash
sudo chmod 666 /var/run/docker.sock
# Or add your user to docker group
sudo usermod -aG docker $USER
```

### Redis connection failed

```bash
# Check if Redis is running
docker ps | grep redis

# Or start Redis
docker start ai-learning-redis
```

### Port already in use

Change the port in `.env`:
```
PORT=3008
```

### Images not found

Make sure you built the Docker images:
```bash
cd infrastructure/docker/terminal-images
./build-images.sh
```

## Next Steps

1. **Read the full documentation**: `docs/TERMINAL_SERVICE.md`
2. **Check examples**: `examples/terminal-usage.ts`
3. **Explore scenarios**: `services/terminal-service/src/modules/scenario/scenario.service.ts`
4. **Create custom scenarios**: Use the Scenario API
5. **Enable recording**: Add `enableRecording: true` when starting sessions
6. **Try collaboration**: Share sessions with `share-session` event

## Development Tips

### Enable debug logging

```bash
# In .env
LOG_LEVEL=debug
```

### Watch Docker containers

```bash
# See all terminal containers
docker ps --filter "label=ai-learning.service=terminal"

# View container logs
docker logs <container-id>
```

### Monitor Redis

```bash
docker exec -it ai-learning-redis redis-cli

# Inside redis-cli:
KEYS terminal:*
GET terminal:session:<session-id>
```

### Hot reload

The service auto-reloads when you save files in watch mode:
```bash
pnpm run start:dev
```

## Production Deployment

See `infrastructure/kubernetes/terminal-service/deployment.yaml` for Kubernetes deployment.

Quick production start:
```bash
pnpm run build
NODE_ENV=production pnpm run start:prod
```

## Need Help?

- Documentation: `docs/TERMINAL_SERVICE.md`
- Examples: `examples/terminal-usage.ts`
- Service README: `services/terminal-service/README.md`
- Issues: GitHub Issues

---

**You're all set!** 🚀

Start creating interactive DevOps challenges for your students!
