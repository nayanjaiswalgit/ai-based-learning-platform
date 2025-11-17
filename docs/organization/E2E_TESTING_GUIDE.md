# End-to-End Testing Guide

Complete guide for testing the organization management system from frontend to backend.

## Prerequisites

1. **Database Setup**
   ```bash
   # Start PostgreSQL (via Docker or locally)
   docker-compose up -d postgres

   # Generate Prisma clients
   cd packages/database
   npx prisma generate

   cd ../../services/notification-service
   npx prisma generate
   ```

2. **Run Migrations**
   ```bash
   # Main database
   cd packages/database
   npx prisma migrate dev --name add-organizations

   # Notification service database
   cd ../../services/notification-service
   npx prisma migrate dev --name add-organization-forums
   ```

3. **Install Dependencies**
   ```bash
   # Root
   pnpm install

   # Services
   cd services/auth-service && pnpm install
   cd services/notification-service && pnpm install

   # Web app
   cd apps/web && pnpm install
   ```

4. **Environment Variables**
   ```env
   # apps/web/.env.local
   NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3000

   # services/auth-service/.env
   DATABASE_URL=postgresql://user:password@localhost:5432/learning_platform
   JWT_SECRET=your-secret-key

   # services/notification-service/.env
   DATABASE_URL=postgresql://user:password@localhost:5432/notification_db
   ```

## E2E Test Scenarios

### Scenario 1: Create University Organization

**Steps:**
1. Start backend services
   ```bash
   cd services/auth-service
   pnpm run start:dev
   ```

2. Start frontend
   ```bash
   cd apps/web
   pnpm run dev
   ```

3. **Frontend Test:**
   - Navigate to `http://localhost:3000/dashboard/organizations`
   - Click "Create Organization"
   - Fill form:
     ```
     Name: Stanford University
     Slug: stanford-university (auto-generated)
     Type: UNIVERSITY
     Description: Leading research university
     Location: Stanford, CA
     ```
   - Click "Create Organization"

4. **Expected Behavior:**
   - Success toast appears
   - Organization card appears in "My Organizations" tab
   - User is listed as admin with "Founder" title

5. **Backend Verification:**
   ```bash
   # Check database
   psql -d learning_platform -c "SELECT * FROM organizations WHERE slug='stanford-university';"

   # Check API
   curl http://localhost:3000/api/v1/organizations/stanford-university \
     -H "Authorization: Bearer <token>"
   ```

6. **Expected Response:**
   ```json
   {
     "id": "uuid",
     "name": "Stanford University",
     "slug": "stanford-university",
     "type": "UNIVERSITY",
     "description": "Leading research university",
     "location": "Stanford, CA",
     "creator": {
       "id": "user-id",
       "username": "admin"
     },
     "members": [
       {
         "userId": "user-id",
         "role": "ADMIN",
         "title": "Founder"
       }
     ],
     "_count": {
       "members": 1,
       "courses": 0,
       "bootcamps": 0
     }
   }
   ```

### Scenario 2: Add Member with Custom Title

**Steps:**
1. Navigate to organization detail page
   - URL: `/dashboard/organizations/stanford-university`

2. Click "Add Member" button (only visible if has permission)

3. Fill member form:
   ```
   User: professor@stanford.edu (search/select)
   Role: INSTRUCTOR
   Title: Professor
   Department: Computer Science
   ```

4. Click "Add"

5. **Expected Behavior:**
   - Success toast
   - Member appears in table with:
     - Role badge: "INSTRUCTOR"
     - Custom title: "Professor"
     - Department: "Computer Science"

6. **Backend Verification:**
   ```bash
   curl http://localhost:3000/api/v1/organizations/stanford-university/members \
     -H "Authorization: Bearer <token>"
   ```

7. **Expected Response:**
   ```json
   [
     {
       "id": "member-id",
       "role": "INSTRUCTOR",
       "title": "Professor",
       "department": {
         "name": "Computer Science"
       },
       "user": {
         "username": "professor",
         "email": "professor@stanford.edu"
       }
     }
   ]
   ```

### Scenario 3: Permission Check (Dynamic)

**Steps:**
1. Login as student user

2. Navigate to organization page

3. **Frontend Test - Permission Hook:**
   ```typescript
   const { hasPermission, capabilities } = useOrganizationPermissions(orgId);

   console.log('Capabilities:', capabilities);
   // Should show:
   // {
   //   permissions: ['org:view', 'course:view', 'forum:post'],
   //   features: ['basic_courses', 'basic_forums'],
   //   limits: { maxMembers: 50, maxCourses: 5 },
   //   userPermissions: ['org:view', 'course:view', ...]
   // }
   ```

