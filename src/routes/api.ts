import crypto from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import sanitizeFilename from "sanitize-filename";
import { z } from "zod";
import { toolCatalog, toolList, type ToolDefinition, type ToolId } from "../catalog.js";
import { env } from "../env.js";
import type { ConversionRequest, ConversionResult, UploadedAsset } from "../types.js";
import type { AccessService, AccessSession } from "../services/access-service.js";
import type { BillingOfferId, BillingService } from "../services/billing-service.js";
import type { AccountService, PublicAccountSession } from "../services/account-service.js";
import type { UsageTracker } from "../services/usage-tracker.js";
import type { ConversionGate } from "../utils/conversion-gate.js";
import { AppError } from "../utils/errors.js";
import { assertUploadLimits } from "../utils/file-validation.js";
import { getToolPath } from "../tool-paths.js";

type ConversionHandler = Pick<{ convert: (payload: ConversionRequest) => Promise<ConversionResult> }, "convert">;

interface RegisterApiOptions {
  gate?: ConversionGate;
  accessService?: AccessService;
  billingService?: BillingService;
  accountService?: AccountService;
  usageTracker?: UsageTracker;
}

const redeemSchema = z.object({
  code: z.string().trim().min(4).max(120)
});

const checkoutOfferSchema = z.object({
  offerId: z.enum(["pro-monthly", "pro-yearly", "starter-pack"])
});

const confirmReturnSchema = z.object({
  paymentId: z.string().trim().min(1).max(120).optional()
});

const registerSchema = z.object({
  email: z.string().trim().email().max(160),
  displayName: z.string().trim().min(2).max(80),
  password: z.string().min(8).max(128)
});

const verificationConfirmSchema = z.object({
  verificationId: z.string().trim().uuid(),
  code: z.string().trim().regex(/^\d{6}$/u)
});

const verificationResendSchema = z.object({
  verificationId: z.string().trim().uuid()
});

const loginSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(128)
});

const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(80)
});

const profileEmailChangeSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  currentPassword: z.string().min(8).max(128)
});

const passwordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(8).max(128)
});

const accountFavoritesSchema = z.object({
  toolIds: z.array(z.string().trim().min(1).max(80)).max(48)
});

const accountHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(24).optional()
});

const accountHistoryParamsSchema = z.object({
  historyId: z.string().trim().uuid()
});

const accountFilesQuerySchema = z.object({
  filter: z.enum(["all", "temporary", "ready", "failed"]).optional(),
  limit: z.coerce.number().int().min(1).max(60).optional()
});

const accountNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(40).optional()
});

const accountNotificationsReadSchema = z.object({
  ids: z.array(z.string().trim().uuid()).min(1).max(50)
});

const adminUserParamsSchema = z.object({
  userId: z.string().trim().min(8).max(80)
});

const adminPromoParamsSchema = z.object({
  code: z.string().trim().min(4).max(80)
});

const adminUsersQuerySchema = z.object({
  q: z.string().trim().max(120).optional()
});

const adminUserProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160)
});

const adminUserPlanSchema = z.object({
  plan: z.enum(["free", "pro", "team"]),
  accessDays: z.coerce.number().int().min(1).max(3650).optional()
});

const adminUserCreditsSchema = z.object({
  mode: z.enum(["set", "add"]),
  amount: z.coerce.number().min(-100000).max(100000)
});

const adminUserDiscountSchema = z.object({
  percent: z.coerce.number().min(0).max(100),
  days: z.coerce.number().int().min(0).max(3650).optional()
});

const adminPromoCreateSchema = z.object({
  code: z.string().trim().min(4).max(80).optional().or(z.literal("")),
  label: z.string().trim().min(2).max(80),
  description: z.string().trim().max(160).optional(),
  creditAmount: z.coerce.number().min(0).max(100000).optional(),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  discountDays: z.coerce.number().int().min(0).max(3650).optional(),
  accessDays: z.coerce.number().int().min(0).max(3650).optional(),
  accessPlan: z.enum(["pro", "team"]).optional(),
  maxRedemptions: z.union([z.coerce.number().int().min(1).max(100000), z.null()]).optional(),
  perUserLimit: z.coerce.number().int().min(1).max(1000).optional(),
  expiresAt: z.string().trim().optional().or(z.literal(""))
});

const adminPromoUpdateSchema = z.object({
  active: z.boolean()
});

const internalClientHeaderName = "x-vaptdoc-client";
const internalClientHeaderValue = "web";
const maxAvatarBytes = 1.5 * 1024 * 1024;
const asyncToolIds = new Set<ToolId>(["pdf-ocr", "3d-convert", "mp4-to-mp3"]);
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const jpegSignature = Buffer.from([0xff, 0xd8, 0xff]);
const webpRiffSignature = Buffer.from("RIFF", "ascii");
const webpMarkerSignature = Buffer.from("WEBP", "ascii");
const sensitiveOptionFields = new Set(["pdfPassword", "protectPassword", "currentPassword", "newPassword"]);

