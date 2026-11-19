import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateUnit } from '../../tools/validate.mjs';

function validUnit() {
  return {
    id: '01', title: 'ものが燃えるしくみ', hours: 2, month: '4月', term: 1,
    goals: { knowledge: 'k', thinking: 't', attitude: 'a' },
    intro: { question: 'q', presentation: 'p' },
    lessons: [
      { n: 1, aim: 'a', activities: ['x'], summary: 's' },
      { n: 2, aim: 'a', activities: ['x'], summary: 's',
        experiment: { materials: ['m'], steps: ['s'], safety: ['火に注意'],
          figure: { src: 'figures/rika/6/01-2.svg', caption: 'c' } } },
    ],
  };
}

test('合格する単元', () => {
  assert.deepEqual(validateUnit(validUnit(), () => true), []);
});

test('時数と毎時間の数が違う', () => {
  const u = validUnit(); u.hours = 3;
  assert.ok(validateUnit(u, () => true).includes('lessons の数(2)が hours(3)と一致しません'));
});

test('目標が欠けている', () => {
  const u = validUnit(); delete u.goals.attitude;
  assert.ok(validateUnit(u, () => true).includes('goals.attitude がありません'));
});

test('図ファイルがない', () => {
  assert.ok(validateUnit(validUnit(), () => false).includes('図が見つかりません: figures/rika/6/01-2.svg'));
});

test('実験に安全上の注意がない', () => {
  const u = validUnit(); u.lessons[1].experiment.safety = [];
  assert.ok(validateUnit(u, () => true).includes('第2時の実験に safety がありません'));
});

test('参考資料は title が必要', () => {
  const u = validUnit(); u.sources = [{ url: 'https://example.com' }];
  assert.ok(validateUnit(u, () => true).includes('sources[0] の title がありません'));
});

test('実験のない時間の図もファイルの有無を調べる', () => {
  const u = validUnit(); u.lessons[0].figure = { src: 'figures/rika/6/x.svg', caption: 'c' };
  assert.ok(validateUnit(u, (src) => src !== 'figures/rika/6/x.svg').includes('図が見つかりません: figures/rika/6/x.svg'));
});

test('validateIndex：番号のない時間に中身をつけるときは id と status が必要で、id は単元と重ならない', async () => {
  const { validateIndex } = await import('../../js/validate.js');
  const base = { subjects: [{ id: 'rika', name: '理科', status: 'ready', grades: [{ grade: 5, status: 'ready', items: [
    { kind: 'event', title: 'ガイダンス', hours: 1, month: '4月', term: 1 },
    { kind: 'event', id: '11', status: 'ready', title: '花のつくり', hours: 2, month: '4月', term: 1 },
    { kind: 'unit', id: '01', no: 1, status: 'ready', title: 'A', hours: 2, month: '4月', term: 1 }] }] }] };
  assert.deepEqual(validateIndex(base), []);
  const dup = structuredClone(base);
  dup.subjects[0].grades[0].items[1].id = '01';
  assert.ok(validateIndex(dup).some((e) => e.includes('id が重複')));
  const noStatus = structuredClone(base);
  delete noStatus.subjects[0].grades[0].items[1].status;
  assert.ok(validateIndex(noStatus).some((e) => e.includes('status')));
});
