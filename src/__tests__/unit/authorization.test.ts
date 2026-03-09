import { describe, it, expect } from "vitest";
import { hasPermission } from "@/lib/authorization";

describe("hasPermission", () => {
  it("OWNER should have all permissions", () => {
    expect(hasPermission("OWNER", "brand:create")).toBe(true);
    expect(hasPermission("OWNER", "brand:delete")).toBe(true);
    expect(hasPermission("OWNER", "tenant:manage")).toBe(true);
    expect(hasPermission("OWNER", "user:remove")).toBe(true);
  });

  it("ADMIN should not have tenant:manage", () => {
    expect(hasPermission("ADMIN", "brand:create")).toBe(true);
    expect(hasPermission("ADMIN", "tenant:manage")).toBe(false);
    expect(hasPermission("ADMIN", "user:remove")).toBe(false);
  });

  it("MEMBER should only have create/update permissions", () => {
    expect(hasPermission("MEMBER", "brand:create")).toBe(true);
    expect(hasPermission("MEMBER", "brand:update")).toBe(true);
    expect(hasPermission("MEMBER", "brand:delete")).toBe(false);
    expect(hasPermission("MEMBER", "pr-item:delete")).toBe(false);
  });
});