function buildDownloadFileName(filename: string) {
  const normalized = sanitizeFilename(filename)
    .replace(/[\u0000-\u001f\u007f]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || "arquivo";
}

function buildContentDisposition(filename: string) {
  const safeFilename = buildDownloadFileName(filename);
  const asciiFallback =
    safeFilename
      .normalize("NFKD")
      .replace(/[^\x20-\x7e]+/g, "")
      .replace(/["\\]/g, "")
      .trim() || "arquivo";
  const encodedFilename = encodeURIComponent(safeFilename).replace(/['()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );

  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodedFilename}`;
}

function buildAnonymousAccountSession(): PublicAccountSession {
  return {
    authenticated: false,
    user: null,
    plan: null,
    wallet: null,
    isAdmin: false,
    favoriteToolIds: [],
    recentConversions: []
  };
}

function detectAvatarContentType(buffer: Buffer) {
  if (buffer.byteLength >= pngSignature.byteLength && buffer.subarray(0, pngSignature.byteLength).equals(pngSignature)) {
    return "image/png" as const;
  }

  if (buffer.byteLength >= jpegSignature.byteLength && buffer.subarray(0, jpegSignature.byteLength).equals(jpegSignature)) {
    return "image/jpeg" as const;
  }

  if (
    buffer.byteLength >= 12 &&
    buffer.subarray(0, 4).equals(webpRiffSignature) &&
    buffer.subarray(8, 12).equals(webpMarkerSignature)
  ) {
    return "image/webp" as const;
  }

  return null;
}

function buildRequestMetadata(request: FastifyRequest) {
  return {
    ip: request.ip,
    userAgent: String(request.headers["user-agent"] ?? "")
  };
}

function buildUsageBucket(request: FastifyRequest, accountUserId?: string) {
  if (accountUserId) {
    return `account:${accountUserId}`;
  }

  const ip = request.ip || "unknown";
  const agent = String(request.headers["user-agent"] ?? "");

  return crypto
    .createHash("sha256")
    .update(`${ip}|${agent}`)
    .digest("hex")
    .slice(0, 24);
}

function assertInternalClientRequest(request: FastifyRequest) {
  const rawHeader = request.headers[internalClientHeaderName];
  const clientMarker = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

  if (clientMarker === internalClientHeaderValue) {
    return;
  }

  throw new AppError("Requisição rejeitada por segurança. Recarregue a página e tente novamente.", 403, "REQUEST_ORIGIN_FORBIDDEN");
}

function buildPublicOrigin(request: FastifyRequest) {
  const protoHeader = request.headers["x-forwarded-proto"];
  const protocol = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader;
  const hostHeader = request.headers.host;
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;

  if (!host) {
    return "";
  }

  const safeProtocol = String(protocol ?? "http").split(",")[0]?.trim() || "http";

  try {
    const url = new URL(`${safeProtocol}://${host}`);
    return url.origin;
  } catch {
    return "";
  }
}

function resolveManualBillingUrl(accessService: AccessService | undefined, offerId: BillingOfferId) {
  const billing = accessService?.getBillingConfig();
  if (!billing) {
    return "";
  }

  if (offerId === "pro-monthly") {
    return billing.proMonthlyUrl;
  }

  if (offerId === "pro-yearly") {
    return billing.proYearlyUrl;
  }

  return billing.starterPackUrl;
}

function getBaseFreeSession(accessService?: AccessService): AccessSession {
  return accessService?.getSession(undefined) ?? {
    plan: "free",
    premium: false,
    source: "guest",
    dailyLimit: 0
  };
}

function getEffectiveSessions(
  request: FastifyRequest,
  options: RegisterApiOptions,
  explicitAccessSession?: AccessSession | null,
  explicitAccountSession?: PublicAccountSession
) {
  const accountSession = explicitAccountSession ?? options.accountService?.getPublicSession(request.headers.cookie) ?? buildAnonymousAccountSession();
  const accountAccessSession = options.accountService?.getAccessSession(request.headers.cookie) ?? null;
  const cookieAccessSession = options.accessService?.getSession(request.headers.cookie) ?? getBaseFreeSession(options.accessService);
  const accessSession = explicitAccessSession ?? accountAccessSession ?? cookieAccessSession;

  return {
    accessSession,
    accountSession
  };
}

function buildPublicClientState(
  request: FastifyRequest,
  options: RegisterApiOptions,
  explicitAccessSession?: AccessSession | null,
  explicitAccountSession?: PublicAccountSession
) {
  const { accessSession, accountSession } = getEffectiveSessions(request, options, explicitAccessSession, explicitAccountSession);
  const usageBucket = buildUsageBucket(request, accountSession.user?.id);
  const usage = options.usageTracker?.peek(usageBucket, accessSession.dailyLimit) ?? {
    used: 0,
    remaining: accessSession.dailyLimit,
    reachedLimit: false,
    day: new Date().toISOString().slice(0, 10),
    limit: accessSession.dailyLimit
  };
  const rawBillingOffers =
    options.billingService && typeof options.billingService.getPublicOffers === "function"
      ? options.billingService.getPublicOffers()
      : [];
  const billingOffers = options.accountService?.getAdjustedBillingOffers(request.headers.cookie, rawBillingOffers) ?? rawBillingOffers;
  const accessPayload = options.accessService
    ? options.accessService.toPublicSession(accessSession, usage)
    : {
        ...accessSession,
        usedToday: usage.used,
        remainingToday: usage.remaining,
        upgradeConfigured: billingOffers.length > 0,
        billing: {
          proMonthlyUrl: "",
          proYearlyUrl: "",
          starterPackUrl: "",
          supportUrl: "",
          whatsappUrl: "",
          checkoutEnabled: Boolean(options.billingService?.isCheckoutEnabled()),
          checkoutProvider: options.billingService?.getCheckoutProvider() ?? ""
        }
      };

  return {
    ...accessPayload,
    account: accountSession,
    billingOffers,
    queue: options.gate?.snapshot() ?? null
  };
}

function appendSetCookie(current: string | string[] | undefined, nextValues: Array<string | undefined>) {
  const values = Array.isArray(current) ? [...current] : current ? [current] : [];

  for (const value of nextValues) {
    if (value) {
      values.push(value);
    }
  }

  return values;
}

function sanitizeSubmittedOptions(toolDefinition: ToolDefinition, rawOptions: Record<string, string>) {
  const allowedOptions = new Set(toolDefinition.optionFields?.map((field) => field.name) ?? []);
  if (toolDefinition.textLayoutSupport?.enabled) {
    allowedOptions.add("textLayout");
  }

  return Object.fromEntries(Object.entries(rawOptions).filter(([key]) => allowedOptions.has(key)));
}

function sanitizeOptionsForLogs(rawOptions: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(rawOptions).map(([key, value]) => [key, sensitiveOptionFields.has(key) ? "[redacted]" : value])
  );
}

function shouldUseAsyncConversion(toolDefinition: ToolDefinition, accountSession: PublicAccountSession, uploads: UploadedAsset[]) {
  if (!accountSession.authenticated) {
    return false;
  }

  if (asyncToolIds.has(toolDefinition.id as ToolId)) {
    return true;
  }

  return uploads.length >= 4 && Boolean(toolDefinition.allowsMultipleFiles);
}

export async function registerApiRoutes(app: FastifyInstance, conversionService: ConversionHandler, options: RegisterApiOptions = {}) {
  async function parseMultipartConversionRequest(request: FastifyRequest) {
    let toolId = "";
    const uploads: UploadedAsset[] = [];
    const rawOptions: Record<string, string> = {};

    for await (const part of request.parts()) {
      if (part.type === "file") {
        const buffer = await part.toBuffer();
        uploads.push({
          filename: part.filename ?? "arquivo",
          declaredMime: part.mimetype,
          buffer,
          size: buffer.byteLength
        });
        continue;
      }

      if (part.fieldname === "toolId") {
        toolId = String(part.value ?? "");
        continue;
      }

      rawOptions[part.fieldname] = String(part.value ?? "");
    }

    return { toolId, uploads, rawOptions };
  }

  function prepareConversionPayload(
    request: FastifyRequest,
    toolId: string,
    uploads: UploadedAsset[],
    rawOptions: Record<string, string>
  ) {
    if (!toolId || !(toolId in toolCatalog)) {
      throw new AppError("Selecione uma ferramenta valida antes de converter.", 400, "INVALID_TOOL");
    }

    if (uploads.length === 0) {
      throw new AppError("Envie ao menos um arquivo para iniciar a conversao.", 400, "MISSING_FILE");
    }

    assertUploadLimits(uploads, env.MAX_FILE_SIZE_MB * 1024 * 1024);
    const toolDefinition = toolCatalog[toolId as ToolId] as ToolDefinition;
    const effectiveSessions = getEffectiveSessions(request, options);
    const usageBucket = buildUsageBucket(request, effectiveSessions.accountSession.user?.id);
    const accessSession = effectiveSessions.accessSession;
    const usageSnapshot =
      accessSession && options.usageTracker
        ? options.usageTracker.peek(usageBucket, accessSession.dailyLimit)
        : null;

    if (toolDefinition.access === "pro" && !accessSession?.premium) {
      throw new AppError(
        `${toolDefinition.label} faz parte do plano Pro do vaptdoc. Ative um acesso premium para continuar.`,
        402,
        "PREMIUM_REQUIRED"
      );
    }

    if (usageSnapshot?.reachedLimit) {
      throw new AppError(
        `Voce atingiu o limite gratuito de ${usageSnapshot.limit} conversoes por dia. Ative o Pro para continuar agora.`,
        429,
        "FREE_LIMIT_REACHED"
      );
    }

    const safeOptions = sanitizeSubmittedOptions(toolDefinition, rawOptions);
    const payload: ConversionRequest = {
      toolId: toolId as ToolId,
      uploads,
      options: safeOptions
    };

    return {
      toolDefinition,
      accessSession,
      usageBucket,
      usageSnapshot,
      payload,
      accountSession: effectiveSessions.accountSession
    };
  }

  app.get("/api/tools", async () => ({
    tools: toolList.map((tool) => ({
      ...tool,
      routePath: getToolPath(tool.id as ToolId)
    })),
    limits: {
      maxFileSizeMB: env.MAX_FILE_SIZE_MB
    }
  }));

  app.get("/api/access/session", async (request, reply) => {
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");
    return buildPublicClientState(request, options);
  });

  app.get("/api/account/session", async (request, reply) => {
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");
    return buildPublicClientState(request, options);
  });

  app.put("/api/account/favorites", async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("A conta ainda não está disponível neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    const payload = accountFavoritesSchema.parse(request.body ?? {});
    const accountSession = options.accountService.replaceFavoriteToolIds(request.headers.cookie, payload);
    const accessSession = options.accountService.getAccessSession(request.headers.cookie);
    return buildPublicClientState(request, options, accessSession, accountSession);
  });

  app.get("/api/account/history", async (request, reply) => {
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("A conta ainda não está disponível neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    const query = accountHistoryQuerySchema.parse(request.query ?? {});
    return {
      items: options.accountService.listConversionHistory(request.headers.cookie, query.limit ?? 12)
    };
  });

  app.get("/api/account/history/:historyId/download", async (request, reply) => {
    reply.header("Cache-Control", "private, no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("A conta ainda não está disponível neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    const params = accountHistoryParamsSchema.parse(request.params ?? {});
    const asset = await options.accountService.getConversionDownload(request.headers.cookie, params.historyId);
    reply
      .header("Content-Type", asset.contentType)
      .header("Content-Disposition", buildContentDisposition(asset.filename));
    return reply.send(asset.buffer);
  });

  app.get("/api/account/files", async (request, reply) => {
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("A conta ainda nao esta disponivel neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    const query = accountFilesQuerySchema.parse(request.query ?? {});
    return options.accountService.listConversionFiles(request.headers.cookie, query.filter ?? "all", query.limit ?? 30);
  });

  app.delete("/api/account/files/:historyId", async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("A conta ainda nao esta disponivel neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    const params = accountHistoryParamsSchema.parse(request.params ?? {});
    await options.accountService.deleteConversionFile(request.headers.cookie, params.historyId);
    return {
      ok: true
    };
  });

  app.get("/api/account/usage", async (request, reply) => {
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("A conta ainda nao esta disponivel neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    return {
      items: options.accountService.listUsageBreakdown(request.headers.cookie, 12)
    };
  });

  app.get("/api/account/notifications", async (request, reply) => {
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("A conta ainda nao esta disponivel neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    const query = accountNotificationsQuerySchema.parse(request.query ?? {});
    return {
      items: options.accountService.listNotifications(request.headers.cookie, query.limit ?? 20)
    };
  });

  app.post("/api/account/notifications/read", async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("A conta ainda nao esta disponivel neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    const payload = accountNotificationsReadSchema.parse(request.body ?? {});
    return {
      items: options.accountService.markNotificationsRead(request.headers.cookie, payload.ids)
    };
  });

  app.get("/api/account/avatar", async (request, reply) => {
    if (!options.accountService) {
      throw new AppError("A conta ainda não está disponível neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    const avatar = options.accountService.getAvatar(request.headers.cookie);
    if (!avatar) {
      throw new AppError("Nenhuma foto de perfil foi encontrada para esta conta.", 404, "ACCOUNT_AVATAR_NOT_FOUND");
    }

    reply.header("Cache-Control", "private, max-age=300");
    reply.header("Vary", "Cookie");
    reply.type(avatar.contentType);
    return reply.send(avatar.buffer);
  });

  app.post("/api/account/register", {
    config: {
      rateLimit: {
        max: 8,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("O cadastro de conta ainda não está disponível neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    const payload = registerSchema.parse(request.body ?? {});
    return options.accountService.register(payload);
  });

  app.post("/api/account/register/confirm", {
    config: {
      rateLimit: {
        max: 12,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("O cadastro de conta ainda não está disponível neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    const payload = verificationConfirmSchema.parse(request.body ?? {});
    const authResult = options.accountService.confirmRegister(payload, buildRequestMetadata(request));
    const state = buildPublicClientState(request, options, authResult.accessSession, authResult.account);
    const cookies = appendSetCookie(undefined, [
      authResult.setCookie,
      authResult.accessSession && options.accessService ? options.accessService.buildSetCookie(authResult.accessSession) : undefined
    ]);

    reply.header("Set-Cookie", cookies);
    return state;
  });

  app.post("/api/account/verification/resend", {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("A verificação por e-mail ainda não está disponível neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    const payload = verificationResendSchema.parse(request.body ?? {});
    return options.accountService.resendVerification(payload, request.headers.cookie);
  });

  app.post("/api/account/login", {
    config: {
      rateLimit: {
        max: 12,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("O login de conta ainda não está disponível neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    const payload = loginSchema.parse(request.body ?? {});
    const authResult = options.accountService.login(payload, buildRequestMetadata(request));
    const state = buildPublicClientState(request, options, authResult.accessSession, authResult.account);
    const cookies = appendSetCookie(undefined, [
      authResult.setCookie,
      authResult.accessSession && options.accessService ? options.accessService.buildSetCookie(authResult.accessSession) : undefined
    ]);

    reply.header("Set-Cookie", cookies);
    return state;
  });

  app.patch("/api/account/profile", {
    config: {
      rateLimit: {
        max: 12,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("A conta ainda não está disponível neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    const payload = profileSchema.parse(request.body ?? {});
    const accountSession = options.accountService.updateProfile(request.headers.cookie, payload);
    const accessSession = options.accountService.getAccessSession(request.headers.cookie);
    return buildPublicClientState(request, options, accessSession, accountSession);
  });

  app.post("/api/account/profile/confirm", {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("A conta ainda não está disponível neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    const payload = verificationConfirmSchema.parse(request.body ?? {});
    const accountSession = options.accountService.confirmEmailChange(request.headers.cookie, payload);
    const accessSession = options.accountService.getAccessSession(request.headers.cookie);
    return buildPublicClientState(request, options, accessSession, accountSession);
  });

  app.post("/api/account/profile/email", {
    config: {
      rateLimit: {
        max: 8,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("A conta ainda não está disponível neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    const payload = profileEmailChangeSchema.parse(request.body ?? {});
    return options.accountService.requestEmailChange(request.headers.cookie, payload);
  });

  app.post("/api/account/avatar", {
    config: {
      rateLimit: {
        max: 8,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("A conta ainda não está disponível neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    let uploadBuffer: Buffer | null = null;

    for await (const part of request.parts()) {
      if (part.type !== "file") {
        continue;
      }

      uploadBuffer = await part.toBuffer();
      break;
    }

    if (!uploadBuffer || uploadBuffer.byteLength === 0) {
      throw new AppError("Envie uma imagem valida para atualizar a foto de perfil.", 400, "ACCOUNT_AVATAR_MISSING");
    }

    if (uploadBuffer.byteLength > maxAvatarBytes) {
      throw new AppError("A foto de perfil precisa ter no máximo 1,5 MB.", 413, "ACCOUNT_AVATAR_TOO_LARGE");
    }

    const contentType = detectAvatarContentType(uploadBuffer);
    if (!contentType) {
      throw new AppError("Use uma imagem PNG, JPG ou WEBP para a foto de perfil.", 415, "ACCOUNT_AVATAR_UNSUPPORTED");
    }

    const accountSession = options.accountService.updateAvatar(request.headers.cookie, {
      buffer: uploadBuffer,
      contentType
    });
    const accessSession = options.accountService.getAccessSession(request.headers.cookie);
    return buildPublicClientState(request, options, accessSession, accountSession);
  });

  app.delete("/api/account/avatar", async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("A conta ainda não está disponível neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    const accountSession = options.accountService.clearAvatar(request.headers.cookie);
    const accessSession = options.accountService.getAccessSession(request.headers.cookie);
    return buildPublicClientState(request, options, accessSession, accountSession);
  });

  app.post("/api/account/password", {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("A conta ainda não está disponível neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    const payload = passwordSchema.parse(request.body ?? {});
    return options.accountService.requestPasswordChange(request.headers.cookie, payload);
  });

  app.post("/api/account/password/confirm", {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("A conta ainda não está disponível neste ambiente.", 503, "ACCOUNT_UNAVAILABLE");
    }

    const payload = verificationConfirmSchema.parse(request.body ?? {});
    options.accountService.confirmPasswordChange(request.headers.cookie, payload);
    return buildPublicClientState(request, options);
  });

  app.post("/api/account/logout", async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    const cookies = appendSetCookie(undefined, [
      options.accountService?.buildClearCookie(),
      options.accessService?.buildClearCookie()
    ]);
    if (cookies.length > 0) {
      reply.header("Set-Cookie", cookies);
    }

    return buildPublicClientState(request, options, getBaseFreeSession(options.accessService), buildAnonymousAccountSession());
  });

  app.get("/api/admin/dashboard", async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("O painel administrativo ainda não está disponível neste ambiente.", 503, "ADMIN_UNAVAILABLE");
    }

    return {
      dashboard: options.accountService.getAdminDashboard(request.headers.cookie)
    };
  });

  app.get("/api/admin/users", async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("O painel administrativo ainda não está disponível neste ambiente.", 503, "ADMIN_UNAVAILABLE");
    }

    const query = adminUsersQuerySchema.parse(request.query ?? {});
    return {
      users: options.accountService.listAdminUsers(request.headers.cookie, query.q)
    };
  });

  app.get("/api/admin/users/:userId", async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("O painel administrativo ainda não está disponível neste ambiente.", 503, "ADMIN_UNAVAILABLE");
    }

    const params = adminUserParamsSchema.parse(request.params ?? {});
    return {
      user: options.accountService.getAdminUserDetail(request.headers.cookie, params.userId)
    };
  });

  app.patch("/api/admin/users/:userId/profile", {
    config: {
      rateLimit: {
        max: 30,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("O painel administrativo ainda não está disponível neste ambiente.", 503, "ADMIN_UNAVAILABLE");
    }

    const params = adminUserParamsSchema.parse(request.params ?? {});
    const payload = adminUserProfileSchema.parse(request.body ?? {});
    return {
      user: options.accountService.updateAdminUserProfile(request.headers.cookie, params.userId, payload)
    };
  });

  app.post("/api/admin/users/:userId/plan", {
    config: {
      rateLimit: {
        max: 30,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("O painel administrativo ainda não está disponível neste ambiente.", 503, "ADMIN_UNAVAILABLE");
    }

    const params = adminUserParamsSchema.parse(request.params ?? {});
    const payload = adminUserPlanSchema.parse(request.body ?? {});
    return {
      user: options.accountService.updateAdminUserPlan(request.headers.cookie, params.userId, payload)
    };
  });

  app.post("/api/admin/users/:userId/credits", {
    config: {
      rateLimit: {
        max: 30,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("O painel administrativo ainda não está disponível neste ambiente.", 503, "ADMIN_UNAVAILABLE");
    }

    const params = adminUserParamsSchema.parse(request.params ?? {});
    const payload = adminUserCreditsSchema.parse(request.body ?? {});
    return {
      user: options.accountService.updateAdminUserCredits(request.headers.cookie, params.userId, payload)
    };
  });

  app.post("/api/admin/users/:userId/discount", {
    config: {
      rateLimit: {
        max: 30,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("O painel administrativo ainda não está disponível neste ambiente.", 503, "ADMIN_UNAVAILABLE");
    }

    const params = adminUserParamsSchema.parse(request.params ?? {});
    const payload = adminUserDiscountSchema.parse(request.body ?? {});
    return {
      user: options.accountService.updateAdminUserDiscount(request.headers.cookie, params.userId, payload)
    };
  });

  app.delete("/api/admin/users/:userId", async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("O painel administrativo ainda não está disponível neste ambiente.", 503, "ADMIN_UNAVAILABLE");
    }

    const params = adminUserParamsSchema.parse(request.params ?? {});
    options.accountService.deleteAdminUser(request.headers.cookie, params.userId);
    return {
      ok: true
    };
  });

  app.get("/api/admin/promos", async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("O painel administrativo ainda não está disponível neste ambiente.", 503, "ADMIN_UNAVAILABLE");
    }

    return {
      promos: options.accountService.listAdminPromoCodes(request.headers.cookie)
    };
  });

  app.post("/api/admin/promos", {
    config: {
      rateLimit: {
        max: 20,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("O painel administrativo ainda não está disponível neste ambiente.", 503, "ADMIN_UNAVAILABLE");
    }

    const payload = adminPromoCreateSchema.parse(request.body ?? {});
    return {
      promo: options.accountService.createAdminPromoCode(request.headers.cookie, {
        code: payload.code || undefined,
        label: payload.label,
        description: payload.description,
        creditAmount: payload.creditAmount,
        discountPercent: payload.discountPercent,
        discountDays: payload.discountDays,
        accessDays: payload.accessDays,
        accessPlan: payload.accessPlan,
        maxRedemptions: payload.maxRedemptions,
        perUserLimit: payload.perUserLimit,
        expiresAt: payload.expiresAt || null
      })
    };
  });

  app.patch("/api/admin/promos/:code", {
    config: {
      rateLimit: {
        max: 20,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("O painel administrativo ainda não está disponível neste ambiente.", 503, "ADMIN_UNAVAILABLE");
    }

    const params = adminPromoParamsSchema.parse(request.params ?? {});
    const payload = adminPromoUpdateSchema.parse(request.body ?? {});
    return {
      promo: options.accountService.updateAdminPromoCode(request.headers.cookie, params.code, payload)
    };
  });

  app.delete("/api/admin/promos/:code", async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accountService) {
      throw new AppError("O painel administrativo ainda não está disponível neste ambiente.", 503, "ADMIN_UNAVAILABLE");
    }

    const params = adminPromoParamsSchema.parse(request.params ?? {});
    options.accountService.deleteAdminPromoCode(request.headers.cookie, params.code);
    return {
      ok: true
    };
  });

  app.post("/api/billing/checkout", {
    config: {
      rateLimit: {
        max: 12,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    const payload = checkoutOfferSchema.parse(request.body ?? {});
    const manualUrl = resolveManualBillingUrl(options.accessService, payload.offerId);

    if (!options.billingService?.isCheckoutEnabled()) {
      if (!manualUrl) {
        throw new AppError("O checkout ainda não está configurado neste ambiente.", 503, "CHECKOUT_UNAVAILABLE");
      }

      return {
        checkoutUrl: manualUrl,
        provider: "manual-link",
        offerId: payload.offerId
      };
    }

    const selectedOffer = typeof options.billingService.getOffer === "function"
      ? options.billingService.getOffer(payload.offerId)
      : null;
    const overrideAmountBRL = selectedOffer
      ? options.accountService?.getEffectiveBillingPrice(request.headers.cookie, payload.offerId, selectedOffer.amountBRL)
      : undefined;

    const checkout = await options.billingService.createCheckout({
      offerId: payload.offerId,
      originHint: buildPublicOrigin(request),
      overrideAmountBRL
    });

    reply.header("Set-Cookie", options.billingService.buildStateCookie(checkout.stateToken));
    return {
      checkoutUrl: checkout.checkoutUrl,
      preferenceId: checkout.preferenceId,
      provider: checkout.provider,
      offerId: checkout.offer.id
    };
  });

  app.post("/api/billing/confirm-return", {
    config: {
      rateLimit: {
        max: 24,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.billingService || !options.accessService || !options.usageTracker) {
      throw new AppError("A confirmação de pagamento ainda não está disponível neste ambiente.", 503, "CHECKOUT_UNAVAILABLE");
    }

    const payload = confirmReturnSchema.parse(request.body ?? {});
    const stateToken = options.billingService.getStateToken(request.headers.cookie);
    if (!stateToken) {
      throw new AppError("Sua sessao de pagamento expirou. Abra o checkout novamente.", 400, "CHECKOUT_STATE_MISSING");
    }

    const confirmation = await options.billingService.confirmCheckout({
      stateToken,
      paymentId: payload.paymentId
    });

    if (confirmation.status === "approved") {
      const responseCookies: string[] = [options.billingService.buildClearStateCookie()];
      const authenticatedAccount = options.accountService?.getAuthenticatedAccount(request.headers.cookie);

      if (authenticatedAccount && options.accountService) {
        const accountSession = options.accountService.applyCheckoutPurchase(request.headers.cookie, confirmation);
        const accountAccessSession = options.accountService.getAccessSession(request.headers.cookie);

        if (accountAccessSession) {
          responseCookies.push(options.accessService.buildSetCookie(accountAccessSession));
        }

        reply.header("Set-Cookie", responseCookies);
        return {
          status: "approved",
          session: buildPublicClientState(request, options, accountAccessSession, accountSession),
          payment: {
            id: confirmation.paymentId,
            offerId: confirmation.offer.id,
            amountBRL: confirmation.amountBRL
          }
        };
      }

      const activatedAt = confirmation.approvedAt ? new Date(confirmation.approvedAt) : new Date();
      const safeActivatedAt = Number.isNaN(activatedAt.getTime()) ? new Date() : activatedAt;
      const expiresAt = new Date(safeActivatedAt.getTime() + confirmation.offer.accessDays * 24 * 60 * 60 * 1000);
      const accessSession = options.accessService.grantSession({
        plan: confirmation.offer.plan,
        source: "payment",
        activatedAt: safeActivatedAt,
        expiresAt
      });
      responseCookies.push(options.accessService.buildSetCookie(accessSession));
      reply.header("Set-Cookie", responseCookies);

      return {
        status: "approved",
        session: buildPublicClientState(request, options, accessSession),
        payment: {
          id: confirmation.paymentId,
          offerId: confirmation.offer.id,
          amountBRL: confirmation.amountBRL
        }
      };
    }

    if (confirmation.status === "pending") {
      return reply.code(202).send({
        status: "pending",
        payment: {
          id: confirmation.paymentId,
          offerId: confirmation.offer.id,
          amountBRL: confirmation.amountBRL
        },
        message: "Seu pagamento ainda esta sendo analisado ou aguardando confirmacao."
      });
    }

    reply.header("Set-Cookie", options.billingService.buildClearStateCookie());
    return reply.code(409).send({
      status: confirmation.status,
      payment: {
        id: confirmation.paymentId,
        offerId: confirmation.offer.id,
        amountBRL: confirmation.amountBRL
      },
      message: "O pagamento não foi aprovado. Tente novamente ou escolha outra forma de pagamento."
    });
  });

  app.post("/api/billing/mercadopago/webhook", async (request, reply) => {
    if (!options.billingService) {
      return reply.code(202).send({ ok: false });
    }

    const verification = await options.billingService.verifyWebhook({
      headers: request.headers,
      query: (request.query ?? {}) as Record<string, unknown>,
      body: request.body
    });

    if (!verification.ok) {
      return reply.code(401).send({ ok: false });
    }

    return reply.code(200).send({
      ok: true,
      topic: verification.topic ?? "",
      paymentId: verification.paymentId ?? "",
      paymentStatus: verification.paymentStatus ?? ""
    });
  });

  app.post("/api/access/redeem", async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accessService || !options.usageTracker) {
      throw new AppError("A ativação de planos ainda não está disponível neste ambiente.", 503, "ACCESS_UNAVAILABLE");
    }

    const payload = redeemSchema.parse(request.body ?? {});
    const promoRedemption = options.accountService?.redeemPromoCode(request.headers.cookie, payload.code) ?? null;
    if (promoRedemption) {
      if (promoRedemption.accessSession) {
        reply.header("Set-Cookie", options.accessService.buildSetCookie(promoRedemption.accessSession));
      }

      return buildPublicClientState(request, options, promoRedemption.accessSession, promoRedemption.account);
    }

    const redeemedSession = options.accessService.redeemCode(payload.code);
    if (!redeemedSession) {
      throw new AppError("Código inválido ou expirado. Confira e tente novamente.", 400, "INVALID_ACCESS_CODE");
    }

    let accountSession: PublicAccountSession | undefined;
    let accessSession: AccessSession | null = redeemedSession;

    if (options.accountService?.getAuthenticatedAccount(request.headers.cookie)) {
      accountSession = options.accountService.applyGrantedSession(request.headers.cookie, redeemedSession);
      accessSession = options.accountService.getAccessSession(request.headers.cookie) ?? redeemedSession;
    }

    reply.header("Set-Cookie", options.accessService.buildSetCookie(accessSession));
    return buildPublicClientState(request, options, accessSession, accountSession);
  });

  app.post("/api/access/logout", async (request, reply) => {
    assertInternalClientRequest(request);
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");

    if (!options.accessService) {
      return {
        ok: true
      };
    }

    reply.header("Set-Cookie", options.accessService.buildClearCookie());
    return buildPublicClientState(
      request,
      options,
      options.accountService?.getAccessSession(request.headers.cookie) ?? getBaseFreeSession(options.accessService),
      options.accountService?.getPublicSession(request.headers.cookie) ?? buildAnonymousAccountSession()
    );
  });

  app.post("/api/convert/async", {
    config: {
      rateLimit: {
        max: 12,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);

    if (!options.accountService) {
      throw new AppError("Entre na sua conta para usar a fila de processamento.", 503, "ACCOUNT_UNAVAILABLE");
    }

    const startedAt = performance.now();
    const { toolId, uploads, rawOptions } = await parseMultipartConversionRequest(request);
    let historyId: string | null = null;

    try {
      const prepared = prepareConversionPayload(request, toolId, uploads, rawOptions);
      if (!shouldUseAsyncConversion(prepared.toolDefinition, prepared.accountSession, uploads)) {
        throw new AppError("Essa conversao nao precisa da fila assincrona.", 409, "ASYNC_CONVERSION_NOT_REQUIRED");
      }

      historyId = await options.accountService.queueAsyncConversion(request.headers.cookie, {
        toolId: prepared.toolDefinition.id,
        toolLabel: prepared.toolDefinition.label,
        sourceLabel: uploads.length === 1 ? uploads[0].filename : `${uploads.length} arquivos`,
        inputCount: uploads.length,
        uploads,
        options: Object.fromEntries(
          Object.entries((prepared.payload.options ?? {}) as Record<string, unknown>).map(([key, value]) => [key, String(value ?? "")])
        )
      });

      request.log.info({
        event: "conversion.queued",
        toolId,
        historyId,
        uploadCount: uploads.length,
        uploadBytes: uploads.reduce((total, upload) => total + upload.size, 0),
        options: sanitizeOptionsForLogs(rawOptions)
      }, "Async conversion queued.");

      reply.code(202).header("Cache-Control", "no-store").header("Pragma", "no-cache");
      return {
        ok: true,
        historyId,
        queue: options.gate?.snapshot() ?? null,
        message: "Arquivo enviado. Voce pode sair da pagina e voltar depois para baixar o resultado.",
        account: options.accountService.getPublicSession(request.headers.cookie)
      };
    } catch (error) {
      request.log.warn({
        event: "conversion.queue_failed",
        toolId: toolId || "unknown",
        uploadCount: uploads.length,
        uploadBytes: uploads.reduce((total, upload) => total + upload.size, 0),
        options: sanitizeOptionsForLogs(rawOptions),
        errorMessage: error instanceof Error ? error.message : String(error),
        durationMs: Math.round(performance.now() - startedAt)
      }, "Async conversion could not be queued.");

      if (historyId && options.accountService) {
        await options.accountService.failConversionHistory(
          historyId,
          error instanceof Error ? error.message : String(error)
        ).catch(() => undefined);
      }

      throw error;
    }
  });

  app.post("/api/convert", {
    config: {
      rateLimit: {
        max: 18,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    assertInternalClientRequest(request);

    const startedAt = performance.now();
    let historyId: string | null = null;
    const { toolId, uploads, rawOptions } = await parseMultipartConversionRequest(request);
    try {
      if (!toolId || !(toolId in toolCatalog)) {
        throw new AppError("Selecione uma ferramenta valida antes de converter.", 400, "INVALID_TOOL");
      }

      if (uploads.length === 0) {
        throw new AppError("Envie ao menos um arquivo para iniciar a conversão.", 400, "MISSING_FILE");
      }

      assertUploadLimits(uploads, env.MAX_FILE_SIZE_MB * 1024 * 1024);

      const toolDefinition = toolCatalog[toolId as ToolId] as ToolDefinition;
      const effectiveSessions = getEffectiveSessions(request, options);
      const usageBucket = buildUsageBucket(request, effectiveSessions.accountSession.user?.id);
      const accessSession = effectiveSessions.accessSession;
      const usageSnapshot =
        accessSession && options.usageTracker
          ? options.usageTracker.peek(usageBucket, accessSession.dailyLimit)
          : null;

      if (toolDefinition.access === "pro" && !accessSession?.premium) {
        throw new AppError(
          `${toolDefinition.label} faz parte do plano Pro do vaptdoc. Ative um acesso premium para continuar.`,
          402,
          "PREMIUM_REQUIRED"
        );
      }

      if (usageSnapshot?.reachedLimit) {
        throw new AppError(
          `Você atingiu o limite gratuito de ${usageSnapshot.limit} conversões por dia. Ative o Pro para continuar agora.`,
          429,
          "FREE_LIMIT_REACHED"
        );
      }

      const safeOptions = sanitizeSubmittedOptions(toolDefinition, rawOptions);
      const payload: ConversionRequest = {
        toolId: toolId as ToolId,
        uploads,
        options: safeOptions
      };
      historyId = options.accountService?.createConversionHistory(request.headers.cookie, {
        toolId: toolDefinition.id,
        toolLabel: toolDefinition.label,
        sourceLabel: uploads.length === 1 ? uploads[0].filename : `${uploads.length} arquivos`,
        inputCount: uploads.length,
        mode: "sync",
        optionsJson: JSON.stringify(
          Object.fromEntries(
            Object.entries((safeOptions ?? {}) as Record<string, unknown>).map(([key, value]) => [key, String(value ?? "")])
          )
        ),
        inputFiles: uploads.map((upload) => ({
          storedFileName: "",
          originalFilename: upload.filename,
          declaredMime: upload.declaredMime ?? null,
          size: upload.size
        }))
      }) ?? null;

      request.log.info({
        event: "conversion.accepted",
        toolId,
        uploadCount: uploads.length,
        uploadBytes: uploads.reduce((total, upload) => total + upload.size, 0),
        options: sanitizeOptionsForLogs(rawOptions)
      }, "Conversion request accepted.");

      const executeConversion = async () => {
        if (historyId && options.accountService) {
          options.accountService.markConversionProcessing(historyId);
        }
        return conversionService.convert(payload);
      };

      const result = options.gate
        ? await options.gate.run(executeConversion)
        : await executeConversion();

      if (historyId && options.accountService) {
        await options.accountService.completeConversionHistory(historyId, {
          outputFilename: result.filename,
          outputContentType: result.contentType,
          outputSizeBytes: result.data.byteLength,
          provider: result.provider,
          data: result.data
        });
      }

      const nextUsageSnapshot =
        accessSession && options.usageTracker
          ? options.usageTracker.consume(usageBucket, accessSession.dailyLimit)
          : usageSnapshot;

      request.log.info({
        event: "conversion.completed",
        toolId,
        provider: result.provider,
        durationMs: Math.round(performance.now() - startedAt),
        queue: options.gate?.snapshot()
      }, "Conversion completed successfully.");

      reply
        .header("Content-Type", result.contentType)
        .header("Cache-Control", "no-store")
        .header("Pragma", "no-cache")
        .header("Content-Disposition", buildContentDisposition(result.filename))
        .header("X-Conversion-Provider", result.provider)
        .header("X-Access-Plan", accessSession?.plan ?? "free")
        .header("X-Access-Remaining", nextUsageSnapshot?.remaining === null ? "unlimited" : String(nextUsageSnapshot?.remaining ?? 0))
        .send(result.data);
    } catch (error) {
      const statusCode =
        typeof (error as { statusCode?: unknown }).statusCode === "number"
          ? Number((error as { statusCode?: number }).statusCode)
          : 500;
      const code = error instanceof AppError ? error.code : (error as { code?: string }).code ?? "UNEXPECTED_CONVERSION_ERROR";
      const logMethod = statusCode >= 500 ? request.log.error.bind(request.log) : request.log.warn.bind(request.log);

      logMethod({
        event: "conversion.failed",
        toolId: toolId || "unknown",
        uploadCount: uploads.length,
        uploadBytes: uploads.reduce((total, upload) => total + upload.size, 0),
        options: sanitizeOptionsForLogs(rawOptions),
        errorCode: code,
        errorMessage: error instanceof Error ? error.message : String(error),
        statusCode,
        durationMs: Math.round(performance.now() - startedAt),
        queue: options.gate?.snapshot()
      }, "Conversion failed.");

      if (historyId && options.accountService) {
        try {
          await options.accountService.failConversionHistory(
            historyId,
            error instanceof Error ? error.message : String(error)
          );
        } catch {
          // Ignore history persistence failures and keep the original error surface.
        }
      }

      throw error;
    }
  });
}
