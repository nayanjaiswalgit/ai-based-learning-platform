# AI-Powered Coding Lab Generation Flow

This document describes the complete flow for generating and adding coding labs to courses using AI.

## Overview

Instructors can now generate coding challenges and terminal labs using AI, review them, and add them directly to their course lessons. The system supports two types of labs:

1. **Coding Challenges** - LeetCode-style programming problems with test cases
2. **Terminal Labs** - Hands-on command-line challenges with Docker environments

## Architecture

### Database Schema Changes

The `Lesson` model now includes a `questionId` field to link lessons with coding labs:

```prisma
model Lesson {
  // ... existing fields
  questionId  String?  @map("question_id")
  question    Question? @relation(fields: [questionId], references: [id], onDelete: SetNull)
}
```

Migration file: `packages/database/prisma/migrations/20251117143916_add_question_to_lesson/migration.sql`

### Services

#### 1. AI Service

**File**: `services/ai-service/src/modules/content-generation/content-generation.service.ts`

The AI service uses Claude (Anthropic) to generate lab content based on:
- Topic
- Difficulty level (BEGINNER, INTERMEDIATE, ADVANCED)
- Lab type (coding or terminal)
- Optional context (course/module info)

**Key Methods**:
- `generateCodingLab()` - Main entry point for lab generation
- `generateCodingQuestion()` - Generates coding challenges with test cases
- `generateTerminalChallenge()` - Generates terminal labs with tasks

**API Endpoint**:
```
POST /content-generation/generate-coding-lab
```

**Request Body**:
```json
{
  "topic": "Binary Search Trees",
  "difficulty": "INTERMEDIATE",
  "labType": "coding",
  "context": "Focus on tree traversal algorithms",
  "courseTitle": "Data Structures and Algorithms",
  "moduleTitle": "Trees and Graphs"
}
```

**Response** (Coding Lab):
```json
{
  "title": "Implement BST Operations",
  "description": "Detailed problem description...",
  "difficulty": "INTERMEDIATE",
  "estimatedMinutes": 45,
  "starterCode": {
    "python": "class TreeNode: ...",
    "javascript": "class TreeNode { ... }",
    "java": "class TreeNode { ... }",
    "cpp": "struct TreeNode { ... };"
  },
  "testCases": [
    {
      "input": "[5,3,7,1,4]",
      "expectedOutput": "true",
      "explanation": "Valid BST structure",
      "isHidden": false
    }
  ],
  "hints": ["Think about recursive approach", "..."],
  "constraints": "O(n) time, O(h) space"
}
```

#### 2. Assessment Service

**File**: `services/assessment-service/src/modules/question/question.service.ts`

Handles saving AI-generated labs to the database as Question entities.

**New Method**: `createFromAIGeneration()`

This method:
1. Takes AI-generated content
2. Creates a Question entity
3. Creates the related CodingQuestion or TerminalChallenge
4. Returns the saved question with ID

**API Endpoint**:
```
POST /questions/from-ai-generation
```

**Request Body**:
```json
{
  "generatedContent": { /* AI-generated lab data */ },
  "labType": "coding",
  "createdBy": "user-id"
}
```

#### 3. Course Service

**File**: `services/course-service/src/courses/dto/create-lesson.dto.ts`

Updated to include `questionId` field:

```typescript
export class CreateLessonDto {
  // ... existing fields
  questionId?: string; // ID of the coding lab/quiz
}
```

Lessons can now be created with a `questionId` to link them to coding labs.

## Frontend Components

### 1. AI Lab Generation Page

**File**: `apps/web/src/app/instructor/labs/ai-generate/page.tsx`

Standalone page for generating labs. Features:
- Three-step wizard: Configure → Generating → Review
- Topic and difficulty selection
- Lab type selection (coding vs terminal)
- Real-time generation with loading state
- Review and edit generated content
- Save to database

**Route**: `/instructor/labs/ai-generate`

### 2. AI Lab Generation Dialog Component

**File**: `apps/web/src/components/instructor/AILabGenerationDialog.tsx`

Reusable dialog component that can be embedded in course editing flows.

**Props**:
```typescript
interface AILabGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLabGenerated: (questionId: string, labType: 'coding' | 'terminal', labDetails: any) => void;
  courseTitle?: string;
  moduleTitle?: string;
}
```

**Usage Example**:
```tsx
import { AILabGenerationDialog } from '@/components/instructor/AILabGenerationDialog';

function CourseEditor() {
  const [showLabDialog, setShowLabDialog] = useState(false);

  const handleLabGenerated = (questionId, labType, details) => {
    // Add the lab to the current lesson being created/edited
    setLesson({ ...lesson, questionId, contentType: labType });
  };

  return (
    <>
      <Button onClick={() => setShowLabDialog(true)}>
        Generate Lab with AI
      </Button>

      <AILabGenerationDialog
        open={showLabDialog}
        onOpenChange={setShowLabDialog}
        onLabGenerated={handleLabGenerated}
        courseTitle="My Course"
        moduleTitle="Module 1"
      />
    </>
  );
}
```

