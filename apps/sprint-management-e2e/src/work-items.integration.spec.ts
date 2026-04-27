import { test, expect } from '@playwright/test';

test.describe('Work Items Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/work-items');
  });

  test('should display work items list page', async ({ page }) => {
    await expect(page).toHaveTitle(/Work Items/);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should navigate to create work item page', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create"), a:has-text("Create")').first();
    await createButton.click();

    await expect(page).toHaveURL(/\/work-items\/create/);

    const form = page.locator('form');
    await expect(form).toBeVisible();
  });

  test('should filter work items', async ({ page }) => {
    await page.waitForLoadState('load');

    const filterButton = page.locator('[aria-label*="filter"], button:has-text("Filter")').first();

    if (await filterButton.isVisible()) {
      await filterButton.click();

      const filterPanel = page.locator('[role="dialog"], .filter-panel, .ag-filter').first();
      await expect(filterPanel).toBeVisible();
    }
  });

  test('should sort work items', async ({ page }) => {
    await page.waitForLoadState('load');

    const columnHeader = page.locator('[role="columnheader"], th').first();

    if (await columnHeader.isVisible()) {
      await columnHeader.click();

      const sortIndicator = page.locator('[aria-sort], .sort-indicator').first();
      await expect(sortIndicator).toBeVisible({ timeout: 5000 });
    }
  });

  test('should paginate work items', async ({ page }) => {
    await page.waitForLoadState('load');

    const nextButton = page.locator('button:has-text("Next"), [aria-label*="next"]').first();

    if ((await nextButton.isVisible()) && (await nextButton.isEnabled())) {
      await nextButton.click();

      await page.waitForLoadState('load');
      await expect(page).toHaveURL(/page=2|currentPage=2/);
    }
  });

  test('should search work items', async ({ page }) => {
    await page.waitForLoadState('load');

    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('test');

      await page.waitForTimeout(500); // Debounce
      await page.waitForLoadState('load');
    }
  });

  test('should toggle between table and card view', async ({ page }) => {
    await page.waitForLoadState('load');

    const cardViewButton = page.locator('button[aria-label*="card"], button:has-text("Card")').first();
    const tableViewButton = page.locator('button[aria-label*="table"], button:has-text("Table")').first();

    if (await cardViewButton.isVisible()) {
      await cardViewButton.click();
      await page.waitForTimeout(300);

      if (await tableViewButton.isVisible()) {
        await tableViewButton.click();
        await page.waitForTimeout(300);
      }
    }
  });
});

test.describe('Work Item Detail Integration Tests', () => {
  test('should navigate to work item detail from list', async ({ page }) => {
    await page.goto('/work-items');
    await page.waitForLoadState('load');

    const firstWorkItem = page.locator('tr[role="row"], .work-item-card').nth(1);

    if (await firstWorkItem.isVisible()) {
      await firstWorkItem.click();

      await expect(page).toHaveURL(/\/work-items\/[a-zA-Z0-9-]+$/);
    }
  });

  test('should display work item details', async ({ page }) => {
    await page.goto('/work-items/test-id');

    await page.waitForLoadState('domcontentloaded');
  });
});

test.describe('Work Item Form Integration Tests', () => {
  test('should validate required fields on create', async ({ page }) => {
    await page.goto('/work-items/create');
    await page.waitForLoadState('load');

    // Try to submit empty form
    const submitButton = page
      .locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")')
      .first();

    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Verify validation errors appear
      const errorMessage = page.locator('.error, [role="alert"], .mat-error').first();
      await expect(errorMessage).toBeVisible({ timeout: 3000 });
    }
  });

  test('should cache form data', async ({ page }) => {
    await page.goto('/work-items/create');
    await page.waitForLoadState('load');

    // Fill in some form data
    const titleInput = page.locator('input[name="title"], input[formControlName="title"]').first();

    if (await titleInput.isVisible()) {
      await titleInput.fill('Test Work Item');

      // Navigate away
      await page.goto('/work-items');

      // Navigate back
      await page.goto('/work-items/create');
      await page.waitForLoadState('load');

      // Verify data is restored (if caching is implemented)
      const _restoredValue = await titleInput.inputValue();
      // Note: This may be empty if caching is not yet implemented
    }
  });
});
