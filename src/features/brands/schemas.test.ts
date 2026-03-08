import { describe, it, expect } from "vitest";
import { brandFormSchema } from "./schemas";

describe("brandFormSchema", () => {
  it("should accept valid input", () => {
    const result = brandFormSchema.safeParse({
      name: "テストブランド",
      companyId: "company-123",
      category: "化粧品",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const result = brandFormSchema.safeParse({
      name: "",
      companyId: "company-123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing companyId", () => {
    const result = brandFormSchema.safeParse({
      name: "テストブランド",
    });
    expect(result.success).toBe(false);
  });
});
