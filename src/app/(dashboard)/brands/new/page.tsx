import { getCompanies } from "@/features/brands/queries";
import { BrandForm } from "@/features/brands/components";

export default async function NewBrandPage() {
  const companies = await getCompanies();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">新規ブランド登録</h1>
        <p className="text-muted-foreground">新しいブランドを登録します</p>
      </div>
      <BrandForm companies={companies} />
    </div>
  );
}
