"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Brand {
  id: string;
  name: string;
  category: string | null;
  company: {
    name: string;
  };
  _count: {
    prItems: number;
  };
}

interface BrandListTableProps {
  brands: Brand[];
}

export function BrandListTable({ brands }: BrandListTableProps) {
  const router = useRouter();

  if (brands.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">ブランドがまだ登録されていません</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ブランド名</TableHead>
            <TableHead>カテゴリ</TableHead>
            <TableHead>企業</TableHead>
            <TableHead className="text-right">PRデータ数</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.map((brand) => (
            <TableRow
              key={brand.id}
              className="cursor-pointer"
              onClick={() => router.push(`/brands/${brand.id}`)}
            >
              <TableCell className="font-medium">{brand.name}</TableCell>
              <TableCell>{brand.category || "-"}</TableCell>
              <TableCell>{brand.company.name}</TableCell>
              <TableCell className="text-right">
                {brand._count.prItems}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
