import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { checkIPRestriction, getClientIP } from "@/lib/ip-restriction";
import { loginRateLimit, checkRateLimit } from "@/lib/rate-limit";

// Paths that don't require authentication
const publicPaths = ["/login", "/api/auth", "/_next", "/favicon.ico"];

// Paths that require rate limiting
const rateLimitedPaths = ["/api/auth/callback/credentials"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting for login endpoint
  if (rateLimitedPaths.some((path) => pathname.startsWith(path))) {
    const ip = getClientIP(request.headers);
    const { success } = await checkRateLimit(loginRateLimit, ip);

    if (!success) {
      return NextResponse.json(
        { error: "リクエストが多すぎます。しばらく待ってから再試行してください。" },
        { status: 429 }
      );
    }
  }

  // Check if the path is public
  const isPublicPath = publicPaths.some(
    (path) => pathname.startsWith(path) || pathname === path
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check authentication
  const session = await auth();

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // IP restriction check for authenticated users (enterprise feature)
  if (session.user?.tenantId) {
    const ipCheck = checkIPRestriction(request.headers, session.user.tenantId);

    if (!ipCheck.allowed) {
      return NextResponse.json(
        {
          error: "アクセスが拒否されました",
          message: "このIPアドレスからのアクセスは許可されていません",
        },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
