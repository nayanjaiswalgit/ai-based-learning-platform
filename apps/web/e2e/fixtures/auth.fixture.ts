import { test as base, expect, Page } from '@playwright/test';
import { login, signup, generateTestEmail, generateTestPassword } from '../helpers/test-helpers';

type AuthFixtures = {
  authenticatedPage: Page;
  testUser: { email: string; password: string; name: string };
};

/**
 * Extended test with authentication fixtures
 */
export const test = base.extend<AuthFixtures>({
  testUser: async ({}, use: (r: { email: string; password: string; name: string }) => Promise<void>) => {
    // Generate a new test user for each test
    const user = {
      name: 'Test User',
      email: generateTestEmail(),
      password: generateTestPassword(),
    };
    await use(user);
  },

  authenticatedPage: async ({ page, testUser }: { page: Page; testUser: { email: string; password: string; name: string } }, use: (r: Page) => Promise<void>) => {
    // Sign up and login before the test
    try {
      await signup(page, testUser.name, testUser.email, testUser.password);
      await page.waitForTimeout(1000); // Wait for signup to complete
    } catch (error) {
      // User might already exist, try to login
      await login(page, testUser.email, testUser.password);
    }

    // Use the authenticated page in the test
    await use(page);

    // Cleanup: logout after the test
    // await logout(page);
  },
});

export { expect };
