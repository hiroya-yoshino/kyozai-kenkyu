// 準備物の画面：時間ごと／単元全体でまとめて表示し、チェックを端末に保存する。
import { h } from './render.js';
import { readJSON, writeJSON } from './store.js';

export function collectByLesson(unit) {
  return unit.lessons.filter((l) => l.experiment?.materials?.length)
    .map((l) => ({ n: l.n, aim: l.aim, items: l.experiment.materials }));
}

export function collectAll(unit) {
  const map = new Map();
  for (const g of collectByLesson(unit)) {
    for (const item of g.items) {
      if (!map.has(item)) map.set(item, []);
      map.get(item).push(g.n);
    }
  }
  return [...map].map(([item, ns]) => ({ item, ns }));
}

export function renderMaterials(el, unit, { kicker, unitHash, storeKey }) {
  let checked = new Set(readJSON(storeKey, []));
  let mode = readJSON(`${storeKey}:mode`, 'lesson');

  const save = () => writeJSON(storeKey, [...checked]);
  const box = (item, idSuffix) => {
    const id = `mat-${idSuffix}`;
    const input = h('input', { type: 'checkbox', id, checked: checked.has(item) || null,
      onchange: (e) => { e.target.checked ? checked.add(item) : checked.delete(item); save(); draw(); } });
    return h('li', {}, input, h('label', { for: id }, item));
  };

  const list = h('div', { class: 'mat-list' });
  function draw() {
    if (mode === 'all') {
      list.replaceChildren(h('ul', { class: 'mat-all checklist' }, collectAll(unit).map(({ item, ns }, i) => {
        const li = box(item, `a${i}`);
        li.append(h('span', { class: 'mat-when' }, `第${ns.join('・')}時`));
        return li;
      })));
    } else {
      list.replaceChildren(...collectByLesson(unit).map((g) => h('section', { class: 'mat-group', 'data-n': String(g.n) },
        h('h2', { class: 'mat-title' }, h('span', { class: 'mat-n' }, `第${g.n}時`), h('span', { class: 'mat-aim' }, g.aim)),
        h('ul', { class: 'checklist' }, g.items.map((item, i) => box(item, `${g.n}-${i}`))))));
    }
  }

  const radio = (value, label) => h('label', { class: 'mat-mode' },
    h('input', { type: 'radio', name: 'mat-mode', value, checked: mode === value || null,
      onchange: () => { mode = value; writeJSON(`${storeKey}:mode`, mode); draw(); } }), label);

  draw();
  el.replaceChildren(h('article', { class: 'materials-page' },
    h('a', { class: 'back-link', href: unitHash }, '単元のページにもどる'),
    h('header', { class: 'unit-header mat-header' },
      h('p', { class: 'unit-kicker' }, `${kicker}　${unit.title}`),
      h('h1', { class: 'page-title' }, '準備物'),
      h('p', { class: 'unit-meta' }, h('span', {}, '準備ができたら印をつける'))),
    h('div', { class: 'mat-toolbar' },
      h('div', { class: 'mat-modes', role: 'radiogroup', 'aria-label': '表示のしかた' },
        radio('lesson', '時間ごと'), radio('all', '単元全体でまとめる')),
      h('div', { class: 'mat-actions' },
        h('button', { type: 'button', class: 'button', onclick: () => window.print() }, '印刷'),
        h('button', { type: 'button', class: 'button button-quiet', onclick: () => { checked = new Set(); save(); draw(); } }, '印をすべて外す'))),
    list));
}
