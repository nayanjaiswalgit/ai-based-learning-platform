#!/bin/bash

# E2E Flow Test Script
# Tests the complete organization management flow

set -e

echo "=================================================="
echo "  Organization Management E2E Flow Test"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:3000/api/v1}"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="Test123!@#"

echo "📋 Configuration:"
echo "   API URL: $API_URL"
echo "   Test Email: $TEST_EMAIL"
echo ""

# Helper functions
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Test 1: Register User
echo "Test 1: Register User"
info "Registering new user..."

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"username\": \"testuser\",
    \"password\": \"$TEST_PASSWORD\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q "id"; then
    success "User registered successfully"
else
    error "Failed to register user: $REGISTER_RESPONSE"
fi

# Test 2: Login
echo ""
echo "Test 2: Login User"
info "Logging in..."

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    error "Failed to login: $LOGIN_RESPONSE"
fi

success "Login successful, got access token"

# Test 3: Create Organization
echo ""
echo "Test 3: Create Organization"
info "Creating test organization..."

ORG_RESPONSE=$(curl -s -X POST "$API_URL/organizations" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test University",
    "slug": "test-university-'$(date +%s)'",
    "type": "UNIVERSITY",
    "description": "E2E Test Organization",
    "location": "Test City"
  }')

ORG_SLUG=$(echo "$ORG_RESPONSE" | grep -o '"slug":"[^"]*' | cut -d'"' -f4)

if [ -z "$ORG_SLUG" ]; then
    error "Failed to create organization: $ORG_RESPONSE"
fi

success "Organization created: $ORG_SLUG"

# Test 4: Get Organization Details
echo ""
echo "Test 4: Get Organization Details"
info "Fetching organization..."

ORG_DETAILS=$(curl -s "$API_URL/organizations/$ORG_SLUG" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$ORG_DETAILS" | grep -q "$ORG_SLUG"; then
    success "Organization details retrieved"
else
    error "Failed to get organization details"
fi

# Test 5: Get Capabilities (CRITICAL - Dynamic Permissions)
echo ""
echo "Test 5: Get Organization Capabilities"
info "Fetching capabilities..."

CAPABILITIES=$(curl -s "$API_URL/organizations/$ORG_SLUG/capabilities" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$CAPABILITIES" | grep -q "userPermissions"; then
    success "Capabilities retrieved (dynamic permissions working!)"

    # Check if has admin permissions
    if echo "$CAPABILITIES" | grep -q "member:add"; then
        success "  → User has MEMBER_ADD permission (as expected for founder)"
    else
        error "  → User missing expected admin permissions"
    fi

    # Check subscription tier
    if echo "$CAPABILITIES" | grep -q "FREE"; then
        success "  → Subscription tier: FREE (default)"
    fi
else
    error "Failed to get capabilities: $CAPABILITIES"
fi

# Test 6: Get Members
echo ""
echo "Test 6: Get Organization Members"
info "Fetching members..."

MEMBERS=$(curl -s "$API_URL/organizations/$ORG_SLUG/members" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$MEMBERS" | grep -q "ADMIN"; then
    success "Members retrieved, user is ADMIN"
else
    error "Failed to get members or user not admin"
fi

# Test 7: Create Department
echo ""
echo "Test 7: Create Department"
info "Creating department..."

DEPT_RESPONSE=$(curl -s -X POST "$API_URL/organizations/$ORG_SLUG/departments" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Computer Science",
    "description": "CS Department"
  }')

if echo "$DEPT_RESPONSE" | grep -q "Computer Science"; then
    success "Department created"
else
    error "Failed to create department: $DEPT_RESPONSE"
fi

# Test 8: Get Departments
echo ""
echo "Test 8: Get Departments"
info "Fetching departments..."

DEPARTMENTS=$(curl -s "$API_URL/organizations/$ORG_SLUG/departments" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$DEPARTMENTS" | grep -q "Computer Science"; then
    success "Departments retrieved"
else
    error "Failed to get departments"
fi

# Test 9: Get Suggested Titles
echo ""
echo "Test 9: Get Suggested Titles"
info "Fetching suggested titles for UNIVERSITY..."

TITLES=$(curl -s "$API_URL/organizations/$ORG_SLUG/suggested-titles" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$TITLES" | grep -q "Professor"; then
    success "Suggested titles retrieved (includes 'Professor' for universities)"
else
    error "Failed to get suggested titles: $TITLES"
fi

# Test 10: Permission Enforcement
echo ""
echo "Test 10: Test Permission Enforcement"
info "Testing permission checks..."

# Try to update org (should work as admin)
UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/organizations/$ORG_SLUG" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description"
  }')

if echo "$UPDATE_RESPONSE" | grep -q "Updated description"; then
    success "Permission check passed: Admin can update organization"
else
    error "Permission check failed: Admin should be able to update"
fi

# Summary
echo ""
echo "=================================================="
echo "  E2E Test Summary"
echo "=================================================="
echo ""
success "All 10 tests passed!"
echo ""
echo "✅ User registration & login"
echo "✅ Organization creation"
echo "✅ Organization retrieval"
echo "✅ Capabilities endpoint (dynamic permissions)"
echo "✅ Member management"
echo "✅ Department management"
echo "✅ Suggested titles"
echo "✅ Permission enforcement"
echo ""
echo "🎉 E2E Flow is working correctly!"
echo ""
echo "Organization Details:"
echo "  Name: Test University"
echo "  Slug: $ORG_SLUG"
echo "  Type: UNIVERSITY"
echo "  Members: 1 (admin)"
echo "  Departments: 1 (Computer Science)"
echo ""
echo "Test User:"
echo "  Email: $TEST_EMAIL"
echo "  Token: $ACCESS_TOKEN"
echo ""
echo "Try it in browser:"
echo "  http://localhost:3000/dashboard/organizations/$ORG_SLUG"
echo ""
