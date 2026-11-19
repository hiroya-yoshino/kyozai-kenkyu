import { test, expect } from '@playwright/test';

const toggle = (page, n) => page.locator(`details.lesson[data-n="${n}"] .done-toggle`);

test('「終わった」の印は行を開かずにつけ外しでき、端末に保存される', async ({ page }) => {
  await page.goto('./#/rika/6/01');
  await toggle(page, 3).click();
  await expect(toggle(page, 3)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('details.lesson[data-n="3"]')).not.toHaveAttribute('open', '');
  await page.reload();
  await expect(toggle(page, 3)).toHaveAttribute('aria-pressed', 'true');
  await toggle(page, 3).click();
  await expect(toggle(page, 3)).toHaveAttribute('aria-pressed', 'false');
});

test('ホームに「次の授業」が出て、押すとその時間が開いた単元ページになる', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('.next-lesson')).toContainText('終わった時間に印をつけると');
  await page.goto('./#/rika/6/01');
  await toggle(page, 8).click();
  await page.goto('./#/');
  const next = page.locator('.next-lesson a');
  await expect(next).toContainText('ヒトや動物の体');
  await expect(next).toContainText('第1時');
  await next.click();
  await expect(page).toHaveURL(/#\/rika\/6\/02\/1$/);
  await expect(page.locator('details.lesson[data-n="1"]')).toHaveAttribute('open', '');
  await expect(page.locator('details.lesson[data-n="1"]')).toBeInViewport();
});

test('単元一覧に、単元ごとの進み具合が出る', async ({ page }) => {
  await page.goto('./#/rika/6/01');
  await toggle(page, 1).click();
  await toggle(page, 2).click();
  await page.goto('./#/rika/6');
  await expect(page.locator('main .unit-row', { hasText: 'ものが燃えるしくみ' }).locator('.progress')).toHaveText('2/8');
  await expect(page.locator('main .unit-row', { hasText: 'ヒトや動物の体' }).locator('.progress')).toHaveCount(0);
});
