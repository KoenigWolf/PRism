import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { getTenantPrisma } from "@/lib/prisma";
import { captureErrorWithTenant } from "@/lib/logger";
import { writeAuditLog } from "@/lib/audit";
import { PESO_COLORS } from "@/config/peso";
import type { MediaType } from "@prisma/client";

// PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  col1: { width: "30%" },
  col2: { width: "20%" },
  col3: { width: "15%" },
  col4: { width: "20%" },
  col5: { width: "15%" },
  kpiContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  kpiBox: {
    width: "23%",
    padding: 15,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },
  kpiLabel: {
    fontSize: 9,
    color: "#666",
    marginBottom: 5,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
});

interface CompareReportProps {
  data: {
    brandName: string;
    totalEngagement: number;
    prItemCount: number;
    mediaTypeBreakdown: { mediaType: MediaType; count: number; totalEngagement: number }[];
    topPrItems: { title: string; engagementCount: number; mediaType: MediaType }[];
  }[];
  generatedAt: string;
}

// PDF Document Component
function CompareReportDocument({ data, generatedAt }: CompareReportProps) {
  const totalEngagement = data.reduce((sum, b) => sum + b.totalEngagement, 0);
  const totalPrItems = data.reduce((sum, b) => sum + b.prItemCount, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PRism 比較分析レポート</Text>
          <Text style={styles.subtitle}>
            生成日時: {generatedAt}
          </Text>
        </View>

        {/* KPIs */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>分析対象ブランド</Text>
            <Text style={styles.kpiValue}>{data.length}</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>合計PRデータ</Text>
            <Text style={styles.kpiValue}>{totalPrItems}</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>合計エンゲージメント</Text>
            <Text style={styles.kpiValue}>{totalEngagement.toLocaleString()}</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>平均エンゲージメント</Text>
            <Text style={styles.kpiValue}>
              {totalPrItems > 0
                ? Math.round(totalEngagement / totalPrItems).toLocaleString()
                : 0}
            </Text>
          </View>
        </View>

        {/* Brand Comparison */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ブランド別サマリー</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>ブランド名</Text>
              <Text style={styles.col2}>PRデータ数</Text>
              <Text style={styles.col3}>総エンゲージメント</Text>
              <Text style={styles.col4}>平均エンゲージメント</Text>
              <Text style={styles.col5}>PESO比率</Text>
            </View>
            {data.map((brand, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>{brand.brandName}</Text>
                <Text style={styles.col2}>{brand.prItemCount}</Text>
                <Text style={styles.col3}>{brand.totalEngagement.toLocaleString()}</Text>
                <Text style={styles.col4}>
                  {brand.prItemCount > 0
                    ? Math.round(brand.totalEngagement / brand.prItemCount).toLocaleString()
                    : 0}
                </Text>
                <Text style={styles.col5}>
                  {brand.mediaTypeBreakdown
                    .map((m) => `${PESO_COLORS[m.mediaType].label[0]}:${m.count}`)
                    .join(" ")}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Items per Brand */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ブランド別トップ施策</Text>
          {data.map((brand, brandIndex) => (
            <View key={brandIndex} style={{ marginBottom: 15 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                {brand.brandName}
              </Text>
              {brand.topPrItems.map((item, itemIndex) => (
                <View
                  key={itemIndex}
                  style={{
                    flexDirection: "row",
                    paddingLeft: 10,
                    marginBottom: 3,
                  }}
                >
                  <Text style={{ width: "5%" }}>{itemIndex + 1}.</Text>
                  <Text style={{ width: "65%" }}>{item.title}</Text>
                  <Text style={{ width: "15%" }}>
                    {PESO_COLORS[item.mediaType].label}
                  </Text>
                  <Text style={{ width: "15%", textAlign: "right" }}>
                    {item.engagementCount.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          PRism - PR分析プラットフォーム | このレポートは自動生成されています
        </Text>
      </Page>
    </Document>
  );
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const prisma = getTenantPrisma(tenantId);

    const searchParams = request.nextUrl.searchParams;
    const brandIdsParam = searchParams.get("brands");

    if (!brandIdsParam) {
      return NextResponse.json(
        { error: "ブランドIDを指定してください" },
        { status: 400 }
      );
    }

    const brandIds = brandIdsParam.split(",").filter(Boolean);

    if (brandIds.length < 2) {
      return NextResponse.json(
        { error: "2つ以上のブランドを選択してください" },
        { status: 400 }
      );
    }

    // Fetch brand data
    const brands = await prisma.brand.findMany({
      where: {
        id: { in: brandIds },
        deletedAt: null,
      },
      include: {
        prItems: {
          where: { deletedAt: null },
          orderBy: { engagementCount: "desc" },
        },
      },
    });

    // Build report data
    const reportData = brands.map((brand) => {
      const mediaTypeBreakdown = (["PAID", "EARNED", "SHARED", "OWNED"] as MediaType[]).map(
        (mediaType) => {
          const items = brand.prItems.filter((p) => p.mediaType === mediaType);
          return {
            mediaType,
            count: items.length,
            totalEngagement: items.reduce((sum, p) => sum + p.engagementCount, 0),
          };
        }
      );

      return {
        brandName: brand.name,
        totalEngagement: brand.prItems.reduce((sum, p) => sum + p.engagementCount, 0),
        prItemCount: brand.prItems.length,
        mediaTypeBreakdown,
        topPrItems: brand.prItems.slice(0, 3).map((p) => ({
          title: p.title,
          engagementCount: p.engagementCount,
          mediaType: p.mediaType,
        })),
      };
    });

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <CompareReportDocument
        data={reportData}
        generatedAt={new Date().toLocaleString("ja-JP")}
      />
    );

    // Audit log
    await writeAuditLog({
      action: "EXPORT",
      entityType: "Brand",
      entityId: `pdf-export-${brandIds.join(",")}`,
      changes: { brandIds, format: "pdf" },
    });

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer);

    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="prism-compare-report-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    captureErrorWithTenant(error as Error, "unknown", { source: "pdf-export" });
    return NextResponse.json(
      { error: "PDFエクスポート中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
