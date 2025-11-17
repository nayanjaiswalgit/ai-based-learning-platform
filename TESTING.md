# 🧪 Testing Guide - AI-Based Learning Platform

Comprehensive guide for testing the platform's features and APIs.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Running Tests](#running-tests)
- [API Testing](#api-testing)
- [E2E Testing](#e2e-testing)
- [Manual Testing Checklist](#manual-testing-checklist)
- [Test Data](#test-data)

## Prerequisites

Before running tests, ensure:

1. All services are running (see [SETUP.md](./SETUP.md))
2. Databases are initialized
3. Test environment variables are configured

## 🏃 Running Tests

### All Tests

```bash
# Run all tests across all packages
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

### Service-Specific Tests

```bash
# Auth Service
cd services/auth-service
pnpm test

# Analytics Service
cd services/analytics-service
pnpm test

# Frontend
cd apps/web
pnpm test
```

### E2E Tests

```bash
cd apps/web

# Run e2e tests
pnpm test:e2e

# Run e2e tests in UI mode
pnpm test:e2e:ui

# Run e2e tests in headed mode (see browser)
pnpm test:e2e:headed

# Debug specific test
pnpm test:e2e:debug
```

### Integration Tests

```bash
# Run integration tests
pnpm test:integration

# Run for specific service
cd services/auth-service
pnpm test:integration
```

## 🔌 API Testing

### Using cURL

#### Authentication

**Register User:**

```bash
curl -X POST http://localhost:3002/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "username": "testuser",
    "fullName": "Test User"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

**Get User Profile:**

```bash
curl http://localhost:3002/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Analytics

**Get User Analytics:**

```bash
curl http://localhost:3003/user-analytics/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get Platform Metrics (Admin):**

```bash
curl http://localhost:3003/admin-analytics/platform-metrics \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### Courses

**Get All Courses:**

```bash
curl http://localhost:3007/courses
```

**Get Course by ID:**

```bash
curl http://localhost:3007/courses/COURSE_ID
```

**Enroll in Course:**

```bash
curl -X POST http://localhost:3007/enrollments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE_ID"
  }'
```

#### Bootcamps

**Get All Bootcamps:**

```bash
curl http://localhost:3006/bootcamps
```

**Apply to Bootcamp:**

```bash
curl -X POST http://localhost:3006/bootcamps/apply \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bootcampId": "BOOTCAMP_ID",
    "motivation": "I want to learn..."
  }'
```

### Using Postman/Thunder Client

Import the API collection:

1. **Install Extension** (if using VS Code):
   - Thunder Client or REST Client

2. **Create Collection:**
   - Base URL: `http://localhost:3002`
   - Add requests for all endpoints

3. **Environment Variables:**
   ```json
   {
     "baseUrl": "http://localhost:3002",
     "authToken": "{{jwt_token}}",
     "userId": "{{user_id}}"
   }
   ```

### Health Checks

Check if all services are running:

```bash
# Frontend
curl http://localhost:3000/api/health

# Auth Service
curl http://localhost:3002/health

# Analytics
curl http://localhost:3003/health

# AI Service
curl http://localhost:3004/health

# Assessment
curl http://localhost:3005/health

# Bootcamp
curl http://localhost:3006/health
```

## 🎭 E2E Testing

### Test Structure

```
apps/web/e2e/
├── fixtures/
│   └── auth.fixture.ts         # Authentication helpers
├── helpers/
│   └── test-helpers.ts          # Utility functions
└── tests/
    ├── auth.spec.ts             # Authentication tests
    ├── courses.spec.ts          # Course tests
    ├── dashboard.spec.ts        # Dashboard tests
    └── bootcamps.spec.ts        # Bootcamp tests
```

### Running Specific Tests

```bash
# Run specific test file
npx playwright test e2e/tests/auth.spec.ts

# Run tests matching pattern
npx playwright test --grep "login"

# Run tests in specific browser
npx playwright test --project=chromium
```

### Writing E2E Tests

Example test:

```typescript
import { test, expect } from '../fixtures/auth.fixture'

test.describe('User Dashboard', () => {
  test('should display user courses', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')

    // Wait for courses to load
    await authenticatedPage.waitForSelector('[data-testid="course-list"]')

    // Check courses are displayed
    const courses = await authenticatedPage.locator('[data-testid="course-card"]')
    await expect(courses).toHaveCount.greaterThan(0)
  })
})
```

### Test Reports

View test results:

```bash
# Generate and open HTML report
npx playwright show-report

# View trace for failed test
npx playwright show-trace trace.zip
```

## ✅ Manual Testing Checklist

### Authentication Flow

- [ ] User Registration
  - [ ] Valid email and password
  - [ ] Email verification sent
  - [ ] Duplicate email prevented
  - [ ] Password strength validation

- [ ] User Login
  - [ ] Correct credentials
  - [ ] Invalid credentials rejected
  - [ ] JWT token received
  - [ ] Session persisted

- [ ] Password Reset
  - [ ] Request reset email
  - [ ] Reset token works
  - [ ] Password updated successfully

- [ ] OAuth Login
  - [ ] Google OAuth works
  - [ ] GitHub OAuth works
  - [ ] Profile data synced

### Course Features

- [ ] Browse Courses
  - [ ] List all courses
  - [ ] Filter by category
  - [ ] Search courses
  - [ ] Pagination works

- [ ] Course Details
  - [ ] View course content
  - [ ] See instructor info
  - [ ] Check prerequisites
  - [ ] View reviews/ratings

- [ ] Course Enrollment
  - [ ] Enroll in free course
  - [ ] Purchase paid course
  - [ ] Access enrolled course
  - [ ] Track progress

### Bootcamp Features

- [ ] Browse Bootcamps
  - [ ] View all bootcamps
  - [ ] Filter by difficulty
  - [ ] Search functionality

- [ ] Bootcamp Application
  - [ ] Submit application
  - [ ] Upload documents
  - [ ] Application status tracking

- [ ] Cohort Management
  - [ ] Join cohort
  - [ ] View cohort dashboard
  - [ ] Participate in discussions
  - [ ] Submit assignments

### Analytics Dashboard

- [ ] User Analytics
  - [ ] View learning streak
  - [ ] See time spent
  - [ ] Track course progress
  - [ ] View achievements

- [ ] Instructor Analytics
  - [ ] Student engagement metrics
  - [ ] Course performance
  - [ ] Revenue tracking

- [ ] Admin Analytics
  - [ ] Platform metrics
  - [ ] User growth
  - [ ] Revenue analytics
  - [ ] Content metrics

### Search & Filter

- [ ] Global Search
  - [ ] Search courses
  - [ ] Search instructors
  - [ ] Search topics
  - [ ] Auto-suggestions work

- [ ] Filter Functionality
  - [ ] Filter by category
  - [ ] Filter by difficulty
  - [ ] Filter by price
  - [ ] Multiple filters work together
  - [ ] Clear filters works

### User Invitation

- [ ] Invite User
  - [ ] Send invitation email
  - [ ] Generate invitation link
  - [ ] Copy link to clipboard
  - [ ] Set user role
  - [ ] Invitation expires correctly

### UI/UX

- [ ] Responsive Design
  - [ ] Mobile view (< 768px)
  - [ ] Tablet view (768px - 1024px)
  - [ ] Desktop view (> 1024px)

- [ ] Dark Mode
  - [ ] Toggle dark/light mode
  - [ ] Preference saved
  - [ ] All components styled correctly

- [ ] Accessibility
  - [ ] Keyboard navigation works
  - [ ] Screen reader compatible
  - [ ] ARIA labels present
  - [ ] Color contrast meets WCAG

### Performance

- [ ] Page Load Times
  - [ ] Homepage < 2s
  - [ ] Dashboard < 3s
  - [ ] Course page < 2s

- [ ] API Response Times
  - [ ] Auth endpoints < 500ms
  - [ ] Query endpoints < 1s
  - [ ] Mutation endpoints < 2s

## 📊 Test Data

### Test Users

```json
{
  "student": {
    "email": "student@test.com",
    "password": "Test123!@#",
    "role": "STUDENT"
  },
  "instructor": {
    "email": "instructor@test.com",
    "password": "Test123!@#",
    "role": "INSTRUCTOR"
  },
  "admin": {
    "email": "admin@test.com",
    "password": "Test123!@#",
    "role": "ADMIN"
  }
}
```

### Test Courses

```json
{
  "freeCourse": {
    "id": "test-free-course-1",
    "title": "Introduction to Programming",
    "price": 0,
    "category": "Programming"
  },
  "paidCourse": {
    "id": "test-paid-course-1",
    "title": "Advanced React Patterns",
    "price": 49.99,
    "category": "Web Development"
  }
}
```

### Database Seeding

Seed test data:

```bash
# Auth service
cd services/auth-service
pnpm prisma db seed

# Course service
cd services/course-service
pnpm prisma db seed
```

## 🐛 Debugging Tests

### Enable Debug Mode

```bash
# Playwright debug mode
PWDEBUG=1 pnpm test:e2e

# Node.js debug mode
NODE_OPTIONS='--inspect-brk' pnpm test
```

### View Browser Console

```bash
# Run with headed browser
pnpm test:e2e:headed
```

### Trace Viewer

```bash
# Generate trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

## 📈 Continuous Integration

### GitHub Actions

Tests run automatically on:

- Pull requests
- Pushes to main/master
- Scheduled daily runs

View results at: `.github/workflows/test.yml`

## 🎯 Test Coverage Goals

- **Unit Tests:** > 80% coverage
- **Integration Tests:** > 70% coverage
- **E2E Tests:** Critical user flows covered

View coverage:

```bash
pnpm test:coverage
```

---

**Need Help?** Check the logs in `logs/` or open an issue on GitHub.
