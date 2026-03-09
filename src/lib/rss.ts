import Parser from "rss-parser";
import { createHash } from "crypto";
import { isIP } from "net";
import dns from "dns/promises";

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
 * 安定したGUIDを生成（決定的ハッシュ）
 */
function createStableGuid(item: {
  link?: string;
  title?: string;
  pubDate?: string;
  content?: string;
}): string {
  const canonical = [
    item.link || "",
    item.title || "",
    item.pubDate || "",
    (item.content || "").slice(0, 200),
  ].join("|");

  return createHash("sha256").update(canonical).digest("hex").slice(0, 32);
}

/**
 * IPアドレスがプライベート/内部アドレスかチェック
 */
function isPrivateIP(ip: string): boolean {
  // IPv4プライベートレンジ
  const ipv4PrivateRanges = [
    /^127\./, // 127.0.0.0/8 (loopback)
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0/12
    /^192\.168\./, // 192.168.0.0/16
    /^169\.254\./, // 169.254.0.0/16 (link-local)
    /^0\./, // 0.0.0.0/8
  ];

  // IPv6プライベートレンジ
  const ipv6PrivateRanges = [
    /^::1$/, // loopback
    /^fe80:/i, // link-local
    /^fc00:/i, // unique local
    /^fd[0-9a-f]{2}:/i, // unique local
  ];

  for (const range of ipv4PrivateRanges) {
    if (range.test(ip)) return true;
  }
  for (const range of ipv6PrivateRanges) {
    if (range.test(ip)) return true;
  }

  return false;
}

/**
 * URLのSSRFバリデーション（スキーム + 内部IP）
 */
async function validateUrlForSSRF(url: string): Promise<void> {
  const parsedUrl = new URL(url);

  // スキームチェック
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error(`Invalid URL scheme: ${parsedUrl.protocol}`);
  }

  const hostname = parsedUrl.hostname;

  // ホストがIPアドレスの場合は直接チェック
  if (isIP(hostname)) {
    if (isPrivateIP(hostname)) {
      throw new Error(`Access to private IP address is not allowed: ${hostname}`);
    }
    return;
  }

  // ホスト名の場合はDNS解決してチェック
  try {
    const addresses = await dns.resolve4(hostname).catch(() => []);
    const addresses6 = await dns.resolve6(hostname).catch(() => []);
    const allAddresses = [...addresses, ...addresses6];

    for (const addr of allAddresses) {
      if (isPrivateIP(addr)) {
        throw new Error(
          `Hostname ${hostname} resolves to private IP ${addr}, access not allowed`
        );
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("private IP")) {
      throw error;
    }
    // DNS解決エラーは許容（後続のfetchで失敗する）
  }
}

/**
 * RSSフィードを取得してパースする
 */
export async function fetchRssFeed(url: string): Promise<RssItem[]> {
  // SSRF対策: スキーム + 内部IPチェック
  await validateUrlForSSRF(url);

  try {
    const feed = await parser.parseURL(url);

    return feed.items.map((item) => ({
      // guidのフォールバック: 決定的ハッシュを使用
      guid: item.guid || item.link || item.title || createStableGuid(item),
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
