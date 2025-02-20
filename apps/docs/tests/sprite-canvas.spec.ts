import { test, expect } from '@playwright/test';

test('has sprite', async ({ page }) => {
  await page.goto('/examples/2d/sprite-canvas');

  await expect(page).toHaveScreenshot({ fullPage: true });
});
