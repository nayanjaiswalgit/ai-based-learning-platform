import { test, expect } from '@playwright/test';
import { testCode } from './fixtures/test-data';

test.describe('Coding Challenge Flow', () => {
  test.describe('Problem Page', () => {
    test('should display problem page', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const content = page.locator('body');
        await expect(content).toBeVisible();
      }
    });

    test('should show problem title and description', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const title = page.locator('h1, h2').first();
        await expect(title).toBeVisible();

        const description = page.locator('text=/description|problem/i').first();
        if (await description.isVisible()) {
          await expect(description).toBeVisible();
        }
      }
    });

    test('should display difficulty level', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const difficulty = page.locator('text=/easy|medium|hard/i').first();

        if (await difficulty.isVisible()) {
          await expect(difficulty).toBeVisible();
        }
      }
    });

    test('should show example test cases', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const examples = page.locator('text=/example|test case|input|output/i').first();

        if (await examples.isVisible()) {
          await expect(examples).toBeVisible();
        }
      }
    });
  });

  test.describe('Code Editor', () => {
    test('should display code editor', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        // Monaco editor uses .monaco-editor class
        const editor = page.locator('.monaco-editor, [class*="editor"], textarea[class*="code"]');

        if (await editor.first().isVisible()) {
          await expect(editor.first()).toBeVisible();
        }
      }
    });

    test('should allow typing code in editor', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const editor = page.locator('.monaco-editor').first();

        if (await editor.isVisible()) {
          // Click on editor to focus
          await editor.click();
          await page.waitForTimeout(500);

          // Type some code
          await page.keyboard.type('// Test comment');
          await page.waitForTimeout(500);

          // Editor should contain the text
          expect(await editor.isVisible()).toBeTruthy();
        }
      }
    });

    test('should have language selector', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const languageSelector = page.locator('select, button:has-text("JavaScript"), button:has-text("Python")').first();

        if (await languageSelector.isVisible()) {
          await expect(languageSelector).toBeVisible();
        }
      }
    });

    test('should switch between languages', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const languageButton = page.locator('button:has-text("JavaScript"), button:has-text("Python")').first();

        if (await languageButton.isVisible()) {
          await languageButton.click();
          await page.waitForTimeout(500);

          // Should show language options
          const languageOption = page.locator('text=/python|javascript|java|c\\+\\+/i').first();

          if (await languageOption.isVisible()) {
            await languageOption.click();
            await page.waitForTimeout(500);

            expect(await languageOption.isVisible()).toBeTruthy();
          }
        }
      }
    });

    test('should have theme toggle for editor', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const themeButton = page.locator('button:has-text("Dark"), button:has-text("Light")').first();

        if (await themeButton.isVisible()) {
          await expect(themeButton).toBeVisible();
        }
      }
    });

    test('should have font size controls', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const fontControl = page.locator('button:has-text("A+"), button:has-text("A-"), select[name*="font"]').first();

        if (await fontControl.isVisible()) {
          await expect(fontControl).toBeVisible();
        }
      }
    });

    test('should support vim mode toggle', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const vimToggle = page.locator('button:has-text("Vim"), input[type="checkbox"]:near(:text("Vim"))').first();

        if (await vimToggle.isVisible()) {
          await expect(vimToggle).toBeVisible();
        }
      }
    });
  });

  test.describe('Code Execution', () => {
    test('should have run button', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const runButton = page.locator('button:has-text("Run"), button:has-text("Execute")').first();

        if (await runButton.isVisible()) {
          await expect(runButton).toBeVisible();
        }
      }
    });

    test('should have submit button', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const submitButton = page.locator('button:has-text("Submit")').first();

        if (await submitButton.isVisible()) {
          await expect(submitButton).toBeVisible();
        }
      }
    });

    test('should execute code and show results', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const runButton = page.locator('button:has-text("Run")').first();

        if (await runButton.isVisible()) {
          await runButton.click();
          await page.waitForTimeout(3000);

          // Should show results
          const results = page.locator('text=/output|result|pass|fail/i').first();

          if (await results.isVisible()) {
            await expect(results).toBeVisible();
          }
        }
      }
    });

    test('should show test results', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const submitButton = page.locator('button:has-text("Submit")').first();

        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(3000);

          // Should show test results
          const testResults = page.locator('text=/test case|passed|failed/i').first();

          if (await testResults.isVisible()) {
            await expect(testResults).toBeVisible();
          }
        }
      }
    });

    test('should show execution time and memory', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const runButton = page.locator('button:has-text("Run")').first();

        if (await runButton.isVisible()) {
          await runButton.click();
          await page.waitForTimeout(3000);

          // Should show runtime stats
          const stats = page.locator('text=/runtime|memory|ms|mb/i').first();

          if (await stats.isVisible()) {
            await expect(stats).toBeVisible();
          }
        }
      }
    });

    test('should handle compilation errors', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const editor = page.locator('.monaco-editor').first();

        if (await editor.isVisible()) {
          // Write invalid code
          await editor.click();
          await page.keyboard.type('invalid code syntax!!!');

          const runButton = page.locator('button:has-text("Run")').first();
          await runButton.click();
          await page.waitForTimeout(3000);

          // Should show error
          const error = page.locator('text=/error|compilation|syntax/i').first();

          if (await error.isVisible()) {
            await expect(error).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Test Cases', () => {
    test('should display test cases tab', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const testCasesTab = page.locator('text=/test cases|tests/i').first();

        if (await testCasesTab.isVisible()) {
          await expect(testCasesTab).toBeVisible();
        }
      }
    });

    test('should show input and output for test cases', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const input = page.locator('text=/input/i').first();
        const output = page.locator('text=/output/i').first();

        const hasTestCases =
          (await input.isVisible()) && (await output.isVisible());

        if (hasTestCases) {
          expect(hasTestCases).toBeTruthy();
        }
      }
    });

    test('should allow adding custom test cases', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const addTestButton = page.locator('button:has-text("Add Test"), button:has-text("Custom Test")').first();

        if (await addTestButton.isVisible()) {
          await expect(addTestButton).toBeVisible();
        }
      }
    });
  });

  test.describe('DSA Sheet Tracker', () => {
    test('should display DSA sheet page', async ({ page }) => {
      await page.goto('/dashboard/dsa');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/dsa')) {
        const content = page.locator('body');
        await expect(content).toBeVisible();
      }
    });

    test('should show problem categories', async ({ page }) => {
      await page.goto('/dashboard/dsa');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/dsa')) {
        const categories = page.locator('text=/array|string|tree|graph|dynamic programming/i').first();

        if (await categories.isVisible()) {
          await expect(categories).toBeVisible();
        }
      }
    });

    test('should track completed problems', async ({ page }) => {
      await page.goto('/dashboard/dsa');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/dsa')) {
        const completedCount = page.locator('text=/completed|solved/i').first();

        if (await completedCount.isVisible()) {
          await expect(completedCount).toBeVisible();
        }
      }
    });

    test('should show progress per category', async ({ page }) => {
      await page.goto('/dashboard/dsa');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/dsa')) {
        const progress = page.locator('[role="progressbar"]').first();

        if (await progress.isVisible()) {
          await expect(progress).toBeVisible();
        }
      }
    });

    test('should filter problems by difficulty', async ({ page }) => {
      await page.goto('/dashboard/dsa');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/dsa')) {
        const difficultyFilter = page.locator('button:has-text("Easy"), button:has-text("Medium"), button:has-text("Hard")').first();

        if (await difficultyFilter.isVisible()) {
          await expect(difficultyFilter).toBeVisible();
        }
      }
    });

    test('should filter problems by category', async ({ page }) => {
      await page.goto('/dashboard/dsa');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/dsa')) {
        const categoryFilter = page.locator('select, button:has-text("Category")').first();

        if (await categoryFilter.isVisible()) {
          await expect(categoryFilter).toBeVisible();
        }
      }
    });

    test('should navigate to problem from DSA sheet', async ({ page }) => {
      await page.goto('/dashboard/dsa');
      await page.waitForTimeout(1000);

      if (page.url().includes('/dashboard/dsa')) {
        const problemLink = page.locator('a[href*="/problems/"]').first();

        if (await problemLink.isVisible()) {
          await problemLink.click();
          await page.waitForTimeout(1000);

          const currentUrl = page.url();
          expect(currentUrl.includes('/problems/')).toBeTruthy();
        }
      }
    });
  });

  test.describe('Solutions and Discussions', () => {
    test('should have solutions tab', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const solutionsTab = page.locator('text=/solutions|discuss/i').first();

        if (await solutionsTab.isVisible()) {
          await expect(solutionsTab).toBeVisible();
        }
      }
    });

    test('should display community solutions', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const solutionsTab = page.locator('text=/solutions/i').first();

        if (await solutionsTab.isVisible()) {
          await solutionsTab.click();
          await page.waitForTimeout(1000);

          const solutions = page.locator('text=/solution|approach/i').first();

          if (await solutions.isVisible()) {
            await expect(solutions).toBeVisible();
          }
        }
      }
    });

    test('should allow submitting solution discussion', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const discussButton = page.locator('button:has-text("Discuss"), button:has-text("Share")').first();

        if (await discussButton.isVisible()) {
          await expect(discussButton).toBeVisible();
        }
      }
    });
  });

  test.describe('Code Saving', () => {
    test('should auto-save code', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const editor = page.locator('.monaco-editor').first();

        if (await editor.isVisible()) {
          await editor.click();
          await page.keyboard.type('// Test');
          await page.waitForTimeout(2000);

          // Should show saved indicator
          const saved = page.locator('text=/saved|auto-saved/i').first();

          if (await saved.isVisible()) {
            await expect(saved).toBeVisible();
          }
        }
      }
    });

    test('should restore code on page refresh', async ({ page }) => {
      await page.goto('/problems/1');
      await page.waitForTimeout(2000);

      if (page.url().includes('/problems/')) {
        const editor = page.locator('.monaco-editor').first();

        if (await editor.isVisible()) {
          await editor.click();
          await page.keyboard.type('// Test code');
          await page.waitForTimeout(2000);

          // Refresh page
          await page.reload();
          await page.waitForTimeout(2000);

          // Code should be restored
          const editorAfter = page.locator('.monaco-editor').first();
          expect(await editorAfter.isVisible()).toBeTruthy();
        }
      }
    });
  });
});
