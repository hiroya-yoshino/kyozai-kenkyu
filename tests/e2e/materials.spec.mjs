import { test, expect } from '@playwright/test';

const UNIT = './?fixtures=1#/rika/6/96';
const MAT = './?fixtures=1#/rika/6/96/junbi';

test('単元ページの「準備物」から準備物の画面が開き、時間ごとに並ぶ', async ({ page }) => {
  await page.goto(UNIT);
  await page.getByRole('link', { name: '準備物' }).click();
  await expect(page).toHaveURL(/#\/rika\/6\/96\/junbi$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('準備物');
  const g1 = page.locator('.mat-group[data-n="1"]');
  const g2 = page.locator('.mat-group[data-n="2"]');
  await expect(g1).toContainText('第1時');
  await expect(g1.locator('label')).toHaveText(['集気びん', 'マッチ']);
  await expect(g2.locator('label')).toHaveText(['集気びん', 'ろうそく']);
});

test('「単元全体でまとめる」にすると、同じ物は1つにまとまり、使う時間がわかる', async ({ page }) => {
  await page.goto(MAT);
  await page.getByRole('radio', { name: '単元全体でまとめる' }).check();
  const items = page.locator('.mat-all li');
  await expect(items).toHaveCount(3);
  const jar = items.filter({ hasText: '集気びん' });
  await expect(jar).toHaveCount(1);
  await expect(jar.locator('.mat-when')).toHaveText('第1・2時');
});

test('つけた印は端末に保存され、「印をすべて外す」で消える', async ({ page }) => {
  await page.goto(MAT);
  await page.locator('.mat-group[data-n="1"]').getByLabel('マッチ').check();
  await page.reload();
  await expect(page.locator('.mat-group[data-n="1"]').getByLabel('マッチ')).toBeChecked();
  await page.getByRole('button', { name: '印をすべて外す' }).click();
  await expect(page.locator('.mat-group[data-n="1"]').getByLabel('マッチ')).not.toBeChecked();
  await page.reload();
  await expect(page.locator('.mat-group[data-n="1"]').getByLabel('マッチ')).not.toBeChecked();
});

test('準備物を印刷するときは、ボタン類やヘッダーを出さない', async ({ page }) => {
  await page.goto(MAT);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.mat-toolbar')).toBeHidden();
  await expect(page.locator('.mat-group[data-n="1"]')).toBeVisible();
});

test('「計画表を印刷」で印刷が始まり、印刷では計画表（めあて・まとめ・評価の記号）と目標だけが出る', async ({ page }) => {
  await page.goto('./?fixtures=1#/rika/6/99');
  await page.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });
  await expect(page.locator('.print-plan')).toBeHidden();
  await page.getByRole('button', { name: '計画表を印刷' }).click();
  expect(await page.evaluate(() => window.__printed)).toBe(1);
  await page.emulateMedia({ media: 'print' });
  const pp = page.locator('.print-plan');
  await expect(pp).toBeVisible();
  for (const t of ['知識の目標文', '第1時のめあて', '第1時のまとめ', '思①', '第1次　テストの次']) await expect(pp).toContainText(t);
  await expect(page.locator('section.plan')).toBeHidden();
  await expect(page.locator('section.intro')).toBeHidden();
});
