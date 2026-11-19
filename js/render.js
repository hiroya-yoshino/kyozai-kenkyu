// データから画面を組み立てる。
import { buildHash } from './router.js';
import { findGrade, loadUnit, loadSearchIndex, hasPage, itemLabel } from './data.js';
import { searchIndex } from './search.js';
import { evaluationRows, downloadCSV } from './export.js';
import { getMemo, setLessonMemo, setUnitMemo } from './memo.js';
import { hasKey, listDrafts, importDraft } from './draft.js';
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
          h('span', { class: 'next-where' }, `${next.grade}年　${next.subjectName}${next.no ? `　単元${next.no}` : ''}`),
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
  const drafts = currentUnitId ? null : draftsSection(subject, grade);
  el.replaceChildren(...[h(titleTag, { class: 'page-title' }, `${s?.name ?? ''}　単元一覧`), tabs, ...tools, ...body, drafts].filter(Boolean));
}

// この端末の下書きと「AIで下書きを作る」（APIキーがある端末だけ）
function draftsSection(subject, grade) {
  const list = listDrafts(subject, grade);
  const error = h('p', { class: 'import-error', role: 'alert' });
  const file = h('input', { type: 'file', id: `import-${subject}-${grade}`, accept: '.json,application/json', class: 'visually-hidden',
    onchange: async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      try {
        const id = importDraft(await f.text(), subject, grade);
        location.hash = buildHash({ view: 'draft', subject, grade, draftId: id });
      } catch (err) {
        error.textContent = err.message;
        e.target.value = '';
      }
    } });
  const importer = h('div', { class: 'importer' },
    file, h('label', { for: file.id, class: 'button button-quiet' }, '下書きのファイルを読み込む'), error);
  if (!list.length && !hasKey()) return h('section', { class: 'drafts drafts-quiet' }, importer);
  return h('section', { class: 'term drafts' },
    h('h2', { class: 'term-title' }, '下書き（この端末だけ）'),
    list.length ? h('ol', { class: 'unit-list' }, list.map((d) => h('li', { class: 'unit-row is-draft' },
      h('a', { href: buildHash({ view: 'draft', subject, grade, draftId: d.unit.id }) },
        h('span', { class: 'unit-no' }, '下'),
        h('span', { class: 'unit-title' }, d.unit.title),
        h('span', { class: 'meta' }, h('span', {}, `${d.unit.hours}時間`), h('span', { class: 'badge' }, '下書き')))))) : null,
    h('div', { class: 'form-actions' },
      hasKey() ? h('a', { class: 'button', href: buildHash({ view: 'draftNew', subject, grade }) }, 'AIで下書きを作る') : null,
      importer));
}

