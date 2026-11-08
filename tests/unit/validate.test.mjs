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