## User Flow

### For Instructors

#### Option 1: Standalone Lab Generation

1. Navigate to `/instructor/labs/ai-generate`
2. Select lab type (coding or terminal)
3. Enter topic and difficulty
4. Optionally provide context and course info
5. Click "Generate Lab with AI"
6. Review generated content
7. Edit if needed
8. Save lab to database
9. Add to lesson from course editing interface

#### Option 2: Integrated in Course Editing

1. Edit a course module
2. Add or edit a lesson
3. Select content type as "coding" or "quiz"
4. Click "Generate with AI" button
5. AI Lab Generation Dialog opens
6. Follow generation steps
7. Lab is automatically linked to the lesson

### For Students

When accessing a lesson with a coding lab:

1. Lesson loads with `questionId`
2. Frontend fetches question details from Assessment Service
3. If `questionType === 'coding'`:
   - Show Monaco code editor
   - Load starter code
   - Display test cases
   - Enable code submission
4. If `questionType === 'terminal'`:
   - Launch terminal session
   - Show tasks list
   - Enable terminal interaction
   - Validate completion

## Environment Variables

Add to `.env` files:

```bash
# AI Service
ANTHROPIC_API_KEY=sk-ant-...

# Frontend
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:3005
NEXT_PUBLIC_ASSESSMENT_SERVICE_URL=http://localhost:3003
NEXT_PUBLIC_COURSE_SERVICE_URL=http://localhost:3001
```

## API Integration Flow

```
Instructor clicks "Generate Lab"
         ↓
Frontend → AI Service (POST /content-generation/generate-coding-lab)
         ↓
Claude API generates lab content
         ↓
Return to Frontend for review
         ↓
Instructor reviews/edits
         ↓
Frontend → Assessment Service (POST /questions/from-ai-generation)
         ↓
Save Question + CodingQuestion/TerminalChallenge
         ↓
Return questionId
         ↓
Frontend → Course Service (POST/PATCH /lessons)
         ↓
Create/Update lesson with questionId
         ↓
Complete!
```

## Data Models

### Generated Coding Lab

```typescript
interface GeneratedCodingLab {
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedMinutes: number;
  starterCode: Record<string, string>; // { python: "...", javascript: "..." }
  testCases: {
    input: string;
    expectedOutput: string;
    explanation: string;
    isHidden: boolean;
  }[];
  hints: string[];
  constraints: string;
}
```

### Generated Terminal Lab

```typescript
interface GeneratedTerminalLab {
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedMinutes: number;
  scenario: string; // docker, kubernetes, linux, etc.
  dockerImage: string; // ubuntu:22.04, node:18, etc.
  setupScript?: string;
  validationScript: string;
  tasks: {
    title: string;
    description: string;
    order: number;
    hintCommand?: string;
    validationString: string;
  }[];
}
```

## Benefits

1. **Time Savings**: Instructors can generate labs in seconds instead of hours
2. **Consistency**: AI ensures labs follow best practices and proper structure
3. **Customization**: Generated content can be reviewed and edited
4. **Context-Aware**: AI uses course and module context for relevant labs
5. **Multiple Languages**: Coding labs support Python, JavaScript, Java, and C++
6. **Progressive Difficulty**: AI adjusts complexity based on difficulty level

## Future Enhancements

- [ ] Bulk lab generation for entire modules
- [ ] Lab templates and presets
- [ ] Community sharing of generated labs
- [ ] Analytics on lab completion rates
- [ ] Automated difficulty adjustment based on student performance
- [ ] Integration with OpenAI GPT-4 as alternative to Claude
- [ ] Lab version control and history
- [ ] A/B testing different lab variations

## Troubleshooting

### "AI service not configured"

Ensure `ANTHROPIC_API_KEY` is set in the AI service environment variables.

### "Failed to save lab"

Check that:
1. Assessment service is running
2. Database connection is active
3. Prisma schema is up to date (`npx prisma generate`)

### "Lab not showing in lesson"

Verify:
1. Lesson has correct `questionId`
2. Question exists in database
3. Frontend is fetching from correct service URL

## Testing

### Manual Testing

1. Start all services:
   ```bash
   npm run dev
   ```

2. Navigate to `/instructor/labs/ai-generate`
3. Generate a coding lab about "Arrays"
4. Review and save
5. Create a new lesson and link the lab
6. View the lesson as a student

### API Testing

```bash
# Generate a lab
curl -X POST http://localhost:3005/content-generation/generate-coding-lab \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Hash Tables",
    "difficulty": "INTERMEDIATE",
    "labType": "coding"
  }'

# Save to database
curl -X POST http://localhost:3003/questions/from-ai-generation \
  -H "Content-Type: application/json" \
  -d '{
    "generatedContent": { ... },
    "labType": "coding",
    "createdBy": "user-123"
  }'
```

## Support

For issues or questions:
1. Check the logs in the AI and Assessment services
2. Verify environment variables are set correctly
3. Ensure database migrations are applied
4. Review the generated content for any AI errors
