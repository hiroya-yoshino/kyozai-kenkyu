import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { listAssets, computeVersion } from '../../tools/build-sw.mjs';

const root = new URL('../../', import.meta.url);
const sw = readFileSync(new URL('sw.js', root), 'utf8');

test('オフライン用の保存リストは、公開しているファイルと一致している（npm run build:sw で更新）', () => {
  const m = sw.match(/const ASSETS = (\[[\s\S]*?\]);/);
  assert.ok(m, 'sw.js に ASSETS がない');
  assert.deepEqual(JSON.parse(m[1]), listAssets());
});

test('保存リストには、画面・データ・図がすべて入っている', () => {
  const assets = listAssets();
  for (const p of ['./', 'index.html', 'css/style.css', 'js/app.js', 'data/index.json', 'data/rika/6/01.json', 'figures/rika/6/01-2.svg', 'manifest.webmanifest']) {
    assert.ok(assets.includes(p), `${p} がない`);
  }
  assert.ok(!assets.some((p) => p.startsWith('tests/') || p.startsWith('tools/') || p.startsWith('docs/')));
  for (const p of assets.filter((p) => p !== './')) assert.ok(existsSync(new URL(p, root)), `${p} が存在しない`);
});

test('ホーム画面に追加するための設定がある', () => {
  const man = JSON.parse(readFileSync(new URL('manifest.webmanifest', root), 'utf8'));
  assert.equal(man.start_url, './');
  assert.equal(man.display, 'standalone');
  assert.ok(man.icons.some((i) => i.sizes === '192x192') && man.icons.some((i) => i.sizes === '512x512'));
});

test('ファイルの中身を変えたら sw.js の版も変わっている（npm run build:sw のし忘れを防ぐ）', () => {
  assert.ok(sw.includes(`kyozai-${computeVersion()}`), 'sw.js の版が古い。npm run build:sw を実行する');
});

test('オフライン用に保存するときは、ブラウザに残った古いファイルを使わず、必ずサーバーから取り直す', () => {
  const install = sw.slice(sw.indexOf("addEventListener('install'"), sw.indexOf("addEventListener('activate'"));
  assert.match(install, /cache:\s*'reload'/, 'install で cache: reload を指定していない（古いファイルが新しい版に入ってしまう）');
});

test('新しい版に切りかわったら、自動で1回だけ読み込み直す（古い画面のしくみのまま残らない）', () => {
  const app = readFileSync(new URL('js/app.js', root), 'utf8');
  assert.match(app, /controllerchange/, 'controllerchange で読み込み直していない');
  assert.match(app, /navigator\.serviceWorker\.controller/, 'はじめて入れたとき（前の版がないとき）まで読み込み直してしまう');
});
