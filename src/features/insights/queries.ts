"use server";

import { auth } from "@/lib/auth";
import { getTenantPrisma } from "@/lib/prisma";
import { captureErrorWithTenant } from "@/lib/logger";

export async function getInsights(brandIds?: string[]) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    throw new Error("認証エラー");
  }

  const tenantId = session.user.tenantId;
  const prisma = getTenantPrisma(tenantId);

  try {
    const where: { brandIds?: { hasSome: string[] } } = {};
    if (brandIds && brandIds.length > 0) {
      where.brandIds = { hasSome: brandIds };
    }

    const insights = await prisma.insight.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return insights;
  } catch (error) {
    captureErrorWithTenant(error as Error, tenantId, { source: "getInsights" });
    throw error;
  }
}

export async function getInsightById(id: string) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    throw new Error("認証エラー");
  }

  const tenantId = session.user.tenantId;
  const prisma = getTenantPrisma(tenantId);

  try {
    const insight = await prisma.insight.findUnique({
      where: { id },
    });

    return insight;
  } catch (error) {
    captureErrorWithTenant(error as Error, tenantId, { source: "getInsightById" });
    throw error;
  }
}
