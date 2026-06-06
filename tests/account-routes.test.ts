import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createAccessService } from "../src/services/access-service.js";
import { createAccountService } from "../src/services/account-service.js";
import { MemoryEmailService } from "../src/services/email-service.js";

const require = createRequire(import.meta.url);
const { DatabaseSync } = require("node:sqlite") as {
  DatabaseSync: typeof import("node:sqlite").DatabaseSync;
};

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

function buildConversionMultipartBody() {
  const boundary = "----vaptdoc-conversion-boundary";
  const parts = [
    `--${boundary}\r\nContent-Disposition: form-data; name="toolId"\r\n\r\npdf-to-text\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="textLayout"\r\n\r\nblocks\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="sample.pdf"\r\nContent-Type: application/pdf\r\n\r\n`,
    Buffer.from("%PDF-1.7\n1 0 obj\n"),
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
  const tempDirs: string[] = [];

  afterEach(async () => {
    while (apps.length) {
      const app = apps.pop();
      await app?.close();
    }

    while (tempDirs.length) {
      const dir = tempDirs.pop();
      if (dir) {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  function createTempAccountService() {
    const emailService = new MemoryEmailService();
    const dataDir = mkdtempSync(path.join(tmpdir(), "vaptdoc-account-"));
    tempDirs.push(dataDir);
    return {
      emailService,
      service: createAccountService({
        dbPath: ":memory:",
        dataDir,
        sessionDays: 30,
        proDailyLimit: 80,
        emailService
      })
    };
  }

  function createLegacyHistoryAccountService() {
    const emailService = new MemoryEmailService();
    const dataDir = mkdtempSync(path.join(tmpdir(), "vaptdoc-legacy-account-"));
    const dbPath = path.join(dataDir, "legacy.sqlite");
    tempDirs.push(dataDir);

    const db = new DatabaseSync(dbPath);
    db.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE account_conversion_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        tool_id TEXT NOT NULL,
        tool_label TEXT NOT NULL,
        source_label TEXT NOT NULL,
        input_count INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL,
        error_message TEXT,
        stored_file_name TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        completed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_account_conversion_history_user_id_created_at ON account_conversion_history(user_id, created_at DESC);
      CREATE INDEX idx_account_conversion_history_status ON account_conversion_history(status);
    `);
    db.close();

    return {
      dbPath,
      service: createAccountService({
        dbPath,
        dataDir,
        sessionDays: 30,
        proDailyLimit: 80,
        emailService
      })
    };
  }

  function buildAsyncConversionMultipartBody() {
    const boundary = "----vaptdoc-async-boundary";
    const parts = [
      `--${boundary}\r\nContent-Disposition: form-data; name="toolId"\r\n\r\nmp4-to-mp3\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="sample.mp4"\r\nContent-Type: video/mp4\r\n\r\n`,
      Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34]),
      "\r\n",
      `--${boundary}--\r\n`
    ];

    return {
      boundary,
      body: Buffer.concat(parts.map((part) => (typeof part === "string" ? Buffer.from(part) : part)))
    };
  }

  async function waitForConversionFile(
    app: Awaited<ReturnType<typeof createApp>>,
    cookieHeader: string,
    historyId: string,
    attempts = 80
  ) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const response = await app.inject({
        method: "GET",
        url: "/api/account/files?filter=all&limit=30",
        headers: {
          cookie: cookieHeader
        }
      });

      expect(response.statusCode).toBe(200);
      const item = response.json().items.find((entry: { id: string }) => entry.id === historyId);
      if (item && item.status === "ready") {
        return item;
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    throw new Error(`Timed out while waiting for conversion file ${historyId}`);
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

  it("migrates legacy conversion history tables before creating mode-based indexes", () => {
    const { dbPath, service } = createLegacyHistoryAccountService();
    service.close();
    const db = new DatabaseSync(dbPath);
    const columns = db.prepare("PRAGMA table_info(account_conversion_history)").all() as Array<{ name: string }>;
    db.close();

    expect(columns.some((column) => column.name === "mode")).toBe(true);
    expect(columns.some((column) => column.name === "options_json")).toBe(true);
    expect(columns.some((column) => column.name === "input_files_json")).toBe(true);
    expect(columns.some((column) => column.name === "output_filename")).toBe(true);
    expect(columns.some((column) => column.name === "output_content_type")).toBe(true);
    expect(columns.some((column) => column.name === "output_size_bytes")).toBe(true);
    expect(columns.some((column) => column.name === "provider")).toBe(true);
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

  it("persists favorite tools in the authenticated account session", async () => {
    const accountService = createTempAccountService();
    const app = await createApp({
      accessService: createAccessService({ secret: "account-secret" }),
      accountService: accountService.service
    });
    apps.push(app);

    const register = await registerAndVerifyAccount(app, accountService, {
      displayName: "Conta Favoritos",
      email: "favoritos@vaptdoc.test",
      password: "SenhaSegura123"
    });

    const cookieHeader = createCookieHeader(register.headers["set-cookie"]);
    const updateFavorites = await app.inject({
      method: "PUT",
      url: "/api/account/favorites",
      headers: {
        cookie: cookieHeader,
        "content-type": "application/json",
        ...internalClientHeaders
      },
      payload: {
        toolIds: ["pdf-to-docx", "pdf-merge", "pdf-to-docx"]
      }
    });

    expect(updateFavorites.statusCode).toBe(200);
    expect(updateFavorites.json().account.favoriteToolIds).toEqual(["pdf-to-docx", "pdf-merge"]);

    const session = await app.inject({
      method: "GET",
      url: "/api/access/session",
      headers: {
        cookie: cookieHeader
      }
    });

    expect(session.statusCode).toBe(200);
    expect(session.json().account.favoriteToolIds).toEqual(["pdf-to-docx", "pdf-merge"]);
  });

  it("stores conversion history and allows downloading the generated file again", async () => {
    const accountService = createTempAccountService();
    const app = await createApp({
      accessService: createAccessService({ secret: "account-secret" }),
      accountService: accountService.service,
      conversionService: {
        async convert() {
          return {
            data: Buffer.from("resultado-final"),
            filename: "resultado.txt",
            contentType: "text/plain; charset=utf-8",
            provider: "mock",
            summary: "mock"
          };
        }
      } as never
    });
    apps.push(app);

    const register = await registerAndVerifyAccount(app, accountService, {
      displayName: "Conta Historico",
      email: "historico@vaptdoc.test",
      password: "SenhaSegura123"
    });

    const cookieHeader = createCookieHeader(register.headers["set-cookie"]);
    const multipart = buildConversionMultipartBody();
    const convert = await app.inject({
      method: "POST",
      url: "/api/convert",
      headers: {
        cookie: cookieHeader,
        "content-type": `multipart/form-data; boundary=${multipart.boundary}`,
        ...internalClientHeaders
      },
      payload: multipart.body
    });

    expect(convert.statusCode).toBe(200);

    const history = await app.inject({
      method: "GET",
      url: "/api/account/history",
      headers: {
        cookie: cookieHeader
      }
    });

    expect(history.statusCode).toBe(200);
    expect(history.json().items).toHaveLength(1);
    expect(history.json().items[0].status).toBe("ready");
    expect(history.json().items[0].outputFilename).toBe("resultado.txt");

    const historyId = history.json().items[0].id as string;
    const download = await app.inject({
      method: "GET",
      url: `/api/account/history/${historyId}/download`,
      headers: {
        cookie: cookieHeader
      }
    });

    expect(download.statusCode).toBe(200);
    expect(download.headers["content-type"]).toContain("text/plain");
    expect(download.body).toBe("resultado-final");
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

  it("stores async jobs in Meus arquivos, emits notifications and exposes usage breakdown", async () => {
    const accountService = createTempAccountService();
    const app = await createApp({
      accessService: createAccessService({ secret: "account-secret" }),
      accountService: accountService.service,
      conversionService: {
        async convert() {
          return {
            data: Buffer.from("async-mp3"),
            filename: "sample.mp3",
            contentType: "audio/mpeg",
            provider: "mock",
            summary: "mock"
          };
        }
      } as never
    });
    apps.push(app);

    const register = await registerAndVerifyAccount(app, accountService, {
      displayName: "Conta Async",
      email: "async@vaptdoc.test",
      password: "SenhaAsync123"
    });

    const cookieHeader = createCookieHeader(register.headers["set-cookie"]);
    const multipart = buildAsyncConversionMultipartBody();
    const queued = await app.inject({
      method: "POST",
      url: "/api/convert/async",
      headers: {
        cookie: cookieHeader,
        "content-type": `multipart/form-data; boundary=${multipart.boundary}`,
        ...internalClientHeaders
      },
      payload: multipart.body
    });

    expect(queued.statusCode).toBe(202);
    expect(queued.json().historyId).toBeTruthy();

    const historyId = queued.json().historyId as string;
    const readyItem = await waitForConversionFile(app, cookieHeader, historyId);
    expect(readyItem.mode).toBe("async");
    expect(readyItem.status).toBe("ready");
    expect(readyItem.downloadUrl).toContain(historyId);

    const usage = await app.inject({
      method: "GET",
      url: "/api/account/usage",
      headers: {
        cookie: cookieHeader
      }
    });
    expect(usage.statusCode).toBe(200);
    expect(usage.json().items.find((item: { toolId: string }) => item.toolId === "mp4-to-mp3")).toBeTruthy();

    const notifications = await app.inject({
      method: "GET",
      url: "/api/account/notifications",
      headers: {
        cookie: cookieHeader
      }
    });
    expect(notifications.statusCode).toBe(200);
    expect(notifications.json().items.some((item: { historyId: string | null; type: string }) => item.historyId === historyId && item.type === "job-ready")).toBe(true);

    const download = await app.inject({
      method: "GET",
      url: `/api/account/history/${historyId}/download`,
      headers: {
        cookie: cookieHeader
      }
    });
    expect(download.statusCode).toBe(200);
    expect(download.body).toBe("async-mp3");

    const remove = await app.inject({
      method: "DELETE",
      url: `/api/account/files/${historyId}`,
      headers: {
        cookie: cookieHeader,
        ...internalClientHeaders
      }
    });
    expect(remove.statusCode).toBe(200);

    const filesAfterDelete = await app.inject({
      method: "GET",
      url: "/api/account/files?filter=all&limit=30",
      headers: {
        cookie: cookieHeader
      }
    });
    expect(filesAfterDelete.statusCode).toBe(200);
    expect(filesAfterDelete.json().items).toHaveLength(0);
  });

  it("exposes queue counts and per-tool usage inside the admin panel data", async () => {
    const accountService = createTempAccountService();
    const ownerEmail = "owner@vaptdoc.test";
    accountService.service = createAccountService({
      dbPath: ":memory:",
      dataDir: tempDirs[tempDirs.length - 1],
      sessionDays: 30,
      proDailyLimit: 80,
      emailService: accountService.emailService,
      adminOwnerEmails: [ownerEmail]
    });
    const app = await createApp({
      accessService: createAccessService({ secret: "account-secret" }),
      accountService: accountService.service,
      conversionService: {
        async convert() {
          return {
            data: Buffer.from("admin-mp3"),
            filename: "owner.mp3",
            contentType: "audio/mpeg",
            provider: "mock",
            summary: "mock"
          };
        }
      } as never
    });
    apps.push(app);

    const register = await registerAndVerifyAccount(app, accountService, {
      displayName: "Owner",
      email: ownerEmail,
      password: "SenhaOwner123"
    });
    const cookieHeader = createCookieHeader(register.headers["set-cookie"]);
    const multipart = buildAsyncConversionMultipartBody();

    const queued = await app.inject({
      method: "POST",
      url: "/api/convert/async",
      headers: {
        cookie: cookieHeader,
        "content-type": `multipart/form-data; boundary=${multipart.boundary}`,
        ...internalClientHeaders
      },
      payload: multipart.body
    });
    expect(queued.statusCode).toBe(202);
    const historyId = queued.json().historyId as string;
    await waitForConversionFile(app, cookieHeader, historyId);

    const dashboard = await app.inject({
      method: "GET",
      url: "/api/admin/dashboard",
      headers: {
        cookie: cookieHeader,
        ...internalClientHeaders
      }
    });
    expect(dashboard.statusCode).toBe(200);
    expect(dashboard.json().dashboard.topToolUsage.some((item: { toolId: string }) => item.toolId === "mp4-to-mp3")).toBe(true);

    const detail = await app.inject({
      method: "GET",
      url: `/api/admin/users/${register.json().account.user.id}`,
      headers: {
        cookie: cookieHeader,
        ...internalClientHeaders
      }
    });
    expect(detail.statusCode).toBe(200);
    expect(detail.json().user.usageBreakdown.some((item: { toolId: string }) => item.toolId === "mp4-to-mp3")).toBe(true);
    expect(detail.json().user.recentConversions.some((item: { id: string }) => item.id === historyId)).toBe(true);
  });
});
