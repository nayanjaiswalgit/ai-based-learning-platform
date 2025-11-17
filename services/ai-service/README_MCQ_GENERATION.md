# AI-Powered MCQ Generation Feature

## Overview

This feature enables AI-powered Multiple Choice Question (MCQ) generation based on course content. Instructors can generate high-quality questions from specific lessons, modules, entire courses, or custom topics using OpenAI's GPT models.

## Features

✅ **Content-Aware Generation**: Generate MCQs based on actual course content
✅ **Multiple Source Types**: Support for Lesson, Module, Course, or Custom Topic
✅ **AI-Powered**: Uses OpenAI GPT-4 for intelligent question generation
✅ **Flexible Difficulty Levels**: EASY, MEDIUM, HARD
✅ **Multiple Question Types**: MULTIPLE_CHOICE, MULTIPLE_SELECT, TRUE_FALSE
✅ **Detailed Explanations**: Each option includes explanations
✅ **Automatic Tagging**: AI generates relevant tags for each question
✅ **Review & Edit Flow**: Generated questions can be reviewed before saving

## API Endpoints

### Generate MCQs

**Endpoint**: `POST /content-generation/mcq/generate`

**Description**: Generate MCQs using AI based on specific course content

**Request Body**:
```json
{
  "contentSource": "LESSON | MODULE | COURSE | CUSTOM_TOPIC",
  "contentId": "uuid-of-lesson-module-or-course",
  "customTopic": "Optional: topic name for CUSTOM_TOPIC",
  "additionalContext": "Optional: extra context",
  "count": 5,
  "difficulty": "EASY | MEDIUM | HARD",
  "questionType": "MULTIPLE_CHOICE | MULTIPLE_SELECT | TRUE_FALSE",
  "topics": ["optional", "array", "of", "focus", "topics"]
}
```

**Response**:
```json
{
  "questions": [
    {
      "id": "temp-id-123",
      "questionText": "What is the time complexity of binary search?",
      "options": [
        {
          "text": "O(n)",
          "isCorrect": false,
          "explanation": "This is linear search complexity"
        },
        {
          "text": "O(log n)",
          "isCorrect": true,
          "explanation": "Binary search halves the search space each iteration"
        }
      ],
      "difficulty": "MEDIUM",
      "questionType": "MULTIPLE_CHOICE",
      "explanation": "Binary search has O(log n) time complexity...",
      "tags": ["algorithms", "complexity", "binary-search"],
      "courseId": "course-uuid",
      "moduleId": "module-uuid",
      "lessonId": "lesson-uuid"
    }
  ],
  "sourceId": "lesson-uuid",
  "sourceType": "LESSON",
  "topic": "Data Structures - Binary Search",
  "count": 5
}
```

### Legacy Endpoints

**Generate Quiz (Legacy)**:
- `POST /content-generation/generate-quiz`
- Still supported for backward compatibility
- Recommend using `/mcq/generate` instead

**Generate Explanation**:
- `POST /content-generation/generate-explanation`
- Generate AI explanations for concepts

## Usage Examples

### 1. Generate MCQs from a Lesson

```bash
curl -X POST http://localhost:3002/content-generation/mcq/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "contentSource": "LESSON",
    "contentId": "lesson-uuid-123",
    "count": 5,
    "difficulty": "MEDIUM",
    "questionType": "MULTIPLE_CHOICE"
  }'
```

### 2. Generate MCQs from a Module

```bash
curl -X POST http://localhost:3002/content-generation/mcq/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "contentSource": "MODULE",
    "contentId": "module-uuid-456",
    "count": 10,
    "difficulty": "HARD",
    "questionType": "MULTIPLE_CHOICE",
    "topics": ["async-await", "promises", "callbacks"]
  }'
```

### 3. Generate MCQs from Custom Topic

```bash
curl -X POST http://localhost:3002/content-generation/mcq/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "contentSource": "CUSTOM_TOPIC",
    "customTopic": "JavaScript Event Loop",
    "additionalContext": "Focus on practical examples with async/await and promises",
    "count": 5,
    "difficulty": "MEDIUM",
    "questionType": "MULTIPLE_CHOICE"
  }'
```

### 4. Generate True/False Questions

```bash
curl -X POST http://localhost:3002/content-generation/mcq/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "contentSource": "COURSE",
    "contentId": "course-uuid-789",
    "count": 10,
    "difficulty": "EASY",
    "questionType": "TRUE_FALSE"
  }'
```

## Workflow

### Complete MCQ Generation Flow

1. **Generate Questions**
   - Instructor selects content source (Lesson, Module, Course, or Custom)
   - Specifies count, difficulty, and question type
   - Clicks "Generate with AI"
   - System fetches content context and calls OpenAI
   - AI generates questions with options and explanations

2. **Review & Edit**
   - Generated questions are displayed in a review interface
   - Instructor can:
     - Edit question text
     - Modify options
     - Adjust explanations
     - Change difficulty/tags
     - Remove unwanted questions
     - Regenerate specific questions

3. **Save to Assessment**
   - After review, instructor can:
     - Save all questions to the assessment
     - Save selected questions only
     - Questions are saved to the database with proper links to course/module/lesson

