// オフライン用の保存リストを作り、sw.js を書き出す。中身を更新したら `npm run build:sw` を実行する。
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIRS = ['css', 'js', 'data', 'figures', 'icons'];
const FILES = ['index.html', 'manifest.webmanifest'];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

export function listAssets() {
  const files = DIRS.flatMap((d) => walk(join(root, d))).map((p) => relative(root, p).split(sep).join('/'));
  return ['./', ...FILES, ...files.sort()];
}

export function computeVersion(assets = listAssets()) {
  const hash = createHash('sha256');
  for (const a of assets) if (a !== './') hash.update(a).update(readFileSync(join(root, a)));
  hash.update(readFileSync(join(root, 'tools', 'sw.template.js'))); // 仕組みを変えたときも版を変える
  return hash.digest('hex').slice(0, 12);
}

export function buildSw() {
  const assets = listAssets();
  const version = computeVersion(assets);
  const template = readFileSync(join(root, 'tools', 'sw.template.js'), 'utf8');
  const out = template
    .replace('__VERSION__', version)
    .replace('const ASSETS = [];', `const ASSETS = ${JSON.stringify(assets, null, 2)};`);
  writeFileSync(join(root, 'sw.js'), out);
  return { version, count: assets.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { version, count } = buildSw();
  console.log(`sw.js を更新しました（${count}ファイル、版 ${version}）`);
}
