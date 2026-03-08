import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { getBrands } from "@/features/brands/queries";
import { BrandListTable } from "@/features/brands/components";

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ブランド管理</h1>
          <p className="text-muted-foreground">
            登録済みブランドの一覧と管理
          </p>
        </div>
        <Link href="/brands/new" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" />
          新規作成
        </Link>
      </div>
      <BrandListTable brands={brands} />
    </div>
  );
}
