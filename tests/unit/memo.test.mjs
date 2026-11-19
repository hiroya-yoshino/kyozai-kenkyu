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

const { rawMemos, mergeRemote, deleteAllMemosOf, listMemos } = await import('../../js/memo.js');

test('前の形（文字だけ）で保存されたメモも読める', () => {
  mem.set('kyozai:memo:rika/6/01', JSON.stringify({ unit: '前の形', lessons: { 2: '二' } }));
  assert.deepEqual(getMemo('rika/6/01'), { unit: '前の形', lessons: { 2: '二' } });
});

test('ドライブの内容と合わせるとき、あとから書いた方を残す（消したことも伝わる）', () => {
  setLessonMemo('rika/6/01', 1, '端末の古いメモ');
  setLessonMemo('rika/6/01', 2, '端末で新しく書いた');
  const local = rawMemos()['rika/6/01'];
  const remote = { 'rika/6/01': { unit: { t: '', at: 0 }, lessons: {
    1: { t: 'ドライブの新しいメモ', at: local.lessons[1].at + 1000 },
    2: { t: 'ドライブの古いメモ', at: local.lessons[2].at - 1000 } } },
  'rika/6/02': { unit: { t: '', at: 5 }, lessons: { 3: { t: '', at: 9 } } } };
  const r = mergeRemote(remote);
  assert.deepEqual(getMemo('rika/6/01').lessons, { 1: 'ドライブの新しいメモ', 2: '端末で新しく書いた' });
  assert.equal(r.changedLocal, true, '端末のメモが変わった');
  assert.equal(r.changedRemote, true, 'ドライブに送るものがある');
  assert.equal(hasMemo('rika/6/02'), false);
});

test('同じ内容なら、どちらも変わらない', () => {
  setLessonMemo('rika/6/01', 1, 'あ');
  const r = mergeRemote(structuredClone(rawMemos()));
  assert.deepEqual([r.changedLocal, r.changedRemote], [false, false]);
});

test('消したメモは、消した印として残り、ドライブの古いメモで生き返らない', () => {
  setLessonMemo('rika/6/01', 1, 'あ');
  const old = structuredClone(rawMemos());
  old['rika/6/01'].lessons[1].at -= 5000;
  setLessonMemo('rika/6/01', 1, '');
  mergeRemote(old);
  assert.equal(getMemo('rika/6/01').lessons[1], undefined);
  assert.equal(rawMemos()['rika/6/01'].lessons[1].t, '');
});

test('単元のメモをまとめて消せる', () => {
  setUnitMemo('rika/6/01', 'u');
  setLessonMemo('rika/6/01', 1, 'a');
  setLessonMemo('rika/6/01', 5, 'b');
  deleteAllMemosOf('rika/6/01');
  assert.equal(hasMemo('rika/6/01'), false);
});

test('メモの一覧は、メモのある単元だけを教科・学年・単元の順に返す', () => {
  setLessonMemo('rika/6/02', 1, 'b');
  setLessonMemo('rika/6/01', 3, 'a');
  setLessonMemo('rika/6/03', 1, 'c');
  setLessonMemo('rika/6/03', 1, '');
  assert.deepEqual(listMemos().map((m) => m.key), ['rika/6/01', 'rika/6/02']);
});
