// 設定画面・下書きを作る画面・下書きの表示
import { h, renderUnit } from './render.js';
import { buildHash } from './router.js';
import { exportMemos, importMemos, memoCount } from './memo.js';
import { MODELS, getSettings, saveSettings, generateDraft, saveDraft, getDraft, removeDraft } from './draft.js';

export function renderSettings(el) {
  const s = getSettings();
  const status = h('p', { class: 'key-status' });
  const paint = () => { status.textContent = getSettings().apiKey ? 'APIキーはこの端末に保存されています。' : 'APIキーはまだ入っていません。'; };
  const key = h('input', { type: 'password', id: 'api-key', class: 'text-input', autocomplete: 'off', placeholder: 'sk-ant-…' });
  const model = h('select', { id: 'api-model', class: 'text-input' },
    MODELS.map(([id, label]) => h('option', { value: id, selected: s.model === id || null }, label)));
  paint();
  el.replaceChildren(h('article', { class: 'settings' },
    h('h1', { class: 'page-title' }, '設定'),
    memoSection(),
    h('section', {},
      h('h2', { class: 'section-title' }, 'AIで下書きを作る（自分専用）'),
      h('p', {}, 'Anthropic の APIキーを入れた端末でだけ、単元一覧に「AIで下書きを作る」が出ます。キーはこの端末のブラウザにだけ保存され、ほかの人には見えません。'),
      h('p', { class: 'note' }, '料金は使った分だけかかります（1単元の下書きで約10〜30円）。Anthropic の管理画面で、月の使用上限を設定しておいてください。'),
      status,
      h('label', { for: 'api-key', class: 'field-label' }, 'APIキー'), key,
      h('label', { for: 'api-model', class: 'field-label' }, '使うモデル'), model,
      h('div', { class: 'form-actions' },
        h('button', { type: 'button', class: 'button', onclick: () => {
          saveSettings({ apiKey: key.value.trim() || getSettings().apiKey, model: model.value });
          key.value = '';
          paint();
        } }, '保存する'),
        h('button', { type: 'button', class: 'button button-quiet', onclick: () => { saveSettings({ apiKey: '' }); paint(); } }, 'キーを消す')))));
}

// 自分のメモを、ほかの端末へ移す
function memoSection() {
  const status = h('p', { class: 'memo-import-status', role: 'status' });
  const file = h('input', { type: 'file', id: 'memo-import', accept: '.json,application/json', class: 'visually-hidden',
    onchange: async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      try {
        status.textContent = `${importMemos(await f.text())}単元のメモを読み込みました。`;
      } catch (err) {
        status.textContent = err.message;
      }
      e.target.value = '';
    } });
  const exportButton = h('button', { type: 'button', class: 'button', onclick: () => {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const a = h('a', { href: URL.createObjectURL(new Blob([exportMemos()], { type: 'application/json' })), download: `${ymd}-教材研究メモ.json` });
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  } }, 'メモを書き出す');
  const n = memoCount();
  return h('section', {},
    h('h2', { class: 'section-title' }, '自分のメモ'),
    h('p', {}, '単元ページに書いたメモは、この端末のブラウザにだけ保存されます。ほかの端末で使うときは、書き出したファイルをその端末で読み込んでください。'),
    h('p', { class: 'note' }, n ? `今この端末には、${n}単元分のメモがあります。` : 'この端末には、まだメモがありません。'),
    h('p', { class: 'note' }, '読み込むと、同じ時間のメモはファイルの内容に置きかわります。ファイルにないメモはそのまま残ります。'),
    h('div', { class: 'form-actions' },
      exportButton,
      file, h('label', { for: file.id, class: 'button button-quiet' }, 'メモのファイルを読み込む')),
    status);
}

