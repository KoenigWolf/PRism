# PRism 改善レポート

> 対象: PRism v0.1.0（Next.js App Router + Prisma + Auth.js）
> 分析日: 2026-03-08
> 合計 **72件**（Critical 22 / Medium 26 / Low 24）

---

## 優先度サマリー

| カテゴリ | Critical | Medium | Low |
|:---|:---:|:---:|:---:|
| コード品質 | 6 | 6 | 6 |
| UI/UX | 5 | 7 | 4 |
| セキュリティ | 8 | 7 | 3 |
| パフォーマンス | 3 | 6 | 5 |

---

## 1. セキュリティ（最優先）

### Critical

| # | 問題 | ファイル | 影響 |
|---|------|---------|------|
| S-1 | **loginRateLimit が定義のみで未使用** — ブルートフォース攻撃が無制限 | `lib/rate-limit.ts` / `auth.ts` | ログイン試行回数を制限できず、パスワード総当たりが可能 |
| S-2 | **apiRateLimit も未使用** — Server Actions に制限なし | 同上 | DDoS でサーバーが飽和する |
| S-3 | **update/delete で所有権チェックがない** — IDOR 脆弱性 | `features/brands/actions.ts`, `features/pr-items/actions.ts` | 他テナントのリソースを ID 指定で変更・削除できる可能性 |
| S-4 | **sortBy がホワイトリスト検証されていない** | `features/pr-items/queries.ts` L83 | `orderBy: { [sortBy]: sortOrder }` にユーザー入力を直接渡しており、任意フィールドでソート可能 |
| S-5 | **NEXTAUTH_SECRET がプレースホルダー** | `.env.local` | `"development-secret-change-in-production"` — JWT 偽造が可能 |
| S-6 | **Content Security Policy (CSP) が未設定** | `next.config.ts` | XSS 攻撃の緩和策がない |
| S-7 | **JWT トークンの有効期限が未設定** | `auth.ts` | 盗まれたトークンが無期限に有効 |
| S-8 | **URL バリデーションで javascript: スキームを除外していない** | `features/pr-items/schemas.ts` | `.url()` のみで危険なプロトコルを許可 |

### Medium

| # | 問題 | ファイル |
|---|------|---------|
| S-9 | パスワード複雑性要件がない（長さ > 0 のみ） | `features/auth/components/LoginForm.tsx` |
| S-10 | seed.ts にハードコード済み認証情報（`password123`）、本番ガードなし | `prisma/seed.ts` |
| S-11 | エラーメッセージで必要な権限名を露出 | `lib/authorization.ts` |
| S-12 | 文字列フィールドに `.max()` がなく、DB 肥大化 DoS の可能性 | 各 `schemas.ts` |
| S-13 | 認可失敗のログが取られていない | `lib/authorization.ts` |
| S-14 | AuditLog モデルが存在するが一切書き込まれていない | 全 actions |
| S-15 | 本番でも `console.error` でログ出力 | `lib/logger.ts` |

---

## 2. コード品質

### Critical

| # | 問題 | ファイル | 詳細 |
|---|------|---------|------|
| C-1 | **テストファイルが 0 件** | `src/__tests__/` | setup.ts のみ存在、ビジネスロジックのテストなし |
| C-2 | エラーハンドリングが一律 catch → generic message | 全 `actions.ts` | バリデーション・認証・DB エラーの区別がつかない |
| C-3 | バリデーション失敗時に最初のエラーだけ返す | `brands/actions.ts` L16-20 | フィールドごとのエラーが表示されない |
| C-4 | delete 時に存在チェックがなく、常に success を返す | `brands/actions.ts`, `pr-items/actions.ts` | 404 と成功を区別できない |
| C-5 | `hasMore` を受け取るが Load More が未実装 | `pr-items/page.tsx` | ページネーションが動かない |
| C-6 | `hasPermission` 関数が未使用のデッドコード | `lib/authorization.ts` |

### Medium

| # | 問題 | 詳細 |
|---|------|------|
| C-7 | フィルター状態を useState で管理 → URL と乖離するレースコンディション | `PrItemListTable.tsx` |
| C-8 | Prisma Extension の create で既存の tenantId を上書きする可能性 | `lib/prisma.ts` |
| C-9 | レート制限の閾値がマジックナンバー | `lib/rate-limit.ts` |
| C-10 | Dashboard チャートの `percent` が undefined になり NaN 表示 | `DashboardCharts.tsx` |
| C-11 | toast にタイムアウト指定がなくエラーが一瞬で消える | 各 Form コンポーネント |
| C-12 | Tenant B の seed データが空で比較テスト不可 | `prisma/seed.ts` |

