# Content Generation Service - Feature Overview

## File Location
`/home/user/ai-based-learning-platform/services/ai-service/src/modules/content-generation/content-generation.service.ts`

## Three Integrated AI Generation Features

### 1. Complete Course Generation (OpenAI Direct)
**AI Provider:** OpenAI GPT-4o (Direct API)
**Use Case:** Generate entire courses with modules, lessons, quizzes, and labs

**Methods:**
- `generateCompleteCourse(dto: GenerateCourseDto)` - Main course generation
- `refineContent(dto: RefineCourseContentDto)` - Refine specific course sections

**Features:**
- Generates complete course structure
- Includes multiple content types (VIDEO, ARTICLE, QUIZ, CODING, LAB)
- Creates learning outcomes, prerequisites, target audience
- Produces quiz questions, coding challenges, and terminal labs
- Supports refinement and iteration

**API Endpoint:** `POST /content-generation/generate-course`

---

### 2. MCQ Generation (OpenAI Service Wrapper + Prisma)
**AI Provider:** OpenAI via OpenAIService wrapper
**Use Case:** Generate multiple-choice questions from course content

**Methods:**
- `generateMcqs(dto: GenerateMcqDto)` - Main MCQ generation entry point
- `getContentContext(dto)` - Extract content from database
- `getLessonContext(lessonId)` - Fetch lesson content
- `getModuleContext(moduleId)` - Fetch module content with all lessons
- `getCourseContext(courseId)` - Fetch entire course structure
- `generateMcqsWithAI(...)` - Call OpenAI to generate questions

**Features:**
- Generate from LESSON, MODULE, COURSE, or CUSTOM_TOPIC
- Supports MULTIPLE_CHOICE, MULTIPLE_SELECT, TRUE_FALSE
- Difficulty levels: EASY, MEDIUM, HARD
- Database integration via PrismaService
- Detailed explanations for each option
- Tags and metadata tracking
- Links questions to source content (course/module/lesson IDs)

**Content Sources:**
- `LESSON` - Generate from a specific lesson
- `MODULE` - Generate from all lessons in a module
- `COURSE` - Generate from entire course content
- `CUSTOM_TOPIC` - Generate from custom text/topic

**API Endpoint:** `POST /content-generation/mcq/generate`

---

### 3. Coding Lab Generation (Anthropic Claude)
**AI Provider:** Anthropic Claude 3.5 Sonnet
**Use Case:** Generate coding challenges and terminal labs

**Methods:**
- `generateCodingLab(options: CodingLabGenerationOptions)` - Main lab generation
- `generateCodingQuestion(options)` - Generate coding challenges
- `generateTerminalChallenge(options)` - Generate terminal/CLI labs

**Features:**

#### Coding Challenges:
- Starter code in Python, JavaScript, Java, C++
- Multiple test cases (visible and hidden)
- Progressive hints
- Time/space complexity constraints
- Difficulty levels: BEGINNER, INTERMEDIATE, ADVANCED
- Context-aware (uses course/module info)

#### Terminal Labs:
- Docker-based environment specification
- Setup and validation scripts
- Step-by-step tasks
- Command hints
- Validation strings for automatic checking
- Scenarios: Linux, Docker, Kubernetes, etc.

**API Endpoint:** `POST /content-generation/generate-coding-lab`

---

## Dependencies and Injection

### Constructor Services:
```typescript
constructor(
  private readonly configService: ConfigService,      // Environment config
  private readonly openaiService: OpenAIService,      // OpenAI wrapper
  private readonly prisma: PrismaService,             // Database access
)
```

### API Clients:
- `this.openai` - Direct OpenAI client (for course generation)
- `this.anthropic` - Anthropic Claude client (for coding labs)
- `this.openaiService` - Wrapped OpenAI service (for MCQs and explanations)
- `this.prisma` - Prisma database client (for content context)

---

## Environment Variables Required

```bash
# OpenAI for course generation and MCQs
OPENAI_API_KEY=sk-...

# Anthropic for coding lab generation
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Legacy/Utility Methods

### generateQuiz()
Updated to use `openaiService.generateJsonCompletion()` instead of direct OpenAI calls.

**API Endpoint:** `POST /content-generation/generate-quiz` (Legacy)

### generateExplanation()
Updated to use `openaiService.generateTextCompletion()` for concept explanations.

**API Endpoint:** `POST /content-generation/generate-explanation`

---

## Module Configuration

The service is properly registered in `/home/user/ai-based-learning-platform/services/ai-service/src/modules/content-generation/content-generation.module.ts`:

```typescript
@Module({
  controllers: [ContentGenerationController],
  providers: [ContentGenerationService, OpenAIService, PrismaService],
  exports: [ContentGenerationService],
})
```

---

## Key Design Decisions

1. **Separation of AI Providers:**
   - OpenAI Direct: Course generation (needs high token limits)
   - OpenAI Wrapper: MCQs and explanations (standardized interface)
   - Anthropic Claude: Coding labs (excels at code generation)

2. **Database Integration:**
   - MCQ generation integrates with Prisma to fetch course content
   - Supports hierarchical content (Course → Module → Lesson)
   - Automatically links generated questions to source content

3. **Flexibility:**
   - Each feature can operate independently
   - Context-aware generation using course/module metadata
   - Supports both database-driven and custom text-based generation

4. **Type Safety:**
   - Strong interfaces for all generation options
   - Separate types for coding labs vs terminal labs
   - DTOs for all API endpoints

---

## Usage Examples

### Generate MCQs from a Lesson
```typescript
const result = await contentGenerationService.generateMcqs({
  contentSource: ContentSource.LESSON,
  contentId: 'lesson-123',
  count: 5,
  difficulty: QuestionDifficulty.MEDIUM,
  questionType: QuestionType.MULTIPLE_CHOICE,
  topics: ['arrays', 'algorithms']
});
```

### Generate a Coding Lab
```typescript
const lab = await contentGenerationService.generateCodingLab({
  topic: 'Binary Search Trees',
  difficulty: 'INTERMEDIATE',
  labType: 'coding',
  context: 'Focus on traversal algorithms',
  courseTitle: 'Data Structures',
  moduleTitle: 'Trees and Graphs'
});
```

### Generate Complete Course
```typescript
const course = await contentGenerationService.generateCompleteCourse({
  prompt: 'Create a course on React fundamentals',
  difficulty: 'beginner',
  estimatedHours: 20,
  moduleCount: 5
});
```

---

## Benefits of This Integration

1. **Single Service for All AI Generation** - One place for all content generation needs
2. **Optimized AI Provider Selection** - Each provider used for its strengths
3. **Database-Aware** - MCQ generation uses actual course content
4. **Reusable Components** - OpenAIService wrapper provides consistent interface
5. **Production-Ready** - Proper error handling, logging, and configuration
6. **Flexible and Extensible** - Easy to add new generation types
