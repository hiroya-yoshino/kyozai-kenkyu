// 設定画面・下書きを作る画面・下書きの表示
import { h, renderUnit } from './render.js';
import { buildHash } from './router.js';
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

export function renderDraftForm(el, { subject, subjectName, grade }) {
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
  el.replaceChildren(h('article', {},
    h('a', { class: 'button back-button', href: buildHash({ view: 'list', subject, grade }) }, '単元一覧にもどる'),
    h('p', { class: 'unit-kicker' }, `${grade}年　${subjectName}`),
    h('h1', { class: 'page-title' }, 'AIで下書きを作る'),
    h('p', { class: 'note' }, '教科書会社の資料は見ずにAIが考えた下書きです。時間配分や評価規準は、資料で確かめてから使ってください。'),
    form));
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
