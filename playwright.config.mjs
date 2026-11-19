import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const chrome = process.env.CHROME_PATH ?? (existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);

export default defineConfig({
  testDir: 'tests/e2e',
  use: {
    baseURL: 'http://localhost:4173/kyozai-kenkyu/',
    serviceWorkers: 'block',
    // 日本語のファイル名を正しく扱えるよう、ブラウザを UTF-8 の言語設定で起動する
    launchOptions: { ...(chrome ? { executablePath: chrome } : {}), env: { ...process.env, LANG: 'ja_JP.UTF-8', LC_ALL: 'C.UTF-8' } },
    locale: 'ja-JP',
  },
  webServer: { command: 'node tools/serve.mjs', url: 'http://localhost:4173/kyozai-kenkyu/package.json', reuseExistingServer: true },
});
