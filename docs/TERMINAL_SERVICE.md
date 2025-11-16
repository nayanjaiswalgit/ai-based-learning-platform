# Terminal Service Documentation

## Overview

The Terminal Service provides interactive terminal sessions for DevOps challenges and scenarios. It enables users to practice Linux, Git, Docker, Kubernetes, and other DevOps tools in a safe, isolated environment.

## Architecture

```
┌─────────────────┐         WebSocket         ┌──────────────────┐
│                 │ ◄─────────────────────────►│                  │
│  Frontend       │                            │  Terminal        │
│  (Xterm.js)     │                            │  Service         │
│                 │                            │  (NestJS)        │
└─────────────────┘                            └────────┬─────────┘
                                                        │
                                                ┌───────▼──────────┐
                                                │                  │
                                                │  Docker          │
                                                │  Containers      │
                                                │                  │
                                                └──────────────────┘
```

## Key Features

### 1. Interactive Terminal Sessions
- Full terminal emulation using Xterm.js
- Real-time bidirectional I/O via WebSocket
- Terminal customization (themes, fonts, etc.)
- Copy/paste support
- Fullscreen mode

### 2. Docker-Based Isolation
- Each session runs in an isolated Docker container
- Pre-configured images for different scenarios
- Resource limits (CPU, memory, disk)
- Network isolation for security
- Automatic cleanup

### 3. Scenario System
- Pre-built DevOps scenarios (Linux, Git, Docker, K8s, AWS, Nginx, CI/CD)
- Checkpoint-based progression
- Validation scripts to verify task completion
- Hints system for stuck students
- Progress tracking

### 4. Security
- Network isolation (no internet access by default)
- Read-only root filesystem (except /tmp)
- Resource limits to prevent abuse
- No privileged operations
- Session timeouts (30 minutes)
- Dangerous command blocking

### 5. Collaborative Features
- Shared terminal sessions (instructor-student)
- Multiple participants (viewers/collaborators)
- Screen sharing for debugging
- Role-based permissions

### 6. Session Recording
- Record all terminal I/O
- Playback capabilities
- Export to asciicast format (asciinema compatible)
- Save for review and assessment

## Components

### Backend Services

#### 1. Docker Service
**File**: `services/terminal-service/src/modules/docker/docker.service.ts`

Manages Docker container lifecycle:
- Create containers with security restrictions
- Execute commands in containers
- Monitor resource usage
- Resize terminal
- Clean up containers

**Key Methods**:
```typescript
createTerminalContainer(sessionId, config): Promise<TerminalContainer>
executeCommand(containerId, command): Promise<{output, exitCode}>
stopContainer(sessionId): Promise<void>
resizeTerminal(sessionId, rows, cols): Promise<void>
```

#### 2. Session Service
**File**: `services/terminal-service/src/modules/session/session.service.ts`

Manages terminal sessions with Redis:
- Create and track sessions
- Store session state
- Manage checkpoints
- Track command history
- Auto-expiration (30 minutes)

**Key Methods**:
```typescript
createSession(userId, scenarioId): Promise<TerminalSession>
getSession(sessionId): Promise<TerminalSession | null>
updateSessionStatus(sessionId, status): Promise<void>
updateCheckpoint(sessionId, checkpointId, completed): Promise<void>
```

#### 3. Scenario Service
**File**: `services/terminal-service/src/modules/scenario/scenario.service.ts`

Manages DevOps scenarios:
- CRUD operations for scenarios
- Checkpoint validation
- Hints management
- Pre-built scenarios

**Key Methods**:
```typescript
getScenario(scenarioId): Scenario | undefined
listScenarios(category?): Scenario[]
createScenario(scenario): Scenario
validateCheckpoint(scenarioId, checkpointId, output): Promise<boolean>
```

#### 4. Terminal Gateway
**File**: `services/terminal-service/src/modules/terminal/terminal.gateway.ts`

WebSocket gateway for real-time communication:
- Handle WebSocket connections
- Stream terminal I/O
- Manage session lifecycle
- Validate checkpoints
- Provide hints

**WebSocket Events**:

**Client → Server**:
- `start-session` - Start a new terminal session
- `terminal-input` - Send input to terminal
- `terminal-resize` - Resize terminal
- `validate-checkpoint` - Validate checkpoint
- `get-hint` - Request hint
- `stop-session` - Stop session

**Server → Client**:
- `session-started` - Session created successfully
- `terminal-output` - Terminal output data
- `checkpoint-validated` - Checkpoint validation result
- `scenario-completed` - All checkpoints completed
- `hint` - Hint message
- `session-stopped` - Session terminated
- `error` - Error message

