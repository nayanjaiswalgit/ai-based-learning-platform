# Organization Types & Roles Implementation Summary

This document summarizes the complete implementation of organization types, role management, and communication features for the AI-Based Learning Platform.

## Overview

The platform now supports multiple organization types (universities, colleges, companies, bootcamps, etc.) with flexible role-based access control using a title-based mapping system. This allows organizations to use custom titles (Dean, Professor, CTO, etc.) while maintaining a clean core role system.

## Backend Implementation

### 1. Database Schema Changes

#### Main Database (`packages/database/prisma/schema.prisma`)

**New Models:**
- `Organization` - Represents organizations (universities, colleges, companies, etc.)
  - Fields: name, slug, type, description, website, logoUrl, industry, location, settings
  - Relations: creator, members, courses, bootcamps, departments

- `OrganizationMember` - Membership with role and title
  - Fields: role (core UserRole), title (custom title like "Dean"), departmentId, permissions
  - Flexible permission system via JSON field
  - Soft delete support (leftAt field)

- `OrganizationDepartment` - Organizational departments
  - Fields: name, description, headMemberId
  - Relations: organization, members

**Enums:**
- `OrganizationType`: UNIVERSITY, COLLEGE, COMPANY, BOOTCAMP, TRAINING_CENTER, SCHOOL, OTHER
- `UserRole` (existing): STUDENT, INSTRUCTOR, MENTOR, ADMIN

**Updated Models:**
- `User` - Added relations: organizationMembers, createdOrganizations
- `Course` - Added optional organizationId field
- `Bootcamp` - Added optional organizationId field

#### Notification Service Schema (`services/notification-service/prisma/schema.prisma`)

**Updated:**
- `ForumCategory` - Added organizationId and categoryType fields
- New enum `ForumCategoryType`: GENERAL, COURSE, ORGANIZATION, QUESTION, ISSUE, ANNOUNCEMENT

This enables organization-specific forums for questions, issues, and discussions.

### 2. Organization Service (Auth Service)

**Location:** `services/auth-service/src/modules/organization/`

**DTOs Created:**
- `CreateOrganizationDto` - Organization creation with validation
- `UpdateOrganizationDto` - Organization updates
- `AddMemberDto` - Add member with role, title, and department
- `UpdateMemberDto` - Update member details
- `CreateDepartmentDto` - Create departments

**Service Features (`organization.service.ts`):**
- Full CRUD operations for organizations
- Member management (add, update, remove with soft delete)
- Department management
- User organization discovery
- Mentor discovery within organizations
- Permission checks (admin-only operations)

**Controller Endpoints (`organization.controller.ts`):**

**Organization Management:**
- `POST /organizations` - Create organization
- `GET /organizations` - List all (with filters: type, search, pagination)
- `GET /organizations/my-organizations` - Current user's organizations
- `GET /organizations/:slug` - Get by slug
- `PUT /organizations/:slug` - Update (admin only)
- `DELETE /organizations/:slug` - Delete (creator only)

**Member Management:**
- `POST /organizations/:slug/members` - Add member (admin only)
- `GET /organizations/:slug/members` - List members (with filters)
- `PUT /organizations/members/:memberId` - Update member (admin only)
- `DELETE /organizations/members/:memberId` - Remove member (admin only)

**Department Management:**
- `POST /organizations/:slug/departments` - Create department (admin only)
- `GET /organizations/:slug/departments` - List departments
- `PUT /organizations/departments/:departmentId` - Update (admin only)
- `DELETE /organizations/departments/:departmentId` - Delete (admin only)

**Discovery:**
- `GET /organizations/:slug/mentors` - Find mentors in organization
- `GET /organizations/:slug/suggested-titles` - Get suggested titles for org type

### 3. Title-to-Role Mapping System

**Location:** `services/auth-service/src/modules/organization/constants/title-role-mapping.ts`

**Features:**
- Pre-defined title-to-role mappings for different organization types
- Academic titles: Dean → ADMIN, Professor → INSTRUCTOR, TA → MENTOR, Student → STUDENT
- Corporate titles: CTO → ADMIN, Tech Lead → INSTRUCTOR, Senior Engineer → MENTOR, Developer → STUDENT
- Suggested titles per organization type
- Helper functions for role resolution and display names

