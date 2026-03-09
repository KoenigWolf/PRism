import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PLANS, type PlanType } from "@/lib/stripe";
import { BillingOverview, PlanSelector, UsageStats } from "@/features/billing/components";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    include: {
      _count: {
        select: {
          brands: { where: { deletedAt: null } },
          insights: { where: { deletedAt: null } },
        },
      },
    },
  });

  if (!tenant) {
    redirect("/login");
  }

  const plan = (tenant.plan || "starter") as PlanType;
  const planConfig = PLANS[plan];

  // 今月のインサイト生成数をカウント
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyInsightCount = await prisma.insight.count({
    where: {
      tenantId: tenant.id,
      createdAt: { gte: startOfMonth },
      deletedAt: null,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">課金・プラン設定</h1>
        <p className="text-muted-foreground">
          サブスクリプションと利用状況の管理
        </p>
      </div>

      <BillingOverview
        plan={plan}
        planName={planConfig.name}
        features={planConfig.features}
        hasSubscription={!!tenant.stripeSubscriptionId}
        currentPeriodEnd={tenant.stripeCurrentPeriodEnd}
      />

      <UsageStats
        brandCount={tenant._count.brands}
        brandLimit={planConfig.maxBrands}
        insightCount={monthlyInsightCount}
        insightLimit={planConfig.maxAIInsights}
      />

      <PlanSelector currentPlan={plan} />
    </div>
  );
}
