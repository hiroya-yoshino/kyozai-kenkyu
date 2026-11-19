import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchUnits } from '../../js/search.js';

const units = [
  { id: '01', no: 1, title: 'A単元', lessons: [
    { n: 1, aim: 'ろうそくを燃やす', activities: ['石灰水を入れてふる'], summary: 'まとめ1' },
    { n: 2, aim: 'めあて2', activities: ['活動'], summary: '二酸化炭素ができる',
      experiment: { materials: ['石灰水', '集気びん'], steps: ['手順'], safety: ['石灰水は目に入れない'] } },
  ] },
  { id: '05', no: 5, title: 'B単元', lessons: [{ n: 4, aim: 'めあて', activities: ['活動'], summary: 'まとめ' }] },
];

test('めあて・活動・まとめ・準備物・安全上の注意から探し、どこにあったかを返す', () => {
  const r = searchUnits(units, '石灰水');
  assert.deepEqual(r.map((x) => [x.unitId, x.n, x.fields.join('・')]), [['01', 1, '活動'], ['01', 2, '準備物・安全上の注意']]);
  assert.equal(r[0].title, 'A単元');
  assert.ok(r[0].snippet.includes('石灰水'));
});

test('空白だけの検索は結果なし、大文字小文字や前後の空白は気にしない', () => {
  assert.deepEqual(searchUnits(units, '   '), []);
  assert.equal(searchUnits(units, '  二酸化炭素 ').length, 1);
});
