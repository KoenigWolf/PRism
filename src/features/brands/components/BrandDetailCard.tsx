"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { deleteBrand } from "../actions";

interface BrandDetailCardProps {
  brand: {
    id: string;
    name: string;
    category: string | null;
    company: {
      name: string;
    };
    prItems: Array<{ id: string }>;
  };
}

export function BrandDetailCard({ brand }: BrandDetailCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteBrand(brand.id);

    if (result.success) {
      toast.success("ブランドを削除しました");
      router.push("/brands");
    } else {
      toast.error(result.error);
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{brand.name}</CardTitle>
            <CardDescription>{brand.company.name}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/brands/${brand.id}/edit`)}
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
                  <DialogTitle>ブランドの削除</DialogTitle>
                  <DialogDescription>
                    「{brand.name}」を削除しますか？この操作は取り消せません。
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
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">カテゴリ</dt>
            <dd className="font-medium">{brand.category || "-"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">PRデータ数</dt>
            <dd className="font-medium">{brand.prItems.length}件</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
