/**
 * IP制限機能（エンタープライズプラン向け）
 *
 * テナントごとに許可IPリストを設定し、
 * 許可されていないIPからのアクセスをブロックする
 */

// 環境変数からIP制限設定を取得
// 形式: ALLOWED_IPS_<TENANT_ID>=192.168.1.0/24,10.0.0.0/8
function getAllowedIPs(tenantId: string): string[] | null {
  const envKey = `ALLOWED_IPS_${tenantId.replace(/-/g, "_").toUpperCase()}`;
  const allowedIPs = process.env[envKey];

  if (!allowedIPs) {
    return null; // IP制限なし
  }

  return allowedIPs.split(",").map((ip) => ip.trim());
}

/**
 * IPアドレスがCIDR範囲内にあるかチェック
 */
function isIPInCIDR(ip: string, cidr: string): boolean {
  // CIDR形式でない場合は完全一致
  if (!cidr.includes("/")) {
    return ip === cidr;
  }

  const [range, bits] = cidr.split("/");
  const mask = parseInt(bits, 10);

  // IPv4のみサポート
  const ipParts = ip.split(".").map(Number);
  const rangeParts = range.split(".").map(Number);

  if (ipParts.length !== 4 || rangeParts.length !== 4) {
    return false;
  }

  const ipNum =
    (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
  const rangeNum =
    (rangeParts[0] << 24) |
    (rangeParts[1] << 16) |
    (rangeParts[2] << 8) |
    rangeParts[3];
  const maskNum = ~((1 << (32 - mask)) - 1);

  return (ipNum & maskNum) === (rangeNum & maskNum);
}

/**
 * IPアドレスが許可リストに含まれているかチェック
 */
export function isIPAllowed(ip: string, tenantId: string): boolean {
  const allowedIPs = getAllowedIPs(tenantId);

  // IP制限が設定されていない場合は全て許可
  if (!allowedIPs) {
    return true;
  }

  // いずれかのIP/CIDRにマッチすればOK
  return allowedIPs.some((allowed) => isIPInCIDR(ip, allowed));
}

/**
 * リクエストからクライアントIPを取得
 */
export function getClientIP(headers: Headers): string {
  // Cloudflare
  const cfConnectingIP = headers.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;

  // X-Forwarded-For (最初のIPがクライアント)
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",");
    return ips[0].trim();
  }

  // X-Real-IP
  const xRealIP = headers.get("x-real-ip");
  if (xRealIP) return xRealIP;

  // Vercel
  const vercelForwardedFor = headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) return vercelForwardedFor;

  return "unknown";
}

export interface IPCheckResult {
  allowed: boolean;
  ip: string;
  reason?: string;
}

/**
 * IP制限チェック（ミドルウェア用）
 */
export function checkIPRestriction(
  headers: Headers,
  tenantId: string
): IPCheckResult {
  const ip = getClientIP(headers);

  if (ip === "unknown") {
    // IPが取得できない場合はログを残して許可
    console.warn("[IP Restriction] Could not determine client IP");
    return { allowed: true, ip };
  }

  const allowed = isIPAllowed(ip, tenantId);

  if (!allowed) {
    console.warn(
      `[IP Restriction] Blocked access from ${ip} for tenant ${tenantId}`
    );
    return {
      allowed: false,
      ip,
      reason: `IP ${ip} is not in the allowed list for this tenant`,
    };
  }

  return { allowed: true, ip };
}
