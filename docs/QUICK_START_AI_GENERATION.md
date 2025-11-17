# Quick Start: AI Course Generation

Get started with AI-powered course generation in 5 minutes!

## Prerequisites

- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Docker and Docker Compose installed
- Node.js 18+ installed

## Setup Steps

### 1. Configure Environment Variables

**AI Service**

Create or update `services/ai-service/.env`:

```env
OPENAI_API_KEY=sk-proj-your-key-here
PORT=3006
```

**Course Service**

Create or update `services/course-service/.env`:

```env
AI_SERVICE_URL=http://localhost:3006
PORT=3001
```

### 2. Run Database Migration

```bash
# Start the database
docker compose up -d postgres

# Wait for database to be ready (about 5 seconds)
sleep 5

# Run Prisma migration
cd packages/database
npx prisma migrate dev
npx prisma generate
```

### 3. Start Services

**Option A: Using Docker Compose (Recommended)**

```bash
# Start all services
docker compose up -d

# Check logs
docker compose logs -f course-service ai-service
```

**Option B: Local Development**

```bash
# Terminal 1 - Start AI Service
cd services/ai-service
pnpm install
pnpm dev

# Terminal 2 - Start Course Service
cd services/course-service
pnpm install
pnpm dev

# Terminal 3 - Start Web App
cd apps/web
pnpm install
pnpm dev
```

### 4. Verify Setup

**Test AI Service**:
```bash
curl -X POST http://localhost:3006/api/v1/content-generation/generate-explanation \
  -H "Content-Type: application/json" \
  -d '{"concept": "Variables in Python", "level": "beginner"}'
```

**Test Course Service**:
```bash
curl http://localhost:3001/api/v1/courses
```

### 5. Generate Your First Course

1. Open browser to `http://localhost:3000`
2. Navigate to Instructor Dashboard → Courses
3. Click "✨ Generate with AI"
4. Enter course description:
   ```
   Create a beginner JavaScript course covering:
   - Variables and data types
   - Functions and scope
   - Arrays and objects
   - DOM manipulation
   - Async programming

   Include practical coding exercises and quizzes.
   ```
5. Set parameters:
   - Difficulty: Beginner
   - Estimated Hours: 30
   - Number of Modules: 5
6. Click "Generate Course with AI"
7. Wait 30-60 seconds for generation
8. Review and refine as needed
9. Click "Publish Course"

## Troubleshooting

### Issue: "OpenAI API key not configured"

**Solution**: Make sure `.env` file exists in `services/ai-service/` with valid API key

```bash
# Check if file exists
cat services/ai-service/.env

# Should contain:
# OPENAI_API_KEY=sk-...
```

### Issue: "Failed to generate course"

**Possible causes**:
1. OpenAI API key invalid or out of credits
2. AI service not running
3. Network connectivity issues

**Debug steps**:
```bash
# Check AI service is running
curl http://localhost:3006/health

# Check AI service logs
docker compose logs ai-service
# or
cd services/ai-service && pnpm dev
```

### Issue: Migration fails

**Solution**: Ensure database is running and accessible

```bash
# Check database status
docker compose ps postgres

# Restart database if needed
docker compose restart postgres

# Check connection
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: Frontend can't connect to backend

**Solution**: Check CORS configuration and service URLs

```bash
# Verify services are running
curl http://localhost:3001/api/v1/courses
curl http://localhost:3006/health

# Check browser console for CORS errors
# Update CORS settings in course-service if needed
```

## API Testing with cURL

### Generate a Course

```bash
curl -X POST http://localhost:3001/api/v1/course-generation/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a Python course for beginners with coding exercises",
    "difficulty": "beginner",
    "estimatedHours": 40,
    "moduleCount": 5
  }'
```

Response:
```json
{
  "sessionId": "abc-123-def",
  "content": { ... },
  "status": "review",
  "message": "Course generated successfully..."
}
```

### List Generation Sessions

```bash
curl http://localhost:3001/api/v1/course-generation/sessions
```

### Refine a Section

```bash
SESSION_ID="your-session-id"

curl -X PATCH http://localhost:3001/api/v1/course-generation/sessions/$SESSION_ID/refine \
  -H "Content-Type: application/json" \
  -d '{
    "sectionType": "module",
    "sectionId": "0",
    "refinementPrompt": "Add more practical examples and real-world use cases"
  }'
```

### Publish Course

```bash
SESSION_ID="your-session-id"

curl -X POST http://localhost:3001/api/v1/course-generation/sessions/$SESSION_ID/publish
```

## Example Prompts

### Web Development Course
```
Create a comprehensive full-stack web development course for beginners.

Technologies:
- HTML5, CSS3, JavaScript ES6+
- React for frontend
- Node.js and Express for backend
- MongoDB for database
- REST API development
- Authentication and authorization
- Deployment to cloud platforms

Include:
- 3 major projects (Todo App, Blog Platform, E-commerce Store)
- Coding challenges after each module
- Quizzes to test understanding
- Progressive difficulty

Target: Complete beginners
Duration: 60 hours
```

### Data Science Course
```
Create an intermediate Data Science course with Python.

Topics:
- NumPy and Pandas for data manipulation
- Matplotlib and Seaborn for visualization
- Statistical analysis
- Machine Learning with scikit-learn
- Deep Learning basics with TensorFlow
- Real datasets and projects

Include:
- Jupyter notebook-style coding exercises
- 5 end-to-end projects
- Quizzes on concepts
- Datasets for practice

Target: Programmers new to data science
Duration: 80 hours
```

### DevOps Course
```
Create an advanced DevOps engineering course.

Topics:
- Linux system administration
- Docker containerization
- Kubernetes orchestration
- CI/CD with GitHub Actions
- Infrastructure as Code (Terraform)
- Monitoring with Prometheus and Grafana
- Security best practices

Include:
- Hands-on terminal labs
- Real-world deployment scenarios
- Troubleshooting exercises
- Best practices and patterns

Target: Software engineers transitioning to DevOps
Duration: 50 hours
```

## Cost Estimation

**OpenAI API Costs** (GPT-4o):
- Input: ~$2.50 per 1M tokens
- Output: ~$10 per 1M tokens

**Typical Course Generation**:
- Initial generation: ~2,000 input tokens + ~10,000 output tokens
- Cost per course: ~$0.10 - $0.15
- Refinement: ~500 input + ~2,000 output tokens each
- Cost per refinement: ~$0.02 - $0.03

**Example**:
- Generate 1 course: $0.12
- Refine 3 sections: $0.08
- Total: ~$0.20 per course

For 100 courses/month: ~$20 in OpenAI costs

## Next Steps

1. ✅ Generate your first course
2. 📝 Read the full [AI Course Generation Documentation](./AI_COURSE_GENERATION.md)
3. 🎨 Customize the generation prompts in `ai-service/src/modules/content-generation/content-generation.service.ts`
4. 🔧 Configure additional services (video streaming, code execution, terminal labs)
5. 🚀 Deploy to production

## Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)

## Support

Having issues? Check:
1. Service logs: `docker compose logs [service-name]`
2. Database connectivity: `docker compose ps`
3. Environment variables: `cat services/*/. env`
4. API responses: Use Postman or cURL to test endpoints

---

Happy Course Creating! 🚀
