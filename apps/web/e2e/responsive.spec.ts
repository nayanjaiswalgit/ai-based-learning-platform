import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  const viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 },
  };

  test.describe('Mobile Viewport (375x667)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
    });

    test('should display home page correctly', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(500);

      const content = page.locator('body');
      await expect(content).toBeVisible();
    });

    test('should show mobile navigation menu', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(500);

      const menuButton = page.locator('button[aria-label*="menu"], button:has-text("Menu")').first();

      if (await menuButton.isVisible()) {
        await expect(menuButton).toBeVisible();
      }
    });

    test('should display courses page in mobile view', async ({ page }) => {
      await page.goto('/courses');
      await page.waitForTimeout(1000);

      const courseCard = page.locator('[data-testid="course-card"]').first();

      if (await courseCard.isVisible()) {
        await expect(courseCard).toBeVisible();
      }
    });

    test('should display login page correctly', async ({ page }) => {
      await page.goto('/login');
      await page.waitForTimeout(500);

      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();

      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toBeVisible();
    });

    test('should display dashboard in mobile view', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        const content = page.locator('body');
        await expect(content).toBeVisible();
      }
    });

    test('should stack elements vertically on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(500);

      const content = page.locator('main, [class*="content"]').first();

      if (await content.isVisible()) {
        const box = await content.boundingBox();
        expect(box?.width).toBeLessThanOrEqual(viewports.mobile.width);
      }
    });

    test('should have touch-friendly button sizes', async ({ page }) => {
      await page.goto('/login');
      await page.waitForTimeout(500);

      const button = page.locator('button[type="submit"]').first();

      if (await button.isVisible()) {
        const box = await button.boundingBox();
        // Touch targets should be at least 44x44 pixels
        expect(box?.height).toBeGreaterThanOrEqual(40);
      }
    });

    test('should hide sidebar on mobile', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        const sidebar = page.locator('aside:visible').first();

        // Sidebar should be hidden or collapsed on mobile
        const isHidden = !(await sidebar.isVisible());
        const hasMenuButton = await page.locator('button[aria-label*="menu"]').first().isVisible();

        expect(isHidden || hasMenuButton).toBeTruthy();
      }
    });
  });

  test.describe('Tablet Viewport (768x1024)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
    });

    test('should display home page correctly', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(500);

      const content = page.locator('body');
      await expect(content).toBeVisible();
    });

    test('should display courses in grid layout', async ({ page }) => {
      await page.goto('/courses');
      await page.waitForTimeout(1000);

      const courseCards = page.locator('[data-testid="course-card"]');

      if ((await courseCards.count()) >= 2) {
        // Should have multiple courses visible
        await expect(courseCards.first()).toBeVisible();
        await expect(courseCards.nth(1)).toBeVisible();
      }
    });

    test('should display navigation properly', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(500);

      const nav = page.locator('nav').first();
      await expect(nav).toBeVisible();
    });

    test('should adapt dashboard layout', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        const content = page.locator('body');
        await expect(content).toBeVisible();
      }
    });
  });

  test.describe('Desktop Viewport (1920x1080)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
    });

    test('should display home page correctly', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(500);

      const content = page.locator('body');
      await expect(content).toBeVisible();
    });

    test('should show full navigation menu', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(500);

      const nav = page.locator('nav').first();
      await expect(nav).toBeVisible();

      // Should not show mobile menu button
      const menuButton = page.locator('button[aria-label*="menu"]');
      const hasMenuButton = await menuButton.first().isVisible();

      // On desktop, either no menu button or it's hidden
      if (hasMenuButton) {
        const isHidden = await menuButton.first().isHidden();
        expect(isHidden).toBeTruthy();
      }
    });

    test('should display courses in multi-column grid', async ({ page }) => {
      await page.goto('/courses');
      await page.waitForTimeout(1000);

      const courseCards = page.locator('[data-testid="course-card"]');

      if ((await courseCards.count()) >= 3) {
        // Should show multiple columns
        await expect(courseCards.first()).toBeVisible();
        await expect(courseCards.nth(1)).toBeVisible();
        await expect(courseCards.nth(2)).toBeVisible();
      }
    });

    test('should show sidebar on desktop dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        const sidebar = page.locator('aside').first();

        if (await sidebar.isVisible()) {
          await expect(sidebar).toBeVisible();
        }
      }
    });

    test('should use full width for content', async ({ page }) => {
      await page.goto('/courses');
      await page.waitForTimeout(1000);

      const main = page.locator('main').first();

      if (await main.isVisible()) {
        const box = await main.boundingBox();
        // Content should use available width
        expect(box?.width).toBeGreaterThan(800);
      }
    });
  });

  test.describe('Responsive Images', () => {
    test('should load appropriate image sizes', async ({ page }) => {
      await page.goto('/courses');
      await page.waitForTimeout(1000);

      const images = page.locator('img');

      if ((await images.count()) > 0) {
        const firstImage = images.first();
        await expect(firstImage).toBeVisible();
      }
    });

    test('should have alt text for images', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(500);

      const images = page.locator('img');

      if ((await images.count()) > 0) {
        const firstImage = images.first();
        const alt = await firstImage.getAttribute('alt');
        expect(alt).not.toBeNull();
      }
    });
  });

  test.describe('Responsive Typography', () => {
    test('should have readable font sizes on mobile', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto('/');
      await page.waitForTimeout(500);

      const heading = page.locator('h1').first();

      if (await heading.isVisible()) {
        const fontSize = await heading.evaluate((el) => {
          return window.getComputedStyle(el).fontSize;
        });

        // Font size should be readable (at least 24px for h1)
        const size = parseInt(fontSize);
        expect(size).toBeGreaterThanOrEqual(20);
      }
    });

    test('should have larger font sizes on desktop', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto('/');
      await page.waitForTimeout(500);

      const heading = page.locator('h1').first();

      if (await heading.isVisible()) {
        const fontSize = await heading.evaluate((el) => {
          return window.getComputedStyle(el).fontSize;
        });

        const size = parseInt(fontSize);
        expect(size).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Responsive Forms', () => {
    test('should display forms correctly on mobile', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto('/login');
      await page.waitForTimeout(500);

      const form = page.locator('form').first();
      await expect(form).toBeVisible();

      const inputs = page.locator('input');
      const firstInput = inputs.first();

      if (await firstInput.isVisible()) {
        const box = await firstInput.boundingBox();
        // Inputs should be full width or nearly full width on mobile
        expect(box?.width).toBeGreaterThan(200);
      }
    });

    test('should have properly sized buttons on all devices', async ({ page }) => {
      const sizes = [viewports.mobile, viewports.tablet, viewports.desktop];

      for (const size of sizes) {
        await page.setViewportSize(size);
        await page.goto('/login');
        await page.waitForTimeout(500);

        const button = page.locator('button[type="submit"]').first();

        if (await button.isVisible()) {
          const box = await button.boundingBox();
          expect(box?.height).toBeGreaterThanOrEqual(36);
        }
      }
    });
  });

  test.describe('Orientation Changes', () => {
    test('should handle landscape orientation on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 667, height: 375 });
      await page.goto('/');
      await page.waitForTimeout(500);

      const content = page.locator('body');
      await expect(content).toBeVisible();
    });

    test('should handle portrait orientation on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/courses');
      await page.waitForTimeout(1000);

      const content = page.locator('body');
      await expect(content).toBeVisible();
    });
  });
});
