import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchRssFeed } from "@/lib/rss";
import { classifyPrItem } from "@/lib/pr-classifier";

// Vercel Cron の認証（CRON_SECRET環境変数で保護）
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // 認証チェック（CRON_SECRET未設定時はエラー）
  if (!CRON_SECRET) {
    console.error("[Cron] CRON_SECRET is not configured");
    return NextResponse.json(
      { error: "Cron secret not configured" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await collectPrItems();
    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error("[Cron] Failed to collect PR items:", error);
    return NextResponse.json(
      { error: "Failed to collect PR items" },
      { status: 500 }
    );
  }
}

async function collectPrItems() {
  // アクティブなRSSソースを取得
  const rssSources = await prisma.rssSource.findMany({
    where: { isActive: true },
    include: { brand: true },
  });

  let totalCollected = 0;
  let totalClassified = 0;
  const errors: string[] = [];

  for (const source of rssSources) {
    let newItemsCount = 0;

    try {
      // RSSフィードを取得
      const items = await fetchRssFeed(source.url);

      for (const item of items) {
        try {
          // 日付のバリデーション（Invalid Dateを防ぐ）
          let publishedAt: Date | null = null;
          if (item.pubDate) {
            const parsed = new Date(item.pubDate);
            if (!isNaN(parsed.getTime())) {
              publishedAt = parsed;
            }
          }

          // upsertで重複チェックとインサートをアトミックに実行
          const result = await prisma.collectedPrItem.upsert({
            where: {
              rssSourceId_guid: {
                rssSourceId: source.id,
                guid: item.guid,
              },
            },
            update: {}, // 既存の場合は何もしない
            create: {
              guid: item.guid,
              title: item.title,
              summary: item.contentSnippet?.slice(0, 500),
              sourceUrl: item.link,
              publishedAt,
              rawData: item as object,
              rssSourceId: source.id,
              tenantId: source.tenantId,
            },
          });

          // 新規作成された場合のみカウント（createdAtが直近1秒以内）
          const isNewItem =
            new Date().getTime() - result.createdAt.getTime() < 1000;
          if (!isNewItem) continue;

          const collected = result;
          newItemsCount++;
          totalCollected++;

          // Claude APIで分類（ANTHROPIC_API_KEYがある場合のみ）
          if (process.env.ANTHROPIC_API_KEY) {
            try {
              const classification = await classifyPrItem(
                item.title,
                item.contentSnippet,
                item.link
              );

              await prisma.collectedPrItem.update({
                where: { id: collected.id },
                data: {
                  mediaType: classification.mediaType,
                  channel: classification.channel,
                  summary: classification.summary,
                  isProcessed: true,
                  processedAt: new Date(),
                },
              });

              totalClassified++;
            } catch (classifyError) {
              console.error(
                `[Cron] Failed to classify item ${collected.id}:`,
                classifyError
              );
            }
          }
        } catch (itemError) {
          // アイテム単位のエラーは記録して続行（フィード全体を停止しない）
          console.error(
            `[Cron] Failed to process item "${item.title}":`,
            itemError
          );
        }
      }

      // ソースの最終取得日時を更新（新規アイテム数でインクリメント）
      await prisma.rssSource.update({
        where: { id: source.id },
        data: {
          lastFetched: new Date(),
          fetchCount: { increment: newItemsCount },
        },
      });
    } catch (sourceError) {
      const errorMsg = `Failed to fetch ${source.name}: ${sourceError}`;
      console.error(`[Cron] ${errorMsg}`);
      errors.push(errorMsg);
    }
  }

  return {
    sourcesProcessed: rssSources.length,
    totalCollected,
    totalClassified,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// 手動実行用（POST）
export async function POST(request: Request) {
  return GET(request);
}
