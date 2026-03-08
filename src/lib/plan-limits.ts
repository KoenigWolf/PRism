import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, type PlanType } from "@/lib/stripe";

export type FeatureLimit = {
  allowed: boolean;
  limit: number;
  current: number;
  remaining: number;
  plan: PlanType;
};

/**
 * ブランド登録数の制限をチェック
 */
export async function checkBrandLimit(): Promise<FeatureLimit> {
  const session = await auth();
  if (!session?.user?.tenantId) {
    throw new Error("認証エラー");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    include: {
      _count: {
        select: {
          brands: {
            where: { deletedAt: null },
          },
        },
      },
    },
  });

  if (!tenant) {
    throw new Error("テナントが見つかりません");
  }

  const plan = (tenant.plan || "starter") as PlanType;
  const planConfig = PLANS[plan];
  const limit = planConfig.maxBrands;
  const current = tenant._count.brands;

  if (limit === -1) {
    return { allowed: true, limit: -1, current, remaining: -1, plan };
  }

  const remaining = limit - current;
  return {
    allowed: remaining > 0,
    limit,
    current,
    remaining: Math.max(0, remaining),
    plan,
  };
}

/**
 * AIインサイト生成回数の制限をチェック（月間）
 */
export async function checkAIInsightLimit(): Promise<FeatureLimit> {
  const session = await auth();
  if (!session?.user?.tenantId) {
    throw new Error("認証エラー");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
  });

  if (!tenant) {
    throw new Error("テナントが見つかりません");
  }

  // 今月の開始日を計算
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 今月のインサイト生成数をカウント
  const current = await prisma.insight.count({
    where: {
      tenantId: session.user.tenantId,
      createdAt: { gte: startOfMonth },
      deletedAt: null,
    },
  });

  const plan = (tenant.plan || "starter") as PlanType;
  const planConfig = PLANS[plan];
  const limit = planConfig.maxAIInsights;

  if (limit === -1) {
    return { allowed: true, limit: -1, current, remaining: -1, plan };
  }

  const remaining = limit - current;
  return {
    allowed: remaining > 0,
    limit,
    current,
    remaining: Math.max(0, remaining),
    plan,
  };
}

/**
 * 機能がプランで利用可能かチェック
 */
export async function isFeatureAvailable(
  feature: "pdfExport" | "ipRestriction" | "sso"
): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return false;
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
  });

  if (!tenant) {
    return false;
  }

  const plan = (tenant.plan || "starter") as PlanType;

  switch (feature) {
    case "pdfExport":
      return plan === "professional" || plan === "enterprise";
    case "ipRestriction":
    case "sso":
      return plan === "enterprise";
    default:
      return false;
  }
}
