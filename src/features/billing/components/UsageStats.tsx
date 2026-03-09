"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Sparkles, Building2 } from "lucide-react";

interface UsageStatsProps {
  brandCount: number;
  brandLimit: number;
  insightCount: number;
  insightLimit: number;
}

export function UsageStats({
  brandCount,
  brandLimit,
  insightCount,
  insightLimit,
}: UsageStatsProps) {
  const brandPercentage = brandLimit === -1 ? 0 : (brandCount / brandLimit) * 100;
  const insightPercentage = insightLimit === -1 ? 0 : (insightCount / insightLimit) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          利用状況
        </CardTitle>
        <CardDescription>
          今月の利用状況を確認できます
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ブランド登録数 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">ブランド登録数</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {brandCount} / {brandLimit === -1 ? "無制限" : brandLimit}
            </span>
          </div>
          {brandLimit !== -1 && (
            <Progress
              value={brandPercentage}
              className={brandPercentage >= 90 ? "bg-red-100" : ""}
            />
          )}
          {brandLimit !== -1 && brandPercentage >= 90 && (
            <p className="text-xs text-red-500">
              登録上限に近づいています。プランをアップグレードしてください。
            </p>
          )}
        </div>

        {/* AIインサイト生成数 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">AIインサイト生成（今月）</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {insightCount} / {insightLimit === -1 ? "無制限" : insightLimit}
            </span>
          </div>
          {insightLimit !== -1 && (
            <Progress
              value={insightPercentage}
              className={insightPercentage >= 90 ? "bg-red-100" : ""}
            />
          )}
          {insightLimit !== -1 && insightPercentage >= 90 && (
            <p className="text-xs text-red-500">
              今月の生成上限に近づいています。プランをアップグレードしてください。
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
