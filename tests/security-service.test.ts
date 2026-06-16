import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createSecurityService, type SecurityService } from "../src/services/security-service.js";

describe("SecurityService", () => {
  const directories: string[] = [];
  const services: SecurityService[] = [];

  afterEach(async () => {
    while (services.length) {
      services.pop()?.close();
    }
    while (directories.length) {
      await rm(directories.pop()!, { recursive: true, force: true });
    }
  });

  async function createService() {
    const directory = await mkdtemp(path.join(os.tmpdir(), "vaptdoc-security-"));
    directories.push(directory);
    const service = createSecurityService({
      dbPath: path.join(directory, "security.sqlite"),
      secret: "security-test-secret-with-more-than-32-characters",
      publicAppUrl: "https://vaptdoc.test",
      loginFailureLimit: 3,
      loginLockMinutes: 10,
      adminElevationMinutes: 5,
      nodeEnv: "production"
    });
    services.push(service);
    return service;
  }

  it("issues and validates a same-origin double-submit CSRF token", async () => {
    const service = await createService();
    const bootstrap = service.getPublicConfig();
    const cookie = String(bootstrap.setCookie).split(";", 1)[0];

    expect(() => service.assertMutationRequest({
      method: "POST",
      url: "/api/account/profile",
      protocol: "https",
      host: "vaptdoc.test",
      headers: {
        origin: "https://vaptdoc.test",
        cookie,
        "x-csrf-token": bootstrap.config.csrfToken
      }
    })).not.toThrow();

    expect(() => service.assertMutationRequest({
      method: "POST",
      url: "/api/account/profile",
      protocol: "https",
      host: "vaptdoc.test",
      headers: {
        origin: "https://evil.test",
        cookie,
        "x-csrf-token": bootstrap.config.csrfToken
      }
    })).toThrowError(/Origem/u);

    expect(() => service.assertMutationRequest({
      method: "POST",
      url: "/api/account/profile",
      protocol: "https",
      host: "vaptdoc.test",
      headers: {
        origin: "https://vaptdoc.test",
        cookie,
        "x-csrf-token": "invalid"
      }
    })).toThrowError(/segurança expirou/u);
  });

  it("locks repeated login failures and clears the bucket after success", async () => {
    const service = await createService();
    const context = { ip: "203.0.113.8", userAgent: "test" };
    service.recordLoginFailure("user@example.test", context);
    service.recordLoginFailure("user@example.test", context);
    service.recordLoginFailure("user@example.test", context);
    expect(() => service.assertLoginAllowed("user@example.test", context)).toThrowError(/Muitas tentativas/u);

    service.recordLoginSuccess("user@example.test", context);
    expect(() => service.assertLoginAllowed("user@example.test", context)).not.toThrow();
  });

  it("requires a valid short-lived admin elevation cookie", async () => {
    const service = await createService();
    const elevation = service.issueAdminElevation("owner-id");
    const cookie = elevation.setCookie.split(";", 1)[0];
    expect(() => service.assertAdminElevation(cookie, "owner-id")).not.toThrow();
    expect(() => service.assertAdminElevation(cookie, "other-id")).toThrowError(/confirmação/u);
  });
});
