import { test, expect } from '@playwright/test';

test('番号のない時間（花のつくりなど）も、中身があれば押して開ける', async ({ page }) => {
  await page.goto('./#/rika/5');
  const row = page.locator('main .event-row', { hasText: '花のつくり' });
  await expect(row.locator('a')).toHaveCount(1);
  await row.locator('a').click();
  await expect(page).toHaveURL(/#\/rika\/5\/12$/);
  await expect(page.locator('h1')).toContainText('花のつくり');
  await expect(page.locator('details.lesson')).toHaveCount(2);
  for (const t of ['理科のガイダンス', '台風と気象情報', '自由研究', 'これまでの学習をつなげよう', 'みんなで使う理科室']) {
    await expect(page.locator('#side .event-row', { hasText: t }).locator('a')).toHaveCount(1);
  }
});

test('番号のない時間の時数は、年間指導計画どおり', async ({ page }) => {
  for (const [id, n] of [['11', 1], ['12', 2], ['13', 3], ['14', 2], ['15', 1], ['16', 1]]) {
    await page.goto(`./#/rika/5/${id}`);
    await expect(page.locator('details.lesson')).toHaveCount(n);
  }
});

test('中身のない番号のない時間（6年）は、今までどおり押せない', async ({ page }) => {
  await page.goto('./#/rika/6');
  const rows = page.locator('main .event-row');
  await expect(rows.first()).toBeVisible();
  await expect(rows.locator('a')).toHaveCount(0);
});

test('検索で、番号のない時間の中身も見つかる', async ({ page }) => {
  await page.goto('./#/rika/5');
  await page.getByLabel('単元の中を検索').fill('あぶらな');
  const first = page.locator('.search-results li').first();
  await expect(first).toContainText('花のつくり');
  await expect(first).not.toContainText('単元undefined');
});

test('次の授業に、番号のない時間も出る', async ({ page }) => {
  await page.goto('./#/rika/5/11');
  await page.locator('details.lesson[data-n="1"] .done-toggle').click();
  await page.goto('./#/');
  const next = page.locator('.next-lesson a');
  await expect(next).toContainText('花のつくり');
  await expect(next).toContainText('第1時');
  await expect(next).not.toContainText('単元');
  await page.goto('./#/rika/5/12');
  await page.locator('details.lesson[data-n="2"] .done-toggle').click();
  await page.goto('./#/');
  await expect(next).toContainText('単元1');
  await expect(next).toContainText('雲と天気の変化');
});

test('実験のない時間（台風と気象情報）には、準備物のボタンを出さない', async ({ page }) => {
  await page.goto('./#/rika/5/13');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByRole('link', { name: '準備物' })).toHaveCount(0);
  await page.goto('./#/rika/5/12');
  await expect(page.getByRole('link', { name: '準備物' })).toBeVisible();
});
