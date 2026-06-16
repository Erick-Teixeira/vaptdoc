import crypto from "node:crypto";
import { createRequire } from "node:module";
import { AppError } from "../utils/errors.js";

const require = createRequire(import.meta.url);
const { DatabaseSync } = require("node:sqlite") as {
  DatabaseSync: typeof import("node:sqlite").DatabaseSync;
};
type DatabaseSyncInstance = import("node:sqlite").DatabaseSync;

export interface SecurityServiceConfig {
  dbPath: string;
  secret: string;
  publicAppUrl?: string;
  allowedOrigins?: string[];
  turnstileSiteKey?: string;
  turnstileSecretKey?: string;
  turnstileAllowedHostnames?: string[];
  turnstileRequired?: boolean;
  loginFailureLimit?: number;
  loginLockMinutes?: number;
  adminElevationMinutes?: number;
  nodeEnv?: string;
}

export interface SecurityRequestContext {
  ip?: string;
  userAgent?: string;
}

export interface PublicSecurityConfig {
  csrfToken: string;
  turnstile: {
    enabled: boolean;
    siteKey: string;
  };
}

interface AttemptRow {
  failure_count: number;
  first_failed_at: string;
  last_failed_at: string;
  locked_until: string | null;
}

interface ElevationRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
}

const csrfCookieName = "vaptdoc-csrf";
const adminElevationCookieName = "vaptdoc-admin-elevation";
const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

function parseCookies(cookieHeader?: string) {
  const values = new Map<string, string>();
  for (const part of String(cookieHeader ?? "").split(";")) {
    const separator = part.indexOf("=");
    if (separator <= 0) {
      continue;
    }
    const name = part.slice(0, separator).trim();
    const rawValue = part.slice(separator + 1).trim();
    try {
      values.set(name, decodeURIComponent(rawValue));
    } catch {
      values.set(name, rawValue);
    }
  }
  return values;
}

function normalizeOrigin(value?: string) {
  const candidate = String(value ?? "").trim();
  if (!candidate) {
    return "";
  }
  try {
    return new URL(candidate).origin;
  } catch {
    return "";
  }
}

function hash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function maskIp(ip?: string) {
  const value = String(ip ?? "").trim();
  if (!value) {
    return "unknown";
  }
  if (value.includes(":")) {
    return `${value.split(":").slice(0, 4).join(":")}::/64`;
  }
  const parts = value.split(".");
  return parts.length === 4 ? `${parts.slice(0, 3).join(".")}.0/24` : "unknown";
}

export class SecurityService {
  private readonly db: DatabaseSyncInstance;
  private readonly secret: string;
  private readonly allowedOrigins: Set<string>;
  private readonly turnstileSiteKey: string;
  private readonly turnstileSecretKey: string;
  private readonly turnstileAllowedHostnames: Set<string>;
  private readonly turnstileRequired: boolean;
  private readonly loginFailureLimit: number;
  private readonly loginLockMinutes: number;
  private readonly adminElevationMinutes: number;
  private readonly production: boolean;

  constructor(config: SecurityServiceConfig) {
    this.db = new DatabaseSync(config.dbPath);
    this.db.exec("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;");
    this.secret = config.secret;
    this.allowedOrigins = new Set(
      [config.publicAppUrl, ...(config.allowedOrigins ?? [])]
        .map(normalizeOrigin)
        .filter(Boolean)
    );
    this.turnstileSiteKey = String(config.turnstileSiteKey ?? "").trim();
    this.turnstileSecretKey = String(config.turnstileSecretKey ?? "").trim();
    this.turnstileAllowedHostnames = new Set(
      (config.turnstileAllowedHostnames ?? []).map((value) => String(value).trim().toLowerCase()).filter(Boolean)
    );
    this.turnstileRequired = Boolean(config.turnstileRequired);
    this.loginFailureLimit = Math.max(3, Math.min(20, config.loginFailureLimit ?? 5));
    this.loginLockMinutes = Math.max(1, Math.min(1440, config.loginLockMinutes ?? 15));
    this.adminElevationMinutes = Math.max(2, Math.min(60, config.adminElevationMinutes ?? 10));
    this.production = config.nodeEnv === "production";
    this.ensureSchema();
  }

