// 自分の教材研究メモ。単元ごと・時間ごとに端末に保存する。
import { readJSON, writeJSON } from './store.js';

const PREFIX = 'kyozai:memo:';

export function getMemo(key) {
  const m = readJSON(PREFIX + key, null);
  return { unit: m?.unit ?? '', lessons: { ...(m?.lessons ?? {}) } };
}

function save(key, memo) {
  const lessons = Object.fromEntries(Object.entries(memo.lessons).filter(([, v]) => v.trim()));
  const unit = memo.unit.trim() ? memo.unit : '';
  try {
    if (!unit && !Object.keys(lessons).length) localStorage.removeItem(PREFIX + key);
    else writeJSON(PREFIX + key, { unit, lessons });
  } catch {
    // 保存できなくても画面はそのまま使える
  }
}

export function setLessonMemo(key, n, text) {
  const m = getMemo(key);
  m.lessons[n] = text;
  save(key, m);
}

export function setUnitMemo(key, text) {
  const m = getMemo(key);
  m.unit = text;
  save(key, m);
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
  return out;
}

// ほかの端末へ移すためのファイルの中身
export function exportMemos() {
  const memos = Object.fromEntries(allKeys().map((k) => [k, getMemo(k)]));
  return JSON.stringify({ app: 'kyozai-kenkyu', kind: 'memos', version: 1, exportedAt: new Date().toISOString(), memos }, null, 2);
}

export function memoCount() {
  return allKeys().length;
}

// 読み込み：同じ時間のメモはファイルの内容にし、ファイルにないメモは残す。読み込んだ単元の数を返す
export function importMemos(text) {
  let data;
  try { data = JSON.parse(text); } catch { data = null; }
  if (data?.app !== 'kyozai-kenkyu' || data?.kind !== 'memos' || typeof data.memos !== 'object' || !data.memos) {
    throw new Error('メモのファイルではありません。「メモを書き出す」で作ったファイルを選んでください。');
  }
  let count = 0;
  for (const [key, m] of Object.entries(data.memos)) {
    if (!/^[a-z]+\/\d+\/[\w-]+$/.test(key)) continue;
    const cur = getMemo(key);
    if (typeof m?.unit === 'string' && m.unit.trim()) cur.unit = m.unit;
    for (const [n, v] of Object.entries(m?.lessons ?? {})) {
      if (typeof v === 'string' && /^\d+$/.test(n)) cur.lessons[n] = v;
    }
    save(key, cur);
    count++;
  }
  return count;
}
