# 教材研究Webアプリ 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 6年理科の10単元を、どの端末でも3タップで開ける静的Webアプリとして GitHub Pages に公開する。

**Architecture:** ビルドなしの HTML/CSS/ES Modules。画面はハッシュ（`#/rika/6/01`）で切り替え、中身はすべて `data/` の JSON から描画する。純粋関数（ルーティング・データ検証）は Node の `node:test` で、画面の動きは Playwright で確かめる。

**Tech Stack:** HTML / CSS / JavaScript（ES Modules、依存なし）、Node.js 20+（`node:test`）、Playwright（開発時のみ）、GitHub Pages。

**Spec:** `docs/specs/20261108-kyozai-kenkyu-design.md`

## Global Constraints

- 公開URL：`https://hiroya-yoshino.github.io/kyozai-kenkyu/`（サブパス配信なので、**すべてのパスは相対パス**。先頭 `/` で始めない）
- 実行時の外部依存なし（CDN・フォント配信・API呼び出しを使わない）
- 教科書本文を載せない。児童の情報を入れない
- 表示言語は日本語。目標の3観点の見出しは「知識・技能」「思考・判断・表現」「主体的に学習に取り組む態度」
- ブレークポイント：幅 768px 未満は1列、768px 以上は2列
- 単元データのルール（spec 6章）：`lessons.length === hours`、`goals` 3観点すべて、`figure.src` が存在、`experiment` があれば `safety` 1つ以上
- 準備中の文言：「この単元はまだ準備中です」
- ファイル名：新規ドキュメントは `YYYYMMDD-名前.md`

## Review Focus

1. **サブパス配信**：`/kyozai-kenkyu/` の下で開いても、JSON・SVG・CSS がすべて読み込める（絶対パスだと GitHub Pages でだけ 404 になる）→ Task 7 で検証
2. **URLを直接開く**：`#/rika/6/05` を新しいタブで直接開いても、その単元ページが表示される（ホーム経由でなくても動く）→ Task 3
3. **存在しない単元・壊れたURL**：`#/rika/6/99` は準備中表示＋一覧へ戻るボタン、`#/xyz` はホームへ → Task 3・4
4. **目標ポップアップを開いたまま「戻る」**：ポップアップが閉じ、画面が壊れない → Task 5
5. **スマホ幅（375px）で長い単元名や長い手順文**：横スクロールが出ずに折り返す → Task 6

---

## ファイル構成

```
index.html              入口（ヘッダー、<main id="app">、<dialog id="goals">）
css/style.css           見た目・レイアウト
js/router.js            parseHash / buildHash（純粋関数）
js/data.js              loadIndex / loadUnit（fetch、相対パス）
js/render.js            renderHome / renderUnitList / renderUnit / renderNotReady
js/modal.js             openGoals / closeGoals
js/app.js               起動とハッシュ変更の処理（上記をつなぐだけ）
data/index.json         教科・学年・単元一覧
data/rika/6/01.json〜10.json
figures/rika/6/*.svg
tools/validate.mjs      validateIndex / validateUnit
tools/check-data.mjs    全データを検証する CLI
tests/unit/*.test.mjs   node:test
tests/e2e/*.spec.mjs    Playwright
package.json            scripts: test, test:data, test:e2e, serve
```

---

### Task 1: 土台とデータ検証

**Files:**
- Create: `package.json`, `tools/validate.mjs`, `tools/check-data.mjs`, `tests/unit/validate.test.mjs`, `.gitignore`（`node_modules/`, `test-results/`）

**Interfaces:**
- Produces:
  - `validateUnit(unit: object, fileExists: (relPath: string) => boolean): string[]` — エラー文の配列（空なら合格）
  - `validateIndex(index: object): string[]`
  - CLI `node tools/check-data.mjs` — 全データを検証し、エラーがあれば一覧を出して終了コード 1

