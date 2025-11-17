# AI-Powered Course Generation Flow

## Overview

The AI Course Generation feature allows instructors to create comprehensive courses using a single prompt. The AI generates a complete curriculum including modules, lessons, quizzes, coding challenges, and terminal labs, which can then be reviewed, refined, and published.

## Architecture

### Components

1. **AI Service** (`services/ai-service`)
   - Integrates with OpenAI GPT-4o
   - Generates complete course structures
   - Refines specific sections based on feedback

2. **Course Service** (`services/course-service`)
   - Orchestrates the course generation workflow
   - Manages generation sessions
   - Publishes generated courses to the database

3. **Frontend** (`apps/web`)
   - User-friendly interface for course generation
   - Review and refinement UI
   - Session management

### Database Schema

```sql
CREATE TABLE "course_generation_sessions" (
    "id" TEXT PRIMARY KEY,
    "instructor_id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "status" TEXT DEFAULT 'generating',
    "generated_content" JSONB NOT NULL,
    "refinement_history" JSONB,
    "published_course_id" TEXT UNIQUE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);
```

## Workflow

### 1. Generation Phase

**Instructor Action:**
- Navigate to "Generate with AI" button on the courses page
- Enter a detailed course description
- Set parameters: difficulty, estimated hours, module count
- Click "Generate Course with AI"

**System Process:**
1. Frontend sends prompt to Course Service
2. Course Service forwards request to AI Service
3. AI Service calls OpenAI GPT-4o with structured prompt
4. AI generates complete course JSON structure
5. Course Service creates a `CourseGenerationSession` record
6. Returns generated content to frontend

**Generated Structure:**
```json
{
  "title": "Course Title",
  "description": "Brief description",
  "longDescription": "Detailed description",
  "difficultyLevel": "beginner|intermediate|advanced",
  "estimatedDurationHours": 40,
  "learningOutcomes": ["outcome1", "outcome2"],
  "prerequisites": ["prerequisite1"],
  "targetAudience": ["audience1"],
  "modules": [
    {
      "title": "Module Title",
      "description": "Module description",
      "orderIndex": 0,
      "lessons": [
        {
          "title": "Lesson Title",
          "contentType": "VIDEO|ARTICLE|QUIZ|CODING|LAB",
          "contentText": "Markdown content",
          "durationMinutes": 15,
          "orderIndex": 0,
          "quiz": { /* Quiz structure */ },
          "codingQuestion": { /* Coding challenge */ },
          "terminalLab": { /* Terminal lab */ }
        }
      ]
    }
  ]
}
```

### 2. Review Phase

**Instructor Action:**
- Review generated course structure
- Examine modules, lessons, quizzes, coding challenges
- Identify sections that need refinement

**UI Features:**
- Course overview with key metrics
- Expandable module view
- Lesson type indicators (VIDEO, ARTICLE, QUIZ, CODING, LAB)
- "Refine" buttons at course, module, and lesson levels

### 3. Refinement Phase

**Instructor Action:**
- Click "Refine" button on any section
- Enter refinement instructions in modal
  - Example: "Make this more beginner-friendly"
  - Example: "Add more practical examples"
  - Example: "Include a real-world project"
- Submit refinement

**System Process:**
1. Frontend sends refinement request to Course Service
2. Course Service identifies the section to refine
3. AI Service receives current content + refinement instructions
4. OpenAI regenerates the specific section
5. Updated content replaces the old section
6. Refinement history is recorded
7. Updated session is saved

**Refinement Levels:**
- **Course Level**: Refine title, description, learning outcomes
- **Module Level**: Refine module title, description, lesson structure
- **Lesson Level**: Refine lesson content, quiz questions, coding challenges

### 4. Publishing Phase

**Instructor Action:**
- Review final course structure
- Click "Publish Course"

