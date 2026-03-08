# PRism 技術実装ガイド v3.0

> Production-Ready B2B SaaS：環境構築からCI/CDまで、グローバル基準の完全実装指示書

---

## 1. ドキュメントの使い方

本ドキュメントは、Next.js (App Router) + TypeScript環境下で、AIコーディングエージェント（Claude Code等）に自律的な実装を行わせるための指示書です。

**実行の流れ:**

1. 「セクション3: 共通システムプロンプト」をコピーしてAIに渡す
2. 続けて該当フェーズのプロンプト（セクション9〜15）をコピーして渡す
3. 各フェーズ完了後、「セクション16: セキュリティチェックリスト」で漏れを確認

一度にすべてを指示するとAIのコンテキストが溢れるため、**フェーズごとに分割して実行**してください。

---

## 2. 技術スタック

| レイヤー | 技術 | バージョン目安 | 用途 |
|---|---|---|---|
| Runtime | Node.js | 20 LTS | サーバー実行環境 |
| Framework | Next.js (App Router) + TypeScript | 15.x | フルスタックフレームワーク |
| Styling | Tailwind CSS | 4.x | ユーティリティCSS |
| UI Components | shadcn/ui + lucide-react | latest | プリビルトUIコンポーネント |
| ORM | Prisma | 6.x | DB操作・マイグレーション |
| Database | PostgreSQL (Supabase) | 16.x | データ永続化 |
| Auth | Auth.js (NextAuth v5) | 5.x beta | 認証・セッション管理 |
| Validation | Zod | 3.x | スキーマバリデーション・型導出 |
| Forms | React Hook Form + @hookform/resolvers | 7.x | フォーム状態管理 |
| Charts | Recharts | 2.x | データ可視化 |
| Toast | Sonner | 1.x | 通知UI |
| Password | bcryptjs | latest | パスワードハッシュ化 |
| Error Tracking | Sentry (@sentry/nextjs) | latest | 本番エラー監視 |
| Rate Limiting | @upstash/ratelimit + @upstash/redis | latest | ブルートフォース防御 |
| Testing | Vitest + Playwright | latest | ユニット/E2Eテスト |
| CI/CD | GitHub Actions | — | 自動テスト・デプロイ |

---

## 3. 共通システムプロンプト

**毎回指示の冒頭に含める基本ルール：**

```
あなたは優秀なシニアフルスタックエンジニアです。
Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Prisma + PostgreSQL + Auth.js (NextAuth v5) を使用して、B2B SaaS型「PRism（PR戦略分析アプリ）」を構築しています。

【絶対厳守のアーキテクチャ・セキュリティルール】

1. マルチテナントの自動分離:
   DBアクセスには必ず `getTenantPrisma(tenantId)` を使用してください。素の `prisma` を直接使ってはいけません。この関数は Prisma Client Extension でテナントフィルタを全クエリに自動注入します。tenantId は `await auth()` から取得してください。

2. 認可（RBAC）:
   データの削除やテナント管理など権限が必要な操作では、`authorize(permission)` を使用してください。これは OWNER / ADMIN / MEMBER のロールに基づいて権限をチェックします。

3. 責務の分離 (Feature-Driven):
   `src/app/` 配下（Server Component）はルーティングとデータの受け渡しのみ。業務ロジック・UIコンポーネントは `src/features/{domain}/` 配下に配置してください。

4. データミューテーション:
   データの追加・更新・削除には必ず Server Actions (`"use server"`) を使用し、Zodによる厳密な入力バリデーションを行ってください。

5. UIの実装:
   `shadcn/ui` のコンポーネントと `lucide-react` のアイコンを使用してください。ダークモードは `dark:` プレフィックスで対応。PESO区分の色は `PESO_COLORS` 定数を使用。

6. エラーハンドリング:
   Server Actions は必ず `ActionResult` 型を返してください。catch内では `captureError()` でSentryに送信。クライアント側では `sonner` の `toast()` で通知。

7. キャッシュ再検証:
   Server Actions でデータ変更後は `revalidatePath()` を呼んでください。`router.refresh()` は禁止。

8. 型定義:
   Zodスキーマを Single Source of Truth とし、`z.infer<typeof schema>` で型を導出。Prismaの生成型はDBアクセス層のみで使用。

9. ソフトデリート:
   データ削除は物理削除ではなく `deletedAt` フィールドの更新で行ってください。クエリ時は常に `deletedAt: null` でフィルタしてください。

10. ページネーション:
    一覧系クエリはカーソルベースページネーション（take + 1 パターン）で実装してください。
```

---

## 4. 共通パターン定義

### 4.1 ActionResult 型

```typescript
// src/types/actions.ts
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };
```

### 4.2 テナント分離Prismaクライアント（自動注入）

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const basePrisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = basePrisma;
}

