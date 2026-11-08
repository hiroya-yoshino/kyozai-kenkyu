// 目標ポップアップ。ページ遷移せずに重ねて表示し、×・外側・Esc・「戻る」で閉じる。
const LABELS = [
  ['knowledge', '知識・技能'],
  ['thinking', '思考・判断・表現'],
  ['attitude', '主体的に学習に取り組む態度'],
];

// ×・外側のタップ・「戻る」で閉じる仕組みを、ダイアログごとに1回だけつける（Esc は <dialog> の標準動作）
function dialogEl(id) {
  const d = document.getElementById(id);
  if (!d.dataset.ready) {
    const close = () => { if (d.open) d.close(); };
    d.addEventListener('click', (e) => { if (e.target === d) close(); });
    d.querySelector('.dialog-close').addEventListener('click', close);
    window.addEventListener('hashchange', close);
    d.dataset.ready = '1';
  }
  return d;
}

function showKeepingScroll(d) {
  const y = window.scrollY;
  d.showModal();
  window.scrollTo(0, y);
}

export function openGoals(goals) {
  const d = dialogEl('goals');
  const list = d.querySelector('.goals-list');
  list.replaceChildren(...LABELS.flatMap(([key, label]) => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = goals[key] ?? '';
    return [dt, dd];
  }));
  showKeepingScroll(d);
}

export function openFigure(fig) {
  const d = dialogEl('figure');
  const img = d.querySelector('.figure-dialog-img');
  img.src = fig.src;
  img.alt = fig.caption;
  d.querySelector('.figure-dialog-caption').textContent = fig.caption;
  showKeepingScroll(d);
}

export function closeGoals() {
  const d = document.getElementById('goals');
  if (d?.open) d.close();
}