---

## 3. パフォーマンス

### Critical

| # | 問題 | ファイル | 影響 |
|---|------|---------|------|
| P-1 | **ダッシュボードの groupBy に LIMIT なし** — 大量データでフルスキャン | `dashboard/queries.ts` L24-28 | テナントのデータ量増加で応答時間が線形に悪化 |
| P-2 | **`tenantId + brandId + mediaType` の複合インデックスがない** | `prisma/schema.prisma` | テーブルスキャンが発生 |
| P-3 | **キャッシュレイヤーが一切ない** — 全クエリが毎回 DB 直撃 | 全 `queries.ts` | 同じダッシュボードの繰り返し表示でも毎回 DB アクセス |

### Medium

| # | 問題 | 詳細 |
|---|------|------|
| P-4 | PR一覧で `include: { brand: true }` が全カラム取得 → `select` で絞るべき | `pr-items/queries.ts` |
| P-5 | ブランド一覧で関連 PR Items を常に 10 件読み込む（一覧では不要） | `brands/queries.ts` |
| P-6 | Recharts の chartData が毎レンダーで再計算 → `useMemo` すべき | `DashboardCharts.tsx` |
| P-7 | 比較ページの Recharts がメインバンドルに含まれる → `dynamic import` すべき | `CompareCharts.tsx` |
| P-8 | DB コネクションプーリングの設定がデフォルトのまま | DATABASE_URL |
| P-9 | next/image を使わず画像最適化されていない | ブランドロゴ表示箇所 |

---

## 4. UI/UX

### Critical

| # | 問題 | 詳細 |
|---|------|------|
| U-1 | **Error Boundary が未実装** — コンポーネントエラーで白画面 | 全ページ |
| U-2 | ローディングスケルトンが一部ページにしかない | edit ページ等 |
| U-3 | 空状態に「最初のブランドを作成」等のアクション導線がない | テーブルコンポーネント |
| U-4 | テーブル行クリックにキーボードナビ不可、`aria-role` なし | `BrandListTable.tsx`, `PrItemListTable.tsx` |
| U-5 | フォームがリアルタイムバリデーションなし（submit 後にしかエラー表示されない） | 各 Form |

### Medium

| # | 問題 | 詳細 |
|---|------|------|
| U-6 | アイコンボタンに `aria-label` がない | `Header.tsx` 等 |
| U-7 | 各ページで `metadata` をエクスポートしていない → タブ識別不可 | 全ページ |
| U-8 | 切り詰めテキストにツールチップがない | テーブルのタイトル列 |
| U-9 | フォーム送信後のフォーカス管理がない → スクリーンリーダーに不親切 | 各 Form |
| U-10 | ボタン状態が disabled/not disabled の 2 値のみ → success/error 表現なし | 各 Form |
| U-11 | ダークモードのコントラスト比が WCAG AA 未達の可能性 | `globals.css` |
| U-12 | Optimistic Update 未実装 → 低速回線で操作がもたつく | 全 Form |

---

## 対応ロードマップ（推奨）

### Phase 1: プロダクション前に必須（1-2 週間）

1. NEXTAUTH_SECRET をランダム生成に変更
2. loginRateLimit / apiRateLimit を実際に適用
3. update/delete に所有権チェック追加
4. sortBy のホワイトリスト検証
5. CSP ヘッダー追加
6. JWT 有効期限の設定
7. Error Boundary の実装
8. 複合インデックスの追加

### Phase 2: 次リリース（2-4 週間）

1. テストスイートの整備（認可ロジック、スキーマ、クエリ）
2. フィールドごとのバリデーションエラー表示
3. キャッシュレイヤー導入（`revalidateTag` or Redis）
4. Recharts の dynamic import 化
5. `select` でクエリ最適化
6. アクセシビリティ改善（aria-label、キーボード操作）
7. 監査ログの実装

### Phase 3: バックログ

1. i18n 対応
2. キーボードショートカット
3. PWA / Service Worker
4. 印刷用スタイルシート
5. Web Vitals モニタリング
