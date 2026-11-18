// データから画面を組み立てる。
import { buildHash } from './router.js';
import { findGrade } from './data.js';
import { openGoals, openFigure, openEvaluation } from './modal.js';

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
    h('h1', { class: 'page-title home-title' }, '教科'),
    h('ul', { class: 'shelf' }, index.subjects.map((s) => {
      const inner = [h('span', { class: 'subject-name' }, s.name),
        h('span', { class: 'subject-sub' }, s.status === 'ready' ? '5・6年' : '準備中')];
      return h('li', { class: `subject-card subject-${s.id}${s.status === 'ready' ? '' : ' is-preparing'}` },
        s.status === 'ready' ? h('a', { href: buildHash({ view: 'list', subject: s.id, grade: 6 }) }, inner) : inner);
    })),
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

export function renderUnit(el, unit, backHash, kicker = '', materialsHash = null) {
  const intro = h('section', { class: 'intro', id: 'intro' },
    h('h2', { class: 'section-title' }, '導入のアイデア'),
    h('dl', {},
      h('dt', {}, '問い'), h('dd', { class: 'kyokasho' }, unit.intro.question),
      unit.intro.presentation ? [h('dt', {}, '提示の仕方'), h('dd', {}, unit.intro.presentation)] : null));

  el.replaceChildren(h('article', { class: 'unit' },
    h('a', { class: 'back-link', href: backHash }, '単元一覧にもどる'),
    h('header', { class: 'unit-header' },
      kicker ? h('p', { class: 'unit-kicker' }, kicker) : null,
      h('h1', { class: 'page-title' }, unit.title),
      h('p', { class: 'unit-meta' }, h('span', {}, `全${unit.hours}時間`), h('span', {}, unit.month)),
      h('div', { class: 'unit-actions' },
        h('button', { id: 'open-goals', type: 'button', class: 'button goals-button', onclick: () => openGoals(unit.goals) }, '単元の目標'),
        materialsHash ? h('a', { class: 'button', href: materialsHash }, '準備物') : null,
        h('button', { type: 'button', class: 'button', onclick: () => window.print() }, '計画表を印刷'))),
    renderPrintPlan(unit, kicker),
    intro,
    h('section', { class: 'lessons plan' },
      h('h2', { class: 'section-title' }, '指導計画'),
      h('div', { class: 'plan-head', 'aria-hidden': 'true' },
        h('span', { class: 'col-n' }, '時'), h('span', { class: 'col-main' }, '次・めあて'), h('span', { class: 'col-eval' }, '評価')),
      unit.lessons.map(renderLesson)),
    unit.sources?.length ? renderSources(unit.sources) : null));
}

const GOAL_LABELS = [['knowledge', '知識・技能'], ['thinking', '思考・判断・表現'], ['attitude', '主体的に学習に取り組む態度']];

// 印刷用の指導計画表（画面には出さず、印刷のときだけ表示する）
function renderPrintPlan(unit, kicker) {
  return h('section', { class: 'print-plan', 'aria-hidden': 'true' },
    h('p', { class: 'pp-title' }, `${kicker}　${unit.title}（全${unit.hours}時間・${unit.month}）`),
    h('dl', { class: 'pp-goals' }, GOAL_LABELS.flatMap(([k, label]) => [h('dt', {}, label), h('dd', {}, unit.goals?.[k] ?? '')])),
    h('table', { class: 'pp-table' },
      h('thead', {}, h('tr', {}, ['時', '次', 'めあて', 'まとめ', '評価'].map((t) => h('th', {}, t)))),
      h('tbody', {}, unit.lessons.map((l) => h('tr', {},
        h('td', { class: 'pp-n' }, String(l.n)), h('td', {}, l.stage ?? ''), h('td', {}, l.aim), h('td', {}, l.summary),
        h('td', { class: 'pp-eval' }, evalCodes(l.evaluation)))))));
}

function evalCodes(evaluation) {
  return evaluation ? evaluation.split('\n').map((l) => l.split('（')[0].trim()).join('・') : '';
}

function renderSources(sources) {
  return h('section', { class: 'sources' },
    h('h2', {}, '参考資料'),
    h('ul', {}, sources.map((src) => h('li', {},
      src.url ? h('a', { href: src.url, target: '_blank', rel: 'noopener' }, src.title) : src.title,
      src.note ? h('span', { class: 'source-note' }, `（${src.note}）`) : null))));
}

function renderLesson(lesson) {
  return h('details', { class: 'lesson', 'data-n': String(lesson.n), id: `lesson-${lesson.n}` },
    h('summary', {},
      h('span', { class: 'col-n' }, String(lesson.n)),
      h('span', { class: 'col-main' },
        lesson.stage ? h('span', { class: 'lesson-stage' }, lesson.stage) : null,
        h('span', { class: 'col-aim' }, lesson.aim),
        lesson.experiment ? h('span', { class: 'col-tag' }, '実験あり') : null),
      h('span', { class: 'col-eval' }, evalCodes(lesson.evaluation))),
    h('div', { class: 'lesson-body' },
      h('p', { class: 'aim-box kyokasho' }, h('span', { class: 'mark', title: 'めあて' }, 'め'), h('span', {}, lesson.aim)),
      h('h4', { class: 'body-label' }, '活動'),
      h('ul', { class: 'activities' }, lesson.activities.map((a) => h('li', {}, a))),
      h('p', { class: 'summary-box kyokasho' }, h('span', { class: 'mark', title: 'まとめ' }, 'ま'), h('span', {}, lesson.summary)),
      lesson.evaluation ? h('div', { class: 'lesson-actions' },
        h('button', { type: 'button', class: 'button eval-button', onclick: () => openEvaluation(lesson.n, lesson.evaluation) }, '評価を見る')) : null,
      lesson.figure ? h('div', { class: 'lesson-figure' }, renderFigure(lesson.figure)) : null,
      lesson.experiment ? renderExperiment(lesson.experiment) : null));
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
  const link = h('button', { type: 'button', class: 'figure-open', 'aria-label': `図を大きく表示：${fig.caption}`, onclick: () => openFigure(fig) }, img);
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
