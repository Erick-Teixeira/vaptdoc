import path from "node:path";
import { readFile } from "node:fs/promises";
import Fastify, { type FastifyRequest } from "fastify";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import fastifyStatic from "@fastify/static";
import { ZodError } from "zod";
import { toolCatalog, type ToolId } from "./catalog.js";
import { env } from "./env.js";
import { registerApiRoutes } from "./routes/api.js";
import { createConversionService } from "./services/conversion-service.js";
import { createAccessService, type AccessService } from "./services/access-service.js";
import { createBillingService, type BillingService } from "./services/billing-service.js";
import { createAccountService, type AccountService } from "./services/account-service.js";
import { ConversionJobService } from "./services/conversion-job-service.js";
import { createEmailService } from "./services/email-service.js";
import { UsageTracker } from "./services/usage-tracker.js";
import { ConversionGate } from "./utils/conversion-gate.js";
import { AppError, isAppError } from "./utils/errors.js";
import { resolveServerSecret } from "./utils/secrets.js";
import { buildRobotsTxt, buildSitemapXml, getSeoViewModel, renderSeoHtml } from "./seo.js";
import { getToolPath, getToolPathEntries } from "./tool-paths.js";

interface AppOptions {
  conversionService?: ReturnType<typeof createConversionService>;
  accessService?: AccessService;
  billingService?: BillingService;
  accountService?: AccountService;
  usageTracker?: UsageTracker;
}

