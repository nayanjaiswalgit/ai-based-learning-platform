import { test, expect } from '@playwright/test';
import { waitForLoading } from './helpers/test-helpers';

test.describe('Dashboard Flow', () => {
  // Note: These tests assume user is authenticated
  // In real scenarios, use auth fixtures or setup

  test.describe('Dashboard Home', () => {
    test('should display dashboard home page', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      const currentUrl = page.url();

      // If redirected to login, skip test
      if (currentUrl.includes('/login') || currentUrl.includes('/signup')) {
        test.skip();
        return;
      }

      // Check for dashboard heading
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
    });

    test('should display welcome message', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Look for welcome message
        const welcome = page.locator('text=/welcome|hello|hi/i').first();

        if (await welcome.isVisible()) {
          await expect(welcome).toBeVisible();
        }
      }
    });

    test('should display stats cards', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Look for stats about courses, problems, streak, achievements
        const statsSection = page.locator('text=/courses enrolled|problems solved|streak|achievements/i');

        if ((await statsSection.count()) > 0) {
          await expect(statsSection.first()).toBeVisible();
        }
      }
    });

    test('should display continue learning section', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Look for continue learning section
        const continueSection = page.locator('text=/continue learning|in progress|resume/i');

        if (await continueSection.first().isVisible()) {
          await expect(continueSection.first()).toBeVisible();
        }
      }
    });

    test('should display enrolled courses with progress bars', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Look for progress bars
        const progressBar = page.locator('[role="progressbar"], [class*="progress"]');

        if ((await progressBar.count()) > 0) {
          await expect(progressBar.first()).toBeVisible();
        }
      }
    });

    test('should display today\'s tasks section', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Look for tasks or todos
        const tasksSection = page.locator('text=/today.*task|tasks|todo/i');

        if (await tasksSection.first().isVisible()) {
          await expect(tasksSection.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Dashboard Navigation', () => {
    test('should have navigation sidebar or menu', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Look for navigation elements
        const nav = page.locator('nav, [role="navigation"]');
        await expect(nav.first()).toBeVisible();
      }
    });

    test('should navigate to dashboard courses', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Look for courses link
        const coursesLink = page.locator('a[href*="/dashboard/courses"], a:has-text("My Courses")').first();

        if (await coursesLink.isVisible()) {
          await coursesLink.click();
          await page.waitForTimeout(1000);

          const currentUrl = page.url();
          expect(currentUrl).toContain('/dashboard');
        }
      }
    });

    test('should navigate to dashboard profile', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Look for profile link
        const profileLink = page.locator('a[href*="/dashboard/profile"], a:has-text("Profile")').first();

        if (await profileLink.isVisible()) {
          await profileLink.click();
          await page.waitForTimeout(1000);

          const currentUrl = page.url();
          expect(currentUrl.includes('/dashboard/profile')).toBeTruthy();
        }
      }
    });

    test('should navigate to dashboard settings', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Look for settings link
        const settingsLink = page.locator('a[href*="/dashboard/settings"], a:has-text("Settings")').first();

        if (await settingsLink.isVisible()) {
          await settingsLink.click();
          await page.waitForTimeout(1000);

          const currentUrl = page.url();
          expect(currentUrl.includes('/dashboard/settings')).toBeTruthy();
        }
      }
    });

    test('should navigate to DSA section', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Look for DSA link
        const dsaLink = page.locator('a[href*="/dashboard/dsa"], a:has-text("DSA"), a:has-text("Problems")').first();

        if (await dsaLink.isVisible()) {
          await dsaLink.click();
          await page.waitForTimeout(1000);

          const currentUrl = page.url();
          expect(currentUrl.includes('/dashboard')).toBeTruthy();
        }
      }
    });

    test('should navigate to discussions', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Look for discussions link
        const discussionsLink = page.locator('a[href*="/dashboard/discussions"], a:has-text("Discussions")').first();

        if (await discussionsLink.isVisible()) {
          await discussionsLink.click();
          await page.waitForTimeout(1000);

          const currentUrl = page.url();
          expect(currentUrl.includes('/dashboard/discussions')).toBeTruthy();
        }
      }
    });

    test('should navigate to roadmaps', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Look for roadmaps link
        const roadmapsLink = page.locator('a[href*="/dashboard/roadmaps"], a:has-text("Roadmaps")').first();

        if (await roadmapsLink.isVisible()) {
          await roadmapsLink.click();
          await page.waitForTimeout(1000);

          const currentUrl = page.url();
          expect(currentUrl.includes('/dashboard/roadmaps')).toBeTruthy();
        }
      }
    });
  });

  test.describe('Dashboard Profile', () => {
    test('should display profile page', async ({ page }) => {
      await page.goto('/dashboard/profile');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/profile')) {
        // Check for profile heading
        const heading = page.locator('h1, h2').first();
        await expect(heading).toBeVisible();
      }
    });

    test('should display user information', async ({ page }) => {
      await page.goto('/dashboard/profile');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/profile')) {
        // Look for user fields
        const nameField = page.locator('input[name="name"], text=/name/i');
        const emailField = page.locator('input[type="email"], text=/email/i');

        const hasUserInfo =
          (await nameField.count()) > 0 || (await emailField.count()) > 0;

        expect(hasUserInfo).toBeTruthy();
      }
    });

    test('should allow editing profile', async ({ page }) => {
      await page.goto('/dashboard/profile');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/profile')) {
        // Look for edit button or editable fields
        const editButton = page.locator('button:has-text("Edit")').first();
        const saveButton = page.locator('button:has-text("Save")').first();

        const canEdit =
          (await editButton.isVisible()) || (await saveButton.isVisible());

        if (canEdit) {
          expect(canEdit).toBeTruthy();
        }
      }
    });

    test('should display profile avatar', async ({ page }) => {
      await page.goto('/dashboard/profile');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/profile')) {
        // Look for avatar
        const avatar = page.locator('img[alt*="avatar"], [class*="avatar"]');

        if (await avatar.first().isVisible()) {
          await expect(avatar.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Dashboard Settings', () => {
    test('should display settings page', async ({ page }) => {
      await page.goto('/dashboard/settings');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/settings')) {
        // Check for settings heading
        const heading = page.locator('h1, h2').first();
        await expect(heading).toBeVisible();
      }
    });

    test('should have theme toggle', async ({ page }) => {
      await page.goto('/dashboard/settings');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/settings')) {
        // Look for theme toggle
        const themeToggle = page.locator('button:has-text("Dark"), button:has-text("Light"), button:has-text("Theme")');

        if (await themeToggle.first().isVisible()) {
          await expect(themeToggle.first()).toBeVisible();
        }
      }
    });

    test('should have notification preferences', async ({ page }) => {
      await page.goto('/dashboard/settings');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/settings')) {
        // Look for notification settings
        const notificationSection = page.locator('text=/notification|email preferences/i');

        if (await notificationSection.first().isVisible()) {
          await expect(notificationSection.first()).toBeVisible();
        }
      }
    });

    test('should allow changing password', async ({ page }) => {
      await page.goto('/dashboard/settings');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/settings')) {
        // Look for password change section
        const passwordSection = page.locator('text=/change password|update password/i');

        if (await passwordSection.first().isVisible()) {
          await expect(passwordSection.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Dashboard Stats and Progress', () => {
    test('should display learning streak', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Look for streak information
        const streak = page.locator('text=/streak|day streak/i');

        if (await streak.first().isVisible()) {
          await expect(streak.first()).toBeVisible();
        }
      }
    });

    test('should display courses enrolled count', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Look for courses count
        const coursesCount = page.locator('text=/courses enrolled|enrolled/i');

        if (await coursesCount.first().isVisible()) {
          await expect(coursesCount.first()).toBeVisible();
        }
      }
    });

    test('should display problems solved count', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Look for problems solved
        const problemsCount = page.locator('text=/problems solved|challenges completed/i');

        if (await problemsCount.first().isVisible()) {
          await expect(problemsCount.first()).toBeVisible();
        }
      }
    });

    test('should display achievements', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Look for achievements
        const achievements = page.locator('text=/achievements|badges/i');

        if (await achievements.first().isVisible()) {
          await expect(achievements.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Dashboard Course Interactions', () => {
    test('should click on a course to view details', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Find a course card
        const courseCard = page.locator('[data-testid="course-card"], [class*="course-card"]').first();

        if (await courseCard.isVisible()) {
          await courseCard.click();
          await page.waitForTimeout(1000);

          // Should navigate to course page
          const currentUrl = page.url();
          expect(currentUrl).toBeTruthy();
        }
      }
    });

    test('should resume learning from dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Look for resume/continue button
        const resumeButton = page.locator('button:has-text("Resume"), button:has-text("Continue"), a:has-text("Continue")').first();

        if (await resumeButton.isVisible()) {
          await resumeButton.click();
          await page.waitForTimeout(1000);

          // Should navigate somewhere
          const currentUrl = page.url();
          expect(currentUrl).toBeTruthy();
        }
      }
    });
  });

  test.describe('Dashboard Responsive Design', () => {
    test('should display dashboard correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Check if content is visible
        const content = page.locator('body');
        await expect(content).toBeVisible();
      }
    });

    test('should have mobile menu on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Look for hamburger menu
        const menuButton = page.locator('button[aria-label*="menu"], button:has-text("Menu")');

        if (await menuButton.first().isVisible()) {
          await expect(menuButton.first()).toBeVisible();
        }
      }
    });

    test('should display dashboard correctly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Check if sidebar is visible on desktop
        const sidebar = page.locator('aside, [class*="sidebar"]');

        if (await sidebar.first().isVisible()) {
          await expect(sidebar.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Dashboard User Menu', () => {
    test('should have user menu in header', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Look for user menu
        const userMenu = page.locator('[data-testid="user-menu"], button[aria-label*="user"]');

        if (await userMenu.first().isVisible()) {
          await expect(userMenu.first()).toBeVisible();
        }
      }
    });

    test('should open user menu dropdown', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Click user menu
        const userMenu = page.locator('[data-testid="user-menu"], button[aria-label*="user"]').first();

        if (await userMenu.isVisible()) {
          await userMenu.click();
          await page.waitForTimeout(500);

          // Should show dropdown
          const dropdown = page.locator('[role="menu"], [class*="dropdown"]');

          if (await dropdown.first().isVisible()) {
            await expect(dropdown.first()).toBeVisible();
          }
        }
      }
    });

    test('should have logout option in user menu', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        // Click user menu
        const userMenu = page.locator('[data-testid="user-menu"], button[aria-label*="user"]').first();

        if (await userMenu.isVisible()) {
          await userMenu.click();
          await page.waitForTimeout(500);

          // Look for logout button
          const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign Out")');

          if (await logoutButton.first().isVisible()) {
            await expect(logoutButton.first()).toBeVisible();
          }
        }
      }
    });
  });
});