  close() {
    this.db.close();
  }

  isTurnstileEnabled() {
    return Boolean(this.turnstileSiteKey && this.turnstileSecretKey);
  }

  assertConfiguration() {
    if (this.turnstileRequired && !this.isTurnstileEnabled()) {
      throw new Error("TURNSTILE_REQUIRED exige TURNSTILE_SITE_KEY e TURNSTILE_SECRET_KEY.");
    }
    if (this.production && this.allowedOrigins.size === 0) {
      throw new Error("PUBLIC_APP_URL ou SECURITY_ALLOWED_ORIGINS deve ser configurado em produção.");
    }
  }

  getPublicConfig(cookieHeader?: string): { config: PublicSecurityConfig; setCookie?: string } {
    const cookies = parseCookies(cookieHeader);
    const existing = cookies.get(csrfCookieName);
    const csrfToken = existing && this.verifySignedToken(existing, "csrf") ? existing : this.issueSignedToken("csrf");
    return {
      config: {
        csrfToken,
        turnstile: {
          enabled: this.isTurnstileEnabled(),
          siteKey: this.isTurnstileEnabled() ? this.turnstileSiteKey : ""
        }
      },
      setCookie: csrfToken === existing ? undefined : this.buildCookie(csrfCookieName, csrfToken, 8 * 60 * 60, false)
    };
  }

  assertMutationRequest(input: {
    method: string;
    url: string;
    headers: Record<string, string | string[] | undefined>;
    protocol?: string;
    host?: string;
  }) {
    if (safeMethods.has(input.method.toUpperCase()) || input.url.startsWith("/api/billing/mercadopago/webhook")) {
      return;
    }

    const originHeader = input.headers.origin;
    const origin = normalizeOrigin(Array.isArray(originHeader) ? originHeader[0] : originHeader);
    const fetchSiteHeader = input.headers["sec-fetch-site"];
    const fetchSite = String(Array.isArray(fetchSiteHeader) ? fetchSiteHeader[0] : fetchSiteHeader ?? "").toLowerCase();
    const requestOrigin = normalizeOrigin(`${input.protocol ?? "https"}://${input.host ?? ""}`);
    const acceptedOrigins = new Set(this.allowedOrigins);
    if (requestOrigin) {
      acceptedOrigins.add(requestOrigin);
    }

    if (origin) {
      if (!acceptedOrigins.has(origin)) {
        throw new AppError("Origem da requisição não autorizada.", 403, "REQUEST_ORIGIN_FORBIDDEN");
      }
    } else if (this.production || (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite))) {
      throw new AppError("Não foi possível confirmar a origem da requisição.", 403, "REQUEST_ORIGIN_REQUIRED");
    }

    const cookieHeader = input.headers.cookie;
    const cookies = parseCookies(Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader);
    const cookieToken = cookies.get(csrfCookieName) ?? "";
    const headerValue = input.headers["x-csrf-token"];
    const headerToken = String(Array.isArray(headerValue) ? headerValue[0] : headerValue ?? "");

