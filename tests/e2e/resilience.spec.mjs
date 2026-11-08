import { test, expect } from '@playwright/test';

test('単元の読み込み中に一覧へ戻っても、遅れて届いた単元で上書きされない', async ({ page }) => {
  await page.route('**/tests/fixtures/rika/6/99.json', async (route) => {
    await new Promise((r) => setTimeout(r, 1500));
    await route.continue();
  });
  await page.goto('./?fixtures=1#/rika/6');
  await expect(page.locator('main .unit-row').first()).toBeVisible();
  await page.evaluate(() => { location.hash = '#/rika/6/99'; });
  await page.waitForTimeout(100);
  await page.evaluate(() => { location.hash = '#/rika/6'; });
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL(/#\/rika\/6$/);
  await expect(page.locator('main .unit-row').first()).toBeVisible();
  await expect(page.locator('main h1')).toHaveText(/単元一覧/);
});

test('一覧データが読めないときは案内と再読み込みボタンを出し、押すと復帰する', async ({ page }) => {
  let fail = true;
  await page.route('**/data/index.json', (route) => (fail ? route.abort() : route.continue()));
  await page.goto('./');
  await expect(page.locator('main')).toContainText('データを読み込めませんでした');
  fail = false;
  await page.getByRole('button', { name: '再読み込み' }).click();
  await expect(page.getByRole('link', { name: /理科/ })).toBeVisible();
});
