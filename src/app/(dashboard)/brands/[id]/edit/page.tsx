import { notFound } from "next/navigation";
import { getBrandById, getCompanies } from "@/features/brands/queries";
import { BrandForm } from "@/features/brands/components";

interface EditBrandPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBrandPage({ params }: EditBrandPageProps) {
  const { id } = await params;
  const [brand, companies] = await Promise.all([
    getBrandById(id),
    getCompanies(),
  ]);

  if (!brand) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ブランド編集</h1>
        <p className="text-muted-foreground">{brand.name} の情報を編集</p>
      </div>
      <BrandForm
        companies={companies}
        defaultValues={{
          id: brand.id,
          name: brand.name,
          category: brand.category || "",
          companyId: brand.companyId,
        }}
        mode="edit"
      />
    </div>
  );
}
