import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// node には localStorage がないので、小さな代わりを用意する
const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
  key: (i) => [...mem.keys()][i] ?? null,
  get length() { return mem.size; },
};
const { getMemo, setLessonMemo, setUnitMemo, hasMemo, exportMemos, importMemos } = await import('../../js/memo.js');

beforeEach(() => mem.clear());

test('メモがなければ空の形を返す', () => {
  assert.deepEqual(getMemo('rika/6/01'), { unit: '', lessons: {} });
  assert.equal(hasMemo('rika/6/01'), false);
});

test('時間ごとのメモと単元全体のメモを保存できる', () => {
  setLessonMemo('rika/6/01', 3, '集気びんは班に2本');
  setUnitMemo('rika/6/01', '去年は線香の煙が見にくかった');
  assert.deepEqual(getMemo('rika/6/01'), { unit: '去年は線香の煙が見にくかった', lessons: { 3: '集気びんは班に2本' } });
  assert.equal(hasMemo('rika/6/01'), true);
});

test('空にしたメモは消える', () => {
  setLessonMemo('rika/6/01', 3, 'あ');
  setLessonMemo('rika/6/01', 3, '   ');
  assert.deepEqual(getMemo('rika/6/01').lessons, {});
  assert.equal(hasMemo('rika/6/01'), false);
});

test('書き出したファイルを別の端末で読み込むと、同じメモになる', () => {
  setLessonMemo('rika/6/01', 1, '一');
  setLessonMemo('rika/6/02', 4, '四');
  setUnitMemo('rika/6/02', '単元');
  mem.set('kyozai:done:rika/6/01', '[1]');
  const file = exportMemos();
  mem.clear();
  assert.equal(importMemos(file), 2);
  assert.equal(getMemo('rika/6/01').lessons[1], '一');
  assert.deepEqual(getMemo('rika/6/02'), { unit: '単元', lessons: { 4: '四' } });
});

test('読み込むと、同じ時間のメモはファイルの内容になり、ほかのメモは残る', () => {
  setLessonMemo('rika/6/01', 1, 'この端末');
  setLessonMemo('rika/6/01', 2, '残る');
  const file = JSON.stringify({ app: 'kyozai-kenkyu', kind: 'memos', version: 1, memos: { 'rika/6/01': { unit: '', lessons: { 1: 'ファイル' } } } });
  importMemos(file);
  assert.deepEqual(getMemo('rika/6/01').lessons, { 1: 'ファイル', 2: '残る' });
});

test('メモのファイルでないものは読み込まない', () => {
  assert.throws(() => importMemos('{"app":"kyozai-kenkyu","kind":"draft"}'), /メモのファイルではありません/);
  assert.throws(() => importMemos('こわれた'), /メモのファイルではありません/);
});
