import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHash, buildHash } from '../../js/router.js';

test('空のハッシュはホーム', () => assert.deepEqual(parseHash(''), { view: 'home' }));
test('教科だけなら6年の一覧', () => assert.deepEqual(parseHash('#/rika'), { view: 'list', subject: 'rika', grade: 6 }));
test('教科と学年は一覧', () => assert.deepEqual(parseHash('#/rika/5'), { view: 'list', subject: 'rika', grade: 5 }));
test('教科・学年・単元は単元ページ', () =>
  assert.deepEqual(parseHash('#/rika/6/05'), { view: 'unit', subject: 'rika', grade: 6, unitId: '05' }));
test('解釈できないものはホーム', () => {
  assert.deepEqual(parseHash('#/xyz/abc/def/ghi'), { view: 'home' });
  assert.deepEqual(parseHash('#/rika/abc'), { view: 'home' });
  assert.deepEqual(parseHash('#/RIKA!/6'), { view: 'home' });
});
test('buildHash は parseHash の逆', () => {
  for (const h of ['#/', '#/rika/6', '#/rika/6/05']) assert.equal(buildHash(parseHash(h)), h);
});
