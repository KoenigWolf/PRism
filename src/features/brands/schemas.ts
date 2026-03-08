import { z } from "zod";

export const brandFormSchema = z.object({
  name: z.string().min(1, "ブランド名を入力してください"),
  category: z.string().optional(),
  companyId: z.string().uuid("企業を選択してください"),
});

export type BrandFormInput = z.infer<typeof brandFormSchema>;
