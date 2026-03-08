import { auth } from "@/lib/auth";
import { getTenantPrisma } from "@/lib/prisma";
import { MediaType } from "@prisma/client";

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return {
      brandCount: 0,
      prItemCount: 0,
      mediaTypeDistribution: [],
      recentPrItems: [],
      averageEngagement: 0,
      earnedRatio: 0,
    };
  }

  const prisma = getTenantPrisma(session.user.tenantId);

  const [brandCount, prItemCount, mediaTypeDistribution, recentPrItems, engagementStats] =
    await Promise.all([
      prisma.brand.count({ where: { deletedAt: null } }),
      prisma.prItem.count({ where: { deletedAt: null } }),
      prisma.prItem.groupBy({
        by: ["mediaType"],
        where: { deletedAt: null },
        _count: { id: true },
      }),
      prisma.prItem.findMany({
        where: { deletedAt: null },
        include: { brand: true },
        orderBy: { publishedAt: "desc" },
        take: 5,
      }),
      prisma.prItem.aggregate({
        where: { deletedAt: null },
        _avg: { engagementCount: true },
      }),
    ]);

  const totalItems = mediaTypeDistribution.reduce(
    (sum, item) => sum + item._count.id,
    0
  );

  const earnedCount =
    mediaTypeDistribution.find((item) => item.mediaType === MediaType.EARNED)
      ?._count.id || 0;

  return {
    brandCount,
    prItemCount,
    mediaTypeDistribution: mediaTypeDistribution.map((item) => ({
      mediaType: item.mediaType,
      count: item._count.id,
    })),
    recentPrItems,
    averageEngagement: Math.round(engagementStats._avg.engagementCount || 0),
    earnedRatio: totalItems > 0 ? Math.round((earnedCount / totalItems) * 100) : 0,
  };
}