**System Process:**
1. Course Service creates Course record
2. Creates CourseModule records for each module
3. Creates Lesson records for each lesson
4. Creates Question records for quizzes
5. Creates CodingQuestion records for coding challenges
6. Creates TerminalChallenge records for labs
7. Updates session status to 'published'
8. Links session to published course
9. Redirects instructor to course management

## API Endpoints

### AI Service

#### Generate Course
```http
POST /api/v1/content-generation/generate-course
Content-Type: application/json

{
  "prompt": "Create a Python course for beginners...",
  "difficulty": "beginner",
  "estimatedHours": 40,
  "moduleCount": 5
}

Response:
{
  "success": true,
  "content": { /* Generated course structure */ },
  "tokensUsed": { "prompt": 1000, "completion": 8000 }
}
```

#### Refine Content
```http
POST /api/v1/content-generation/refine-content
Content-Type: application/json

{
  "sectionType": "module",
  "sectionId": "0",
  "refinementPrompt": "Make this module more practical",
  "currentContent": { /* Current module content */ }
}

Response:
{
  "success": true,
  "content": { /* Refined content */ },
  "tokensUsed": { "prompt": 500, "completion": 2000 }
}
```

### Course Service

#### Generate Course
```http
POST /api/v1/course-generation/generate
Content-Type: application/json

{
  "prompt": "Course description...",
  "difficulty": "beginner",
  "estimatedHours": 40,
  "moduleCount": 5
}

Response:
{
  "sessionId": "uuid",
  "content": { /* Generated course */ },
  "status": "review",
  "message": "Course generated successfully..."
}
```

#### List Generation Sessions
```http
GET /api/v1/course-generation/sessions

Response:
[
  {
    "id": "uuid",
    "prompt": "Course prompt...",
    "status": "review",
    "createdAt": "2025-11-17T...",
    "publishedCourseId": null
  }
]
```

#### Get Session
```http
GET /api/v1/course-generation/sessions/:sessionId

Response:
{
  "id": "uuid",
  "instructorId": "uuid",
  "prompt": "Course prompt...",
  "status": "review",
  "generatedContent": { /* Full course structure */ },
  "refinementHistory": { /* Refinement log */ }
}
```

#### Refine Section
```http
PATCH /api/v1/course-generation/sessions/:sessionId/refine
Content-Type: application/json

{
  "sectionType": "lesson",
  "sectionId": "0-1",
  "refinementPrompt": "Add more code examples"
}

Response:
{
  "sessionId": "uuid",
  "content": { /* Updated course content */ },
  "refinedSection": { /* Refined section */ },
  "message": "Content refined successfully"
}
```

#### Publish Course
```http
POST /api/v1/course-generation/sessions/:sessionId/publish

Response:
{
  "courseId": "uuid",
  "slug": "python-for-beginners",
  "message": "Course published successfully"
}
```

## Configuration

### Environment Variables

**AI Service (.env):**
```env
OPENAI_API_KEY=sk-...
```

**Course Service (.env):**
```env
AI_SERVICE_URL=http://localhost:3006
DATABASE_URL=postgresql://...
```

## Content Types Supported

### 1. Articles (ARTICLE)
- Markdown-formatted content
- Best for conceptual explanations
- Includes inline code examples

### 2. Video Lessons (VIDEO)
- Video script generated
- Duration estimated
- Can be replaced with actual video URL later

### 3. Quizzes (QUIZ)
- Multiple choice questions
- Correct answers with explanations
- Difficulty levels (EASY, MEDIUM, HARD)
- Topics tagging

### 4. Coding Questions (CODING)
- Problem statement
- Starter code (Python, JavaScript, Java, C++)
- Test cases (visible and hidden)
- Hints and constraints
- Time and memory limits

### 5. Terminal Labs (LAB)
- Scenario description
- Docker-based environment
- Setup script
- Validation script
- Expected commands
- Hands-on system administration / DevOps tasks

## Best Practices

### Writing Effective Prompts

