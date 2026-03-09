export const SOURCE_TYPES = [
  "Instagram",
  "X (Twitter)",
  "TikTok",
  "YouTube",
  "PR TIMES",
  "Web Media",
  "テレビ",
  "新聞・雑誌",
  "その他",
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];
