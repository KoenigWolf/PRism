"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { rssSourceFormSchema, type RssSourceFormData } from "../schemas";
import { createRssSource } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Brand {
  id: string;
  name: string;
  company: { name: string };
}

interface RssSourceFormProps {
  brands: Brand[];
}

export function RssSourceForm({ brands }: RssSourceFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RssSourceFormData>({
    resolver: zodResolver(rssSourceFormSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const onSubmit = async (data: RssSourceFormData) => {
    const result = await createRssSource(data);
    if (result.success) {
      toast.success("RSSソースを追加しました");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">名前</Label>
        <Input
          id="name"
          placeholder="例: 資生堂 ニュースルーム"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">RSS URL</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://example.com/rss.xml"
          {...register("url")}
        />
        {errors.url && (
          <p className="text-sm text-red-500">{errors.url.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="brandId">紐付けるブランド</Label>
        <Select onValueChange={(value) => setValue("brandId", value as string)}>
          <SelectTrigger>
            <SelectValue placeholder="ブランドを選択" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.company.name} / {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.brandId && (
          <p className="text-sm text-red-500">{errors.brandId.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "追加中..." : "RSSソースを追加"}
      </Button>
    </form>
  );
}
