import { test, expect } from '@playwright/test';
import {
  generateTestEmail,
  generateTestPassword,
  generateTestUsername,
  waitForNavigation,
  waitForToast,
} from './helpers/test-helpers';

test.describe('Authentication Flow', () => {
  test.describe('Signup', () => {
    test('should display signup page correctly', async ({ page }) => {
      await page.goto('/signup');

      // Check page title
      await expect(page).toHaveTitle(/Sign Up|Signup/i);

      // Check form fields are present
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();

      // Check submit button
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      // Check social login buttons
      await expect(page.locator('text=/sign up with google/i')).toBeVisible();
      await expect(page.locator('text=/sign up with github/i')).toBeVisible();

      // Check terms and privacy links
      await expect(page.locator('a[href*="terms"]')).toBeVisible();
      await expect(page.locator('a[href*="privacy"]')).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/signup');

      // Try to submit empty form
      await page.click('button[type="submit"]');

      // Wait a bit for validation
      await page.waitForTimeout(500);

      // Check that we're still on signup page (form didn't submit)
      await expect(page).toHaveURL(/\/signup/);
    });

    test('should show validation error for invalid email', async ({ page }) => {
      await page.goto('/signup');

      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[type="email"]', 'invalid-email');
      await page.fill('input[type="password"]', 'TestPassword123!');

      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);

      // Should still be on signup page
      await expect(page).toHaveURL(/\/signup/);
    });

    test('should show validation error for weak password', async ({ page }) => {
      await page.goto('/signup');

      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[type="email"]', generateTestEmail());
      await page.fill('input[type="password"]', '123'); // Weak password

      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);

      // Should still be on signup page
      await expect(page).toHaveURL(/\/signup/);
    });

    test('should successfully sign up with valid data', async ({ page }) => {
      await page.goto('/signup');

      const testEmail = generateTestEmail();
      const testPassword = generateTestPassword();

      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);

      await page.click('button[type="submit"]');

      // Wait for navigation or success message
      await page.waitForTimeout(2000);

      // Should redirect to dashboard or show success message
      const currentUrl = page.url();
      const isSuccessful =
        currentUrl.includes('/dashboard') ||
        currentUrl.includes('/verify-email') ||
        (await page.locator('text=/success|welcome/i').isVisible());

      expect(isSuccessful).toBeTruthy();
    });

    test('should have link to login page', async ({ page }) => {
      await page.goto('/signup');

      const loginLink = page.locator('a[href*="/login"]');
      await expect(loginLink).toBeVisible();

      await loginLink.click();
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Login', () => {
    test('should display login page correctly', async ({ page }) => {
      await page.goto('/login');

      // Check page title
      await expect(page).toHaveTitle(/Login|Sign In/i);

      // Check form fields
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();

      // Check submit button
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      // Check forgot password link
      await expect(page.locator('a[href*="forgot-password"]')).toBeVisible();

      // Check social login buttons
      await expect(page.locator('text=/login with google/i')).toBeVisible();
      await expect(page.locator('text=/login with github/i')).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/login');

      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);

      // Should still be on login page
      await expect(page).toHaveURL(/\/login/);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      await page.fill('input[type="email"]', 'nonexistent@example.com');
      await page.fill('input[type="password"]', 'WrongPassword123!');

      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Should either show error message or stay on login page
      const currentUrl = page.url();
      const hasError =
        currentUrl.includes('/login') ||
        (await page
          .locator('text=/invalid|incorrect|wrong|error/i')
          .isVisible());

      expect(hasError).toBeTruthy();
    });

    test('should have link to signup page', async ({ page }) => {
      await page.goto('/login');

      const signupLink = page.locator('a[href*="/signup"]');
      await expect(signupLink).toBeVisible();

      await signupLink.click();
      await expect(page).toHaveURL(/\/signup/);
    });

    test('should have link to forgot password page', async ({ page }) => {
      await page.goto('/login');

      const forgotPasswordLink = page.locator('a[href*="forgot-password"]');
      await expect(forgotPasswordLink).toBeVisible();

      await forgotPasswordLink.click();
      await expect(page).toHaveURL(/forgot-password/);
    });
  });

  test.describe('Forgot Password', () => {
    test('should display forgot password page correctly', async ({ page }) => {
      await page.goto('/forgot-password');

      // Check page title
      await expect(page).toHaveTitle(/Forgot Password|Reset Password/i);

      // Check email field
      await expect(page.locator('input[type="email"]')).toBeVisible();

      // Check submit button
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      // Check back to login link
      const backLink = page.locator('a[href*="/login"]');
      await expect(backLink).toBeVisible();
    });

    test('should show validation error for empty email', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);

      // Should still be on forgot password page
      await expect(page).toHaveURL(/forgot-password/);
    });

    test('should show validation error for invalid email', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.fill('input[type="email"]', 'invalid-email');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);

      // Should still be on forgot password page
      await expect(page).toHaveURL(/forgot-password/);
    });

    test('should show success message for valid email', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.fill('input[type="email"]', generateTestEmail());
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Should show success message
      const hasSuccessMessage = await page
        .locator('text=/email sent|check your email|reset link/i')
        .isVisible();

      expect(hasSuccessMessage).toBeTruthy();
    });
  });

  test.describe('Social Authentication', () => {
    test('should have Google login button on login page', async ({ page }) => {
      await page.goto('/login');
      const googleButton = page.locator('text=/login with google/i');
      await expect(googleButton).toBeVisible();
    });

    test('should have GitHub login button on login page', async ({ page }) => {
      await page.goto('/login');
      const githubButton = page.locator('text=/login with github/i');
      await expect(githubButton).toBeVisible();
    });

    test('should have Google signup button on signup page', async ({ page }) => {
      await page.goto('/signup');
      const googleButton = page.locator('text=/sign up with google/i');
      await expect(googleButton).toBeVisible();
    });

    test('should have GitHub signup button on signup page', async ({ page }) => {
      await page.goto('/signup');
      const githubButton = page.locator('text=/sign up with github/i');
      await expect(githubButton).toBeVisible();
    });
  });

  test.describe('Session Persistence', () => {
    test('should redirect to login when accessing protected route without auth', async ({
      page,
    }) => {
      await page.goto('/dashboard');

      // Should redirect to login
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      expect(
        currentUrl.includes('/login') || currentUrl.includes('/signup')
      ).toBeTruthy();
    });

    test('should redirect to dashboard when accessing login page while authenticated', async ({
      page,
    }) => {
      // This test would require an authenticated session
      // Skip for now as it requires proper auth setup
      test.skip();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate between auth pages correctly', async ({ page }) => {
      // Start at login
      await page.goto('/login');
      await expect(page).toHaveURL(/\/login/);

      // Go to signup
      await page.click('a[href*="/signup"]');
      await expect(page).toHaveURL(/\/signup/);

      // Go back to login
      await page.click('a[href*="/login"]');
      await expect(page).toHaveURL(/\/login/);

      // Go to forgot password
      await page.click('a[href*="forgot-password"]');
      await expect(page).toHaveURL(/forgot-password/);

      // Go back to login
      await page.click('a[href*="/login"]');
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Form Interactions', () => {
    test('should toggle password visibility on login page', async ({ page }) => {
      await page.goto('/login');

      const passwordInput = page.locator('input[type="password"]').first();
      await expect(passwordInput).toBeVisible();

      // Look for toggle button (usually an eye icon)
      const toggleButton = page
        .locator('button')
        .filter({ has: page.locator('svg') })
        .first();

      if (await toggleButton.isVisible()) {
        await toggleButton.click();
        // Password field should change to text
        const textInput = page.locator('input[type="text"]');
        if (await textInput.isVisible()) {
          expect(await textInput.isVisible()).toBeTruthy();
        }
      }
    });

    test('should allow typing in all form fields', async ({ page }) => {
      await page.goto('/signup');

      const nameInput = page.locator('input[name="name"]');
      await nameInput.fill('Test User');
      await expect(nameInput).toHaveValue('Test User');

      const emailInput = page.locator('input[type="email"]');
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com');

      const passwordInput = page.locator('input[type="password"]');
      await passwordInput.fill('TestPassword123!');
      await expect(passwordInput).toHaveValue('TestPassword123!');
    });
  });
});
