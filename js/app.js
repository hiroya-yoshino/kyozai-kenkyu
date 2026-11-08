// 起動とハッシュ変更の処理。
import { parseHash, buildHash } from './router.js';
import { loadIndex, loadUnit, findItem } from './data.js';
import { renderHome, renderUnitList, renderNotReady, renderUnit, renderLoadError } from './render.js';

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

  side.hidden = true;
  side.replaceChildren();
  if (r.view === 'home') renderHome(main, index);
  else if (r.view === 'list') renderUnitList(main, index, r.subject, r.grade);
  else await showUnit(r, index, token);
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
  renderUnitList(side, index, r.subject, r.grade, r.unitId);
  side.hidden = false;
  renderUnit(main, unit, back);
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
route();
