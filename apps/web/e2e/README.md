# E2E Testing Guide

This directory contains comprehensive end-to-end (E2E) tests for the AI-Based Learning Platform web application using Playwright.

## Overview

The E2E test suite covers all major user flows in the application:

- **Authentication** - Login, signup, password reset, social auth
- **Course Discovery** - Browsing, searching, filtering courses
- **Dashboard** - User dashboard, profile, settings
- **Learning** - Course enrollment, progress tracking, assignments
- **Coding Challenges** - Code editor, execution, DSA tracking
- **Analytics** - User, instructor, and admin analytics
- **Interactive Features** - Terminal, chat, messaging, notifications
- **Community** - Forums, discussions, reviews
- **Responsive Design** - Mobile, tablet, desktop views
- **Accessibility** - Keyboard navigation, ARIA, screen readers

## Test Files

```
e2e/
├── auth.spec.ts              # Authentication flows
├── courses.spec.ts           # Course discovery and detail pages
├── dashboard.spec.ts         # Dashboard and user profile
├── learning.spec.ts          # Learning flows and progress
├── coding-challenge.spec.ts  # Code editor and DSA
├── analytics.spec.ts         # Analytics and reporting
├── interactive.spec.ts       # Terminal, chat, video player
├── community.spec.ts         # Forums and community features
├── responsive.spec.ts        # Responsive design tests
├── accessibility.spec.ts     # Accessibility tests
├── fixtures/                 # Test data and fixtures
│   ├── auth.fixture.ts       # Authentication helpers
│   └── test-data.ts          # Test data constants
└── helpers/                  # Test utilities
    └── test-helpers.ts       # Helper functions
```

## Running Tests

### Prerequisites

1. Install dependencies:
```bash
pnpm install
```

2. Install Playwright browsers:
```bash
pnpm exec playwright install
```

### Run All Tests

```bash
# Run all tests in headless mode
pnpm test:e2e

# Run tests in UI mode (interactive)
pnpm test:e2e:ui

# Run tests in headed mode (see browser)
pnpm test:e2e:headed

# Run tests in debug mode
pnpm test:e2e:debug
```

### Run Specific Test Files

```bash
# Run authentication tests only
pnpm exec playwright test e2e/auth.spec.ts

# Run course tests only
pnpm exec playwright test e2e/courses.spec.ts

# Run accessibility tests only
pnpm exec playwright test e2e/accessibility.spec.ts
```

### Run Specific Tests

```bash
# Run tests matching a pattern
pnpm exec playwright test -g "login"

# Run a specific test
pnpm exec playwright test e2e/auth.spec.ts -g "should display login page correctly"
```

### View Test Reports

```bash
# View the HTML report
pnpm test:e2e:report
```

## Configuration

The test configuration is in `playwright.config.ts`:

- **Base URL**: http://localhost:3000 (configurable via `BASE_URL` env var)
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Timeout**: 30 seconds per test
- **Retries**: 2 retries on CI, 0 retries locally
- **Workers**: 1 on CI, unlimited locally
- **Screenshots**: On failure
- **Video**: On failure
- **Trace**: On first retry

## Environment Variables

Create a `.env.test` file in the root directory:

```bash
BASE_URL=http://localhost:3000
# Add other environment variables as needed
```

## Test Data

Test data is located in `e2e/fixtures/test-data.ts`. It includes:

- Sample users
- Sample courses
- Sample problems
- Sample forum topics
- And more...

## Helper Functions

Helper functions are in `e2e/helpers/test-helpers.ts`:

- `generateTestEmail()` - Generate unique test email
- `generateTestPassword()` - Generate test password
- `login(page, email, password)` - Helper to login
- `signup(page, name, email, password)` - Helper to signup
- `waitForLoading(page)` - Wait for loading to complete
- `waitForToast(page, message)` - Wait for toast notification
- And more...

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/some-page');

    // Interact with the page
    await page.click('button');

    // Assert expectations
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Using Helpers

```typescript
import { test, expect } from '@playwright/test';
import { login, generateTestEmail } from './helpers/test-helpers';

test('should login successfully', async ({ page }) => {
  const email = generateTestEmail();
  await login(page, email, 'password123');

  await expect(page).toHaveURL('/dashboard');
});
```

### Using Fixtures

```typescript
import { test, expect } from './fixtures/auth.fixture';

test('authenticated test', async ({ authenticatedPage }) => {
  // authenticatedPage is already logged in
  await expect(authenticatedPage).toHaveURL('/dashboard');
});
```

## Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Wait for loading states** before assertions
3. **Use helper functions** for common operations
4. **Keep tests independent** - each test should be able to run alone
5. **Use meaningful test names** - describe what the test does
6. **Handle authentication** properly - use fixtures for authenticated tests
7. **Clean up test data** after tests when possible
8. **Use page object pattern** for complex pages
9. **Check for accessibility** in all tests
10. **Test responsive design** across different viewports

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Install Playwright
  run: pnpm exec playwright install --with-deps

- name: Run E2E tests
  run: pnpm test:e2e
  env:
    BASE_URL: ${{ secrets.BASE_URL }}

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### Tests are flaky

- Add proper waits: `await page.waitForLoadState('networkidle')`
- Use `waitForLoading()` helper
- Increase timeout if needed: `test.setTimeout(60000)`

### Elements not found

- Check if page is fully loaded
- Use more specific selectors
- Add `data-testid` attributes to elements
- Use `page.waitForSelector()` before interacting

### Tests fail in CI but pass locally

- Check for timing issues
- Ensure proper cleanup between tests
- Check environment variables
- Review CI logs for specific errors

### Browser issues

```bash
# Reinstall browsers
pnpm exec playwright install --force

# Clear browser cache
pnpm exec playwright install --with-deps
```

## Coverage

The test suite covers:

- ✅ 22 main UI flows
- ✅ 50+ components
- ✅ Authentication (login, signup, social auth)
- ✅ Course browsing and enrollment
- ✅ Dashboard and profile management
- ✅ Learning interface and progress tracking
- ✅ Code editor and DSA challenges
- ✅ Analytics and reporting
- ✅ Interactive features (terminal, chat)
- ✅ Community features (forums, discussions)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Accessibility (keyboard, screen readers, ARIA)

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Debugging Guide](https://playwright.dev/docs/debug)
