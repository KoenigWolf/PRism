import { describe, it, expect, vi, beforeEach } from "vitest";
import { isIPAllowed, getClientIP, checkIPRestriction } from "@/lib/ip-restriction";

describe("IP Restriction", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  describe("isIPAllowed", () => {
    it("should allow all IPs when no restriction is set", () => {
      // No environment variable set for this tenant
      expect(isIPAllowed("192.168.1.1", "test-tenant")).toBe(true);
      expect(isIPAllowed("10.0.0.1", "test-tenant")).toBe(true);
    });

    it("should allow exact IP match", () => {
      vi.stubEnv("ALLOWED_IPS_TEST_TENANT", "192.168.1.100");
      expect(isIPAllowed("192.168.1.100", "test-tenant")).toBe(true);
      expect(isIPAllowed("192.168.1.101", "test-tenant")).toBe(false);
    });

    it("should allow IPs within CIDR range", () => {
      vi.stubEnv("ALLOWED_IPS_TEST_TENANT", "192.168.1.0/24");
      expect(isIPAllowed("192.168.1.1", "test-tenant")).toBe(true);
      expect(isIPAllowed("192.168.1.254", "test-tenant")).toBe(true);
      expect(isIPAllowed("192.168.2.1", "test-tenant")).toBe(false);
    });

    it("should support multiple IP ranges", () => {
      vi.stubEnv("ALLOWED_IPS_TEST_TENANT", "192.168.1.0/24,10.0.0.0/8");
      expect(isIPAllowed("192.168.1.50", "test-tenant")).toBe(true);
      expect(isIPAllowed("10.255.255.255", "test-tenant")).toBe(true);
      expect(isIPAllowed("172.16.0.1", "test-tenant")).toBe(false);
    });

    it("should handle /32 CIDR (single IP)", () => {
      vi.stubEnv("ALLOWED_IPS_TEST_TENANT", "192.168.1.1/32");
      expect(isIPAllowed("192.168.1.1", "test-tenant")).toBe(true);
      expect(isIPAllowed("192.168.1.2", "test-tenant")).toBe(false);
    });

    it("should handle /16 CIDR", () => {
      vi.stubEnv("ALLOWED_IPS_TEST_TENANT", "172.16.0.0/16");
      expect(isIPAllowed("172.16.0.1", "test-tenant")).toBe(true);
      expect(isIPAllowed("172.16.255.255", "test-tenant")).toBe(true);
      expect(isIPAllowed("172.17.0.1", "test-tenant")).toBe(false);
    });
  });

  describe("getClientIP", () => {
    it("should extract IP from cf-connecting-ip header", () => {
      const headers = new Headers();
      headers.set("cf-connecting-ip", "1.2.3.4");
      headers.set("x-forwarded-for", "5.6.7.8");
      expect(getClientIP(headers)).toBe("1.2.3.4");
    });

    it("should extract first IP from x-forwarded-for header", () => {
      const headers = new Headers();
      headers.set("x-forwarded-for", "1.2.3.4, 10.0.0.1, 192.168.1.1");
      expect(getClientIP(headers)).toBe("1.2.3.4");
    });

    it("should extract IP from x-real-ip header", () => {
      const headers = new Headers();
      headers.set("x-real-ip", "1.2.3.4");
      expect(getClientIP(headers)).toBe("1.2.3.4");
    });

    it("should extract IP from x-vercel-forwarded-for header", () => {
      const headers = new Headers();
      headers.set("x-vercel-forwarded-for", "1.2.3.4");
      expect(getClientIP(headers)).toBe("1.2.3.4");
    });

    it("should return unknown when no IP header is present", () => {
      const headers = new Headers();
      expect(getClientIP(headers)).toBe("unknown");
    });
  });

  describe("checkIPRestriction", () => {
    it("should return allowed when IP is in allowlist", () => {
      vi.stubEnv("ALLOWED_IPS_TEST_TENANT", "192.168.1.0/24");
      const headers = new Headers();
      headers.set("x-forwarded-for", "192.168.1.50");

      const result = checkIPRestriction(headers, "test-tenant");
      expect(result.allowed).toBe(true);
      expect(result.ip).toBe("192.168.1.50");
    });

    it("should return not allowed when IP is not in allowlist", () => {
      vi.stubEnv("ALLOWED_IPS_TEST_TENANT", "192.168.1.0/24");
      const headers = new Headers();
      headers.set("x-forwarded-for", "10.0.0.1");

      const result = checkIPRestriction(headers, "test-tenant");
      expect(result.allowed).toBe(false);
      expect(result.ip).toBe("10.0.0.1");
      expect(result.reason).toContain("10.0.0.1");
    });

    it("should allow when no restriction is configured", () => {
      const headers = new Headers();
      headers.set("x-forwarded-for", "10.0.0.1");

      const result = checkIPRestriction(headers, "no-restriction-tenant");
      expect(result.allowed).toBe(true);
    });

    it("should allow unknown IP when client IP cannot be determined", () => {
      const headers = new Headers();

      const result = checkIPRestriction(headers, "test-tenant");
      expect(result.allowed).toBe(true);
      expect(result.ip).toBe("unknown");
    });
  });
});
