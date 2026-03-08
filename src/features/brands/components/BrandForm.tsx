"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { brandFormSchema, type BrandFormInput } from "../schemas";
import { createBrand, updateBrand } from "../actions";

interface Company {
  id: string;
  name: string;
}

interface BrandFormProps {
  companies: Company[];
  defaultValues?: BrandFormInput & { id?: string };
  mode?: "create" | "edit";
}

export function BrandForm({
  companies,
  defaultValues,
  mode = "create",
}: BrandFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormInput>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: defaultValues || { name: "", category: "", companyId: "" },
  });

  const companyId = watch("companyId");

  const onSubmit = async (data: BrandFormInput) => {
    const result =
      mode === "edit" && defaultValues?.id
        ? await updateBrand(defaultValues.id, data)
        : await createBrand(data);

    if (result.success) {
      toast.success(
        mode === "edit" ? "ブランドを更新しました" : "ブランドを作成しました"
      );
      router.push("/brands");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>
          {mode === "edit" ? "ブランド編集" : "新規ブランド登録"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">ブランド名 *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="例: CLAYGE（クレージュ）"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">カテゴリ</Label>
            <Input
              id="category"
              {...register("category")}
              placeholder="例: ヘアケア・スキンケア"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyId">企業 *</Label>
            <Select
              value={companyId}
              onValueChange={(value) => setValue("companyId", value ?? "")}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="企業を選択" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.companyId && (
              <p className="text-sm text-red-500">{errors.companyId.message}</p>
            )}
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
