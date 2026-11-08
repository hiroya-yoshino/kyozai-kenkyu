// 単元データと一覧データの検証。エラー文の配列を返す（空なら合格）。

const GOAL_KEYS = ['knowledge', 'thinking', 'attitude'];

export function validateUnit(unit, fileExists) {
  const errors = [];
  for (const key of ['id', 'title', 'hours', 'month']) {
    if (unit[key] === undefined || unit[key] === '') errors.push(`${key} がありません`);
  }
  const lessons = Array.isArray(unit.lessons) ? unit.lessons : [];
  if (lessons.length !== unit.hours) {
    errors.push(`lessons の数(${lessons.length})が hours(${unit.hours})と一致しません`);
  }
  for (const key of GOAL_KEYS) {
    if (!unit.goals || !unit.goals[key]) errors.push(`goals.${key} がありません`);
  }
  if (!unit.intro || !unit.intro.question) errors.push('intro.question がありません');
  lessons.forEach((lesson, i) => {
    const n = lesson.n ?? i + 1;
    for (const key of ['aim', 'summary']) {
      if (!lesson[key]) errors.push(`第${n}時の ${key} がありません`);
    }
    if (!Array.isArray(lesson.activities) || lesson.activities.length === 0) {
      errors.push(`第${n}時の activities がありません`);
    }
    const ex = lesson.experiment;
    if (!ex) return;
    if (!Array.isArray(ex.safety) || ex.safety.length === 0) {
      errors.push(`第${n}時の実験に safety がありません`);
    }
    if (ex.figure && !fileExists(ex.figure.src)) {
      errors.push(`図が見つかりません: ${ex.figure.src}`);
    }
  });
  return errors;
}

export function validateIndex(index) {
  const errors = [];
  if (!Array.isArray(index.subjects)) return ['subjects がありません'];
  for (const subject of index.subjects) {
    for (const key of ['id', 'name', 'status']) {
      if (!subject[key]) errors.push(`教科 ${subject.id ?? '?'} の ${key} がありません`);
    }
    for (const g of subject.grades ?? []) {
      const seen = new Set();
      for (const item of g.items ?? []) {
        for (const key of ['kind', 'title', 'hours', 'month', 'term']) {
          if (item[key] === undefined) errors.push(`${subject.id}/${g.grade} 「${item.title ?? '?'}」の ${key} がありません`);
        }
        if (item.kind !== 'unit') continue;
        if (!item.id || !item.status) errors.push(`${subject.id}/${g.grade} 「${item.title}」の id か status がありません`);
        if (seen.has(item.id)) errors.push(`${subject.id}/${g.grade} の単元 id が重複しています: ${item.id}`);
        seen.add(item.id);
      }
    }
  }
  return errors;
}
