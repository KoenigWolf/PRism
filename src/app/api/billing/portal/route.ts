import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { captureErrorWithTenant } from "@/lib/logger";

export async function POST() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "認証エラー" }, { status: 401 });
  }

  const tenantId = session.user.tenantId;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant?.stripeCustomerId) {
      return NextResponse.json(
        { error: "サブスクリプションが見つかりません" },
        { status: 404 }
      );
    }

    // Billing Portalセッションを作成
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/settings/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    captureErrorWithTenant(error as Error, tenantId, { source: "billing-portal" });
    return NextResponse.json(
      { error: "ビリングポータルの作成に失敗しました" },
      { status: 500 }
    );
  }
}
