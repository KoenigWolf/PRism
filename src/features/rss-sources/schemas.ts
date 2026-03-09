import { z } from "zod";

export const rssSourceFormSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  url: z.string().url("有効なURLを入力してください"),
  brandId: z.string().uuid("ブランドを選択してください"),
  isActive: z.boolean().optional(),
});

export type RssSourceFormData = z.infer<typeof rssSourceFormSchema>;
