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
  return [];
}
