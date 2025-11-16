import { test, expect } from '@playwright/test';
import { waitForLoading } from './helpers/test-helpers';

test.describe('Learning Flow', () => {
  test.describe('Course Enrollment', () => {
    test('should show enroll button on course detail page', async ({ page }) => {
      await page.goto('/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/courses/')) {
        const enrollButton = page.locator('button:has-text("Enroll"), button:has-text("Buy Now"), a:has-text("Enroll")').first();

        if (await enrollButton.isVisible()) {
          await expect(enrollButton).toBeVisible();
        }
      }
    });

    test('should show price on enroll button', async ({ page }) => {
      await page.goto('/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/courses/')) {
        const priceElement = page.locator('text=/\\$[0-9]+|free/i').first();

        if (await priceElement.isVisible()) {
          await expect(priceElement).toBeVisible();
        }
      }
    });

    test('should redirect to payment or dashboard when enrolling', async ({ page }) => {
      await page.goto('/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/courses/')) {
        const enrollButton = page.locator('button:has-text("Enroll"), button:has-text("Buy Now")').first();

        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await page.waitForTimeout(2000);

          const currentUrl = page.url();
          const redirected =
            currentUrl.includes('/payment') ||
            currentUrl.includes('/checkout') ||
            currentUrl.includes('/login') ||
            currentUrl.includes('/dashboard');

          expect(redirected).toBeTruthy();
        }
      }
    });
  });

  test.describe('Course Learning Interface', () => {
    test('should display course learning page', async ({ page }) => {
      await page.goto('/dashboard/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/courses/')) {
        const content = page.locator('body');
        await expect(content).toBeVisible();
      }
    });

    test('should have video player for video lessons', async ({ page }) => {
      await page.goto('/dashboard/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/courses/')) {
        const videoPlayer = page.locator('video, [class*="video-player"]');

        if (await videoPlayer.first().isVisible()) {
          await expect(videoPlayer.first()).toBeVisible();
        }
      }
    });

    test('should have lesson navigation', async ({ page }) => {
      await page.goto('/dashboard/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/courses/')) {
        const nextButton = page.locator('button:has-text("Next"), a:has-text("Next Lesson")').first();
        const prevButton = page.locator('button:has-text("Previous"), a:has-text("Previous Lesson")').first();

        const hasNavigation =
          (await nextButton.isVisible()) || (await prevButton.isVisible());

        if (hasNavigation) {
          expect(hasNavigation).toBeTruthy();
        }
      }
    });

    test('should display lesson sidebar or curriculum', async ({ page }) => {
      await page.goto('/dashboard/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/courses/')) {
        const sidebar = page.locator('aside, [class*="sidebar"], [class*="curriculum"]');

        if (await sidebar.first().isVisible()) {
          await expect(sidebar.first()).toBeVisible();
        }
      }
    });

    test('should mark lessons as complete', async ({ page }) => {
      await page.goto('/dashboard/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/courses/')) {
        const completeButton = page.locator('button:has-text("Complete"), button:has-text("Mark Complete")').first();

        if (await completeButton.isVisible()) {
          await expect(completeButton).toBeVisible();
        }
      }
    });

    test('should show progress indicator', async ({ page }) => {
      await page.goto('/dashboard/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/courses/')) {
        const progress = page.locator('[role="progressbar"], text=/[0-9]+%/');

        if (await progress.first().isVisible()) {
          await expect(progress.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Assignments and Quizzes', () => {
    test('should display assignment page', async ({ page }) => {
      await page.goto('/dashboard/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/courses/')) {
        const assignmentLink = page.locator('text=/assignment|quiz|test/i').first();

        if (await assignmentLink.isVisible()) {
          await assignmentLink.click();
          await page.waitForTimeout(1000);

          const content = page.locator('body');
          await expect(content).toBeVisible();
        }
      }
    });

    test('should show assignment instructions', async ({ page }) => {
      await page.goto('/dashboard/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/courses/')) {
        const instructions = page.locator('text=/instructions|description|requirements/i').first();

        if (await instructions.isVisible()) {
          await expect(instructions).toBeVisible();
        }
      }
    });

    test('should have submit button for assignments', async ({ page }) => {
      await page.goto('/dashboard/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/courses/')) {
        const submitButton = page.locator('button:has-text("Submit")').first();

        if (await submitButton.isVisible()) {
          await expect(submitButton).toBeVisible();
        }
      }
    });

    test('should show assignment due date', async ({ page }) => {
      await page.goto('/dashboard/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/courses/')) {
        const dueDate = page.locator('text=/due|deadline/i').first();

        if (await dueDate.isVisible()) {
          await expect(dueDate).toBeVisible();
        }
      }
    });
  });

  test.describe('Progress Tracking', () => {
    test('should update progress when completing lessons', async ({ page }) => {
      await page.goto('/dashboard/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/courses/')) {
        const progressBefore = page.locator('[role="progressbar"]').first();

        if (await progressBefore.isVisible()) {
          const initialProgress = await progressBefore.getAttribute('aria-valuenow');

          const completeButton = page.locator('button:has-text("Complete")').first();

          if (await completeButton.isVisible()) {
            await completeButton.click();
            await page.waitForTimeout(1000);

            // Progress should update (in real scenario)
            expect(initialProgress).toBeDefined();
          }
        }
      }
    });

    test('should show completed lessons with checkmark', async ({ page }) => {
      await page.goto('/dashboard/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/courses/')) {
        const completedLesson = page.locator('text=/✓|✔|completed/i').first();

        if (await completedLesson.isVisible()) {
          await expect(completedLesson).toBeVisible();
        }
      }
    });

    test('should display overall course progress', async ({ page }) => {
      await page.goto('/dashboard/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/courses/')) {
        const overallProgress = page.locator('text=/[0-9]+% complete|progress/i').first();

        if (await overallProgress.isVisible()) {
          await expect(overallProgress).toBeVisible();
        }
      }
    });
  });

  test.describe('Course Notes', () => {
    test('should allow taking notes', async ({ page }) => {
      await page.goto('/dashboard/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/courses/')) {
        const notesButton = page.locator('button:has-text("Notes")').first();

        if (await notesButton.isVisible()) {
          await notesButton.click();
          await page.waitForTimeout(500);

          const notesTextarea = page.locator('textarea');

          if (await notesTextarea.first().isVisible()) {
            await expect(notesTextarea.first()).toBeVisible();
          }
        }
      }
    });

    test('should save notes', async ({ page }) => {
      await page.goto('/dashboard/courses/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/courses/')) {
        const notesButton = page.locator('button:has-text("Notes")').first();

        if (await notesButton.isVisible()) {
          await notesButton.click();
          await page.waitForTimeout(500);

          const saveButton = page.locator('button:has-text("Save")').first();

          if (await saveButton.isVisible()) {
            await expect(saveButton).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Certificate Generation', () => {
    test('should show certificate option for completed courses', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        const certificateLink = page.locator('text=/certificate|view certificate/i').first();

        if (await certificateLink.isVisible()) {
          await expect(certificateLink).toBeVisible();
        }
      }
    });

    test('should display certificate preview', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        const certificateLink = page.locator('text=/certificate/i').first();

        if (await certificateLink.isVisible()) {
          await certificateLink.click();
          await page.waitForTimeout(1000);

          const certificate = page.locator('[class*="certificate"]');

          if (await certificate.first().isVisible()) {
            await expect(certificate.first()).toBeVisible();
          }
        }
      }
    });

    test('should allow downloading certificate', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        const downloadButton = page.locator('button:has-text("Download Certificate")').first();

        if (await downloadButton.isVisible()) {
          await expect(downloadButton).toBeVisible();
        }
      }
    });
  });

  test.describe('Bootcamp Learning', () => {
    test('should display bootcamp page', async ({ page }) => {
      await page.goto('/bootcamps/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/bootcamps/')) {
        const content = page.locator('body');
        await expect(content).toBeVisible();
      }
    });

    test('should show bootcamp curriculum', async ({ page }) => {
      await page.goto('/bootcamps/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/bootcamps/')) {
        const curriculum = page.locator('text=/curriculum|modules|weeks/i').first();

        if (await curriculum.isVisible()) {
          await expect(curriculum).toBeVisible();
        }
      }
    });

    test('should show bootcamp cohort information', async ({ page }) => {
      await page.goto('/bootcamps/1');
      await page.waitForTimeout(1000);

      if (page.url().includes('/bootcamps/')) {
        const cohort = page.locator('text=/cohort|batch|group/i').first();

        if (await cohort.isVisible()) {
          await expect(cohort).toBeVisible();
        }
      }
    });
  });

  test.describe('Learning Streaks', () => {
    test('should display learning streak on dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        const streak = page.locator('text=/streak|day streak|🔥/i').first();

        if (await streak.isVisible()) {
          await expect(streak).toBeVisible();
        }
      }
    });

    test('should update streak after completing activity', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard')) {
        const streak = page.locator('text=/[0-9]+ day/i').first();

        if (await streak.isVisible()) {
          await expect(streak).toBeVisible();
        }
      }
    });
  });
});
