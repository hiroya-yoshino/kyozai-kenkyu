// メモを Googleドライブの「アプリ専用の場所（appDataFolder）」に保存して、端末どうしで合わせる。
// ドライブのほかのファイルは見ない・さわらない（drive.appdata の権限だけを使う）。
import { mergeRemote, memoFile, MEMO_CHANGED } from './memo.js';
import { readJSON, writeJSON } from './store.js';
import { GOOGLE_CLIENT_ID } from './config.js';

const FILE_NAME = 'kyozai-memos.json';
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const API = 'https://www.googleapis.com';
const FILE_ID = 'kyozai:gdrive:fileId';
const TOKEN = 'kyozai:gdrive:token';
const ON = 'kyozai:gdrive:on';
export const SYNC_STATUS = 'kyozai:sync-status';
export const MEMOS_PULLED = 'kyozai:memos-pulled';

class AuthError extends Error {}

async function call(fetchFn, token, url, opt = {}) {
  const res = await fetchFn(url, { ...opt, headers: { ...(opt.headers ?? {}), Authorization: `Bearer ${token}` } });
  if (res.status === 401 || res.status === 403) throw new AuthError();
  return res;
}

async function findFileId(fetchFn, token) {
  const cached = readJSON(FILE_ID, null);
  if (cached) return cached;
  const q = encodeURIComponent(`name='${FILE_NAME}'`);
  const res = await call(fetchFn, token, `${API}/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id)&orderBy=modifiedTime%20desc`);
  if (!res.ok) throw new Error(`list ${res.status}`);
  const id = (await res.json()).files?.[0]?.id ?? null;
  if (id) writeJSON(FILE_ID, id);
  return id;
}

async function download(fetchFn, token, id) {
  const res = await call(fetchFn, token, `${API}/drive/v3/files/${id}?alt=media`);
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error(`get ${res.status}`);
  try { return JSON.parse(await res.text()); } catch { return null; }
}

async function upload(fetchFn, token, id) {
  const body = JSON.stringify(memoFile());
  if (id) {
    const res = await call(fetchFn, token, `${API}/upload/drive/v3/files/${id}?uploadType=media`,
      { method: 'PATCH', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body });
    if (!res.ok) throw new Error(`update ${res.status}`);
    return id;
  }
  const b = 'kyozai' + Math.random().toString(36).slice(2);
  const meta = JSON.stringify({ name: FILE_NAME, parents: ['appDataFolder'], mimeType: 'application/json' });
  const multipart = `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${body}\r\n--${b}--`;
  const res = await call(fetchFn, token, `${API}/upload/drive/v3/files?uploadType=multipart&fields=id`,
    { method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${b}` }, body: multipart });
  if (!res.ok) throw new Error(`create ${res.status}`);
  const newId = (await res.json()).id;
  writeJSON(FILE_ID, newId);
  return newId;
}

// 1回分の同期。ドライブを読んで端末と合わせ、端末の方が新しいところがあればドライブへ送る
export async function syncWith({ fetch: fetchFn, token }) {
  try {
    let id = await findFileId(fetchFn, token);
    let remote = id ? await download(fetchFn, token, id) : null;
    if (remote === undefined) { // 覚えていたファイルがなくなっていた
      localStorage.removeItem(FILE_ID);
      id = await findFileId(fetchFn, token);
      remote = id ? await download(fetchFn, token, id) : null;
    }
    const { changedLocal, changedRemote } = mergeRemote(remote?.memos ?? {});
    if (!id || changedRemote) await upload(fetchFn, token, id);
    return { status: 'synced', changedLocal, at: Date.now() };
  } catch (e) {
    if (e instanceof AuthError) return { status: 'needs-auth' };
    if (e instanceof TypeError) return { status: 'offline' };
    return { status: 'error', message: e.message };
  }
}

// ここから下はブラウザで動かす部分
let status = { status: 'off' };
let tokenClient = null;
let gisPromise = null;
let timer = null;
let running = null;
let again = false;

const emit = (s) => { status = s; globalThis.dispatchEvent?.(new CustomEvent(SYNC_STATUS, { detail: s })); };
export const syncStatus = () => status;
export const isConnected = () => readJSON(ON, false) === true;
export const isConfigured = () => Boolean(GOOGLE_CLIENT_ID);

function validToken() {
  const t = readJSON(TOKEN, null);
  return t && t.exp > Date.now() + 60_000 ? t.token : null;
}

export function loadGoogle() {
  if (globalThis.google?.accounts?.oauth2) return Promise.resolve();
  gisPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = resolve;
    s.onerror = () => { gisPromise = null; reject(new Error('gis')); };
    document.head.append(s);
  });
  return gisPromise;
}

function client() {
  tokenClient ??= google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPE,
    callback: (r) => {
      if (r.error || !r.access_token) { emit({ status: isConnected() ? 'needs-auth' : 'off', message: r.error }); return; }
      writeJSON(TOKEN, { token: r.access_token, exp: Date.now() + (Number(r.expires_in) || 3600) * 1000 });
      writeJSON(ON, true);
      syncNow();
    },
    error_callback: () => emit({ status: isConnected() ? 'needs-auth' : 'off' }),
  });
  return tokenClient;
}

// 「Googleにつなぐ」ボタンから呼ぶ（押した操作の中で呼ばないと、ブラウザが小さな窓を止めてしまう）
export function connect() {
  if (!globalThis.google?.accounts?.oauth2) {
    emit({ status: 'loading' });
    loadGoogle().then(() => emit({ status: 'ready-to-connect' }), () => emit({ status: 'offline' }));
    return false;
  }
  client().requestAccessToken({ prompt: isConnected() ? '' : 'consent' });
  return true;
}

export function disconnect() {
  const t = readJSON(TOKEN, null);
  try { if (t?.token) google.accounts.oauth2.revoke(t.token, () => {}); } catch { /* 読み込めていないとき */ }
  for (const k of [TOKEN, ON, FILE_ID]) localStorage.removeItem(k);
  emit({ status: 'off' });
}

export async function syncNow() {
  if (!isConnected()) { emit({ status: 'off' }); return status; }
  if (running) { again = true; return running; }
  const token = validToken();
  if (!token) { emit({ status: 'needs-auth' }); return status; }
  emit({ status: 'syncing' });
  running = (async () => {
    const r = await syncWith({ fetch: (...a) => fetch(...a), token });
    if (r.status === 'needs-auth') localStorage.removeItem(TOKEN);
    emit(r);
    if (r.changedLocal) globalThis.dispatchEvent?.(new Event(MEMOS_PULLED));
    return r;
  })();
  try { return await running; } finally {
    running = null;
    if (again) { again = false; scheduleSync(0); }
  }
}

export function scheduleSync(ms = 2000) {
  if (!isConnected()) return;
  clearTimeout(timer);
  timer = setTimeout(syncNow, ms);
}

// 起動時：つないだことのある端末なら、Googleの部品を読みこんでおき、ドライブと合わせる
export function startSync() {
  addEventListener(MEMO_CHANGED, () => { if (!running) scheduleSync(); });
  addEventListener('online', () => scheduleSync(0));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') scheduleSync(0); });
  if (!isConnected()) return;
  loadGoogle().catch(() => {});
  syncNow();
}
