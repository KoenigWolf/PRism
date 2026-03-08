"use server";

import { auth } from "@/lib/auth";
import { getTenantPrisma } from "@/lib/prisma";
import { captureErrorWithTenant } from "@/lib/logger";
import { hasPermission } from "@/lib/authorization";
import { Role } from "@prisma/client";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "EXPORT";

export type AuditEntityType =
  | "Brand"
  | "PrItem"
  | "Company"
  | "User"
  | "Note"
  | "Insight";

interface AuditLogParams {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  changes?: Record<string, unknown>;
}

/**
 * 監査ログを記録する
 * Server Actions や API ルートから呼び出す
 */
export async function writeAuditLog(params: AuditLogParams): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || !session?.user?.id) {
      // 未認証の場合はログを記録しない
      return;
    }

    const tenantId = session.user.tenantId;
    const userId = session.user.id;
    const prisma = getTenantPrisma(tenantId);

    await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        changes: params.changes || null,
        userId,
      } as Parameters<typeof prisma.auditLog.create>[0]["data"],
    });
  } catch (error) {
    // 監査ログの失敗は本体処理に影響させない
    captureErrorWithTenant(error as Error, "unknown", {
      source: "writeAuditLog",
      params,
    });
  }
}

/**
 * 監査ログを取得する（管理者向け）
 * OWNER/ADMINのみアクセス可能
 */
export async function getAuditLogs(options?: {
  entityType?: AuditEntityType;
  entityId?: string;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    throw new Error("認証エラー");
  }

  // 監査ログ読み取り権限のチェック（OWNER/ADMINのみ）
  const userRole = session.user.role as Role;
  if (!hasPermission(userRole, "audit:read")) {
    throw new Error("権限エラー: 監査ログの閲覧権限がありません");
  }

  const tenantId = session.user.tenantId;
  const prisma = getTenantPrisma(tenantId);

  const where: {
    entityType?: AuditEntityType;
    entityId?: string;
  } = {};

  if (options?.entityType) {
    where.entityType = options.entityType;
  }
  if (options?.entityId) {
    where.entityId = options.entityId;
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options?.limit || 50,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return logs;
}
