import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const OK = readFileSync(new URL('../fixtures/draft-response.json', import.meta.url), 'utf8');
const API = 'https://api.anthropic.com/v1/messages';

async function setKey(page, key = 'sk-ant-test') {
  await page.goto('./#/settings');
  await page.getByLabel('APIキー').fill(key);
  await page.getByRole('button', { name: '保存する' }).click();
}

test('設定画面でAPIキーを保存・消去でき、キーは伏せ字で表示される', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: '設定' }).click();
  await expect(page).toHaveURL(/#\/settings$/);
  await expect(page.getByLabel('APIキー')).toHaveAttribute('type', 'password');
  await setKey(page);
  await page.reload();
  await expect(page.locator('.key-status')).toContainText('保存されています');
  await page.getByRole('button', { name: 'キーを消す' }).click();
  await expect(page.locator('.key-status')).toContainText('まだ入っていません');
});

test('キーがないと「AIで下書きを作る」は出ず、キーがあると準備中の学年にも出る', async ({ page }) => {
  await page.goto('./#/rika/5');
  await expect(page.getByRole('link', { name: 'AIで下書きを作る' })).toHaveCount(0);
  await setKey(page);
  await page.goto('./#/rika/5');
  await expect(page.getByRole('link', { name: 'AIで下書きを作る' })).toBeVisible();
});

test('下書きを作ると、見出しに「下書き（資料未確認）」が出て、一覧に残り、消せる', async ({ page }) => {
  let sent;
  await page.route(API, async (route) => { sent = route.request(); await route.fulfill({ status: 200, contentType: 'application/json', body: OK }); });
  await setKey(page);
  await page.goto('./#/rika/5/new');
  await page.getByLabel('単元名').fill('もののとけ方');
  await page.getByLabel('時数').fill('2');
  await page.getByLabel('実施月').fill('1月');
  await page.getByRole('button', { name: '下書きを作る' }).click();
  await expect(page.locator('.draft-banner')).toContainText('下書き（資料未確認）');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('もののとけ方');
  await expect(page.locator('details.lesson')).toHaveCount(2);
  await expect(page.locator('.draft-cost')).toContainText('円');
  expect(sent.headers()['x-api-key']).toBe('sk-ant-test');
  expect(sent.headers()['anthropic-dangerous-direct-browser-access']).toBe('true');
  expect(JSON.parse(sent.postData()).messages[0].content).toContain('もののとけ方');

  await page.goto('./#/rika/5');
  const row = page.locator('.drafts .unit-row', { hasText: 'もののとけ方' });
  await expect(row).toContainText('下書き');
  await row.locator('a').click();
  await expect(page.locator('.draft-banner')).toBeVisible();
  await page.getByRole('button', { name: '下書きを消す' }).click();
  await page.goto('./#/rika/5');
  await expect(page.locator('.drafts .unit-row')).toHaveCount(0);
});

test('キーがまちがっているときは、そのことを知らせる', async ({ page }) => {
  await page.route(API, (route) => route.fulfill({ status: 401, contentType: 'application/json', body: '{"type":"error","error":{"type":"authentication_error"}}' }));
  await setKey(page, 'sk-wrong');
  await page.goto('./#/rika/5/new');
  await page.getByLabel('単元名').fill('もののとけ方');
  await page.getByLabel('時数').fill('2');
  await page.getByRole('button', { name: '下書きを作る' }).click();
  await expect(page.locator('.draft-error')).toContainText('APIキーが正しくありません');
});

test('時数と毎時間の数が合わない回答は保存せず、作り直しをすすめる', async ({ page }) => {
  const bad = JSON.parse(OK); const d = JSON.parse(bad.content[0].text); d.lessons.pop(); bad.content[0].text = JSON.stringify(d);
  await page.route(API, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(bad) }));
  await setKey(page);
  await page.goto('./#/rika/5/new');
  await page.getByLabel('単元名').fill('もののとけ方');
  await page.getByLabel('時数').fill('2');
  await page.getByRole('button', { name: '下書きを作る' }).click();
  await expect(page.locator('.draft-error')).toContainText('もう一度');
  await page.goto('./#/rika/5');
  await expect(page.locator('.drafts .unit-row')).toHaveCount(0);
});

test('別の端末で保存した下書きのファイルを読み込むと、この端末の一覧に入る（キーがなくても読み込める）', async ({ browser }) => {
  // 端末A：下書きを作ってファイルに保存する
  const a = await browser.newContext({ acceptDownloads: true });
  const pa = await a.newPage();
  await pa.route(API, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: OK }));
  await setKey(pa);
  await pa.goto('./#/rika/5/new');
  await pa.getByLabel('単元名').fill('もののとけ方');
  await pa.getByLabel('時数').fill('2');
  await pa.getByRole('button', { name: '下書きを作る' }).click();
  await expect(pa.locator('.draft-banner')).toBeVisible();
  const [dl] = await Promise.all([pa.waitForEvent('download'), pa.getByRole('button', { name: '下書きのファイルを保存' }).click()]);
  const file = { name: dl.suggestedFilename(), mimeType: 'application/json', buffer: Buffer.from((await (await dl.createReadStream()).toArray()).join('')) };
  await a.close();

  // 端末B：キーなしで読み込む
  const b = await browser.newContext();
  const pb = await b.newPage();
  await pb.goto('./#/rika/5');
  await pb.getByLabel('下書きのファイルを読み込む').setInputFiles(file);
  await expect(pb.locator('.draft-banner')).toContainText('ファイルから読み込んだ下書き');
  await expect(pb.getByRole('heading', { level: 1 })).toHaveText('もののとけ方');
  await expect(pb.locator('details.lesson')).toHaveCount(2);
  await pb.goto('./#/rika/5');
  await expect(pb.locator('.drafts .unit-row', { hasText: 'もののとけ方' })).toHaveCount(1);
  await b.close();
});

test('下書きでないファイルは読み込まず、そのことを知らせる', async ({ page }) => {
  await page.goto('./#/rika/5');
  await page.getByLabel('下書きのファイルを読み込む').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":1}') });
  await expect(page.locator('.import-error')).toContainText('読み込めませんでした');
  await expect(page.locator('.drafts .unit-row')).toHaveCount(0);
});