- [ ] **Step 1: 失敗するテストを書く** — `tests/unit/validate.test.mjs`
  - `合格する単元` → `validateUnit(validUnit, () => true)` が `[]`
  - `時数と毎時間の数が違う` → hours 3・lessons 2 で、`"lessons の数(2)が hours(3)と一致しません"` を含む
  - `目標が欠けている` → `goals.attitude` なしで `"goals.attitude がありません"` を含む
  - `図ファイルがない` → `fileExists` が false で `"図が見つかりません: figures/rika/6/01-2.svg"` を含む
  - `実験に安全上の注意がない` → `safety: []` で `"第2時の実験に safety がありません"` を含む
- [ ] **Step 2: `node --test tests/unit` を実行し、FAIL（モジュールなし）を確認**
- [ ] **Step 3: `tools/validate.mjs` を実装**（上記の文言どおりに返す）。`check-data.mjs` は `data/index.json` を読み、`status: "ready"` の単元ファイルをすべて `validateUnit` にかける
- [ ] **Step 4: `node --test tests/unit` で PASS を確認**
- [ ] **Step 5: Commit** `feat: データ検証の仕組みを追加`

### Task 2: 単元一覧データ

**Files:**
- Create: `data/index.json`
- Modify: `tests/unit/validate.test.mjs`（index のテストを追加）

**Interfaces:**
- Produces: `data/index.json` の形
  ```json
  { "subjects": [
    { "id": "rika", "name": "理科", "status": "ready", "grades": [
      { "grade": 5, "status": "preparing", "items": [] },
      { "grade": 6, "status": "ready", "items": [
        { "kind": "event", "title": "理科のガイダンス", "hours": 1, "month": "4月", "term": 1 },
        { "kind": "unit", "id": "01", "no": 1, "title": "ものが燃えるしくみ", "hours": 8, "month": "4月", "term": 1, "status": "preparing" }
      ] } ] },
    { "id": "sansu", "name": "算数", "status": "preparing", "grades": [] },
    { "id": "kokugo", "name": "国語", "status": "preparing", "grades": [] } ] }
  ```
  単元の `status` は、中身ができて確認が済んだら `"ready"` にする。

- [ ] **Step 1: 失敗するテスト** — `validateIndex` について：実データ `data/index.json` を読み、6年理科の `kind:"unit"` が10件、時数の合計が **89**、単元1〜10のタイトルと時数・月が spec 4章の表と一致する。番号のない時間（ガイダンス・これまでの学習をつなげよう・自由研究・みんなで使う理科室）は `kind:"event"` で4件
- [ ] **Step 2: FAIL を確認**
- [ ] **Step 3: `data/index.json` を spec 4章の表と啓林館標準案の並び順どおりに作成**（event は 4月=ガイダンス1、7月=つなげよう1・自由研究2、9月=理科室2）。`validateIndex` に「unit の id が重複しない」「必須項目がある」チェックを追加
- [ ] **Step 4: PASS を確認**
- [ ] **Step 5: Commit** `feat: 6年理科の単元一覧データを追加`

### Task 3: ルーティングと画面の骨組み（ホーム・単元一覧）

**Files:**
- Create: `index.html`, `js/router.js`, `js/data.js`, `js/render.js`（renderHome / renderUnitList / renderNotReady）, `js/app.js`, `css/style.css`（最低限）, `tests/unit/router.test.mjs`, `tests/e2e/navigation.spec.mjs`, `playwright.config.mjs`

**Interfaces:**
- Consumes: Task 2 の `data/index.json`
- Produces:
  - `parseHash(hash: string): { view: "home" } | { view: "list", subject: string, grade: number } | { view: "unit", subject: string, grade: number, unitId: string }` — 解釈できないものは `{ view: "home" }`
  - `buildHash(route): string`（parseHash の逆）
  - `loadIndex(): Promise<object>` / `loadUnit(subject, grade, unitId): Promise<object|null>`（読めなければ null）
  - `renderHome(el, index)`, `renderUnitList(el, index, subject, grade)`, `renderNotReady(el, backHash)`

