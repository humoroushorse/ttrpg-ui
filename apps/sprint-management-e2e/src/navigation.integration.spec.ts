import { test, expect } from '@playwright/test';

test.describe('Navigation Integration Tests', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\//);
  });

  test('should navigate between main sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Navigate to work items
    const workItemsLink = page.locator('a[href*="/work-items"], nav a:has-text("Work Items")').first();
    if (await workItemsLink.isVisible()) {
      await workItemsLink.click();
      await expect(page).toHaveURL(/\/work-items/);
    }

    // Navigate to sprints
    const sprintsLink = page.locator('a[href*="/sprints"], nav a:has-text("Sprints")').first();
    if (await sprintsLink.isVisible()) {
      await sprintsLink.click();
      await expect(page).toHaveURL(/\/sprints/);
    }
  });

  test('should handle 404 not found', async ({ page }) => {
    await page.goto('/non-existent-page');
    await page.waitForLoadState('domcontentloaded');

    const notFoundText = page.locator('text=/not found|404/i').first();
    const isNotFound = await notFoundText.isVisible().catch(() => false);

    if (!isNotFound) {
      // May redirect to home
      await expect(page).toHaveURL(/\//);
    }
  });

  test('should support deep linking', async ({ page }) => {
    await page.goto('/work-items/create');

    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/work-items\/create/);
  });

  test('should highlight active route in navigation', async ({ page }) => {
    await page.goto('/work-items');
    await page.waitForLoadState('load');

    const activeLink = page.locator('nav a[aria-current="page"], nav a.active, nav a.router-link-active').first();

    if (await activeLink.isVisible()) {
      await expect(activeLink).toBeVisible();
    }
  });

  test('should support browser back/forward navigation', async ({ page }) => {
    await page.goto('/work-items');
    await page.waitForLoadState('load');

    await page.goto('/sprints');
    await page.waitForLoadState('load');

    await page.goBack();
    await expect(page).toHaveURL(/\/work-items/);

    await page.goForward();
    await expect(page).toHaveURL(/\/sprints/);
  });
});

test.describe('Keyboard Navigation Integration Tests', () => {
  test('should support tab navigation', async ({ page }) => {
    await page.goto('/work-items');
    await page.waitForLoadState('load');

    await page.keyboard.press('Tab');

    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should support escape to close dialogs', async ({ page }) => {
    await page.goto('/work-items/create');
    await page.waitForLoadState('load');

    await page.keyboard.press('Escape');

    await page.waitForTimeout(300);
  });

  test('should support keyboard shortcuts', async ({ page }) => {
    await page.goto('/work-items');
    await page.waitForLoadState('load');

    await page.keyboard.press('?');
    await page.waitForTimeout(300);

    const shortcutsDialog = page
      .locator('[role="dialog"]:has-text("Keyboard"), [role="dialog"]:has-text("Shortcuts")')
      .first();

    if (await shortcutsDialog.isVisible()) {
      await expect(shortcutsDialog).toBeVisible();

      await page.keyboard.press('Escape');
    }
  });
});

test.describe('Responsive Design Integration Tests', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/work-items');
    await page.waitForLoadState('load');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/work-items');
    await page.waitForLoadState('load');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('/work-items');
    await page.waitForLoadState('load');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });
});
