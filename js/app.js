// 起動とハッシュ変更の処理。
import { parseHash, buildHash } from './router.js';
import { loadIndex, loadUnit, findItem } from './data.js';
import { renderHome, renderUnitList, renderNotReady, renderUnit, renderLoadError } from './render.js';
import { renderMaterials } from './materials.js';
import { unitKey } from './progress.js';

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
  const known = r.view === 'home' || index.subjects.some((s) => s.id === r.subject && s.status === 'ready');
  if (!known) { location.replace(buildHash({ view: 'home' })); return; }

  if (r.view === 'home') delete document.body.dataset.subject;
  else document.body.dataset.subject = r.subject;
  side.hidden = true;
  side.replaceChildren();
  if (r.view === 'home') renderHome(main, index);
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
  renderUnit(main, unit, back, kicker, buildHash({ ...r, view: 'materials', lesson: undefined }),
    unitKey(r.subject, r.grade, r.unitId));
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

// オフラインで使えるようにする（テスト用のデータを見ているときは使わない）
if ('serviceWorker' in navigator && !new URLSearchParams(location.search).has('fixtures')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
