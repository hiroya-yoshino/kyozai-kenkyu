import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluationRows, toCSV, HEADER } from '../../js/export.js';

const unit = { id: '01', no: 1, title: 'ものが燃えるしくみ', lessons: [
  { n: 1, stage: '単元導入', evaluation: '思①（発言・記述分析）：予想を発想し、表現している。' },
  { n: 2, stage: '第1次', evaluation: '知②（行動観察・記録分析）：正しく扱い、記録している。\n態①（行動観察）：進んで関わり、"粘り強く"取り組んでいる。' },
  { n: 3 },
] };

test('評価規準を、時・記号・観点・評価方法・文に分けた行にする', () => {
  const rows = evaluationRows(unit);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows[0], ['1', 'ものが燃えるしくみ', '1', '単元導入', '思①', '思考・判断・表現', '発言・記述分析', '予想を発想し、表現している。']);
  assert.deepEqual(rows[2].slice(4, 7), ['態①', '主体的に学習に取り組む態度', '行動観察']);
});

test('CSVはExcelで文字化けしないようBOMつき、改行はCRLF、ダブルクォートやカンマは囲んで逃がす', () => {
  const csv = toCSV([HEADER, ['a,b', 'say "hi"', 'x']]);
  assert.ok(csv.startsWith('﻿'));
  assert.ok(csv.includes('\r\n'));
  assert.ok(csv.includes('"a,b","say ""hi""",x'));
  assert.equal(HEADER.join(','), '単元,単元名,時,次,記号,観点,評価方法,評価規準');
});
