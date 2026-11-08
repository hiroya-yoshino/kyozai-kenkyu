import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const chrome = process.env.CHROME_PATH ?? (existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);

export default defineConfig({
  testDir: 'tests/e2e',
  use: {
    baseURL: 'http://localhost:4173/kyozai-kenkyu/',
    launchOptions: chrome ? { executablePath: chrome } : {},
  },
  webServer: { command: 'node tools/serve.mjs', url: 'http://localhost:4173/kyozai-kenkyu/package.json', reuseExistingServer: true },
});
