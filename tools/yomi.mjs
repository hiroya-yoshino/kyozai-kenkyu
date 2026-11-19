// 文章のよみ（ひらがな）を作る。検索用の索引づくり（tools/build-search.mjs）で使う。
// 辞書（kuromoji）は作るときだけ使い、アプリ本体には入れない。
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const kuromoji = require('kuromoji');
const dicPath = join(dirname(require.resolve('kuromoji/package.json')), 'dict') + '/';

// 辞書がまちがえやすい理科のことばのよみ（長いものから順にあてはめる）
export const OVERRIDES = {
  石灰水: 'せっかいすい',
  水よう液: 'すいようえき',
  水溶液: 'すいようえき',
  食塩水: 'しょくえんすい',
  炭酸水: 'たんさんすい',
  アンモニア水: 'あんもにあすい',
  集気びん: 'しゅうきびん',
  燃焼さじ: 'ねんしょうさじ',
  蒸発皿: 'じょうはつざら',
  気体検知管: 'きたいけんちかん',
  気体採取器: 'きたいさいしゅき',
  手回し発電機: 'てまわしはつでんき',
  光電池: 'こうでんち',
  実験用てこ: 'じっけんようてこ',
  火山灰: 'かざんばい',
  蒸散: 'じょうさん',
  気こう: 'きこう',
  食物連鎖: 'しょくもつれんさ',
  解ぼうけんび鏡: 'かいぼうけんびきょう',
  けんび鏡: 'けんびきょう',
  ヨウ素液: 'ようそえき',
  支点: 'してん',
  力点: 'りきてん',
  作用点: 'さようてん',
  上弦: 'じょうげん',
  下弦: 'かげん',
  金あみ: 'かなあみ',
  砂ぶくろ: 'すなぶくろ',
  保護めがね: 'ほごめがね',
  虫めがね: 'むしめがね',
  発光ダイオード: 'はっこうだいおーど',
  じん臓: 'じんぞう',
  肝臓: 'かんぞう',
  小腸: 'しょうちょう',
  大腸: 'だいちょう',
  ちっ素: 'ちっそ',
  ヨウ素: 'ようそ',
  りゅう起: 'りゅうき',
  ちん降: 'ちんこう',
  水そう: 'すいそう',
};

export const toHira = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

let tokenizerPromise;
export function getTokenizer() {
  tokenizerPromise ??= new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath }).build((err, t) => (err ? reject(err) : resolve(t)));
  });
  return tokenizerPromise;
}

const KEYS = Object.keys(OVERRIDES).sort((a, b) => b.length - a.length);

// 文章 → よみ（ひらがな）。補正語は先に置きかえ、残りを辞書で読む
export function yomiOf(tokenizer, text) {
  let out = '';
  let rest = text;
  while (rest) {
    const key = KEYS.find((k) => rest.startsWith(k));
    if (key) {
      out += OVERRIDES[key];
      rest = rest.slice(key.length);
      continue;
    }
    // 次の補正語の手前までを辞書で読む
    let cut = rest.length;
    for (const k of KEYS) {
      const i = rest.indexOf(k);
      if (i > 0 && i < cut) cut = i;
    }
    const part = rest.slice(0, cut);
    out += tokenizer.tokenize(part).map((t) => toHira(t.reading && t.reading !== '*' ? t.reading : t.surface_form)).join('');
    rest = rest.slice(cut);
  }
  return toHira(out);
}
