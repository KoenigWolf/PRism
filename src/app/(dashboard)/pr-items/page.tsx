import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { getPrItems } from "@/features/pr-items/queries";
import { getBrands } from "@/features/brands/queries";
import { PrItemListTable } from "@/features/pr-items/components";
import { MediaType } from "@prisma/client";

interface PrItemsPageProps {
  searchParams: Promise<{
    brandId?: string;
    mediaType?: string;
  }>;
}

export default async function PrItemsPage({ searchParams }: PrItemsPageProps) {
  const params = await searchParams;
  const brandId = params.brandId;
  const mediaType = params.mediaType as MediaType | undefined;

  const [prItemsResult, brands] = await Promise.all([
    getPrItems({ brandId, mediaType }),
    getBrands(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">PRデータ管理</h1>
          <p className="text-muted-foreground">
            PR施策データの一覧と管理
          </p>
        </div>
        <Link href="/pr-items/new" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" />
          新規作成
        </Link>
      </div>
      <PrItemListTable
        prItems={prItemsResult.items}
        brands={brands}
        hasMore={prItemsResult.hasMore}
      />
    </div>
  );
}
