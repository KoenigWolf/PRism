"use server";

import { revalidatePath } from "next/cache";
import { getTenantPrisma } from "@/lib/prisma";
import { authorize } from "@/lib/authorization";
import { captureError } from "@/lib/logger";
import { writeAuditLog } from "@/lib/audit";
import type { ActionResult } from "@/types/actions";
import { prItemFormSchema, type PrItemFormInput } from "./schemas";

export async function createPrItem(
  input: PrItemFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await authorize("pr-item:create");
    const parsed = prItemFormSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const prisma = getTenantPrisma(session.user.tenantId);
    const prItem = await prisma.prItem.create({
      data: {
        title: parsed.data.title,
        summary: parsed.data.summary || null,
        sourceType: parsed.data.sourceType,
        sourceUrl: parsed.data.sourceUrl || null,
        mediaType: parsed.data.mediaType,
        channel: parsed.data.channel || null,
        engagementCount: parsed.data.engagementCount,
        reachCount: parsed.data.reachCount || null,
        publishedAt: parsed.data.publishedAt || null,
        brandId: parsed.data.brandId,
        tenantId: session.user.tenantId,
      },
    });

    revalidatePath("/pr-items");
    revalidatePath("/");

    // 監査ログ
    await writeAuditLog({
      action: "CREATE",
      entityType: "PrItem",
      entityId: prItem.id,
      changes: { title: prItem.title, mediaType: prItem.mediaType },
    });

    return { success: true, data: { id: prItem.id } };
  } catch (error) {
    captureError(error as Error, { action: "createPrItem", input });
    return { success: false, error: "PRデータの作成に失敗しました" };
  }
}

export async function updatePrItem(
  id: string,
  input: PrItemFormInput
): Promise<ActionResult> {
  try {
    const session = await authorize("pr-item:update");
    const parsed = prItemFormSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const prisma = getTenantPrisma(session.user.tenantId);
    await prisma.prItem.update({
      where: { id },
      data: {
        title: parsed.data.title,
        summary: parsed.data.summary || null,
        sourceType: parsed.data.sourceType,
        sourceUrl: parsed.data.sourceUrl || null,
        mediaType: parsed.data.mediaType,
        channel: parsed.data.channel || null,
        engagementCount: parsed.data.engagementCount,
        reachCount: parsed.data.reachCount || null,
        publishedAt: parsed.data.publishedAt || null,
        brandId: parsed.data.brandId,
      },
    });

    revalidatePath("/pr-items");
    revalidatePath(`/pr-items/${id}`);
    revalidatePath("/");

    // 監査ログ
    await writeAuditLog({
      action: "UPDATE",
      entityType: "PrItem",
      entityId: id,
      changes: { title: parsed.data.title, mediaType: parsed.data.mediaType },
    });

    return { success: true };
  } catch (error) {
    captureError(error as Error, { action: "updatePrItem", id, input });
    return { success: false, error: "PRデータの更新に失敗しました" };
  }
}

export async function deletePrItem(id: string): Promise<ActionResult> {
  try {
    const session = await authorize("pr-item:delete");
    const prisma = getTenantPrisma(session.user.tenantId);

    await prisma.prItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/pr-items");
    revalidatePath("/");

    // 監査ログ
    await writeAuditLog({
      action: "DELETE",
      entityType: "PrItem",
      entityId: id,
    });

    return { success: true };
  } catch (error) {
    captureError(error as Error, { action: "deletePrItem", id });
    return { success: false, error: "PRデータの削除に失敗しました" };
  }
}
