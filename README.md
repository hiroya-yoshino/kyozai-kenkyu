# 教材研究ノート

単元ごとの時数・毎時間の流れ（めあて・活動・まとめ）・実験と図をまとめた、教材研究用のWebアプリです。

- 公開URL：https://hiroya-yoshino.github.io/kyozai-kenkyu/
- 対応：iPad・Windows・Android のブラウザ（ログイン不要）
- 現在の内容：6年理科（啓林館「わくわく理科」令和6年度 年間指導計画案・標準案の時数）

## しくみ

- 画面：`index.html`・`css/`・`js/`（ビルド不要の静的サイト）
- 単元一覧：`data/index.json`
- 単元の中身：`data/<教科>/<学年>/<番号>.json`、図は `figures/` の SVG
- 単元を公開するときは、`data/index.json` の該当単元の `status` を `"ready"` にする

## 開発

```bash
npm install
npm run serve      # http://localhost:4173/kyozai-kenkyu/
npm test           # データ検証と単体テスト
npm run test:e2e   # 画面のテスト（Playwright）
```

設計書：`docs/specs/20261108-kyozai-kenkyu-design.md`／実装計画：`docs/plans/20261108-kyozai-kenkyu-plan.md`

教科書の本文や児童の情報は載せていません。
