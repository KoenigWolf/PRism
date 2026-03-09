"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Rss, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteRssSource, toggleRssSource } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RssSource {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  lastFetched: Date | null;
  fetchCount: number;
  brand: {
    name: string;
    company: { name: string };
  };
  _count: {
    collectedItems: number;
  };
}

interface RssSourceListProps {
  sources: RssSource[];
}

export function RssSourceList({ sources }: RssSourceListProps) {
  const router = useRouter();

  const handleToggle = async (id: string, currentState: boolean) => {
    const result = await toggleRssSource(id, !currentState);
    if (result.success) {
      toast.success(currentState ? "無効化しました" : "有効化しました");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このRSSソースを削除しますか？")) return;

    const result = await deleteRssSource(id);
    if (result.success) {
      toast.success("削除しました");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  if (sources.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Rss className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>RSSソースがありません</p>
        <p className="text-sm">上のフォームからRSSフィードを追加してください</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>名前</TableHead>
          <TableHead>ブランド</TableHead>
          <TableHead>取得件数</TableHead>
          <TableHead>最終取得</TableHead>
          <TableHead>状態</TableHead>
          <TableHead className="w-[100px]">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sources.map((source) => (
          <TableRow key={source.id}>
            <TableCell>
              <div>
                <div className="font-medium">{source.name}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {source.url}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div>{source.brand.name}</div>
                <div className="text-muted-foreground">
                  {source.brand.company.name}
                </div>
              </div>
            </TableCell>
            <TableCell>{source._count.collectedItems}件</TableCell>
            <TableCell>
              {source.lastFetched
                ? format(new Date(source.lastFetched), "M/d HH:mm", {
                    locale: ja,
                  })
                : "未取得"}
            </TableCell>
            <TableCell>
              <Badge variant={source.isActive ? "default" : "secondary"}>
                {source.isActive ? "有効" : "無効"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggle(source.id, source.isActive)}
                  title={source.isActive ? "無効化" : "有効化"}
                >
                  {source.isActive ? (
                    <ToggleRight className="h-4 w-4" />
                  ) : (
                    <ToggleLeft className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(source.id)}
                  title="削除"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
