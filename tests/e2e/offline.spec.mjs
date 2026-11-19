import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'allow' });

test('一度開いたあとは、通信できなくても開いたことのない単元や図まで表示できる', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await context.setOffline(true);
  await page.goto('./#/rika/6/07');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('大地のつくりと変化');
  await page.locator('details.lesson[data-n="2"] summary').click();
  const img = page.locator('details.lesson[data-n="2"] figure img');
  await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth)).toBeGreaterThan(0);
  await context.setOffline(false);
});
