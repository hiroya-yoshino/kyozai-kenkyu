import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateIndex } from '../../tools/validate.mjs';

const index = JSON.parse(readFileSync(new URL('../../data/index.json', import.meta.url), 'utf8'));
const rika6 = index.subjects.find((s) => s.id === 'rika').grades.find((g) => g.grade === 6);
const units = rika6.items.filter((i) => i.kind === 'unit');

const EXPECTED = [
  ['01', 1, 'ものが燃えるしくみ', 8, '4月', 1],
  ['02', 2, 'ヒトや動物の体', 8, '5月', 1],
  ['03', 3, '植物のつくりとはたらき', 8, '6月', 1],
  ['04', 4, '生物どうしのつながり', 6, '6〜7月', 1],
  ['05', 5, '水よう液の性質', 13, '9〜10月', 2],
  ['06', 6, '月と太陽', 5, '10〜11月', 2],
  ['07', 7, '大地のつくりと変化', 15, '11〜12月', 2],
  ['08', 8, 'てこのはたらき', 9, '1月', 3],
  ['09', 9, '発電と電気の利用', 13, '2〜3月', 3],
  ['10', 10, '自然とともに生きる', 4, '3月', 3],
];

test('実データの index.json が検証を通る', () => {
  assert.deepEqual(validateIndex(index), []);
});

test('6年理科の単元は10件で、時数の合計は89', () => {
  assert.equal(units.length, 10);
  assert.equal(units.reduce((s, u) => s + u.hours, 0), 89);
});

test('単元の番号・名前・時数・月・学期が年間指導計画どおり', () => {
  assert.deepEqual(units.map((u) => [u.id, u.no, u.title, u.hours, u.month, u.term]), EXPECTED);
});

test('番号のない時間は4件', () => {
  const events = rika6.items.filter((i) => i.kind === 'event').map((e) => e.title);
  assert.deepEqual(events, ['理科のガイダンス', 'これまでの学習をつなげよう', '自由研究', 'みんなで使う理科室']);
});

test('算数・国語・5年理科は準備中', () => {
  assert.equal(index.subjects.find((s) => s.id === 'sansu').status, 'preparing');
  assert.equal(index.subjects.find((s) => s.id === 'kokugo').status, 'preparing');
  assert.equal(index.subjects.find((s) => s.id === 'rika').grades.find((g) => g.grade === 5).status, 'preparing');
});

test('validateIndex は単元 id の重複を見つける', () => {
  const dup = structuredClone(index);
  const items = dup.subjects[0].grades.find((g) => g.grade === 6).items;
  items.push({ ...items.find((i) => i.kind === 'unit') });
  assert.ok(validateIndex(dup).some((e) => e.includes('id が重複')));
});