**Benefits:**
- No role explosion - maintains 4 core roles
- Flexible custom titles per organization
- Clear permission inheritance
- Easy to extend with new titles

## Frontend Implementation

### 1. API Client

**Location:** `apps/web/src/lib/api/organization-client.ts`

**Features:**
- TypeScript interfaces for all models
- Complete API methods for all backend endpoints
- Request wrapper integration
- Type-safe query parameters

### 2. UI Components

**Created Components:**

1. **CreateOrganizationDialog** (`components/organization/CreateOrganizationDialog.tsx`)
   - Modal form for creating organizations
   - Auto-slug generation from name
   - Organization type selection
   - Form validation with react-hook-form

2. **OrganizationCard** (`components/organization/OrganizationCard.tsx`)
   - Card display for organization list
   - Shows type badge, stats (members, courses, bootcamps)
   - Logo/avatar display
   - Click to navigate to detail page

3. **OrganizationMembersList** (`components/organization/OrganizationMembersList.tsx`)
   - Table view of organization members
   - Shows role badges, titles, departments
   - Admin actions: edit, remove members
   - Role-based badge colors

### 3. Pages

**Created Pages:**

1. **Organizations List** (`app/dashboard/organizations/page.tsx`)
   - Two tabs: "My Organizations" and "Browse All"
   - Search and filter by organization type
   - Grid layout with OrganizationCard components
   - Create organization button

2. **Organization Detail** (`app/dashboard/organizations/[slug]/page.tsx`)
   - Organization header with logo, name, type, location, website
   - Stats cards: members, courses, bootcamps, departments
   - Tabs: Members, Courses, Departments, Mentors
   - Member management table
   - Role-based UI (admin sees settings and add member buttons)
   - User's membership role display

## Key Features Implemented

### 1. Flexible Organization Types
- Universities, colleges, companies, bootcamps, training centers, schools
- Custom settings per organization type (JSON field)
- Type-specific suggested titles

### 2. Role & Title System
- **Core Roles**: STUDENT, INSTRUCTOR, MENTOR, ADMIN
- **Custom Titles**: Dean, Professor, CTO, Tech Lead, etc.
- **Title Mapping**: Automatic role inference from titles
- **Permission Overrides**: JSON field for custom permissions per member

### 3. Department Management
- Create departments within organizations
- Assign members to departments
- Department head designation
- Filter members by department

### 4. Member Management
- Add members with role and title
- Update member details
- Soft delete (leftAt timestamp)
- Cannot remove organization creator

### 5. Communication Ready
- Organization-scoped forum categories
- Category types: QUESTION, ISSUE, ANNOUNCEMENT
- Ready for forum implementation

### 6. Mentor Discovery
- Find mentors within organization
- Filter by department
- Skills integration ready

## User Flows Supported

### 1. Create Organization
1. User clicks "Create Organization"
2. Fills form (name, type, description, etc.)
3. Auto-generates URL-friendly slug
4. Becomes organization admin with "Founder" title

### 2. Add Member
1. Admin navigates to organization
2. Clicks "Add Member"
3. Selects user, assigns role and custom title
4. Optionally assigns to department
5. Member can now access organization resources

### 3. Browse Organizations
1. User views "Organizations" page
2. Can browse all organizations or view own
3. Filter by type (university, company, etc.)
4. Search by name/description
5. Click to view details

### 4. Manage Members
1. Admin views organization members
2. Can edit roles, titles, departments
3. Can remove members (except creator)
4. View member details and join dates

### 5. Connect with Mentors
1. Student/learner views organization
2. Navigates to "Mentors" tab
3. Sees mentors with skills and expertise
4. Can filter by department
5. Ready to connect via messaging (to be implemented)

### 6. Report Issues / Ask Questions
1. Member navigates to organization forums
2. Views QUESTION or ISSUE categories
3. Posts thread
4. Organization members can respond
5. Admin/mentors can mark best answers

