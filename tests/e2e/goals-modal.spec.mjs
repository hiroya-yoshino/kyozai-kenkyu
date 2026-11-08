import { test, expect } from '@playwright/test';

const URL99 = './?fixtures=1#/rika/6/99';
const dialog = (page) => page.locator('dialog#goals');

async function open(page) {
  await page.locator('button#open-goals').click();
  await expect(dialog(page)).toBeVisible();
}

test('目標ボタンで3観点が表示され、URLは変わらない', async ({ page }) => {
  await page.goto(URL99);
  const before = page.url();
  await open(page);
  for (const t of ['知識・技能', '思考・判断・表現', '主体的に学習に取り組む態度', '知識の目標文', '思考の目標文', '態度の目標文']) {
    await expect(dialog(page)).toContainText(t);
  }
  expect(page.url()).toBe(before);
});

test('×ボタンで閉じる', async ({ page }) => {
  await page.goto(URL99);
  await open(page);
  await dialog(page).getByRole('button', { name: '閉じる' }).click();
  await expect(dialog(page)).toBeHidden();
});

test('外側を押すと閉じる', async ({ page }) => {
  await page.goto(URL99);
  await open(page);
  await page.mouse.click(5, 5);
  await expect(dialog(page)).toBeHidden();
});

test('中身を押しても閉じない', async ({ page }) => {
  await page.goto(URL99);
  await open(page);
  await dialog(page).getByText('知識の目標文').click();
  await expect(dialog(page)).toBeVisible();
});

test('Escで閉じる', async ({ page }) => {
  await page.goto(URL99);
  await open(page);
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
});

test('開閉してもスクロール位置が変わらない', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 400 });
  await page.goto(URL99);
  for (const n of [1, 2]) await page.locator(`details.lesson[data-n="${n}"] summary`).click();
  await page.evaluate(() => window.scrollTo(0, 200));
  const y = await page.evaluate(() => window.scrollY);
  expect(y).toBeGreaterThan(0);
  await page.evaluate(() => document.getElementById('open-goals').click());
  await expect(dialog(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
  expect(await page.evaluate(() => window.scrollY)).toBe(y);
});

test('開いたまま戻ると閉じて一覧が出る', async ({ page }) => {
  await page.goto('./?fixtures=1#/rika/6');
  await page.goto(URL99);
  await open(page);
  await page.goBack();
  await expect(dialog(page)).toBeHidden();
  await expect(page.locator('.unit-row').first()).toBeVisible();
});
