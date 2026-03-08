import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const basePrisma = globalForPrisma.prisma ?? new PrismaClient();

// テナントフィルタなしのPrismaクライアント（管理系操作用）
// Tenantテーブル操作やWebhook処理など、テナント横断的な処理に使用
export const prisma = basePrisma;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = basePrisma;
}

// Models that have tenantId field (lowercase for comparison)
const TENANT_MODELS = [
  "user",
  "company",
  "brand",
  "pritem",
  "tag",
  "pritemtag",
  "note",
  "auditlog",
  "insight",
] as const;

type TenantModel = (typeof TENANT_MODELS)[number];

// Prismaはモデル名をPascalCaseで渡すため、小文字に変換して比較
function isTenantModel(model: string): boolean {
  return TENANT_MODELS.includes(model.toLowerCase() as TenantModel);
}

// テナント分離を自動化する Prisma Client Extension
// 全クエリに tenantId フィルタを自動注入する
// 開発者が where: { tenantId } を書き忘れてもデータ漏洩しない
export function getTenantPrisma(tenantId: string) {
  return basePrisma.$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async findUnique({ model, args, query }) {
          // findUnique は where に tenantId を直接追加できないため、
          // 結果取得後にテナントチェックする
          const result = await query(args);
          if (
            isTenantModel(model) &&
            result &&
            "tenantId" in result &&
            result.tenantId !== tenantId
          ) {
            return null;
          }
          return result;
        },
        async create({ model, args, query }) {
          if (isTenantModel(model)) {
            (args.data as Record<string, unknown>).tenantId = tenantId;
          }
          return query(args);
        },
        async update({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async updateMany({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async delete({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async deleteMany({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async count({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async aggregate({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async groupBy({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
      },
    },
  });
}
