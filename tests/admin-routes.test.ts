import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createAccessService } from "../src/services/access-service.js";
import { createAccountService } from "../src/services/account-service.js";
import { MemoryEmailService } from "../src/services/email-service.js";

const internalClientHeaders = {
  "x-vaptdoc-client": "web"
};

function createCookieHeader(...values: Array<string | string[] | undefined>) {
  const pairs = values.flatMap((value) => {
    if (!value) {
      return [];
    }

    return (Array.isArray(value) ? value : [value]).map((entry) => String(entry).split(";", 1)[0]);
  });

  return pairs.join("; ");
}

describe("admin routes", () => {
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
        adminOwnerEmails: ["owner@vaptdoc.test"],
        emailService
      })
    };
  }

  async function registerAndVerifyAccount(app: Awaited<ReturnType<typeof createApp>>, accountService: ReturnType<typeof createTempAccountService>, input: {
    displayName: string;
    email: string;
    password: string;
  }) {
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

  it("blocks non-admin users and allows the owner to manage plans, credits and promos", async () => {
    const accountService = createTempAccountService();
    const app = await createApp({
      accessService: createAccessService({ secret: "admin-secret" }),
      accountService: accountService.service
    });
    apps.push(app);

    const ownerRegister = await registerAndVerifyAccount(app, accountService, {
      displayName: "Owner",
      email: "owner@vaptdoc.test",
      password: "SenhaSegura123"
    });
    expect(ownerRegister.statusCode).toBe(200);

    const userRegister = await registerAndVerifyAccount(app, accountService, {
      displayName: "Cliente",
      email: "cliente@vaptdoc.test",
      password: "SenhaSegura123"
    });
    expect(userRegister.statusCode).toBe(200);

    const ownerCookie = createCookieHeader(ownerRegister.headers["set-cookie"]);
    const userCookie = createCookieHeader(userRegister.headers["set-cookie"]);
    const userId = userRegister.json().account.user.id as string;

    const userForbidden = await app.inject({
      method: "GET",
      url: "/api/admin/dashboard",
      headers: {
        cookie: userCookie,
        ...internalClientHeaders
      }
    });
    expect(userForbidden.statusCode).toBe(403);

    const dashboard = await app.inject({
      method: "GET",
      url: "/api/admin/dashboard",
      headers: {
        cookie: ownerCookie,
        ...internalClientHeaders
      }
    });
    expect(dashboard.statusCode).toBe(200);
    expect(dashboard.json().dashboard.totalUsers).toBe(2);

    const credits = await app.inject({
      method: "POST",
      url: `/api/admin/users/${userId}/credits`,
      headers: {
        "content-type": "application/json",
        cookie: ownerCookie,
        ...internalClientHeaders
      },
      payload: {
        mode: "add",
        amount: 25
      }
    });
    expect(credits.statusCode).toBe(200);
    expect(credits.json().user.wallet.creditBalance).toBe(25);

    const discount = await app.inject({
      method: "POST",
      url: `/api/admin/users/${userId}/discount`,
      headers: {
        "content-type": "application/json",
        cookie: ownerCookie,
        ...internalClientHeaders
      },
      payload: {
        percent: 25,
        days: 10
      }
    });
    expect(discount.statusCode).toBe(200);
    expect(discount.json().user.wallet.discountPercent).toBe(25);

    const promoCreate = await app.inject({
      method: "POST",
      url: "/api/admin/promos",
      headers: {
        "content-type": "application/json",
        cookie: ownerCookie,
        ...internalClientHeaders
      },
      payload: {
        code: "PROMO-ADMIN-1",
        label: "Campanha premium",
        creditAmount: 5,
        accessDays: 7,
        accessPlan: "pro",
        perUserLimit: 1
      }
    });
    expect(promoCreate.statusCode).toBe(200);
    expect(promoCreate.json().promo.code).toBe("PROMO-ADMIN-1");

    const sessionWithDiscount = await app.inject({
      method: "GET",
      url: "/api/access/session",
      headers: {
        cookie: userCookie
      }
    });
    expect(sessionWithDiscount.statusCode).toBe(200);
    expect(sessionWithDiscount.json().billingOffers[0].amountBRL).toBeLessThan(19.9);

    const redeemPromo = await app.inject({
      method: "POST",
      url: "/api/access/redeem",
      headers: {
        "content-type": "application/json",
        cookie: userCookie,
        ...internalClientHeaders
      },
      payload: {
        code: "PROMO-ADMIN-1"
      }
    });
    expect(redeemPromo.statusCode).toBe(200);
    expect(redeemPromo.json().account.plan.plan).toBe("pro");
    expect(redeemPromo.json().account.wallet.creditBalance).toBe(30);
  });
});
