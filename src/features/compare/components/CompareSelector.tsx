"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Brand {
  id: string;
  name: string;
}

interface CompareSelectorProps {
  brands: Brand[];
}

export function CompareSelector({ brands }: CompareSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedBrands = searchParams.get("brands")?.split(",").filter(Boolean) || [];

  const handleToggle = (brandId: string) => {
    let newSelection: string[];

    if (selectedBrands.includes(brandId)) {
      newSelection = selectedBrands.filter((id) => id !== brandId);
    } else {
      if (selectedBrands.length >= 3) {
        return;
      }
      newSelection = [...selectedBrands, brandId];
    }

    const params = new URLSearchParams(searchParams.toString());
    if (newSelection.length > 0) {
      params.set("brands", newSelection.join(","));
    } else {
      params.delete("brands");
    }
    router.push(`/compare?${params.toString()}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ブランド選択</CardTitle>
        <p className="text-sm text-muted-foreground">
          2〜3つのブランドを選択して比較
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={brand.id}
                checked={selectedBrands.includes(brand.id)}
                onCheckedChange={() => handleToggle(brand.id)}
                disabled={
                  !selectedBrands.includes(brand.id) &&
                  selectedBrands.length >= 3
                }
              />
              <Label
                htmlFor={brand.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {brand.name}
              </Label>
            </div>
          ))}
        </div>
        {brands.length === 0 && (
          <p className="text-muted-foreground">ブランドがありません</p>
        )}
      </CardContent>
    </Card>
  );
}
