import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalize, queryYomi, searchIndex } from '../../js/search.js';
import { sourceHash } from '../../tools/build-search.mjs';

const index = {
  lexicon: { 石灰水: 'せっかいすい', 石灰: 'せっかい', 水: 'みず', 液: 'えき', 素: 'そ', 二酸化炭素: 'にさんかたんそ' },
  entries: [
    { s: 'rika', g: 6, u: '01', no: 1, title: 'A単元', n: 1, f: '活動', t: '石灰水を入れてふる', y: 'せっかいすいをいれてふる' },
    { s: 'rika', g: 6, u: '01', no: 1, title: 'A単元', n: 2, f: '準備物', t: '石灰水', y: 'せっかいすい' },
    { s: 'rika', g: 6, u: '01', no: 1, title: 'A単元', n: 2, f: '安全上の注意', t: 'ヨウ素液は目に入れない', y: 'ようそえきはめにいれない' },
    { s: 'rika', g: 6, u: '05', no: 5, title: 'B単元', n: 4, f: 'まとめ', t: '二酸化炭素がとけている', y: 'にさんかたんそがとけている' },
  ],
};
const hits = (q) => searchIndex(index, q).map((r) => `${r.unitId}-${r.n}:${r.fields.join('・')}`);

test('ひらがな・カタカナ・全角半角・空白のちがいをならす', () => {
  assert.equal(normalize(' セッカイ　スイ '), 'せっかいすい');
  assert.equal(normalize('ＡＢＣ１'), 'abc1');
});

test('漢字まじりの検索語も、索引のことばを使ってよみにする', () => {
  assert.equal(queryYomi('石灰すい', index.lexicon), 'せっかいすい');
  assert.equal(queryYomi('ヨウ素液', index.lexicon), 'ようそえき');
});

test('漢字で探す（そのまま一致）', () => assert.deepEqual(hits('石灰水'), ['01-1:活動', '01-2:準備物']));
test('ひらがなで探す（よみで一致）', () => assert.deepEqual(hits('せっかいすい'), ['01-1:活動', '01-2:準備物']));
test('カタカナで探す', () => assert.deepEqual(hits('セッカイスイ'), ['01-1:活動', '01-2:準備物']));
test('漢字とかなのまぜ書きで探す', () => assert.deepEqual(hits('石灰すい'), ['01-1:活動', '01-2:準備物']));
test('カタカナの用語をひらがなで探す', () => assert.deepEqual(hits('ようそえき'), ['01-2:安全上の注意']));
test('ことばの一部でも見つかる', () => assert.deepEqual(hits('さんか'), ['05-4:まとめ']));
test('空白だけなら結果なし', () => assert.deepEqual(hits('  '), []));

test('検索用の索引は、いまの単元データから作られている（npm run build:search で更新）', () => {
  const idx = JSON.parse(readFileSync(new URL('../../data/search-index.json', import.meta.url), 'utf8'));
  assert.equal(idx.source, sourceHash());
});
