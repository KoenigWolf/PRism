"use server";

import { auth } from "@/lib/auth";
import { getTenantPrisma } from "@/lib/prisma";
import { captureErrorWithTenant } from "@/lib/logger";
import { checkAIInsightLimit } from "@/lib/plan-limits";
import type { ActionResult } from "@/types/actions";
import { generateInsightSchema } from "./schemas";

export async function saveInsight(
  content: string,
  brandIds: string[]
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return { success: false, error: "認証エラー" };
  }

  const tenantId = session.user.tenantId;
  const prisma = getTenantPrisma(tenantId);

  // バリデーション
  const validation = generateInsightSchema.safeParse({ brandIds });
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message || "入力が無効です",
    };
  }

  // プラン制限チェック
  const insightLimit = await checkAIInsightLimit();
  if (!insightLimit.allowed) {
    return {
      success: false,
      error: `今月のAIインサイト生成回数が上限（${insightLimit.limit}回）に達しています。プランをアップグレードしてください。`,
    };
  }

  try {
    // tenantIdはgetTenantPrisma拡張によって自動注入される
    const insight = await prisma.insight.create({
      data: {
        content,
        brandIds,
      } as Parameters<typeof prisma.insight.create>[0]["data"],
    });

    return { success: true, data: { id: insight.id } };
  } catch (error) {
    captureErrorWithTenant(error as Error, tenantId, { source: "saveInsight" });
    return { success: false, error: "インサイトの保存に失敗しました" };
  }
}

export async function deleteInsight(id: string): Promise<ActionResult<void>> {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return { success: false, error: "認証エラー" };
  }

  const tenantId = session.user.tenantId;
  const prisma = getTenantPrisma(tenantId);

  try {
    // ソフトデリート（deletedAtを更新）
    await prisma.insight.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true, data: undefined };
  } catch (error) {
    captureErrorWithTenant(error as Error, tenantId, { source: "deleteInsight" });
    return { success: false, error: "インサイトの削除に失敗しました" };
  }
}
