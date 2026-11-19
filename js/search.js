// 検索：ひらがな・カタカナ・漢字のどれで入れても見つかるように、よみ（ひらがな）でも比べる。
// 索引（data/search-index.json）は tools/build-search.mjs が作る。

const toHira = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

// 全角半角・カタカナ・大文字小文字・空白のちがいをならす
export function normalize(s) {
  return toHira(String(s ?? '').normalize('NFKC').toLowerCase()).replace(/\s+/g, '');
}

// 検索語の漢字の部分を、索引のことば（lexicon）でよみにする（長いことばから優先）
const keysCache = new WeakMap();
export function queryYomi(q, lexicon) {
  let keys = keysCache.get(lexicon);
  if (!keys) {
    keys = Object.keys(lexicon).sort((a, b) => b.length - a.length);
    keysCache.set(lexicon, keys);
  }
  let rest = String(q).normalize('NFKC');
  let out = '';
  while (rest) {
    const k = keys.find((key) => rest.startsWith(key));
    if (k) {
      out += lexicon[k];
      rest = rest.slice(k.length);
    } else {
      out += rest[0];
      rest = rest.slice(1);
    }
  }
  return normalize(out);
}

function snippetOf(text, qn) {
  const nt = normalize(text);
  const i = nt.indexOf(qn);
  if (i < 0 || nt.length !== text.replace(/\s+/g, '').length) return text.length > 60 ? `${text.slice(0, 60)}…` : text;
  const start = Math.max(0, i - 24);
  const end = Math.min(text.length, i + qn.length + 24);
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}

export function searchIndex(index, query, filter = () => true) {
  const qn = normalize(query);
  if (!qn) return [];
  const qy = queryYomi(query, index.lexicon);
  const byLesson = new Map();
  for (const e of index.entries) {
    if (!filter(e)) continue;
    const hit = normalize(e.t).includes(qn) || e.y.includes(qn) || (qy && e.y.includes(qy));
    if (!hit) continue;
    const key = `${e.s}/${e.g}/${e.u}/${e.n}`;
    if (!byLesson.has(key)) {
      byLesson.set(key, { subject: e.s, grade: e.g, unitId: e.u, no: e.no, title: e.title, n: e.n, fields: [], snippet: snippetOf(e.t, qn) });
    }
    const r = byLesson.get(key);
    if (!r.fields.includes(e.f)) r.fields.push(e.f);
  }
  return [...byLesson.values()];
}
