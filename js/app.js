// 起動とハッシュ変更の処理。
import { parseHash, buildHash } from './router.js';
import { loadIndex, loadUnit, findItem } from './data.js';
import { renderHome, renderUnitList, renderNotReady, renderUnit, renderLoadError } from './render.js';
import { renderMaterials } from './materials.js';
import { unitKey } from './progress.js';
import { renderSettings, renderDraftForm, renderDraftView } from './draftview.js';
import { renderMemos } from './memoview.js';
import { startSync, syncNow, connect, syncStatus, SYNC_STATUS, MEMOS_PULLED } from './sync.js';

const main = document.getElementById('app');
const side = document.getElementById('side');

let seq = 0; // 最後に始めた画面切り替えだけを描画する

async function route() {
  const token = ++seq;
  const r = parseHash(location.hash);
  let index;
  try {
    index = await loadIndex();
  } catch {
    if (token === seq) renderLoadError(main, route);
    return;
  }
  if (token !== seq) return;
  const known = ['home', 'settings', 'memos'].includes(r.view) || index.subjects.some((s) => s.id === r.subject && s.status === 'ready');
  if (!known) { location.replace(buildHash({ view: 'home' })); return; }

  if (['home', 'settings', 'memos'].includes(r.view)) delete document.body.dataset.subject;
  else document.body.dataset.subject = r.subject;
  side.hidden = true;
  side.replaceChildren();
  const subjectName = index.subjects.find((s) => s.id === r.subject)?.name ?? '';
  if (r.view === 'home') renderHome(main, index);
  else if (r.view === 'settings') renderSettings(main);
  else if (r.view === 'memos') await renderMemos(main, index, () => token === seq);
  else if (r.view === 'draftNew') {
    const items = index.subjects.find((s) => s.id === r.subject)?.grades.find((g) => g.grade === r.grade)?.items ?? [];
    renderDraftForm(main, { subject: r.subject, subjectName, grade: r.grade, items });
  }
  else if (r.view === 'draft') renderDraftView(main, { subject: r.subject, subjectName, grade: r.grade, draftId: r.draftId });
  else if (r.view === 'list') renderUnitList(main, index, r.subject, r.grade);
  else await showUnit(r, index, token); // 単元ページと準備物の画面
  if (token !== seq) return;
  document.title = `${main.querySelector('h1')?.textContent ?? ''}｜教材研究ノート`;
}

async function showUnit(r, index, token) {
  const back = buildHash({ view: 'list', subject: r.subject, grade: r.grade });
  const item = findItem(index, r.subject, r.grade, r.unitId);
  const fixtures = new URLSearchParams(location.search).has('fixtures');
  const unit = (item?.status === 'ready' || fixtures) ? await loadUnit(r.subject, r.grade, r.unitId) : null;
  if (token !== seq) return;
  if (!unit) { renderNotReady(main, back); return; }
  if (r.view === 'unit') {
    renderUnitList(side, index, r.subject, r.grade, r.unitId);
    side.hidden = false;
  }
  const subjectName = index.subjects.find((s) => s.id === r.subject)?.name ?? '';
  const kicker = `${r.grade}年　${subjectName}`;
  if (r.view === 'materials') {
    renderMaterials(main, unit, { kicker, unitHash: buildHash({ ...r, view: 'unit', lesson: undefined }),
      storeKey: `kyozai:junbi:${r.subject}/${r.grade}/${r.unitId}` });
    window.scrollTo(0, 0);
    return;
  }
  // 前の学年の単元名から、アプリにある（公開している）単元を探す
  const resolveUnit = (grade, name) => {
    const g = index.subjects.find((s) => s.id === r.subject)?.grades.find((x) => x.grade === grade);
    const it = g?.status === 'ready' && g.items.find((i) => i.kind === 'unit' && i.status === 'ready' && i.title === name);
    return it ? buildHash({ view: 'unit', subject: r.subject, grade, unitId: it.id }) : null;
  };
  // 単元の番号は一覧（index.json）にあるので、ここで渡す（番号のない時間は番号なし）
  renderUnit(main, { ...unit, no: item ? item.no : Number(unit.id) }, back, kicker, buildHash({ ...r, view: 'materials', lesson: undefined }),
    unitKey(r.subject, r.grade, r.unitId), resolveUnit);
  const target = r.lesson && main.querySelector(`details.lesson[data-n="${r.lesson}"]`);
  if (target) {
    target.open = true;
    target.scrollIntoView({ block: 'start' });
  } else {
    window.scrollTo(0, 0);
  }
}

window.addEventListener('hashchange', route);
route();

// Googleドライブとの同期
const chip = document.getElementById('sync-chip');
const CHIP = {
  syncing: ['ドライブに保存中…', 'is-busy'],
  synced: ['ドライブに保存済み', 'is-ok'],
  'needs-auth': ['ドライブにつなぎ直す', 'is-warn'],
  'ready-to-connect': ['もう一度押してつなぐ', 'is-warn'],
  loading: ['準備中…', 'is-busy'],
  offline: ['オフライン（あとで保存）', 'is-wait'],
  error: ['ドライブに保存できませんでした', 'is-warn'],
};
function paintChip(s) {
  const c = CHIP[s.status];
  chip.hidden = !c;
  if (!c) return;
  chip.textContent = c[0];
  chip.className = `sync-chip ${c[1]}`;
  chip.title = s.status === 'synced' ? `最後に保存：${new Date(s.at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}` : '';
}
chip.addEventListener('click', () => {
  const s = syncStatus().status;
  if (s === 'needs-auth' || s === 'ready-to-connect') connect();
  else syncNow();
});
addEventListener(SYNC_STATUS, (e) => paintChip(e.detail));
// ほかの端末のメモを取りこんだら、書いている最中でなければ画面を描き直す
addEventListener(MEMOS_PULLED, () => {
  if (document.activeElement?.classList?.contains('memo-input')) return;
  const y = scrollY;
  route().then(() => scrollTo(0, y));
});
startSync();

// オフラインで使えるようにする（テスト用のデータを見ているときは使わない）
if ('serviceWorker' in navigator && !new URLSearchParams(location.search).has('fixtures')) {
  // 前の版が動いていたときだけ、新しい版に切りかわった時点で1回読み込み直す
  // （ページだけ新しく、画面のしくみが古いままになるのを防ぐ）
  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloaded) return;
    reloaded = true;
    location.reload();
  });
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
