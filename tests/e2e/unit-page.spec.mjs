import { test, expect } from '@playwright/test';

const URL99 = './?fixtures=1#/rika/6/99';

test('見出しに単元名・時数・月', async ({ page }) => {
  await page.goto(URL99);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('テスト単元');
  await expect(page.locator('.unit-meta')).toContainText('2時間');
  await expect(page.locator('.unit-meta')).toContainText('4月');
});

test('導入のアイデアに問いと提示の仕方', async ({ page }) => {
  await page.goto(URL99);
  const intro = page.locator('section.intro');
  await expect(intro.getByRole('heading', { name: '導入のアイデア' })).toBeVisible();
  await expect(intro).toContainText('導入の問い文');
  await expect(intro).toContainText('提示の仕方の文');
});

test('毎時間は閉じて並び、押すとめあて・活動・まとめが見える', async ({ page }) => {
  await page.goto(URL99);
  const l1 = page.locator('details.lesson[data-n="1"]');
  await expect(page.locator('details.lesson')).toHaveCount(2);
  await expect(l1).not.toHaveAttribute('open', '');
  await l1.locator('summary').click();
  for (const t of ['めあて', '第1時のめあて', '活動A', '活動B', 'まとめ', '第1時のまとめ']) await expect(l1).toContainText(t);
});

test('実験は第2時だけにあり、準備物・手順・安全・図がそろう', async ({ page }) => {
  await page.goto(URL99);
  await expect(page.locator('details.lesson[data-n="1"] section.experiment')).toHaveCount(0);
  const l2 = page.locator('details.lesson[data-n="2"]');
  await l2.locator('summary').click();
  const ex = l2.locator('section.experiment');
  for (const t of ['準備物', '集気びん', '手順', '手順1', '安全上の注意', '火の近くに燃えやすいものを置かない']) await expect(ex).toContainText(t);
  const img = ex.locator('figure img');
  await expect(img).toHaveAttribute('alt', 'テスト図の説明');
  await expect.poll(() => img.evaluate((i) => i.naturalWidth)).toBeGreaterThan(0);
});

test('図が読めないときは説明文だけを出す', async ({ page }) => {
  await page.goto('./?fixtures=1#/rika/6/98');
  const l2 = page.locator('details.lesson[data-n="2"]');
  await l2.locator('summary').click();
  await expect(l2.locator('figure img')).toHaveCount(0);
  await expect(l2.locator('figure figcaption')).toHaveText('テスト図の説明');
});

test('目次の第2時を押すと第2時が開く', async ({ page }) => {
  await page.goto(URL99);
  await page.locator('nav.toc').getByRole('link', { name: '第2時' }).click();
  await expect(page.locator('details.lesson[data-n="2"]')).toHaveAttribute('open', '');
  await expect(page.locator('details.lesson[data-n="2"]')).toBeInViewport();
});

test('目標ボタンがある', async ({ page }) => {
  await page.goto(URL99);
  await expect(page.locator('button#open-goals')).toBeVisible();
});

test('図を押すとページはそのままでポップアップに大きく表示され、×で戻る', async ({ page }) => {
  await page.goto(URL99);
  await page.locator('details.lesson[data-n="2"] summary').click();
  const before = page.url();
  const pages = page.context().pages().length;
  await page.locator('details.lesson[data-n="2"] figure button.figure-open').click();
  const dlg = page.locator('dialog#figure');
  await expect(dlg).toBeVisible();
  await expect(dlg.locator('img')).toHaveAttribute('src', 'tests/fixtures/figure.svg');
  await expect(dlg).toContainText('テスト図の説明');
  expect(page.url()).toBe(before);
  expect(page.context().pages().length).toBe(pages);
  await dlg.getByRole('button', { name: '閉じる' }).click();
  await expect(dlg).toBeHidden();
  await expect(page.locator('details.lesson[data-n="2"]')).toHaveAttribute('open', '');
});

test('図のポップアップは外側・Escでも閉じる', async ({ page }) => {
  await page.goto(URL99);
  await page.locator('details.lesson[data-n="2"] summary').click();
  const open = () => page.locator('details.lesson[data-n="2"] figure button.figure-open').click();
  const dlg = page.locator('dialog#figure');
  await open(); await page.keyboard.press('Escape'); await expect(dlg).toBeHidden();
  await open(); await page.mouse.click(3, 3); await expect(dlg).toBeHidden();
});
