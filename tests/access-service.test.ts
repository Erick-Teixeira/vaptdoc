import { describe, expect, it } from "vitest";
import { createAccessService } from "../src/services/access-service.js";

describe("access service", () => {
  it("creates a signed cookie for premium sessions", () => {
    const service = createAccessService({
      secret: "test-secret",
      proCodes: ["PRO-123"],
      proAccessDays: 30
    });

    const session = service.redeemCode("PRO-123");
    expect(session?.plan).toBe("pro");
    expect(session).not.toBeNull();

    const cookie = service.buildSetCookie(session!);
    expect(cookie).toContain("vaptdoc-access=");

    const cookieValue = cookie.split(";")[0];
    const restored = service.getSession(cookieValue);
    expect(restored.plan).toBe("pro");
    expect(restored.premium).toBe(true);
  });

  it("falls back to the free plan for invalid cookies", () => {
    const service = createAccessService({
      secret: "test-secret"
    });

    const restored = service.getSession("vaptdoc-access=token-invalido");
    expect(restored.plan).toBe("free");
    expect(restored.premium).toBe(false);
  });

  it("preserves payment as the session source when granting paid access", () => {
    const service = createAccessService({
      secret: "test-secret"
    });

    const activatedAt = new Date("2026-05-23T12:00:00.000Z");
    const expiresAt = new Date("2026-06-22T12:00:00.000Z");
    const session = service.grantSession({
      source: "payment",
      activatedAt,
      expiresAt
    });

    const cookie = service.buildSetCookie(session);
    const cookieValue = cookie.split(";")[0];
    const restored = service.getSession(cookieValue);
    expect(restored.plan).toBe("pro");
    expect(restored.source).toBe("payment");
  });
});