export async function createApp(options: AppOptions = {}) {
  const app = Fastify({
    logger: env.NODE_ENV !== "test",
    trustProxy: true
  });

  const accessSecretConfig = resolveServerSecret(env.ACCESS_TOKEN_SECRET, [
    env.BILLING_STATE_SECRET,
    env.MERCADOPAGO_ACCESS_TOKEN,
    env.ILOVEPDF_SECRET_KEY,
    env.ASPOSE3D_CLIENT_SECRET
  ]);
  const billingStateSecretConfig = resolveServerSecret(env.BILLING_STATE_SECRET, [
    env.ACCESS_TOKEN_SECRET,
    env.MERCADOPAGO_ACCESS_TOKEN
  ]);

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  });

  await app.register(rateLimit, {
    max: 60,
    timeWindow: "1 minute"
  });

  await app.register(multipart, {
    limits: {
      files: 10,
      parts: 40,
      fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024
    }
  });

  const publicRoot = path.resolve(import.meta.dirname, "../public");
  const indexTemplate = await readFile(path.join(publicRoot, "index.html"), "utf8");

  const conversionService = options.conversionService ?? createConversionService();
  const billingService = options.billingService ?? createBillingService({
    accessToken: env.MERCADOPAGO_ACCESS_TOKEN,
    webhookSecret: env.MERCADOPAGO_WEBHOOK_SECRET,
    publicAppUrl: env.PUBLIC_APP_URL,
    stateSecret: billingStateSecretConfig.value,
    offers: {
      "pro-monthly": {
        amountBRL: env.PRO_MONTHLY_PRICE_BRL,
        accessDays: env.PRO_ACCESS_DAYS
      },
      "pro-yearly": {
        amountBRL: env.PRO_YEARLY_PRICE_BRL,
        accessDays: env.TEAM_ACCESS_DAYS
      },
      "starter-pack": {
        amountBRL: env.STARTER_PACK_PRICE_BRL,
        accessDays: env.STARTER_ACCESS_DAYS
      }
    }
  });
  const accessService = options.accessService ?? createAccessService({
    secret: accessSecretConfig.value,
    freeDailyLimit: env.FREE_DAILY_LIMIT,
    proDailyLimit: env.PRO_DAILY_LIMIT,
    proAccessDays: env.PRO_ACCESS_DAYS,
    teamAccessDays: env.TEAM_ACCESS_DAYS,
    proCodes: env.PRO_ACCESS_CODES.split(/[,\n]/g),
    teamCodes: env.TEAM_ACCESS_CODES.split(/[,\n]/g),
    billing: {
      proMonthlyUrl: env.BILLING_PRO_MONTHLY_URL,
      proYearlyUrl: env.BILLING_PRO_YEARLY_URL,
      starterPackUrl: env.BILLING_STARTER_PACK_URL,
      supportUrl: env.BILLING_SUPPORT_URL,
      whatsappUrl: env.BILLING_WHATSAPP_URL,
      checkoutEnabled: billingService.isCheckoutEnabled(),
      checkoutProvider: billingService.getCheckoutProvider()
    }
  });
  const emailService = createEmailService({
    brevoApiKey: env.BREVO_API_KEY,
    smtpHost: env.SMTP_HOST,
    smtpPort: env.SMTP_PORT,
    smtpSecure: env.SMTP_SECURE,
    smtpUser: env.SMTP_USER,
    smtpPass: env.SMTP_PASS,
    fromEmail: env.EMAIL_FROM_ADDRESS,
    fromName: env.EMAIL_FROM_NAME,
    logger: app.log
  });
  const accountService = options.accountService ?? createAccountService({
    dataDir: env.DATA_DIR,
    sessionDays: env.ACCOUNT_SESSION_DAYS,
    proDailyLimit: env.PRO_DAILY_LIMIT,
    adminOwnerEmails: env.ADMIN_OWNER_EMAILS.split(/[,\n]/g),
    emailService
  });
  const usageTracker = options.usageTracker ?? new UsageTracker();
  const conversionGate = new ConversionGate(env.MAX_CONCURRENT_CONVERSIONS, env.MAX_PENDING_CONVERSIONS);
  const conversionJobService = new ConversionJobService({
    accountService,
    conversionService,
    gate: conversionGate,
    logger: app.log
  });

  await app.register(swagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "vaptdoc API",
        version: "1.0.0",
        description: "API principal do vaptdoc para conversao, conta, billing e administracao."
      },
      tags: [
        { name: "tools", description: "Catalogo e descoberta de ferramentas" },
        { name: "access", description: "Sessao publica, planos e resgate" },
        { name: "account", description: "Conta do usuario, favoritos, arquivos e historico" },
        { name: "billing", description: "Checkout, confirmacao e webhooks" },
        { name: "admin", description: "Painel administrativo" },
        { name: "system", description: "Healthchecks e estado do servico" }
      ]
    }
  });
  conversionJobService.start();

  if (accessSecretConfig.usedFallback) {
    app.log.warn("ACCESS_TOKEN_SECRET ausente ou fraco. O vaptdoc gerou um segredo mais seguro automaticamente.");
  }

  if (billingStateSecretConfig.usedFallback) {
    app.log.warn("BILLING_STATE_SECRET ausente ou fraco. O vaptdoc gerou um segredo mais seguro automaticamente.");
  }

  function resolvePublicBaseUrl(requestHostOrigin?: string) {
    const explicit = String(env.PUBLIC_APP_URL ?? "").trim();
    if (explicit) {
      return explicit;
    }

    if (requestHostOrigin) {
      return requestHostOrigin;
    }

    const fallbackHost =
      env.HOST === "0.0.0.0" || env.HOST === "::" || env.HOST === "::0" ? "localhost" : env.HOST;
    return `http://${fallbackHost}:${env.PORT}`;
  }

  function renderIndexPage(baseUrl: string, toolId?: string) {
    return renderSeoHtml(indexTemplate, getSeoViewModel(baseUrl, toolId));
  }

  function resolveRequestOrigin(request: FastifyRequest) {
    return request.protocol && request.headers.host
      ? `${request.protocol}://${request.headers.host}`
      : resolvePublicBaseUrl();
  }

  const sensitiveLogValues = [
    env.ACCESS_TOKEN_SECRET,
    env.BILLING_STATE_SECRET,
    env.MERCADOPAGO_ACCESS_TOKEN,
    env.MERCADOPAGO_WEBHOOK_SECRET,
    env.ASPOSE3D_CLIENT_SECRET,
    env.ILOVEPDF_SECRET_KEY,
    env.CONVERTAPI_TOKEN,
    env.OCR_SPACE_API_KEY,
    env.BREVO_API_KEY,
    env.SMTP_PASS
  ]
    .map((value) => String(value ?? "").trim())
    .filter((value) => value.length >= 8);

  function redactSensitiveText(value: string) {
    return sensitiveLogValues.reduce((accumulator, secret) => accumulator.split(secret).join("[redacted]"), value);
  }

  function buildSafeErrorLog(error: unknown) {
    if (error instanceof Error) {
      return {
        name: error.name,
        code: (error as { code?: string }).code,
        statusCode: (error as { statusCode?: number }).statusCode,
        message: redactSensitiveText(error.message),
        stack:
          typeof error.stack === "string"
            ? redactSensitiveText(error.stack)
            : undefined
      };
    }

    return {
      message: redactSensitiveText(String(error))
    };
  }

  app.get("/", async (request, reply) => {
    reply
      .header("Cache-Control", "public, max-age=0, must-revalidate")
      .type("text/html; charset=utf-8");
    return reply.send(renderIndexPage(resolveRequestOrigin(request)));
  });

  for (const entry of getToolPathEntries()) {
    app.get(entry.path, async (request, reply) => {
      reply
        .header("Cache-Control", "public, max-age=0, must-revalidate")
        .type("text/html; charset=utf-8");
      return reply.send(renderIndexPage(resolveRequestOrigin(request), entry.toolId));
    });
  }

  app.get("/ferramenta/:toolId", async (request, reply) => {
    const toolId = String((request.params as { toolId?: string }).toolId ?? "");

    if (!(toolId in toolCatalog)) {
      return reply.code(404).type("text/html; charset=utf-8").send(renderIndexPage(resolvePublicBaseUrl()));
    }

    return reply.redirect(getToolPath(toolId as ToolId), 301);
  });

  app.get("/sitemap.xml", async (request, reply) => {
    const origin = request.protocol && request.headers.host ? `${request.protocol}://${request.headers.host}` : resolvePublicBaseUrl();
    reply.header("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400").type("application/xml; charset=utf-8");
    return reply.send(buildSitemapXml(resolvePublicBaseUrl(origin)));
  });

  app.get("/robots.txt", async (request, reply) => {
    const origin = request.protocol && request.headers.host ? `${request.protocol}://${request.headers.host}` : resolvePublicBaseUrl();
    reply.header("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400").type("text/plain; charset=utf-8");
    return reply.send(buildRobotsTxt(resolvePublicBaseUrl(origin)));
  });

  await app.register(fastifyStatic, {
    root: publicRoot,
    prefix: "/",
    setHeaders(res, filePath) {
      const extension = path.extname(filePath).toLowerCase();
      if ([".png", ".jpg", ".jpeg", ".webp", ".svg", ".woff", ".woff2"].includes(extension)) {
        res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
      } else if ([".css", ".js"].includes(extension)) {
        res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
      } else if (extension === ".html") {
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      }
    }
  });

  app.get("/health", async (request, reply) => {
    const integrationHealth =
      typeof (conversionService as { getHealthSnapshot?: () => Promise<unknown> }).getHealthSnapshot === "function"
        ? await (conversionService as { getHealthSnapshot: () => Promise<unknown> }).getHealthSnapshot()
        : null;

    reply.header("Cache-Control", "no-store");
    return {
      status: "ok",
      service: "vaptdoc",
      timestamp: new Date().toISOString(),
      limits: {
        maxFileSizeMB: env.MAX_FILE_SIZE_MB,
        maxConcurrentConversions: env.MAX_CONCURRENT_CONVERSIONS,
        maxPendingConversions: env.MAX_PENDING_CONVERSIONS,
        conversionCacheTtlSeconds: env.CONVERSION_CACHE_TTL_SECONDS
      },
      queue: conversionGate.snapshot(),
      integrations: {
        ilovePdf: integrationHealth && typeof integrationHealth === "object" ? (integrationHealth as { ilovePdf?: unknown }).ilovePdf : {
          configured: false,
          status: "fallback-only"
        },
        aspose3d: integrationHealth && typeof integrationHealth === "object" ? (integrationHealth as { aspose3d?: unknown }).aspose3d : {
          cloudConfigured: false,
          localLibraryAvailable: false,
          localLibraryStatus: "unavailable"
        },
        mercadopago: {
          configured: billingService.isCheckoutEnabled(),
          provider: billingService.getCheckoutProvider() || "manual-link"
        },
        email: {
          configured: emailService.isConfigured(),
          provider: emailService.getProvider()
        }
      }
    };
  });

  app.get("/documentation/json", async (_request, reply) => {
    reply.header("Cache-Control", "no-store").type("application/json; charset=utf-8");
    return app.swagger();
  });

  app.get("/readyz", async (request, reply) => {
    const snapshot = conversionGate.snapshot();

    if (!snapshot.acceptingNewWork) {
      request.log.warn({ queue: snapshot }, "Readiness probe reported saturated conversion queue.");
      return reply.code(503).send({
        status: "busy",
        service: "vaptdoc"
      });
    }

    return {
      status: "ready",
      service: "vaptdoc"
    };
  });

  await registerApiRoutes(app, conversionService, {
    gate: conversionGate,
    accessService,
    billingService,
    accountService,
    usageTracker
  });

  app.addHook("onSend", async (request, reply) => {
    if (!reply.hasHeader("Referrer-Policy")) {
      reply.header("Referrer-Policy", "strict-origin-when-cross-origin");
    }
    if (!reply.hasHeader("Permissions-Policy")) {
      reply.header("Permissions-Policy", "camera=(), microphone=(), geolocation=(), browsing-topics=()");
    }
    if (request.url.startsWith("/api/") && !reply.hasHeader("Cache-Control")) {
      reply.header("Cache-Control", "no-store");
    }
  });

  app.addHook("onClose", async () => {
    conversionJobService.stop();
    accountService.close();
  });

  app.setNotFoundHandler(async (request, reply) => {
    if (request.url.startsWith("/api/")) {
      return reply.code(404).send({ message: "Recurso não encontrado." });
    }

    reply
      .header("Cache-Control", "public, max-age=0, must-revalidate")
      .type("text/html; charset=utf-8");
    return reply.send(renderIndexPage(resolveRequestOrigin(request)));
  });

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(buildSafeErrorLog(error));

    if ((error as { code?: string }).code === "FST_REQ_FILE_TOO_LARGE") {
      return reply.code(413).send({
        message: `Arquivo maior do que o limite de ${env.MAX_FILE_SIZE_MB} MB.`
      });
    }

    if (error instanceof ZodError) {
      return reply.code(400).send({
        message: "Dados inválidos.",
        issues: error.flatten()
      });
    }

    if (isAppError(error)) {
      return reply.code(error.statusCode).send({
        code: error.code,
        message: error.message
      });
    }

    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        code: error.code,
        message: error.message
      });
    }

    if (typeof (error as { statusCode?: unknown }).statusCode === "number") {
      const statusCode = Number((error as { statusCode?: number }).statusCode);
      const message =
        typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : "Requisição inválida.";
      if (statusCode >= 400 && statusCode < 500) {
        return reply.code(statusCode).send({
          message
        });
      }
    }

    return reply.code(500).send({
      message: "Erro interno do servidor."
    });
  });

  return app;
}