#### 5. Recording Service
**File**: `services/terminal-service/src/modules/terminal/recording.service.ts`

Records terminal sessions:
- Capture all terminal I/O
- Save to disk
- Playback functionality
- Export to asciicast format

#### 6. Collaboration Service
**File**: `services/terminal-service/src/modules/terminal/collaboration.service.ts`

Enables shared terminal sessions:
- Create shared sessions
- Manage participants
- Role-based access (viewer/collaborator)
- Broadcast to participants

### Frontend Components

#### Terminal Component
**File**: `apps/web/src/components/terminal/Terminal.tsx`

React component for terminal UI:
- Xterm.js integration
- WebSocket connection
- Toolbar controls
- Checkpoint display
- Theme support

**Props**:
```typescript
interface TerminalProps {
  sessionId?: string;
  userId: string;
  scenarioId: string;
  theme?: 'dark' | 'light';
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: () => void;
  onCheckpointComplete?: (checkpointId: string) => void;
}
```

#### useTerminal Hook
**File**: `apps/web/src/hooks/terminal/useTerminal.ts`

Custom hook for terminal state management:
- WebSocket connection
- Session state
- Terminal I/O
- Checkpoint tracking

## Docker Images

### Base Images

1. **ubuntu-base** (`ai-learning/ubuntu-base:latest`)
   - Ubuntu 22.04
   - Basic tools (vim, nano, curl, wget)
   - For Linux basics scenarios

2. **ubuntu-git** (`ai-learning/ubuntu-git:latest`)
   - Ubuntu 22.04 + Git
   - Pre-configured Git settings
   - For Git scenarios

3. **k8s-tools** (`ai-learning/k8s-tools:latest`)
   - kubectl, kind, helm
   - For Kubernetes scenarios

4. **aws-cli** (`ai-learning/aws-cli:latest`)
   - AWS CLI v2
   - For AWS scenarios

5. **nginx-tools** (`ai-learning/nginx-tools:latest`)
   - Nginx + configuration tools
   - For Nginx scenarios

### Building Images

```bash
cd infrastructure/docker/terminal-images
./build-images.sh
```

## Pre-Built Scenarios

### 1. Linux File Operations
**Category**: Linux
**Difficulty**: Beginner
**Duration**: 15 minutes

Checkpoints:
- Create directory
- Create file
- Change permissions

### 2. Git Basics
**Category**: Git
**Difficulty**: Beginner
**Duration**: 20 minutes

Checkpoints:
- Initialize repository
- Create and stage file
- Make first commit

### 3. Docker Basics
**Category**: Docker
**Difficulty**: Beginner
**Duration**: 25 minutes

Checkpoints:
- Run container
- List containers
- Stop container

### 4. Kubernetes Pods
**Category**: Kubernetes
**Difficulty**: Intermediate
**Duration**: 30 minutes

Checkpoints:
- Create pod
- Create deployment
- Expose service

### 5. AWS S3 Operations
**Category**: AWS
**Difficulty**: Intermediate
**Duration**: 20 minutes

Checkpoints:
- List buckets
- Create bucket
- Upload file

### 6. Nginx Reverse Proxy
**Category**: Nginx
**Difficulty**: Intermediate
**Duration**: 30 minutes

Checkpoints:
- Create config file
- Configure proxy
- Test configuration

### 7. GitHub Actions CI/CD
**Category**: CI/CD
**Difficulty**: Advanced
**Duration**: 40 minutes

Checkpoints:
- Create workflow file
- Add build job
- Add test step

## Security

### Container Security

1. **Network Isolation**
   - Containers have no internet access by default
   - NetworkMode: "none"

2. **Read-Only Filesystem**
   - Root filesystem is read-only
   - Only /tmp is writable

3. **Resource Limits**
   - CPU: 0.5 cores
   - Memory: 256MB
   - Disk: 100MB
   - Processes: 100 max

4. **Capabilities**
   - Drop all capabilities
   - Add only essential ones (CHOWN, SETUID, SETGID)

5. **No Privileged Mode**
   - Containers cannot access host system

6. **Dangerous Command Blocking**
   - Commands like `rm -rf /` are blocked

### Session Security

1. **Timeout**: Sessions expire after 30 minutes of inactivity
2. **Cleanup**: Containers are automatically removed after session ends
3. **Isolation**: Each session has its own container
4. **Authentication**: Sessions are tied to authenticated users

## API Reference

### REST API

