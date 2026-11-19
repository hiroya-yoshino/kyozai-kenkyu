import { test, expect } from '@playwright/test';

// Google のログイン部品（GIS）とドライブを、テスト用の代わりにする
async function fakeGoogle(context, drive) {
  await context.route('https://accounts.google.com/gsi/client', (route) => route.fulfill({ contentType: 'text/javascript', body: `
    window.google = { accounts: { oauth2: {
      initTokenClient: (cfg) => ({ requestAccessToken: () => setTimeout(() => cfg.callback({ access_token: 'tok', expires_in: 3599 }), 10) }),
      revoke: (t, cb) => cb && cb(),
    } } };` }));
  await context.route('https://www.googleapis.com/**', async (route) => {
    const req = route.request();
    const u = new URL(req.url());
    if (req.headers().authorization !== 'Bearer tok') return route.fulfill({ status: 401, body: '' });
    if (u.pathname === '/drive/v3/files') return route.fulfill({ json: { files: drive.content ? [{ id: 'f1' }] : [] } });
    if (u.pathname === '/drive/v3/files/f1') return route.fulfill({ body: drive.content });
    if (u.pathname === '/upload/drive/v3/files' && req.method() === 'POST') {
      drive.content = req.postData().split('\r\n\r\n')[2].split('\r\n--')[0];
      return route.fulfill({ json: { id: 'f1' } });
    }
    if (u.pathname === '/upload/drive/v3/files/f1' && req.method() === 'PATCH') {
      drive.content = req.postData();
      return route.fulfill({ json: { id: 'f1' } });
    }
    return route.fulfill({ status: 404, body: '' });
  });
}
const memosOf = (drive) => JSON.parse(drive.content).memos;

test('Googleにつなぐと、ある端末で書いたメモが別の端末にも出る', async ({ browser }) => {
  const drive = { content: null };
  const a = await browser.newContext();
  await fakeGoogle(a, drive);
  const pa = await a.newPage();
  await pa.goto('./#/rika/6/01/2');
  await pa.locator('details.lesson[data-n="2"]').getByLabel('第2時のメモ', { exact: true }).fill('iPadで書いたメモ');
  await pa.goto('./#/settings');
  await pa.getByRole('button', { name: 'Googleにつなぐ' }).click();
  await expect(pa.locator('.drive-status')).toContainText('Googleドライブに保存されています');
  await expect(pa.locator('#sync-chip')).toHaveText('ドライブに保存済み');
  expect(memosOf(drive)['rika/6/01'].lessons[2].t).toBe('iPadで書いたメモ');

  // 書き足すと、少しあとに自動でドライブへ
  await pa.goto('./#/rika/6/01/3');
  await pa.locator('details.lesson[data-n="3"]').getByLabel('第3時のメモ', { exact: true }).fill('続けて書いた');
  await expect.poll(() => memosOf(drive)['rika/6/01'].lessons[3]?.t, { timeout: 8000 }).toBe('続けて書いた');

  const b = await browser.newContext();
  await fakeGoogle(b, drive);
  const pb = await b.newPage();
  await pb.goto('./#/settings');
  await pb.getByRole('button', { name: 'Googleにつなぐ' }).click();
  await expect(pb.locator('.drive-status')).toContainText('Googleドライブに保存されています');
  await pb.goto('./#/rika/6/01/2');
  await expect(pb.locator('details.lesson[data-n="2"]').getByLabel('第2時のメモ', { exact: true })).toHaveValue('iPadで書いたメモ');
  await a.close();
  await b.close();
});

test('メモの一覧で直したり消したりでき、消したこともドライブに伝わる', async ({ browser }) => {
  const drive = { content: null };
  const ctx = await browser.newContext();
  await fakeGoogle(ctx, drive);
  const p = await ctx.newPage();
  await p.goto('./#/rika/6/01/1');
  await p.locator('details.lesson[data-n="1"]').getByLabel('第1時のメモ', { exact: true }).fill('一つめ');
  await p.getByLabel('単元全体のメモ', { exact: true }).fill('単元のメモ');
  await p.goto('./#/settings');
  await p.getByRole('button', { name: 'Googleにつなぐ' }).click();
  await expect(p.locator('.drive-status')).toContainText('Googleドライブに保存されています');

  await p.getByRole('link', { name: 'メモ', exact: true }).click();
  await expect(p.locator('h1')).toHaveText('メモの一覧');
  await expect(p.locator('.memos-page')).toContainText('個人情報は書かないでください');
  const unit = p.locator('.memo-unit', { hasText: 'ものが燃えるしくみ' });
  await expect(unit.getByLabel('第1時のメモ', { exact: true })).toHaveValue('一つめ');
  await unit.getByLabel('第1時のメモ', { exact: true }).fill('一つめ（直した）');
  await expect.poll(() => memosOf(drive)['rika/6/01'].lessons[1].t, { timeout: 8000 }).toBe('一つめ（直した）');

  const del = unit.getByRole('button', { name: '第1時のメモを消す' });
  await del.click();
  await expect(del).toHaveText('もう一度押すと消えます');
  await del.click();
  await expect(unit.getByLabel('第1時のメモ', { exact: true })).toHaveValue('');
  await expect.poll(() => memosOf(drive)['rika/6/01'].lessons[1].t, { timeout: 8000 }).toBe('');

  await unit.getByRole('button', { name: 'この単元のメモをすべて消す' }).click();
  await p.getByRole('button', { name: /もう一度押すと、この単元のメモがすべて消えます/ }).click();
  await expect(p.locator('.notice')).toContainText('まだメモはありません');
  await expect.poll(() => memosOf(drive)['rika/6/01'].unit.t, { timeout: 8000 }).toBe('');
  await ctx.close();
});

test('つなぐ期限が切れたら、ヘッダーに「ドライブにつなぎ直す」が出て、押すとつながる', async ({ browser }) => {
  const drive = { content: null };
  const ctx = await browser.newContext();
  await fakeGoogle(ctx, drive);
  await ctx.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('kyozai:gdrive:on', 'true');
    localStorage.setItem('kyozai:gdrive:token', JSON.stringify({ token: 'tok', exp: Date.now() - 1000 }));
  });
  const p = await ctx.newPage();
  await p.goto('./#/');
  const chip = p.locator('#sync-chip');
  await expect(chip).toHaveText('ドライブにつなぎ直す');
  await chip.click();
  await expect(chip).toHaveText('ドライブに保存済み');
  await ctx.close();
});

test('単元ページのメモ欄にも「消す」ボタンと個人情報の注意がある', async ({ page }) => {
  await page.goto('./#/rika/6/01/1');
  const box = page.locator('details.lesson[data-n="1"]').getByLabel('第1時のメモ', { exact: true });
  await box.fill('消すメモ');
  const del = page.getByRole('button', { name: '第1時のメモを消す' });
  await del.click();
  await del.click();
  await expect(box).toHaveValue('');
  await expect(page.locator('details.lesson[data-n="1"] summary .col-memo')).toHaveCount(0);
  await expect(page.locator('.unit-memo .memo-privacy')).toHaveText('児童の氏名など、個人情報は書かないでください。');
});
