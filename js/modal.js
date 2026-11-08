// 目標ポップアップ。ページ遷移せずに重ねて表示し、×・外側・Esc・「戻る」で閉じる。
const LABELS = [
  ['knowledge', '知識・技能'],
  ['thinking', '思考・判断・表現'],
  ['attitude', '主体的に学習に取り組む態度'],
];

function dialogEl() {
  const d = document.getElementById('goals');
  if (!d.dataset.ready) {
    d.addEventListener('click', (e) => { if (e.target === d) closeGoals(); });
    d.querySelector('.dialog-close').addEventListener('click', closeGoals);
    window.addEventListener('hashchange', closeGoals);
    d.dataset.ready = '1';
  }
  return d;
}

export function openGoals(goals) {
  const d = dialogEl();
  const list = d.querySelector('.goals-list');
  list.replaceChildren(...LABELS.flatMap(([key, label]) => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = goals[key] ?? '';
    return [dt, dd];
  }));
  const y = window.scrollY;
  d.showModal();
  window.scrollTo(0, y);
}

export function closeGoals() {
  const d = document.getElementById('goals');
  if (d?.open) d.close();
}
