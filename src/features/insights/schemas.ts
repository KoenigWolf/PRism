import { z } from "zod";

export const generateInsightSchema = z.object({
  brandIds: z.array(z.string().uuid()).min(1).max(5),
});

export type GenerateInsightInput = z.infer<typeof generateInsightSchema>;
