import { Tag, FileText, TrendingUp, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardKpiCardsProps {
  brandCount: number;
  prItemCount: number;
  earnedRatio: number;
  averageEngagement: number;
}

const kpiItems = [
  {
    key: "brandCount",
    title: "ブランド数",
    icon: Tag,
    format: (value: number) => `${value}`,
  },
  {
    key: "prItemCount",
    title: "PRデータ数",
    icon: FileText,
    format: (value: number) => `${value}`,
  },
  {
    key: "earnedRatio",
    title: "EARNED比率",
    icon: TrendingUp,
    format: (value: number) => `${value}%`,
  },
  {
    key: "averageEngagement",
    title: "平均エンゲージメント",
    icon: Heart,
    format: (value: number) => value.toLocaleString(),
  },
] as const;

export function DashboardKpiCards({
  brandCount,
  prItemCount,
  earnedRatio,
  averageEngagement,
}: DashboardKpiCardsProps) {
  const values = { brandCount, prItemCount, earnedRatio, averageEngagement };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiItems.map((item) => (
        <Card key={item.key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {item.format(values[item.key])}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
