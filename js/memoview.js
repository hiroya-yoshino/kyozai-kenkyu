// メモの一覧（すべての単元のメモを見て、直したり消したりする）
import { h, memoBox, confirmButton, PRIVACY_NOTE } from './render.js';
import { buildHash } from './router.js';
import { loadUnit } from './data.js';
import { listMemos, setLessonMemo, setUnitMemo, deleteAllMemosOf } from './memo.js';

export async function renderMemos(el, index, isCurrent = () => true) {
  const list = listMemos();
  const units = await Promise.all(list.map(({ key }) => {
    const [s, g, u] = key.split('/');
    return loadUnit(s, Number(g), u).catch(() => null);
  }));
  if (!isCurrent()) return;
  const sections = list.map(({ key, unit, lessons }, i) => {
    const [s, g, u] = key.split('/');
    const subject = index.subjects.find((x) => x.id === s);
    const item = subject?.grades?.find((x) => x.grade === Number(g))?.items.find((x) => x.id === u);
    const data = units[i];
    const title = `${g}年　${subject?.name ?? s}　${item ? `単元${item.no}　${item.title}` : u}`;
    const aimOf = (n) => data?.lessons?.find((l) => l.n === Number(n))?.aim ?? '';
    const boxes = [
      unit ? memoBox({ id: `m-${s}-${g}-${u}-unit`, label: '単元全体のメモ', value: unit, onSave: (t) => setUnitMemo(key, t) }) : null,
      ...Object.keys(lessons).sort((a, b) => a - b).map((n) => h('div', { class: 'memo-item' },
        memoBox({ id: `m-${s}-${g}-${u}-${n}`, label: `第${n}時のメモ`, value: lessons[n], onSave: (t) => setLessonMemo(key, n, t) }),
        aimOf(n) ? h('p', { class: 'memo-aim' }, h('a', { href: buildHash({ view: 'unit', subject: s, grade: Number(g), unitId: u, lesson: Number(n) }) }, `め　${aimOf(n)}`)) : null)),
    ];
    return h('section', { class: 'memo-unit' },
      h('h2', { class: 'section-title' }, title),
      h('div', { class: 'memo-unit-actions' },
        h('a', { class: 'button button-quiet', href: buildHash({ view: 'unit', subject: s, grade: Number(g), unitId: u }) }, '単元ページを開く'),
        confirmButton('この単元のメモをすべて消す', 'もう一度押すと、この単元のメモがすべて消えます', () => {
          deleteAllMemosOf(key);
          renderMemos(el, index, isCurrent);
        }, 'button button-quiet memo-delete')),
      boxes);
  });
  el.replaceChildren(h('article', { class: 'memos-page' },
    h('h1', { class: 'page-title' }, 'メモの一覧'),
    h('p', { class: 'memo-privacy' }, PRIVACY_NOTE),
    sections.length ? sections : h('p', { class: 'notice' }, 'まだメモはありません。単元ページの各時間や「単元全体のメモ」に書くと、ここに並びます。')));
}
