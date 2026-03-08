"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PESO_COLORS } from "@/lib/constants";
import { MediaType } from "@prisma/client";

interface PrItem {
  id: string;
  title: string;
  sourceType: string;
  mediaType: MediaType;
  channel: string | null;
  engagementCount: number;
  publishedAt: Date | null;
  brand: {
    id: string;
    name: string;
  };
}

interface Brand {
  id: string;
  name: string;
}

interface PrItemListTableProps {
  prItems: PrItem[];
  brands: Brand[];
  hasMore: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export function PrItemListTable({
  prItems,
  brands,
  hasMore,
  onLoadMore,
  isLoadingMore,
}: PrItemListTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [brandFilter, setBrandFilter] = useState(
    searchParams.get("brandId") || ""
  );
  const [mediaTypeFilter, setMediaTypeFilter] = useState(
    searchParams.get("mediaType") || ""
  );

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/pr-items?${params.toString()}`);
  };

  const handleBrandChange = (value: string | null) => {
    const v = value ?? "";
    setBrandFilter(v);
    updateFilter("brandId", v);
  };

  const handleMediaTypeChange = (value: string | null) => {
    const v = value ?? "";
    setMediaTypeFilter(v);
    updateFilter("mediaType", v);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select value={brandFilter || "all"} onValueChange={handleBrandChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="ブランドでフィルタ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべてのブランド</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={mediaTypeFilter || "all"}
          onValueChange={handleMediaTypeChange}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="メディア区分でフィルタ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべてのメディア区分</SelectItem>
            {Object.entries(PESO_COLORS).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {prItems.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">PRデータがまだ登録されていません</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>タイトル</TableHead>
                  <TableHead>ブランド</TableHead>
                  <TableHead>ソース</TableHead>
                  <TableHead>メディア区分</TableHead>
                  <TableHead>チャネル</TableHead>
                  <TableHead className="text-right">エンゲージメント</TableHead>
                  <TableHead>公開日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/pr-items/${item.id}`)}
                  >
                    <TableCell className="max-w-[200px] truncate font-medium">
                      {item.title}
                    </TableCell>
                    <TableCell>{item.brand.name}</TableCell>
                    <TableCell>{item.sourceType}</TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: PESO_COLORS[item.mediaType].color,
                          color: "#fff",
                        }}
                      >
                        {PESO_COLORS[item.mediaType].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.channel || "-"}</TableCell>
                    <TableCell className="text-right">
                      {item.engagementCount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {item.publishedAt
                        ? format(item.publishedAt, "M月d日", { locale: ja })
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={onLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "読み込み中..." : "もっと読み込む"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