4. **Expected UI Behavior:**
   - ❌ "Add Member" button NOT visible (no MEMBER_ADD permission)
   - ❌ "Settings" button NOT visible (no ORG_UPDATE permission)
   - ✅ Member list IS visible (has MEMBER_VIEW permission)
   - ✅ "Ask Question" IS visible (has FORUM_POST permission)

5. **Backend Verification:**
   ```bash
   # As student
   curl http://localhost:3000/api/v1/organizations/stanford-university/capabilities \
     -H "Authorization: Bearer <student-token>"
   ```

6. **Expected Response:**
   ```json
   {
     "tier": "FREE",
     "features": ["basic_courses", "basic_forums"],
     "limits": {
       "maxMembers": 50,
       "maxCourses": 5,
       "maxDepartments": 3
     },
     "usage": {
       "members": 2,
       "courses": 0,
       "departments": 1
     },
     "userPermissions": [
       "org:view",
       "member:view",
       "dept:view",
       "course:view",
       "course:enroll",
       "forum:view",
       "forum:post",
       "forum:reply",
       "mentor:view",
       "mentor:request"
     ]
   }
   ```

### Scenario 4: Subscription Tier Limits

**Steps:**
1. As admin, add 49 members to FREE tier organization

2. Try to add 50th member

3. **Backend Test:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/organizations/stanford-university/members \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "new-user-id",
       "role": "STUDENT"
     }'
   ```

4. **Expected Behavior:**
   - ✅ 50th member added successfully (at limit)

5. Try to add 51st member

6. **Expected Response:**
   ```json
   {
     "statusCode": 403,
     "message": "Member limit reached. Upgrade to PREMIUM for 500 members.",
     "error": "Forbidden"
   }
   ```

7. **Frontend Behavior:**
   - Shows upgrade modal:
     ```
     You've reached your member limit (50/50).
     Upgrade to PREMIUM for 500 members.
     [Upgrade Now] [Cancel]
     ```

### Scenario 5: Department Management

**Steps:**
1. Login as admin

2. Navigate to "Departments" tab

3. Click "Create Department"

4. Fill form:
   ```
   Name: Computer Science
   Description: CS Department
   Head: Professor John Doe (select from members)
   ```

5. Click "Create"

6. **Backend Verification:**
   ```bash
   curl http://localhost:3000/api/v1/organizations/stanford-university/departments \
     -H "Authorization: Bearer <token>"
   ```

7. **Expected Response:**
   ```json
   [
     {
       "id": "dept-id",
       "name": "Computer Science",
       "description": "CS Department",
       "headMemberId": "member-id",
       "_count": {
         "members": 0
       }
     }
   ]
   ```

8. Assign member to department:
   - Edit member
   - Select "Computer Science" department
   - Save

9. **Verify department has members:**
   ```json
   {
     "id": "dept-id",
     "name": "Computer Science",
     "_count": {
       "members": 1
     }
   }
   ```

### Scenario 6: Mentor Discovery

**Steps:**
1. Navigate to "Mentors" tab in organization

2. **Filter by department:**
   - Select "Computer Science" from dropdown
   - Click "Filter"

3. **Expected Behavior:**
   - Shows list of mentors with MENTOR role
   - Filtered to Computer Science department
   - Shows mentor skills and expertise
   - "Connect" button available for each mentor

4. **Backend Test:**
   ```bash
   curl "http://localhost:3000/api/v1/organizations/stanford-university/mentors?departmentId=dept-id" \
     -H "Authorization: Bearer <token>"
   ```

5. **Expected Response:**
   ```json
   [
     {
       "id": "member-id",
       "role": "MENTOR",
       "title": "Teaching Assistant",
       "department": {
         "name": "Computer Science"
       },
       "user": {
         "username": "ta-john",
         "profile": {
           "fullName": "John Doe"
         },
         "skills": [
           {
             "skill": {
               "name": "JavaScript",
               "category": "Programming"
             }
           }
         ]
       }
     }
   ]
   ```

### Scenario 7: Search and Filter Organizations

**Steps:**
1. Navigate to `/dashboard/organizations`

2. Switch to "Browse All" tab

3. **Test Search:**
   - Type "Stanford" in search box
   - Results update in real-time

4. **Test Type Filter:**
   - Select "UNIVERSITY" from dropdown
   - Results filtered to universities only

5. **Backend Test:**
   ```bash
   curl "http://localhost:3000/api/v1/organizations?search=Stanford&type=UNIVERSITY&limit=20" \
     -H "Authorization: Bearer <token>"
   ```

6. **Expected Response:**
   ```json
   {
     "organizations": [
       {
         "name": "Stanford University",
         "type": "UNIVERSITY",
         "_count": {
           "members": 50,
           "courses": 10
         }
       }
     ],
     "total": 1,
     "limit": 20,
     "offset": 0
   }
   ```

## API Endpoint Tests

### Test All Endpoints

```bash
# Get all organizations
curl http://localhost:3000/api/v1/organizations \
  -H "Authorization: Bearer <token>"