#### Get User Sessions
```
GET /terminal/sessions?userId={userId}
```

#### Get Session Details
```
GET /terminal/sessions/:sessionId
```

#### Delete Session
```
DELETE /terminal/sessions/:sessionId
```

#### Get Session Stats
```
GET /terminal/sessions/:sessionId/stats
```

#### Extend Session
```
POST /terminal/sessions/:sessionId/extend
```

#### Get Service Stats
```
GET /terminal/stats
```

### Scenarios API

#### List Scenarios
```
GET /scenarios?category={category}
```

#### Get Scenario
```
GET /scenarios/:id
```

#### Create Scenario
```
POST /scenarios
```

#### Update Scenario
```
PUT /scenarios/:id
```

#### Delete Scenario
```
DELETE /scenarios/:id
```

#### Get Hints
```
GET /scenarios/:id/hints
```

## Environment Variables

```bash
# Server
PORT=3007
NODE_ENV=development

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Docker
DOCKER_SOCKET_PATH=/var/run/docker.sock

# CORS
CORS_ORIGIN=http://localhost:3000

# Session
SESSION_TTL=1800  # 30 minutes

# Recording
RECORDINGS_DIR=./recordings

# Logging
LOG_LEVEL=info
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- Docker
- Redis
- PNPM

### Installation

1. **Install dependencies**:
```bash
cd services/terminal-service
pnpm install
```

2. **Build Docker images**:
```bash
cd infrastructure/docker/terminal-images
./build-images.sh
```

3. **Start Redis**:
```bash
docker run -d -p 6379:6379 redis:7.4
```

4. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your settings
```

5. **Start service**:
```bash
pnpm run start:dev
```

### Frontend Setup

1. **Install dependencies**:
```bash
cd apps/web
pnpm install
```

2. **Add to environment**:
```bash
# .env.local
NEXT_PUBLIC_TERMINAL_SERVICE_URL=http://localhost:3007
```

3. **Use Terminal component**:
```tsx
import { Terminal } from '@/components/terminal/Terminal';

function MyPage() {
  return (
    <Terminal
      userId="user-123"
      scenarioId="scenario-linux-basics"
      theme="dark"
      onSessionStart={(sessionId) => console.log('Started:', sessionId)}
      onCheckpointComplete={(checkpointId) => console.log('Completed:', checkpointId)}
    />
  );
}
```

## Testing

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov
```

## Deployment

### Docker Compose

```yaml
version: '3.8'

services:
  terminal-service:
    build: ./services/terminal-service
    ports:
      - "3007:3007"
    environment:
      - REDIS_HOST=redis
      - DOCKER_SOCKET_PATH=/var/run/docker.sock
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./recordings:/app/recordings
    depends_on:
      - redis

  redis:
    image: redis:7.4
    ports:
      - "6379:6379"
```

### Kubernetes

See `infrastructure/kubernetes/terminal-service/` for K8s manifests.

## Monitoring

### Metrics

- Active sessions
- Container count
- Session duration
- Checkpoint completion rates
- Resource usage (CPU, memory)

### Logs

Logs are written to:
- `logs/terminal-service.log` - All logs
- `logs/terminal-service-error.log` - Errors only
- Console (development)

### Health Checks

```bash
# Service health
curl http://localhost:3007/terminal/stats

# Redis connection
redis-cli ping
```

## Troubleshooting

### Common Issues

1. **"Cannot connect to Docker daemon"**
   - Ensure Docker is running
   - Check DOCKER_SOCKET_PATH in .env
   - Verify permissions on Docker socket

2. **"Redis connection failed"**
   - Ensure Redis is running
   - Check REDIS_HOST and REDIS_PORT
   - Verify network connectivity

3. **"Session timeout"**
   - Increase SESSION_TTL in .env
   - Check for network issues
   - Verify WebSocket connection

4. **"Container not found"**
   - Check if Docker images are built
   - Run build-images.sh
   - Verify image names in scenarios

## Future Enhancements

- [ ] Mobile terminal support (PWA)
- [ ] Multi-language support
- [ ] Custom scenario builder UI
- [ ] Advanced analytics dashboard
- [ ] Integration with LMS platforms
- [ ] Automated scenario testing
- [ ] Performance optimizations
- [ ] Cluster mode for scaling
- [ ] Advanced collaboration features
- [ ] AI-powered hints

## Support

For issues and questions:
- GitHub Issues: [Link to issues]
- Documentation: [Link to docs]
- Community: [Link to community]

---

**Terminal Service v1.0.0**
Last updated: 2025-11-16
