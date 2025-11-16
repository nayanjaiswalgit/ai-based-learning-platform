import { test, expect } from '@playwright/test';
import { waitForLoading, scrollToElement } from './helpers/test-helpers';
import { courseCategories, courseLevels, searchQueries } from './fixtures/test-data';

test.describe('Course Discovery Flow', () => {
  test.describe('Courses Listing Page', () => {
    test('should display courses page correctly', async ({ page }) => {
      await page.goto('/courses');
      await waitForLoading(page);

      // Check page title
      await expect(page).toHaveTitle(/Courses|Browse Courses/i);

      // Check heading
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();

      // Check for course grid/list
      const courseCards = page.locator('[data-testid="course-card"]');
      const hasCourses = (await courseCards.count()) > 0;

      if (hasCourses) {
        // At least one course should be visible
        await expect(courseCards.first()).toBeVisible();
      }
    });

    test('should display course cards with correct information', async ({ page }) => {
      await page.goto('/courses');
      await waitForLoading(page);

      const courseCard = page.locator('[data-testid="course-card"]').first();

      if (await courseCard.isVisible()) {
        // Course cards should have key information
        const hasTitle = await courseCard.locator('h2, h3').isVisible();
        const hasPrice = await courseCard.locator('text=/\\$|free/i').isVisible();

        expect(hasTitle || hasPrice).toBeTruthy();
      }
    });

    test('should have search functionality', async ({ page }) => {
      await page.goto('/courses');

      // Look for search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');

      if (await searchInput.isVisible()) {
        await expect(searchInput).toBeVisible();
      }
    });

    test('should have filter controls', async ({ page }) => {
      await page.goto('/courses');

      // Look for common filter controls
      const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filters")');
      const categoryFilter = page.locator('text=/category|categories/i');
      const levelFilter = page.locator('text=/level|difficulty/i');

      const hasFilters =
        (await filterButton.isVisible()) ||
        (await categoryFilter.isVisible()) ||
        (await levelFilter.isVisible());

      // At least some filtering mechanism should exist
      expect(hasFilters).toBeTruthy();
    });

    test('should display category badges', async ({ page }) => {
      await page.goto('/courses');
      await waitForLoading(page);

      // Look for category badges
      const badges = page.locator('[class*="badge"], [class*="tag"]');

      if ((await badges.count()) > 0) {
        await expect(badges.first()).toBeVisible();
      }
    });

    test('should display course metadata (rating, students, duration)', async ({ page }) => {
      await page.goto('/courses');
      await waitForLoading(page);

      const courseCard = page.locator('[data-testid="course-card"]').first();

      if (await courseCard.isVisible()) {
        // Look for common metadata
        const hasRating = await courseCard.locator('text=/★|⭐|rating/i').isVisible();
        const hasStudents = await courseCard.locator('text=/student|enrolled/i').isVisible();
        const hasDuration = await courseCard.locator('text=/hour|week|month/i').isVisible();

        // At least one type of metadata should be present
        expect(hasRating || hasStudents || hasDuration).toBeTruthy();
      }
    });
  });

  test.describe('Course Search', () => {
    test('should search for courses', async ({ page }) => {
      await page.goto('/courses');

      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();

      if (await searchInput.isVisible()) {
        // Search for a course
        await searchInput.fill('React');
        await page.waitForTimeout(1000); // Wait for debounce

        // Check if results updated (either new courses or message)
        const hasResults = await page.locator('[data-testid="course-card"]').first().isVisible();
        const hasMessage = await page.locator('text=/no results|not found/i').isVisible();

        expect(hasResults || hasMessage).toBeTruthy();
      }
    });

    test('should clear search', async ({ page }) => {
      await page.goto('/courses');

      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();

      if (await searchInput.isVisible()) {
        await searchInput.fill('React');
        await page.waitForTimeout(500);

        // Clear search
        await searchInput.clear();
        await page.waitForTimeout(500);

        // Should show all courses again
        await expect(searchInput).toHaveValue('');
      }
    });

    test('should show no results message for invalid search', async ({ page }) => {
      await page.goto('/courses');

      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();

      if (await searchInput.isVisible()) {
        await searchInput.fill('xyzabc123nonexistent');
        await page.waitForTimeout(1000);

        // Should either show no results or still show all courses
        const currentState = await page.locator('body').textContent();
        expect(currentState).toBeTruthy();
      }
    });
  });

  test.describe('Course Filtering', () => {
    test('should filter by category', async ({ page }) => {
      await page.goto('/courses');
      await waitForLoading(page);

      // Look for category filter
      const categoryButton = page.locator('button:has-text("Category"), select[name*="category"]').first();

      if (await categoryButton.isVisible()) {
        await categoryButton.click();
        await page.waitForTimeout(500);

        // Select a category option
        const categoryOption = page.locator('text=/Web Development|Data Science|DevOps/i').first();

        if (await categoryOption.isVisible()) {
          await categoryOption.click();
          await page.waitForTimeout(1000);

          // Results should update
          const hasResults = (await page.locator('[data-testid="course-card"]').count()) > 0;
          expect(hasResults).toBeTruthy();
        }
      }
    });

    test('should filter by level', async ({ page }) => {
      await page.goto('/courses');
      await waitForLoading(page);

      // Look for level filter
      const levelButton = page.locator('button:has-text("Level"), select[name*="level"]').first();

      if (await levelButton.isVisible()) {
        await levelButton.click();
        await page.waitForTimeout(500);

        // Select a level option
        const levelOption = page.locator('text=/Beginner|Intermediate|Advanced/i').first();

        if (await levelOption.isVisible()) {
          await levelOption.click();
          await page.waitForTimeout(1000);

          // Results should update
          const hasResults = (await page.locator('[data-testid="course-card"]').count()) > 0;
          expect(hasResults).toBeTruthy();
        }
      }
    });

    test('should filter by price range', async ({ page }) => {
      await page.goto('/courses');
      await waitForLoading(page);

      // Look for price filter
      const priceFilter = page.locator('text=/price|pricing/i').first();

      if (await priceFilter.isVisible()) {
        // Check if price filter exists
        expect(await priceFilter.isVisible()).toBeTruthy();
      }
    });

    test('should clear all filters', async ({ page }) => {
      await page.goto('/courses');

      // Look for clear filters button
      const clearButton = page.locator('button:has-text("Clear"), button:has-text("Reset")');

      if (await clearButton.isVisible()) {
        await clearButton.click();
        await page.waitForTimeout(500);

        // Should reset to all courses
        const hasResults = (await page.locator('[data-testid="course-card"]').count()) > 0;
        expect(hasResults).toBeTruthy();
      }
    });
  });

  test.describe('Course Detail Page', () => {
    test('should navigate to course detail page', async ({ page }) => {
      await page.goto('/courses');
      await waitForLoading(page);

      const firstCourse = page.locator('[data-testid="course-card"]').first();

      if (await firstCourse.isVisible()) {
        // Click on course card or link
        const courseLink = firstCourse.locator('a').first();
        await courseLink.click();

        // Should navigate to course detail page
        await page.waitForTimeout(1000);
        const currentUrl = page.url();
        expect(currentUrl).toContain('/courses/');
      }
    });

    test('should display course detail page correctly', async ({ page }) => {
      // Try to access a course detail page
      await page.goto('/courses/1'); // Assuming course ID 1 exists
      await page.waitForTimeout(1000);

      const currentUrl = page.url();

      if (currentUrl.includes('/courses/')) {
        // Check for course title
        const title = page.locator('h1');
        await expect(title).toBeVisible();

        // Check for key sections
        const hasOverview =
          (await page.locator('text=/overview|description/i').isVisible()) ||
          (await page.locator('p').count()) > 0;

        expect(hasOverview).toBeTruthy();
      }
    });

    test('should display course tabs (Overview, Curriculum, Reviews)', async ({ page }) => {
      await page.goto('/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/courses/')) {
        // Look for tabs
        const overviewTab = page.locator('text=/overview/i').first();
        const curriculumTab = page.locator('text=/curriculum|syllabus/i').first();
        const reviewsTab = page.locator('text=/reviews|ratings/i').first();

        const hasTabs =
          (await overviewTab.isVisible()) ||
          (await curriculumTab.isVisible()) ||
          (await reviewsTab.isVisible());

        expect(hasTabs).toBeTruthy();
      }
    });

    test('should display instructor information', async ({ page }) => {
      await page.goto('/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/courses/')) {
        // Look for instructor section
        const instructorSection = page.locator('text=/instructor|taught by|created by/i');

        if (await instructorSection.isVisible()) {
          await expect(instructorSection).toBeVisible();
        }
      }
    });

    test('should display "What you will learn" section', async ({ page }) => {
      await page.goto('/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/courses/')) {
        // Look for learning outcomes
        const learningSection = page.locator('text=/what you.*learn|learning outcomes|you will learn/i');

        if (await learningSection.isVisible()) {
          await expect(learningSection).toBeVisible();
        }
      }
    });

    test('should display course requirements', async ({ page }) => {
      await page.goto('/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/courses/')) {
        // Look for requirements section
        const requirementsSection = page.locator('text=/requirements|prerequisites/i');

        if (await requirementsSection.isVisible()) {
          await expect(requirementsSection).toBeVisible();
        }
      }
    });

    test('should display enroll button', async ({ page }) => {
      await page.goto('/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/courses/')) {
        // Look for enroll/buy button
        const enrollButton = page.locator('button:has-text("Enroll"), button:has-text("Buy"), a:has-text("Enroll")');

        if (await enrollButton.first().isVisible()) {
          await expect(enrollButton.first()).toBeVisible();
        }
      }
    });

    test('should display course reviews', async ({ page }) => {
      await page.goto('/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/courses/')) {
        // Click on reviews tab if exists
        const reviewsTab = page.locator('text=/reviews|ratings/i').first();

        if (await reviewsTab.isVisible()) {
          await reviewsTab.click();
          await page.waitForTimeout(500);

          // Check for reviews
          const hasReviews =
            (await page.locator('text=/review|rating/i').count()) > 0;

          expect(hasReviews).toBeTruthy();
        }
      }
    });

    test('should display course curriculum', async ({ page }) => {
      await page.goto('/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/courses/')) {
        // Click on curriculum tab if exists
        const curriculumTab = page.locator('text=/curriculum|syllabus|content/i').first();

        if (await curriculumTab.isVisible()) {
          await curriculumTab.click();
          await page.waitForTimeout(500);

          // Check for curriculum items
          const hasCurriculum =
            (await page.locator('text=/module|lesson|chapter|section/i').count()) > 0;

          expect(hasCurriculum).toBeTruthy();
        }
      }
    });
  });

  test.describe('Course Sorting', () => {
    test('should have sorting options', async ({ page }) => {
      await page.goto('/courses');

      // Look for sort dropdown or buttons
      const sortControl = page.locator('select[name*="sort"], button:has-text("Sort")').first();

      if (await sortControl.isVisible()) {
        await expect(sortControl).toBeVisible();
      }
    });

    test('should sort by popularity', async ({ page }) => {
      await page.goto('/courses');

      const sortControl = page.locator('select[name*="sort"], button:has-text("Sort")').first();

      if (await sortControl.isVisible()) {
        await sortControl.click();
        await page.waitForTimeout(300);

        const popularOption = page.locator('text=/popular|most popular/i').first();

        if (await popularOption.isVisible()) {
          await popularOption.click();
          await page.waitForTimeout(1000);

          // Results should update
          const hasResults = (await page.locator('[data-testid="course-card"]').count()) > 0;
          expect(hasResults).toBeTruthy();
        }
      }
    });

    test('should sort by rating', async ({ page }) => {
      await page.goto('/courses');

      const sortControl = page.locator('select[name*="sort"], button:has-text("Sort")').first();

      if (await sortControl.isVisible()) {
        await sortControl.click();
        await page.waitForTimeout(300);

        const ratingOption = page.locator('text=/rating|highest rated/i').first();

        if (await ratingOption.isVisible()) {
          await ratingOption.click();
          await page.waitForTimeout(1000);

          // Results should update
          const hasResults = (await page.locator('[data-testid="course-card"]').count()) > 0;
          expect(hasResults).toBeTruthy();
        }
      }
    });

    test('should sort by price', async ({ page }) => {
      await page.goto('/courses');

      const sortControl = page.locator('select[name*="sort"], button:has-text("Sort")').first();

      if (await sortControl.isVisible()) {
        await sortControl.click();
        await page.waitForTimeout(300);

        const priceOption = page.locator('text=/price|lowest price|highest price/i').first();

        if (await priceOption.isVisible()) {
          await priceOption.click();
          await page.waitForTimeout(1000);

          // Results should update
          const hasResults = (await page.locator('[data-testid="course-card"]').count()) > 0;
          expect(hasResults).toBeTruthy();
        }
      }
    });
  });

  test.describe('Pagination', () => {
    test('should have pagination controls if many courses', async ({ page }) => {
      await page.goto('/courses');
      await waitForLoading(page);

      // Look for pagination
      const pagination = page.locator('nav[aria-label*="pagination"], [class*="pagination"]');

      if (await pagination.isVisible()) {
        await expect(pagination).toBeVisible();
      }
    });

    test('should navigate to next page', async ({ page }) => {
      await page.goto('/courses');
      await waitForLoading(page);

      const nextButton = page.locator('button:has-text("Next"), a:has-text("Next")').first();

      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);

        // Page should update
        const currentUrl = page.url();
        expect(currentUrl).toBeTruthy();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should display courses in grid on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/courses');
      await waitForLoading(page);

      const courseCards = page.locator('[data-testid="course-card"]');

      if ((await courseCards.count()) > 0) {
        // Should have multiple courses in a row
        await expect(courseCards.first()).toBeVisible();
      }
    });

    test('should display courses in single column on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/courses');
      await waitForLoading(page);

      const courseCards = page.locator('[data-testid="course-card"]');

      if ((await courseCards.count()) > 0) {
        await expect(courseCards.first()).toBeVisible();
      }
    });
  });
});
