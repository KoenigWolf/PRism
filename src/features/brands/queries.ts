import { auth } from "@/lib/auth";
import { getTenantPrisma } from "@/lib/prisma";

export async function getBrands() {
  const session = await auth();
  if (!session?.user?.tenantId) return [];

  const prisma = getTenantPrisma(session.user.tenantId);
  return prisma.brand.findMany({
    where: { deletedAt: null },
    include: {
      company: true,
      _count: {
        select: { prItems: { where: { deletedAt: null } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBrandById(id: string) {
  const session = await auth();
  if (!session?.user?.tenantId) return null;

  const prisma = getTenantPrisma(session.user.tenantId);
  return prisma.brand.findFirst({
    where: { id, deletedAt: null },
    include: {
      company: true,
      prItems: {
        where: { deletedAt: null },
        orderBy: { publishedAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function getCompanies() {
  const session = await auth();
  if (!session?.user?.tenantId) return [];

  const prisma = getTenantPrisma(session.user.tenantId);
  return prisma.company.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });
}
