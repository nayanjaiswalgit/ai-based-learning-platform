# AI & Personalization Service

AI-powered recommendation and personalization service for the learning platform.

## Overview

This service provides AI-driven features including:
- **Skill Assessment**: AI-generated quizzes and skill level calculation
- **Roadmap Generation**: Personalized learning paths with GPT-4/Claude
- **Daily Recommendations**: Adaptive content recommendations
- **AI Chatbot**: Context-aware learning assistant with LangChain
- **Vector Search**: Semantic search with Pinecone
- **Learning Analytics**: Pattern analysis and success prediction

## Features

### 1. Skill Assessment System
- Generate AI-powered assessment questions
- Calculate skill level based on performance
- Analyze skill gaps
- Provide personalized recommendations

### 2. AI Roadmap Generation
- Create personalized learning roadmaps
- Support for GPT-4 and Claude integration
- Dynamic roadmap updates based on progress
- Milestone and task breakdown

### 3. Daily Recommendations
- Generate daily challenges with adaptive difficulty
- Course and problem recommendations
- Streak tracking and motivation
- Success probability prediction

### 4. AI Chatbot
- Context-aware responses using LangChain
- Doubt resolution with code examples
- ELI5 concept explanations
- Intelligent hints without revealing solutions
- Chat history management

### 5. Vector Search (Pinecone)
- Semantic search for courses and problems
- Similar content recommendations
- "Students also took" feature
- Batch indexing support

### 6. Learning Analytics
- Learning pattern analysis
- Optimal learning time suggestions
- Topic strength/weakness visualization
- Success rate predictions
- Personalized study plans

## Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Configure your API keys in .env
```

## Configuration

Required environment variables:

```env
# OpenAI (required)
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4-turbo-preview

# Anthropic Claude (optional, for better reasoning)
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Pinecone (optional, for vector search)
PINECONE_API_KEY=your_key_here
PINECONE_INDEX_NAME=learning-platform

# Redis (required for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Running the Service

```bash
# Development
pnpm dev

# Production build
pnpm build
pnpm start:prod

# Run tests
pnpm test
pnpm test:cov
```

## API Endpoints

### Skill Assessment

#### Create Assessment
```http
POST /api/v1/skill-assessment/create
Content-Type: application/json

{
  "userId": "user_123",
  "goal": "WEB_DEVELOPMENT",
  "estimatedLevel": "BEGINNER",
  "focusAreas": ["JavaScript", "React"]
}
```

#### Generate Questions
```http
POST /api/v1/skill-assessment/generate-questions
Content-Type: application/json

{
  "goal": "WEB_DEVELOPMENT",
  "difficulty": "MEDIUM",
  "count": 20,
  "topics": ["JavaScript", "TypeScript"]
}
```

#### Analyze Skill Gaps
```http
POST /api/v1/skill-assessment/skill-gaps
Content-Type: application/json

{
  "userId": "user_123",
  "targetGoal": "WEB_DEVELOPMENT"
}
```

### Roadmap Generation

#### Generate Roadmap
```http
POST /api/v1/roadmap/generate
Content-Type: application/json

{
  "userId": "user_123",
  "goal": "WEB_DEVELOPMENT",
  "currentSkillLevel": "INTERMEDIATE",
  "availableHoursPerWeek": 15,
  "preferredLearningStyle": "HANDS_ON",
  "specificInterests": ["React", "Node.js"]
}
```

#### Update Progress
```http
PUT /api/v1/roadmap/progress
Content-Type: application/json

{
  "userId": "user_123",
  "roadmapId": "roadmap_456",
  "milestoneId": "milestone_1",
  "taskId": "task_1",
  "completed": true
}
```

### Daily Recommendations

#### Get Daily Recommendations
```http
POST /api/v1/recommendations/daily
Content-Type: application/json

{
  "userId": "user_123",
  "date": "2025-01-15"
}
```

#### Update Streak
```http
POST /api/v1/recommendations/streak
Content-Type: application/json

{
  "userId": "user_123"
}
```

### AI Chatbot

#### Send Message
```http
POST /api/v1/chatbot/message
Content-Type: application/json

{
  "userId": "user_123",
  "message": "How do I solve this problem?",
  "context": {
    "currentProblem": "problem_456",
    "currentCode": "function foo() { ... }"
  }
}
```

#### Get Hint
```http
POST /api/v1/chatbot/hint
Content-Type: application/json

{
  "userId": "user_123",
  "problemId": "problem_456",
  "level": "MODERATE"
}
```

#### Explain Concept
```http
POST /api/v1/chatbot/explain/user_123
Content-Type: application/json

{
  "concept": "Closures in JavaScript"
}
```

### Vector Search

#### Semantic Search
```http
POST /api/v1/vector-search
Content-Type: application/json

{
  "query": "Learn React hooks and state management",
  "topK": 10,
  "difficulty": ["MEDIUM", "HARD"],
  "topics": ["React"]
}
```

#### Find Similar Content
```http
POST /api/v1/vector-search/similar
Content-Type: application/json

{
  "contentId": "course_123",
  "limit": 5
}
```

#### Index Content
```http
POST /api/v1/vector-search/index
Content-Type: application/json

{
  "id": "course_123",
  "title": "Advanced React Patterns",
  "description": "Learn advanced React patterns...",
  "type": "COURSE",
  "difficulty": "ADVANCED",
  "topics": ["React", "TypeScript"]
}
```

### Learning Analytics

#### Get Analytics
```http
POST /api/v1/analytics
Content-Type: application/json

{
  "userId": "user_123",
  "period": "WEEKLY"
}
```

#### Record Activity
```http
POST /api/v1/analytics/record-activity
Content-Type: application/json

{
  "userId": "user_123",
  "type": "PROBLEM_ATTEMPT",
  "resourceId": "problem_456",
  "duration": 1200,
  "metadata": {
    "success": true,
    "topic": "Arrays"
  }
}
```

#### Predict Success
```http
POST /api/v1/analytics/predict-success
Content-Type: application/json

{
  "userId": "user_123",
  "problemId": "problem_789"
}
```

## Architecture

### Technology Stack
- **Framework**: NestJS with TypeScript
- **AI Models**: OpenAI GPT-4, Anthropic Claude
- **Vector DB**: Pinecone
- **Cache**: Redis
- **AI Framework**: LangChain

### Design Patterns
- Service-oriented architecture
- Dependency injection
- Repository pattern (for database layer)
- Strategy pattern (for AI provider selection)

### Caching Strategy
- AI responses cached in Redis for 1 hour
- Vector embeddings cached permanently
- User profiles cached for 15 minutes

## Performance Considerations

### AI API Costs
- OpenAI GPT-4: ~$0.03 per 1K tokens
- Claude: ~$0.015 per 1K tokens
- Embeddings: ~$0.0001 per 1K tokens

### Optimization Strategies
1. **Cache AI responses** aggressively
2. **Batch operations** where possible
3. **Use cheaper models** for simple tasks
4. **Implement rate limiting** to control costs

### Scalability
- Horizontal scaling supported
- Stateless design (sessions in Redis)
- Database connection pooling
- Vector search offloaded to Pinecone

## Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:cov
```

## Contributing

See main repository CONTRIBUTING.md

## License

See main repository LICENSE
