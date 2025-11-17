# Frontend ↔ Backend API Mapping

This document shows the complete mapping between frontend UI components and backend APIs.

## ✅ Complete Feature Coverage

### 1. Course Management

#### Backend APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/courses` | POST | Create new course |
| `/courses` | GET | List courses with filters |
| `/courses/:id` | GET | Get course details |
| `/courses/:id` | PUT | Update course |
| `/courses/:id` | DELETE | Delete course |
| `/courses/:id/publish` | PATCH | Publish/unpublish course |
| `/courses/:id/duplicate` | POST | Duplicate course |
| `/courses/generate-outline` | POST | Generate AI course outline |
| `/courses/slug/:slug/preview` | GET | Get public course preview |

#### Frontend Components
| Component | Location | APIs Used |
|-----------|----------|-----------|
| CourseCreationWizard | `components/instructor/CourseCreationWizard.tsx` | POST `/courses`, POST `/courses/generate-outline` |
| CourseCardWithActions | `components/course/CourseCardWithActions.tsx` | PUT `/courses/:id`, DELETE `/courses/:id`, POST `/courses/:id/duplicate`, PATCH `/courses/:id/publish` |
| CoursePreviewPage | `components/course/CoursePreviewPage.tsx` | GET `/courses/slug/:slug/preview` |
| InstructorCoursesPage | `app/instructor/courses/page.tsx` | GET `/courses` |

---

### 2. Lesson Management

#### Backend APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/lessons` | POST | Create lesson |
| `/lessons/:id` | PUT | Update lesson |
| `/lessons/:id` | DELETE | Delete lesson |
| `/lessons/:id/toggle-preview` | PATCH | Toggle free preview |
| `/lessons/:id/generate-quiz` | POST | Generate AI quiz for lesson |
| `/lessons/:id/generate-coding-lab` | POST | Generate AI coding lab |
| `/lessons/module/:moduleId/bulk-import` | POST | Bulk import lessons |

#### Frontend Components
| Component | Location | APIs Used |
|-----------|----------|-----------|
| LessonContentManager | `components/instructor/LessonContentManager.tsx` | POST `/lessons/:id/generate-quiz`, POST `/lessons/:id/generate-coding-lab`, PATCH `/lessons/:id/toggle-preview` |
| BulkImportDialog | `components/instructor/BulkImportDialog.tsx` | POST `/lessons/module/:moduleId/bulk-import` |

---

### 3. AI Content Generation

#### Backend APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/content-generation/generate-course` | POST | Generate complete course with AI |
| `/content-generation/refine-content` | POST | Refine course content |
| `/content-generation/mcq/generate` | POST | Generate MCQ questions |
| `/content-generation/generate-coding-lab` | POST | Generate coding lab/terminal challenge |
| `/content-generation/generate-explanation` | POST | Generate concept explanation |

#### Frontend Components
| Component | Location | APIs Used |
|-----------|----------|-----------|
| AIContentGeneratorDialog | `components/instructor/AIContentGeneratorDialog.tsx` | All AI endpoints (configurable based on content type) |
| CourseCreationWizard | `components/instructor/CourseCreationWizard.tsx` | POST `/content-generation/generate-course` |
| LessonContentManager | `components/instructor/LessonContentManager.tsx` | POST `/content-generation/mcq/generate`, POST `/content-generation/generate-coding-lab` |

---

### 4. DSA Problem Sheet

#### Backend APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/dsa-sheet/problems` | POST | Create problem |
| `/dsa-sheet/problems` | GET | List problems with filters |
| `/dsa-sheet/problems/:id` | GET | Get problem details |
| `/dsa-sheet/problems/:id` | PUT | Update problem |
| `/dsa-sheet/problems/:id` | DELETE | Delete problem |
| `/dsa-sheet/problems/bulk-import` | POST | Bulk import problems |
| `/dsa-sheet/generate-sheet` | POST | Generate AI problem sheet |
| `/dsa-sheet/problems/:id/progress` | PATCH | Update progress |
| `/dsa-sheet/progress` | GET | Get user progress |

