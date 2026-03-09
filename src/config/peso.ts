export const PESO_COLORS = {
  PAID: {
    label: "Paid",
    labelJa: "ペイド",
    color: "#F59E0B",
    cssVar: "var(--color-peso-paid)",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
  },
  EARNED: {
    label: "Earned",
    labelJa: "アーンド",
    color: "#3B82F6",
    cssVar: "var(--color-peso-earned)",
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30",
  },
  SHARED: {
    label: "Shared",
    labelJa: "シェアード",
    color: "#10B981",
    cssVar: "var(--color-peso-shared)",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30",
  },
  OWNED: {
    label: "Owned",
    labelJa: "オウンド",
    color: "#8B5CF6",
    cssVar: "var(--color-peso-owned)",
    bg: "bg-violet-500/10 dark:bg-violet-500/20",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500/30",
  },
} as const;

export type MediaType = keyof typeof PESO_COLORS;
