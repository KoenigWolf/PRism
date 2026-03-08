import { getDashboardStats } from "@/features/dashboard/queries";
import {
  DashboardKpiCards,
  DashboardCharts,
  RecentPrItemsTable,
} from "@/features/dashboard/components";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground">PR活動の概要とKPI</p>
      </div>
      <DashboardKpiCards
        brandCount={stats.brandCount}
        prItemCount={stats.prItemCount}
        earnedRatio={stats.earnedRatio}
        averageEngagement={stats.averageEngagement}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <DashboardCharts mediaTypeDistribution={stats.mediaTypeDistribution} />
        <RecentPrItemsTable prItems={stats.recentPrItems} />
      </div>
    </div>
  );
}
