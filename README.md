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
| 認証 | Auth.js (NextAuth v5) + SSO |
| AI | Claude API (Anthropic SDK) |
| 決済 | Stripe |
| チャート | Recharts 3 |
| フォーム | React Hook Form + Zod |
| PDF出力 | @react-pdf/renderer |
| テスト | Vitest + Playwright |
| 監視 | Sentry |
| レート制限 | Upstash Redis + Ratelimit |

---

## 主な機能

### コア機能

- **ダッシュボード** — KPI カード、メディアタイプ別分布、直近 PR 施策の一覧
- **ブランド管理** — 企業配下のブランドを CRUD、カテゴリ分類
- **PR 施策管理** — PESO タイプ別に施策を登録・フィルタリング・ソート
- **ブランド比較** — 複数ブランドの施策数・エンゲージメントをチャートで比較

### エンタープライズ機能

- **AI インサイト** — Claude API による競合分析・戦略提案の自動生成
- **PDF エクスポート** — 比較レポートを PDF 形式で出力
- **課金管理** — Stripe 連携によるサブスクリプション管理
- **SSO 認証** — SAML/OIDC によるエンタープライズ SSO
- **IP 制限** — テナント単位での IP アドレス制限
- **監査ログ** — 操作履歴の記録・追跡

### セキュリティ

- **マルチテナント** — Prisma Client Extension によるテナント自動フィルタリング
- **ロールベースアクセス制御** — OWNER / ADMIN / MEMBER の 3 段階
- **プラン別制限** — FREE / PRO / ENTERPRISE の機能制限

---

## プロジェクト構成

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # 認証グループ
│   │   └── login/              #   ログインページ
│   ├── (dashboard)/            # ダッシュボードグループ
│   │   ├── page.tsx            #   ダッシュボード (/)
│   │   ├── brands/             #   ブランド CRUD
│   │   ├── pr-items/           #   PR 施策 CRUD
│   │   ├── compare/            #   ブランド比較
│   │   ├── guides/             #   ガイドページ
│   │   └── settings/           #   設定
│   └── api/                    # API ルート
│       ├── auth/               #   認証 (NextAuth + SSO)
│       ├── billing/            #   課金 (Stripe)
│       ├── export/             #   エクスポート (CSV/PDF)
│       ├── insights/           #   AI インサイト
│       └── webhooks/           #   Webhook
│
├── features/                   # 機能モジュール (Feature-Sliced Design)
│   ├── auth/                   #   認証
│   ├── billing/                #   課金
│   ├── brands/                 #   ブランド管理
│   ├── compare/                #   比較
│   ├── dashboard/              #   ダッシュボード
│   ├── insights/               #   AI インサイト
│   └── pr-items/               #   PR 施策
│   # 各モジュール構成:
│   #   actions.ts     - Server Actions
│   #   queries.ts     - データ取得
│   #   schemas.ts     - Zod スキーマ
│   #   components/    - UI コンポーネント
│
├── components/                 # 共通コンポーネント
│   ├── ui/                     #   shadcn/ui
│   └── layout/                 #   Header, Sidebar
│
├── config/                     # 設定・定数
│   ├── peso.ts                 #   PESO モデル定義
│   └── source-types.ts         #   ソース種別
│
├── lib/                        # ユーティリティ
│   ├── prisma.ts               #   DB クライアント
│   ├── auth.ts                 #   認証設定
│   ├── authorization.ts        #   RBAC
│   ├── stripe.ts               #   決済
│   ├── sso.ts                  #   SSO
│   ├── audit.ts                #   監査ログ
│   ├── plan-limits.ts          #   プラン制限
│   ├── ip-restriction.ts       #   IP 制限
│   ├── rate-limit.ts           #   レート制限
│   └── logger.ts               #   ロギング
│
├── __tests__/                  # テスト
│   ├── unit/                   #   ユニットテスト
│   ├── integration/            #   統合テスト
│   └── e2e/                    #   E2E テスト
│
├── testing/                    # テスト設定
│   └── setup.ts                #   Vitest セットアップ
│
├── types/                      # 型定義
│   └── next-auth.d.ts          #   NextAuth 拡張
│
└── proxy.ts                    # Proxy (認証・IP制限・レート制限)
```

---

## セットアップ

### 前提条件

- Node.js 20+
- Docker（PostgreSQL 用）

### 1. リポジトリをクローン

```bash
git clone https://github.com/KoenigWolf/PRism.git
cd PRism
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
# データベース
DATABASE_URL="postgresql://postgres:password@localhost:5432/prism?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/prism?schema=public"

# 認証
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<openssl rand -base64 32 で生成>"

# AI（オプション）
ANTHROPIC_API_KEY="<Anthropic API キー>"

# 決済（オプション）
STRIPE_SECRET_KEY="<Stripe シークレットキー>"
STRIPE_WEBHOOK_SECRET="<Stripe Webhook シークレット>"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="<Stripe 公開キー>"
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

> 本番環境では必ずパスワードを変更してください。

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

## API エンドポイント

| エンドポイント | メソッド | 説明 |
|---|---|---|
| `/api/auth/[...nextauth]` | * | NextAuth 認証 |
| `/api/auth/sso/[tenant]` | GET | SSO 認証開始 |
| `/api/auth/sso/[tenant]/callback` | GET/POST | SSO コールバック |
| `/api/billing/checkout` | POST | Stripe Checkout セッション作成 |
| `/api/billing/portal` | POST | Stripe カスタマーポータル |
| `/api/export` | POST | CSV エクスポート |
| `/api/export/pdf` | POST | PDF エクスポート |
| `/api/insights` | POST | AI インサイト生成 |
| `/api/webhooks/stripe` | POST | Stripe Webhook 処理 |

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
