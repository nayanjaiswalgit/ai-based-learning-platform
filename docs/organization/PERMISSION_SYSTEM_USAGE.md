# Permission System Usage Guide

This guide shows how to use the dynamic permission and feature flag system (NOT hardcoded!).

## ✅ Correct Usage (Dynamic)

### Backend - Check Permissions Dynamically

```typescript
import { Permission } from './constants/permissions';
import { OrganizationPermissionsService } from './organization-permissions.service';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly permissionsService: OrganizationPermissionsService,
  ) {}

  @Post(':slug/courses')
  async createCourse(
    @Param('slug') slug: string,
    @CurrentUser() user: any,
  ) {
    const org = await this.organizationService.getBySlug(slug);

    // ✅ Check permission dynamically
    const canCreate = await this.permissionsService.checkPermission(
      user.id,
      org.id,
      Permission.COURSE_CREATE
    );

    if (!canCreate) {
      throw new ForbiddenException('You do not have permission to create courses');
    }

    // Create course...
  }
}
```

### Frontend - Use Permission Hook

```tsx
import { useOrganizationPermissions, Permission } from '@/lib/hooks/useOrganizationPermissions';

function OrganizationPage({ orgId }: { orgId: string }) {
  // ✅ Load permissions dynamically from API
  const { hasPermission, hasFeature, isLimitReached } = useOrganizationPermissions(orgId);

  return (
    <div>
      {/* ✅ Dynamic permission check - UI adapts based on API response */}
      {hasPermission(Permission.COURSE_CREATE) && (
        <Button onClick={createCourse}>Create Course</Button>
      )}

      {/* ✅ Feature flag check */}
      {hasFeature(Feature.ADVANCED_ANALYTICS) ? (
        <AdvancedAnalyticsDashboard />
      ) : (
        <BasicAnalyticsDashboard />
      )}

      {/* ✅ Limit check */}
      {isLimitReached('maxCourses') && (
        <UpgradePrompt message="You've reached your course limit. Upgrade to create more." />
      )}
    </div>
  );
}
```

### Using PermissionGate Component

```tsx
import { PermissionGate, Permission } from '@/lib/hooks/useOrganizationPermissions';

function MemberManagement({ orgId }: { orgId: string }) {
  return (
    <div>
      {/* ✅ Only renders if user has permission */}
      <PermissionGate
        permission={Permission.MEMBER_ADD}
        organizationId={orgId}
        fallback={<p>You don't have permission to add members</p>}
      >
        <AddMemberButton />
      </PermissionGate>

      {/* ✅ Multiple permissions (any) */}
      <PermissionGate
        permission={[Permission.MEMBER_UPDATE, Permission.MEMBER_REMOVE]}
        organizationId={orgId}
      >
        <MemberActions />
      </PermissionGate>

      {/* ✅ Feature flag check */}
      <PermissionGate
        feature={Feature.ADVANCED_PERMISSIONS}
        organizationId={orgId}
        fallback={<UpgradePrompt />}
      >
        <AdvancedPermissionEditor />
      </PermissionGate>
    </div>
  );
}
```

## ❌ Wrong Usage (Hardcoded)

### ❌ Don't Do This - Hardcoded Role Checks

```tsx
// ❌ WRONG - Hardcoded role check
function OrganizationPage({ org, userMembership }) {
  const isAdmin = userMembership?.role === 'ADMIN';

  return (
    <div>
      {isAdmin && <AdminButton />}  {/* ❌ Hardcoded! */}
    </div>
  );
}
```

```typescript
// ❌ WRONG - Hardcoded role check in backend
@Post(':slug/courses')
async createCourse(@CurrentUser() user: any) {
  if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {  // ❌ Hardcoded!
    throw new ForbiddenException();
  }
}
```

## How It Works

### 1. Permissions Are Loaded from Backend

```
Frontend                          Backend
   │                                 │
   ├─ useOrganizationPermissions()  │
   │                                 │
   ├─ GET /organizations/:slug/capabilities
   │                                 │
   │                          ┌──────▼──────┐
   │                          │ Permission  │
   │                          │   Service   │
   │                          └──────┬──────┘
   │                                 │
   │              ┌─────────────────┼─────────────────┐
   │              │                 │                 │
   │         Role Perms      Custom Perms     Feature Flags
   │              │                 │                 │
   │         (ADMIN gets      (JSON field)    (Subscription
   │          all perms)                         tier)
   │              │                 │                 │
   │              └─────────────────┴─────────────────┘
   │                                 │
   │◄────── {                        │
           permissions: [...]        │
           features: [...]           │
           limits: {...}             │
         }                           │
```

### 2. Permission Hierarchy

```
ADMIN
  ├─ All INSTRUCTOR permissions
  ├─ ORG_UPDATE
  ├─ ORG_DELETE
  ├─ MEMBER_ADD
  ├─ MEMBER_UPDATE
  ├─ MEMBER_REMOVE
  └─ DEPT_MANAGE

INSTRUCTOR
  ├─ All MENTOR permissions
  ├─ COURSE_CREATE
  ├─ COURSE_UPDATE
  └─ ANALYTICS_VIEW

MENTOR
  ├─ All STUDENT permissions
  ├─ MENTOR_ACCEPT
  └─ FORUM_MODERATE

STUDENT
  ├─ ORG_VIEW
  ├─ COURSE_VIEW
  ├─ COURSE_ENROLL
  ├─ FORUM_VIEW
  ├─ FORUM_POST
  └─ MENTOR_REQUEST
```

