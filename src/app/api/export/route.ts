import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTenantPrisma } from "@/lib/prisma";
import { captureErrorWithTenant } from "@/lib/logger";
import { writeAuditLog } from "@/lib/audit";

type ExportFormat = "json" | "csv";
type ExportType = "brands" | "pr-items" | "all";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const prisma = getTenantPrisma(tenantId);

    const searchParams = request.nextUrl.searchParams;
    const format = (searchParams.get("format") || "json") as ExportFormat;
    const type = (searchParams.get("type") || "all") as ExportType;

    // データ取得
    const data: Record<string, unknown[]> = {};

    if (type === "brands" || type === "all") {
      const brands = await prisma.brand.findMany({
        where: { deletedAt: null },
        include: {
          company: { select: { name: true } },
          _count: { select: { prItems: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      data.brands = brands.map((b) => ({
        id: b.id,
        name: b.name,
        category: b.category,
        companyName: b.company?.name,
        prItemCount: b._count.prItems,
        createdAt: b.createdAt.toISOString(),
      }));
    }

    if (type === "pr-items" || type === "all") {
      const prItems = await prisma.prItem.findMany({
        where: { deletedAt: null },
        include: {
          brand: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      data.prItems = prItems.map((p) => ({
        id: p.id,
        title: p.title,
        summary: p.summary,
        sourceType: p.sourceType,
        sourceUrl: p.sourceUrl,
        mediaType: p.mediaType,
        channel: p.channel,
        engagementCount: p.engagementCount,
        reachCount: p.reachCount,
        brandName: p.brand?.name,
        publishedAt: p.publishedAt?.toISOString() || null,
        createdAt: p.createdAt.toISOString(),
      }));
    }

    // 監査ログ
    await writeAuditLog({
      action: "EXPORT",
      entityType: "Brand",
      entityId: `export-${type}`,
      changes: { format, type },
    });

    // フォーマット別の返却
    if (format === "csv") {
      const csvContent = convertToCSV(data);
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="prism-export-${type}-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      type,
      ...data,
    });
  } catch (error) {
    captureErrorWithTenant(error as Error, "unknown", { source: "export-api" });
    return NextResponse.json(
      { error: "エクスポート中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

function convertToCSV(data: Record<string, unknown[]>): string {
  const lines: string[] = [];

  for (const [key, items] of Object.entries(data)) {
    if (items.length === 0) continue;

    // Section header
    lines.push(`# ${key}`);

    // Column headers
    const headers = Object.keys(items[0] as object);
    lines.push(headers.join(","));

    // Data rows
    for (const item of items) {
      const values = headers.map((h) => {
        const val = (item as Record<string, unknown>)[h];
        if (val === null || val === undefined) return "";
        if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return String(val);
      });
      lines.push(values.join(","));
    }

    lines.push(""); // Empty line between sections
  }

  return lines.join("\n");
}
