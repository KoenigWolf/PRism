import { z } from "zod";
import { MediaType } from "@prisma/client";

export const prItemFormSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  summary: z.string().optional(),
  sourceType: z.string().min(1, "ソース種別を選択してください"),
  sourceUrl: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
  mediaType: z.nativeEnum(MediaType, {
    message: "メディア区分を選択してください",
  }),
  channel: z.string().optional(),
  engagementCount: z.number().min(0),
  reachCount: z.number().min(0).optional(),
  publishedAt: z.date().optional().nullable(),
  brandId: z.string().uuid("ブランドを選択してください"),
});

export type PrItemFormInput = z.infer<typeof prItemFormSchema>;