### 3. Subscription Tiers

```typescript
// FREE Tier
{
  features: [Feature.BASIC_COURSES, Feature.BASIC_FORUMS],
  limits: {
    maxMembers: 50,
    maxCourses: 5,
    maxDepartments: 3,
    maxStorage: 1 // GB
  }
}

// PREMIUM Tier
{
  features: [
    Feature.BASIC_COURSES,
    Feature.BASIC_FORUMS,
    Feature.ADVANCED_ANALYTICS,
    Feature.UNLIMITED_COURSES,
    Feature.CUSTOM_BRANDING,
    Feature.PRIORITY_SUPPORT
  ],
  limits: {
    maxMembers: 500,
    maxDepartments: 20,
    maxStorage: 50 // GB
  }
}

// ENTERPRISE Tier
{
  features: [...all features],
  limits: {} // No limits
}
```

## Common Use Cases

### 1. Show/Hide UI Elements Based on Permissions

```tsx
const { hasPermission } = useOrganizationPermissions(orgId);

return (
  <div>
    {hasPermission(Permission.MEMBER_ADD) && <AddMemberButton />}
    {hasPermission(Permission.DEPT_CREATE) && <CreateDeptButton />}
  </div>
);
```

### 2. Disable Features Based on Subscription

```tsx
const { hasFeature } = useOrganizationPermissions(orgId);

return (
  <div>
    {hasFeature(Feature.ADVANCED_ANALYTICS) ? (
      <AdvancedCharts />
    ) : (
      <BasicCharts upgradePrompt />
    )}
  </div>
);
```

### 3. Enforce Limits

```tsx
const { isLimitReached, capabilities } = useOrganizationPermissions(orgId);

const handleAddMember = () => {
  if (isLimitReached('maxMembers')) {
    showUpgradeModal({
      current: capabilities.usage.members,
      limit: capabilities.limits.maxMembers,
      tier: capabilities.tier
    });
    return;
  }

  // Add member...
};
```

### 4. Custom Permissions Override

```typescript
// Backend - Set custom permissions for a specific member
await organizationService.updateMember(memberId, {
  permissions: {
    permissions: [
      Permission.COURSE_CREATE,
      Permission.ANALYTICS_VIEW
    ]
  }
});

// Now this STUDENT can create courses (custom permission override)
```

## Testing Permissions

### Backend Test

```typescript
describe('OrganizationPermissions', () => {
  it('should grant course creation to instructors', async () => {
    const hasAccess = await permissionsService.checkPermission(
      instructorId,
      orgId,
      Permission.COURSE_CREATE
    );

    expect(hasAccess).toBe(true);
  });

  it('should deny course creation to students', async () => {
    const hasAccess = await permissionsService.checkPermission(
      studentId,
      orgId,
      Permission.COURSE_CREATE
    );

    expect(hasAccess).toBe(false);
  });
});
```

### Frontend Test

```tsx
import { renderHook } from '@testing-library/react';
import { useOrganizationPermissions } from '@/lib/hooks/useOrganizationPermissions';

test('loads permissions from API', async () => {
  const { result, waitForNextUpdate } = renderHook(() =>
    useOrganizationPermissions('org-123')
  );

  await waitForNextUpdate();

  expect(result.current.capabilities).toBeDefined();
  expect(result.current.hasPermission(Permission.ORG_VIEW)).toBe(true);
});
```

## Benefits of This Approach

1. **Not Hardcoded**: Permissions loaded from backend at runtime
2. **Flexible**: Easy to add new permissions without code changes
3. **Scalable**: Supports custom permissions per member
4. **Subscription-Ready**: Built-in feature flags and limits
5. **Type-Safe**: Full TypeScript support
6. **Testable**: Easy to test permission logic
7. **Maintainable**: Single source of truth for permissions

## Adding New Permissions

### 1. Add to Backend Enum

```typescript
// services/auth-service/src/modules/organization/constants/permissions.ts

export enum Permission {
  // ... existing permissions
  CERTIFICATE_ISSUE = 'certificate:issue',  // ✅ New permission
}

// Add to role permissions
export const DEFAULT_ROLE_PERMISSIONS = {
  INSTRUCTOR: [
    // ... existing
    Permission.CERTIFICATE_ISSUE,  // ✅ Add here
  ],
};
```

### 2. Add to Frontend Enum

```typescript
// apps/web/src/lib/hooks/useOrganizationPermissions.ts

export enum Permission {
  // ... existing permissions
  CERTIFICATE_ISSUE = 'certificate:issue',  // ✅ New permission
}
```

### 3. Use in UI

```tsx
{hasPermission(Permission.CERTIFICATE_ISSUE) && (
  <IssueCertificateButton />
)}
```

That's it! No other code changes needed. The system is fully dynamic.
