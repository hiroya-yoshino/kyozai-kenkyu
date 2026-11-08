// 起動とハッシュ変更の処理。
import { parseHash, buildHash } from './router.js';
import { loadIndex, loadUnit, findItem } from './data.js';
import { renderHome, renderUnitList, renderNotReady, renderUnit } from './render.js';

const main = document.getElementById('app');
const side = document.getElementById('side');

async function route() {
  const r = parseHash(location.hash);
  const index = await loadIndex();
  const known = r.view === 'home' || index.subjects.some((s) => s.id === r.subject && s.status === 'ready');
  if (!known) { location.replace(buildHash({ view: 'home' })); return; }

  side.hidden = true;
  if (r.view === 'home') renderHome(main, index);
  else if (r.view === 'list') renderUnitList(main, index, r.subject, r.grade);
  else await showUnit(r, index);
  document.title = `${document.querySelector('h1')?.textContent ?? ''}｜教材研究ノート`;
}

async function showUnit(r, index) {
  const back = buildHash({ view: 'list', subject: r.subject, grade: r.grade });
  const item = findItem(index, r.subject, r.grade, r.unitId);
  const fixtures = new URLSearchParams(location.search).has('fixtures');
  const unit = (item?.status === 'ready' || fixtures) ? await loadUnit(r.subject, r.grade, r.unitId) : null;
  if (!unit) { renderNotReady(main, back); return; }
  renderUnit(main, unit, back);
}

window.addEventListener('hashchange', route);
route();
