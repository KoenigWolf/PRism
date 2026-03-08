import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { getTenantSSOConfig, findOrCreateSSOUser } from "@/lib/sso";
import { captureError } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ tenant: string }>;
}

/**
 * SSO認証コールバック
 * IdPからのレスポンスを処理してセッションを作成
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { tenant: tenantSlug } = await params;

  try {
    const ssoConfig = await getTenantSSOConfig(tenantSlug);

    if (!ssoConfig || !ssoConfig.enabled) {
      return NextResponse.json(
        { error: "SSO is not configured for this tenant" },
        { status: 404 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const formData = await request.formData();

    let userProfile: { email: string; name: string } | null = null;

    switch (ssoConfig.provider) {
      case "saml": {
        const samlResponse = formData.get("SAMLResponse") as string;
        if (!samlResponse) {
          return NextResponse.json(
            { error: "Missing SAML response" },
            { status: 400 }
          );
        }

        // SAMLレスポンスを検証してユーザー情報を抽出
        // 本番環境では proper SAML library で署名検証を行うこと
        userProfile = parseSAMLResponse(samlResponse, ssoConfig.cert);
        break;
      }

      case "oidc": {
        // OIDCの場合はGETリクエストでcodeが来る
        return NextResponse.json(
          { error: "OIDC callback should use GET method" },
          { status: 400 }
        );
      }

      default:
        return NextResponse.json(
          { error: "Unknown SSO provider" },
          { status: 400 }
        );
    }

    if (!userProfile || !userProfile.email) {
      return NextResponse.json(
        { error: "Failed to extract user profile from SSO response" },
        { status: 400 }
      );
    }

    // ユーザーを作成または取得
    const user = await findOrCreateSSOUser(tenant.id, userProfile);

    // セッショントークンを作成
    const sessionToken = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
        role: user.role,
      },
      secret: process.env.AUTH_SECRET!,
      salt: "authjs.session-token",
    });

    // セッションCookieを設定
    const cookieStore = await cookies();
    cookieStore.set("authjs.session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30日
    });

    // ダッシュボードにリダイレクト
    return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL));
  } catch (error) {
    captureError(error as Error);
    console.error("SSO callback error:", error);
    return NextResponse.redirect(
      new URL(`/login?error=SSOError`, process.env.NEXTAUTH_URL)
    );
  }
}

/**
 * OIDC認証コールバック (GET)
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { tenant: tenantSlug } = await params;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code) {
    return NextResponse.redirect(
      new URL(`/login?error=MissingCode`, process.env.NEXTAUTH_URL)
    );
  }

  try {
    const ssoConfig = await getTenantSSOConfig(tenantSlug);

    if (!ssoConfig || !ssoConfig.enabled || ssoConfig.provider !== "oidc") {
      return NextResponse.json(
        { error: "OIDC is not configured for this tenant" },
        { status: 404 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // トークンエンドポイントで認証コードを交換
    const tokenResponse = await fetch(`${ssoConfig.issuer}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/sso/${tenantSlug}/callback`,
        client_id: ssoConfig.clientId!,
        client_secret: ssoConfig.clientSecret!,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokens = await tokenResponse.json();

    // ユーザー情報を取得
    const userInfoResponse = await fetch(`${ssoConfig.issuer}/userinfo`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error("Failed to fetch user info");
    }

    const userInfo = await userInfoResponse.json();

    // ユーザーを作成または取得
    const user = await findOrCreateSSOUser(tenant.id, {
      email: userInfo.email,
      name: userInfo.name || userInfo.email,
    });

    // セッショントークンを作成
    const sessionToken = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
        role: user.role,
      },
      secret: process.env.AUTH_SECRET!,
      salt: "authjs.session-token",
    });

    // セッションCookieを設定
    const cookieStore = await cookies();
    cookieStore.set("authjs.session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30日
    });

    // ダッシュボードにリダイレクト
    return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL));
  } catch (error) {
    captureError(error as Error);
    console.error("SSO callback error:", error);
    return NextResponse.redirect(
      new URL(`/login?error=SSOError`, process.env.NEXTAUTH_URL)
    );
  }
}

/**
 * SAMLレスポンスをパース（簡易版）
 * 本番環境では proper SAML library で署名検証を行うこと
 */
function parseSAMLResponse(
  base64Response: string,
  _cert: string | null
): { email: string; name: string } | null {
  try {
    const xml = Buffer.from(base64Response, "base64").toString("utf-8");

    // 簡易的なXMLパース（本番では xml2js や saml2-js を使用）
    const emailMatch = xml.match(
      /<saml:NameID[^>]*>([^<]+)<\/saml:NameID>/
    );
    const nameMatch = xml.match(
      /<saml:Attribute Name="name"[^>]*>[\s\S]*?<saml:AttributeValue[^>]*>([^<]+)<\/saml:AttributeValue>/
    );

    if (!emailMatch) {
      return null;
    }

    return {
      email: emailMatch[1],
      name: nameMatch ? nameMatch[1] : emailMatch[1],
    };
  } catch {
    return null;
  }
}
