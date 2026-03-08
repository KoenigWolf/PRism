import { notFound } from "next/navigation";
import { getBrandById } from "@/features/brands/queries";
import { BrandDetailCard } from "@/features/brands/components";
import { InsightGenerator } from "@/features/insights";

interface BrandDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BrandDetailPage({
  params,
}: BrandDetailPageProps) {
  const { id } = await params;
  const brand = await getBrandById(id);

  if (!brand) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <BrandDetailCard brand={brand} />
      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-4">AIインサイト</h2>
        <InsightGenerator brandIds={[brand.id]} brandNames={[brand.name]} />
      </div>
    </div>
  );
}