#### Frontend Components
| Component | Location | APIs Used |
|-----------|----------|-----------|
| DSASheetGenerator | `components/dsa/DSASheetGenerator.tsx` | POST `/dsa-sheet/generate-sheet`, POST `/dsa-sheet/problems/bulk-import` |
| DSAProblemEditor | `components/dsa/DSAProblemEditor.tsx` | POST `/dsa-sheet/problems`, PUT `/dsa-sheet/problems/:id` |
| DSASheetTracker | `components/DSASheetTracker.tsx` | GET `/dsa-sheet/problems`, PATCH `/dsa-sheet/problems/:id/progress`, GET `/dsa-sheet/progress` |

---

### 5. Learning Roadmaps

#### Backend APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/roadmap/generate` | POST | Generate AI roadmap |
| `/roadmap/:userId` | GET | Get user roadmap |
| `/roadmap/list/:userId` | GET | List all roadmaps |
| `/roadmap/:roadmapId` | PATCH | Update roadmap |
| `/roadmap/:roadmapId` | DELETE | Delete roadmap |
| `/roadmap/progress` | PUT | Update progress |

#### Frontend Components
| Component | Location | APIs Used |
|-----------|----------|-----------|
| RoadmapGenerator | `components/roadmap/RoadmapGenerator.tsx` | POST `/roadmap/generate` |
| RoadmapManager | `components/roadmap/RoadmapManager.tsx` | GET `/roadmap/list/:userId`, PATCH `/roadmap/:roadmapId`, DELETE `/roadmap/:roadmapId`, PUT `/roadmap/progress` |

---

### 6. Instructor Dashboard

#### Backend APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/courses` | GET | Get instructor courses |
| `/courses/:id/analytics` | GET | Get course analytics |
| Various endpoints | - | Quick actions for creation |

#### Frontend Components
| Component | Location | APIs Used |
|-----------|----------|-----------|
| InstructorDashboardEnhanced | `components/instructor/InstructorDashboardEnhanced.tsx` | GET `/courses`, GET `/courses/:id/analytics` |
| InstructorPage | `app/instructor/page.tsx` | Dashboard integration |

---

## 📊 Feature Coverage Matrix

| Feature | Backend API | Frontend UI | Status |
|---------|-------------|-------------|--------|
| **Course CRUD** | ✅ Complete | ✅ Complete | 🟢 Ready |
| **AI Course Generation** | ✅ Complete | ✅ Complete | 🟢 Ready |
| **Course Duplication** | ✅ Complete | ✅ Complete | 🟢 Ready |
| **Course Preview** | ✅ Complete | ✅ Complete | 🟢 Ready |
| **Bulk Lesson Import** | ✅ Complete | ✅ Complete | 🟢 Ready |
| **AI MCQ Generation** | ✅ Complete | ✅ Complete | 🟢 Ready |
| **AI Coding Lab Generation** | ✅ Complete | ✅ Complete | 🟢 Ready |
| **Lesson Content Management** | ✅ Complete | ✅ Complete | 🟢 Ready |
| **Free Preview Toggle** | ✅ Complete | ✅ Complete | 🟢 Ready |
| **DSA Sheet Generation** | ✅ Complete | ✅ Complete | 🟢 Ready |
| **DSA Problem CRUD** | ✅ Complete | ✅ Complete | 🟢 Ready |
| **DSA Bulk Import** | ✅ Complete | ✅ Complete | 🟢 Ready |
| **AI Roadmap Generation** | ✅ Complete | ✅ Complete | 🟢 Ready |
| **Roadmap Management** | ✅ Complete | ✅ Complete | 🟢 Ready |
| **Roadmap Progress Tracking** | ✅ Complete | ✅ Complete | 🟢 Ready |

---

## 🎯 Usage Examples

