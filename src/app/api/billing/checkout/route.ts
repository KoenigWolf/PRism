import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, getPlanFromPriceId, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { captureErrorWithTenant } from "@/lib/logger";
import { hasPermission } from "@/lib/authorization";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
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
    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json({ error: "priceIdが必要です" }, { status: 400 });
    }

    // priceIdの検証（サーバーサイドで許可されたプランかチェック）
    const plan = getPlanFromPriceId(priceId);
    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: "無効なプランです" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "テナントが見つかりません" }, { status: 404 });
    }

    // 既存のStripe顧客があれば使用
    let customerId = tenant.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        metadata: {
          tenantId,
        },
      });
      customerId = customer.id;

      await prisma.tenant.update({
        where: { id: tenantId },
        data: { stripeCustomerId: customerId },
      });
    }

    // チェックアウトセッションを作成
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/settings/billing?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/settings/billing?canceled=true`,
      metadata: {
        tenantId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    captureErrorWithTenant(error as Error, tenantId, { source: "billing-checkout" });
    return NextResponse.json(
      { error: "チェックアウトセッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
