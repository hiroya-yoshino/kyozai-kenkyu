import { test, expect } from '@playwright/test';

test('データは毎回サーバーに最新か確かめて読む（古いキャッシュを使わない）', async ({ page }) => {
  const seen = [];
  page.on('request', async (r) => { if (r.url().endsWith('.json')) seen.push([r.url(), (await r.allHeaders())['cache-control']]); });
  await page.goto('./?fixtures=1#/rika/6/99');
  await expect(page.locator('details.lesson').first()).toBeVisible();
  await page.waitForTimeout(200);
  expect(seen.length).toBeGreaterThanOrEqual(2);
  for (const [, cc] of seen) expect(cc).toMatch(/no-cache|max-age=0/);
});
