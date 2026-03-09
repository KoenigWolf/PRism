"use server";

import { auth } from "@/lib/auth";
import { getTenantPrisma } from "@/lib/prisma";
import { rssSourceFormSchema, type RssSourceFormData } from "./schemas";
import type { ActionResult } from "@/types/actions";

export async function createRssSource(
  data: RssSourceFormData
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return { success: false, error: "認証が必要です" };
  }

  const parsed = rssSourceFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const prisma = getTenantPrisma(session.user.tenantId);
    const rssSource = await prisma.rssSource.create({
      data: {
        name: parsed.data.name,
        url: parsed.data.url,
        brandId: parsed.data.brandId,
        isActive: parsed.data.isActive ?? true,
        tenantId: session.user.tenantId,
      },
    });

    return { success: true, data: { id: rssSource.id } };
  } catch (error) {
    console.error("[RssSource] Create failed:", error);
    return { success: false, error: "RSSソースの作成に失敗しました" };
  }
}

export async function updateRssSource(
  id: string,
  data: Partial<RssSourceFormData>
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return { success: false, error: "認証が必要です" };
  }

  try {
    const prisma = getTenantPrisma(session.user.tenantId);
    const rssSource = await prisma.rssSource.update({
      where: { id },
      data,
    });

    return { success: true, data: { id: rssSource.id } };
  } catch (error) {
    console.error("[RssSource] Update failed:", error);
    return { success: false, error: "RSSソースの更新に失敗しました" };
  }
}

export async function deleteRssSource(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return { success: false, error: "認証が必要です" };
  }

  try {
    const prisma = getTenantPrisma(session.user.tenantId);
    await prisma.rssSource.delete({
      where: { id },
    });

    return { success: true, data: { id } };
  } catch (error) {
    console.error("[RssSource] Delete failed:", error);
    return { success: false, error: "RSSソースの削除に失敗しました" };
  }
}

export async function toggleRssSource(
  id: string,
  isActive: boolean
): Promise<ActionResult<{ id: string }>> {
  return updateRssSource(id, { isActive });
}
