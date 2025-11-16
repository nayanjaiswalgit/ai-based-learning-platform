import { Page, expect } from '@playwright/test';

/**
 * Test helper utilities for E2E tests
 */

/**
 * Generate a unique email for testing
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `test-user-${timestamp}-${random}@example.com`;
}

/**
 * Generate a unique username for testing
 */
export function generateTestUsername(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `testuser${timestamp}${random}`;
}

/**
 * Generate a test password
 */
export function generateTestPassword(): string {
  return 'TestPassword123!';
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page, url: string) {
  await page.waitForURL(url);
}

/**
 * Fill form and submit
 */
export async function fillFormAndSubmit(
  page: Page,
  fields: Record<string, string>,
  submitButtonText: string
) {
  for (const [selector, value] of Object.entries(fields)) {
    await page.fill(selector, value);
  }
  await page.click(`button:has-text("${submitButtonText}")`);
}

/**
 * Wait for toast notification
 */
export async function waitForToast(page: Page, message?: string) {
  const toast = page.locator('[role="status"]').first();
  await toast.waitFor({ state: 'visible' });
  if (message) {
    await expect(toast).toContainText(message);
  }
  return toast;
}

/**
 * Login helper
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

/**
 * Signup helper
 */
export async function signup(
  page: Page,
  name: string,
  email: string,
  password: string
) {
  await page.goto('/signup');
  await page.fill('input[name="name"]', name);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
}

/**
 * Logout helper
 */
export async function logout(page: Page) {
  // Click user menu
  await page.click('[data-testid="user-menu"]');
  // Click logout button
  await page.click('text=Logout');
  await page.waitForURL('/');
}

/**
 * Check if element is visible
 */
export async function isVisible(page: Page, selector: string): Promise<boolean> {
  try {
    await page.locator(selector).waitFor({ state: 'visible', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Take screenshot with name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
}

/**
 * Wait for API response
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp
) {
  return page.waitForResponse((response) => {
    const url = response.url();
    if (typeof urlPattern === 'string') {
      return url.includes(urlPattern);
    }
    return urlPattern.test(url);
  });
}

/**
 * Mock API response
 */
export async function mockAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  response: any
) {
  await page.route(urlPattern, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Wait for loading to complete
 */
export async function waitForLoading(page: Page) {
  // Wait for any loading spinners to disappear
  await page.waitForLoadState('networkidle');
  const loadingSelector = '[data-testid="loading"]';
  const hasLoading = await isVisible(page, loadingSelector);
  if (hasLoading) {
    await page.waitForSelector(loadingSelector, { state: 'hidden' });
  }
}

/**
 * Scroll to element
 */
export async function scrollToElement(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Clear and type
 */
export async function clearAndType(page: Page, selector: string, text: string) {
  await page.fill(selector, '');
  await page.type(selector, text);
}

/**
 * Select dropdown option
 */
export async function selectDropdownOption(
  page: Page,
  selector: string,
  option: string
) {
  await page.click(selector);
  await page.click(`text=${option}`);
}

/**
 * Upload file
 */
export async function uploadFile(
  page: Page,
  selector: string,
  filePath: string
) {
  await page.setInputFiles(selector, filePath);
}

/**
 * Drag and drop
 */
export async function dragAndDrop(
  page: Page,
  sourceSelector: string,
  targetSelector: string
) {
  await page.dragAndDrop(sourceSelector, targetSelector);
}
