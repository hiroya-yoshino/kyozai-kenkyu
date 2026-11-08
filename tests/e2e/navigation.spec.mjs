import { test, expect } from '@playwright/test';

test('ホームに3教科があり、算数・国語は準備中で押せない', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('link', { name: /理科/ })).toBeVisible();
  for (const name of ['算数', '国語']) {
    const card = page.locator('.subject-card', { hasText: name });
    await expect(card).toContainText('準備中');
    await expect(card.locator('a')).toHaveCount(0);
  }
});

test('理科を押すと6年の単元一覧が学期ごとに出る', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: /理科/ }).click();
  await expect(page).toHaveURL(/#\/rika\/6$/);
  const row = page.locator('.unit-row', { hasText: 'ものが燃えるしくみ' });
  await expect(row).toContainText('8時間');
  await expect(row).toContainText('4月');
  for (const t of ['1学期', '2学期', '3学期']) await expect(page.getByRole('heading', { name: t })).toBeVisible();
  await expect(page.locator('.event-row', { hasText: '自由研究' })).toBeVisible();
});

test('5年タブは準備中', async ({ page }) => {
  await page.goto('./#/rika/6');
  await page.getByRole('tab', { name: '5年' }).click();
  await expect(page).toHaveURL(/#\/rika\/5$/);
  await expect(page.locator('main')).toContainText('準備中');
});

test('準備中の学年の単元を直接開くと準備中表示と一覧へ戻るボタン', async ({ page }) => {
  await page.goto('./#/rika/5/01');
  await expect(page.locator('main')).toContainText('この単元はまだ準備中です');
  await page.getByRole('link', { name: '単元一覧へ戻る' }).click();
  await expect(page).toHaveURL(/#\/rika\/5$/);
});

test('存在しない単元も準備中表示', async ({ page }) => {
  await page.goto('./#/rika/6/99');
  await expect(page.locator('main')).toContainText('この単元はまだ準備中です');
});

test('壊れたURLはホーム', async ({ page }) => {
  await page.goto('./#/xyz');
  await expect(page.getByRole('link', { name: /理科/ })).toBeVisible();
});
