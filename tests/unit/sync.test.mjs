import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
  key: (i) => [...mem.keys()][i] ?? null,
  get length() { return mem.size; },
};
const { setLessonMemo, getMemo, rawMemos } = await import('../../js/memo.js');
const { syncWith } = await import('../../js/sync.js');

// ドライブの「アプリ専用の場所」の代わり
function fakeDrive(initial = null) {
  const files = initial ? { f1: JSON.stringify(initial) } : {};
  const calls = [];
  const fetch = async (url, opt = {}) => {
    const u = new URL(url);
    calls.push(`${opt.method ?? 'GET'} ${u.pathname}`);
    if (opt.headers?.Authorization !== 'Bearer tok') return new Response('', { status: 401 });
    if (u.pathname === '/drive/v3/files' && (opt.method ?? 'GET') === 'GET') {
      assert.equal(u.searchParams.get('spaces'), 'appDataFolder');
      return Response.json({ files: Object.keys(files).map((id) => ({ id })) });
    }
    if (u.pathname.startsWith('/drive/v3/files/') && u.searchParams.get('alt') === 'media') return new Response(files[u.pathname.split('/').pop()]);
    if (u.pathname === '/upload/drive/v3/files' && opt.method === 'POST') {
      const body = await new Response(opt.body).text();
      assert.match(body, /"parents":\["appDataFolder"\]/);
      files.f1 = body.split('\r\n\r\n')[2].split('\r\n--')[0];
      return Response.json({ id: 'f1' });
    }
    if (u.pathname.startsWith('/upload/drive/v3/files/') && opt.method === 'PATCH') {
      files[u.pathname.split('/').pop()] = opt.body;
      return Response.json({ id: 'f1' });
    }
    return new Response('', { status: 404 });
  };
  return { fetch, files, calls };
}

beforeEach(() => mem.clear());

test('ドライブにファイルがなければ、端末のメモで作る', async () => {
  setLessonMemo('rika/6/01', 1, 'はじめてのメモ');
  const d = fakeDrive();
  const r = await syncWith({ fetch: d.fetch, token: 'tok' });
  assert.equal(r.status, 'synced');
  assert.equal(JSON.parse(d.files.f1).memos['rika/6/01'].lessons[1].t, 'はじめてのメモ');
});

test('ドライブのメモを端末に取りこみ、端末で新しく書いたものはドライブへ送る', async () => {
  setLessonMemo('rika/6/01', 2, '端末で書いた');
  const d = fakeDrive({ app: 'kyozai-kenkyu', kind: 'memos', version: 2, memos: { 'rika/6/05': { unit: { t: 'ほかの端末', at: 1 }, lessons: {} } } });
  const r = await syncWith({ fetch: d.fetch, token: 'tok' });
  assert.equal(r.changedLocal, true);
  assert.equal(getMemo('rika/6/05').unit, 'ほかの端末');
  const saved = JSON.parse(d.files.f1).memos;
  assert.equal(saved['rika/6/01'].lessons[2].t, '端末で書いた');
  assert.equal(saved['rika/6/05'].unit.t, 'ほかの端末');
});

test('変わったところがなければ、ドライブへは送らない', async () => {
  setLessonMemo('rika/6/01', 1, 'あ');
  const d = fakeDrive({ app: 'kyozai-kenkyu', kind: 'memos', version: 2, memos: rawMemos() });
  await syncWith({ fetch: d.fetch, token: 'tok' });
  assert.ok(!d.calls.some((c) => c.startsWith('PATCH') || c.startsWith('POST')));
});

test('つなぐ期限が切れていたら needs-auth を返し、端末のメモはそのまま', async () => {
  setLessonMemo('rika/6/01', 1, 'あ');
  const d = fakeDrive();
  const r = await syncWith({ fetch: d.fetch, token: 'old' });
  assert.equal(r.status, 'needs-auth');
  assert.equal(getMemo('rika/6/01').lessons[1], 'あ');
});

test('通信できないときは offline を返す', async () => {
  const r = await syncWith({ fetch: async () => { throw new TypeError('Failed to fetch'); }, token: 'tok' });
  assert.equal(r.status, 'offline');
});
