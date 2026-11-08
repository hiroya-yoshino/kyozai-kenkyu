// データから画面を組み立てる。
import { buildHash } from './router.js';
import { findGrade } from './data.js';
import { openGoals } from './modal.js';

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
  const titleTag = currentUnitId ? 'h2' : 'h1';
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
  el.replaceChildren(h(titleTag, { class: 'page-title' }, `${s?.name ?? ''}　単元一覧`), tabs, ...body);
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

export function renderUnit(el, unit, backHash) {
  const lessons = unit.lessons.map(renderLesson);
  const tocLink = (label, target) => h('a', { href: location.hash, onclick: (e) => {
    e.preventDefault();
    if (target.tagName === 'DETAILS') target.open = true;
    target.scrollIntoView({ block: 'start' });
  } }, label);

  const intro = h('section', { class: 'intro', id: 'intro' },
    h('h2', {}, '導入のアイデア'),
    h('dl', {},
      h('dt', {}, '問い'), h('dd', {}, unit.intro.question),
      unit.intro.presentation ? [h('dt', {}, '提示の仕方'), h('dd', {}, unit.intro.presentation)] : null));

  el.replaceChildren(h('article', { class: 'unit' },
    h('a', { class: 'back-link', href: backHash }, '← 単元一覧'),
    h('header', { class: 'unit-header' },
      h('h1', { class: 'page-title' }, unit.title),
      h('p', { class: 'unit-meta' }, h('span', {}, `${unit.hours}時間`), h('span', {}, unit.month)),
      h('button', { id: 'open-goals', type: 'button', class: 'button goals-button', onclick: () => openGoals(unit.goals) }, '🎯 目標')),
    h('nav', { class: 'toc', 'aria-label': '目次' },
      tocLink('導入', intro), unit.lessons.map((l, i) => tocLink(`第${l.n}時`, lessons[i]))),
    intro,
    h('section', { class: 'lessons' }, h('h2', {}, '毎時間の流れ'), lessons)));
}

function renderLesson(lesson) {
  return h('details', { class: 'lesson', 'data-n': String(lesson.n), id: `lesson-${lesson.n}` },
    h('summary', {}, h('span', { class: 'lesson-no' }, `第${lesson.n}時`), h('span', { class: 'lesson-aim' }, lesson.aim),
      lesson.experiment ? h('span', { class: 'badge badge-ex' }, '実験') : null),
    h('dl', { class: 'lesson-body' },
      h('dt', {}, 'めあて'), h('dd', {}, lesson.aim),
      h('dt', {}, '活動'), h('dd', {}, h('ul', {}, lesson.activities.map((a) => h('li', {}, a)))),
      h('dt', {}, 'まとめ'), h('dd', {}, lesson.summary)),
    lesson.experiment ? renderExperiment(lesson.experiment) : null);
}

function renderExperiment(ex) {
  return h('section', { class: 'experiment' },
    h('h3', {}, '実験'),
    ex.figure ? renderFigure(ex.figure) : null,
    h('h4', {}, '準備物'), h('ul', { class: 'materials' }, ex.materials.map((m) => h('li', {}, m))),
    h('h4', {}, '手順'), h('ol', { class: 'steps' }, ex.steps.map((s) => h('li', {}, s))),
    h('h4', { class: 'safety-title' }, '安全上の注意'), h('ul', { class: 'safety' }, ex.safety.map((s) => h('li', {}, s))));
}

function renderFigure(fig) {
  const img = h('img', { src: fig.src, alt: fig.caption, loading: 'lazy' });
  const link = h('a', { href: fig.src, target: '_blank', rel: 'noopener', title: '図を大きく開く' }, img);
  const hint = h('p', { class: 'figure-hint' }, '図を押すと大きく開きます');
  img.addEventListener('error', () => { link.remove(); hint.remove(); });
  return h('figure', { class: 'figure' }, link, h('figcaption', {}, fig.caption), hint);
}

export function renderLoadError(el, onRetry) {
  el.replaceChildren(h('div', { class: 'not-ready' },
    h('h1', { class: 'page-title' }, 'データを読み込めませんでした'),
    h('p', {}, '通信の状態を確かめてから、もう一度読み込んでください。'),
    h('button', { type: 'button', class: 'button', onclick: onRetry }, '再読み込み')));
}
