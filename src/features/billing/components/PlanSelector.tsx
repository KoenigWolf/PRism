"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import { toast } from "sonner";
import { PLANS, type PlanType } from "@/lib/stripe";

interface PlanSelectorProps {
  currentPlan: PlanType;
}

const PLAN_PRICES = {
  starter: { monthly: 0, yearly: 0 },
  professional: { monthly: 9800, yearly: 98000 },
  enterprise: { monthly: 49800, yearly: 498000 },
} as const;

export function PlanSelector({ currentPlan }: PlanSelectorProps) {
  const [isLoading, setIsLoading] = useState<PlanType | null>(null);

  const handleSelectPlan = async (plan: PlanType) => {
    if (plan === currentPlan) return;
    if (plan === "starter") {
      toast.info("無料プランへのダウングレードはビリングポータルから行えます");
      return;
    }

    setIsLoading(plan);
    try {
      // 環境変数から価格IDを取得（実際の実装では環境変数を使用）
      const priceId =
        plan === "professional"
          ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL
          : process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE;

      if (!priceId) {
        toast.error("価格設定が見つかりません。管理者に連絡してください。");
        return;
      }

      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error("チェックアウトセッションの作成に失敗しました");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "エラーが発生しました"
      );
    } finally {
      setIsLoading(null);
    }
  };

  const plans: PlanType[] = ["starter", "professional", "enterprise"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          プランを選択
        </CardTitle>
        <CardDescription>
          ビジネスの成長に合わせてプランをアップグレード
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const config = PLANS[plan];
            const price = PLAN_PRICES[plan];
            const isCurrentPlan = plan === currentPlan;
            const isPopular = plan === "professional";

            return (
              <div
                key={plan}
                className={`relative rounded-lg border p-6 ${
                  isCurrentPlan
                    ? "border-primary bg-primary/5"
                    : "border-border"
                } ${isPopular ? "ring-2 ring-primary" : ""}`}
              >
                {isPopular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                    人気
                  </Badge>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{config.name}</h3>
                    <div className="mt-2">
                      {price.monthly === 0 ? (
                        <span className="text-3xl font-bold">無料</span>
                      ) : (
                        <>
                          <span className="text-3xl font-bold">
                            ¥{price.monthly.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">/月</span>
                        </>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {config.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : "default"}
                    disabled={isCurrentPlan || isLoading !== null}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {isLoading === plan
                      ? "読み込み中..."
                      : isCurrentPlan
                      ? "現在のプラン"
                      : plan === "starter"
                      ? "無料で始める"
                      : "アップグレード"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
