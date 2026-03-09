"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";
import type { PlanType } from "@/lib/stripe";

interface BillingOverviewProps {
  plan: PlanType;
  planName: string;
  features: readonly string[];
  hasSubscription: boolean;
  currentPeriodEnd: Date | null;
}

export function BillingOverview({
  plan,
  planName,
  features,
  hasSubscription,
  currentPeriodEnd,
}: BillingOverviewProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("ビリングポータルの作成に失敗しました");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "エラーが発生しました"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanBadgeVariant = (plan: PlanType) => {
    switch (plan) {
      case "enterprise":
        return "default";
      case "professional":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              現在のプラン
            </CardTitle>
            <CardDescription>
              {hasSubscription
                ? `次回更新日: ${currentPeriodEnd?.toLocaleDateString("ja-JP")}`
                : "無料プランをご利用中です"}
            </CardDescription>
          </div>
          <Badge variant={getPlanBadgeVariant(plan)} className="text-sm">
            {planName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">含まれる機能</h4>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {hasSubscription && (
          <Button
            variant="outline"
            onClick={handleManageBilling}
            disabled={isLoading}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {isLoading ? "読み込み中..." : "サブスクリプションを管理"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
