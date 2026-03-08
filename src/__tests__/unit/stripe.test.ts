import { describe, it, expect } from "vitest";
import { PLANS, checkPlanLimit, getPlanFromPriceId } from "@/lib/stripe";

console.log("Test suite starting...");

describe("Stripe Plan Configuration", () => {
  describe("PLANS", () => {
    it("should have starter plan with correct limits", () => {
      expect(PLANS.starter.name).toBe("Starter");
      expect(PLANS.starter.maxBrands).toBe(3);
      expect(PLANS.starter.maxAIInsights).toBe(10);
    });

    it("should have professional plan with correct limits", () => {
      expect(PLANS.professional.name).toBe("Professional");
      expect(PLANS.professional.maxBrands).toBe(10);
      expect(PLANS.professional.maxAIInsights).toBe(100);
    });

    it("should have enterprise plan with unlimited limits", () => {
      expect(PLANS.enterprise.name).toBe("Enterprise");
      expect(PLANS.enterprise.maxBrands).toBe(-1);
      expect(PLANS.enterprise.maxAIInsights).toBe(-1);
    });
  });

  describe("checkPlanLimit", () => {
    it("should allow when under limit for starter plan", () => {
      const result = checkPlanLimit("starter", "brands", 2);
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(3);
      expect(result.remaining).toBe(1);
    });

    it("should not allow when at limit for starter plan", () => {
      const result = checkPlanLimit("starter", "brands", 3);
      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(3);
      expect(result.remaining).toBe(0);
    });

    it("should always allow for enterprise plan", () => {
      const result = checkPlanLimit("enterprise", "brands", 100);
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(-1);
      expect(result.remaining).toBe(-1);
    });

    it("should check aiInsights limit correctly", () => {
      const result = checkPlanLimit("professional", "aiInsights", 50);
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(100);
      expect(result.remaining).toBe(50);
    });
  });

  describe("getPlanFromPriceId", () => {
    it("should return null for unknown price ID", () => {
      const plan = getPlanFromPriceId("unknown_price_id");
      expect(plan).toBeNull();
    });

    it("should return null for empty price ID", () => {
      const plan = getPlanFromPriceId("");
      expect(plan).toBeNull();
    });
  });
});

console.log("Test suite completed.");
