// データから画面を組み立てる。
import { buildHash } from './router.js';
import { findGrade, loadUnit } from './data.js';
import { searchUnits } from './search.js';
import { evaluationRows, downloadCSV } from './export.js';
import { openGoals, openFigure, openEvaluation } from './modal.js';
import { getDone, setDone, unitKey, nextLesson } from './progress.js';

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
  const next = nextLesson(index);
  const nextBox = h('section', { class: 'next-lesson' },
    h('h2', { class: 'next-label' }, '次の授業'),
    !next ? h('p', { class: 'next-empty' }, '指導計画表で、終わった時間に印をつけると、ここに次の授業が出ます。')
      : next.finished ? h('p', { class: 'next-empty' }, '公開しているすべての時間が終わりました。')
        : h('a', { class: `subject-${next.subject}`, href: buildHash({ view: 'unit', subject: next.subject, grade: next.grade, unitId: next.unitId, lesson: next.n }) },
          h('span', { class: 'next-where' }, `${next.grade}年　${next.subjectName}　単元${next.no}`),
          h('span', { class: 'next-title' }, next.title),
          h('span', { class: 'next-n' }, `第${next.n}時`)));
  el.replaceChildren(
    nextBox,
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
  const tools = !currentUnitId && g?.status === 'ready' ? listTools(index, s, g, body) : [];
  el.replaceChildren(h(titleTag, { class: 'page-title' }, `${s?.name ?? ''}　単元一覧`), tabs, ...tools, ...body);
}

// 公開している単元の中身をまとめて読む（検索と書き出しで使う）
async function loadReadyUnits(subjectId, g) {
  const items = g.items.filter((i) => i.kind === 'unit' && i.status === 'ready');
  const units = await Promise.all(items.map((i) => loadUnit(subjectId, g.grade, i.id)));
  return units.map((u, k) => u && { ...u, no: items[k].no }).filter(Boolean);
}

function listTools(index, subject, g, listBody) {
  let units = null;
  const results = h('div', { class: 'search-results', 'aria-live': 'polite' });
  let timer;
  const run = async (q) => {
    if (!q.trim()) {
      results.replaceChildren();
      listBody.forEach((n) => { n.hidden = false; });
      return;
    }
    units ??= await loadReadyUnits(subject.id, g);
    const found = searchUnits(units, q);
    listBody.forEach((n) => { n.hidden = true; n.remove(); });
    results.replaceChildren(found.length
      ? h('ul', {}, found.map((r) => h('li', {},
        h('a', { href: buildHash({ view: 'unit', subject: subject.id, grade: g.grade, unitId: r.unitId, lesson: r.n }) },
          h('span', { class: 'sr-where' }, `単元${r.no}　${r.title}　第${r.n}時`),
          h('span', { class: 'sr-fields' }, r.fields.join('・')),
          h('span', { class: 'sr-snippet' }, r.snippet)))))
      : h('p', { class: 'search-empty' }, `「${q.trim()}」は見つかりませんでした。ほかの言葉でためしてください。`));
  };
  const input = h('input', { type: 'search', id: 'unit-search', class: 'search-input', placeholder: '例：石灰水、気体検知管',
    'aria-label': '単元の中を検索', oninput: (e) => {
      clearTimeout(timer);
      const q = e.target.value;
      timer = setTimeout(() => {
        run(q).then(() => { if (!q.trim()) results.after(...listBody); });
      }, 150);
    } });
  const exportAll = h('button', { type: 'button', class: 'button button-quiet', onclick: async () => {
    units ??= await loadReadyUnits(subject.id, g);
    downloadCSV(`${g.grade}年${subject.name}_評価規準.csv`, units.flatMap(evaluationRows));
  } }, '評価規準をまとめて書き出す');
  return [h('div', { class: 'list-tools' }, h('label', { class: 'search-label', for: 'unit-search' }, '検索'), input, exportAll), results];
}

function unitRow(item, subject, grade, currentUnitId) {
  const doneCount = item.kind === 'unit' ? getDone(unitKey(subject, grade, item.id)).length : 0;
  const meta = [doneCount ? h('span', { class: 'progress', title: '終わった時間' }, `${doneCount}/${item.hours}`) : null,
    h('span', { class: 'hours' }, `${item.hours}時間`), h('span', { class: 'month' }, item.month)];
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

export function renderUnit(el, unit, backHash, kicker = '', materialsHash = null, progressKey = null) {
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
        h('button', { type: 'button', class: 'button', onclick: () => window.print() }, '計画表を印刷'),
        h('button', { type: 'button', class: 'button button-quiet', onclick: () => {
          const [grade, subjectName] = kicker.split('　');
          downloadCSV(`${grade}${subjectName}_単元${unit.no ?? Number(unit.id)}_${unit.title}_評価規準.csv`, evaluationRows({ ...unit, no: unit.no ?? Number(unit.id) }));
        } }, '評価規準を書き出す'))),
    renderPrintPlan(unit, kicker),
    intro,
    h('section', { class: 'lessons plan' },
      h('h2', { class: 'section-title' }, '指導計画'),
      h('div', { class: 'plan-head', 'aria-hidden': 'true' },
        h('span', { class: 'col-done' }, '済'), h('span', { class: 'col-n' }, '時'), h('span', { class: 'col-main' }, '次・めあて'), h('span', { class: 'col-eval' }, '評価')),
      unit.lessons.map((l) => renderLesson(l, progressKey))),
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

function doneToggle(lesson, progressKey) {
  const btn = h('button', { type: 'button', class: 'done-toggle col-done', 'aria-label': `第${lesson.n}時を終わったにする` });
  const paint = (on) => {
    btn.setAttribute('aria-pressed', String(on));
    btn.closest?.('details')?.classList.toggle('is-done', on);
  };
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const on = btn.getAttribute('aria-pressed') !== 'true';
    if (progressKey) setDone(progressKey, lesson.n, on);
    paint(on);
  });
  queueMicrotask(() => paint(progressKey ? getDone(progressKey).includes(lesson.n) : false));
  return btn;
}

function renderLesson(lesson, progressKey = null) {
  return h('details', { class: 'lesson', 'data-n': String(lesson.n), id: `lesson-${lesson.n}` },
    h('summary', {},
      doneToggle(lesson, progressKey),
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
