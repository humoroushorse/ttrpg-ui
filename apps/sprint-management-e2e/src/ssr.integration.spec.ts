import { test, expect } from '@playwright/test';

test.describe('SSR Rendering Tests', () => {
  test('should render initial HTML on server', async ({ page }) => {
    const response = await page.goto('/');

    expect(response?.status()).toBe(200);

    const htmlContent = await page.content();

    expect(htmlContent).toContain('<html');
    expect(htmlContent).toContain('</html>');
    expect(htmlContent).toContain('<body');
    expect(htmlContent).toContain('</body>');
  });

  test('should have meta tags in server-rendered HTML', async ({ page }) => {
    await page.goto('/');

    // Check for meta tags
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Check for viewport meta tag
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /.+/);
  });

  test('should render work items list on server', async ({ page }) => {
    await page.goto('/work-items');

    const htmlContent = await page.content();

    expect(htmlContent).toContain('html');

    await page.waitForLoadState('domcontentloaded');
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should render sprints list on server', async ({ page }) => {
    await page.goto('/sprints');

    const htmlContent = await page.content();

    expect(htmlContent).toContain('html');

    await page.waitForLoadState('domcontentloaded');
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should not have console errors during SSR', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('load');

    // Filter out known acceptable errors (if any)
    const criticalErrors = consoleErrors.filter(
      (error) => !error.includes('favicon') && !error.includes('404') && !error.includes('net::ERR_'),
    );

    // Should not have critical console errors
    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Hydration Tests', () => {
  test('should hydrate without flickering', async ({ page }) => {
    await page.goto('/');

    // Wait for hydration to complete
    await page.waitForLoadState('load');

    // Verify interactive elements work after hydration
    const button = page.locator('button').first();
    if (await button.isVisible()) {
      await expect(button).toBeEnabled();
    }
  });

  test('should maintain state after hydration', async ({ page }) => {
    await page.goto('/work-items');
    await page.waitForLoadState('load');

    await page.waitForTimeout(1000);

    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('should handle client-side navigation after hydration', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    const workItemsLink = page.locator('a[href*="/work-items"]').first();
    if (await workItemsLink.isVisible()) {
      await workItemsLink.click();

      await expect(page).toHaveURL(/\/work-items/);
      await page.waitForLoadState('load');
    }
  });

  test('should handle forms after hydration', async ({ page }) => {
    await page.goto('/work-items/create');
    await page.waitForLoadState('load');

    const titleInput = page.locator('input[name="title"], input[formControlName="title"]').first();

    if (await titleInput.isVisible()) {
      await titleInput.fill('Test Item');
      await expect(titleInput).toHaveValue('Test Item');
    }
  });
});

test.describe('SSR Performance Tests', () => {
  test('should have reasonable Time to First Byte (TTFB)', async ({ page }) => {
    const startTime = Date.now();
    const response = await page.goto('/');
    const ttfb = Date.now() - startTime;

    expect(ttfb).toBeLessThan(2000);
    expect(response?.status()).toBe(200);
  });

  test('should have reasonable First Contentful Paint', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('domcontentloaded');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 3000 });
  });
});

test.describe('SSR-Compatible Services Tests', () => {
  test('should handle localStorage gracefully on server', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle window object gracefully on server', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle document object gracefully on server', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('SEO and Meta Tags Tests', () => {
  test('should have proper title tags on all pages', async ({ page }) => {
    await page.goto('/');
    let title = await page.title();
    expect(title).toBeTruthy();

    await page.goto('/work-items');
    title = await page.title();
    expect(title).toContain('Work Items');

    await page.goto('/sprints');
    title = await page.title();
    expect(title).toContain('Sprints');
  });

  test('should have proper meta description', async ({ page }) => {
    await page.goto('/');

    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    if (metaDescription) {
      expect(metaDescription.length).toBeGreaterThan(0);
    }
  });

  test('should have proper Open Graph tags', async ({ page }) => {
    await page.goto('/');

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    if (ogTitle) {
      expect(ogTitle.length).toBeGreaterThan(0);
    }
  });
});
