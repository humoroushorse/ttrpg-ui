import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Sprint Management Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sprint-management');
  });

  test('should not have any automatically detectable accessibility issues on work items list page', async ({
    page,
  }) => {
    await page.waitForLoadState('load');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have any automatically detectable accessibility issues on sprints list page', async ({ page }) => {
    await page.goto('/sprint-management/sprints');
    await page.waitForLoadState('load');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.waitForLoadState('load');

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const headingViolations = accessibilityScanResults.violations.filter((v) => v.id === 'heading-order');

    expect(headingViolations).toEqual([]);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.waitForLoadState('load');

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast' || v.id === 'color-contrast-enhanced',
    );

    expect(contrastViolations).toEqual([]);
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/sprint-management/work-items/create');
    await page.waitForLoadState('load');

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const labelViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'label' || v.id === 'label-title-only',
    );

    expect(labelViolations).toEqual([]);
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.waitForLoadState('load');

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const ariaViolations = accessibilityScanResults.violations.filter((v) => v.id.startsWith('aria-'));

    expect(ariaViolations).toEqual([]);
  });

  test('should have proper image alt text', async ({ page }) => {
    await page.waitForLoadState('load');

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const imageViolations = accessibilityScanResults.violations.filter((v) => v.id === 'image-alt');

    expect(imageViolations).toEqual([]);
  });

  test('should have proper link text', async ({ page }) => {
    await page.waitForLoadState('load');

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const linkViolations = accessibilityScanResults.violations.filter((v) => v.id === 'link-name');

    expect(linkViolations).toEqual([]);
  });

  test('should have proper button text', async ({ page }) => {
    await page.waitForLoadState('load');

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const buttonViolations = accessibilityScanResults.violations.filter((v) => v.id === 'button-name');

    expect(buttonViolations).toEqual([]);
  });

  test('should have proper landmark regions', async ({ page }) => {
    await page.waitForLoadState('load');

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const landmarkViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'region' || v.id === 'landmark-one-main',
    );

    expect(landmarkViolations).toEqual([]);
  });

  test('should have proper table structure', async ({ page }) => {
    await page.waitForLoadState('load');

    await page.waitForTimeout(1000);

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const tableViolations = accessibilityScanResults.violations.filter(
      (v) => v.id.includes('table') || v.id.includes('th'),
    );

    expect(tableViolations).toEqual([]);
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.waitForLoadState('load');

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const focusViolations = accessibilityScanResults.violations.filter((v) => v.id === 'focus-order-semantics');

    expect(focusViolations).toEqual([]);
  });

  test('should not have any duplicate IDs', async ({ page }) => {
    await page.waitForLoadState('load');

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const idViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'duplicate-id' || v.id === 'duplicate-id-active',
    );

    expect(idViolations).toEqual([]);
  });

  test('should have proper page title', async ({ page }) => {
    await page.waitForLoadState('load');

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const titleViolations = accessibilityScanResults.violations.filter((v) => v.id === 'document-title');

    expect(titleViolations).toEqual([]);
  });

  test('should have proper language attribute', async ({ page }) => {
    await page.waitForLoadState('load');

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const langViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'html-has-lang' || v.id === 'html-lang-valid',
    );

    expect(langViolations).toEqual([]);
  });

  test('should have proper skip links for screen readers', async ({ page }) => {
    await page.waitForLoadState('load');

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const bypassViolations = accessibilityScanResults.violations.filter((v) => v.id === 'bypass');

    expect(bypassViolations).toEqual([]);
  });
});
