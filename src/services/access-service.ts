import crypto from "node:crypto";

export type AccessPlan = "free" | "pro" | "team";
export type AccessSource = "guest" | "code" | "payment";

export interface BillingConfig {
  proMonthlyUrl: string;
  proYearlyUrl: string;
  starterPackUrl: string;
  supportUrl: string;
  whatsappUrl: string;
  checkoutEnabled: boolean;
  checkoutProvider: string;
}

export interface AccessSession {
  plan: AccessPlan;
  premium: boolean;
  source: AccessSource;
  activatedAt?: string;
  expiresAt?: string;
  dailyLimit: number | null;
}

export interface PublicAccessSession extends AccessSession {
  usedToday: number;
  remainingToday: number | null;
  upgradeConfigured: boolean;
  billing: BillingConfig;
}

export interface UsageSnapshotLike {
  used: number;
  remaining: number | null;
}

export interface AccessServiceConfig {
  cookieName?: string;
  secret?: string;
  freeDailyLimit?: number;
  proDailyLimit?: number;
  proAccessDays?: number;
  teamAccessDays?: number;
  proCodes?: string[];
  teamCodes?: string[];
  billing?: Partial<BillingConfig>;
}

interface SignedAccessPayload {
  plan: Exclude<AccessPlan, "free">;
  source: Exclude<AccessSource, "guest">;
  activatedAt: string;
  expiresAt: string;
}

const defaultBillingConfig: BillingConfig = {
  proMonthlyUrl: "",
  proYearlyUrl: "",
  starterPackUrl: "",
  supportUrl: "",
  whatsappUrl: "",
  checkoutEnabled: false,
  checkoutProvider: ""
};

const freeSession: AccessSession = {
  plan: "free",
  premium: false,
  source: "guest",
  dailyLimit: 8
};

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function parseCookieHeader(cookieHeader?: string) {
  const values = new Map<string, string>();

  for (const segment of String(cookieHeader ?? "").split(";")) {
    const part = segment.trim();
    if (!part) {
      continue;
    }

    const separatorIndex = part.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();

    try {
      values.set(key, decodeURIComponent(value));
    } catch {
      values.set(key, value);
    }
  }

  return values;
}

function buildSignature(unsignedToken: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(unsignedToken).digest("base64url");
}

function normalizeCodes(codes: string[]) {
  return codes
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);
}

