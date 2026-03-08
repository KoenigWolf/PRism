import { NextResponse } from "next/server";
import { getTenantSSOConfig } from "@/lib/sso";

interface RouteParams {
  params: Promise<{ tenant: string }>;
}

/**
 * SSO認証の開始
 * /api/auth/sso/[tenant] にアクセスすると、
 * テナントのSSO設定に基づいてIdPにリダイレクト
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { tenant: tenantSlug } = await params;

  const ssoConfig = await getTenantSSOConfig(tenantSlug);

  if (!ssoConfig || !ssoConfig.enabled) {
    return NextResponse.json(
      { error: "SSO is not configured for this tenant" },
      { status: 404 }
    );
  }

  // プロバイダーに応じて認証URLを構築
  switch (ssoConfig.provider) {
    case "saml": {
      if (!ssoConfig.entryPoint) {
        return NextResponse.json(
          { error: "SAML entry point not configured" },
          { status: 500 }
        );
      }

      // SAMLリクエストを構築（簡易版）
      // 本番環境では saml2-js などのライブラリを使用
      const callbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/sso/${tenantSlug}/callback`;
      const samlRequestParams = new URLSearchParams({
        SAMLRequest: createSAMLRequest(ssoConfig.issuer || "", callbackUrl),
        RelayState: tenantSlug,
      });

      return NextResponse.redirect(
        `${ssoConfig.entryPoint}?${samlRequestParams.toString()}`
      );
    }

    case "oidc": {
      if (!ssoConfig.issuer || !ssoConfig.clientId) {
        return NextResponse.json(
          { error: "OIDC configuration incomplete" },
          { status: 500 }
        );
      }

      const callbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/sso/${tenantSlug}/callback`;
      const state = Buffer.from(
        JSON.stringify({ tenant: tenantSlug, nonce: crypto.randomUUID() })
      ).toString("base64url");

      const authUrl = new URL(`${ssoConfig.issuer}/authorize`);
      authUrl.searchParams.set("client_id", ssoConfig.clientId);
      authUrl.searchParams.set("redirect_uri", callbackUrl);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "openid email profile");
      authUrl.searchParams.set("state", state);

      return NextResponse.redirect(authUrl.toString());
    }

    case "google":
    case "azure-ad": {
      // これらは Auth.js の標準プロバイダーを使用
      // /api/auth/signin/google などにリダイレクト
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/api/auth/signin/${ssoConfig.provider}?callbackUrl=/&state=${tenantSlug}`
      );
    }

    default:
      return NextResponse.json(
        { error: "Unknown SSO provider" },
        { status: 400 }
      );
  }
}

/**
 * 簡易SAMLリクエスト生成（デモ用）
 * 本番環境では proper SAML library を使用すること
 */
function createSAMLRequest(issuer: string, callbackUrl: string): string {
  const id = `_${crypto.randomUUID()}`;
  const instant = new Date().toISOString();

  const request = `
    <samlp:AuthnRequest
      xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
      xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
      ID="${id}"
      Version="2.0"
      IssueInstant="${instant}"
      AssertionConsumerServiceURL="${callbackUrl}"
      ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
      <saml:Issuer>${issuer}</saml:Issuer>
    </samlp:AuthnRequest>
  `.trim();

  // Base64 + deflate encode (simplified - in production use proper compression)
  return Buffer.from(request).toString("base64");
}