## Architecture Decisions

### 1. Why Only 4 Core Roles?
- **Simplicity**: Easy to understand and maintain
- **Scalability**: Adding roles doesn't require schema changes
- **Flexibility**: Titles provide customization without complexity
- **Permissions**: Clear hierarchy (ADMIN > INSTRUCTOR > MENTOR > STUDENT)

### 2. Why Title-Based Mapping?
- **User-Friendly**: Organizations use familiar titles
- **Consistent**: Same underlying permissions
- **Extensible**: New titles added without code changes
- **Display**: Better UX than showing "ADMIN" everywhere

### 3. Why Soft Delete for Members?
- **Audit Trail**: Keep history of membership
- **Analytics**: Track member retention
- **Reversible**: Can reactivate if needed
- **Data Integrity**: Preserves relations

### 4. Why Organization-Scoped Forums?
- **Isolation**: Each org has its own discussions
- **Relevance**: Questions relevant to org context
- **Moderation**: Org admins can moderate
- **Privacy**: Can make forums private to org

## Next Steps (Not Implemented)

### 1. Forum UI Implementation
- Forum category list for organizations
- Thread creation and viewing
- Reply system
- Voting and best answer marking

### 2. Advanced Member Features
- Bulk import members
- Email invitations
- Member approval workflow
- Custom permission editor UI

### 3. Department Features
- Department dashboard
- Department-specific courses
- Department head permissions

### 4. Integration Features
- Organization courses (link existing courses)
- Organization bootcamps
- Enrollment management
- Progress tracking

### 5. Analytics
- Member growth over time
- Course completion rates
- Engagement metrics
- Department statistics

## Migration & Testing

### Required Migrations

1. **Main Database**:
   ```bash
   cd packages/database
   npx prisma generate
   npx prisma migrate dev --name add-organizations
   ```

2. **Notification Service**:
   ```bash
   cd services/notification-service
   npx prisma generate
   npx prisma migrate dev --name add-organization-forums
   ```

### Testing Checklist

- [ ] Create organization (all types)
- [ ] Update organization details
- [ ] Add members with different roles
- [ ] Update member roles and titles
- [ ] Remove members
- [ ] Create departments
- [ ] Assign members to departments
- [ ] Search and filter organizations
- [ ] View organization details
- [ ] Test permission checks (admin-only actions)
- [ ] Verify organization creator cannot be removed
- [ ] Test slug uniqueness validation

## Files Created/Modified

### Backend
```
services/auth-service/src/modules/organization/
├── dto/
│   ├── create-organization.dto.ts
│   ├── update-organization.dto.ts
│   ├── add-member.dto.ts
│   ├── update-member.dto.ts
│   ├── create-department.dto.ts
│   └── index.ts
├── constants/
│   └── title-role-mapping.ts
├── organization.service.ts (updated)
├── organization.controller.ts (updated)
└── organization.module.ts (existing)

packages/database/prisma/
└── schema.prisma (updated - added Organization models)

services/notification-service/prisma/
└── schema.prisma (updated - added org forums)
```

### Frontend
```
apps/web/src/
├── lib/api/
│   └── organization-client.ts
├── components/organization/
│   ├── CreateOrganizationDialog.tsx
│   ├── OrganizationCard.tsx
│   ├── OrganizationMembersList.tsx
│   └── index.ts
└── app/dashboard/organizations/
    ├── page.tsx
    └── [slug]/
        └── page.tsx
```

## Environment Variables

Add to `.env.development`:
```
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3000
```

## API Documentation

All endpoints are documented with Swagger/OpenAPI decorators. Access API docs at:
```
http://localhost:3000/api/docs
```

## Conclusion

This implementation provides a complete, scalable solution for managing different organization types with flexible role assignments. The system avoids role explosion by using a title-based mapping approach while maintaining clear permission hierarchies. The UI is clean, responsive, and follows the existing design patterns of the platform.

The architecture supports future enhancements like organization-scoped forums, advanced member management, department features, and comprehensive analytics without requiring significant refactoring.