# Get my organizations
curl http://localhost:3000/api/v1/organizations/my-organizations \
  -H "Authorization: Bearer <token>"

# Get organization by slug
curl http://localhost:3000/api/v1/organizations/stanford-university \
  -H "Authorization: Bearer <token>"

# Get capabilities (CRITICAL - dynamic permissions)
curl http://localhost:3000/api/v1/organizations/stanford-university/capabilities \
  -H "Authorization: Bearer <token>"

# Get suggested titles
curl http://localhost:3000/api/v1/organizations/stanford-university/suggested-titles \
  -H "Authorization: Bearer <token>"

# Get members
curl http://localhost:3000/api/v1/organizations/stanford-university/members \
  -H "Authorization: Bearer <token>"

# Get departments
curl http://localhost:3000/api/v1/organizations/stanford-university/departments \
  -H "Authorization: Bearer <token>"

# Get mentors
curl http://localhost:3000/api/v1/organizations/stanford-university/mentors \
  -H "Authorization: Bearer <token>"

# Create organization
curl -X POST http://localhost:3000/api/v1/organizations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MIT",
    "slug": "mit",
    "type": "UNIVERSITY"
  }'

# Update organization
curl -X PUT http://localhost:3000/api/v1/organizations/mit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Massachusetts Institute of Technology"
  }'

# Add member
curl -X POST http://localhost:3000/api/v1/organizations/mit/members \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "role": "INSTRUCTOR",
    "title": "Professor"
  }'

# Update member
curl -X PUT http://localhost:3000/api/v1/organizations/members/member-id \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Associate Professor"
  }'

# Remove member
curl -X DELETE http://localhost:3000/api/v1/organizations/members/member-id \
  -H "Authorization: Bearer <token>"

# Create department
curl -X POST http://localhost:3000/api/v1/organizations/mit/departments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Computer Science",
    "description": "CS Department"
  }'
```

## Permission Testing Matrix

| User Role | ORG_UPDATE | MEMBER_ADD | COURSE_CREATE | FORUM_POST |
|-----------|------------|------------|---------------|------------|
| STUDENT   | ❌         | ❌         | ❌            | ✅         |
| MENTOR    | ❌         | ❌         | ❌            | ✅         |
| INSTRUCTOR| ❌         | ❌         | ✅            | ✅         |
| ADMIN     | ✅         | ✅         | ✅            | ✅         |

## Common Issues & Solutions

### Issue 1: "Organization not found"
**Solution:** Check slug format (lowercase, hyphens only)

### Issue 2: "Permission denied"
**Solution:** Verify user is member of organization with correct role

### Issue 3: "Cannot read property 'permissions'"
**Solution:** Ensure capabilities endpoint is being called and returning data

### Issue 4: "Limit reached" when shouldn't be
**Solution:** Check organization settings.subscriptionTier value

### Issue 5: Frontend shows admin buttons to non-admins
**Solution:** Permission hook not working - check browser console for API errors

## Performance Benchmarks

Expected response times:
- GET /organizations: < 100ms
- GET /organizations/:slug: < 150ms
- GET /organizations/:slug/capabilities: < 50ms
- POST /organizations/:slug/members: < 200ms

## Security Checklist

- [ ] Permission checks on both frontend AND backend
- [ ] SQL injection prevented (Prisma ORM)
- [ ] XSS prevented (React escaping)
- [ ] CSRF tokens implemented
- [ ] Rate limiting enabled
- [ ] Input validation (DTOs)
- [ ] Error messages don't leak sensitive info
- [ ] JWT tokens properly validated

## Success Criteria

✅ All API endpoints return expected responses
✅ Permission system works dynamically (not hardcoded)
✅ UI adapts based on user permissions
✅ Subscription limits enforced
✅ Search and filter work correctly
✅ Database constraints prevent invalid data
✅ No TypeScript/compilation errors
✅ Responsive UI on mobile/tablet/desktop

## Next Steps After E2E Testing

1. Add unit tests for services
2. Add integration tests for controllers
3. Add E2E tests with Playwright/Cypress
4. Load testing with k6 or Artillery
5. Security audit
6. Performance optimization
7. Monitoring and logging setup
