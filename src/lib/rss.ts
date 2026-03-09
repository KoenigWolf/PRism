import Parser from "rss-parser";

export interface RssItem {
  guid: string;
  title: string;
  link?: string;
  contentSnippet?: string;
  pubDate?: string;
  creator?: string;
  categories?: string[];
}

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "PRism/1.0 RSS Collector",
  },
});

/**
 * RSSフィードを取得してパースする
 */
export async function fetchRssFeed(url: string): Promise<RssItem[]> {
  // URLスキームバリデーション（SSRF対策）
  const parsedUrl = new URL(url);
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error(`Invalid URL scheme: ${parsedUrl.protocol}`);
  }

  try {
    const feed = await parser.parseURL(url);

    return feed.items.map((item, index) => ({
      // guidのフォールバック: 空文字列ではなくインデックスベースのIDを使用
      guid: item.guid || item.link || item.title || `item-${index}-${Date.now()}`,
      title: item.title || "",
      link: item.link,
      contentSnippet: item.contentSnippet || item.content,
      pubDate: item.pubDate || item.isoDate,
      creator: item.creator || item.author,
      categories: item.categories,
    }));
  } catch (error) {
    console.error(`[RSS] Failed to fetch ${url}:`, error);
    throw error;
  }
}

/**
 * PR TIMES の企業別RSSフィードURLを生成
 * @param companyId PR TIMESの企業ID
 */
export function getPrTimesRssUrl(companyId: string): string {
  return `https://prtimes.jp/companyrdf.php?company_id=${companyId}`;
}

/**
 * 一般的なPR情報RSSフィード
 */
export const COMMON_RSS_FEEDS = {
  // PR TIMES 全体（大量なので注意）
  prtimes_all: "https://prtimes.jp/index.rdf",
  // 業界別（例）
  prtimes_beauty: "https://prtimes.jp/industryrdf.php?industry_id=6",
  prtimes_fashion: "https://prtimes.jp/industryrdf.php?industry_id=7",
  prtimes_food: "https://prtimes.jp/industryrdf.php?industry_id=8",
} as const;
