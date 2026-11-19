import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const lesson = (page, n) => page.locator(`details.lesson[data-n="${n}"]`);

test('各時間に自分のメモを書くと端末に残り、行に「メモ」の印が出る', async ({ page }) => {
  await page.goto('./#/rika/6/01/3');
  const box = lesson(page, 3).getByLabel('第3時のメモ');
  await box.fill('集気びんは班に2本。ふたはガラス板で。');
  await expect(lesson(page, 3).locator('.memo-status')).toHaveText('保存しました');
  await expect(lesson(page, 3).locator('summary .col-memo')).toBeVisible();
  await expect(lesson(page, 4).locator('summary .col-memo')).toHaveCount(0);
  await page.reload();
  await expect(lesson(page, 3).getByLabel('第3時のメモ')).toHaveValue('集気びんは班に2本。ふたはガラス板で。');
});

test('単元全体のメモを書ける', async ({ page }) => {
  await page.goto('./#/rika/6/01');
  await page.getByLabel('単元全体のメモ').fill('去年は線香の煙が見えにくかった。黒い紙を後ろに。');
  await page.reload();
  await expect(page.getByLabel('単元全体のメモ')).toHaveValue('去年は線香の煙が見えにくかった。黒い紙を後ろに。');
});

test('計画表を印刷すると、メモも一緒に出る', async ({ page }) => {
  await page.goto('./#/rika/6/01/2');
  await lesson(page, 2).getByLabel('第2時のメモ').fill('びんの数を数えておく');
  await page.getByLabel('単元全体のメモ').fill('単元のふりかえり');
  await expect(lesson(page, 2).locator('.memo-status')).toHaveText('保存しました');
  await page.emulateMedia({ media: 'print' });
  const plan = page.locator('.print-plan');
  await expect(plan.locator('th', { hasText: 'メモ' })).toBeVisible();
  await expect(plan.locator('tbody tr').nth(1)).toContainText('びんの数を数えておく');
  await expect(plan).toContainText('単元のふりかえり');
});

test('メモがないときは、印刷の計画表にメモの列を出さない', async ({ page }) => {
  await page.goto('./#/rika/6/01');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.print-plan th', { hasText: 'メモ' })).toHaveCount(0);
});

test('設定画面からメモを書き出し、別の端末で読み込める', async ({ page, browser }) => {
  await page.goto('./#/rika/6/01/1');
  await lesson(page, 1).getByLabel('第1時のメモ').fill('端末Aで書いたメモ');
  await expect(lesson(page, 1).locator('.memo-status')).toHaveText('保存しました');
  await page.goto('./#/settings');
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'メモを書き出す' }).click()]);
  expect(download.suggestedFilename()).toMatch(/^\d{8}-教材研究メモ\.json$/);
  const file = 'test-results/memo-roundtrip.json';
  fs.mkdirSync('test-results', { recursive: true });
  await download.saveAs(file);

  const other = await browser.newContext();
  const p2 = await other.newPage();
  await p2.goto('./#/settings');
  await p2.locator('#memo-import').setInputFiles(file);
  await expect(p2.locator('.memo-import-status')).toContainText('1単元のメモを読み込みました');
  await p2.goto('./#/rika/6/01/1');
  await expect(p2.locator('details.lesson[data-n="1"]').getByLabel('第1時のメモ')).toHaveValue('端末Aで書いたメモ');
  await other.close();
});
