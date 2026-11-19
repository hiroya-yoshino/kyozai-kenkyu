import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRequest, parseDraft, costYen } from '../../js/draft.js';
import { validateUnit } from '../../js/validate.js';

const info = { subjectName: '理科', grade: 5, title: 'もののとけ方', hours: 3, month: '1月' };

test('APIへの依頼に、単元名・学年・時数・ルールが入り、ブラウザから送るための見出しがつく', () => {
  const req = buildRequest(info, { apiKey: 'sk-test', model: 'claude-sonnet-5-5' });
  assert.equal(req.url, 'https://api.anthropic.com/v1/messages');
  assert.equal(req.headers['x-api-key'], 'sk-test');
  assert.equal(req.headers['anthropic-version'], '2023-06-01');
  assert.equal(req.headers['anthropic-dangerous-direct-browser-access'], 'true');
  const body = JSON.parse(req.body);
  assert.equal(body.model, 'claude-sonnet-5-5');
  const text = body.system + body.messages[0].content;
  for (const t of ['もののとけ方', '5年', '3時間', 'JSON', 'lessons', '教科書の本文']) assert.ok(text.includes(t), `${t} がない`);
});

test('回答の前後に説明や```があっても、JSONの部分だけを取り出す', () => {
  const d = parseDraft('はい。\n```json\n{"title":"x","lessons":[]}\n```\nどうぞ');
  assert.equal(d.title, 'x');
  assert.throws(() => parseDraft('JSONがありません'), /下書きの形/);
});

test('使ったトークン数から、おおよその料金（円）を出す', () => {
  assert.equal(costYen('claude-sonnet-5-5', { input_tokens: 1_000_000, output_tokens: 0 }), 300);
  assert.equal(costYen('claude-haiku-5-5', { input_tokens: 0, output_tokens: 1_000_000 }), 75);
});

test('画面側でも、時数と毎時間の数が合わない下書きを見つけられる', () => {
  const errs = validateUnit({ id: 'd1', title: 't', hours: 2, month: '1月', goals: { knowledge: 'a', thinking: 'b', attitude: 'c' },
    intro: { question: 'q' }, lessons: [{ n: 1, aim: 'a', activities: ['x'], summary: 's' }] }, () => true);
  assert.ok(errs.includes('lessons の数(1)が hours(2)と一致しません'));
});