4. **Use in Quizzes**
   - Saved questions can be added to any quiz
   - Questions are linked to their source (course/module/lesson)
   - Can be reused across multiple quizzes

## Technical Architecture

### Services

1. **OpenAIService** (`src/common/services/openai.service.ts`)
   - Handles OpenAI API integration
   - Provides JSON and text completion methods
   - Manages API keys and configuration

2. **PrismaService** (`src/common/services/prisma.service.ts`)
   - Database connection management
   - Query execution for course/module/lesson data

3. **ContentGenerationService** (`src/modules/content-generation/content-generation.service.ts`)
   - Core MCQ generation logic
   - Context fetching (lesson/module/course)
   - AI prompt construction
   - Response parsing and formatting

### Database Schema

Questions are linked to courses through the following fields:
- `courseId`: Optional link to course
- `moduleId`: Not in schema, but included in response metadata
- `lessonId`: Not in schema, but included in response metadata

### AI Prompt Engineering

The system uses carefully crafted prompts to ensure high-quality questions:

**System Prompt**:
- Establishes AI as educational content creator
- Provides guidelines for different question types
- Sets expectations for explanations and difficulty

**User Prompt**:
- Includes full content context (lesson/module/course info)
- Specifies count, difficulty, and type
- Optional focus topics
- Requests specific JSON format

### Content Context Extraction

The system intelligently extracts context based on source type:

**Lesson Context**:
- Course title and description
- Module title and description
- Lesson title, content, and transcript

**Module Context**:
- Course information
- Module information
- Summary of all lessons in module (first 500 chars each)

**Course Context**:
- Course title and descriptions
- All modules overview
- Associated skills

## Configuration

### Environment Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/learning_platform

# Service Port
PORT=3002
```

### Config File

Located at `src/config/ai.config.ts`:

```typescript
export default registerAs('ai', () => ({
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10),
  },
}));
```

## Error Handling

The system handles various error scenarios:

- **Missing API Key**: Logs warning, throws error on API call
- **Content Not Found**: Returns 404 with descriptive message
- **Invalid Parameters**: Returns 400 with validation errors
- **AI Generation Failure**: Returns 400 with user-friendly message
- **Database Errors**: Properly logged and returned as 500

## Testing

### Manual Testing

1. Start the AI service:
```bash
cd services/ai-service
npm run dev
```

2. Visit Swagger docs: http://localhost:3002/api/docs

3. Try the `/content-generation/mcq/generate` endpoint

### Integration Testing

```typescript
describe('MCQ Generation', () => {
  it('should generate MCQs from lesson', async () => {
    const response = await request(app.getHttpServer())
      .post('/content-generation/mcq/generate')
      .send({
        contentSource: 'LESSON',
        contentId: 'lesson-uuid',
        count: 5,
        difficulty: 'MEDIUM',
        questionType: 'MULTIPLE_CHOICE',
      })
      .expect(200);

    expect(response.body.questions).toHaveLength(5);
    expect(response.body.questions[0]).toHaveProperty('questionText');
    expect(response.body.questions[0].options).toHaveLength(4);
  });
});
```

## Best Practices

1. **Prompt Engineering**
   - Keep prompts clear and specific
   - Include examples in system prompt
   - Specify desired output format explicitly

2. **Content Context**
   - Include relevant course hierarchy
   - Limit content length for API efficiency
   - Focus on key concepts and learning objectives

3. **Error Handling**
   - Always validate user input
   - Provide helpful error messages
   - Log errors for debugging

4. **Performance**
   - Use appropriate temperature (0.7-0.8 for creativity)
   - Limit max tokens to control costs
   - Consider caching for similar requests

5. **Quality Assurance**
   - Always have instructors review AI-generated content
   - Provide easy editing interface
   - Allow regeneration of poor questions

## Future Enhancements

- [ ] Batch generation with progress tracking
- [ ] Question difficulty auto-detection
- [ ] Duplicate question detection
- [ ] Question bank management
- [ ] Export/import questions
- [ ] Multi-language support
- [ ] Custom AI model selection
- [ ] Question quality scoring
- [ ] A/B testing of questions
- [ ] Analytics on question performance

## Troubleshooting

### OpenAI API Errors

**Issue**: "OpenAI not configured"
- **Solution**: Ensure OPENAI_API_KEY is set in environment

**Issue**: Rate limit errors
- **Solution**: Implement retry logic or reduce request frequency

### Database Errors

**Issue**: "Lesson not found"
- **Solution**: Verify contentId exists and is correct UUID

**Issue**: Connection errors
- **Solution**: Check DATABASE_URL and database status

### Generation Quality Issues

**Issue**: Questions too easy/hard
- **Solution**: Adjust difficulty parameter or provide more context

**Issue**: Irrelevant questions
- **Solution**: Use topics array to focus AI on specific areas

## Support

For issues or questions:
- Check logs: `docker logs ai-service`
- Review Swagger docs: http://localhost:3002/api/docs
- Check OpenAI status: https://status.openai.com

## License

Part of the AI-Based Learning Platform project.
