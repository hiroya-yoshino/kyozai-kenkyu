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

test('準備物の画面', () => {
  assert.deepEqual(parseHash('#/rika/6/05/junbi'), { view: 'materials', subject: 'rika', grade: 6, unitId: '05' });
  assert.equal(buildHash({ view: 'materials', subject: 'rika', grade: 6, unitId: '05' }), '#/rika/6/05/junbi');
  assert.deepEqual(parseHash('#/rika/6/05/xyz'), { view: 'home' });
});

test('単元ページの特定の時間', () => {
  assert.deepEqual(parseHash('#/rika/6/02/4'), { view: 'unit', subject: 'rika', grade: 6, unitId: '02', lesson: 4 });
  assert.equal(buildHash({ view: 'unit', subject: 'rika', grade: 6, unitId: '02', lesson: 4 }), '#/rika/6/02/4');
  assert.deepEqual(parseHash('#/rika/6/02/0'), { view: 'home' });
});

test('設定と下書きの画面', () => {
  assert.deepEqual(parseHash('#/settings'), { view: 'settings' });
  assert.deepEqual(parseHash('#/rika/5/new'), { view: 'draftNew', subject: 'rika', grade: 5 });
  assert.deepEqual(parseHash('#/rika/5/d-abc123'), { view: 'draft', subject: 'rika', grade: 5, draftId: 'd-abc123' });
  for (const h of ['#/settings', '#/rika/5/new', '#/rika/5/d-abc123']) assert.equal(buildHash(parseHash(h)), h);
});

test('メモの一覧', () => {
  assert.deepEqual(parseHash('#/memos'), { view: 'memos' });
  assert.equal(buildHash({ view: 'memos' }), '#/memos');
});