export function renderDraftForm(el, { subject, subjectName, grade, items = [] }) {
  const field = (id, label, attrs) => [h('label', { for: id, class: 'field-label' }, label), h('input', { id, class: 'text-input', ...attrs })];
  const error = h('p', { class: 'draft-error', role: 'alert' });
  const button = h('button', { type: 'submit', class: 'button' }, '下書きを作る');
  const form = h('form', { class: 'draft-form', onsubmit: async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const info = { subjectName, grade, title: String(fd.get('title')).trim(), hours: Number(fd.get('hours')), month: String(fd.get('month') ?? '').trim() };
    if (!info.title || !(info.hours >= 1 && info.hours <= 30)) { error.textContent = '単元名と時数（1〜30）を入れてください。'; return; }
    error.textContent = '';
    button.disabled = true;
    button.textContent = '作っています（1〜2分かかります）…';
    try {
      const { unit, cost, model } = await generateDraft(info);
      saveDraft({ subject, grade, unit, cost, model, createdAt: new Date().toISOString() });
      location.hash = buildHash({ view: 'draft', subject, grade, draftId: unit.id });
    } catch (err) {
      error.textContent = err.message;
      button.disabled = false;
      button.textContent = '下書きを作る';
    }
  } },
  field('d-title', '単元名', { name: 'title', required: true, placeholder: '例：もののとけ方' }),
  field('d-hours', '時数', { name: 'hours', type: 'number', min: 1, max: 30, required: true, inputmode: 'numeric' }),
  field('d-month', '実施月', { name: 'month', placeholder: '例：1月（なくてもよい）' }),
  h('div', { class: 'form-actions' }, button), error);
  // 参考：その学年の単元と時数（押すと入力欄に入る）
  const fill = (it) => {
    form.elements.title.value = it.title.replace(/（.*?）$/, '');
    form.elements.hours.value = String(it.hours);
    form.elements.month.value = it.month ?? '';
    form.elements.title.focus();
  };
  const ref = items.length ? h('section', { class: 'unit-ref' },
    h('h2', { class: 'section-title' }, `${grade}年${subjectName}の単元（啓林館の年間指導計画）`),
    h('p', { class: 'note' }, '押すと、単元名・時数・実施月が入力欄に入ります。'),
    h('ul', { class: 'ref-list' }, items.map((it) => h('li', {},
      h('button', { type: 'button', class: `ref-row${it.kind === 'event' ? ' is-event' : ''}`, onclick: () => fill(it) },
        h('span', { class: 'unit-no' }, it.no ? String(it.no) : ''),
        h('span', { class: 'unit-title' }, it.title),
        h('span', { class: 'meta' }, h('span', {}, `${it.hours}時間`), h('span', {}, it.month))))))) : null;
  el.replaceChildren(h('article', { class: 'draft-new' },
    h('a', { class: 'button back-button', href: buildHash({ view: 'list', subject, grade }) }, '単元一覧にもどる'),
    h('p', { class: 'unit-kicker' }, `${grade}年　${subjectName}`),
    h('h1', { class: 'page-title' }, 'AIで下書きを作る'),
    h('p', { class: 'note' }, '教科書会社の資料は見ずにAIが考えた下書きです。時間配分や評価規準は、資料で確かめてから使ってください。'),
    h('div', { class: 'draft-layout' }, form, ref)));
}

export function renderDraftView(el, { subject, subjectName, grade, draftId }) {
  const entry = getDraft(draftId);
  const back = buildHash({ view: 'list', subject, grade });
  if (!entry) {
    el.replaceChildren(h('div', { class: 'not-ready' }, h('p', {}, 'この下書きは見つかりませんでした（この端末にだけ保存されています）。'), h('a', { class: 'button', href: back }, '単元一覧へ戻る')));
    return;
  }
  renderUnit(el, entry.unit, back, `${grade}年　${subjectName}`);
  const banner = h('div', { class: 'draft-banner' },
    h('p', {}, h('strong', {}, '下書き（資料未確認）'), '　AIが作った下書きです。この端末にだけ保存されています。'),
    h('p', { class: 'draft-cost' }, entry.imported ? 'ファイルから読み込んだ下書きです。' : `作成にかかった料金の目安：約${entry.cost}円`),
    h('div', { class: 'form-actions' },
      h('button', { type: 'button', class: 'button', onclick: () => {
        const blob = new Blob([JSON.stringify(entry.unit, null, 2)], { type: 'application/json' });
        const a = h('a', { href: URL.createObjectURL(blob), download: `${grade}年${subjectName}_${entry.unit.title}_下書き.json` });
        document.body.append(a); a.click(); a.remove();
      } }, '下書きのファイルを保存'),
      h('button', { type: 'button', class: 'button button-quiet', onclick: () => { removeDraft(draftId); location.hash = back; } }, '下書きを消す')));
  el.querySelector('.unit-header')?.before(banner);
}