    if (!cookieToken || !headerToken || !safeEqual(cookieToken, headerToken) || !this.verifySignedToken(cookieToken, "csrf")) {
      throw new AppError("A sessão de segurança expirou. Recarregue a página e tente novamente.", 403, "CSRF_TOKEN_INVALID");
    }
  }

  assertLoginAllowed(email: string, context: SecurityRequestContext) {
    const key = this.buildAttemptKey(email, context.ip);
    const row = this.db.prepare(`
      SELECT failure_count, first_failed_at, last_failed_at, locked_until
      FROM auth_attempts
      WHERE attempt_key = ?
    `).get(key) as AttemptRow | undefined;

    if (!row?.locked_until) {
      return;
    }
    const lockedUntil = new Date(row.locked_until);
    if (Number.isFinite(lockedUntil.getTime()) && lockedUntil.getTime() > Date.now()) {
      throw new AppError(
        "Muitas tentativas falharam. Aguarde alguns minutos antes de tentar novamente.",
        429,
        "ACCOUNT_LOGIN_LOCKED"
      );
    }
    this.db.prepare("DELETE FROM auth_attempts WHERE attempt_key = ?").run(key);
  }

  recordLoginFailure(email: string, context: SecurityRequestContext) {
    const key = this.buildAttemptKey(email, context.ip);
    const now = new Date();
    const existing = this.db.prepare(`
      SELECT failure_count, first_failed_at, last_failed_at, locked_until
      FROM auth_attempts WHERE attempt_key = ?
    `).get(key) as AttemptRow | undefined;
    const firstFailedAt = existing?.first_failed_at && now.getTime() - new Date(existing.first_failed_at).getTime() < 60 * 60 * 1000
      ? existing.first_failed_at
      : now.toISOString();
    const nextCount = firstFailedAt === existing?.first_failed_at ? Number(existing?.failure_count ?? 0) + 1 : 1;
    const lockedUntil = nextCount >= this.loginFailureLimit
      ? new Date(now.getTime() + this.loginLockMinutes * 60 * 1000).toISOString()
      : null;

    this.db.prepare(`
      INSERT INTO auth_attempts (attempt_key, failure_count, first_failed_at, last_failed_at, locked_until)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(attempt_key) DO UPDATE SET
        failure_count = excluded.failure_count,
        first_failed_at = excluded.first_failed_at,
        last_failed_at = excluded.last_failed_at,
        locked_until = excluded.locked_until
    `).run(key, nextCount, firstFailedAt, now.toISOString(), lockedUntil);

    this.recordEvent("login-failed", "warning", {
      subjectHash: this.hashIdentifier(email),
      network: maskIp(context.ip),
      locked: Boolean(lockedUntil)
    });
  }

  recordLoginSuccess(email: string, context: SecurityRequestContext) {
    this.db.prepare("DELETE FROM auth_attempts WHERE attempt_key = ?").run(this.buildAttemptKey(email, context.ip));
    this.recordEvent("login-succeeded", "info", {
      subjectHash: this.hashIdentifier(email),
      network: maskIp(context.ip)
    });
  }

  async assertHuman(token: string | undefined, context: SecurityRequestContext, action: string) {
    if (!this.isTurnstileEnabled()) {
      if (this.turnstileRequired) {
        throw new AppError("A verificação anti-bot está indisponível.", 503, "BOT_PROTECTION_UNAVAILABLE");
      }
      return;
    }
    if (!token) {
      throw new AppError("Conclua a verificação anti-bot para continuar.", 400, "BOT_VERIFICATION_REQUIRED");
    }

    const body = new URLSearchParams({
      secret: this.turnstileSecretKey,
      response: token
    });
    if (context.ip) {
      body.set("remoteip", context.ip);
    }

    let response: Response;
    try {
      response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: AbortSignal.timeout(5000)
      });
    } catch {
      throw new AppError("A verificação anti-bot não respondeu. Tente novamente.", 503, "BOT_VERIFICATION_UNAVAILABLE");
    }

    const payload = await response.json().catch(() => null) as {
      success?: boolean;
      action?: string;
      hostname?: string;
    } | null;
    const hostname = String(payload?.hostname ?? "").toLowerCase();
    const hostnameAccepted = this.turnstileAllowedHostnames.size === 0 || this.turnstileAllowedHostnames.has(hostname);
    if (!response.ok || !payload?.success || (payload.action && payload.action !== action) || !hostnameAccepted) {
      this.recordEvent("bot-verification-failed", "warning", {
        action,
        network: maskIp(context.ip)
      });
      throw new AppError("A verificação anti-bot não foi validada.", 403, "BOT_VERIFICATION_FAILED");
    }
  }

  issueAdminElevation(userId: string) {
    const token = crypto.randomBytes(32).toString("base64url");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.adminElevationMinutes * 60 * 1000);
    this.db.prepare("DELETE FROM admin_elevations WHERE user_id = ? OR expires_at <= ?")
      .run(userId, now.toISOString());
    this.db.prepare(`
      INSERT INTO admin_elevations (id, user_id, token_hash, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), userId, hash(token), expiresAt.toISOString(), now.toISOString());
    this.recordEvent("admin-elevation-issued", "warning", { userId });
    return {
      setCookie: this.buildCookie(adminElevationCookieName, token, this.adminElevationMinutes * 60, true),
      expiresAt: expiresAt.toISOString()
    };
  }

  assertAdminElevation(cookieHeader: string | undefined, userId: string) {
    const token = parseCookies(cookieHeader).get(adminElevationCookieName) ?? "";
    if (!token) {
      throw new AppError("Confirme sua senha para realizar esta ação administrativa.", 401, "ADMIN_REAUTH_REQUIRED");
    }
    const row = this.db.prepare(`
      SELECT id, user_id, token_hash, expires_at
      FROM admin_elevations
      WHERE token_hash = ? AND user_id = ?
    `).get(hash(token), userId) as ElevationRow | undefined;
    if (!row || new Date(row.expires_at).getTime() <= Date.now()) {
      if (row) {
        this.db.prepare("DELETE FROM admin_elevations WHERE id = ?").run(row.id);
      }
      throw new AppError("Sua confirmação administrativa expirou.", 401, "ADMIN_REAUTH_REQUIRED");
    }
  }

  recordEvent(type: string, severity: "info" | "warning" | "critical", details: Record<string, unknown>) {
    this.db.prepare(`
      INSERT INTO security_events (id, event_type, severity, details_json, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), type, severity, JSON.stringify(details), new Date().toISOString());
  }

  getMetrics() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const events = this.db.prepare(`
      SELECT event_type, severity, COUNT(*) AS total
      FROM security_events
      WHERE created_at >= ?
      GROUP BY event_type, severity
      ORDER BY total DESC
    `).all(since) as Array<{ event_type: string; severity: string; total: number }>;
    const locked = this.db.prepare(`
      SELECT COUNT(*) AS total FROM auth_attempts WHERE locked_until > ?
    `).get(new Date().toISOString()) as { total?: number } | undefined;
    return {
      windowHours: 24,
      lockedLoginBuckets: Number(locked?.total ?? 0),
      events: events.map((entry) => ({
        type: entry.event_type,
        severity: entry.severity,
        total: Number(entry.total)
      }))
    };
  }

  private buildAttemptKey(email: string, ip?: string) {
    return crypto.createHmac("sha256", this.secret)
      .update(`${String(email).trim().toLowerCase()}|${String(ip ?? "")}`)
      .digest("hex");
  }

  private hashIdentifier(value: string) {
    return crypto.createHmac("sha256", this.secret).update(String(value).trim().toLowerCase()).digest("hex").slice(0, 24);
  }

  private issueSignedToken(purpose: string) {
    const nonce = crypto.randomBytes(24).toString("base64url");
    const signature = crypto.createHmac("sha256", this.secret).update(`${purpose}.${nonce}`).digest("base64url");
    return `${nonce}.${signature}`;
  }

  private verifySignedToken(token: string, purpose: string) {
    const separator = token.lastIndexOf(".");
    if (separator <= 0) {
      return false;
    }
    const nonce = token.slice(0, separator);
    const signature = token.slice(separator + 1);
    const expected = crypto.createHmac("sha256", this.secret).update(`${purpose}.${nonce}`).digest("base64url");
    return safeEqual(signature, expected);
  }

  private buildCookie(name: string, value: string, maxAgeSeconds: number, httpOnly: boolean) {
    const secure = this.production ? "; Secure" : "";
    return `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Strict; Max-Age=${Math.max(60, maxAgeSeconds)}${httpOnly ? "; HttpOnly" : ""}${secure}`;
  }

  private ensureSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS auth_attempts (
        attempt_key TEXT PRIMARY KEY,
        failure_count INTEGER NOT NULL,
        first_failed_at TEXT NOT NULL,
        last_failed_at TEXT NOT NULL,
        locked_until TEXT
      );

      CREATE TABLE IF NOT EXISTS admin_elevations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS security_events (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        details_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_auth_attempts_locked_until ON auth_attempts(locked_until);
      CREATE INDEX IF NOT EXISTS idx_admin_elevations_expires_at ON admin_elevations(expires_at);
      CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);
    `);
  }
}

export function createSecurityService(config: SecurityServiceConfig) {
  return new SecurityService(config);
}
