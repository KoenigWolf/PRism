"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { toast } from "sonner";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PESO_COLORS } from "@/lib/constants";
import { MediaType } from "@prisma/client";
import { deletePrItem } from "../actions";

interface PrItemDetailCardProps {
  prItem: {
    id: string;
    title: string;
    summary: string | null;
    sourceType: string;
    sourceUrl: string | null;
    mediaType: MediaType;
    channel: string | null;
    engagementCount: number;
    reachCount: number | null;
    publishedAt: Date | null;
    brand: {
      name: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

export function PrItemDetailCard({ prItem }: PrItemDetailCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deletePrItem(prItem.id);

    if (result.success) {
      toast.success("PRデータを削除しました");
      router.push("/pr-items");
    } else {
      toast.error(result.error);
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                style={{
                  backgroundColor: PESO_COLORS[prItem.mediaType].color,
                  color: "#fff",
                }}
              >
                {PESO_COLORS[prItem.mediaType].label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {prItem.sourceType}
              </span>
            </div>
            <CardTitle className="text-2xl">{prItem.title}</CardTitle>
            <CardDescription>{prItem.brand.name}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/pr-items/${prItem.id}/edit`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              編集
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger
                render={
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    削除
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>PRデータの削除</DialogTitle>
                  <DialogDescription>
                    「{prItem.title}」を削除しますか？この操作は取り消せません。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={isDeleting}
                  >
                    キャンセル
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "削除中..." : "削除"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {prItem.summary && (
          <p className="mb-4 text-muted-foreground">{prItem.summary}</p>
        )}
        <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">チャネル</dt>
            <dd className="font-medium">{prItem.channel || "-"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">エンゲージメント</dt>
            <dd className="font-medium">
              {prItem.engagementCount.toLocaleString()}
            </dd>
          </div>
          {prItem.reachCount !== null && (
            <div>
              <dt className="text-muted-foreground">リーチ数</dt>
              <dd className="font-medium">
                {prItem.reachCount.toLocaleString()}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-muted-foreground">公開日</dt>
            <dd className="font-medium">
              {prItem.publishedAt
                ? format(prItem.publishedAt, "yyyy年M月d日", { locale: ja })
                : "-"}
            </dd>
          </div>
          {prItem.sourceUrl && (
            <div className="col-span-2">
              <dt className="text-muted-foreground">ソースURL</dt>
              <dd>
                <a
                  href={prItem.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                >
                  {prItem.sourceUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