- [ ] **Step 1: 失敗するテスト（unit）** — `parseHash("")`→home、`"#/rika"`→list grade 6（既定）、`"#/rika/6"`→list、`"#/rika/6/05"`→unit、`"#/xyz/abc/def/ghi"`→home、`buildHash(parseHash(h)) === h`（正規形について）
- [ ] **Step 2: 失敗するテスト（e2e）** — `npm run serve` を Playwright の webServer で `/kyozai-kenkyu/` サブパスに配信して：
  - ホームに「理科」「算数」「国語」。算数・国語は「準備中」表示で押せない
  - 理科 → 6年タブ選択、「ものが燃えるしくみ」「8時間」「4月」が見え、学期見出し「1学期」「2学期」「3学期」がある
  - 5年タブは「準備中」
  - `#/rika/6/05` を直接開くと（単元がまだ preparing なので）「この単元はまだ準備中です」と一覧へ戻るボタン
  - `#/xyz` はホームを表示
- [ ] **Step 3: 両テストが FAIL することを確認**
- [ ] **Step 4: 実装**。`serve` スクリプトは `node tools/serve.mjs`（依存なしの静的サーバー、`/kyozai-kenkyu/` 配下でリポジトリ直下を配信）。`hashchange` で再描画。fetch はすべて相対パス
- [ ] **Step 5: `npm test` と `npm run test:e2e` で PASS を確認**
- [ ] **Step 6: Commit** `feat: ホームと単元一覧の画面を追加`

### Task 4: 単元ページ

**Files:**
- Modify: `js/render.js`（renderUnit を追加）, `css/style.css`
- Create: `tests/fixtures/rika/6/99.json`（テスト専用の単元。2時間、第2時に実験と図）, `tests/fixtures/figure.svg`, `tests/e2e/unit-page.spec.mjs`

**Interfaces:**
- Consumes: `loadUnit`、spec 6章のデータ形
- Produces: `renderUnit(el, unit, backHash)`。DOM の目印：目次 `nav.toc`、各時 `details.lesson[data-n]`、実験 `section.experiment`、目標ボタン `button#open-goals`

- [ ] **Step 1: 失敗するテスト（e2e）** — fixture を `?fixtures=1` のとき `tests/fixtures/` から読む切り替えで表示して：
  - 見出しに単元名・「2時間」・月
  - 「導入のアイデア」に question と presentation
  - 第1時・第2時の `details` が閉じた状態で並び、押すと めあて／活動／まとめ が見える
  - 第2時に 準備物・手順・安全上の注意・図（`<img>` の alt＝caption）。第1時には実験欄がない
  - 図の src を存在しないものに変えた fixture では、図の位置に caption の文字だけが出る
  - 目次の「第2時」を押すと第2時までスクロールして開く
- [ ] **Step 2: FAIL を確認**
- [ ] **Step 3: `renderUnit` を実装**（図は `<figure><img loading="lazy"><figcaption>`、`img.onerror` で img を外す）
- [ ] **Step 4: PASS を確認**
- [ ] **Step 5: Commit** `feat: 単元ページを追加`

### Task 5: 目標ポップアップ

**Files:**
- Create: `js/modal.js`, `tests/e2e/goals-modal.spec.mjs`
- Modify: `index.html`（`<dialog id="goals">`）, `js/render.js`（ボタンと接続）, `css/style.css`

**Interfaces:**
- Produces: `openGoals(goals: {knowledge, thinking, attitude})`, `closeGoals()`

- [ ] **Step 1: 失敗するテスト** — fixture 単元で：
  - 「🎯 目標」を押すとダイアログに3観点の見出しと本文。URL は変わらない
  - ×ボタンで閉じる／ダイアログの外側を押すと閉じる／Esc で閉じる
  - 下へスクロールしてから開閉しても `window.scrollY` が変わらない
  - 開いたままブラウザの「戻る」→ ダイアログが閉じ、単元一覧が表示される
