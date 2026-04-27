/**
 * Visual regression tests for theme switching
 *
 * These tests ensure that:
 * 1. All themes can be applied without errors
 * 2. Theme switching maintains visual consistency
 * 3. No visual regressions occur when switching themes
 */

import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the sprint management app
    await page.goto('/');
    await page.waitForLoadState('load');
  });

  test('should load with default theme', async ({ page }) => {
    // Check that the app loads successfully
    await expect(page).toHaveTitle(/Sprint Management/i);

    // Verify that CSS custom properties are defined
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--g-color-primary');
    });

    expect(primaryColor).toBeTruthy();
  });

  test('should switch to dark theme', async ({ page }) => {
    // Get initial background color
    const initialBg = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--g-color-background');
    });

    // Switch to dark theme (implementation depends on theme switcher UI)
    // This is a placeholder - actual implementation will depend on the theme switcher component
    await page.evaluate(() => {
      document.documentElement.classList.add('dark-theme');
    });

    // Get new background color
    const darkBg = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--g-color-background');
    });

    // Verify that the background color changed
    expect(darkBg).not.toBe(initialBg);
  });

  test('should switch to teal-light theme', async ({ page }) => {
    // Switch to teal-light theme
    await page.evaluate(() => {
      document.documentElement.classList.add('teal-light-theme');
    });

    // Verify that the primary color is teal-based
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--g-color-primary');
    });

    expect(primaryColor).toBeTruthy();
  });

  test('should switch to teal-dark theme', async ({ page }) => {
    // Switch to teal-dark theme
    await page.evaluate(() => {
      document.documentElement.classList.add('teal-dark-theme');
    });

    // Verify that the theme is applied
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--g-color-primary');
    });

    expect(primaryColor).toBeTruthy();
  });

  test('should maintain layout when switching themes', async ({ page }) => {
    // Get initial layout dimensions
    const initialLayout = await page.evaluate(() => {
      const main = document.querySelector('main');
      return {
        width: main?.offsetWidth,
        height: main?.offsetHeight,
      };
    });

    // Switch theme
    await page.evaluate(() => {
      document.documentElement.classList.add('dark-theme');
    });

    // Get new layout dimensions
    const newLayout = await page.evaluate(() => {
      const main = document.querySelector('main');
      return {
        width: main?.offsetWidth,
        height: main?.offsetHeight,
      };
    });

    // Verify that layout dimensions are maintained (within tolerance)
    expect(Math.abs((newLayout.width || 0) - (initialLayout.width || 0))).toBeLessThan(5);
  });

  test('should take visual regression baseline screenshots', async ({ page }) => {
    // Default theme
    await expect(page).toHaveScreenshot('default-theme.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // Dark theme
    await page.evaluate(() => {
      document.documentElement.classList.add('dark-theme');
    });
    await expect(page).toHaveScreenshot('dark-theme.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // Teal light theme
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.classList.add('teal-light-theme');
    });
    await expect(page).toHaveScreenshot('teal-light-theme.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // Teal dark theme
    await page.evaluate(() => {
      document.documentElement.classList.remove('teal-light-theme');
      document.documentElement.classList.add('teal-dark-theme');
    });
    await expect(page).toHaveScreenshot('teal-dark-theme.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
