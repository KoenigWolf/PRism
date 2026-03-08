import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, getPlanFromPriceId } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { captureError } from "@/lib/logger";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    captureError(error as Error);
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const tenantId = session.metadata?.tenantId;
  if (!tenantId) {
    console.error("No tenantId in checkout session metadata");
    return;
  }

  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  // サブスクリプション詳細を取得
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const subscriptionItem = subscription.items.data[0];
  const priceId = subscriptionItem?.price.id;
  const plan = getPlanFromPriceId(priceId || "") || "starter";
  const currentPeriodEnd = subscriptionItem?.current_period_end;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : null,
      plan,
    },
  });

  console.log(`Tenant ${tenantId} subscribed to ${plan} plan`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const tenant = await prisma.tenant.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!tenant) {
    console.error(`No tenant found for subscription ${subscription.id}`);
    return;
  }

  const subscriptionItem = subscription.items.data[0];
  const priceId = subscriptionItem?.price.id;
  const plan = getPlanFromPriceId(priceId || "") || "starter";
  const currentPeriodEnd = subscriptionItem?.current_period_end;

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : null,
      plan,
    },
  });

  console.log(`Tenant ${tenant.id} subscription updated to ${plan}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const tenant = await prisma.tenant.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!tenant) {
    console.error(`No tenant found for subscription ${subscription.id}`);
    return;
  }

  // サブスクリプション解約時はstarterプランに戻す
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
      plan: "starter",
    },
  });

  console.log(`Tenant ${tenant.id} subscription cancelled, reverted to starter`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Stripe API v2ではsubscriptionはparent内にある
  const subscriptionDetails = invoice.parent?.subscription_details;
  const subscriptionId =
    typeof subscriptionDetails?.subscription === "string"
      ? subscriptionDetails.subscription
      : subscriptionDetails?.subscription?.id;

  if (!subscriptionId) return;

  const tenant = await prisma.tenant.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!tenant) return;

  // 次回の支払い期限を更新
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const subscriptionItem = subscription.items.data[0];
  const currentPeriodEnd = subscriptionItem?.current_period_end;

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      stripeCurrentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : null,
    },
  });

  console.log(`Payment succeeded for tenant ${tenant.id}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Stripe API v2ではsubscriptionはparent内にある
  const subscriptionDetails = invoice.parent?.subscription_details;
  const subscriptionId =
    typeof subscriptionDetails?.subscription === "string"
      ? subscriptionDetails.subscription
      : subscriptionDetails?.subscription?.id;

  if (!subscriptionId) return;

  const tenant = await prisma.tenant.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!tenant) return;

  // TODO: 支払い失敗時の処理（メール通知など）
  console.warn(`Payment failed for tenant ${tenant.id}`);
}
