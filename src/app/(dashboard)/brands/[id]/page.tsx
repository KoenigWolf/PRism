import { notFound } from "next/navigation";
import { getBrandById } from "@/features/brands/queries";
import { BrandDetailCard } from "@/features/brands/components";

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
    </div>
  );
}
