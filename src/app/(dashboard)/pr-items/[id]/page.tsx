import { notFound } from "next/navigation";
import { getPrItemById } from "@/features/pr-items/queries";
import { PrItemDetailCard } from "@/features/pr-items/components";

interface PrItemDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrItemDetailPage({
  params,
}: PrItemDetailPageProps) {
  const { id } = await params;
  const prItem = await getPrItemById(id);

  if (!prItem) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PrItemDetailCard prItem={prItem} />
    </div>
  );
}
