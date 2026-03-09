# PRism

> PR × Prism — 競合のPR戦略を"分光"し、勝ちパターンを可視化する

PRism は、競合ブランドの PR 施策を PESO モデル（Paid / Earned / Shared / Owned）で構造化し、ブランド間の比較から"次の一手"を導き出す **PR 戦略分析ダッシュボード**です。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) + React 19 + TypeScript |
| スタイリング | Tailwind CSS 4 + shadcn/ui |
| バックエンド | Server Actions + Prisma 6 |
| データベース | PostgreSQL 16 |
| 認証 | Auth.js (NextAuth v5 beta) |
| チャート | Recharts 3 |
| フォーム | React Hook Form + Zod |
| テスト | Vitest + Playwright |
| 監視 | Sentry |
| レート制限 | Upstash Redis + Ratelimit |

---

## 主な機能

- **ダッシュボード** — KPI カード、メディアタイプ別分布、直近 PR 施策の一覧
- **ブランド管理** — 企業配下のブランドを CRUD、カテゴリ分類
- **PR 施策管理** — PESO タイプ別に施策を登録・フィルタリング・ソート
- **ブランド比較** — 複数ブランドの施策数・エンゲージメントをチャートで比較
- **マルチテナント** — Prisma Client Extension によるテナント自動フィルタリング
- **ロールベースアクセス制御** — OWNER / ADMIN / MEMBER の 3 段階

---

## プロジェクト構成

```
src/
├── app/                        # Next.js App Router（ルーティング＋ページ）
│   ├── (auth)/login/           #   ログインページ
│   ├── (dashboard)/            #   認証済みレイアウト
│   │   ├── brands/             #     ブランド CRUD
│   │   ├── pr-items/           #     PR 施策 CRUD
│   │   ├── compare/            #     ブランド比較
│   │   ├── error.tsx           #     エラーバウンダリ
│   │   ├── not-found.tsx       #     404 ページ
│   │   ├── loading.tsx         #     ローディング UI
│   │   └── page.tsx            #     ダッシュボード
│   └── api/auth/               #   NextAuth API ルート
├── features/                   # 機能別モジュール（Feature-Sliced Design）
│   ├── auth/                   #   認証 UI
│   ├── brands/                 #   actions, queries, schemas, components, *.test.ts
│   ├── pr-items/               #   同上
│   ├── dashboard/              #   queries, components
│   └── compare/                #   queries, components
├── components/                 # 共通 UI
│   ├── ui/                     #   shadcn/ui プリミティブ
│   └── layout/                 #   Header, Sidebar
├── config/                     # ドメイン設定・定数
│   ├── peso.ts                 #   PESO モデル定義（カラー / ラベル）
│   └── source-types.ts         #   ソース種別定義
├── lib/                        # インフラ・ユーティリティ
│   ├── auth.ts                 #   Auth.js 設定
│   ├── prisma.ts               #   Prisma Client + テナント Extension
│   ├── authorization.ts        #   RBAC
│   ├── rate-limit.ts           #   Upstash レート制限
│   ├── logger.ts               #   Sentry エラーログ
│   └── utils.ts                #   cn() 等の汎用ヘルパー
├── testing/                    # テスト共通設定
│   └── setup.ts                #   Vitest グローバルセットアップ
└── types/                      # グローバル型定義
    ├── actions.ts              #   ActionResult<T>
    └── next-auth.d.ts          #   NextAuth 型拡張
```

---

## セットアップ

### 前提条件

- Node.js 20+
- Docker（PostgreSQL 用）

### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd prism
```

### 2. 依存パッケージをインストール

```bash
npm install
```

### 3. 環境変数を設定

```bash
cp .env .env.local
```

`.env.local` を編集し、以下を設定してください:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/prism?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/prism?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<openssl rand -base64 32 で生成>"
```

### 4. PostgreSQL を起動

```bash
docker compose up -d
```

### 5. データベースをセットアップ

```bash
npm run db:migrate   # マイグレーション実行
npm run db:seed      # シードデータ投入
```

### 6. 開発サーバーを起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアクセスできます。

### デモ用アカウント（シード投入後）

| メールアドレス | パスワード | ロール |
|---|---|---|
| `owner@example.com` | `password123` | OWNER |
| `admin@example.com` | `password123` | ADMIN |
| `member@example.com` | `password123` | MEMBER |

> ⚠️ 本番環境では必ずパスワードを変更してください。

---

## npm スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run start` | プロダクションサーバー起動 |
| `npm run lint` | ESLint 実行 |
| `npm run test` | Vitest（ウォッチモード） |
| `npm run test:run` | Vitest（単発実行） |
| `npm run test:e2e` | Playwright E2E テスト |
| `npm run db:migrate` | Prisma マイグレーション |
| `npm run db:seed` | シードデータ投入 |
| `npm run db:reset` | DB リセット（全データ削除 + 再マイグレーション） |

---

## ドキュメント

| ドキュメント | 対象者 | 内容 |
|---|---|---|
| [docs/README.md](./docs/README.md) | 全員 | 概要とインデックス |
| [docs/BRAND_GUIDE.md](./docs/BRAND_GUIDE.md) | デザイナー / マーケター | ネーミング、カラー、トーン&ボイス |
| [docs/BUSINESS_STRATEGY.md](./docs/BUSINESS_STRATEGY.md) | 経営 / 事業開発 | 競合分析、差別化戦略、Go-to-Market |
| [docs/SALES_MATERIALS.md](./docs/SALES_MATERIALS.md) | 営業 / BD | エレベーターピッチ、LP コピー、デモデータ |
| [docs/TECHNICAL_GUIDE.md](./docs/TECHNICAL_GUIDE.md) | エンジニア | アーキテクチャ、実装フェーズ |

---

## ライセンス

Private