**Good Prompt Example:**
```
Create a comprehensive Python programming course for absolute beginners.

Topics to cover:
- Python basics (variables, data types, operators)
- Control flow (if/else, loops)
- Functions and modules
- Data structures (lists, dictionaries, sets)
- Object-oriented programming
- File handling
- Error handling
- Practical projects

Include:
- Hands-on coding exercises after each topic
- Quizzes to test understanding
- At least 3 practical projects
- Progressive difficulty from easy to medium

Target audience: Complete beginners with no programming experience
Duration: 40 hours
```

**Tips:**
1. Be specific about topics to cover
2. Mention target audience skill level
3. Specify desired content types
4. Include practical application requirements
5. Set clear learning objectives
6. Mention any specific technologies or tools

### Refinement Strategy

1. **First Pass**: Review overall structure and flow
   - Refine course-level information if needed
   - Ensure logical progression of modules

2. **Second Pass**: Review individual modules
   - Check module descriptions
   - Verify lesson variety (mix of content types)

3. **Third Pass**: Deep dive into lessons
   - Review quiz questions for accuracy
   - Check coding challenges for clarity
   - Validate terminal lab scenarios

4. **Final Pass**: Quality check
   - Ensure consistency across modules
   - Verify all sections align with learning objectives

## Troubleshooting

### Common Issues

**Issue**: AI generation fails with timeout
- **Solution**: Reduce moduleCount or estimatedHours
- **Reason**: Large courses take longer to generate

**Issue**: Refinement doesn't improve content
- **Solution**: Be more specific in refinement prompt
- **Example**: Instead of "improve this", use "add code examples showing real-world use cases"

**Issue**: Published course missing some content
- **Solution**: Check that all lessons have required fields
- **Note**: Some content may need manual addition (like video URLs)

### Error Codes

- `400 Bad Request`: Invalid parameters or missing required fields
- `404 Not Found`: Session not found or doesn't belong to instructor
- `500 Internal Server Error`: AI service error or database error

## Limitations

1. **Video Content**: AI generates video scripts, but actual video files must be uploaded separately
2. **Images**: Course thumbnails and lesson images must be added manually
3. **Advanced Assessments**: Complex assessment types may require manual refinement
4. **Code Execution**: Coding challenges are created but require code-execution-service to run
5. **Terminal Labs**: Lab environments need Docker setup for actual execution

## Future Enhancements

- [ ] Generate course thumbnails with AI image generation
- [ ] Create video voiceovers from scripts using TTS
- [ ] Support for interactive coding playgrounds
- [ ] Version control for generated courses
- [ ] A/B testing different course variations
- [ ] Automatic skill tagging
- [ ] SEO optimization suggestions
- [ ] Multilingual course generation
- [ ] Course analytics integration
- [ ] Collaborative refinement (multiple instructors)

## Migration Guide

### Running the Migration

```bash
# Navigate to database package
cd packages/database

# Run Prisma migration
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

### Manual Migration (if needed)

```sql
-- Run the migration SQL file
psql -U your_user -d your_database -f prisma/migrations/20251117144323_add_course_generation_session/migration.sql
```

## Examples

### Example 1: Python Course
**Prompt**: "Create a beginner Python course covering basics, data structures, OOP, and 3 projects"
**Result**: 6 modules, 45 lessons, 12 quizzes, 8 coding challenges

### Example 2: DevOps Course
**Prompt**: "Create an intermediate DevOps course with Docker, Kubernetes, CI/CD, and monitoring"
**Result**: 8 modules, 52 lessons, 15 terminal labs, 10 quizzes

### Example 3: Web Development Course
**Prompt**: "Create an advanced React course covering hooks, state management, testing, and deployment"
**Result**: 10 modules, 68 lessons, 20 coding challenges, 12 quizzes

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API endpoint documentation
3. Check service logs for detailed error messages
4. Ensure OpenAI API key is valid and has credits

---

**Last Updated**: November 17, 2025
**Version**: 1.0.0
