import { getBrands } from "@/features/brands/queries";
import { PrItemForm } from "@/features/pr-items/components";

export default async function NewPrItemPage() {
  const brands = await getBrands();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">新規PRデータ登録</h1>
        <p className="text-muted-foreground">新しいPR施策データを登録します</p>
      </div>
      <PrItemForm brands={brands} />
    </div>
  );
}
