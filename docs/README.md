# PRism ドキュメント

> PR × Prism：競合のPR戦略を"分光"し、勝ちパターンを可視化する

---

## PRismとは

PRismは、競合ブランドのPR施策をPESOモデル（Paid, Earned, Shared, Owned）で構造化し、ブランド間の比較からAIが"次の一手"を提案する**PR戦略分析ダッシュボード**です。

### 解決する課題

PR業界には「競合がどんな施策を打っているか」を調べる文化がありますが、多くの現場ではそれを人力でやっています。クリッピングツールはあっても「結果の報告」止まりで、「なぜあのブランドはウケたのか」「次に自分たちは何をすべきか」まで教えてくれるものはありません。

### コアバリュー

- **「報告用」ではなく「戦略立案用」**：競合の勝ちパターンの因数分解に特化
- **圧倒的にモダンで軽いUI**：Next.js + shadcn/uiによるサクサク動くダッシュボード
- **AIによる「示唆出し」**：次のアクション（示唆）をAIが提案

---

## ドキュメント一覧

| ドキュメント | 対象者 | 内容 |
|---|---|---|
| [BRAND_GUIDE.md](./BRAND_GUIDE.md) | デザイナー / マーケター | ネーミング、表記ルール、カラー、タイポグラフィ、トーン&ボイス |
| [BUSINESS_STRATEGY.md](./BUSINESS_STRATEGY.md) | 経営 / 事業開発 | 競合分析、差別化戦略、価格プラン、Go-to-Marketロードマップ |
| [SALES_MATERIALS.md](./SALES_MATERIALS.md) | 営業 / BD | エレベーターピッチ、LP コピー、DM文面、デモ用データ |
| [TECHNICAL_GUIDE.md](./TECHNICAL_GUIDE.md) | エンジニア | アーキテクチャルール、実装フェーズ（Phase 1-3） |

---

## 技術スタック

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Server Actions + Prisma + PostgreSQL
- **Auth**: Auth.js (NextAuth v5)
- **Charts**: Recharts

---

*PRism Product Document v1.0 — 2026年3月*