function codesContain(codes: string[], value: string) {
  const candidate = value.trim().toUpperCase();
  const candidateBuffer = Buffer.from(candidate, "utf8");

  return codes.some((entry) => {
    const entryBuffer = Buffer.from(entry, "utf8");
    if (entryBuffer.length !== candidateBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(entryBuffer, candidateBuffer);
  });
}

export class AccessService {
  private readonly cookieName: string;
  private readonly secret: string;
  private readonly freeDailyLimit: number;
  private readonly proDailyLimit: number;
  private readonly proAccessDays: number;
  private readonly teamAccessDays: number;
  private readonly proCodes: string[];
  private readonly teamCodes: string[];
  private readonly billing: BillingConfig;

  constructor(config: AccessServiceConfig = {}) {
    this.cookieName = config.cookieName ?? "vaptdoc-access";
    this.secret = config.secret?.trim() || crypto.randomBytes(32).toString("base64url");
    this.freeDailyLimit = Math.max(1, config.freeDailyLimit ?? 8);
    this.proDailyLimit = Math.max(this.freeDailyLimit, config.proDailyLimit ?? 80);
    this.proAccessDays = Math.max(1, config.proAccessDays ?? 30);
    this.teamAccessDays = Math.max(1, config.teamAccessDays ?? 365);
    this.proCodes = normalizeCodes(config.proCodes ?? []);
    this.teamCodes = normalizeCodes(config.teamCodes ?? []);
    this.billing = {
      ...defaultBillingConfig,
      ...config.billing
    };
  }

  getBillingConfig() {
    return this.billing;
  }

  getSession(cookieHeader?: string): AccessSession {
    const token = parseCookieHeader(cookieHeader).get(this.cookieName);
    if (!token) {
      return {
        ...freeSession,
        dailyLimit: this.freeDailyLimit
      };
    }

    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) {
      return {
        ...freeSession,
        dailyLimit: this.freeDailyLimit
      };
    }

    const unsignedToken = encodedPayload;
    const expectedSignature = buildSignature(unsignedToken, this.secret);
    const providedBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
      return {
        ...freeSession,
        dailyLimit: this.freeDailyLimit
      };
    }

    try {
      const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SignedAccessPayload;
      if (!payload.plan || !payload.expiresAt || !payload.activatedAt) {
        return {
          ...freeSession,
          dailyLimit: this.freeDailyLimit
        };
      }

      const expiresAt = new Date(payload.expiresAt);
      if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
        return {
          ...freeSession,
          dailyLimit: this.freeDailyLimit
        };
      }

      if (payload.plan === "pro") {
        return {
          plan: "pro",
          premium: true,
          source: payload.source,
          activatedAt: payload.activatedAt,
          expiresAt: payload.expiresAt,
          dailyLimit: this.proDailyLimit
        };
      }

      return {
        plan: "team",
        premium: true,
        source: payload.source,
        activatedAt: payload.activatedAt,
        expiresAt: payload.expiresAt,
        dailyLimit: null
      };
    } catch {
      return {
        ...freeSession,
        dailyLimit: this.freeDailyLimit
      };
    }
  }

  getPublicSession(cookieHeader: string | undefined, usage: UsageSnapshotLike): PublicAccessSession {
    const session = this.getSession(cookieHeader);
    return this.toPublicSession(session, usage);
  }

  toPublicSession(session: AccessSession, usage: UsageSnapshotLike): PublicAccessSession {
    const upgradeConfigured = Object.values(this.billing).some(Boolean);

    return {
      ...session,
      usedToday: usage.used,
      remainingToday: usage.remaining,
      upgradeConfigured,
      billing: this.billing
    };
  }

  redeemCode(rawCode: string) {
    const code = rawCode.trim();
    if (code.length < 4) {
      return null;
    }

    const activatedAt = new Date();

    if (codesContain(this.teamCodes, code)) {
      const expiresAt = new Date(activatedAt.getTime() + this.teamAccessDays * 24 * 60 * 60 * 1000);
      return this.buildPremiumSession("team", "code", activatedAt, expiresAt);
    }

    if (codesContain(this.proCodes, code)) {
      const expiresAt = new Date(activatedAt.getTime() + this.proAccessDays * 24 * 60 * 60 * 1000);
      return this.buildPremiumSession("pro", "code", activatedAt, expiresAt);
    }

    return null;
  }

  grantSession(input: {
    plan?: Exclude<AccessPlan, "free">;
    source: Exclude<AccessSource, "guest">;
    activatedAt: Date;
    expiresAt: Date;
  }) {
    return this.buildPremiumSession(input.plan ?? "pro", input.source, input.activatedAt, input.expiresAt);
  }

  buildSetCookie(session: AccessSession) {
    if (session.plan === "free" || !session.expiresAt || !session.activatedAt) {
      return this.buildClearCookie();
    }

    const payload: SignedAccessPayload = {
      plan: session.plan,
      source: session.source === "guest" ? "code" : session.source,
      activatedAt: session.activatedAt,
      expiresAt: session.expiresAt
    };

    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signature = buildSignature(encodedPayload, this.secret);
    const maxAgeSeconds = Math.max(60, Math.round((new Date(session.expiresAt).getTime() - Date.now()) / 1000));
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

    return `${this.cookieName}=${encodeURIComponent(`${encodedPayload}.${signature}`)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
  }

  buildClearCookie() {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return `${this.cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
  }

  private buildPremiumSession(
    plan: "pro" | "team",
    source: Exclude<AccessSource, "guest">,
    activatedAt: Date,
    expiresAt: Date
  ): AccessSession {
    return {
      plan,
      premium: true,
      source,
      activatedAt: activatedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      dailyLimit: plan === "pro" ? this.proDailyLimit : null
    };
  }
}

export function createAccessService(config: AccessServiceConfig = {}) {
  return new AccessService(config);
}
