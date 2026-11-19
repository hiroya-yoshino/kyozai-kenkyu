// 自分の教材研究メモ。単元ごと・時間ごとに端末に保存し、Googleドライブと合わせる。
// 1つの欄は { t: 文, at: 書いた時刻 }。消したときは t を空にして時刻だけ残す（ほかの端末に「消した」を伝えるため）。
import { readJSON, writeJSON } from './store.js';

const PREFIX = 'kyozai:memo:';
const KEY = /^[a-z]+\/\d+\/[\w-]+$/;
export const MEMO_CHANGED = 'kyozai:memo-changed';

// 前の形（{ unit: '文', lessons: { n: '文' } }）も読めるようにそろえる
function field(v) {
  if (typeof v === 'string') return { t: v, at: 0 };
  if (v && typeof v.t === 'string') return { t: v.t, at: Number(v.at) || 0 };
  return { t: '', at: 0 };
}

function normalize(m) {
  const lessons = {};
  for (const [n, v] of Object.entries(m?.lessons ?? {})) if (/^\d+$/.test(n)) lessons[n] = field(v);
  return { unit: field(m?.unit), lessons };
}

function readRaw(key) {
  return normalize(readJSON(PREFIX + key, null));
}

function writeRaw(key, raw) {
  writeJSON(PREFIX + key, raw);
}

function notify() {
  try { globalThis.dispatchEvent?.(new Event(MEMO_CHANGED)); } catch { /* テストなど */ }
}

// 画面で使う形：中身のある欄だけ
export function getMemo(key) {
  const r = readRaw(key);
  const lessons = {};
  for (const [n, f] of Object.entries(r.lessons)) if (f.t.trim()) lessons[n] = f.t;
  return { unit: r.unit.t.trim() ? r.unit.t : '', lessons };
}

const stamp = (text) => ({ t: text.trim() ? text : '', at: Date.now() });

export function setLessonMemo(key, n, text) {
  const r = readRaw(key);
  if (!r.lessons[n]?.t && !text.trim()) return;
  r.lessons[n] = stamp(text);
  writeRaw(key, r);
  notify();
}

export function setUnitMemo(key, text) {
  const r = readRaw(key);
  if (!r.unit.t && !text.trim()) return;
  r.unit = stamp(text);
  writeRaw(key, r);
  notify();
}

// その単元のメモをすべて消す
export function deleteAllMemosOf(key) {
  const r = readRaw(key);
  const now = Date.now();
  if (r.unit.t) r.unit = { t: '', at: now };
  for (const [n, f] of Object.entries(r.lessons)) if (f.t) r.lessons[n] = { t: '', at: now };
  writeRaw(key, r);
  notify();
}

export function hasMemo(key) {
  const m = getMemo(key);
  return Boolean(m.unit || Object.keys(m.lessons).length);
}

function allKeys() {
  const out = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX)) out.push(k.slice(PREFIX.length));
    }
  } catch { /* 使えない環境 */ }
  return out.sort((a, b) => a.localeCompare(b, 'ja', { numeric: true }));
}

// メモのある単元の一覧（メモの一覧画面で使う）
export function listMemos() {
  return allKeys().filter(hasMemo).map((key) => ({ key, ...getMemo(key) }));
}

export function memoCount() {
  return listMemos().length;
}

// 消した印も含めた、すべてのメモ（ドライブに保存する形）
export function rawMemos() {
  return Object.fromEntries(allKeys().map((k) => [k, readRaw(k)]));
}

const newer = (a, b) => (b.at > a.at ? b : a);
const same = (a, b) => a.t === b.t && a.at === b.at;

// ドライブのメモと合わせる。欄ごとに、あとから書いた方を残す
export function mergeRemote(remote) {
  let changedLocal = false;
  let changedRemote = false;
  const local = rawMemos();
  const keys = new Set([...Object.keys(local), ...Object.keys(remote ?? {}).filter((k) => KEY.test(k))]);
  for (const key of keys) {
    const l = local[key] ?? normalize(null);
    const r = normalize(remote?.[key]);
    const merged = { unit: newer(l.unit, r.unit), lessons: {} };
    let localDiff = !same(merged.unit, l.unit);
    if (!same(merged.unit, r.unit)) changedRemote = true;
    for (const n of new Set([...Object.keys(l.lessons), ...Object.keys(r.lessons)])) {
      const lf = l.lessons[n] ?? { t: '', at: 0 };
      const rf = r.lessons[n] ?? { t: '', at: 0 };
      const m = newer(lf, rf);
      merged.lessons[n] = m;
      if (!same(m, lf)) localDiff = true;
      if (!same(m, rf)) changedRemote = true;
    }
    if (localDiff) {
      writeRaw(key, merged);
      changedLocal = true;
    }
  }
  if (changedLocal) notify();
  return { changedLocal, changedRemote };
}

export function memoFile() {
  return { app: 'kyozai-kenkyu', kind: 'memos', version: 2, updatedAt: new Date().toISOString(), memos: rawMemos() };
}

// ほかの端末へ移すためのファイルの中身
export function exportMemos() {
  return JSON.stringify({ ...memoFile(), exportedAt: new Date().toISOString() }, null, 2);
}

// 読み込み：前の形のファイルはファイルの内容を優先し、今の形は欄ごとに新しい方を残す。読み込んだ単元の数を返す
export function importMemos(text) {
  let data;
  try { data = JSON.parse(text); } catch { data = null; }
  if (data?.app !== 'kyozai-kenkyu' || data?.kind !== 'memos' || typeof data.memos !== 'object' || !data.memos) {
    throw new Error('メモのファイルではありません。「メモを書き出す」で作ったファイルを選んでください。');
  }
  const now = Date.now() + 1; // 同じ瞬間に書いた端末のメモより、ファイルを優先する
  const remote = {};
  for (const [key, m] of Object.entries(data.memos)) {
    if (!KEY.test(key)) continue;
    const r = normalize(m);
    // 前の形は時刻がないので、読み込んだ時刻に書いたものとして扱う（空の欄は読み込まない）
    if (r.unit.at === 0) r.unit = r.unit.t.trim() ? { t: r.unit.t, at: now } : { t: '', at: 0 };
    for (const [n, f] of Object.entries(r.lessons)) {
      if (f.at === 0) { if (f.t.trim()) r.lessons[n] = { t: f.t, at: now }; else delete r.lessons[n]; }
    }
    remote[key] = r;
  }
  mergeRemote(remote);
  return Object.keys(remote).length;
}
