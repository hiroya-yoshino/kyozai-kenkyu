// 全単元の中身から言葉を探す。めあて・活動・まとめ・準備物・安全上の注意が対象。
const FIELDS = [
  ['めあて', (l) => [l.aim]],
  ['活動', (l) => l.activities ?? []],
  ['まとめ', (l) => [l.summary]],
  ['準備物', (l) => l.experiment?.materials ?? []],
  ['安全上の注意', (l) => l.experiment?.safety ?? []],
];

function snippetOf(text, q, width = 24) {
  const i = text.indexOf(q);
  const start = Math.max(0, i - width);
  const end = Math.min(text.length, i + q.length + width);
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}

export function searchUnits(units, query) {
  const q = query.trim();
  if (!q) return [];
  const lower = q.toLowerCase();
  const results = [];
  for (const u of units) {
    for (const l of u.lessons) {
      const fields = [];
      let snippet = '';
      for (const [name, get] of FIELDS) {
        const hit = get(l).find((t) => typeof t === 'string' && t.toLowerCase().includes(lower));
        if (hit) {
          fields.push(name);
          if (!snippet) snippet = snippetOf(hit, hit.slice(hit.toLowerCase().indexOf(lower), hit.toLowerCase().indexOf(lower) + q.length));
        }
      }
      if (fields.length) results.push({ unitId: u.id, no: u.no, title: u.title, n: l.n, fields, snippet });
    }
  }
  return results;
}
