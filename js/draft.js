// 自分専用の生成モード：APIキーを入れた端末だけで、AIに単元の下書きを作らせる。
// キーと下書きは、この端末のブラウザにだけ保存する。
import { readJSON, writeJSON } from './store.js';
import { validateUnit } from './validate.js';

export const MODELS = [
  ['claude-sonnet-5-5', 'Sonnet 5.5（ふつう・おすすめ）'],
  ['claude-haiku-5-5', 'Haiku 5.5（安い・速い）'],
  ['claude-opus-5-5', 'Opus 5.5（高品質・高い）'],
];
// 100万トークンあたりのドル（入力, 出力）
const PRICE = { 'claude-sonnet-5-5': [2, 10], 'claude-haiku-5-5': [0.1, 0.5], 'claude-opus-5-5': [4, 20] };
const YEN_PER_DOLLAR = 150; // 目安

const KEY = 'kyozai:apiKey';
const MODEL = 'kyozai:model';
const DRAFTS = 'kyozai:drafts';

export function getSettings() {
  return { apiKey: readJSON(KEY, ''), model: readJSON(MODEL, MODELS[0][0]) };
}
export function saveSettings({ apiKey, model }) {
  if (apiKey !== undefined) writeJSON(KEY, apiKey);
  if (model !== undefined) writeJSON(MODEL, model);
}
export const hasKey = () => Boolean(getSettings().apiKey);

export function costYen(model, usage) {
  const [i, o] = PRICE[model] ?? PRICE['claude-sonnet-5-5'];
  const dollars = ((usage?.input_tokens ?? 0) * i + (usage?.output_tokens ?? 0) * o) / 1_000_000;
  return Math.round(dollars * YEN_PER_DOLLAR * 10) / 10;
}

const SYSTEM = `あなたは日本の小学校の教材研究を手伝う。先生が授業の見通しを立てるための単元の下書きを、決まった形のJSONだけで返す。
ルール：
- 学習指導要領（平成29年告示）の内容に沿う。対象学年の児童に合う言葉で書く。
- 教科書の本文をそのまま書かない。めあて・まとめは自分の言葉で書く。
- lessons の数は、指定された時数とちょうど同じにする。n は 1 から順に。
- 単元導入（第1時）とまとめ・活用（最後の時間）を入れる。
- evaluation は「記号（評価方法）：評価規準の文」を1行とし、複数あるときは改行（\\n）で区切る。記号は 知①・思①・態① の形。
- 実験や観察をする時間だけ experiment を入れ、materials（準備物）・steps（手順）・safety（安全上の注意、1つ以上）を書く。図は入れない。
- JSON 以外の文は書かない。
形：{"title":"","hours":0,"month":"","goals":{"knowledge":"","thinking":"","attitude":""},"intro":{"question":"","presentation":""},"lessons":[{"n":1,"stage":"","aim":"","activities":[""],"summary":"","evaluation":"","experiment":{"materials":[""],"steps":[""],"safety":[""]}}]}`;

export function buildRequest(info, settings) {
  const content = `${info.grade}年${info.subjectName}の単元「${info.title}」（${info.hours}時間${info.month ? `、${info.month}ごろ` : ''}）の下書きを作ってください。lessons はちょうど ${info.hours} 個にしてください。`;
  return {
    url: 'https://api.anthropic.com/v1/messages',
    headers: {
      'content-type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: settings.model, max_tokens: 16000, system: SYSTEM, messages: [{ role: 'user', content }] }),
  };
}

export function parseDraft(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('下書きの形が正しくありませんでした。もう一度作ってください。');
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new Error('下書きの形が正しくありませんでした。もう一度作ってください。');
  }
}

export async function generateDraft(info, settings = getSettings()) {
  const req = buildRequest(info, settings);
  let res;
  try {
    res = await fetch(req.url, { method: 'POST', headers: req.headers, body: req.body });
  } catch {
    throw new Error('通信できませんでした。インターネットにつながっているか確かめてください。');
  }
  if (res.status === 401) throw new Error('APIキーが正しくありません。設定画面でキーを確かめてください。');
  if (res.status === 429 || res.status === 529) throw new Error('いまAIが混み合っています。少し待ってから、もう一度作ってください。');
  if (!res.ok) throw new Error(`下書きを作れませんでした（エラー ${res.status}）。もう一度作ってください。`);
  const data = await res.json();
  const text = (data.content ?? []).filter((c) => c.type === 'text').map((c) => c.text).join('');
  const unit = parseDraft(text);
  unit.id = `d-${Date.now().toString(36)}`;
  unit.hours = Number(info.hours);
  unit.month = unit.month || info.month || '';
  unit.title = info.title;
  const errors = validateUnit(unit, () => true);
  if (errors.length) throw new Error(`下書きの形が正しくありませんでした（${errors[0]}）。もう一度作ってください。`);
  return { unit, cost: costYen(settings.model, data.usage), model: settings.model };
}

// 下書きの保存（この端末だけ）
export const listDrafts = (subject, grade) => readJSON(DRAFTS, []).filter((d) => d.subject === subject && d.grade === grade);
export const getDraft = (id) => readJSON(DRAFTS, []).find((d) => d.unit.id === id) ?? null;
export function saveDraft(entry) {
  writeJSON(DRAFTS, [...readJSON(DRAFTS, []).filter((d) => d.unit.id !== entry.unit.id), entry]);
}
export function removeDraft(id) {
  writeJSON(DRAFTS, readJSON(DRAFTS, []).filter((d) => d.unit.id !== id));
}