- [ ] **Step 2: FAIL を確認**
- [ ] **Step 3: 実装**（`<dialog>.showModal()`、外側の判定は click の target が dialog 本体のとき、`hashchange` で `closeGoals()`）
- [ ] **Step 4: PASS を確認**
- [ ] **Step 5: Commit** `feat: 目標ポップアップを追加`

### Task 6: デザインと端末ごとの表示

**Files:**
- Modify: `css/style.css`, `index.html`（viewport・theme-color・タイトル）
- Create: `tests/e2e/responsive.spec.mjs`

- [ ] **Step 1: 失敗するテスト** — 幅 375px：一覧と単元ページが縦1列、`document.documentElement.scrollWidth <= 375`（長い単元名・長い手順文の fixture でも）。幅 1024px：単元ページ表示時に左に単元一覧、右に単元ページの2列
- [ ] **Step 2: FAIL を確認**
- [ ] **Step 3: frontend-design スキルに従って見た目を作る**（落ち着いた配色、本文16px以上、押せる部分は高さ44px以上、白黒印刷でも区別できる）。2列表示時は一覧を `aside` に描画
- [ ] **Step 4: PASS を確認し、Claude in Chrome で 375 / 768 / 1280px のスクリーンショットを確認**
- [ ] **Step 5: Commit** `feat: デザインとレスポンシブ表示`

### Task 7: GitHub Pages で公開

**Files:**
- Create: `.nojekyll`, `README.md`（使い方と更新手順に書き換え）

- [ ] **Step 1: `.nojekyll` を追加して push**（`_` で始まるファイルを無視させない）
- [ ] **Step 2: 1〜2分後、`https://hiroya-yoshino.github.io/kyozai-kenkyu/` を Claude in Chrome で開き、ホーム→理科→6年→単元（準備中）まで進めることと、コンソールに 404 がないことを確認**
- [ ] **Step 3: 太陽さんに URL を伝え、手元の iPad・Galaxy で開けるか確認してもらう**
- [ ] **Step 4: Commit** `docs: README を更新`

### Task 8: 単元1「ものが燃えるしくみ」の中身（見本単元）

**Files:**
- Create: `data/rika/6/01.json`, `figures/rika/6/01-*.svg`
- Modify: `data/index.json`（単元01の `status` を `"ready"` に）

- [ ] **Step 1: 学習指導要領 理科編（6年 A(1) 燃焼の仕組み）を確認し、8時間分の下書きを spec 6章の形で作る**（めあて・活動・まとめ、実験の時間は準備物・手順・安全上の注意）
- [ ] **Step 2: 図を SVG で作る**（例：集気びんとろうそく、空気の出入りのしかた、気体検知管の使い方）。文字は `<text>`
- [ ] **Step 3: `node tools/check-data.mjs` が終了コード 0**
- [ ] **Step 4: Claude in Chrome でスマホ幅・iPad幅で表示し、図のラベルのずれや文字の重なりがないことを1枚ずつ確認**
- [ ] **Step 5: push して公開版の URL を太陽さんに伝え、内容の確認をもらう。直しがあれば反映**
- [ ] **Step 6: OK が出たら `status: "ready"` にして Commit** `content: 6年理科 単元1を追加`

### Task 9〜17: 単元2〜10の中身

Task 8 と同じ手順を、単元ごとに1タスクずつ行う（Task 9＝単元02 … Task 17＝単元10）。各単元で、学習指導要領の該当内容を確認し、加熱・薬品・火を使う単元（5 水よう液の性質、9 発電と電気の利用など）は安全上の注意を特にていねいに書く。**1単元ごとに太陽さんの確認を得てから次へ進む。**

---

## Self-Review メモ

- spec の全章に対応タスクあり（12章の生成モード・他教科拡大は spec どおり今回対象外）
- 名前の一貫性：`validateUnit` / `validateIndex` / `parseHash` / `buildHash` / `loadIndex` / `loadUnit` / `renderHome` / `renderUnitList` / `renderUnit` / `renderNotReady` / `openGoals` / `closeGoals`
- Review Focus の5項目は、それぞれ Task 3・4・5・6・7 のテストに入れた
