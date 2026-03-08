import { notFound } from "next/navigation";
import { getPrItemById } from "@/features/pr-items/queries";
import { getBrands } from "@/features/brands/queries";
import { PrItemForm } from "@/features/pr-items/components";

interface EditPrItemPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPrItemPage({ params }: EditPrItemPageProps) {
  const { id } = await params;
  const [prItem, brands] = await Promise.all([
    getPrItemById(id),
    getBrands(),
  ]);

  if (!prItem) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">PRデータ編集</h1>
        <p className="text-muted-foreground">{prItem.title} の情報を編集</p>
      </div>
      <PrItemForm
        brands={brands}
        defaultValues={{
          id: prItem.id,
          title: prItem.title,
          summary: prItem.summary || "",
          sourceType: prItem.sourceType,
          sourceUrl: prItem.sourceUrl || "",
          mediaType: prItem.mediaType,
          channel: prItem.channel || "",
          engagementCount: prItem.engagementCount,
          reachCount: prItem.reachCount ?? undefined,
          publishedAt: prItem.publishedAt,
          brandId: prItem.brandId,
        }}
        mode="edit"
      />
    </div>
  );
}
