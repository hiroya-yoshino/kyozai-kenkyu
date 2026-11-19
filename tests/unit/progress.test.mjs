import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessonOrder, nextLesson } from '../../js/progress.js';

const index = { subjects: [
  { id: 'rika', name: '理科', status: 'ready', grades: [
    { grade: 6, status: 'ready', items: [
      { kind: 'event', title: 'ガイダンス', hours: 1 },
      { kind: 'unit', id: '01', title: 'A', hours: 2, status: 'ready' },
      { kind: 'unit', id: '02', title: 'B', hours: 3, status: 'ready' },
      { kind: 'unit', id: '03', title: 'C', hours: 2, status: 'preparing' },
    ] }] },
  { id: 'sansu', name: '算数', status: 'preparing', grades: [] },
] };

test('順番は、公開している単元の時間を年間の順に並べたもの', () => {
  assert.deepEqual(lessonOrder(index).map((l) => `${l.unitId}-${l.n}`), ['01-1', '01-2', '02-1', '02-2', '02-3']);
});

test('記録がなければ「次の授業」はない', () => {
  assert.equal(nextLesson(index, () => []), null);
});

test('最後に終わった時間の次が「次の授業」（途中の印のつけ忘れは気にしない）', () => {
  const done = { 'rika/6/01': [2], 'rika/6/02': [] };
  const next = nextLesson(index, (key) => done[key] ?? []);
  assert.deepEqual([next.unitId, next.n, next.title], ['02', 1, 'B']);
});

test('全部終わっていたら finished を返す', () => {
  const next = nextLesson(index, (key) => ({ 'rika/6/01': [1, 2], 'rika/6/02': [1, 2, 3] })[key] ?? []);
  assert.equal(next.finished, true);
});
