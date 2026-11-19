// 授業の進み具合（終わった時間）の記録。端末ごとに保存する。
import { readJSON, writeJSON } from './store.js';

const PREFIX = 'kyozai:done:';
export const unitKey = (subject, grade, unitId) => `${subject}/${grade}/${unitId}`;

export function getDone(key) {
  return readJSON(PREFIX + key, []);
}

export function setDone(key, n, done) {
  const set = new Set(getDone(key));
  if (done) set.add(n); else set.delete(n);
  writeJSON(PREFIX + key, [...set].sort((a, b) => a - b));
}

// 公開している単元の、すべての時間を年間の順に並べる
export function lessonOrder(index) {
  const out = [];
  for (const s of index.subjects) {
    if (s.status !== 'ready') continue;
    for (const g of s.grades ?? []) {
      if (g.status !== 'ready') continue;
      for (const item of g.items) {
        if (item.kind !== 'unit' || item.status !== 'ready') continue;
        for (let n = 1; n <= item.hours; n++) {
          out.push({ subject: s.id, subjectName: s.name, grade: g.grade, unitId: item.id, no: item.no, title: item.title, n });
        }
      }
    }
  }
  return out;
}

// 最後に終わった時間の次を返す。記録がなければ null、全部終わっていれば { finished: true }
export function nextLesson(index, doneOf = getDone) {
  const order = lessonOrder(index);
  let last = -1;
  order.forEach((l, i) => {
    if (doneOf(unitKey(l.subject, l.grade, l.unitId)).includes(l.n)) last = i;
  });
  if (last === -1) return null;
  return order[last + 1] ?? { finished: true };
}
