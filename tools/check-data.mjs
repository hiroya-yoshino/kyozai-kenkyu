// 全データを検証する CLI。エラーがあれば一覧を出して終了コード 1。
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateIndex, validateUnit } from './validate.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = join(root, 'data/index.json');
const errors = [];

if (existsSync(indexPath)) {
  const index = JSON.parse(readFileSync(indexPath, 'utf8'));
  errors.push(...validateIndex(index).map((e) => `index.json: ${e}`));
  for (const subject of index.subjects ?? []) {
    for (const g of subject.grades ?? []) {
      for (const item of g.items ?? []) {
        if (item.kind !== 'unit' || item.status !== 'ready') continue;
        const rel = `data/${subject.id}/${g.grade}/${item.id}.json`;
        const p = join(root, rel);
        if (!existsSync(p)) { errors.push(`${rel}: ファイルがありません`); continue; }
        const unit = JSON.parse(readFileSync(p, 'utf8'));
        const errs = validateUnit(unit, (src) => existsSync(join(root, src)));
        errors.push(...errs.map((e) => `${rel}: ${e}`));
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('データチェック: OK');
