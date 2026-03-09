import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { captureErrorWithTenant } from "@/lib/logger";
import { hasPermission } from "@/lib/authorization";
import { Role } from "@prisma/client";

export async function POST() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "認証エラー" }, { status: 401 });
  }

  // 課金管理権限のチェック（OWNERのみ）
  const userRole = session.user.role as Role;
  if (!hasPermission(userRole, "billing:manage")) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
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
