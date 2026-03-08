import { getBrands } from "@/features/brands/queries";
import { getCompareData } from "@/features/compare/queries";
import { CompareSelector, CompareCharts } from "@/features/compare/components";

interface ComparePageProps {
  searchParams: Promise<{
    brands?: string;
  }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const brandIds = params.brands?.split(",").filter(Boolean) || [];

  const [brands, compareData] = await Promise.all([
    getBrands(),
    brandIds.length >= 2 ? getCompareData(brandIds) : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">比較分析</h1>
        <p className="text-muted-foreground">
          ブランド間のPR施策を比較分析
        </p>
      </div>
      <CompareSelector brands={brands} />
      <CompareCharts data={compareData} />
    </div>
  );
}