// ★ テナント分離を自動化する Prisma Client Extension
// 全クエリに tenantId フィルタを自動注入する。
// 開発者が where: { tenantId } を書き忘れてもデータ漏洩しない。
export function getTenantPrisma(tenantId: string) {
  return basePrisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async findUnique({ args, query }) {
          // findUnique は where に tenantId を直接追加できないため、
          // 結果取得後にテナントチェックする
          const result = await query(args);
          if (result && "tenantId" in result && result.tenantId !== tenantId) {
            return null;
          }
          return result;
        },
        async create({ args, query }) {
          args.data = { ...args.data, tenantId };
          return query(args);
        },
        async update({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async updateMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async delete({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async deleteMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async count({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async aggregate({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async groupBy({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
      },
    },
  });
}
```

### 4.3 RBAC（ロールベースアクセス制御）

```typescript
// src/lib/authorization.ts
import { auth } from "@/auth";
import { Role } from "@prisma/client";

export type Permission =
  | "brand:create"
  | "brand:update"
  | "brand:delete"
  | "pr-item:create"
  | "pr-item:update"
  | "pr-item:delete"
  | "tenant:manage"
  | "user:invite"
  | "user:remove";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: [
    "brand:create", "brand:update", "brand:delete",
    "pr-item:create", "pr-item:update", "pr-item:delete",
    "tenant:manage", "user:invite", "user:remove",
  ],
  ADMIN: [
    "brand:create", "brand:update", "brand:delete",
    "pr-item:create", "pr-item:update", "pr-item:delete",
    "user:invite",
  ],
  MEMBER: [
    "brand:create", "brand:update",
    "pr-item:create", "pr-item:update",
  ],
};

export async function authorize(permission: Permission) {
  const session = await auth();
  if (!session?.user?.tenantId || !session?.user?.role) {
    throw new Error("認証エラー: ログインしてください");
  }

  const role = session.user.role as Role;
  const allowed = ROLE_PERMISSIONS[role];

  if (!allowed.includes(permission)) {
    throw new Error(`権限エラー: この操作には ${permission} 権限が必要です`);
  }

  return session;
}

// ヘルパー: 権限チェックのみ（throw しない）
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
```

### 4.4 エラーロギング（Sentry統合）

```typescript
// src/lib/logger.ts
import * as Sentry from "@sentry/nextjs";

export function captureError(
  error: unknown,
  context?: Record<string, unknown>
) {
  console.error("[PRism Error]", error);

  if (process.env.NODE_ENV === "production") {
    Sentry.captureException(error, {
      extra: {
        ...context,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

// テナントコンテキスト付きログ
export function captureErrorWithTenant(
  error: unknown,
  tenantId: string,
  context?: Record<string, unknown>
) {
  Sentry.withScope((scope) => {
    scope.setTag("tenantId", tenantId);
    captureError(error, context);
  });
}
```

### 4.5 Rate Limiting

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ログイン: 60秒に5回まで
export const loginRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  prefix: "ratelimit:login",
});

// API全般: 60秒に30回まで
export const apiRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, "60 s"),
  prefix: "ratelimit:api",
});
```

### 4.6 Server Actions テンプレート（v3 完全版）

```typescript
// src/features/{domain}/actions.ts
"use server";

import { auth } from "@/auth";
import { getTenantPrisma } from "@/lib/prisma";
import { authorize } from "@/lib/authorization";
import { captureErrorWithTenant } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/actions";
import { brandFormSchema } from "./schemas";

export async function createBrand(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  let tenantId = "";
  try {
    // 1. 認証＋認可
    const session = await authorize("brand:create");
    tenantId = session.user.tenantId;

    // 2. バリデーション（input は unknown で受け取り、Zodで検証）
    const parsed = brandFormSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // 3. DB操作（テナント分離は自動）
    const prisma = getTenantPrisma(tenantId);
    const brand = await prisma.brand.create({
      data: parsed.data,
    });

    // 4. キャッシュ再検証
    revalidatePath("/brands");
    revalidatePath("/"); // ダッシュボードのKPIも更新

    return { success: true, data: { id: brand.id } };
  } catch (error) {
    captureErrorWithTenant(error, tenantId, {
      action: "createBrand",
      input,
    });
    return { success: false, error: "ブランドの作成に失敗しました" };
  }
}

// ソフトデリート版
export async function deleteBrand(
  id: string
): Promise<ActionResult> {
  let tenantId = "";
  try {
    const session = await authorize("brand:delete"); // OWNER/ADMINのみ
    tenantId = session.user.tenantId;

    const prisma = getTenantPrisma(tenantId);
    await prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() }, // ★ 物理削除ではなくソフトデリート
    });

    revalidatePath("/brands");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    captureErrorWithTenant(error, tenantId, {
      action: "deleteBrand",
      id,
    });
    return { success: false, error: "ブランドの削除に失敗しました" };
  }
}
```

### 4.7 クエリ関数テンプレート（ページネーション付き）

```typescript
// src/features/{domain}/queries.ts
import { auth } from "@/auth";
import { getTenantPrisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { MediaType } from "@/lib/constants";

// ページネーション共通型
export type PaginatedResult<T> = {
  data: T[];
  nextCursor: string | null;
  totalCount: number;
};

export type PrItemQueryParams = {
  cursor?: string;
  take?: number;
  brandId?: string;
  mediaType?: MediaType;
  sortBy?: "publishedAt" | "engagementCount";
  sortOrder?: "asc" | "desc";
};

export async function getPrItems(
  params: PrItemQueryParams = {}
): Promise<PaginatedResult<any>> {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const prisma = getTenantPrisma(session.user.tenantId);
  const { cursor, take = 20, brandId, mediaType, sortBy = "publishedAt", sortOrder = "desc" } = params;

  // フィルタ構築
  const where: any = { deletedAt: null }; // ★ ソフトデリート済みを除外
  if (brandId) where.brandId = brandId;
  if (mediaType) where.mediaType = mediaType;

  // カーソルベースページネーション
  const [items, totalCount] = await Promise.all([
    prisma.prItem.findMany({
      where,
      take: take + 1, // ★ 1件多く取得して「次ページ有無」を判定
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { [sortBy]: sortOrder },
      include: { brand: { select: { id: true, name: true } } },
    }),
    prisma.prItem.count({ where }),
  ]);

  const hasMore = items.length > take;
  const data = hasMore ? items.slice(0, -1) : items;

  return {
    data,
    nextCursor: hasMore ? data[data.length - 1].id : null,
    totalCount,
  };
}
```

### 4.8 クライアント側フォーム送信パターン

```typescript
// src/features/{domain}/components/BrandForm.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createBrand } from "../actions";
import { brandFormSchema, type BrandFormInput } from "../schemas";

export function BrandForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<BrandFormInput>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: { name: "", category: "" },
  });

  const onSubmit = (data: BrandFormInput) => {
    startTransition(async () => {
      const result = await createBrand(data);
      if (result.success) {
        toast.success("ブランドを作成しました");
        router.push("/brands");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ブランド名</FormLabel>
              <FormControl>
                <Input placeholder="例: CLAYGE" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* 他のフィールドも同様 */}
        <Button type="submit" disabled={isPending}>
          {isPending ? "作成中..." : "作成する"}
        </Button>
      </form>
    </Form>
  );
}
```

### 4.9 ローディング・エラーUI

```typescript
// src/app/(dashboard)/brands/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
```

```typescript
// src/app/(dashboard)/brands/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { captureError } from "@/lib/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error, { page: "brands" });
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h2 className="text-lg font-semibold">エラーが発生しました</h2>
      <p className="text-muted-foreground text-sm">{error.message}</p>
      <Button onClick={reset} variant="outline">再試行</Button>
    </div>
  );
}
```

### 4.10 PESO カラー定数

```typescript
// src/lib/constants.ts
export const PESO_COLORS = {
  PAID:   { label: "Paid",   color: "#F59E0B", bg: "bg-amber-100 dark:bg-amber-900/30",  text: "text-amber-800 dark:text-amber-200"  },
  EARNED: { label: "Earned", color: "#3B82F6", bg: "bg-blue-100 dark:bg-blue-900/30",   text: "text-blue-800 dark:text-blue-200"   },
  SHARED: { label: "Shared", color: "#10B981", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-800 dark:text-emerald-200" },
  OWNED:  { label: "Owned",  color: "#8B5CF6", bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-800 dark:text-violet-200" },
} as const;

export type MediaType = keyof typeof PESO_COLORS;

export const SOURCE_TYPES = [
  "Instagram", "X (Twitter)", "TikTok", "YouTube",
  "PR TIMES", "Web Media", "テレビ", "新聞・雑誌", "その他",
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];
```

---

## 5. ディレクトリ構成

```
.github/
└── workflows/
    └── ci.yml                        # ★ CI/CD パイプライン

prisma/
├── schema.prisma
└── seed.ts

src/
├── app/
│   ├── layout.tsx                    # Toaster, ThemeProvider 設定
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # ダッシュボード
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── brands/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── pr-items/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── compare/
│   │       └── page.tsx
│   └── api/
│       └── auth/[...nextauth]/route.ts
├── features/
│   ├── auth/
│   │   └── components/LoginForm.tsx
│   ├── brands/
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   ├── schemas.ts                # Zodスキーマ + 型エクスポート
│   │   └── components/
│   │       ├── BrandListTable.tsx
│   │       ├── BrandForm.tsx
│   │       └── BrandDetailCard.tsx
│   ├── dashboard/
│   │   ├── queries.ts
│   │   └── components/
│   │       ├── DashboardKpiCards.tsx
│   │       ├── DashboardCharts.tsx
│   │       └── RecentPrItemsTable.tsx
│   ├── pr-items/
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   ├── schemas.ts
│   │   └── components/
│   │       ├── PrItemListTable.tsx
│   │       └── PrItemForm.tsx
│   └── compare/
│       ├── queries.ts
│       └── components/
│           ├── CompareSelector.tsx
│           └── CompareCharts.tsx
├── components/
│   ├── ui/                           # shadcn/ui
│   └── layouts/
│       └── DashboardLayout.tsx
├── lib/
│   ├── prisma.ts                     # テナント分離 Client Extension
│   ├── authorization.ts              # ★ RBAC
│   ├── logger.ts                     # ★ Sentry統合ロガー
│   ├── rate-limit.ts                 # ★ Rate Limiting
│   └── constants.ts                  # PESO_COLORS, SOURCE_TYPES
├── types/
│   ├── next-auth.d.ts
│   └── actions.ts
├── auth.ts
├── middleware.ts
└── __tests__/                        # ★ テスト
    ├── setup.ts
    ├── unit/
    │   └── schemas.test.ts
    ├── integration/
    │   └── tenant-isolation.test.ts
    └── e2e/
        └── auth-flow.spec.ts
```

---

## 6. DBスキーマ定義（Prisma）

### 6.1 完全な schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")    // ★ マイグレーション用（プーリング回避）
}

// ============================================================
// Enums
// ============================================================

enum Role {
  OWNER
  ADMIN
  MEMBER
}

enum MediaType {
  PAID
  EARNED
  SHARED
  OWNED
}

// ============================================================
// マルチテナント基盤
// ============================================================

model Tenant {
  id        String   @id @default(uuid())
  name      String
  plan      String   @default("starter")  // starter | pro | agency
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users      User[]
  companies  Company[]
  brands     Brand[]
  prItems    PrItem[]
  tags       Tag[]
  notes      Note[]
  auditLogs  AuditLog[]
}

model User {
  id             String    @id @default(uuid())
  email          String    @unique
  hashedPassword String
  name           String
  role           Role      @default(MEMBER)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  deletedAt      DateTime?                     // ★ ソフトデリート

  tenantId       String
  tenant         Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  notes          Note[]
  auditLogs      AuditLog[]

  @@index([tenantId])
  @@index([email])
}

// ============================================================
// PR分析ドメイン
// ============================================================

model Company {
  id          String    @id @default(uuid())
  name        String
  industry    String?
  website     String?
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?                       // ★ ソフトデリート

  tenantId    String
  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  brands      Brand[]

  @@index([tenantId])
}

model Brand {
  id          String    @id @default(uuid())
  name        String
  category    String?
  logoUrl     String?
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?                       // ★ ソフトデリート

  tenantId    String
  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  companyId   String
  company     Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)

  prItems     PrItem[]

  @@index([tenantId])
  @@index([companyId])
}

model PrItem {
  id               String     @id @default(uuid())
  title            String
  summary          String?
  sourceType       String                       // "Instagram", "PR TIMES" 等
  sourceUrl        String?
  mediaType        MediaType
  channel          String?
  engagementCount  Int        @default(0)
  reachCount       Int?
  publishedAt      DateTime?
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
  deletedAt        DateTime?                    // ★ ソフトデリート

  tenantId         String
  tenant           Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  brandId          String
  brand            Brand      @relation(fields: [brandId], references: [id], onDelete: Cascade)

  tags             PrItemTag[]
  notes            Note[]

  @@index([tenantId])
  @@index([brandId])
  @@index([mediaType])
  @@index([publishedAt])
  @@index([tenantId, brandId, mediaType])      // ★ 複合インデックス（比較クエリ高速化）
}

// ============================================================
// タグ・メモ（補助）
// ============================================================

model Tag {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())

  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  prItems   PrItemTag[]

  @@unique([tenantId, name])
  @@index([tenantId])
}

model PrItemTag {
  prItemId String
  prItem   PrItem @relation(fields: [prItemId], references: [id], onDelete: Cascade)
  tagId    String
  tag      Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([prItemId, tagId])
}

model Note {
  id        String   @id @default(uuid())
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  prItemId  String
  prItem    PrItem   @relation(fields: [prItemId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([prItemId])
}

// ============================================================
// ★ 監査ログ（誰が・いつ・何を変更したか）
// ============================================================

model AuditLog {
  id         String   @id @default(uuid())
  action     String                            // "create" | "update" | "delete"
  entityType String                            // "Brand" | "PrItem" 等
  entityId   String
  changes    Json?                             // 変更前後のdiff
  createdAt  DateTime @default(now())

  tenantId   String
  tenant     Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([entityType, entityId])
  @@index([createdAt])
}
```

### 6.2 モデル関連図

```
Tenant (企業)
 ├── User (社員)             ← tenantId, deletedAt
 ├── Company (分析対象企業)   ← tenantId, deletedAt
 │    └── Brand (ブランド)    ← tenantId, companyId, deletedAt
 │         └── PrItem (施策)  ← tenantId, brandId, deletedAt
 │              ├── PrItemTag ← prItemId, tagId
 │              └── Note      ← tenantId, userId, prItemId
 ├── Tag (タグ)              ← tenantId
 └── AuditLog (監査ログ)     ← tenantId, userId   ★ 新規
```

---

## 7. セキュリティ設定

### 7.1 next.config.ts セキュリティヘッダー

```typescript
// next.config.ts
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
```

### 7.2 環境変数テンプレート

```env
# .env.local

# ── Database ──
DATABASE_URL="postgresql://postgres:password@localhost:5432/prism?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/prism?schema=public"

# ── Auth.js ──
NEXTAUTH_SECRET="openssl rand -base64 32 で生成した値"
NEXTAUTH_URL="http://localhost:3000"

# ── Sentry ──
SENTRY_DSN="https://xxx@sentry.io/xxx"
SENTRY_AUTH_TOKEN="sntrys_xxx"

# ── Upstash Redis (Rate Limiting) ──
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"
```

---

## 8. CI/CD パイプライン

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/prism_test

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: prism_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      # Lint
      - run: npm run lint

      # Type check
      - run: npx tsc --noEmit

      # DB setup
      - run: npx prisma migrate deploy
      - run: npx prisma db seed

      # Unit & Integration tests
      - run: npm run test -- --run

      # Build check
      - run: npm run build

  e2e:
    runs-on: ubuntu-latest
    needs: lint-and-test

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: prism_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npx playwright install --with-deps

      - run: npx prisma migrate deploy
      - run: npx prisma db seed

      - run: npm run test:e2e
```

---

## 9. Phase 0: 環境構築

**目的**: 開発を始められる状態を作る。

```
以下のコマンドを順番に実行し、PRismプロジェクトの初期環境を構築してください。

# 1. Next.js プロジェクト作成
npx create-next-app@latest prism --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd prism

# 2. 依存パッケージのインストール

## Core
npm install prisma @prisma/client next-auth@beta @auth/prisma-adapter
npm install zod react-hook-form @hookform/resolvers
npm install recharts lucide-react sonner bcryptjs
npm install -D @types/bcryptjs

## Security & Observability
npm install @sentry/nextjs @upstash/ratelimit @upstash/redis

## Testing
npm install -D vitest @vitejs/plugin-react playwright @playwright/test

# 3. shadcn/ui の初期化
npx shadcn@latest init
npx shadcn@latest add button card input label table dialog form select skeleton badge tabs separator dropdown-menu sheet avatar tooltip

# 4. Prisma の初期化
npx prisma init

# 5. 以下のファイルをセクション4〜7の定義通りに作成:
- `.env.local`（セクション7.2）
- `prisma/schema.prisma`（セクション6.1）
- `src/lib/prisma.ts`（セクション4.2）
- `src/lib/authorization.ts`（セクション4.3）
- `src/lib/logger.ts`（セクション4.4）
- `src/lib/rate-limit.ts`（セクション4.5）
- `src/lib/constants.ts`（セクション4.10）
- `src/types/actions.ts`（セクション4.1）
- `next.config.ts`（セクション7.1）
- `.github/workflows/ci.yml`（セクション8）

# 6. Sonner の設定
`src/app/layout.tsx` の `<body>` 内に `<Toaster />` を追加:
```tsx
import { Toaster } from "sonner";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
```

# 7. Vitest 設定
`vitest.config.ts` を作成:
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

# 8. package.json scripts に追加:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:reset": "prisma migrate reset"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```
```

---

## 10. Phase 1: DBスキーマ＆認証基盤

**目的**: マルチテナントSaaSの土台となるデータ構造と、セキュアなログイン環境の構築。

```
上記の【共通ルール】に従い、以下のミッションを実行してください。

# 1. DBマイグレーション
セクション6.1の schema.prisma が配置済みであることを確認し、以下を実行:
  npx prisma migrate dev --name init
  npx prisma generate

# 2. 初期データ (Seed)
`prisma/seed.ts` を作成し、以下のデータを投入。

テナントA: "デモPR株式会社"
  - ユーザー: demo@prism.example.com / password123（bcryptでハッシュ化）、Role: OWNER
  - Company: "株式会社I-ne"（業界: コスメ・美容）
  - Brand 1: "CLAYGE（クレージュ）"（カテゴリ: ヘアケア・スキンケア）
  - Brand 2: "BOTANIST（ボタニスト）"（カテゴリ: ヘアケア）
  - PrItem 10件:

    CLAYGE:
    1. sourceType: "Instagram", mediaType: EARNED, channel: "美容系インフルエンサーA（フォロワー10万）", title: "春の新作シャンプー、ガチレビュー！", summary: "泥パック成分配合で頭皮スッキリ。香りがデパコス級と高評価。", engagementCount: 4500, publishedAt: 2日前
    2. sourceType: "PR TIMES", mediaType: OWNED, channel: "公式", title: "シリーズ累計2000万個突破！春の限定パッケージ発売", summary: "ロフト・プラザで先行発売開始。SNSキャンペーンも同時開催。", engagementCount: 120, publishedAt: 5日前
    3. sourceType: "Web Media", mediaType: PAID, channel: "WWD JAPAN", title: "なぜCLAYGEは若年層にウケるのか？ヒットの裏側", summary: "成分へのこだわりとSNSを起点としたUGC創出の戦略を解剖。", engagementCount: 850, publishedAt: 10日前
    4. sourceType: "X (Twitter)", mediaType: SHARED, channel: "一般ユーザーの口コミ", title: "CLAYGEのシャンプー使ったけど神すぎ", summary: "香りが続く、泡立ちが良いと高評価ツイートが拡散。", engagementCount: 2200, publishedAt: 3日前
    5. sourceType: "TikTok", mediaType: EARNED, channel: "美容系TikToker B（フォロワー50万）", title: "ドラコスなのにサロン級!? CLAYGEレビュー", summary: "動画再生数100万回超。コメント欄で購入報告多数。", engagementCount: 12000, publishedAt: 7日前

    BOTANIST:
    6. sourceType: "PR TIMES", mediaType: OWNED, channel: "公式", title: "BOTANISTリブランディング発表", summary: "サステナブル路線を強化。パッケージを100%再生プラに変更。", engagementCount: 350, publishedAt: 4日前
    7. sourceType: "Instagram", mediaType: PAID, channel: "ライフスタイル系メディアC", title: "【PR】春のヘアケアルーティンにBOTANIST", summary: "タイアップ投稿。ナチュラルなライフスタイルとの親和性を訴求。", engagementCount: 1800, publishedAt: 6日前
    8. sourceType: "Web Media", mediaType: EARNED, channel: "コスメ情報サイトD", title: "2025年春のシャンプーランキング1位はBOTANIST", summary: "編集部が選ぶベストコスメ。成分と香りの評価が高い。", engagementCount: 3200, publishedAt: 8日前
    9. sourceType: "X (Twitter)", mediaType: SHARED, channel: "一般ユーザーの口コミ", title: "BOTANISTの新しいパッケージおしゃれすぎる", summary: "リブランディング後のパッケージデザインが好評。写真付き投稿が拡散。", engagementCount: 950, publishedAt: 1日前
    10. sourceType: "YouTube", mediaType: EARNED, channel: "美容系YouTuber E（登録者30万）", title: "BOTANISTvsクレージュ ガチ比較レビュー", summary: "泡立ち・香り・仕上がりを5項目で比較。甲乙つけがたいとの結論。", engagementCount: 8500, publishedAt: 12日前

テナントB: "B社マーケティング"
  - ユーザー: test@prism.example.com / password123、Role: OWNER
  - データなし（空テナント。テナント分離テスト用）

# 3. 認証基盤 (Auth.js v5)
- `src/types/next-auth.d.ts`: Session, User, JWT に tenantId と role を追加
- `src/auth.ts`:
  - CredentialsProvider
  - authorize: emailでUser検索 → deletedAt: null を確認 → bcryptjs.compare
  - jwtコールバック: tenantId, role をトークンに焼き付け
  - sessionコールバック: session.user に tenantId, role を反映
- `src/middleware.ts`:
  - `/login`, `/api/auth`, `/_next`, `/favicon.ico` 以外を保護
  - 未ログイン → `/login` リダイレクト
  - ★ Rate Limiting: ログインエンドポイントに loginRateLimit を適用

# 4. ログイン画面
`src/app/(auth)/login/page.tsx` + `src/features/auth/components/LoginForm.tsx`
- shadcn/ui Input + Label + Button
- React Hook Form + Zod
- signIn("credentials", ...) → 成功時 `/` にリダイレクト
- 失敗時 toast.error()
- 中央配置カード、PRismロゴ上部（「PR」bold +「ism」light）

# 5. ★ テナント分離テストの作成
`src/__tests__/integration/tenant-isolation.test.ts` を作成:
- テナントAのPrismaでテナントBのデータが取得できないことを検証
- テナントAのPrismaでcreateしたデータにテナントAのtenantIdが自動設定されることを検証
```

---

## 11. Phase 2: ダッシュボード＆ブランド管理

**目的**: ログイン直後のKPI把握と、「ブランド」の登録・管理。

```
上記の【共通ルール】に従い、以下のミッションを実行してください。
★ 重要: DBアクセスにはすべて getTenantPrisma(tenantId) を使用。素の prisma は禁止。
★ 重要: 全クエリに deletedAt: null フィルタを含めること。
★ 重要: 削除系アクションでは authorize("brand:delete") で権限チェック。

# 1. 共通レイアウト
`src/app/(dashboard)/layout.tsx` を作成。
- サイドバー:
  - PRismロゴ（「PR」font-bold + 「ism」font-light）
  - ナビ: ダッシュボード(LayoutDashboard), ブランド管理(Tag), PRデータ(FileText), 比較分析(BarChart3)
  - usePathname でアクティブリンクハイライト
- ヘッダー: ページタイトル + ユーザー名 + ログアウト(LogOut)
- モバイル: sm以下でサイドバーを Sheet に変換
- ★ ダークモード対応: dark: プレフィックスでスタイル切替

# 2. ブランド管理 (`src/features/brands/`)
schemas.ts:
  brandFormSchema: name(必須min1), category(optional), companyId(必須uuid)
  export type BrandFormInput = z.infer<typeof brandFormSchema>

queries.ts:（getTenantPrisma使用）
  getBrands(): deletedAt:null, Company include, createdAt desc
  getBrandById(id): deletedAt:null, Company + PrItems include

actions.ts:（セクション4.6のテンプレートに従う）
  createBrand: authorize("brand:create"), revalidatePath("/brands"), revalidatePath("/")
  updateBrand: authorize("brand:update")
  deleteBrand: authorize("brand:delete"), ソフトデリート（deletedAt更新）

components/:
  BrandListTable.tsx: Table、ブランド名・カテゴリ・企業名・PrItem件数、行クリック→詳細
  BrandForm.tsx: セクション4.8のパターンに従う
  BrandDetailCard.tsx: Card + 関連PrItem件数 + 編集/削除ボタン（削除はDialogで確認）

ルーティング:
  brands/page.tsx: 一覧 + 右上「新規作成」ボタン
  brands/new/page.tsx: 新規登録フォーム
  brands/[id]/page.tsx: 詳細 + 編集 + 削除
  brands/loading.tsx: Skeleton

# 3. ダッシュボード (`src/features/dashboard/`)
queries.ts:
  getDashboardStats(): 1関数で以下を返す
  - brandCount（deletedAt:null のもの）
  - prItemCount（deletedAt:null のもの）
  - mediaTypeDistribution: PrItem を mediaType で groupBy
  - recentPrItems: 直近5件（Brand include）

components/:
  DashboardKpiCards.tsx: 4枚のCard（ブランド数、PRデータ数、EARNED比率、平均エンゲージメント）+ lucide icon
  DashboardCharts.tsx: Recharts PieChart（PESO_COLORS使用）、★ height={300} 必須指定、ResponsiveContainer使用
  RecentPrItemsTable.tsx: 直近5件、Badge でメディア区分色分け

ルーティング:
  (dashboard)/page.tsx に3コンポーネントを統合
```

---

## 12. Phase 3: PRデータ管理＆比較分析

**目的**: 施策データの蓄積とブランド間の比較分析。

```
上記の【共通ルール】に従い、以下のミッションを実行してください。
★ getTenantPrisma 使用。deletedAt: null フィルタ必須。

# 1. PRデータ管理 (`src/features/pr-items/`)
schemas.ts:
  prItemFormSchema:
  - title: string min1
  - summary: string optional
  - sourceType: string min1（SOURCE_TYPES定数参照）
  - sourceUrl: string url optional
  - mediaType: z.nativeEnum(MediaType)
  - channel: string optional
  - engagementCount: number min0 default0
  - reachCount: number optional
  - publishedAt: date optional
  - brandId: string uuid

queries.ts:（★ カーソルベースページネーション、セクション4.7参照）
  getPrItems(params): PaginatedResult を返す。フィルタ・ソート対応
  getPrItemById(id): Brand + Notes include

actions.ts:
  createPrItem: authorize("pr-item:create"), revalidatePath("/pr-items") + revalidatePath("/")
  updatePrItem: authorize("pr-item:update")
  deletePrItem: authorize("pr-item:delete"), ソフトデリート

components/:
  PrItemListTable.tsx:
  - 列: タイトル、ブランド名、ソース種別、メディア区分(PESO Badge)、チャネル、エンゲージメント数、公開日
  - フィルタ: ブランドSelect + メディア区分Select（URL SearchParams管理）
  - ソート: エンゲージメント / 公開日 切替
  - ★ ページネーション: 「もっと読み込む」ボタン（nextCursor使用）
  PrItemForm.tsx:
  - ブランドSelect、メディア区分Select、ソース種別Select
  - 公開日: Input type="date"
  - engagementCount: Input type="number"

ルーティング:
  pr-items/page.tsx, pr-items/new/page.tsx, pr-items/[id]/page.tsx, pr-items/loading.tsx

# 2. 比較機能 (`src/features/compare/`)
queries.ts:
  getCompareData(brandIds: string[]):
  - brandIds は2〜3個
  - ★ テナント分離: getTenantPrisma経由なので自動だが、念のためbrandの存在確認
  - 各ブランドについて:
    - brandName, totalEngagement, prItemCount
    - mediaTypeBreakdown: { mediaType, count, totalEngagement }[]
    - topPrItems: エンゲージメント上位3件

components/:
  CompareSelector.tsx:
  - ブランド一覧のチェックボックス（2〜3個選択）
  - URL SearchParams (`?brands=id1,id2`) で状態管理
  CompareCharts.tsx: Recharts使用
  - BarChart: ブランド別総エンゲージメント比較
  - StackedBarChart: メディア区分比率（PESO_COLORS）
  - テーブル: 各ブランドのトップ3施策を横並び
  - ★ 全グラフに height={350} 指定。ResponsiveContainer + 親に明示的な高さ

ルーティング:
  compare/page.tsx
```

---

## 13. Phase 4: テスト整備

**目的**: テナント境界・ビジネスロジック・UIフローの品質保証。

```
上記の【共通ルール】に従い、以下のミッションを実行してください。

# 1. テストセットアップ
`src/__tests__/setup.ts`:
- テスト用DBに接続する Prisma クライアントを初期化
- beforeAll: テスト用テナント2つとユーザーを作成
- afterAll: テストデータをクリーンアップ

# 2. ユニットテスト (`src/__tests__/unit/`)
schemas.test.ts:
- brandFormSchema が正しい入力を受け入れること
- brandFormSchema が不正入力を拒否すること（空名前、無効UUID等）
- prItemFormSchema の同様のテスト
- PESO_COLORS に PAID/EARNED/SHARED/OWNED の4キーが存在すること

authorization.test.ts:
- OWNER が全権限を持つこと
- MEMBER が brand:delete を持たないこと
- hasPermission の戻り値テスト

# 3. インテグレーションテスト (`src/__tests__/integration/`)
tenant-isolation.test.ts:（★ 最重要テスト）
- テナントAの getTenantPrisma でブランドを作成 → tenantId が自動設定されること
- テナントAの getTenantPrisma でテナントBのブランドを取得 → null が返ること
- テナントAの getTenantPrisma でテナントBのPrItemを更新 → エラーになること
- テナントAの getTenantPrisma でブランドをカウント → テナントBのデータが含まれないこと

actions.test.ts:
- createBrand が正常に動作し、ActionResult.success = true を返すこと
- createBrand にバリデーションエラーのデータを渡すと success = false を返すこと
- deleteBrand でソフトデリート後、getBrands の結果に含まれないこと

# 4. E2Eテスト (`src/__tests__/e2e/`)
auth-flow.spec.ts:
- ログインページが表示されること
- 正しいクレデンシャルでログイン→ダッシュボードに遷移すること
- 間違ったパスワードでエラーが表示されること
- ログアウトでログイン画面に戻ること

crud-flow.spec.ts:
- ブランド作成→一覧に表示→詳細→編集→削除（ソフト）の一連のフロー
```

---

## 14. Phase 5: AI インサイト機能

```
※ Phase 1〜4 完了後に実行。

# 概要
蓄積PRデータをAI（Claude API）に渡し「次のアクション」を提案。

# 実装
1. `src/features/insights/` を新設
2. API Route: `src/app/api/insights/route.ts`
   - 対象ブランドのPRデータを整形 → Claude API に送信
   - プロンプト: "以下のPRデータを分析し、①成功要因の仮説、②競合との差分、③次に打つべき施策3つを提案してください"
   - ストリーミングレスポンスで逐次表示
3. UI:
   - ブランド詳細に「AIインサイトを生成」ボタン
   - 比較ページに「AIで差分を分析」ボタン
   - Markdown レンダリングで Card 内に表示
4. キャッシュ: 生成結果を Insight モデルに保存

# schema.prisma に追加
model Insight {
  id        String   @id @default(uuid())
  content   String
  brandIds  String[]
  createdAt DateTime @default(now())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  @@index([tenantId])
}
```

---

## 15. Phase 6: 決済＆エンタープライズ対応

```
※ 概要のみ。Phase 5 完了後に詳細策定。

# 決済 (Stripe)
1. Stripe Customer/Subscription と Tenant を紐付け
2. Billing Portal リダイレクト
3. Webhook: subscription.updated/deleted → Tenant.plan 更新
4. プラン別機能制限（ブランド登録数、AI生成回数）

# エンタープライズ
1. SSO/SAML: Auth.js Provider 追加
2. IP制限: middleware.ts でリクエスト元IP検証
3. 監査ログ: AuditLog テーブルへの書き込み（スキーマは定義済み）
4. PDFエクスポート: 比較分析結果を顧客向けレポートとして出力
5. データエクスポート: テナントの全データをCSV/JSONでエクスポート（個人情報保護法対応）
```

---

## 16. セキュリティチェックリスト

### マルチテナント分離

- [ ] 全クエリが `getTenantPrisma(tenantId)` 経由（素の `prisma` 直接使用ゼロ）
- [ ] 比較機能で他テナントの brandId を指定してもデータが返らない
- [ ] `auth()` 失敗時は即座にエラー or リダイレクト
- [ ] テナント境界テスト（tenant-isolation.test.ts）が全件パス

### 認証・認可

- [ ] `middleware.ts` で保護ルートを網羅
- [ ] パスワードは bcryptjs でハッシュ化
- [ ] JWT に tenantId と role を含める
- [ ] ログインに Rate Limiting 適用（60秒5回）
- [ ] 削除系操作に `authorize()` で権限チェック

### バリデーション・サニタイズ

- [ ] Server Actions の入力は Zod でバリデーション（input は unknown で受け取る）
- [ ] クライアント側も React Hook Form + Zod
- [ ] UUID パラメータの形式チェック

### エラーハンドリング・可観測性

- [ ] 全 Server Actions が ActionResult 型を返す
- [ ] catch 内で `captureError()` / `captureErrorWithTenant()` を使用
- [ ] 各ルートに loading.tsx と error.tsx を配置
- [ ] Sentry DSN を本番環境変数に設定

### データライフサイクル

- [ ] 削除は全てソフトデリート（deletedAt 更新）
- [ ] 全クエリに `deletedAt: null` フィルタ
- [ ] 物理削除（`prisma.xxx.delete`）はコードベースに存在しない

### パフォーマンス

- [ ] 一覧クエリはカーソルベースページネーション
- [ ] Recharts の全グラフに明示的な height 指定
- [ ] DB接続プーリング設定（DATABASE_URL に pgbouncer=true）
- [ ] 複合インデックス（tenantId + brandId + mediaType）設定済み

### セキュリティヘッダー

- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Strict-Transport-Security 設定
- [ ] Referrer-Policy 設定

### CI/CD

- [ ] GitHub Actions で lint → typecheck → test → build を自動実行
- [ ] E2E テストが CI でパス
- [ ] main ブランチへの直接 push を禁止（Branch Protection）

---

## 17. v2.0 → v3.0 変更サマリー

| 項目 | v2.0 | v3.0 |
|---|---|---|
| テナント分離 | アプリ層の規約のみ | Prisma Client Extension で自動注入 |
| 認可 | Role定義のみ | RBAC（authorize関数 + Permission型）実装 |
| エラー監視 | console.error | Sentry統合（captureError / captureErrorWithTenant） |
| Rate Limiting | なし | Upstash Redis + @upstash/ratelimit |
| 削除方式 | 物理削除 | ソフトデリート（deletedAt） |
| ページネーション | なし | カーソルベース（take+1パターン） |
| テスト | なし | Vitest（Unit/Integration）+ Playwright（E2E） |
| CI/CD | なし | GitHub Actions（lint→test→build→e2e） |
| セキュリティヘッダー | なし | next.config.ts で6種設定 |
| 監査ログ | なし | AuditLogモデル定義済み |
| DB接続 | 単一接続 | プーリング対応（directUrl分離） |
| ダークモード | なし | PESO_COLORS にdark:クラス対応 |

---

*PRism Technical Guide v3.0 — 2026年3月*
*Global-ready B2B SaaS Architecture*