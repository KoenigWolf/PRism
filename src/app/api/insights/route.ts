import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { getTenantPrisma } from "@/lib/prisma";
import { captureErrorWithTenant } from "@/lib/logger";

const client = new Anthropic();

const INSIGHT_SYSTEM_PROMPT = `あなたはPR・マーケティング分析の専門家です。
提供されたPRデータを分析し、以下の3点について日本語で回答してください：

1. **成功要因の仮説**: データから読み取れる成功パターンや効果的な施策の特徴
2. **競合との差分**: 複数ブランドがある場合、各ブランドの戦略の違いや強み・弱み
3. **次に打つべき施策3つ**: 具体的なアクションプランを優先度順に提案

回答はMarkdown形式で構造化してください。`;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const { brandIds } = await request.json();

    if (!brandIds || !Array.isArray(brandIds) || brandIds.length === 0) {
      return NextResponse.json(
        { error: "ブランドIDを指定してください" },
        { status: 400 }
      );
    }

    const tenantId = session.user.tenantId;
    const prisma = getTenantPrisma(tenantId);

    // ブランドとPRデータを取得
    const brands = await prisma.brand.findMany({
      where: {
        id: { in: brandIds },
        deletedAt: null,
      },
      include: {
        prItems: {
          where: { deletedAt: null },
          orderBy: { engagementCount: "desc" },
          take: 20,
        },
        company: true,
      },
    });

    if (brands.length === 0) {
      return NextResponse.json(
        { error: "指定されたブランドが見つかりません" },
        { status: 404 }
      );
    }

    // PRデータをAI用に整形
    const prDataSummary = brands.map((brand) => ({
      brandName: brand.name,
      category: brand.category,
      companyName: brand.company?.name,
      prItems: brand.prItems.map((item) => ({
        title: item.title,
        summary: item.summary,
        sourceType: item.sourceType,
        mediaType: item.mediaType,
        channel: item.channel,
        engagementCount: item.engagementCount,
        publishedAt: item.publishedAt?.toISOString(),
      })),
    }));

    const userPrompt = `以下のPRデータを分析してください：

${JSON.stringify(prDataSummary, null, 2)}`;

    // Claude APIでストリーミングレスポンス
    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: INSIGHT_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // ストリーミングレスポンスを返す
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const chunk = encoder.encode(event.delta.text);
              controller.enqueue(chunk);
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    captureErrorWithTenant(error as Error, "unknown", { source: "insights-api" });
    return NextResponse.json(
      { error: "インサイト生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
