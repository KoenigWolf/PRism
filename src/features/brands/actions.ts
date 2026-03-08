"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getTenantPrisma } from "@/lib/prisma";
import { authorize } from "@/lib/authorization";
import { captureError } from "@/lib/logger";
import type { ActionResult } from "@/types/actions";
import { brandFormSchema, type BrandFormInput } from "./schemas";

export async function createBrand(
  input: BrandFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await authorize("brand:create");
    const parsed = brandFormSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const prisma = getTenantPrisma(session.user.tenantId);
    const brand = await prisma.brand.create({
      data: {
        name: parsed.data.name,
        category: parsed.data.category || null,
        companyId: parsed.data.companyId,
        tenantId: session.user.tenantId,
      },
    });

    revalidatePath("/brands");
    revalidatePath("/");

    return { success: true, data: { id: brand.id } };
  } catch (error) {
    captureError(error as Error, { action: "createBrand", input });
    return { success: false, error: "ブランドの作成に失敗しました" };
  }
}

export async function updateBrand(
  id: string,
  input: BrandFormInput
): Promise<ActionResult> {
  try {
    const session = await authorize("brand:update");
    const parsed = brandFormSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const prisma = getTenantPrisma(session.user.tenantId);
    await prisma.brand.update({
      where: { id },
      data: {
        name: parsed.data.name,
        category: parsed.data.category || null,
        companyId: parsed.data.companyId,
      },
    });

    revalidatePath("/brands");
    revalidatePath(`/brands/${id}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    captureError(error as Error, { action: "updateBrand", id, input });
    return { success: false, error: "ブランドの更新に失敗しました" };
  }
}

export async function deleteBrand(id: string): Promise<ActionResult> {
  try {
    const session = await authorize("brand:delete");
    const prisma = getTenantPrisma(session.user.tenantId);

    await prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/brands");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    captureError(error as Error, { action: "deleteBrand", id });
    return { success: false, error: "ブランドの削除に失敗しました" };
  }
}
