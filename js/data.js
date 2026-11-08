// データの読み込み。GitHub Pages のサブパスで動くよう、すべて相対パス。
function dataBase() {
  return new URLSearchParams(location.search).has('fixtures') ? 'tests/fixtures/' : 'data/';
}

let indexPromise;
export function loadIndex() {
  indexPromise ??= fetch('data/index.json').then((r) => {
    if (!r.ok) throw new Error(`index.json: ${r.status}`);
    return r.json();
  }).catch((err) => {
    indexPromise = undefined; // 次の読み込みでやり直せるように
    throw err;
  });
  return indexPromise;
}

export async function loadUnit(subject, grade, unitId) {
  try {
    const r = await fetch(`${dataBase()}${subject}/${grade}/${unitId}.json`);
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

export function findItem(index, subject, grade, unitId) {
  const g = findGrade(index, subject, grade);
  return g?.items.find((i) => i.kind === 'unit' && i.id === unitId) ?? null;
}

export function findGrade(index, subject, grade) {
  return index.subjects.find((s) => s.id === subject)?.grades.find((g) => g.grade === grade) ?? null;
}
