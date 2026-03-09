// Test setup file for Vitest
import { beforeAll, afterAll, vi } from "vitest";

// Mock Auth.js for tests (避免 next/server 导入错误)
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// Mock next-auth to prevent next/server import issues
vi.mock("next-auth", () => ({
  default: vi.fn(),
}));

// Test tenant IDs for isolation tests
export const TEST_TENANT_A = "tenant-a-test-id";
export const TEST_TENANT_B = "tenant-b-test-id";

beforeAll(async () => {
  console.log("Test suite starting...");
});

afterAll(async () => {
  console.log("Test suite completed.");
});
