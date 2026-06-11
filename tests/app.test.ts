import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createAccessService } from "../src/services/access-service.js";
import { UsageTracker } from "../src/services/usage-tracker.js";
import type { ConversionRequest } from "../src/types.js";

interface MultipartTestFile {
  fieldName?: string;
  filename: string;
  contentType: string;
  buffer: Buffer;
}

interface MultipartBodyOptions {
  toolId?: string;
  fields?: Record<string, string>;
  files?: MultipartTestFile[];
}

const internalClientHeaders = {
  "x-vaptdoc-client": "web"
};

function buildMultipartBody(options: MultipartBodyOptions = {}) {
  const {
    toolId = "pdf-to-text",
    fields = { textLayout: "blocks" },
    files = [
      {
        fieldName: "file",
        filename: "sample.pdf",
        contentType: "application/pdf",
        buffer: Buffer.from("%PDF-1.7\n1 0 obj\n")
      }
    ]
  } = options;
  const boundary = "----vaptdoc-boundary";
  const chunks: Array<string | Buffer> = [`--${boundary}\r\nContent-Disposition: form-data; name="toolId"\r\n\r\n${toolId}\r\n`];

  for (const [fieldName, value] of Object.entries(fields)) {
    chunks.push(`--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"\r\n\r\n${value}\r\n`);
  }

  for (const file of files) {
    chunks.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="${file.fieldName ?? "file"}"; filename="${file.filename}"\r\nContent-Type: ${file.contentType}\r\n\r\n`
    );
    chunks.push(file.buffer);
    chunks.push("\r\n");
  }

  chunks.push(`--${boundary}--\r\n`);

  return {
    boundary,
    body: Buffer.concat(chunks.map((chunk) => (typeof chunk === "string" ? Buffer.from(chunk) : chunk)))
  };
}

describe("app routes", () => {
  const apps: Array<Awaited<ReturnType<typeof createApp>>> = [];

  afterEach(async () => {
    while (apps.length) {
      const app = apps.pop();
      await app?.close();
    }
  });

  it("lists available tools", async () => {
    const app = await createApp();
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/tools"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().tools.length).toBeGreaterThan(1);
    expect(response.json().tools.find((tool: { id: string; routePath?: string }) => tool.id === "pdf-to-docx")?.routePath).toBe("/pdf-para-docx");
    expect(response.json().limits.maxFileSizeMB).toBeGreaterThan(0);
  });

  it("exposes the language selector from the account menu", async () => {
    const app = await createApp();
    apps.push(app);

    const page = await app.inject({
      method: "GET",
      url: "/"
    });
    const script = await app.inject({
      method: "GET",
      url: "/app.js"
    });

    expect(page.statusCode).toBe(200);
    expect(page.body).toContain('id="account-menu-language"');
    expect(page.body).toContain('id="account-menu-language-label">Idioma</span>');
    expect(page.body).toContain('id="account-language-select"');
    expect(page.body).toContain('<option value="pt-BR">');
    expect(page.body).toContain('<option value="en">English</option>');
    expect(script.statusCode).toBe(200);
    expect(script.body).toContain('accountMenuLanguage?.addEventListener("click"');
    expect(script.body).toContain('showAccountModal({ focus: "settings" })');
    expect(script.body).toContain('"common.searchExamples": ["pdf to docx"');
    expect(script.body).toContain('"workspace.convertTool": "Convert {tool}"');
    expect(script.body).toContain('"account.menu.subscription": "My Plan"');
    expect(script.body).toContain("startSearchPlaceholderAnimation();");
    expect(script.body).toContain("getLocalizedToolLabel(tool)");
    expect(script.body).toContain("localizeInterfaceText(field.label)");
    expect(script.body).toContain('document.body.dataset.pageMode === "tool" ? getToolById() : null');
  });

  it("keeps account management in dedicated dashboard areas without overview duplication", async () => {
    const app = await createApp();
    apps.push(app);

    const page = await app.inject({
      method: "GET",
      url: "/"
    });
    const script = await app.inject({
      method: "GET",
      url: "/app.js"
    });

    expect(page.statusCode).toBe(200);
    expect(page.body).not.toContain('id="account-menu-profile"');
    expect(page.body).toContain('id="account-menu-overview"');
    expect(page.body).toContain('id="account-overview-page"');
    expect(page.body).toContain('class="account-dashboard-sidebar"');
    expect(page.body).toContain('class="account-dashboard-main"');
    expect(page.body).not.toContain('id="account-overview-modal"');
    expect(page.body).toContain('data-account-dashboard-view="overview"');
    expect(page.body).toContain('data-account-dashboard-view="files" hidden');
    expect(page.body).toContain('data-account-dashboard-view="credits" hidden');
    expect(page.body).toContain('data-account-dashboard-view="usage" hidden');
    expect(page.body).not.toContain('id="account-shortcut-profile"');
    expect(page.body).toContain('id="account-dashboard-profile-nav"');
    expect(page.body).toContain('id="account-dashboard-menu-toggle"');
    expect(page.body).toContain('id="account-usage-chart"');
    expect(page.body).toContain('id="account-status-donut"');
    expect(page.body).toContain("Dados e credenciais");
    expect(script.statusCode).toBe(200);
    expect(script.body).toContain('document.getElementById("account-overview-page")');
    expect(script.body).toContain("function showAccountDashboardView(viewId)");
    expect(script.body).not.toContain('accountMenuProfile?.addEventListener("click"');
    expect(script.body).toContain('accountDashboardProfileNav?.addEventListener("click"');
    expect(script.body).toContain("function renderAccountOverviewCharts()");
    expect(script.body).toContain("function closeAccountPane()");
    expect(script.body).toContain('showAccountModal({ focus: "profile" })');
  });

  it("returns the current access session", async () => {
    const app = await createApp();
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/access/session"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().plan).toBe("free");
    expect(response.json().remainingToday).toBeGreaterThan(0);
    expect(response.json().account.favoriteToolIds).toEqual([]);
    expect(response.json().account.recentConversions).toEqual([]);
  });

  it("ignores malformed cookie encoding instead of crashing the session route", async () => {
    const app = await createApp();
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/access/session",
      headers: {
        cookie: "vaptdoc-access=%E0%A4%A"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().plan).toBe("free");
  });

  it("reports health and readiness details", async () => {
    const app = await createApp();
    apps.push(app);

    const health = await app.inject({
      method: "GET",
      url: "/health"
    });
    const ready = await app.inject({
      method: "GET",
      url: "/readyz"
    });

    expect(health.statusCode).toBe(200);
    expect(health.json().service).toBe("vaptdoc");
    expect(health.json().limits.maxFileSizeMB).toBeGreaterThan(0);
    expect(health.json().limits.conversionCacheTtlSeconds).toBeGreaterThanOrEqual(0);
    expect(health.json().queue).toBeDefined();
    expect(health.json().queue.maxConcurrent).toBeGreaterThan(0);
    expect(health.json().integrations).toBeDefined();
    expect(health.json().integrations.ilovePdf).toBeDefined();
    expect(health.json().integrations.aspose3d).toBeDefined();
    expect(health.json().integrations.email.provider).toBeDefined();
    expect(ready.statusCode).toBe(200);
    expect(ready.json().status).toBe("ready");
  });

  it("exposes the generated OpenAPI document", async () => {
    const app = await createApp();
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/documentation/json"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().openapi).toBe("3.0.3");
    expect(response.json().info.title).toBe("vaptdoc API");
    expect(response.json().paths["/api/tools"]).toBeDefined();
  });

  it("serves SEO routes for sitemap, robots and tool pages", async () => {
    const app = await createApp();
    apps.push(app);

    const toolPage = await app.inject({
      method: "GET",
      url: "/pdf-para-docx",
      headers: {
        host: "example.test"
      }
    });
    const legacyToolRoute = await app.inject({
      method: "GET",
      url: "/ferramenta/pdf-to-docx"
    });
    const sitemap = await app.inject({
      method: "GET",
      url: "/sitemap.xml"
    });
    const robots = await app.inject({
      method: "GET",
      url: "/robots.txt"
    });

    expect(toolPage.statusCode).toBe(200);
    expect(toolPage.body).toContain("Converter PDF para DOCX online | vaptdoc");
    expect(toolPage.body).toContain("application/ld+json");
    expect(toolPage.body).toContain("seo-faq-schema");
    expect(toolPage.body).toContain("/pdf-para-docx");
    expect(toolPage.body).toContain("http://example.test/pdf-para-docx");
    expect(toolPage.body).not.toContain("transmutalab.up.railway.app");
    expect(legacyToolRoute.statusCode).toBe(301);
    expect(legacyToolRoute.headers.location).toBe("/pdf-para-docx");
    expect(sitemap.statusCode).toBe(200);
    expect(sitemap.body).toContain("/pdf-para-docx");
    expect(sitemap.body).toContain("/privacy.html");
    expect(robots.statusCode).toBe(200);
    expect(robots.body).toContain("Disallow: /api/");
    expect(robots.body).toContain("Sitemap:");
  });

  it("accepts conversion requests with multipart upload", async () => {
    let seenTextLayout = "";
    const app = await createApp({
      conversionService: {
        async convert(payload: ConversionRequest) {
          seenTextLayout = payload.options?.textLayout ?? "";
          return {
            data: Buffer.from("ok"),
            filename: "Relacao final.txt",
            contentType: "text/plain; charset=utf-8",
            provider: "mock",
            summary: "mock"
          };
        }
      } as never
    });
    apps.push(app);

    const multipart = buildMultipartBody();
    const response = await app.inject({
      method: "POST",
      url: "/api/convert",
      payload: multipart.body,
      headers: {
        ...internalClientHeaders,
        "content-type": `multipart/form-data; boundary=${multipart.boundary}`
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/plain");
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.headers["pragma"]).toBe("no-cache");
    expect(response.headers["content-disposition"]).toContain('filename="Relacao final.txt"');
    expect(response.headers["content-disposition"]).toContain("filename*=UTF-8''Relacao%20final.txt");
    expect(response.headers["x-conversion-provider"]).toBe("mock");
    expect(response.headers["x-access-plan"]).toBe("free");
    expect(seenTextLayout).toBe("blocks");
  });

  it("rejects state-changing requests without the trusted client header", async () => {
    const app = await createApp();
    apps.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/access/logout"
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().code).toBe("REQUEST_ORIGIN_FORBIDDEN");
  });

  it("returns 400 for empty json bodies instead of leaking a 500", async () => {
    const app = await createApp();
    apps.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/account/logout",
      headers: {
        "content-type": "application/json",
        ...internalClientHeaders
      },
      payload: ""
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().message).toMatch(/Body cannot be empty/i);
  });

  it("blocks premium tools for free visitors", async () => {
    let convertWasCalled = false;
    const app = await createApp({
      conversionService: {
        async convert() {
          convertWasCalled = true;
          return {
            data: Buffer.from("ok"),
            filename: "never.pdf",
            contentType: "application/pdf",
            provider: "mock",
            summary: "mock"
          };
        }
      } as never
    });
    apps.push(app);

    const multipart = buildMultipartBody({
      toolId: "pdf-merge",
      fields: {},
      files: [
        {
          filename: "parte-1.pdf",
          contentType: "application/pdf",
          buffer: Buffer.from("%PDF-1.7\nparte-1")
        },
        {
          filename: "parte-2.pdf",
          contentType: "application/pdf",
          buffer: Buffer.from("%PDF-1.7\nparte-2")
        }
      ]
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/convert",
      payload: multipart.body,
      headers: {
        ...internalClientHeaders,
        "content-type": `multipart/form-data; boundary=${multipart.boundary}`
      }
    });

    expect(response.statusCode).toBe(402);
    expect(response.json().code).toBe("PREMIUM_REQUIRED");
    expect(convertWasCalled).toBe(false);
  });

  it("redeems a premium code and allows premium conversions", async () => {
    const accessService = createAccessService({
      secret: "test-secret",
      proCodes: ["PRO-ATIVO-2026"]
    });
    const usageTracker = new UsageTracker();
    const app = await createApp({
      accessService,
      usageTracker,
      conversionService: {
        async convert() {
          return {
            data: Buffer.from("%PDF-1.7\nok"),
            filename: "premium.pdf",
            contentType: "application/pdf",
            provider: "mock",
            summary: "mock"
          };
        }
      } as never
    });
    apps.push(app);

    const redeem = await app.inject({
      method: "POST",
      url: "/api/access/redeem",
      payload: {
        code: "PRO-ATIVO-2026"
      },
      headers: internalClientHeaders
    });

    expect(redeem.statusCode).toBe(200);
    expect(redeem.json().plan).toBe("pro");
    const cookie = redeem.headers["set-cookie"];
    expect(cookie).toContain("vaptdoc-access=");

    const multipart = buildMultipartBody({
      toolId: "pdf-merge",
      fields: {},
      files: [
        {
          filename: "parte-1.pdf",
          contentType: "application/pdf",
          buffer: Buffer.from("%PDF-1.7\nparte-1")
        },
        {
          filename: "parte-2.pdf",
          contentType: "application/pdf",
          buffer: Buffer.from("%PDF-1.7\nparte-2")
        }
      ]
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/convert",
      payload: multipart.body,
      headers: {
        ...internalClientHeaders,
        "content-type": `multipart/form-data; boundary=${multipart.boundary}`,
        cookie
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["x-access-plan"]).toBe("pro");
  });

  it("enforces the daily free limit after successful conversions", async () => {
    const accessService = createAccessService({
      secret: "test-secret",
      freeDailyLimit: 1
    });
    const usageTracker = new UsageTracker();
    const app = await createApp({
      accessService,
      usageTracker,
      conversionService: {
        async convert() {
          return {
            data: Buffer.from("ok"),
            filename: "imagem.png",
            contentType: "image/png",
            provider: "mock",
            summary: "mock"
          };
        }
      } as never
    });
    apps.push(app);

    const multipart = buildMultipartBody({
      toolId: "jpg-to-png",
      fields: {},
      files: [
        {
          filename: "foto.jpg",
          contentType: "image/jpeg",
          buffer: Buffer.from([0xff, 0xd8, 0xff, 0xdb])
        }
      ]
    });

    const firstResponse = await app.inject({
      method: "POST",
      url: "/api/convert",
      payload: multipart.body,
      headers: {
        ...internalClientHeaders,
        "content-type": `multipart/form-data; boundary=${multipart.boundary}`,
        "user-agent": "vaptdoc-test"
      }
    });

    const secondMultipart = buildMultipartBody({
      toolId: "jpg-to-png",
      fields: {},
      files: [
        {
          filename: "foto-2.jpg",
          contentType: "image/jpeg",
          buffer: Buffer.from([0xff, 0xd8, 0xff, 0xdb])
        }
      ]
    });

    const secondResponse = await app.inject({
      method: "POST",
      url: "/api/convert",
      payload: secondMultipart.body,
      headers: {
        ...internalClientHeaders,
        "content-type": `multipart/form-data; boundary=${secondMultipart.boundary}`,
        "user-agent": "vaptdoc-test"
      }
    });

    expect(firstResponse.statusCode).toBe(200);
    expect(secondResponse.statusCode).toBe(429);
    expect(secondResponse.json().code).toBe("FREE_LIMIT_REACHED");
  });

  it("ignores text layout for non-textual tools", async () => {
    const boundary = "----vaptdoc-boundary-audio";
    const chunks = [
      `--${boundary}\r\nContent-Disposition: form-data; name="toolId"\r\n\r\nmp4-to-mp3\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="textLayout"\r\n\r\nlines\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="sample.mp4"\r\nContent-Type: video/mp4\r\n\r\n`,
      Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34]),
      `\r\n--${boundary}--\r\n`
    ];

    let seenTextLayout = "unexpected";
    const app = await createApp({
      conversionService: {
        async convert(payload: ConversionRequest) {
          seenTextLayout = payload.options?.textLayout ?? "";
          return {
            data: Buffer.from("ok"),
            filename: "sample.mp3",
            contentType: "audio/mpeg",
            provider: "mock",
            summary: "mock"
          };
        }
      } as never
    });
    apps.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/convert",
      payload: Buffer.concat(chunks.map((chunk) => (typeof chunk === "string" ? Buffer.from(chunk) : chunk))),
      headers: {
        ...internalClientHeaders,
        "content-type": `multipart/form-data; boundary=${boundary}`
      }
    });

    expect(response.statusCode).toBe(200);
    expect(seenTextLayout).toBe("");
  });

  it("accepts multiple files and filters unexpected options", async () => {
    const accessService = createAccessService({
      secret: "test-secret",
      proCodes: ["PRO-MERGE"]
    });
    const usageTracker = new UsageTracker();
    const boundary = "----vaptdoc-boundary-merge";
    const chunks = [
      `--${boundary}\r\nContent-Disposition: form-data; name="toolId"\r\n\r\npdf-merge\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="watermarkText"\r\n\r\nhack\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="parte-1.pdf"\r\nContent-Type: application/pdf\r\n\r\n`,
      Buffer.from("%PDF-1.7\nparte-1"),
      `\r\n--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="parte-2.pdf"\r\nContent-Type: application/pdf\r\n\r\n`,
      Buffer.from("%PDF-1.7\nparte-2"),
      `\r\n--${boundary}--\r\n`
    ];

    let seenUploadCount = 0;
    let seenOptions: ConversionRequest["options"] = {};
    const app = await createApp({
      accessService,
      usageTracker,
      conversionService: {
        async convert(payload: ConversionRequest) {
          seenUploadCount = payload.uploads.length;
          seenOptions = payload.options ?? {};
          return {
            data: Buffer.from("%PDF-1.7\nok"),
            filename: "parte-1-unido.pdf",
            contentType: "application/pdf",
            provider: "mock",
            summary: "mock"
          };
        }
      } as never
    });
    apps.push(app);

    const redeem = await app.inject({
      method: "POST",
      url: "/api/access/redeem",
      payload: {
        code: "PRO-MERGE"
      },
      headers: internalClientHeaders
    });
    const cookie = redeem.headers["set-cookie"];

    const response = await app.inject({
      method: "POST",
      url: "/api/convert",
      payload: Buffer.concat(chunks.map((chunk) => (typeof chunk === "string" ? Buffer.from(chunk) : chunk))),
      headers: {
        ...internalClientHeaders,
        "content-type": `multipart/form-data; boundary=${boundary}`,
        cookie
      }
    });

    expect(response.statusCode).toBe(200);
    expect(seenUploadCount).toBe(2);
    expect(seenOptions).toEqual({});
  });

  it("creates a managed checkout session for premium plans", async () => {
    const app = await createApp({
      billingService: {
        isCheckoutEnabled() {
          return true;
        },
        getCheckoutProvider() {
          return "mercadopago";
        },
        buildStateCookie() {
          return "vaptdoc-checkout=state-token; Path=/; HttpOnly";
        },
        async createCheckout() {
          return {
            checkoutUrl: "https://pay.example/checkout",
            preferenceId: "pref-123",
            stateToken: "state-token",
            offer: {
              id: "pro-monthly",
              title: "Pro mensal",
              description: "mock",
              plan: "pro",
              accessDays: 30,
              amountBRL: 19.9
            },
            provider: "mercadopago"
          };
        }
      } as never
    });
    apps.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/billing/checkout",
      payload: {
        offerId: "pro-monthly"
      },
      headers: {
        ...internalClientHeaders,
        host: "vaptdoc.test",
        "x-forwarded-proto": "https"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().checkoutUrl).toBe("https://pay.example/checkout");
    expect(response.headers["set-cookie"]).toContain("vaptdoc-checkout=state-token");
  });

  it("confirms an approved checkout and grants premium access", async () => {
    const accessService = createAccessService({
      secret: "billing-secret"
    });
    const usageTracker = new UsageTracker();
    const app = await createApp({
      accessService,
      usageTracker,
      billingService: {
        isCheckoutEnabled() {
          return true;
        },
        getCheckoutProvider() {
          return "mercadopago";
        },
        getStateToken() {
          return "state-token";
        },
        buildClearStateCookie() {
          return "vaptdoc-checkout=; Path=/; Max-Age=0";
        },
        async confirmCheckout() {
          return {
            stateToken: "state-token",
            paymentId: "pay-123",
            status: "approved",
            rawStatus: "approved",
            amountBRL: 19.9,
            approvedAt: "2026-05-23T12:30:00.000Z",
            offer: {
              id: "pro-monthly",
              title: "Pro mensal",
              description: "mock",
              plan: "pro",
              accessDays: 30,
              amountBRL: 19.9
            }
          };
        }
      } as never
    });
    apps.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/billing/confirm-return",
      payload: {
        paymentId: "pay-123"
      },
      headers: {
        ...internalClientHeaders,
        cookie: "vaptdoc-checkout=state-token"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe("approved");
    expect(response.json().session.plan).toBe("pro");
    expect(String(response.headers["set-cookie"])).toContain("vaptdoc-access=");
  });

  it("rejects empty uploads before reaching the conversion service", async () => {
    let convertWasCalled = false;
    const boundary = "----vaptdoc-boundary-empty";
    const body = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="toolId"\r\n\r\npdf-to-text\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="vazio.pdf"\r\nContent-Type: application/pdf\r\n\r\n` +
      `\r\n--${boundary}--\r\n`
    );

    const app = await createApp({
      conversionService: {
        async convert() {
          convertWasCalled = true;
          return {
            data: Buffer.from("ok"),
            filename: "never.txt",
            contentType: "text/plain; charset=utf-8",
            provider: "mock",
            summary: "mock"
          };
        }
      } as never
    });
    apps.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/convert",
      payload: body,
      headers: {
        ...internalClientHeaders,
        "content-type": `multipart/form-data; boundary=${boundary}`
      }
    });

    expect(response.statusCode).toBe(400);
    expect(convertWasCalled).toBe(false);
    expect(response.json().code).toBe("EMPTY_FILE");
  });

  it("rejects uploads larger than the configured limit before conversion", async () => {
    let convertWasCalled = false;
    const largeBuffer = Buffer.alloc(26 * 1024 * 1024, 0x41);
    const multipart = buildMultipartBody({
      files: [
        {
          fieldName: "file",
          filename: "grande.pdf",
          contentType: "application/pdf",
          buffer: Buffer.concat([Buffer.from("%PDF-1.7\n"), largeBuffer])
        }
      ]
    });
    const app = await createApp({
      conversionService: {
        async convert() {
          convertWasCalled = true;
          return {
            data: Buffer.from("ok"),
            filename: "never.txt",
            contentType: "text/plain; charset=utf-8",
            provider: "mock",
            summary: "mock"
          };
        }
      } as never
    });
    apps.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/convert",
      payload: multipart.body,
      headers: {
        ...internalClientHeaders,
        "content-type": `multipart/form-data; boundary=${multipart.boundary}`
      }
    });

    expect(response.statusCode).toBe(413);
    expect(convertWasCalled).toBe(false);
    expect(JSON.stringify(response.json())).toMatch(/25 MB|maior do que o limite|FILE_TOO_LARGE/i);
  });
});
