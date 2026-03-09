import Anthropic from "@anthropic-ai/sdk";
import type { MediaType } from "@prisma/client";

const anthropic = new Anthropic();

export interface ClassificationResult {
  mediaType: MediaType;
  channel: string;
  summary: string;
  confidence: number;
}

/**
 * PR情報をPESOモデルで分類する
 * コスト最適化: Haiku を使用（1件あたり約$0.0003）
 */
export async function classifyPrItem(
  title: string,
  content?: string,
  sourceUrl?: string
): Promise<ClassificationResult> {
  const prompt = `あなたはPR（広報）の専門家です。以下のPR情報をPESOモデルに基づいて分類してください。

# PESOモデル
- PAID: 広告、スポンサード、有料掲載
- EARNED: メディア掲載、取材記事、第三者による報道
- SHARED: SNS投稿、UGC、口コミ、インフルエンサー投稿
- OWNED: 自社プレスリリース、自社メディア、公式発表

# 分類対象
タイトル: ${title}
${content ? `内容: ${content.slice(0, 500)}` : ""}
${sourceUrl ? `URL: ${sourceUrl}` : ""}

# 出力形式（JSON）
{
  "mediaType": "PAID" | "EARNED" | "SHARED" | "OWNED",
  "channel": "メディア/チャネル名（例: PR TIMES, Instagram, 日経新聞）",
  "summary": "50文字以内の要約",
  "confidence": 0.0〜1.0の確信度
}

JSONのみを出力してください。`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const json = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());

    // MediaTypeのバリデーション（無効な場合はフォールバック）
    const validMediaTypes: MediaType[] = ["PAID", "EARNED", "SHARED", "OWNED"];
    if (!validMediaTypes.includes(json.mediaType)) {
      console.warn(
        `[Classifier] Invalid mediaType "${json.mediaType}", using fallback`
      );
      return fallbackClassification(title, sourceUrl);
    }

    // confidenceのバリデーション（0も有効な値として扱う）
    let confidence = 0.5;
    if (typeof json.confidence === "number" && isFinite(json.confidence)) {
      confidence = Math.max(0, Math.min(1, json.confidence));
    }

    return {
      mediaType: json.mediaType,
      channel: json.channel || "不明",
      summary: json.summary || title.slice(0, 50),
      confidence,
    };
  } catch (error) {
    console.error("[Classifier] Failed to classify:", error);
    // フォールバック: URLからヒューリスティックに判定
    return fallbackClassification(title, sourceUrl);
  }
}

/**
 * フォールバック分類（API失敗時）
 */
function fallbackClassification(
  title: string,
  sourceUrl?: string
): ClassificationResult {
  let mediaType: MediaType = "OWNED";
  let channel = "不明";

  if (sourceUrl) {
    const url = sourceUrl.toLowerCase();
    if (url.includes("prtimes.jp")) {
      mediaType = "OWNED";
      channel = "PR TIMES";
    } else if (url.includes("instagram.com")) {
      mediaType = "SHARED";
      channel = "Instagram";
    } else if (url.includes("twitter.com") || url.includes("x.com")) {
      mediaType = "SHARED";
      channel = "X (Twitter)";
    } else if (
      url.includes("nikkei.com") ||
      url.includes("asahi.com") ||
      url.includes("yomiuri.co.jp")
    ) {
      mediaType = "EARNED";
      channel = "新聞メディア";
    }
  }

  return {
    mediaType,
    channel,
    summary: title.slice(0, 50),
    confidence: 0.3,
  };
}

/**
 * 複数のPR情報をバッチ分類（コスト効率化）
 */
export async function classifyPrItemsBatch(
  items: Array<{ title: string; content?: string; sourceUrl?: string }>
): Promise<ClassificationResult[]> {
  // 並列実行（最大5件ずつ）
  const batchSize = 5;
  const results: ClassificationResult[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item) =>
        classifyPrItem(item.title, item.content, item.sourceUrl)
      )
    );
    results.push(...batchResults);
  }

  return results;
}
