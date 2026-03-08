import { auth } from "@/auth";
import { getTenantPrisma } from "@/lib/prisma";
import { MediaType } from "@prisma/client";

export interface MediaTypeBreakdown {
  mediaType: MediaType;
  count: number;
  totalEngagement: number;
}

export interface BrandCompareData {
  brandId: string;
  brandName: string;
  totalEngagement: number;
  prItemCount: number;
  mediaTypeBreakdown: MediaTypeBreakdown[];
  topPrItems: Array<{
    id: string;
    title: string;
    engagementCount: number;
    mediaType: MediaType;
  }>;
}

export async function getCompareData(
  brandIds: string[]
): Promise<BrandCompareData[]> {
  const session = await auth();
  if (!session?.user?.tenantId) return [];

  if (brandIds.length < 2 || brandIds.length > 3) {
    return [];
  }

  const prisma = getTenantPrisma(session.user.tenantId);

  // Verify brands exist and belong to tenant
  const brands = await prisma.brand.findMany({
    where: {
      id: { in: brandIds },
      deletedAt: null,
    },
  });

  if (brands.length !== brandIds.length) {
    return [];
  }

  const results: BrandCompareData[] = [];

  for (const brand of brands) {
    const [prItems, aggregation, topItems] = await Promise.all([
      prisma.prItem.groupBy({
        by: ["mediaType"],
        where: { brandId: brand.id, deletedAt: null },
        _count: { id: true },
        _sum: { engagementCount: true },
      }),
      prisma.prItem.aggregate({
        where: { brandId: brand.id, deletedAt: null },
        _count: { id: true },
        _sum: { engagementCount: true },
      }),
      prisma.prItem.findMany({
        where: { brandId: brand.id, deletedAt: null },
        orderBy: { engagementCount: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          engagementCount: true,
          mediaType: true,
        },
      }),
    ]);

    results.push({
      brandId: brand.id,
      brandName: brand.name,
      totalEngagement: aggregation._sum.engagementCount || 0,
      prItemCount: aggregation._count.id,
      mediaTypeBreakdown: prItems.map((item) => ({
        mediaType: item.mediaType,
        count: item._count.id,
        totalEngagement: item._sum.engagementCount || 0,
      })),
      topPrItems: topItems,
    });
  }

  return results;
}
