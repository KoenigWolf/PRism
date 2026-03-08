"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MediaType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PESO_COLORS, SOURCE_TYPES } from "@/lib/constants";
import { prItemFormSchema, type PrItemFormInput } from "../schemas";
import { createPrItem, updatePrItem } from "../actions";

interface Brand {
  id: string;
  name: string;
}

interface PrItemFormProps {
  brands: Brand[];
  defaultValues?: Partial<PrItemFormInput> & { id?: string };
  mode?: "create" | "edit";
}

export function PrItemForm({
  brands,
  defaultValues,
  mode = "create",
}: PrItemFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PrItemFormInput>({
    resolver: zodResolver(prItemFormSchema),
    defaultValues: {
      title: "",
      summary: "",
      sourceType: "",
      sourceUrl: "",
      mediaType: MediaType.EARNED,
      channel: "",
      engagementCount: 0,
      reachCount: undefined,
      publishedAt: null,
      brandId: "",
      ...defaultValues,
    },
  });

  const brandId = watch("brandId");
  const sourceType = watch("sourceType");
  const mediaType = watch("mediaType");

  const onSubmit = async (data: PrItemFormInput) => {
    const result =
      mode === "edit" && defaultValues?.id
        ? await updatePrItem(defaultValues.id, data)
        : await createPrItem(data);

    if (result.success) {
      toast.success(
        mode === "edit" ? "PRデータを更新しました" : "PRデータを作成しました"
      );
      router.push("/pr-items");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>
          {mode === "edit" ? "PRデータ編集" : "新規PRデータ登録"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="例: 春の新作シャンプー、ガチレビュー！"
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandId">ブランド *</Label>
            <Select
              value={brandId}
              onValueChange={(value) => setValue("brandId", value ?? "")}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="ブランドを選択" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.brandId && (
              <p className="text-sm text-red-500">{errors.brandId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sourceType">ソース種別 *</Label>
              <Select
                value={sourceType}
                onValueChange={(value) => setValue("sourceType", value ?? "")}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選択" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sourceType && (
                <p className="text-sm text-red-500">
                  {errors.sourceType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mediaType">メディア区分 *</Label>
              <Select
                value={mediaType}
                onValueChange={(value) =>
                  setValue("mediaType", value as MediaType)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選択" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PESO_COLORS).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mediaType && (
                <p className="text-sm text-red-500">
                  {errors.mediaType.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel">チャネル</Label>
            <Input
              id="channel"
              {...register("channel")}
              placeholder="例: 美容系インフルエンサーA（フォロワー10万）"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">概要</Label>
            <Input
              id="summary"
              {...register("summary")}
              placeholder="例: 泥パック成分配合で頭皮スッキリ。香りがデパコス級と高評価。"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceUrl">ソースURL</Label>
            <Input
              id="sourceUrl"
              type="url"
              {...register("sourceUrl")}
              placeholder="https://..."
              disabled={isSubmitting}
            />
            {errors.sourceUrl && (
              <p className="text-sm text-red-500">{errors.sourceUrl.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="engagementCount">エンゲージメント数</Label>
              <Input
                id="engagementCount"
                type="number"
                min={0}
                {...register("engagementCount", { valueAsNumber: true })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishedAt">公開日</Label>
              <Input
                id="publishedAt"
                type="date"
                {...register("publishedAt", { valueAsDate: true })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "保存中..."
                : mode === "edit"
                  ? "更新"
                  : "作成"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
