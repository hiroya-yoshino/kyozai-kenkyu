// データから画面を組み立てる。
import { buildHash } from './router.js';
import { findGrade } from './data.js';

const TERMS = { 1: '1学期', 2: '2学期', 3: '3学期' };

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}

export function renderHome(el, index) {
  el.replaceChildren(
    h('h1', { class: 'page-title' }, '教科をえらぶ'),
    h('ul', { class: 'subject-grid' }, index.subjects.map((s) =>
      h('li', { class: `subject-card subject-${s.id}${s.status === 'ready' ? '' : ' is-preparing'}` },
        s.status === 'ready'
          ? h('a', { href: buildHash({ view: 'list', subject: s.id, grade: 6 }) }, h('span', { class: 'subject-name' }, s.name))
          : [h('span', { class: 'subject-name' }, s.name), h('span', { class: 'badge' }, '準備中')]))),
  );
}

export function renderUnitList(el, index, subject, grade, currentUnitId = null) {
  const s = index.subjects.find((x) => x.id === subject);
  const tabs = h('div', { class: 'grade-tabs', role: 'tablist' }, (s?.grades ?? []).map((g) =>
    h('a', { role: 'tab', class: 'grade-tab', href: buildHash({ view: 'list', subject, grade: g.grade }),
      'aria-selected': String(g.grade === grade) }, `${g.grade}年`)));
  const g = findGrade(index, subject, grade);
  const body = !g || g.status !== 'ready'
    ? [h('p', { class: 'notice' }, 'この学年は準備中です')]
    : [1, 2, 3].map((term) => {
      const items = g.items.filter((i) => i.term === term);
      if (!items.length) return null;
      return h('section', { class: 'term' },
        h('h2', { class: 'term-title' }, TERMS[term]),
        h('ol', { class: 'unit-list' }, items.map((i) => unitRow(i, subject, grade, currentUnitId))));
    }).filter(Boolean);
  el.replaceChildren(h('h1', { class: 'page-title' }, `${s?.name ?? ''}　単元一覧`), tabs, ...body);
}

function unitRow(item, subject, grade, currentUnitId) {
  const meta = [h('span', { class: 'hours' }, `${item.hours}時間`), h('span', { class: 'month' }, item.month)];
  if (item.kind === 'event') {
    return h('li', { class: 'event-row' }, h('span', { class: 'unit-title' }, item.title), h('span', { class: 'meta' }, meta));
  }
  return h('li', { class: `unit-row${item.status === 'ready' ? '' : ' is-preparing'}` },
    h('a', { href: buildHash({ view: 'unit', subject, grade, unitId: item.id }),
      'aria-current': item.id === currentUnitId ? 'page' : null },
      h('span', { class: 'unit-no' }, String(item.no)),
      h('span', { class: 'unit-title' }, item.title),
      h('span', { class: 'meta' }, meta, item.status === 'ready' ? null : h('span', { class: 'badge' }, '準備中'))));
}

export function renderNotReady(el, backHash) {
  el.replaceChildren(h('div', { class: 'not-ready' },
    h('p', {}, 'この単元はまだ準備中です'),
    h('a', { class: 'button', href: backHash }, '単元一覧へ戻る')));
}
