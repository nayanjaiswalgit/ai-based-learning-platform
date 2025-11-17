# Quick Start Guide - Organization Management

Get up and running with the organization management system in 5 minutes.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm installed globally

## Setup (One-Time)

### 1. Install Dependencies

```bash
# Install all dependencies
pnpm install
```

### 2. Setup Database

```bash
# Start PostgreSQL (if using Docker)
docker-compose up -d postgres

# Or use your local PostgreSQL instance
# Make sure it's running on localhost:5432
```

### 3. Configure Environment

```bash
# Copy environment templates
cp packages/database/.env.example packages/database/.env
cp services/auth-service/.env.example services/auth-service/.env
cp services/notification-service/.env.example services/notification-service/.env
cp apps/web/.env.example apps/web/.env.local

# Edit the .env files with your database credentials
```

**Minimum required environment variables:**

```env
# packages/database/.env & services/auth-service/.env
DATABASE_URL=postgresql://user:password@localhost:5432/learning_platform
JWT_SECRET=your-secret-key-here

# services/notification-service/.env
DATABASE_URL=postgresql://user:password@localhost:5432/notification_db

# apps/web/.env.local
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3000
```

### 4. Run Database Migrations

```bash
# Generate Prisma clients
cd packages/database
npx prisma generate

cd ../../services/notification-service
npx prisma generate

# Run migrations
cd ../../packages/database
npx prisma migrate dev --name add-organizations

cd ../../services/notification-service
npx prisma migrate dev --name add-organization-forums
```

### 5. Start Services

**Terminal 1 - Auth Service:**
```bash
cd services/auth-service
pnpm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
pnpm run dev
```

## First Test (2 Minutes)

### 1. Create User & Login

```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "username": "admin",
    "password": "Test123!@#"
  }'

# Login to get token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test123!@#"
  }'

# Copy the "accessToken" from response
export TOKEN="your-access-token-here"
```

### 2. Create Organization (API)

```bash
curl -X POST http://localhost:3000/api/v1/organizations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test University",
    "slug": "test-university",
    "type": "UNIVERSITY",
    "description": "A test university",
    "location": "San Francisco, CA"
  }'
```

**Expected Response:**
```json
{
  "id": "uuid-here",
  "name": "Test University",
  "slug": "test-university",
  "type": "UNIVERSITY",
  "members": [
    {
      "userId": "your-user-id",
      "role": "ADMIN",
      "title": "Founder"
    }
  ]
}
```

### 3. Get Organization Details

```bash
curl http://localhost:3000/api/v1/organizations/test-university \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Get Capabilities (Dynamic Permissions)

```bash
curl http://localhost:3000/api/v1/organizations/test-university/capabilities \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
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
    "members": 1,
    "courses": 0,
    "departments": 0
  },
  "userPermissions": [
    "org:view",
    "org:update",
    "member:add",
    "member:update",
    "member:remove",
    ...
  ]
}
```

✅ **Success!** If you got these responses, the E2E flow is working!

## Test in Browser (3 Minutes)

1. Open browser: `http://localhost:3000`

2. Login with your test account

3. Navigate to: `http://localhost:3000/dashboard/organizations`

4. You should see:
   - "Create Organization" button
   - "My Organizations" tab showing "Test University"

5. Click on "Test University" card

6. You should see:
   - Organization details
   - Stats (1 member, 0 courses, 0 bootcamps)
   - "Settings" button (because you're admin)
   - "Add Member" button (because you have permission)
   - Members tab with your account listed

7. Open browser console and check:
   ```javascript
   // Should see permission hook loading capabilities
   // Network tab should show: GET /organizations/test-university/capabilities
   ```

## Verify Dynamic Permissions

### Test 1: Admin Can See All Buttons

```javascript
// In browser console on organization page
const permissions = window.__permissions; // Debug only
console.log('User has these permissions:', permissions);

// You should see admin permissions:
// - org:update
// - member:add
// - member:update
// - member:remove
// - dept:create
// etc.
```

### Test 2: Student Cannot See Admin Buttons

1. Create another user:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "username": "student",
    "password": "Test123!@#"
  }'
```

2. Add as STUDENT member:
```bash
# Get student user ID from login/register response
curl -X POST http://localhost:3000/api/v1/organizations/test-university/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "student-user-id",
    "role": "STUDENT"
  }'
```

3. Login as student and visit organization page

4. **Expected Behavior:**
   - ❌ "Settings" button NOT visible
   - ❌ "Add Member" button NOT visible
   - ✅ Member list IS visible
   - ✅ Organization details ARE visible

## Quick Permission Test

```bash
# As admin - should succeed
curl -X POST http://localhost:3000/api/v1/organizations/test-university/members \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "new-user", "role": "STUDENT"}'
# ✅ 201 Created

# As student - should fail
curl -X POST http://localhost:3000/api/v1/organizations/test-university/members \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "new-user", "role": "STUDENT"}'
# ❌ 403 Forbidden
```

## Test Subscription Limits

```bash
# Check current usage
curl http://localhost:3000/api/v1/organizations/test-university/capabilities \
  -H "Authorization: Bearer $TOKEN" | jq '.usage, .limits'

# Output:
# {
#   "members": 2,
#   "courses": 0,
#   "departments": 0
# }
# {
#   "maxMembers": 50,
#   "maxCourses": 5,
#   "maxDepartments": 3
# }
```

## Common Issues

### Issue: "Cannot connect to database"
```bash
# Check PostgreSQL is running
pg_isready

# Check connection string in .env
cat packages/database/.env | grep DATABASE_URL
```

### Issue: "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install

# Regenerate Prisma client
cd packages/database && npx prisma generate
```

### Issue: "Port already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm run start:dev
```

### Issue: "Permissions not loading"
```bash
# Check API endpoint exists
curl http://localhost:3000/api/v1/organizations/test-university/capabilities \
  -H "Authorization: Bearer $TOKEN"

# Check browser console for errors
# Check Network tab for failed requests
```

## Troubleshooting Checklist

- [ ] PostgreSQL is running
- [ ] Database migrations completed
- [ ] Prisma clients generated
- [ ] Environment variables set correctly
- [ ] Auth service running on port 3000
- [ ] Frontend running on port 3000 (or configured port)
- [ ] JWT token is valid (not expired)
- [ ] User is member of organization
- [ ] No CORS errors in browser console

## Next Steps

1. Read [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md) for detailed test scenarios
2. Read [PERMISSION_SYSTEM_USAGE.md](./PERMISSION_SYSTEM_USAGE.md) to learn how to use permissions
3. Read [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for architecture details
4. Add more members with different roles
5. Create departments
6. Test different organization types (COMPANY, BOOTCAMP, etc.)
7. Test subscription limits by adding 50 members

## Success Criteria

✅ Organization created via API
✅ Organization visible in UI
✅ Capabilities endpoint returns permissions
✅ UI shows/hides buttons based on permissions
✅ Admin can add members
✅ Student cannot add members
✅ Permission checks work on backend
✅ No errors in console

**If all checked ✅ - You're ready to go!** 🎉

## Help

- **Documentation**: See all `*.md` files in root
- **API Docs**: http://localhost:3000/api/docs (Swagger)
- **Issues**: Check browser console and server logs
- **Database**: Use Prisma Studio: `npx prisma studio`
