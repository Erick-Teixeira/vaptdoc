import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createAccessService } from "../src/services/access-service.js";
import { createAccountService } from "../src/services/account-service.js";
import { MemoryEmailService } from "../src/services/email-service.js";

const internalClientHeaders = {
  "x-vaptdoc-client": "web"
};

const avatarPngBuffer = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn5vwAAAABJRU5ErkJggg==",
  "base64"
);

function createCookieHeader(...values: Array<string | string[] | undefined>) {
  const pairs = values.flatMap((value) => {
    if (!value) {
      return [];
    }

    return (Array.isArray(value) ? value : [value]).map((entry) => String(entry).split(";", 1)[0]);
  });

  return pairs.join("; ");
}

function buildAvatarMultipartBody() {
  const boundary = "----vaptdoc-avatar-boundary";
  const parts = [
    `--${boundary}\r\nContent-Disposition: form-data; name="avatar"; filename="avatar.png"\r\nContent-Type: image/png\r\n\r\n`,
    avatarPngBuffer,
    "\r\n",
    `--${boundary}--\r\n`
  ];

  return {
    boundary,
    body: Buffer.concat(parts.map((part) => (typeof part === "string" ? Buffer.from(part) : part)))
  };
}

describe("account routes", () => {
  const apps: Array<Awaited<ReturnType<typeof createApp>>> = [];

  afterEach(async () => {
    while (apps.length) {
      const app = apps.pop();
      await app?.close();
    }
  });

  function createTempAccountService() {
    const emailService = new MemoryEmailService();
    return {
      emailService,
      service: createAccountService({
        dbPath: ":memory:",
        sessionDays: 30,
        proDailyLimit: 80,
        emailService
      })
    };
  }

  async function registerAndVerifyAccount(
    app: Awaited<ReturnType<typeof createApp>>,
    accountService: ReturnType<typeof createTempAccountService>,
    input: {
      displayName: string;
      email: string;
      password: string;
    }
  ) {
    const register = await app.inject({
      method: "POST",
      url: "/api/account/register",
      headers: {
        "content-type": "application/json",
        ...internalClientHeaders
      },
      payload: input
    });

    expect(register.statusCode).toBe(200);
    const verificationId = register.json().verification.id as string;
    const code = accountService.emailService.getLatestCode(input.email, "register");
    expect(code).toHaveLength(6);

    return app.inject({
      method: "POST",
      url: "/api/account/register/confirm",
      headers: {
        "content-type": "application/json",
        ...internalClientHeaders
      },
      payload: {
        verificationId,
        code
      }
    });
  }

  it("registers an account and exposes billing prices in the session payload", async () => {
    const accountService = createTempAccountService();
    const app = await createApp({
      accessService: createAccessService({ secret: "account-secret" }),
      accountService: accountService.service
    });
    apps.push(app);

    const register = await registerAndVerifyAccount(app, accountService, {
      displayName: "Erick Teste",
      email: "erick+register@vaptdoc.test",
      password: "SenhaSegura123"
    });

    expect(register.statusCode).toBe(200);
    expect(register.json().account.authenticated).toBe(true);
    expect(register.json().account.user.email).toBe("erick+register@vaptdoc.test");
    expect(register.json().billingOffers.length).toBeGreaterThanOrEqual(3);

    const cookieHeader = createCookieHeader(register.headers["set-cookie"]);
    const session = await app.inject({
      method: "GET",
      url: "/api/access/session",
      headers: {
        cookie: cookieHeader
      }
    });

    expect(session.statusCode).toBe(200);
    expect(session.json().account.authenticated).toBe(true);
    expect(session.json().account.user.displayName).toBe("Erick Teste");
  });

  it("persists a redeemed premium code in the authenticated account", async () => {
    const accountService = createTempAccountService();
    const app = await createApp({
      accessService: createAccessService({
        secret: "account-secret",
        proCodes: ["PRO-ACCOUNT-2026"]
      }),
      accountService: accountService.service
    });
    apps.push(app);

    const register = await registerAndVerifyAccount(app, accountService, {
      displayName: "Cliente Pro",
      email: "cliente+pro@vaptdoc.test",
      password: "SenhaSegura123"
    });

    const accountCookie = createCookieHeader(register.headers["set-cookie"]);
    const redeem = await app.inject({
      method: "POST",
      url: "/api/access/redeem",
      headers: {
        "content-type": "application/json",
        cookie: accountCookie,
        ...internalClientHeaders
      },
      payload: {
        code: "PRO-ACCOUNT-2026"
      }
    });

    expect(redeem.statusCode).toBe(200);
    expect(redeem.json().plan).toBe("pro");
    expect(redeem.json().account.plan.plan).toBe("pro");
    expect(redeem.json().account.plan.source).toBe("code");

    const combinedCookie = createCookieHeader(register.headers["set-cookie"], redeem.headers["set-cookie"]);
    const session = await app.inject({
      method: "GET",
      url: "/api/access/session",
      headers: {
        cookie: combinedCookie
      }
    });

    expect(session.statusCode).toBe(200);
    expect(session.json().plan).toBe("pro");
    expect(session.json().account.plan.plan).toBe("pro");
  });

  it("updates profile and password, then allows login with the new credentials", async () => {
    const accountService = createTempAccountService();
    const app = await createApp({
      accessService: createAccessService({ secret: "account-secret" }),
      accountService: accountService.service
    });
    apps.push(app);

    const register = await registerAndVerifyAccount(app, accountService, {
      displayName: "Conta Inicial",
      email: "conta@vaptdoc.test",
      password: "SenhaInicial123"
    });
    const cookieHeader = createCookieHeader(register.headers["set-cookie"]);

    const updateProfile = await app.inject({
      method: "POST",
      url: "/api/account/profile/email",
      headers: {
        "content-type": "application/json",
        cookie: cookieHeader,
        ...internalClientHeaders
      },
      payload: {
        displayName: "Conta Atualizada",
        email: "conta+nova@vaptdoc.test",
        currentPassword: "SenhaInicial123"
      }
    });

    expect(updateProfile.statusCode).toBe(200);
    const emailChangeVerificationId = updateProfile.json().verification.id as string;
    const emailCode = accountService.emailService.getLatestCode("conta+nova@vaptdoc.test", "email-change");

    const confirmEmailChange = await app.inject({
      method: "POST",
      url: "/api/account/profile/confirm",
      headers: {
        "content-type": "application/json",
        cookie: cookieHeader,
        ...internalClientHeaders
      },
      payload: {
        verificationId: emailChangeVerificationId,
        code: emailCode
      }
    });

    expect(confirmEmailChange.statusCode).toBe(200);
    expect(confirmEmailChange.json().account.user.displayName).toBe("Conta Atualizada");
    expect(confirmEmailChange.json().account.user.email).toBe("conta+nova@vaptdoc.test");

    const updatePassword = await app.inject({
      method: "POST",
      url: "/api/account/password",
      headers: {
        "content-type": "application/json",
        cookie: cookieHeader,
        ...internalClientHeaders
      },
      payload: {
        currentPassword: "SenhaInicial123",
        newPassword: "SenhaNova456"
      }
    });

    expect(updatePassword.statusCode).toBe(200);
    const passwordVerificationId = updatePassword.json().verification.id as string;
    const passwordCode = accountService.emailService.getLatestCode("conta+nova@vaptdoc.test", "password-change");

    const confirmPassword = await app.inject({
      method: "POST",
      url: "/api/account/password/confirm",
      headers: {
        "content-type": "application/json",
        cookie: cookieHeader,
        ...internalClientHeaders
      },
      payload: {
        verificationId: passwordVerificationId,
        code: passwordCode
      }
    });

    expect(confirmPassword.statusCode).toBe(200);

    const logout = await app.inject({
      method: "POST",
      url: "/api/account/logout",
      headers: {
        cookie: cookieHeader,
        ...internalClientHeaders
      }
    });

    expect(logout.statusCode).toBe(200);
    expect(logout.json().account.authenticated).toBe(false);

    const login = await app.inject({
      method: "POST",
      url: "/api/account/login",
      headers: {
        "content-type": "application/json",
        ...internalClientHeaders
      },
      payload: {
        email: "conta+nova@vaptdoc.test",
        password: "SenhaNova456"
      }
    });

    expect(login.statusCode).toBe(200);
    expect(login.json().account.authenticated).toBe(true);
    expect(login.json().account.user.email).toBe("conta+nova@vaptdoc.test");
  });

  it("uploads, serves and removes the authenticated avatar safely", async () => {
    const accountService = createTempAccountService();
    const app = await createApp({
      accessService: createAccessService({ secret: "account-secret" }),
      accountService: accountService.service
    });
    apps.push(app);

    const register = await registerAndVerifyAccount(app, accountService, {
      displayName: "Conta Avatar",
      email: "avatar@vaptdoc.test",
      password: "SenhaAvatar123"
    });

    const cookieHeader = createCookieHeader(register.headers["set-cookie"]);
    const avatarMultipart = buildAvatarMultipartBody();
    const upload = await app.inject({
      method: "POST",
      url: "/api/account/avatar",
      headers: {
        cookie: cookieHeader,
        "content-type": `multipart/form-data; boundary=${avatarMultipart.boundary}`,
        ...internalClientHeaders
      },
      payload: avatarMultipart.body
    });

    expect(upload.statusCode).toBe(200);
    expect(upload.json().account.user.hasAvatar).toBe(true);
    expect(upload.json().account.user.avatarUpdatedAt).toBeTruthy();

    const avatar = await app.inject({
      method: "GET",
      url: "/api/account/avatar",
      headers: {
        cookie: cookieHeader
      }
    });

    expect(avatar.statusCode).toBe(200);
    expect(avatar.headers["content-type"]).toContain("image/png");

    const remove = await app.inject({
      method: "DELETE",
      url: "/api/account/avatar",
      headers: {
        cookie: cookieHeader,
        ...internalClientHeaders
      }
    });

    expect(remove.statusCode).toBe(200);
    expect(remove.json().account.user.hasAvatar).toBe(false);
  });
});