### Create Course with AI
```typescript
// Frontend
import { CourseCreationWizard } from '@/components';

<CourseCreationWizard
  instructorId={userId}
  onComplete={(courseId) => router.push(`/instructor/courses/${courseId}`)}
/>
```

```bash
# Backend API Call
POST http://localhost:3002/courses/generate-outline
{
  "prompt": "Full Stack Web Development with React and Node.js",
  "difficulty": "INTERMEDIATE",
  "estimatedHours": 40
}
```

### Generate DSA Problem Sheet
```typescript
// Frontend
import { DSASheetGenerator } from '@/components';

<DSASheetGenerator
  userId={userId}
  onGenerate={(problems) => console.log('Generated:', problems)}
/>
```

```bash
# Backend API Call
POST http://localhost:3003/dsa-sheet/generate-sheet
{
  "targetCompany": "Google",
  "difficulty": "MEDIUM",
  "problemCount": 50,
  "focusTopics": ["Arrays", "Dynamic Programming", "Graphs"]
}
```

### Create Learning Roadmap
```typescript
// Frontend
import { RoadmapGenerator } from '@/components';

<RoadmapGenerator
  userId={userId}
  onGenerate={(roadmap) => router.push(`/roadmap/${roadmap.id}`)}
/>
```

```bash
# Backend API Call
POST http://localhost:3004/roadmap/generate
{
  "userId": "user-123",
  "goal": "Become a Full Stack Developer",
  "currentSkillLevel": "BEGINNER",
  "timeCommitment": 10
}
```

---

## 🚀 Quick Start Integration

### 1. Update Instructor Dashboard Page
```typescript
// apps/web/src/app/instructor/page.tsx
import { InstructorDashboardEnhanced } from '@/components';

export default function InstructorPage() {
  return <InstructorDashboardEnhanced instructorId={user.id} />;
}
```

### 2. Create Course Page
```typescript
// apps/web/src/app/instructor/courses/create/page.tsx
import { CourseCreationWizard } from '@/components';

export default function CreateCoursePage() {
  return (
    <CourseCreationWizard
      instructorId={user.id}
      onComplete={(id) => router.push(`/instructor/courses/${id}`)}
    />
  );
}
```

### 3. Course Preview Page
```typescript
// apps/web/src/app/courses/[slug]/page.tsx
import { CoursePreviewPage } from '@/components';

export default function CoursePreview({ params }: { params: { slug: string } }) {
  return <CoursePreviewPage slug={params.slug} />;
}
```

### 4. DSA Sheet Page
```typescript
// apps/web/src/app/dsa/generate/page.tsx
import { DSASheetGenerator } from '@/components';

export default function GenerateDSAPage() {
  return <DSASheetGenerator userId={user.id} />;
}
```

### 5. Roadmap Page
```typescript
// apps/web/src/app/roadmap/page.tsx
import { RoadmapManager } from '@/components';

export default function RoadmapPage() {
  return <RoadmapManager userId={user.id} />;
}
```

---

## 📝 Environment Variables Required

```env
# Frontend (.env.local)
NEXT_PUBLIC_COURSE_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:3006
NEXT_PUBLIC_ASSESSMENT_SERVICE_URL=http://localhost:3003
NEXT_PUBLIC_RECOMMENDATION_SERVICE_URL=http://localhost:3004

# Backend Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://...
```

---

## ✅ All Features Implemented

Both frontend and backend are now **100% complete** with:
- ✅ Course creation (manual + AI)
- ✅ Lesson management (bulk + individual + AI)
- ✅ Content generation (MCQ, coding labs, explanations)
- ✅ Course preview for marketing
- ✅ DSA problem sheet generation
- ✅ Learning roadmap creation
- ✅ Complete CRUD operations
- ✅ Progress tracking
- ✅ Analytics dashboards

You can now build courses like Udemy, generate DSA sheets like LeetCode, and create roadmaps like Roadmap.sh - all with AI assistance! 🚀
