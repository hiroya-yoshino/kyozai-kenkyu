import { test, expect } from '@playwright/test';

test('単元一覧の検索欄で全単元から探し、結果を押すとその時間が開く', async ({ page }) => {
  await page.goto('./#/rika/6');
  await page.getByRole('searchbox', { name: '単元の中を検索' }).fill('石灰水');
  const results = page.locator('.search-results li');
  await expect(results.first()).toBeVisible();
  const hit = results.filter({ hasText: '水よう液の性質' }).filter({ hasText: '第4時' });
  await expect(hit).toHaveCount(1);
  await expect(hit).toContainText('準備物');
  await expect(page.locator('.term')).toHaveCount(0);
  await hit.locator('a').click();
  await expect(page).toHaveURL(/#\/rika\/6\/05\/4$/);
  await expect(page.locator('details.lesson[data-n="4"]')).toHaveAttribute('open', '');
});

test('見つからないときは案内を出し、検索欄を空にするともとの一覧にもどる', async ({ page }) => {
  await page.goto('./#/rika/6');
  const box = page.getByRole('searchbox', { name: '単元の中を検索' });
  await box.fill('ぞうきんぞうきん');
  await expect(page.locator('.search-empty')).toContainText('見つかりませんでした');
  await box.fill('');
  await expect(page.locator('.term').first()).toBeVisible();
});

test('単元ページの「評価規準を書き出す」でCSVが保存される', async ({ page }) => {
  await page.goto('./#/rika/6/01');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: '評価規準を書き出す' }).click()]);
  expect(dl.suggestedFilename()).toBe('6年理科_単元1_ものが燃えるしくみ_評価規準.csv');
  const text = (await (await dl.createReadStream()).toArray()).join('');
  expect(text).toContain('単元,単元名,時,次,記号,観点,評価方法,評価規準');
  expect(text).toContain('思①');
});

test('単元一覧の「まとめて書き出す」で6年理科の全単元が1つのCSVになる', async ({ page }) => {
  await page.goto('./#/rika/6');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: '評価規準をまとめて書き出す' }).click()]);
  expect(dl.suggestedFilename()).toBe('6年理科_評価規準.csv');
  const text = (await (await dl.createReadStream()).toArray()).join('');
  expect(text).toContain('ものが燃えるしくみ');
  expect(text).toContain('自然とともに生きる');
});

for (const [q, unit, n] of [['せっかいすい', '水よう液の性質', 4], ['セッカイスイ', '水よう液の性質', 4], ['石灰すい', '水よう液の性質', 4],
  ['ようそえき', 'ヒトや動物の体', 2], ['きたいけんちかん', 'ものが燃えるしくみ', 6], ['じょうさん', '植物のつくりとはたらき', 3]]) {
  test(`「${q}」でも見つかる（ひらがな・カタカナ・漢字まじり）`, async ({ page }) => {
    await page.goto('./#/rika/6');
    await page.getByRole('searchbox', { name: '単元の中を検索' }).fill(q);
    await expect(page.locator('.search-results li').filter({ hasText: unit }).filter({ hasText: `第${n}時` }).first()).toBeVisible();
  });
}
