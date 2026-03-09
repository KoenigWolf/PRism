"use client";

import { useSearchParams } from "next/navigation";
import { InsightGenerator } from "@/features/insights";

interface Brand {
  id: string;
  name: string;
}

interface CompareInsightProps {
  brands: Brand[];
}

export function CompareInsight({ brands }: CompareInsightProps) {
  const searchParams = useSearchParams();
  const selectedBrandIds =
    searchParams.get("brands")?.split(",").filter(Boolean) || [];

  // 選択されたブランドの名前を取得
  const selectedBrandNames = selectedBrandIds
    .map((id) => brands.find((b) => b.id === id)?.name)
    .filter((name): name is string => !!name);

  if (selectedBrandIds.length < 2) {
    return null;
  }

  return (
    <div className="border-t pt-6">
      <h2 className="text-lg font-semibold mb-4">AIによる比較分析</h2>
      <InsightGenerator
        brandIds={selectedBrandIds}
        brandNames={selectedBrandNames}
      />
    </div>
  );
}
