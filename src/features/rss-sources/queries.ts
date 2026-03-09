import { auth } from "@/lib/auth";
import { getTenantPrisma } from "@/lib/prisma";

export async function getRssSources() {
  const session = await auth();
  if (!session?.user?.tenantId) return [];

  try {
    const prisma = getTenantPrisma(session.user.tenantId);
    return await prisma.rssSource.findMany({
      include: {
        brand: {
          include: { company: true },
        },
        _count: {
          select: { collectedItems: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // マイグレーション未実行の場合は空配列を返す
    console.warn("[RssSources] Table not found. Run: npm run db:migrate");
    return [];
  }
}

export async function getRssSourceById(id: string) {
  const session = await auth();
  if (!session?.user?.tenantId) return null;

  try {
    const prisma = getTenantPrisma(session.user.tenantId);
    return await prisma.rssSource.findUnique({
      where: { id },
      include: {
        brand: {
          include: { company: true },
        },
        collectedItems: {
          orderBy: { publishedAt: "desc" },
          take: 20,
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getCollectedPrItems(options?: {
  rssSourceId?: string;
  isProcessed?: boolean;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user?.tenantId) return [];

  try {
    const prisma = getTenantPrisma(session.user.tenantId);
    return await prisma.collectedPrItem.findMany({
      where: {
        tenantId: session.user.tenantId,
        ...(options?.rssSourceId && { rssSourceId: options.rssSourceId }),
        ...(options?.isProcessed !== undefined && {
          isProcessed: options.isProcessed,
        }),
      },
      include: {
        rssSource: {
          include: { brand: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: options?.limit || 50,
    });
  } catch {
    return [];
  }
}
