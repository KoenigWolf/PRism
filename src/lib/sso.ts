import { prisma } from "@/lib/prisma";

export type SSOProvider = "saml" | "oidc" | "google" | "azure-ad";

export interface SSOConfig {
  enabled: boolean;
  provider: SSOProvider | null;
  issuer: string | null;
  entryPoint: string | null;
  cert: string | null;
  clientId: string | null;
  clientSecret: string | null;
}

/**
 * テナントのSSO設定を取得
 */
export async function getTenantSSOConfig(tenantSlug: string): Promise<SSOConfig | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: {
      ssoEnabled: true,
      ssoProvider: true,
      ssoIssuer: true,
      ssoEntryPoint: true,
      ssoCert: true,
      ssoClientId: true,
      ssoClientSecret: true,
    },
  });

  if (!tenant) {
    return null;
  }

  return {
    enabled: tenant.ssoEnabled,
    provider: tenant.ssoProvider as SSOProvider | null,
    issuer: tenant.ssoIssuer,
    entryPoint: tenant.ssoEntryPoint,
    cert: tenant.ssoCert,
    clientId: tenant.ssoClientId,
    clientSecret: tenant.ssoClientSecret,
  };
}

/**
 * テナントのSSO設定を更新
 */
export async function updateTenantSSOConfig(
  tenantId: string,
  config: Partial<{
    enabled: boolean;
    provider: SSOProvider | null;
    issuer: string | null;
    entryPoint: string | null;
    cert: string | null;
    clientId: string | null;
    clientSecret: string | null;
  }>
): Promise<void> {
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      ssoEnabled: config.enabled,
      ssoProvider: config.provider,
      ssoIssuer: config.issuer,
      ssoEntryPoint: config.entryPoint,
      ssoCert: config.cert,
      ssoClientId: config.clientId,
      ssoClientSecret: config.clientSecret,
    },
  });
}

/**
 * SSO認証後にユーザーを作成または更新
 */
export async function findOrCreateSSOUser(
  tenantId: string,
  profile: {
    email: string;
    name: string;
    providerId?: string;
  }
): Promise<{
  id: string;
  email: string;
  name: string;
  tenantId: string;
  role: string;
}> {
  // 既存ユーザーを検索
  let user = await prisma.user.findFirst({
    where: {
      email: profile.email,
      tenantId,
      deletedAt: null,
    },
  });

  if (!user) {
    // 新規ユーザーを作成（SSOユーザーはパスワードなし）
    user = await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        hashedPassword: "", // SSOユーザーはパスワード認証不可
        tenantId,
        role: "MEMBER", // デフォルトロール
      },
    });
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    tenantId: user.tenantId,
    role: user.role,
  };
}

/**
 * テナントがSSO専用かどうかをチェック
 * SSO専用の場合、パスワードログインを無効化
 */
export async function isSSOOnlyTenant(tenantId: string): Promise<boolean> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { ssoEnabled: true, plan: true },
  });

  // EnterpriseプランでSSO有効の場合、SSO専用とする
  return tenant?.plan === "enterprise" && tenant?.ssoEnabled === true;
}
