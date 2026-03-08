import { auth } from "@/lib/auth";
import { getTenantPrisma, basePrisma } from "@/lib/prisma";
import { MediaType, Prisma } from "@prisma/client";

// Type for PrItem with Brand included
type PrItemWithBrand = Prisma.PrItemGetPayload<{
  include: { brand: true };
}>;

type PrItemWithBrandAndNotes = Prisma.PrItemGetPayload<{
  include: { brand: true; notes: true };
}>;

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface GetPrItemsParams {
  cursor?: string;
  limit?: number;
  brandId?: string;
  mediaType?: MediaType;
  sortBy?: "engagementCount" | "publishedAt";
  sortOrder?: "asc" | "desc";
}

export async function getPrItems(
  params: GetPrItemsParams = {}
): Promise<PaginatedResult<PrItemWithBrand>> {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return { items: [], nextCursor: null, hasMore: false };
  }

  const {
    cursor,
    limit = 20,
    brandId,
    mediaType,
    sortBy = "publishedAt",
    sortOrder = "desc",
  } = params;

  const items = await getPrItemsInternal(
    session.user.tenantId,
    cursor,
    limit,
    brandId,
    mediaType,
    sortBy,
    sortOrder
  );

  const hasMore = items.length > limit;
  const returnItems = hasMore ? items.slice(0, -1) : items;
  const nextCursor = hasMore ? returnItems[returnItems.length - 1]?.id : null;

  return { items: returnItems, nextCursor, hasMore };
}

async function getPrItemsInternal(
  tenantId: string,
  cursor?: string,
  limit: number = 20,
  brandId?: string,
  mediaType?: MediaType,
  sortBy: "engagementCount" | "publishedAt" = "publishedAt",
  sortOrder: "asc" | "desc" = "desc"
): Promise<PrItemWithBrand[]> {
  const prisma = getTenantPrisma(tenantId);

  const result = await prisma.prItem.findMany({
    where: {
      deletedAt: null,
      ...(brandId && { brandId }),
      ...(mediaType && { mediaType }),
    },
    include: {
      brand: true,
    },
    orderBy: { [sortBy]: sortOrder },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });
  return result as PrItemWithBrand[];
}

export async function getPrItemById(
  id: string
): Promise<PrItemWithBrandAndNotes | null> {
  const session = await auth();
  if (!session?.user?.tenantId) return null;

  const prisma = getTenantPrisma(session.user.tenantId);
  const result = await prisma.prItem.findFirst({
    where: { id, deletedAt: null },
    include: {
      brand: true,
      notes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return result as PrItemWithBrandAndNotes | null;
}
