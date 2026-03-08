import Stripe from "stripe";

// ビルド時にはStripe初期化をスキップし、実行時に初期化
function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(key, {
    apiVersion: "2026-02-25.clover",
    typescript: true,
  });
}

// 遅延初期化
let _stripe: Stripe | null = null;
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    if (!_stripe) {
      _stripe = getStripeClient();
    }
    return (_stripe as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// プラン定義
export const PLANS = {
  starter: {
    name: "Starter",
    maxBrands: 3,
    maxAIInsights: 10,
    features: ["基本分析", "3ブランドまで", "月10回AIインサイト"],
  },
  professional: {
    name: "Professional",
    maxBrands: 10,
    maxAIInsights: 100,
    features: ["高度な分析", "10ブランドまで", "月100回AIインサイト", "PDFエクスポート"],
  },
  enterprise: {
    name: "Enterprise",
    maxBrands: -1, // 無制限
    maxAIInsights: -1, // 無制限
    features: ["全機能", "無制限ブランド", "無制限AIインサイト", "IP制限", "SSO", "専用サポート"],
  },
} as const;

export type PlanType = keyof typeof PLANS;

// Stripe価格IDからプランタイプを取得
export function getPlanFromPriceId(priceId: string): PlanType {
  const priceToPlans: Record<string, PlanType> = {
    [process.env.STRIPE_PRICE_STARTER || ""]: "starter",
    [process.env.STRIPE_PRICE_PROFESSIONAL || ""]: "professional",
    [process.env.STRIPE_PRICE_ENTERPRISE || ""]: "enterprise",
  };
  return priceToPlans[priceId] || "starter";
}

// プランの機能制限をチェック
export function checkPlanLimit(
  plan: PlanType,
  feature: "brands" | "aiInsights",
  currentCount: number
): { allowed: boolean; limit: number; remaining: number } {
  const planConfig = PLANS[plan];
  const limit = feature === "brands" ? planConfig.maxBrands : planConfig.maxAIInsights;

  if (limit === -1) {
    return { allowed: true, limit: -1, remaining: -1 };
  }

  const remaining = limit - currentCount;
  return {
    allowed: remaining > 0,
    limit,
    remaining: Math.max(0, remaining),
  };
}
