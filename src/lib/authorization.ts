import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

export type Permission =
  | "brand:create"
  | "brand:update"
  | "brand:delete"
  | "pr-item:create"
  | "pr-item:update"
  | "pr-item:delete"
  | "tenant:manage"
  | "user:invite"
  | "user:remove"
  | "billing:manage"
  | "audit:read";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: [
    "brand:create",
    "brand:update",
    "brand:delete",
    "pr-item:create",
    "pr-item:update",
    "pr-item:delete",
    "tenant:manage",
    "user:invite",
    "user:remove",
    "billing:manage",
    "audit:read",
  ],
  ADMIN: [
    "brand:create",
    "brand:update",
    "brand:delete",
    "pr-item:create",
    "pr-item:update",
    "pr-item:delete",
    "user:invite",
    "audit:read",
  ],
  MEMBER: ["brand:create", "brand:update", "pr-item:create", "pr-item:update"],
};

export async function authorize(permission: Permission) {
  const session = await auth();
  if (!session?.user?.tenantId || !session?.user?.role) {
    throw new Error("認証エラー: ログインしてください");
  }

  const role = session.user.role as Role;
  const allowed = ROLE_PERMISSIONS[role];

  if (!allowed.includes(permission)) {
    throw new Error(`権限エラー: この操作には ${permission} 権限が必要です`);
  }

  return session;
}

// ヘルパー: 権限チェックのみ（throw しない）
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
