// 検索用の索引（data/search-index.json）を作る。単元の中身を変えたら `npm run build:search` を実行する。
// それぞれの文によみ（ひらがな）をつけ、漢字のことば→よみの対応表（lexicon）もいっしょに入れる。
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { getTokenizer, yomiOf, OVERRIDES, toHira } from './yomi.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const KANJI = /[一-鿿々]/;
const FIELDS = [
  ['めあて', (l) => [l.aim]],
  ['活動', (l) => l.activities ?? []],
  ['まとめ', (l) => [l.summary]],
  ['準備物', (l) => l.experiment?.materials ?? []],
  ['安全上の注意', (l) => l.experiment?.safety ?? []],
];

function readyUnits() {
  const index = JSON.parse(readFileSync(join(root, 'data/index.json'), 'utf8'));
  const out = [];
  for (const s of index.subjects) for (const g of s.grades ?? []) for (const it of g.items ?? []) {
    if (it.kind !== 'unit' || it.status !== 'ready') continue;
    const file = `data/${s.id}/${g.grade}/${it.id}.json`;
    out.push({ s: s.id, g: g.grade, item: it, file, raw: readFileSync(join(root, file), 'utf8') });
  }
  return out;
}

// 索引のもとになったデータと、よみの補正表のハッシュ
export function sourceHash() {
  const h = createHash('sha256');
  h.update(readFileSync(join(root, 'data/index.json')));
  for (const u of readyUnits()) h.update(u.file).update(u.raw);
  h.update(JSON.stringify(OVERRIDES));
  return h.digest('hex').slice(0, 12);
}

export async function buildSearchIndex() {
  const t = await getTokenizer();
  const lexicon = { ...OVERRIDES };
  const entries = [];
  for (const u of readyUnits()) {
    const unit = JSON.parse(u.raw);
    for (const l of unit.lessons) {
      for (const [f, get] of FIELDS) {
        for (const text of get(l)) {
          if (!text) continue;
          entries.push({ s: u.s, g: u.g, u: unit.id, no: u.item.no, title: unit.title, n: l.n, f, t: text, y: yomiOf(t, text) });
          for (const tok of t.tokenize(text)) {
            const surf = tok.surface_form;
            if (KANJI.test(surf) && !lexicon[surf] && tok.reading && tok.reading !== '*') lexicon[surf] = toHira(tok.reading);
          }
        }
      }
    }
  }
  const sorted = Object.fromEntries(Object.entries(lexicon).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
  return { source: sourceHash(), lexicon: sorted, entries };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const idx = await buildSearchIndex();
  writeFileSync(join(root, 'data/search-index.json'), JSON.stringify(idx) + '\n');
  console.log(`data/search-index.json を更新しました（${idx.entries.length}件、ことば${Object.keys(idx.lexicon).length}語）`);
}
