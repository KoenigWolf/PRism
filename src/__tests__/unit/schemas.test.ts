import { describe, it, expect } from "vitest";
import { brandFormSchema } from "@/features/brands/schemas";
import { prItemFormSchema } from "@/features/pr-items/schemas";
import { PESO_COLORS } from "@/config/peso";
import { MediaType } from "@prisma/client";

// テスト用のUUID
const TEST_COMPANY_UUID = "550e8400-e29b-41d4-a716-446655440000";
const TEST_BRAND_UUID = "660e8400-e29b-41d4-a716-446655440001";

describe("brandFormSchema", () => {
  it("should accept valid input", () => {
    const result = brandFormSchema.safeParse({
      name: "テストブランド",
      companyId: TEST_COMPANY_UUID,
      category: "化粧品",
    });
    expect(result.success).toBe(true);
  });

  it("should accept input without optional category", () => {
    const result = brandFormSchema.safeParse({
      name: "テストブランド",
      companyId: TEST_COMPANY_UUID,
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

  it("should reject null name", () => {
    const result = brandFormSchema.safeParse({
      name: null,
      companyId: TEST_COMPANY_UUID,
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid UUID for companyId", () => {
    const result = brandFormSchema.safeParse({
      name: "テストブランド",
      companyId: "invalid-uuid",
    });
    expect(result.success).toBe(false);
  });
});

describe("prItemFormSchema", () => {
  it("should accept valid input with all fields", () => {
    const result = prItemFormSchema.safeParse({
      title: "テスト施策",
      summary: "施策の概要",
      sourceType: "Instagram",
      sourceUrl: "https://example.com",
      mediaType: MediaType.EARNED,
      channel: "美容系インフルエンサー",
      engagementCount: 1000,
      reachCount: 5000,
      publishedAt: new Date(),
      brandId: TEST_BRAND_UUID,
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid input with required fields only", () => {
    const result = prItemFormSchema.safeParse({
      title: "テスト施策",
      sourceType: "PR TIMES",
      mediaType: MediaType.OWNED,
      engagementCount: 0,
      brandId: TEST_BRAND_UUID,
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty title", () => {
    const result = prItemFormSchema.safeParse({
      title: "",
      sourceType: "Instagram",
      mediaType: MediaType.EARNED,
      engagementCount: 0,
      brandId: TEST_BRAND_UUID,
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing mediaType", () => {
    const result = prItemFormSchema.safeParse({
      title: "テスト施策",
      sourceType: "Instagram",
      engagementCount: 0,
      brandId: TEST_BRAND_UUID,
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid mediaType", () => {
    const result = prItemFormSchema.safeParse({
      title: "テスト施策",
      sourceType: "Instagram",
      mediaType: "INVALID",
      engagementCount: 0,
      brandId: TEST_BRAND_UUID,
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative engagementCount", () => {
    const result = prItemFormSchema.safeParse({
      title: "テスト施策",
      sourceType: "Instagram",
      mediaType: MediaType.EARNED,
      engagementCount: -100,
      brandId: TEST_BRAND_UUID,
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid UUID for brandId", () => {
    const result = prItemFormSchema.safeParse({
      title: "テスト施策",
      sourceType: "Instagram",
      mediaType: MediaType.EARNED,
      engagementCount: 0,
      brandId: "invalid-uuid",
    });
    expect(result.success).toBe(false);
  });
});

describe("PESO_COLORS", () => {
  it("should have all four PESO categories", () => {
    expect(PESO_COLORS).toHaveProperty("PAID");
    expect(PESO_COLORS).toHaveProperty("EARNED");
    expect(PESO_COLORS).toHaveProperty("SHARED");
    expect(PESO_COLORS).toHaveProperty("OWNED");
  });

  it("each category should have required properties", () => {
    const requiredProps = ["label", "color", "bg", "text"];

    for (const category of Object.values(PESO_COLORS)) {
      for (const prop of requiredProps) {
        expect(category).toHaveProperty(prop);
      }
    }
  });

  it("should have correct labels", () => {
    expect(PESO_COLORS.PAID.label).toBe("Paid");
    expect(PESO_COLORS.EARNED.label).toBe("Earned");
    expect(PESO_COLORS.SHARED.label).toBe("Shared");
    expect(PESO_COLORS.OWNED.label).toBe("Owned");
  });

  it("colors should be valid hex codes", () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;

    for (const category of Object.values(PESO_COLORS)) {
      expect(category.color).toMatch(hexRegex);
    }
  });
});
