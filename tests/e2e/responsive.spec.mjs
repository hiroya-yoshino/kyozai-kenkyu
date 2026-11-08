import { test, expect } from '@playwright/test';

const noHorizontalScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

test('スマホ幅：長い単元名・長い手順でも横スクロールが出ない', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('./?fixtures=1#/rika/6/97');
  await page.locator('details.lesson[data-n="2"] summary').click();
  expect(await noHorizontalScroll(page)).toBe(true);
});

test('スマホ幅：単元ページは1列（一覧は横に出ない）', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('./?fixtures=1#/rika/6/99');
  await expect(page.locator('aside#side')).toBeHidden();
  expect(await noHorizontalScroll(page)).toBe(true);
});

test('スマホ幅：一覧も横スクロールなし', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('./#/rika/6');
  expect(await noHorizontalScroll(page)).toBe(true);
});

test('iPad幅：単元ページは左に一覧、右に単元ページ', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('./?fixtures=1#/rika/6/99');
  const side = page.locator('aside#side');
  await expect(side).toBeVisible();
  await expect(side.locator('.unit-row', { hasText: 'ものが燃えるしくみ' })).toBeVisible();
  const s = await side.boundingBox();
  const m = await page.locator('main#app').boundingBox();
  expect(s.x + s.width).toBeLessThanOrEqual(m.x + 1);
});

test('押せる部分は高さ44px以上', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('./?fixtures=1#/rika/6/99');
  for (const sel of ['button#open-goals', 'details.lesson summary']) {
    const box = await page.locator(sel).first().boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});
