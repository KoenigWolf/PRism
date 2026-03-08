import { describe, it, expect } from "vitest";
import { brandFormSchema } from "./schemas";

// テスト用のUUID
const TEST_COMPANY_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("brandFormSchema", () => {
  it("should accept valid input", () => {
    const result = brandFormSchema.safeParse({
      name: "テストブランド",
      companyId: TEST_COMPANY_UUID,
      category: "化粧品",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const result = brandFormSchema.safeParse({
      name: "",
      companyId: TEST_COMPANY_UUID,
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