// 公開している単元の中身をまとめて読む（検索と書き出しで使う）
async function loadReadyUnits(subjectId, g) {
  const items = g.items.filter(hasPage);
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
    let found;
    try {
      const idx = await loadSearchIndex();
      found = searchIndex(idx, q, (e) => e.s === subject.id && e.g === g.grade);
    } catch {
      results.replaceChildren(h('p', { class: 'search-empty' }, '検索の準備ができませんでした。通信を確かめて、もう一度入れてください。'));
      return;
    }
    listBody.forEach((n) => { n.hidden = true; n.remove(); });
    results.replaceChildren(found.length
      ? h('ul', {}, found.map((r) => h('li', {},
        h('a', { href: buildHash({ view: 'unit', subject: subject.id, grade: g.grade, unitId: r.unitId, lesson: r.n }) },
          h('span', { class: 'sr-where' }, `${itemLabel(r.no, r.title)}　第${r.n}時`),
          h('span', { class: 'sr-fields' }, r.fields.join('・')),
          h('span', { class: 'sr-snippet' }, r.snippet)))))
      : h('p', { class: 'search-empty' }, `「${q.trim()}」は見つかりませんでした。ほかの言葉でためしてください。`));
  };
  const input = h('input', { type: 'search', id: 'unit-search', class: 'search-input', placeholder: '例：石灰水、せっかいすい、ヨウ素液',
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
  const doneCount = hasPage(item) ? getDone(unitKey(subject, grade, item.id)).length : 0;
  const meta = [doneCount ? h('span', { class: 'progress', title: '終わった時間' }, `${doneCount}/${item.hours}`) : null,
    h('span', { class: 'hours' }, `${item.hours}時間`), h('span', { class: 'month' }, item.month)];
  if (item.kind === 'event') {
    if (hasPage(item)) {
      return h('li', { class: 'event-row has-page' },
        h('a', { href: buildHash({ view: 'unit', subject, grade, unitId: item.id }), 'aria-current': item.id === currentUnitId ? 'page' : null },
          h('span', { class: 'unit-title' }, item.title), h('span', { class: 'meta' }, meta)));
    }
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

export function renderUnit(el, unit, backHash, kicker = '', materialsHash = null, progressKey = null, resolveUnit = () => null) {
  const intro = h('section', { class: 'intro', id: 'intro' },
    h('h2', { class: 'section-title' }, '導入のアイデア'),
    h('dl', {},
      h('dt', {}, '問い'), h('dd', { class: 'kyokasho' }, unit.intro.question),
      unit.intro.presentation ? [h('dt', {}, '提示の仕方'), h('dd', {}, unit.intro.presentation)] : null));

  // 自分のメモは、進み具合と同じく公開している単元だけにつける（下書きにはつけない）
  const memoKey = progressKey;
  const printPlan = h('div', { class: 'print-plan-wrap' });
  const refreshPrint = () => printPlan.replaceChildren(renderPrintPlan(unit, kicker, memoKey ? getMemo(memoKey) : null));
  refreshPrint();

  el.replaceChildren(h('article', { class: 'unit' },
    h('a', { class: 'back-link', href: backHash }, '単元一覧にもどる'),
    h('header', { class: 'unit-header' },
      kicker ? h('p', { class: 'unit-kicker' }, kicker) : null,
      h('h1', { class: 'page-title' }, unit.title),
      h('p', { class: 'unit-meta' }, h('span', {}, `全${unit.hours}時間`), h('span', {}, unit.month)),
      h('div', { class: 'unit-actions' },
        h('button', { id: 'open-goals', type: 'button', class: 'button goals-button', onclick: () => openGoals(unit.goals) }, '単元の目標'),
        materialsHash && unit.lessons.some((l) => l.experiment) ? h('a', { class: 'button', href: materialsHash }, '準備物') : null,
        h('button', { type: 'button', class: 'button', onclick: () => window.print() }, '計画表を印刷'),
        h('button', { type: 'button', class: 'button button-quiet', onclick: () => {
          const [grade, subjectName] = kicker.split('　');
          const label = unit.no ? `単元${unit.no}_` : '';
          downloadCSV(`${grade}${subjectName}_${label}${unit.title}_評価規準.csv`, evaluationRows({ ...unit, no: unit.no ?? '' }));
        } }, '評価規準を書き出す'))),
    printPlan,
    intro,
    memoKey ? renderUnitMemo(memoKey, refreshPrint) : null,
    h('section', { class: 'lessons plan' },
      h('h2', { class: 'section-title' }, '指導計画'),
      h('div', { class: 'plan-head', 'aria-hidden': 'true' },
        h('span', { class: 'col-done' }, '済'), h('span', { class: 'col-n' }, '時'), h('span', { class: 'col-main' }, '次・めあて'), h('span', { class: 'col-eval' }, '評価')),
      unit.lessons.map((l) => renderLesson(l, progressKey, memoKey, refreshPrint))),
    unit.related ? renderRelated(unit.related, resolveUnit) : null,
    unit.sources?.length ? renderSources(unit.sources) : null));
}

// 関連する学習：前の学年の単元（アプリにあればリンク）と中学校の内容
function renderRelated(related, resolveUnit) {
  const before = (related.before ?? []).map((r) => {
    const href = resolveUnit(r.grade, r.unit);
    return h('li', {},
      h('span', { class: 'rel-grade' }, `${r.grade}年`),
      href ? h('a', { href }, r.unit) : h('span', { class: 'rel-unit' }, r.unit),
      h('span', { class: 'rel-curriculum' }, `（${r.curriculum}）`),
      href ? null : h('span', { class: 'badge' }, '準備中'));
  });
  const after = related.after ?? [];
  if (!before.length && !after.length) return null;
  return h('section', { class: 'related' },
    h('h2', { class: 'section-title' }, '関連する学習'),
    before.length ? [h('h3', { class: 'rel-label' }, '前の学年'), h('ul', { class: 'rel-list' }, before)] : null,
    after.length ? [h('h3', { class: 'rel-label' }, '中学校'), h('ul', { class: 'rel-list rel-after' }, after.map((t) => h('li', {}, t)))] : null);
}

const GOAL_LABELS = [['knowledge', '知識・技能'], ['thinking', '思考・判断・表現'], ['attitude', '主体的に学習に取り組む態度']];

// 印刷用の指導計画表（画面には出さず、印刷のときだけ表示する）
function renderPrintPlan(unit, kicker, memo = null) {
  const withMemo = Boolean(memo && Object.keys(memo.lessons).length);
  return h('section', { class: 'print-plan', 'aria-hidden': 'true' },
    h('p', { class: 'pp-title' }, `${kicker}　${unit.title}（全${unit.hours}時間・${unit.month}）`),
    h('dl', { class: 'pp-goals' }, GOAL_LABELS.flatMap(([k, label]) => [h('dt', {}, label), h('dd', {}, unit.goals?.[k] ?? '')])),
    memo?.unit ? h('div', { class: 'pp-unit-memo' }, h('span', { class: 'pp-memo-label' }, '単元のメモ'), h('p', {}, memo.unit)) : null,
    h('table', { class: `pp-table${withMemo ? ' has-memo' : ''}` },
      h('thead', {}, h('tr', {}, ['時', '次', 'めあて', 'まとめ', '評価', withMemo ? 'メモ' : null].filter(Boolean).map((t) => h('th', {}, t)))),
      h('tbody', {}, unit.lessons.map((l) => h('tr', {},
        h('td', { class: 'pp-n' }, String(l.n)), h('td', {}, l.stage ?? ''), h('td', {}, l.aim), h('td', {}, l.summary),
        h('td', { class: 'pp-eval' }, evalCodes(l.evaluation)),
        withMemo ? h('td', { class: 'pp-memo' }, memo.lessons[l.n] ?? '') : null)))));
}

// 押すと「もう一度押すと消えます」に変わり、続けて押したときだけ消すボタン
export function confirmButton(label, confirmLabel, onConfirm, cls = 'button button-quiet memo-delete') {
  let armed = false;
  let timer;
  const btn = h('button', { type: 'button', class: cls, onclick: () => {
    if (!armed) {
      armed = true;
      btn.textContent = confirmLabel;
      btn.classList.add('is-armed');
      timer = setTimeout(() => { armed = false; btn.textContent = label; btn.classList.remove('is-armed'); }, 4000);
      return;
    }
    clearTimeout(timer);
    armed = false;
    btn.textContent = label;
    btn.classList.remove('is-armed');
    onConfirm();
  } }, label);
  return btn;
}

export const PRIVACY_NOTE = '児童の氏名など、個人情報は書かないでください。';

// メモの入力欄。入れるたびにすぐ端末に保存する（すぐ閉じても消えないように）
export function memoBox({ id, label, value, onSave, rows = 3, placeholder }) {
  const status = h('span', { class: 'memo-status', 'aria-live': 'polite' });
  let timer;
  const area = h('textarea', { id, class: 'memo-input', rows: String(rows), placeholder,
    oninput: (e) => {
      onSave(e.target.value);
      status.textContent = '';
      clearTimeout(timer);
      timer = setTimeout(() => { status.textContent = '保存しました'; }, 400);
    } });
  area.value = value;
  const del = confirmButton('消す', 'もう一度押すと消えます', () => {
    area.value = '';
    onSave('');
    status.textContent = '消しました';
  });
  del.setAttribute('aria-label', `${label}を消す`);
  return h('div', { class: 'memo' },
    h('div', { class: 'memo-head' }, h('label', { for: id, class: 'memo-label' }, label), status, del),
    area);
}

function renderUnitMemo(memoKey, refreshPrint) {
  return h('section', { class: 'unit-memo' },
    memoBox({ id: 'memo-unit', label: '単元全体のメモ', value: getMemo(memoKey).unit, rows: 3,
      placeholder: '単元を通しての工夫、去年のふりかえり、準備のこつなど',
      onSave: (t) => { setUnitMemo(memoKey, t); refreshPrint(); } }),
    h('p', { class: 'memo-privacy' }, PRIVACY_NOTE));
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

function renderLesson(lesson, progressKey = null, memoKey = null, refreshPrint = () => {}) {
  const memoText = memoKey ? (getMemo(memoKey).lessons[lesson.n] ?? '') : '';
  const memoMark = h('span', { class: 'col-memo', title: 'メモあり' }, 'メモ');
  const paintMark = (text) => { memoMark.hidden = !text.trim(); if (memoMark.hidden) memoMark.remove(); else aimCol.append(memoMark); };
  const aimCol = h('span', { class: 'col-main' },
    lesson.stage ? h('span', { class: 'lesson-stage' }, lesson.stage) : null,
    h('span', { class: 'col-aim' }, lesson.aim),
    lesson.experiment ? h('span', { class: 'col-tag' }, '実験あり') : null);
  paintMark(memoText);
  return h('details', { class: 'lesson', 'data-n': String(lesson.n), id: `lesson-${lesson.n}` },
    h('summary', {},
      doneToggle(lesson, progressKey),
      h('span', { class: 'col-n' }, String(lesson.n)),
      aimCol,
      h('span', { class: 'col-eval' }, evalCodes(lesson.evaluation))),
    h('div', { class: 'lesson-body' },
      h('p', { class: 'aim-box kyokasho' }, h('span', { class: 'mark', title: 'めあて' }, 'め'), h('span', {}, lesson.aim)),
      h('h4', { class: 'body-label' }, '活動'),
      h('ul', { class: 'activities' }, lesson.activities.map((a) => h('li', {}, a))),
      h('p', { class: 'summary-box kyokasho' }, h('span', { class: 'mark', title: 'まとめ' }, 'ま'), h('span', {}, lesson.summary)),
      lesson.evaluation ? h('div', { class: 'lesson-actions' },
        h('button', { type: 'button', class: 'button eval-button', onclick: () => openEvaluation(lesson.n, lesson.evaluation) }, '評価を見る')) : null,
      memoKey ? memoBox({ id: `memo-${lesson.n}`, label: `第${lesson.n}時のメモ`, value: memoText,
        placeholder: '発問、予想される子どもの反応、板書の工夫、ふりかえりなど（個人情報は書かない）',
        onSave: (t) => { setLessonMemo(memoKey, lesson.n, t); paintMark(t); refreshPrint(); } }) : null,
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
