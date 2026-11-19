// ハッシュ ⇔ 画面の状態。DOM に触れない純粋関数。
const ID = /^[a-z]+$/;
const GRADE = /^[1-6]$/;
const UNIT = /^\d{2}$/;
const DEFAULT_GRADE = 6;

export function parseHash(hash) {
  const parts = String(hash ?? '').replace(/^#\/?/, '').split('/').filter(Boolean);
  const [subject, grade, unitId] = parts;
  if (parts.length === 0) return { view: 'home' };
  if (parts.length > 4 || !ID.test(subject)) return { view: 'home' };
  if (parts.length === 1) return { view: 'list', subject, grade: DEFAULT_GRADE };
  if (!GRADE.test(grade)) return { view: 'home' };
  if (parts.length === 2) return { view: 'list', subject, grade: Number(grade) };
  if (!UNIT.test(unitId)) return { view: 'home' };
  if (parts.length === 4) {
    if (parts[3] === 'junbi') return { view: 'materials', subject, grade: Number(grade), unitId };
    if (/^[1-9]\d?$/.test(parts[3])) return { view: 'unit', subject, grade: Number(grade), unitId, lesson: Number(parts[3]) };
    return { view: 'home' };
  }
  return { view: 'unit', subject, grade: Number(grade), unitId };
}

export function buildHash(route) {
  if (route.view === 'list') return `#/${route.subject}/${route.grade}`;
  if (route.view === 'unit') return `#/${route.subject}/${route.grade}/${route.unitId}${route.lesson ? `/${route.lesson}` : ''}`;
  if (route.view === 'materials') return `#/${route.subject}/${route.grade}/${route.unitId}/junbi`;
  return '#/';
}
