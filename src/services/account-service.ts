import crypto from "node:crypto";
import { mkdirSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { AppError } from "../utils/errors.js";
import type { PublicBillingOffer, BillingConfirmation } from "./billing-service.js";
import type { AccessPlan, AccessSession, AccessSource } from "./access-service.js";
import type { EmailService, EmailVerificationPurpose } from "./email-service.js";

const require = createRequire(import.meta.url);
const { DatabaseSync } = require("node:sqlite") as {
  DatabaseSync: typeof import("node:sqlite").DatabaseSync;
};
type DatabaseSyncInstance = import("node:sqlite").DatabaseSync;

type PersistedPlan = Exclude<AccessPlan, "free">;

interface AccountUserRow {
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
  password_salt: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  avatar_content_type: string | null;
  avatar_updated_at: string | null;
  credit_balance: number | null;
  discount_percent: number | null;
  discount_expires_at: string | null;
}

interface AccountVerificationRow {
  id: string;
  purpose: EmailVerificationPurpose;
  user_id: string | null;
  target_email: string;
  payload_json: string;
  code_hash: string;
  attempts: number;
  max_attempts: number;
  sent_count: number;
  cooldown_until: string;
  expires_at: string;
  consumed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AccountSessionRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
  last_seen_at: string;
  user_agent_hash: string;
  ip_hash: string;
}

interface AccountPlanRow {
  user_id: string;
  plan: PersistedPlan;
  source: Extract<AccessSource, "code" | "payment">;
  status: "active" | "expired";
  access_starts_at: string;
  access_expires_at: string;
  provider: string;
  provider_payment_id: string;
  updated_at: string;
}

interface BillingPaymentRow {
  payment_id: string;
  user_id: string;
  offer_id: string;
  provider: string;
  amount_brl: number;
  status: string;
  raw_status: string;
  approved_at: string;
  external_reference: string;
  created_at: string;
}

interface PromoCodeRow {
  code: string;
  label: string;
  description: string;
  credit_amount: number;
  discount_percent: number;
  discount_days: number;
  access_days: number;
  access_plan: PersistedPlan | null;
  max_redemptions: number | null;
  per_user_limit: number;
  redeemed_count: number;
  expires_at: string | null;
  active: number;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

interface PromoRedemptionRow {
  id: string;
  code: string;
  user_id: string;
  redeemed_at: string;
  credit_amount: number;
  discount_percent: number;
  discount_days: number;
  access_days: number;
  access_plan: PersistedPlan | null;
}

interface AccountFavoriteRow {
  user_id: string;
  tool_id: string;
  created_at: string;
}

type ConversionHistoryStatus = "queued" | "processing" | "ready" | "failed";
type ConversionHistoryMode = "sync" | "async";

interface StoredConversionInputFile {
  storedFileName: string;
  originalFilename: string;
  declaredMime: string | null;
  size: number;
}

interface AccountConversionHistoryRow {
  id: string;
  user_id: string;
  tool_id: string;
  tool_label: string;
  source_label: string;
  input_count: number;
  mode: ConversionHistoryMode;
  options_json: string | null;
  input_files_json: string | null;
  output_filename: string | null;
  output_content_type: string | null;
  output_size_bytes: number | null;
  provider: string | null;
  status: ConversionHistoryStatus;
  error_message: string | null;
  stored_file_name: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface AccountNotificationRow {
  id: string;
  user_id: string;
  history_id: string | null;
  type: "job-ready" | "job-failed";
  title: string;
  message: string;
  action_url: string | null;
  read_at: string | null;
  created_at: string;
}

export interface AccountUserPublic {
  id: string;
  email: string;
  displayName: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  hasAvatar: boolean;
  avatarUpdatedAt: string | null;
}

export interface AccountWalletPublic {
  creditBalance: number;
  discountPercent: number;
  discountExpiresAt: string | null;
}

export interface AccountConversionHistoryPublic {
  id: string;
  toolId: string;
  toolLabel: string;
  sourceLabel: string;
  inputCount: number;
  mode: ConversionHistoryMode;
  inputFiles: Array<{
    name: string;
    contentType: string | null;
    size: number;
  }>;
  outputFilename: string | null;
  outputContentType: string | null;
  outputSizeBytes: number;
  provider: string | null;
  status: ConversionHistoryStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  downloadUrl: string | null;
}

export interface AccountFileListPublic {
  counts: {
    total: number;
    temporary: number;
    ready: number;
    failed: number;
  };
  items: AccountConversionHistoryPublic[];
}

export interface AccountUsageBreakdownPublic {
  toolId: string;
  toolLabel: string;
  totalConversions: number;
  completedConversions: number;
  failedConversions: number;
  pendingConversions: number;
  estimatedCreditsUsed: number;
  lastUsedAt: string;
}

export interface AccountNotificationPublic {
  id: string;
  historyId: string | null;
  type: "job-ready" | "job-failed";
  title: string;
  message: string;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface AccountPlanPublic {
  plan: PersistedPlan;
  premium: true;
  source: Extract<AccessSource, "code" | "payment">;
  status: "active" | "expired";
  accessStartsAt: string;
  accessExpiresAt: string;
  provider: string;
  paymentId: string;
}

export interface PublicAccountSession {
  authenticated: boolean;
  user: AccountUserPublic | null;
  plan: AccountPlanPublic | null;
  wallet: AccountWalletPublic | null;
  isAdmin: boolean;
  favoriteToolIds: string[];
  recentConversions: AccountConversionHistoryPublic[];
}

interface AuthenticatedAccountState {
  user: AccountUserPublic;
  plan: AccountPlanPublic | null;
  wallet: AccountWalletPublic;
  isAdmin: boolean;
}

export interface AccountServiceConfig {
  dataDir?: string;
  dbPath?: string;
  sessionCookieName?: string;
  sessionDays?: number;
  proDailyLimit?: number;
  adminOwnerEmails?: string[];
  emailService?: EmailService;
  verificationCodeMinutes?: number;
  verificationCooldownSeconds?: number;
  verificationMaxAttempts?: number;
}

export interface AccountFavoriteUpdateInput {
  toolIds: string[];
}

export interface AccountConversionHistoryCreateInput {
  toolId: string;
  toolLabel: string;
  sourceLabel: string;
  inputCount: number;
  mode?: ConversionHistoryMode;
  optionsJson?: string | null;
  inputFiles?: StoredConversionInputFile[] | null;
}

export interface AccountConversionHistoryCompleteInput {
  outputFilename: string;
  outputContentType: string;
  outputSizeBytes: number;
  provider: string;
  data: Buffer;
}

export interface AccountConversionDownloadAsset {
  filename: string;
  contentType: string;
  buffer: Buffer;
}

export interface AccountQueuedConversionJob {
  id: string;
  userId: string;
  toolId: string;
  toolLabel: string;
  sourceLabel: string;
  inputCount: number;
  options: Record<string, string>;
  uploads: Array<{
    filename: string;
    declaredMime?: string;
    size: number;
    buffer: Buffer;
  }>;
}

export interface AccountRegisterInput {
  email: string;
  displayName: string;
  password: string;
}

export interface AccountLoginInput {
  email: string;
  password: string;
}

export interface AccountProfileUpdateInput {
  displayName: string;
  email?: string;
  currentPassword?: string;
}

export interface AccountPasswordUpdateInput {
  currentPassword: string;
  newPassword: string;
}

export interface AccountVerificationRequestInput {
  verificationId: string;
}

export interface AccountVerificationConfirmInput extends AccountVerificationRequestInput {
  code: string;
}

export interface AccountAvatarInput {
  buffer: Buffer;
  contentType: "image/png" | "image/jpeg" | "image/webp";
}

export interface AccountAvatarAsset {
  contentType: "image/png" | "image/jpeg" | "image/webp";
  buffer: Buffer;
  updatedAt: string;
}

export interface AccountRequestMetadata {
  ip?: string;
  userAgent?: string;
}

export interface AccountAuthResult {
  account: PublicAccountSession;
  setCookie: string;
  accessSession: AccessSession | null;
}

export interface AccountVerificationChallenge {
  id: string;
  purpose: EmailVerificationPurpose;
  destination: string;
  expiresAt: string;
  resendAvailableAt: string;
}

export interface AccountVerificationStartResult {
  verification: AccountVerificationChallenge;
}

export interface AdminDashboardSnapshot {
  totalUsers: number;
  activePremiumUsers: number;
  activePromos: number;
  totalCredits: number;
  approvedPayments: number;
  approvedRevenueBRL: number;
  queuedJobs: number;
  processingJobs: number;
  topToolUsage: AccountUsageBreakdownPublic[];
}

export interface AdminUserSummary {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  hasAvatar: boolean;
  isAdmin: boolean;
  plan: AccountPlanPublic | null;
  wallet: AccountWalletPublic;
}

export interface AdminUserPaymentRecord {
  paymentId: string;
  offerId: string;
  amountBRL: number;
  status: string;
  approvedAt: string;
}

export interface AdminUserPromoRedemption {
  code: string;
  redeemedAt: string;
  creditAmount: number;
  discountPercent: number;
  discountDays: number;
  accessDays: number;
  accessPlan: PersistedPlan | null;
}

export interface AdminUserDetail extends AdminUserSummary {
  recentPayments: AdminUserPaymentRecord[];
  promoRedemptions: AdminUserPromoRedemption[];
  usageBreakdown: AccountUsageBreakdownPublic[];
  recentConversions: AccountConversionHistoryPublic[];
}

export interface AdminUserProfileUpdateInput {
  email: string;
  displayName: string;
}

export interface AdminUserPlanUpdateInput {
  plan: AccessPlan;
  accessDays?: number;
}

export interface AdminUserCreditsUpdateInput {
  mode: "set" | "add";
  amount: number;
}

export interface AdminUserDiscountUpdateInput {
  percent: number;
  days?: number;
}

export interface AdminPromoCodePublic {
  code: string;
  label: string;
  description: string;
  creditAmount: number;
  discountPercent: number;
  discountDays: number;
  accessDays: number;
  accessPlan: PersistedPlan | null;
  maxRedemptions: number | null;
  perUserLimit: number;
  redeemedCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPromoCodeInput {
  code?: string;
  label: string;
  description?: string;
  creditAmount?: number;
  discountPercent?: number;
  discountDays?: number;
  accessDays?: number;
  accessPlan?: PersistedPlan;
  maxRedemptions?: number | null;
  perUserLimit?: number;
  expiresAt?: string | null;
}

export interface AdminPromoCodeUpdateInput {
  active?: boolean;
}

export interface PromoRedemptionResult {
  account: PublicAccountSession;
  accessSession: AccessSession | null;
  summary: string;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/gu, "-")
    .replace(/-+/gu, "-")
    .replace(/^-|-$/gu, "");
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

function hashText(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function issueNumericVerificationCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function maskEmailAddress(value: string) {
  const email = normalizeEmail(value);
  const [localPart, domainPart] = email.split("@");
  if (!localPart || !domainPart) {
    return email;
  }

  const safeLocal =
    localPart.length <= 2
      ? `${localPart[0] ?? "*"}*`
      : `${localPart.slice(0, 2)}${"*".repeat(Math.max(2, localPart.length - 2))}`;
  const domainSegments = domainPart.split(".");
  const firstDomain = domainSegments.shift() ?? "";
  const safeDomain =
    firstDomain.length <= 2
      ? `${firstDomain[0] ?? "*"}*`
      : `${firstDomain.slice(0, 2)}${"*".repeat(Math.max(2, firstDomain.length - 2))}`;

  return `${safeLocal}@${[safeDomain, ...domainSegments].filter(Boolean).join(".")}`;
}

function hashPassword(password: string, saltHex: string) {
  return crypto.scryptSync(password, Buffer.from(saltHex, "hex"), 64).toString("hex");
}

function issuePasswordRecord(password: string) {
  const passwordSalt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, passwordSalt);
  return {
    passwordSalt,
    passwordHash
  };
}

function secureCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function roundCurrency(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 100) / 100;
}

function clampPositiveCurrency(value: number) {
  return Math.max(0, roundCurrency(value));
}

function normalizeOwnerEmails(values: string[]) {
  return new Set(values.map((value) => normalizeEmail(value)).filter(Boolean));
}

function mapUser(row: AccountUserRow): AccountUserPublic {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    emailVerifiedAt: row.email_verified_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    hasAvatar: Boolean(row.avatar_content_type && row.avatar_updated_at),
    avatarUpdatedAt: row.avatar_updated_at ?? null
  };
}

function mapPlan(row: AccountPlanRow | undefined | null): AccountPlanPublic | null {
  if (!row) {
    return null;
  }

  return {
    plan: row.plan,
    premium: true,
    source: row.source,
    status: row.status,
    accessStartsAt: row.access_starts_at,
    accessExpiresAt: row.access_expires_at,
    provider: row.provider,
    paymentId: row.provider_payment_id
  };
}

function mapPromoCode(row: PromoCodeRow): AdminPromoCodePublic {
  return {
    code: row.code,
    label: row.label,
    description: row.description,
    creditAmount: roundCurrency(row.credit_amount),
    discountPercent: Math.max(0, Number(row.discount_percent ?? 0)),
    discountDays: Math.max(0, Math.round(Number(row.discount_days ?? 0))),
    accessDays: Math.max(0, Math.round(Number(row.access_days ?? 0))),
    accessPlan: row.access_plan,
    maxRedemptions: row.max_redemptions === null ? null : Math.max(0, Math.round(Number(row.max_redemptions ?? 0))),
    perUserLimit: Math.max(1, Math.round(Number(row.per_user_limit ?? 1))),
    redeemedCount: Math.max(0, Math.round(Number(row.redeemed_count ?? 0))),
    expiresAt: row.expires_at ?? null,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function parseStoredInputFiles(rawValue: string | null): StoredConversionInputFile[] {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const record = item as Record<string, unknown>;
        const storedFileName = String(record.storedFileName ?? "").trim();
        const originalFilename = String(record.originalFilename ?? "").trim();
        if (!storedFileName || !originalFilename) {
          return null;
        }

        return {
          storedFileName,
          originalFilename,
          declaredMime: record.declaredMime ? String(record.declaredMime) : null,
          size: Math.max(0, Math.round(Number(record.size ?? 0)))
        } satisfies StoredConversionInputFile;
      })
      .filter((item): item is StoredConversionInputFile => Boolean(item));
  } catch {
    return [];
  }
}

function parseStoredOptions(rawValue: string | null) {
  if (!rawValue) {
    return {} as Record<string, string>;
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).map(([key, value]) => [key, String(value ?? "")])
    );
  } catch {
    return {};
  }
}

function estimateToolCredits(toolId: string, inputCount: number) {
  const baseCostByToolId: Record<string, number> = {
    "pdf-merge": 5,
    "pdf-split": 5,
    "pdf-compress": 10,
    "docx-to-pdf": 10,
    "office-to-pdf": 10,
    "pdf-ocr": 5,
    "pdf-to-docx": 10,
    "3d-convert": 8,
    "mp4-to-mp3": 3
  };

  const baseCost = baseCostByToolId[toolId] ?? 0;
  return clampPositiveCurrency(baseCost * Math.max(1, inputCount));
}

function mapConversionHistory(row: AccountConversionHistoryRow): AccountConversionHistoryPublic {
  const inputFiles = parseStoredInputFiles(row.input_files_json);
  return {
    id: row.id,
    toolId: row.tool_id,
    toolLabel: row.tool_label,
    sourceLabel: row.source_label,
    inputCount: Math.max(1, Math.round(Number(row.input_count ?? 1))),
    mode: row.mode ?? "sync",
    inputFiles: inputFiles.map((item) => ({
      name: item.originalFilename,
      contentType: item.declaredMime,
      size: item.size
    })),
    outputFilename: row.output_filename ?? null,
    outputContentType: row.output_content_type ?? null,
    outputSizeBytes: Math.max(0, Math.round(Number(row.output_size_bytes ?? 0))),
    provider: row.provider ?? null,
    status: row.status,
    errorMessage: row.error_message ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at ?? null,
    downloadUrl: row.status === "ready" && row.stored_file_name ? `/api/account/history/${encodeURIComponent(row.id)}/download` : null
  };
}

function mapNotification(row: AccountNotificationRow): AccountNotificationPublic {
  return {
    id: row.id,
    historyId: row.history_id ?? null,
    type: row.type,
    title: row.title,
    message: row.message,
    actionUrl: row.action_url ?? null,
    readAt: row.read_at ?? null,
    createdAt: row.created_at
  };
}

function resolveDbPath(config: AccountServiceConfig) {
  if (config.dbPath) {
    return config.dbPath === ":memory:" ? ":memory:" : path.resolve(config.dbPath);
  }

  if (process.env.NODE_ENV === "test") {
    return ":memory:";
  }

  const defaultRoot = path.resolve(process.cwd(), "data");
  const dataDir = config.dataDir ? path.resolve(config.dataDir) : defaultRoot;
  return path.join(dataDir, "vaptdoc.sqlite");
}

function resolveDataDir(config: AccountServiceConfig) {
  if (config.dataDir) {
    return path.resolve(config.dataDir);
  }

  if (config.dbPath && config.dbPath !== ":memory:") {
    return path.dirname(path.resolve(config.dbPath));
  }

  return path.resolve(process.cwd(), "data");
}

function buildGeneratedPromoCode() {
  return `VAPT-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

function sanitizeStoredFilename(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w.\-]+/gu, "-")
    .replace(/-+/gu, "-")
    .replace(/^-|-$/gu, "")
    .slice(0, 120) || "arquivo";
}

export class AccountService {
  private readonly db: DatabaseSyncInstance;
  private readonly dbPath: string;
  private readonly dataDir: string;
  private readonly conversionHistoryDir: string;
  private readonly conversionInputDir: string;
  private readonly sessionCookieName: string;
  private readonly sessionDays: number;
  private readonly proDailyLimit: number;
  private readonly adminOwnerEmails: Set<string>;
  private readonly emailService: EmailService | null;
  private readonly verificationCodeMinutes: number;
  private readonly verificationCooldownSeconds: number;
  private readonly verificationMaxAttempts: number;

  constructor(config: AccountServiceConfig = {}) {
    this.dbPath = resolveDbPath(config);
    this.dataDir = resolveDataDir(config);
    this.conversionHistoryDir = path.join(this.dataDir, "conversion-history");
    this.conversionInputDir = path.join(this.dataDir, "conversion-inputs");
    const useInMemoryDatabase = this.dbPath === ":memory:";
    if (!useInMemoryDatabase) {
      mkdirSync(path.dirname(this.dbPath), { recursive: true });
      mkdirSync(this.conversionHistoryDir, { recursive: true });
      mkdirSync(this.conversionInputDir, { recursive: true });
    }
    this.db = new DatabaseSync(this.dbPath);
    this.db.exec("PRAGMA foreign_keys = ON;");
    if (useInMemoryDatabase) {
      this.db.exec("PRAGMA journal_mode = MEMORY;");
    } else {
      try {
        this.db.exec("PRAGMA journal_mode = WAL;");
      } catch {
        this.db.exec("PRAGMA journal_mode = DELETE;");
      }
    }
    this.db.exec("PRAGMA busy_timeout = 3000;");
    this.sessionCookieName = config.sessionCookieName ?? "vaptdoc-user";
    this.sessionDays = Math.max(1, config.sessionDays ?? 30);
    this.proDailyLimit = Math.max(1, config.proDailyLimit ?? 80);
    this.adminOwnerEmails = normalizeOwnerEmails(config.adminOwnerEmails ?? []);
    this.emailService = config.emailService?.isConfigured() ? config.emailService : null;
    this.verificationCodeMinutes = Math.max(3, Math.min(30, Math.round(config.verificationCodeMinutes ?? 10)));
    this.verificationCooldownSeconds = Math.max(30, Math.min(300, Math.round(config.verificationCooldownSeconds ?? 60)));
    this.verificationMaxAttempts = Math.max(3, Math.min(10, Math.round(config.verificationMaxAttempts ?? 5)));
    this.ensureSchema();
    void this.purgeExpiredConversionHistory();
  }

  getDbPath() {
    return this.dbPath;
  }

  close() {
    this.db.close();
  }

  async register(input: AccountRegisterInput): Promise<AccountVerificationStartResult> {
    const email = normalizeEmail(input.email);
    const displayName = input.displayName.trim();
    const existing = this.findUserByEmail(email);
    if (existing) {
      throw new AppError("Ja existe uma conta com esse email. Entre nela ou use outro endereco.", 409, "ACCOUNT_EMAIL_IN_USE");
    }

    const passwordRecord = issuePasswordRecord(input.password);
    return this.createVerificationChallenge({
      purpose: "register",
      targetEmail: email,
      payload: {
        email,
        displayName,
        passwordHash: passwordRecord.passwordHash,
        passwordSalt: passwordRecord.passwordSalt
      }
    });
  }

  confirmRegister(input: AccountVerificationConfirmInput, metadata: AccountRequestMetadata = {}): AccountAuthResult {
    const verification = this.requireVerification(input.verificationId, "register");
    const payload = this.consumeVerificationCode(verification, input.code) as {
      email: string;
      displayName: string;
      passwordHash: string;
      passwordSalt: string;
    };

    const existing = this.findUserByEmail(payload.email);
    if (existing) {
      throw new AppError("Ja existe uma conta com esse email. Entre nela ou use outro endereco.", 409, "ACCOUNT_EMAIL_IN_USE");
    }

    const now = new Date().toISOString();
    const userId = crypto.randomUUID();
    this.db.prepare(`
      INSERT INTO users (
        id,
        email,
        display_name,
        password_hash,
        password_salt,
        email_verified_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      payload.email,
      payload.displayName,
      payload.passwordHash,
      payload.passwordSalt,
      now,
      now,
      now
    );

    return this.issueAccountSession(userId, metadata);
  }

  login(input: AccountLoginInput, metadata: AccountRequestMetadata = {}): AccountAuthResult {
    const email = normalizeEmail(input.email);
    const user = this.findUserByEmail(email);
    if (!user || !secureCompare(hashPassword(input.password, user.password_salt), user.password_hash)) {
      throw new AppError("Email ou senha invalidos.", 401, "ACCOUNT_LOGIN_FAILED");
    }

     if (!user.email_verified_at) {
      throw new AppError("Confirme seu email antes de entrar na conta.", 403, "ACCOUNT_EMAIL_NOT_VERIFIED");
    }

    return this.issueAccountSession(user.id, metadata);
  }

  logout(cookieHeader?: string) {
    const token = this.getSessionToken(cookieHeader);
    if (token) {
      this.db.prepare("DELETE FROM account_sessions WHERE token_hash = ?").run(hashText(token));
    }

    return this.buildClearCookie();
  }

  getPublicSession(cookieHeader?: string): PublicAccountSession {
    const authenticated = this.getAuthenticatedAccount(cookieHeader);
    if (!authenticated) {
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

    return {
      authenticated: true,
      user: authenticated.user,
      plan: authenticated.plan,
      wallet: authenticated.wallet,
      isAdmin: authenticated.isAdmin,
      favoriteToolIds: this.getFavoriteToolIdsForUser(authenticated.user.id),
      recentConversions: this.getRecentConversionsForUser(authenticated.user.id)
    };
  }

  getAuthenticatedAccount(cookieHeader?: string): AuthenticatedAccountState | null {
    this.cleanupExpiredSessions();
    const token = this.getSessionToken(cookieHeader);
    if (!token) {
      return null;
    }

    const session = this.db.prepare(`
      SELECT id, user_id, token_hash, expires_at, created_at, last_seen_at, user_agent_hash, ip_hash
      FROM account_sessions
      WHERE token_hash = ?
    `).get(hashText(token)) as AccountSessionRow | undefined;

    if (!session) {
      return null;
    }

    const expiresAt = new Date(session.expires_at);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      this.db.prepare("DELETE FROM account_sessions WHERE id = ?").run(session.id);
      return null;
    }

    const user = this.findUserById(session.user_id);
    if (!user) {
      this.db.prepare("DELETE FROM account_sessions WHERE id = ?").run(session.id);
      return null;
    }

    this.db.prepare("UPDATE account_sessions SET last_seen_at = ? WHERE id = ?").run(new Date().toISOString(), session.id);
    return {
      user: mapUser(user),
      plan: this.getPlanForUser(user.id),
      wallet: this.buildWalletForRow(user),
      isAdmin: this.isAdminEmail(user.email)
    };
  }

  getAccessSession(cookieHeader?: string): AccessSession | null {
    const authenticated = this.getAuthenticatedAccount(cookieHeader);
    if (!authenticated?.plan || authenticated.plan.status !== "active") {
      return null;
    }

    const expiresAt = new Date(authenticated.plan.accessExpiresAt);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      this.expirePlanIfNeeded(authenticated.user.id, authenticated.plan);
      return null;
    }

    return {
      plan: authenticated.plan.plan,
      premium: true,
      source: authenticated.plan.source,
      activatedAt: authenticated.plan.accessStartsAt,
      expiresAt: authenticated.plan.accessExpiresAt,
      dailyLimit: authenticated.plan.plan === "pro" ? this.proDailyLimit : null
    };
  }

  replaceFavoriteToolIds(cookieHeader: string | undefined, input: AccountFavoriteUpdateInput) {
    const authenticated = this.requireAuthenticated(cookieHeader);
    const now = new Date().toISOString();
    const nextToolIds = Array.from(new Set(input.toolIds.map((value) => String(value).trim()).filter(Boolean))).slice(0, 48);

    this.db.prepare("DELETE FROM account_favorites WHERE user_id = ?").run(authenticated.user.id);
    const statement = this.db.prepare(`
      INSERT INTO account_favorites (user_id, tool_id, created_at)
      VALUES (?, ?, ?)
    `);

    for (const toolId of nextToolIds) {
      statement.run(authenticated.user.id, toolId, now);
    }

    return this.getPublicSessionForUser(authenticated.user.id);
  }

  createConversionHistory(cookieHeader: string | undefined, input: AccountConversionHistoryCreateInput) {
    const authenticated = this.getAuthenticatedAccount(cookieHeader);
    if (!authenticated) {
      return null;
    }

    return this.createConversionHistoryForUser(authenticated.user.id, input);
  }

  createConversionHistoryForUser(userId: string, input: AccountConversionHistoryCreateInput) {
    const now = new Date().toISOString();
    const historyId = crypto.randomUUID();
    this.db.prepare(`
      INSERT INTO account_conversion_history (
        id,
        user_id,
        tool_id,
        tool_label,
        source_label,
        input_count,
        mode,
        options_json,
        input_files_json,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      historyId,
      userId,
      input.toolId,
      input.toolLabel,
      input.sourceLabel,
      Math.max(1, Math.round(input.inputCount)),
      input.mode ?? "sync",
      input.optionsJson ?? null,
      input.inputFiles ? JSON.stringify(input.inputFiles) : null,
      "queued",
      now,
      now
    );

    return historyId;
  }

  markConversionProcessing(historyId: string) {
    this.db.prepare(`
      UPDATE account_conversion_history
      SET status = 'processing', updated_at = ?
      WHERE id = ? AND status = 'queued'
    `).run(new Date().toISOString(), historyId);
  }

  async completeConversionHistory(historyId: string, input: AccountConversionHistoryCompleteInput) {
    const row = this.db.prepare(`
      SELECT id, user_id, tool_id, tool_label, source_label, input_count, mode, options_json, input_files_json,
             output_filename, output_content_type, output_size_bytes, provider, status, error_message, stored_file_name,
             created_at, updated_at, completed_at
      FROM account_conversion_history
      WHERE id = ?
    `).get(historyId) as AccountConversionHistoryRow | undefined;

    if (!row) {
      return;
    }

    await mkdir(this.conversionHistoryDir, { recursive: true });
    const extension = path.extname(input.outputFilename) || "";
    const storedFileName = `${historyId}-${sanitizeStoredFilename(path.basename(input.outputFilename, extension))}${extension}`;
    await writeFile(path.join(this.conversionHistoryDir, storedFileName), input.data);

    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE account_conversion_history
      SET output_filename = ?,
          output_content_type = ?,
          output_size_bytes = ?,
          provider = ?,
          status = 'ready',
          error_message = NULL,
          stored_file_name = ?,
          updated_at = ?,
          completed_at = ?
      WHERE id = ?
    `).run(
      input.outputFilename,
      input.outputContentType,
      Math.max(0, Math.round(input.outputSizeBytes)),
      input.provider,
      storedFileName,
      now,
      now,
      historyId
    );

    await this.deleteStoredInputFiles(row);
    if (row.mode === "async" && this.shouldNotifyAsyncTool(row.tool_id)) {
      this.createNotification(row.user_id, {
        historyId: row.id,
        type: "job-ready",
        title: `${row.tool_label} pronto`,
        message: `Seu arquivo ${input.outputFilename} ja esta disponivel para baixar.`,
        actionUrl: `/api/account/history/${encodeURIComponent(row.id)}/download`
      });
    }

    await this.purgeExpiredConversionHistory();
  }

  async failConversionHistory(historyId: string, errorMessage: string) {
    const row = this.db.prepare(`
      SELECT id, user_id, tool_id, tool_label, source_label, input_count, mode, options_json, input_files_json,
             output_filename, output_content_type, output_size_bytes, provider, status, error_message, stored_file_name,
             created_at, updated_at, completed_at
      FROM account_conversion_history
      WHERE id = ?
    `).get(historyId) as AccountConversionHistoryRow | undefined;

    this.db.prepare(`
      UPDATE account_conversion_history
      SET status = 'failed',
          error_message = ?,
          updated_at = ?,
          completed_at = ?
      WHERE id = ?
    `).run(errorMessage.slice(0, 240), new Date().toISOString(), new Date().toISOString(), historyId);

    if (row) {
      await this.deleteStoredInputFiles(row);
      if (row.mode === "async" && this.shouldNotifyAsyncTool(row.tool_id)) {
        this.createNotification(row.user_id, {
          historyId: row.id,
          type: "job-failed",
          title: `${row.tool_label} nao terminou`,
          message: "A conversao falhou. Revise o arquivo e tente novamente.",
          actionUrl: null
        });
      }
    }
  }

  listConversionHistory(cookieHeader: string | undefined, limit = 12) {
    const authenticated = this.requireAuthenticated(cookieHeader);
    return this.getRecentConversionsForUser(authenticated.user.id, limit);
  }

  async getConversionDownload(cookieHeader: string | undefined, historyId: string): Promise<AccountConversionDownloadAsset> {
    const authenticated = this.requireAuthenticated(cookieHeader);
    const row = this.db.prepare(`
      SELECT id, user_id, tool_id, tool_label, source_label, input_count, mode, options_json, input_files_json,
             output_filename, output_content_type, output_size_bytes, provider, status, error_message, stored_file_name,
             created_at, updated_at, completed_at
      FROM account_conversion_history
      WHERE id = ? AND user_id = ?
    `).get(historyId, authenticated.user.id) as AccountConversionHistoryRow | undefined;

    if (!row || row.status !== "ready" || !row.stored_file_name || !row.output_filename || !row.output_content_type) {
      throw new AppError("Esse arquivo convertido nao esta disponivel para download.", 404, "ACCOUNT_CONVERSION_NOT_FOUND");
    }

    const buffer = await readFile(path.join(this.conversionHistoryDir, row.stored_file_name));
    return {
      filename: row.output_filename,
      contentType: row.output_content_type,
      buffer
    };
  }

  async queueAsyncConversion(
    cookieHeader: string | undefined,
    input: AccountConversionHistoryCreateInput & {
      uploads: Array<{
        filename: string;
        declaredMime?: string;
        size: number;
        buffer: Buffer;
      }>;
      options: Record<string, unknown>;
    }
  ) {
    const authenticated = this.requireAuthenticated(cookieHeader);
    await mkdir(this.conversionInputDir, { recursive: true });

    const historyId = crypto.randomUUID();
    const now = new Date().toISOString();
    const storedInputFiles: StoredConversionInputFile[] = [];

    for (const [index, upload] of input.uploads.entries()) {
      const extension = path.extname(upload.filename) || "";
      const baseName = sanitizeStoredFilename(path.basename(upload.filename, extension)) || `arquivo-${index + 1}`;
      const storedFileName = `${historyId}-${index + 1}-${baseName}${extension}`;
      await writeFile(path.join(this.conversionInputDir, storedFileName), upload.buffer);
      storedInputFiles.push({
        storedFileName,
        originalFilename: upload.filename,
        declaredMime: upload.declaredMime ?? null,
        size: Math.max(0, Math.round(upload.size))
      });
    }

    this.db.prepare(`
      INSERT INTO account_conversion_history (
        id,
        user_id,
        tool_id,
        tool_label,
        source_label,
        input_count,
        mode,
        options_json,
        input_files_json,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'async', ?, ?, 'queued', ?, ?)
    `).run(
      historyId,
      authenticated.user.id,
      input.toolId,
      input.toolLabel,
      input.sourceLabel,
      Math.max(1, Math.round(input.inputCount)),
      JSON.stringify(input.options ?? {}),
      JSON.stringify(storedInputFiles),
      now,
      now
    );

    return historyId;
  }

  reclaimStaleAsyncJobs(maxAgeMinutes = 20) {
    const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000).toISOString();
    this.db.prepare(`
      UPDATE account_conversion_history
      SET status = 'queued', updated_at = ?
      WHERE mode = 'async' AND status = 'processing' AND updated_at <= ?
    `).run(new Date().toISOString(), cutoff);
  }

  async claimNextAsyncConversionJob(): Promise<AccountQueuedConversionJob | null> {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const row = this.db.prepare(`
        SELECT id, user_id, tool_id, tool_label, source_label, input_count, mode, options_json, input_files_json,
               output_filename, output_content_type, output_size_bytes, provider, status, error_message, stored_file_name,
               created_at, updated_at, completed_at
        FROM account_conversion_history
        WHERE mode = 'async' AND status = 'queued'
        ORDER BY created_at ASC
        LIMIT 1
      `).get() as AccountConversionHistoryRow | undefined;

      if (!row) {
        this.db.exec("COMMIT");
        return null;
      }

      this.db.prepare(`
        UPDATE account_conversion_history
        SET status = 'processing', updated_at = ?
        WHERE id = ? AND status = 'queued'
      `).run(new Date().toISOString(), row.id);

      this.db.exec("COMMIT");

      const storedInputs = parseStoredInputFiles(row.input_files_json);
      const uploads = await Promise.all(
        storedInputs.map(async (item) => ({
          filename: item.originalFilename,
          declaredMime: item.declaredMime ?? undefined,
          size: item.size,
          buffer: await readFile(path.join(this.conversionInputDir, item.storedFileName))
        }))
      );

      return {
        id: row.id,
        userId: row.user_id,
        toolId: row.tool_id,
        toolLabel: row.tool_label,
        sourceLabel: row.source_label,
        inputCount: Math.max(1, Math.round(Number(row.input_count ?? 1))),
        options: parseStoredOptions(row.options_json),
        uploads
      };
    } catch (error) {
      try {
        this.db.exec("ROLLBACK");
      } catch {
        // Ignore rollback errors after failed claim attempts.
      }
      throw error;
    }
  }

  listConversionFiles(
    cookieHeader: string | undefined,
    filter: "all" | "temporary" | "ready" | "failed" = "all",
    limit = 30
  ): AccountFileListPublic {
    const authenticated = this.requireAuthenticated(cookieHeader);
    const rows = this.getConversionHistoryRowsForUser(authenticated.user.id, Math.max(1, Math.min(100, Math.round(limit))));
    const allItems = rows.map((row) => mapConversionHistory(row));
    const filteredItems = allItems.filter((item) => {
      if (filter === "temporary") {
        return item.status === "queued" || item.status === "processing";
      }
      if (filter === "ready") {
        return item.status === "ready";
      }
      if (filter === "failed") {
        return item.status === "failed";
      }
      return true;
    });

    return {
      counts: {
        total: allItems.length,
        temporary: allItems.filter((item) => item.status === "queued" || item.status === "processing").length,
        ready: allItems.filter((item) => item.status === "ready").length,
        failed: allItems.filter((item) => item.status === "failed").length
      },
      items: filteredItems
    };
  }

  async deleteConversionFile(cookieHeader: string | undefined, historyId: string) {
    const authenticated = this.requireAuthenticated(cookieHeader);
    const row = this.db.prepare(`
      SELECT id, user_id, tool_id, tool_label, source_label, input_count, mode, options_json, input_files_json,
             output_filename, output_content_type, output_size_bytes, provider, status, error_message, stored_file_name,
             created_at, updated_at, completed_at
      FROM account_conversion_history
      WHERE id = ? AND user_id = ?
    `).get(historyId, authenticated.user.id) as AccountConversionHistoryRow | undefined;

    if (!row) {
      throw new AppError("Esse arquivo nao foi encontrado na sua conta.", 404, "ACCOUNT_FILE_NOT_FOUND");
    }

    await this.deleteStoredInputFiles(row);
    if (row.stored_file_name) {
      await rm(path.join(this.conversionHistoryDir, row.stored_file_name), { force: true }).catch(() => undefined);
    }

    this.db.prepare("DELETE FROM account_notifications WHERE history_id = ? AND user_id = ?").run(row.id, authenticated.user.id);
    this.db.prepare("DELETE FROM account_conversion_history WHERE id = ? AND user_id = ?").run(row.id, authenticated.user.id);
  }

  listUsageBreakdown(cookieHeader: string | undefined, limit = 12) {
    const authenticated = this.requireAuthenticated(cookieHeader);
    return this.getUsageBreakdownForUser(authenticated.user.id, limit);
  }

  listNotifications(cookieHeader: string | undefined, limit = 20) {
    const authenticated = this.requireAuthenticated(cookieHeader);
    const rows = this.db.prepare(`
      SELECT id, user_id, history_id, type, title, message, action_url, read_at, created_at
      FROM account_notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(authenticated.user.id, Math.max(1, Math.min(50, Math.round(limit)))) as unknown as AccountNotificationRow[];

    return rows.map((row) => mapNotification(row));
  }

  markNotificationsRead(cookieHeader: string | undefined, ids: string[]) {
    const authenticated = this.requireAuthenticated(cookieHeader);
    const notificationIds = Array.from(new Set(ids.map((value) => String(value).trim()).filter(Boolean))).slice(0, 50);
    if (notificationIds.length === 0) {
      return this.listNotifications(cookieHeader);
    }

    const statement = this.db.prepare(`
      UPDATE account_notifications
      SET read_at = COALESCE(read_at, ?)
      WHERE id = ? AND user_id = ?
    `);
    const now = new Date().toISOString();
    for (const id of notificationIds) {
      statement.run(now, id, authenticated.user.id);
    }

    return this.listNotifications(cookieHeader);
  }

  getAdjustedBillingOffers(cookieHeader: string | undefined, offers: PublicBillingOffer[]) {
    const account = this.getAuthenticatedAccount(cookieHeader);
    if (!account || account.wallet.discountPercent <= 0) {
      return offers;
    }

    const discountFactor = Math.max(0, Math.min(1, 1 - account.wallet.discountPercent / 100));
    return offers.map((offer) => ({
      ...offer,
      amountBRL: roundCurrency(offer.amountBRL * discountFactor)
    }));
  }

  getEffectiveBillingPrice(cookieHeader: string | undefined, offerId: PublicBillingOffer["id"], baseAmountBRL: number) {
    const account = this.getAuthenticatedAccount(cookieHeader);
    if (!account || account.wallet.discountPercent <= 0) {
      return baseAmountBRL;
    }

    return roundCurrency(baseAmountBRL * Math.max(0, Math.min(1, 1 - account.wallet.discountPercent / 100)));
  }

  updateProfile(cookieHeader: string | undefined, input: AccountProfileUpdateInput): PublicAccountSession {
    const authenticated = this.requireAuthenticated(cookieHeader);
    const nextDisplayName = input.displayName.trim();
    const nextEmail = input.email ? normalizeEmail(input.email) : authenticated.user.email;

    if (nextEmail !== authenticated.user.email) {
      throw new AppError("Use o fluxo de confirmacao por codigo para trocar o email da conta.", 409, "ACCOUNT_EMAIL_CHANGE_REQUIRES_VERIFICATION");
    }

    this.db.prepare(`
      UPDATE users
      SET display_name = ?, updated_at = ?
      WHERE id = ?
    `).run(nextDisplayName, new Date().toISOString(), authenticated.user.id);

    return this.getPublicSession(cookieHeader);
  }

  async requestEmailChange(cookieHeader: string | undefined, input: AccountProfileUpdateInput): Promise<AccountVerificationStartResult> {
    const authenticated = this.requireAuthenticated(cookieHeader);
    const nextDisplayName = input.displayName.trim();
    const nextEmail = normalizeEmail(String(input.email ?? ""));

    if (!nextEmail) {
      throw new AppError("Informe o novo email para continuar.", 400, "ACCOUNT_EMAIL_REQUIRED");
    }

    if (nextEmail === authenticated.user.email) {
      throw new AppError("Digite um email diferente do atual para continuar.", 400, "ACCOUNT_EMAIL_UNCHANGED");
    }

    if (authenticated.isAdmin && !this.isAdminEmail(nextEmail)) {
      throw new AppError("Atualize ADMIN_OWNER_EMAILS antes de trocar o email do dono para nao perder o acesso administrativo.", 409, "ADMIN_EMAIL_LOCK");
    }

    if (!input.currentPassword) {
      throw new AppError("Informe sua senha atual para trocar o email da conta.", 400, "ACCOUNT_PASSWORD_REQUIRED");
    }

    const row = this.requireUserRow(authenticated.user.id);
    if (!secureCompare(hashPassword(input.currentPassword, row.password_salt), row.password_hash)) {
      throw new AppError("Sua senha atual nao confere.", 401, "ACCOUNT_PASSWORD_INVALID");
    }

    const existing = this.findUserByEmail(nextEmail);
    if (existing && existing.id !== authenticated.user.id) {
      throw new AppError("Esse email ja esta em uso por outra conta.", 409, "ACCOUNT_EMAIL_IN_USE");
    }

    return this.createVerificationChallenge({
      purpose: "email-change",
      userId: authenticated.user.id,
      targetEmail: nextEmail,
      payload: {
        displayName: nextDisplayName,
        email: nextEmail
      }
    });
  }

  confirmEmailChange(cookieHeader: string | undefined, input: AccountVerificationConfirmInput) {
    const authenticated = this.requireAuthenticated(cookieHeader);
    const verification = this.requireVerification(input.verificationId, "email-change", authenticated.user.id);
    const payload = this.consumeVerificationCode(verification, input.code) as {
      displayName: string;
      email: string;
    };

    if (authenticated.isAdmin && !this.isAdminEmail(payload.email)) {
      throw new AppError("Atualize ADMIN_OWNER_EMAILS antes de trocar o email do dono para nao perder o acesso administrativo.", 409, "ADMIN_EMAIL_LOCK");
    }

    const existing = this.findUserByEmail(payload.email);
    if (existing && existing.id !== authenticated.user.id) {
      throw new AppError("Esse email ja esta em uso por outra conta.", 409, "ACCOUNT_EMAIL_IN_USE");
    }

    this.db.prepare(`
      UPDATE users
      SET display_name = ?, email = ?, email_verified_at = ?, updated_at = ?
      WHERE id = ?
    `).run(payload.displayName, payload.email, new Date().toISOString(), new Date().toISOString(), authenticated.user.id);

    return this.getPublicSession(cookieHeader);
  }

  async requestPasswordChange(cookieHeader: string | undefined, input: AccountPasswordUpdateInput): Promise<AccountVerificationStartResult> {
    const authenticated = this.requireAuthenticated(cookieHeader);
    const row = this.requireUserRow(authenticated.user.id);

    if (!secureCompare(hashPassword(input.currentPassword, row.password_salt), row.password_hash)) {
      throw new AppError("Sua senha atual nao confere.", 401, "ACCOUNT_PASSWORD_INVALID");
    }

    const passwordRecord = issuePasswordRecord(input.newPassword);
    return this.createVerificationChallenge({
      purpose: "password-change",
      userId: authenticated.user.id,
      targetEmail: authenticated.user.email,
      payload: passwordRecord
    });
  }

  confirmPasswordChange(cookieHeader: string | undefined, input: AccountVerificationConfirmInput) {
    const authenticated = this.requireAuthenticated(cookieHeader);
    const verification = this.requireVerification(input.verificationId, "password-change", authenticated.user.id);
    const payload = this.consumeVerificationCode(verification, input.code) as {
      passwordHash: string;
      passwordSalt: string;
    };

    this.db.prepare(`
      UPDATE users
      SET password_hash = ?, password_salt = ?, updated_at = ?
      WHERE id = ?
    `).run(payload.passwordHash, payload.passwordSalt, new Date().toISOString(), authenticated.user.id);
  }

  async resendVerification(input: AccountVerificationRequestInput, cookieHeader?: string) {
    const verification = this.requireVerification(input.verificationId);
    if (verification.purpose !== "register") {
      const authenticated = this.requireAuthenticated(cookieHeader);
      if (verification.user_id !== authenticated.user.id) {
        throw new AppError("Esse codigo nao pertence a sua conta.", 403, "ACCOUNT_VERIFICATION_FORBIDDEN");
      }
    }

    return this.refreshVerificationChallenge(verification);
  }

  updateAvatar(cookieHeader: string | undefined, input: AccountAvatarInput): PublicAccountSession {
    const authenticated = this.requireAuthenticated(cookieHeader);
    const now = new Date().toISOString();

    this.db.prepare(`
      UPDATE users
      SET avatar_blob = ?, avatar_content_type = ?, avatar_updated_at = ?, updated_at = ?
      WHERE id = ?
    `).run(input.buffer, input.contentType, now, now, authenticated.user.id);

    return this.getPublicSession(cookieHeader);
  }

  clearAvatar(cookieHeader: string | undefined): PublicAccountSession {
    const authenticated = this.requireAuthenticated(cookieHeader);
    const now = new Date().toISOString();

    this.db.prepare(`
      UPDATE users
      SET avatar_blob = NULL, avatar_content_type = NULL, avatar_updated_at = NULL, updated_at = ?
      WHERE id = ?
    `).run(now, authenticated.user.id);

    return this.getPublicSession(cookieHeader);
  }

  getAvatar(cookieHeader: string | undefined): AccountAvatarAsset | null {
    const authenticated = this.requireAuthenticated(cookieHeader);
    const row = this.db.prepare(`
      SELECT avatar_blob, avatar_content_type, avatar_updated_at
      FROM users
      WHERE id = ?
    `).get(authenticated.user.id) as {
      avatar_blob?: Buffer | Uint8Array | null;
      avatar_content_type?: AccountAvatarAsset["contentType"] | null;
      avatar_updated_at?: string | null;
    } | undefined;

    if (!row?.avatar_blob || !row.avatar_content_type || !row.avatar_updated_at) {
      return null;
    }

    return {
      contentType: row.avatar_content_type,
      buffer: Buffer.isBuffer(row.avatar_blob) ? row.avatar_blob : Buffer.from(row.avatar_blob),
      updatedAt: row.avatar_updated_at
    };
  }

  applyCheckoutPurchase(cookieHeader: string | undefined, confirmation: BillingConfirmation) {
    const authenticated = this.requireAuthenticated(cookieHeader);
    return this.applyCheckoutPurchaseForUser(authenticated.user.id, confirmation);
  }

  applyGrantedSession(cookieHeader: string | undefined, session: AccessSession, provider = "vaptdoc-code") {
    const authenticated = this.requireAuthenticated(cookieHeader);
    return this.applyGrantedSessionForUser(authenticated.user.id, session, provider);
  }

  applyCheckoutPurchaseForUser(userId: string, confirmation: BillingConfirmation) {
    if (confirmation.paymentId) {
      const existingPayment = this.db.prepare(`
        SELECT payment_id, user_id, offer_id, provider, amount_brl, status, raw_status, approved_at, external_reference, created_at
        FROM billing_payments
        WHERE payment_id = ?
      `).get(confirmation.paymentId) as BillingPaymentRow | undefined;

      if (existingPayment) {
        return this.getPublicSessionForUser(userId);
      }
    }

    const safeApprovedAt = this.parseDateOrNow(confirmation.approvedAt);
    const { accessStartsAt, accessExpiresAt } = this.buildExtendedPlanWindow(userId, confirmation.offer.accessDays, safeApprovedAt);
    this.upsertPlanRecord(userId, {
      plan: confirmation.offer.plan,
      source: "payment",
      provider: "mercadopago",
      providerPaymentId: confirmation.paymentId,
      accessStartsAt,
      accessExpiresAt
    });

    if (confirmation.paymentId) {
      this.db.prepare(`
        INSERT OR IGNORE INTO billing_payments (
          payment_id,
          user_id,
          offer_id,
          provider,
          amount_brl,
          status,
          raw_status,
          approved_at,
          external_reference,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        confirmation.paymentId,
        userId,
        confirmation.offer.id,
        "mercadopago",
        confirmation.amountBRL,
        confirmation.status,
        confirmation.rawStatus,
        confirmation.approvedAt ?? new Date().toISOString(),
        confirmation.stateToken,
        new Date().toISOString()
      );
    }

    return this.getPublicSessionForUser(userId);
  }

  applyGrantedSessionForUser(userId: string, session: AccessSession, provider = "vaptdoc-code") {
    if (session.plan === "free" || !session.expiresAt || !session.activatedAt) {
      return this.getPublicSessionForUser(userId);
    }

    this.upsertPlanRecord(userId, {
      plan: session.plan,
      source: session.source === "guest" ? "code" : session.source,
      provider,
      providerPaymentId: provider,
      accessStartsAt: session.activatedAt,
      accessExpiresAt: session.expiresAt
    });

    return this.getPublicSessionForUser(userId);
  }

  redeemPromoCode(cookieHeader: string | undefined, rawCode: string): PromoRedemptionResult | null {
    const code = normalizeCode(rawCode);
    if (!code) {
      return null;
    }

    const promoRow = this.db.prepare(`
      SELECT code, label, description, credit_amount, discount_percent, discount_days, access_days, access_plan, max_redemptions, per_user_limit, redeemed_count, expires_at, active, created_by_user_id, created_at, updated_at
      FROM promo_codes
      WHERE code = ?
    `).get(code) as PromoCodeRow | undefined;

    if (!promoRow) {
      return null;
    }

    const authenticated = this.requireAuthenticated(cookieHeader);

    const promo = mapPromoCode(promoRow);
    if (!promo.active) {
      throw new AppError("Esse codigo promocional nao esta ativo no momento.", 409, "PROMO_CODE_INACTIVE");
    }

    if (promo.expiresAt) {
      const expiresAt = new Date(promo.expiresAt);
      if (Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() <= Date.now()) {
        throw new AppError("Esse codigo promocional expirou.", 409, "PROMO_CODE_EXPIRED");
      }
    }

    if (promo.maxRedemptions !== null && promo.redeemedCount >= promo.maxRedemptions) {
      throw new AppError("Esse codigo promocional ja atingiu o limite de usos.", 409, "PROMO_CODE_LIMIT_REACHED");
    }

    const userRedemptionCount = this.db.prepare("SELECT COUNT(*) as total FROM promo_redemptions WHERE code = ? AND user_id = ?")
      .get(code, authenticated.user.id) as { total?: number };

    if (Number(userRedemptionCount.total ?? 0) >= promo.perUserLimit) {
      throw new AppError("Esse codigo ja foi usado nesta conta.", 409, "PROMO_CODE_ALREADY_USED");
    }

    if (promo.creditAmount > 0) {
      const nextBalance = authenticated.wallet.creditBalance + promo.creditAmount;
      this.db.prepare("UPDATE users SET credit_balance = ?, updated_at = ? WHERE id = ?")
        .run(clampPositiveCurrency(nextBalance), new Date().toISOString(), authenticated.user.id);
    }

    if (promo.discountPercent > 0 && promo.discountDays > 0) {
      const currentWallet = this.getWalletForUser(authenticated.user.id);
      const currentExpiry = currentWallet.discountExpiresAt ? new Date(currentWallet.discountExpiresAt) : null;
      const nextExpiry = new Date(Date.now() + promo.discountDays * 24 * 60 * 60 * 1000);
      const resolvedExpiry =
        currentExpiry && Number.isFinite(currentExpiry.getTime()) && currentExpiry.getTime() > nextExpiry.getTime()
          ? currentExpiry.toISOString()
          : nextExpiry.toISOString();
      const resolvedPercent = Math.max(currentWallet.discountPercent, promo.discountPercent);

      this.db.prepare(`
        UPDATE users
        SET discount_percent = ?, discount_expires_at = ?, updated_at = ?
        WHERE id = ?
      `).run(resolvedPercent, resolvedExpiry, new Date().toISOString(), authenticated.user.id);
    }

    if (promo.accessDays > 0 && promo.accessPlan) {
      const { accessStartsAt, accessExpiresAt } = this.buildExtendedPlanWindow(authenticated.user.id, promo.accessDays, new Date());
      this.upsertPlanRecord(authenticated.user.id, {
        plan: promo.accessPlan,
        source: "code",
        provider: `promo:${promo.code}`,
        providerPaymentId: promo.code,
        accessStartsAt,
        accessExpiresAt
      });
    }

    this.db.prepare(`
      INSERT INTO promo_redemptions (
        id,
        code,
        user_id,
        redeemed_at,
        credit_amount,
        discount_percent,
        discount_days,
        access_days,
        access_plan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      promo.code,
      authenticated.user.id,
      new Date().toISOString(),
      promo.creditAmount,
      promo.discountPercent,
      promo.discountDays,
      promo.accessDays,
      promo.accessPlan
    );

    this.db.prepare("UPDATE promo_codes SET redeemed_count = redeemed_count + 1, updated_at = ? WHERE code = ?")
      .run(new Date().toISOString(), promo.code);

    const account = this.getPublicSessionForUser(authenticated.user.id);
    return {
      account,
      accessSession: this.buildAccessSessionFromPublicPlan(account.plan),
      summary: promo.label
    };
  }

  getAdminDashboard(cookieHeader: string | undefined): AdminDashboardSnapshot {
    this.requireAdminAccess(cookieHeader);

    const usersRow = this.db.prepare("SELECT COUNT(*) as total FROM users").get() as { total?: number };
    const premiumRow = this.db.prepare("SELECT COUNT(*) as total FROM account_plans WHERE status = 'active'").get() as { total?: number };
    const promoRow = this.db.prepare("SELECT COUNT(*) as total FROM promo_codes WHERE active = 1").get() as { total?: number };
    const creditRow = this.db.prepare("SELECT COALESCE(SUM(credit_balance), 0) as total FROM users").get() as { total?: number };
    const paymentRow = this.db.prepare(`
      SELECT COUNT(*) as total, COALESCE(SUM(amount_brl), 0) as revenue
      FROM billing_payments
      WHERE status = 'approved'
    `).get() as { total?: number; revenue?: number };
    const queueRow = this.db.prepare(`
      SELECT
        SUM(CASE WHEN mode = 'async' AND status = 'queued' THEN 1 ELSE 0 END) as queued_jobs,
        SUM(CASE WHEN mode = 'async' AND status = 'processing' THEN 1 ELSE 0 END) as processing_jobs
      FROM account_conversion_history
    `).get() as { queued_jobs?: number; processing_jobs?: number };

    return {
      totalUsers: Math.max(0, Math.round(Number(usersRow.total ?? 0))),
      activePremiumUsers: Math.max(0, Math.round(Number(premiumRow.total ?? 0))),
      activePromos: Math.max(0, Math.round(Number(promoRow.total ?? 0))),
      totalCredits: clampPositiveCurrency(Number(creditRow.total ?? 0)),
      approvedPayments: Math.max(0, Math.round(Number(paymentRow.total ?? 0))),
      approvedRevenueBRL: clampPositiveCurrency(Number(paymentRow.revenue ?? 0)),
      queuedJobs: Math.max(0, Math.round(Number(queueRow.queued_jobs ?? 0))),
      processingJobs: Math.max(0, Math.round(Number(queueRow.processing_jobs ?? 0))),
      topToolUsage: this.getGlobalUsageBreakdown(8)
    };
  }

  listAdminUsers(cookieHeader: string | undefined, search = ""): AdminUserSummary[] {
    this.requireAdminAccess(cookieHeader);
    const normalizedSearch = search.trim().toLowerCase();

    const rows = this.db.prepare(`
      SELECT id, email, display_name, password_hash, password_salt, email_verified_at, created_at, updated_at, avatar_content_type, avatar_updated_at, credit_balance, discount_percent, discount_expires_at
      FROM users
      ORDER BY updated_at DESC, created_at DESC
      LIMIT 80
    `).all() as unknown as AccountUserRow[];

    return rows
      .filter((row) => {
        if (!normalizedSearch) {
          return true;
        }

        return row.email.toLowerCase().includes(normalizedSearch) || row.display_name.toLowerCase().includes(normalizedSearch);
      })
      .map((row) => ({
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        hasAvatar: Boolean(row.avatar_content_type && row.avatar_updated_at),
        isAdmin: this.isAdminEmail(row.email),
        plan: this.getPlanForUser(row.id),
        wallet: this.buildWalletForRow(row)
      }));
  }

  getAdminUserDetail(cookieHeader: string | undefined, userId: string): AdminUserDetail {
    this.requireAdminAccess(cookieHeader);
    const row = this.requireUserRow(userId);
    const summary: AdminUserSummary = {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      hasAvatar: Boolean(row.avatar_content_type && row.avatar_updated_at),
      isAdmin: this.isAdminEmail(row.email),
      plan: this.getPlanForUser(row.id),
      wallet: this.buildWalletForRow(row)
    };

    const recentPayments = this.db.prepare(`
      SELECT payment_id, offer_id, amount_brl, status, approved_at
      FROM billing_payments
      WHERE user_id = ?
      ORDER BY approved_at DESC, created_at DESC
      LIMIT 8
    `).all(userId) as Array<{
      payment_id: string;
      offer_id: string;
      amount_brl: number;
      status: string;
      approved_at: string;
    }>;

    const promoRedemptions = this.db.prepare(`
      SELECT code, redeemed_at, credit_amount, discount_percent, discount_days, access_days, access_plan
      FROM promo_redemptions
      WHERE user_id = ?
      ORDER BY redeemed_at DESC
      LIMIT 8
    `).all(userId) as Array<{
      code: string;
      redeemed_at: string;
      credit_amount: number;
      discount_percent: number;
      discount_days: number;
      access_days: number;
      access_plan: PersistedPlan | null;
    }>;

    return {
      ...summary,
      recentPayments: recentPayments.map((payment) => ({
        paymentId: payment.payment_id,
        offerId: payment.offer_id,
        amountBRL: clampPositiveCurrency(payment.amount_brl),
        status: payment.status,
        approvedAt: payment.approved_at
      })),
      promoRedemptions: promoRedemptions.map((redemption) => ({
        code: redemption.code,
        redeemedAt: redemption.redeemed_at,
        creditAmount: clampPositiveCurrency(redemption.credit_amount),
        discountPercent: Math.max(0, Number(redemption.discount_percent ?? 0)),
        discountDays: Math.max(0, Math.round(Number(redemption.discount_days ?? 0))),
        accessDays: Math.max(0, Math.round(Number(redemption.access_days ?? 0))),
        accessPlan: redemption.access_plan
      })),
      usageBreakdown: this.getUsageBreakdownForUser(userId, 12),
      recentConversions: this.getRecentConversionsForUser(userId, 12)
    };
  }

  updateAdminUserProfile(cookieHeader: string | undefined, userId: string, input: AdminUserProfileUpdateInput): AdminUserDetail {
    const admin = this.requireAdminAccess(cookieHeader);
    const row = this.requireUserRow(userId);
    const nextEmail = normalizeEmail(input.email);
    const nextDisplayName = input.displayName.trim();

    if (this.isAdminEmail(row.email) && nextEmail !== row.email && !this.isAdminEmail(nextEmail)) {
      throw new AppError("Esse usuario esta marcado como dono no servidor. Atualize ADMIN_OWNER_EMAILS antes de trocar o email.", 409, "ADMIN_EMAIL_LOCK");
    }

    const existing = this.findUserByEmail(nextEmail);
    if (existing && existing.id !== row.id) {
      throw new AppError("Esse email ja esta em uso por outra conta.", 409, "ACCOUNT_EMAIL_IN_USE");
    }

    this.db.prepare(`
      UPDATE users
      SET email = ?, display_name = ?, updated_at = ?
      WHERE id = ?
    `).run(nextEmail, nextDisplayName, new Date().toISOString(), row.id);

    this.recordAdminAudit(admin.user.id, "admin.user.profile.updated", "user", row.id, {
      email: nextEmail,
      displayName: nextDisplayName
    });

    return this.getAdminUserDetail(cookieHeader, row.id);
  }

  updateAdminUserPlan(cookieHeader: string | undefined, userId: string, input: AdminUserPlanUpdateInput): AdminUserDetail {
    const admin = this.requireAdminAccess(cookieHeader);
    this.requireUserRow(userId);

    if (input.plan === "free") {
      this.db.prepare("DELETE FROM account_plans WHERE user_id = ?").run(userId);
      this.recordAdminAudit(admin.user.id, "admin.user.plan.revoked", "user", userId, {});
      return this.getAdminUserDetail(cookieHeader, userId);
    }

    const accessDays = Math.max(1, Math.round(Number(input.accessDays ?? 30)));
    const { accessStartsAt, accessExpiresAt } = this.buildExtendedPlanWindow(userId, accessDays, new Date());
    this.upsertPlanRecord(userId, {
      plan: input.plan,
      source: "code",
      provider: "vaptdoc-admin",
      providerPaymentId: "vaptdoc-admin",
      accessStartsAt,
      accessExpiresAt
    });

    this.recordAdminAudit(admin.user.id, "admin.user.plan.granted", "user", userId, {
      plan: input.plan,
      accessDays
    });

    return this.getAdminUserDetail(cookieHeader, userId);
  }

  updateAdminUserCredits(cookieHeader: string | undefined, userId: string, input: AdminUserCreditsUpdateInput): AdminUserDetail {
    const admin = this.requireAdminAccess(cookieHeader);
    const row = this.requireUserRow(userId);
    const currentBalance = clampPositiveCurrency(Number(row.credit_balance ?? 0));
    const requestedAmount = roundCurrency(Number(input.amount ?? 0));
    const nextBalance =
      input.mode === "set"
        ? clampPositiveCurrency(requestedAmount)
        : clampPositiveCurrency(currentBalance + requestedAmount);

    this.db.prepare("UPDATE users SET credit_balance = ?, updated_at = ? WHERE id = ?")
      .run(nextBalance, new Date().toISOString(), userId);

    this.recordAdminAudit(admin.user.id, "admin.user.credits.updated", "user", userId, {
      mode: input.mode,
      amount: requestedAmount,
      nextBalance
    });

    return this.getAdminUserDetail(cookieHeader, userId);
  }

  updateAdminUserDiscount(cookieHeader: string | undefined, userId: string, input: AdminUserDiscountUpdateInput): AdminUserDetail {
    const admin = this.requireAdminAccess(cookieHeader);
    this.requireUserRow(userId);
    const percent = Math.max(0, Math.min(100, Number(input.percent ?? 0)));

    if (percent <= 0) {
      this.db.prepare("UPDATE users SET discount_percent = 0, discount_expires_at = NULL, updated_at = ? WHERE id = ?")
        .run(new Date().toISOString(), userId);
      this.recordAdminAudit(admin.user.id, "admin.user.discount.cleared", "user", userId, {});
      return this.getAdminUserDetail(cookieHeader, userId);
    }

    const days = Math.max(1, Math.round(Number(input.days ?? 30)));
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    this.db.prepare(`
      UPDATE users
      SET discount_percent = ?, discount_expires_at = ?, updated_at = ?
      WHERE id = ?
    `).run(percent, expiresAt, new Date().toISOString(), userId);

    this.recordAdminAudit(admin.user.id, "admin.user.discount.updated", "user", userId, {
      percent,
      days
    });

    return this.getAdminUserDetail(cookieHeader, userId);
  }

  deleteAdminUser(cookieHeader: string | undefined, userId: string) {
    const admin = this.requireAdminAccess(cookieHeader);
    const row = this.requireUserRow(userId);

    if (admin.user.id === userId) {
      throw new AppError("Use sua propria conta normalmente. O painel nao permite apagar o proprio acesso do dono.", 409, "ADMIN_SELF_DELETE_FORBIDDEN");
    }

    if (this.isAdminEmail(row.email)) {
      throw new AppError("Esse usuario esta configurado como dono do site e nao pode ser removido pelo painel.", 409, "ADMIN_OWNER_DELETE_FORBIDDEN");
    }

    this.db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    this.recordAdminAudit(admin.user.id, "admin.user.deleted", "user", userId, {
      email: row.email
    });
  }

  listAdminPromoCodes(cookieHeader: string | undefined): AdminPromoCodePublic[] {
    this.requireAdminAccess(cookieHeader);
    const rows = this.db.prepare(`
      SELECT code, label, description, credit_amount, discount_percent, discount_days, access_days, access_plan, max_redemptions, per_user_limit, redeemed_count, expires_at, active, created_by_user_id, created_at, updated_at
      FROM promo_codes
      ORDER BY updated_at DESC, created_at DESC
      LIMIT 120
    `).all() as unknown as PromoCodeRow[];

    return rows.map((row) => mapPromoCode(row));
  }

  createAdminPromoCode(cookieHeader: string | undefined, input: AdminPromoCodeInput): AdminPromoCodePublic {
    const admin = this.requireAdminAccess(cookieHeader);
    const code = normalizeCode(input.code || buildGeneratedPromoCode());
    const label = input.label.trim();
    const description = String(input.description ?? "").trim();
    const creditAmount = clampPositiveCurrency(Number(input.creditAmount ?? 0));
    const discountPercent = Math.max(0, Math.min(100, Number(input.discountPercent ?? 0)));
    const discountDays = Math.max(0, Math.round(Number(input.discountDays ?? 0)));
    const accessDays = Math.max(0, Math.round(Number(input.accessDays ?? 0)));
    const accessPlan = accessDays > 0 ? (input.accessPlan ?? "pro") : null;
    const maxRedemptions =
      input.maxRedemptions === null || input.maxRedemptions === undefined
        ? null
        : Math.max(1, Math.round(Number(input.maxRedemptions)));
    const perUserLimit = Math.max(1, Math.round(Number(input.perUserLimit ?? 1)));
    const expiresAt = input.expiresAt ? new Date(input.expiresAt).toISOString() : null;

    if (!code || code.length < 4) {
      throw new AppError("Defina um codigo promocional com ao menos 4 caracteres.", 400, "PROMO_CODE_INVALID");
    }

    if (creditAmount <= 0 && discountPercent <= 0 && accessDays <= 0) {
      throw new AppError("Configure ao menos um beneficio no codigo promocional.", 400, "PROMO_BENEFIT_REQUIRED");
    }

    if (discountPercent > 0 && discountDays <= 0) {
      throw new AppError("Informe por quantos dias o desconto deve ficar ativo.", 400, "PROMO_DISCOUNT_DAYS_REQUIRED");
    }

    const existing = this.db.prepare("SELECT code FROM promo_codes WHERE code = ?").get(code) as { code?: string } | undefined;
    if (existing?.code) {
      throw new AppError("Ja existe um codigo com esse valor. Escolha outro ou deixe o sistema gerar um automaticamente.", 409, "PROMO_CODE_EXISTS");
    }

    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO promo_codes (
        code,
        label,
        description,
        credit_amount,
        discount_percent,
        discount_days,
        access_days,
        access_plan,
        max_redemptions,
        per_user_limit,
        redeemed_count,
        expires_at,
        active,
        created_by_user_id,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1, ?, ?, ?)
    `).run(
      code,
      label,
      description,
      creditAmount,
      discountPercent,
      discountDays,
      accessDays,
      accessPlan,
      maxRedemptions,
      perUserLimit,
      expiresAt,
      admin.user.id,
      now,
      now
    );

    this.recordAdminAudit(admin.user.id, "admin.promo.created", "promo", code, {
      label,
      creditAmount,
      discountPercent,
      discountDays,
      accessDays,
      accessPlan
    });

    const created = this.db.prepare(`
      SELECT code, label, description, credit_amount, discount_percent, discount_days, access_days, access_plan, max_redemptions, per_user_limit, redeemed_count, expires_at, active, created_by_user_id, created_at, updated_at
      FROM promo_codes
      WHERE code = ?
    `).get(code) as unknown as PromoCodeRow;

    return mapPromoCode(created);
  }

  updateAdminPromoCode(cookieHeader: string | undefined, code: string, input: AdminPromoCodeUpdateInput): AdminPromoCodePublic {
    const admin = this.requireAdminAccess(cookieHeader);
    const normalizedCode = normalizeCode(code);
    const promo = this.requirePromoRow(normalizedCode);
    const nextActive = input.active === undefined ? Boolean(promo.active) : Boolean(input.active);

    this.db.prepare("UPDATE promo_codes SET active = ?, updated_at = ? WHERE code = ?")
      .run(nextActive ? 1 : 0, new Date().toISOString(), normalizedCode);

    this.recordAdminAudit(admin.user.id, "admin.promo.updated", "promo", normalizedCode, {
      active: nextActive
    });

    const updated = this.requirePromoRow(normalizedCode);
    return mapPromoCode(updated);
  }

  deleteAdminPromoCode(cookieHeader: string | undefined, code: string) {
    const admin = this.requireAdminAccess(cookieHeader);
    const normalizedCode = normalizeCode(code);
    this.requirePromoRow(normalizedCode);
    this.db.prepare("DELETE FROM promo_codes WHERE code = ?").run(normalizedCode);
    this.recordAdminAudit(admin.user.id, "admin.promo.deleted", "promo", normalizedCode, {});
  }

  private async createVerificationChallenge(input: {
    purpose: EmailVerificationPurpose;
    targetEmail: string;
    payload: Record<string, unknown>;
    userId?: string;
  }): Promise<AccountVerificationStartResult> {
    this.requireEmailVerificationAvailability();
    const now = new Date();
    const code = issueNumericVerificationCode();
    const verificationId = crypto.randomUUID();
    const expiresAt = new Date(now.getTime() + this.verificationCodeMinutes * 60 * 1000);
    const resendAvailableAt = new Date(now.getTime() + this.verificationCooldownSeconds * 1000);
    const normalizedEmail = normalizeEmail(input.targetEmail);

    this.clearExistingVerificationScope(input.purpose, input.userId ?? null, normalizedEmail);

    this.db.prepare(`
      INSERT INTO account_verifications (
        id,
        purpose,
        user_id,
        target_email,
        payload_json,
        code_hash,
        attempts,
        max_attempts,
        sent_count,
        cooldown_until,
        expires_at,
        consumed_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 1, ?, ?, NULL, ?, ?)
    `).run(
      verificationId,
      input.purpose,
      input.userId ?? null,
      normalizedEmail,
      JSON.stringify(input.payload),
      hashText(code),
      this.verificationMaxAttempts,
      resendAvailableAt.toISOString(),
      expiresAt.toISOString(),
      now.toISOString(),
      now.toISOString()
    );

    try {
      await this.emailService?.sendVerificationCode({
        to: normalizedEmail,
        displayName: typeof input.payload.displayName === "string" ? input.payload.displayName : undefined,
        code,
        purpose: input.purpose,
        expiresInMinutes: this.verificationCodeMinutes
      });
    } catch (error) {
      this.db.prepare("DELETE FROM account_verifications WHERE id = ?").run(verificationId);
      throw error;
    }

    return {
      verification: {
        id: verificationId,
        purpose: input.purpose,
        destination: maskEmailAddress(normalizedEmail),
        expiresAt: expiresAt.toISOString(),
        resendAvailableAt: resendAvailableAt.toISOString()
      }
    };
  }

  private async refreshVerificationChallenge(row: AccountVerificationRow): Promise<AccountVerificationStartResult> {
    this.requireEmailVerificationAvailability();
    if (row.consumed_at) {
      throw new AppError("Esse codigo ja foi usado. Solicite um novo para continuar.", 409, "ACCOUNT_VERIFICATION_ALREADY_USED");
    }

    const now = new Date();
    const cooldownUntil = new Date(row.cooldown_until);
    if (Number.isFinite(cooldownUntil.getTime()) && cooldownUntil.getTime() > now.getTime()) {
      throw new AppError("Espere alguns segundos antes de pedir um novo codigo.", 429, "ACCOUNT_VERIFICATION_COOLDOWN");
    }

    const code = issueNumericVerificationCode();
    const resendAvailableAt = new Date(now.getTime() + this.verificationCooldownSeconds * 1000);
    const expiresAt = new Date(now.getTime() + this.verificationCodeMinutes * 60 * 1000);
    this.db.prepare(`
      UPDATE account_verifications
      SET code_hash = ?, attempts = 0, sent_count = sent_count + 1, cooldown_until = ?, expires_at = ?, updated_at = ?
      WHERE id = ?
    `).run(hashText(code), resendAvailableAt.toISOString(), expiresAt.toISOString(), now.toISOString(), row.id);

    const payload = JSON.parse(row.payload_json) as Record<string, unknown>;
    await this.emailService?.sendVerificationCode({
      to: row.target_email,
      displayName: typeof payload.displayName === "string" ? payload.displayName : undefined,
      code,
      purpose: row.purpose,
      expiresInMinutes: this.verificationCodeMinutes
    });

    return {
      verification: {
        id: row.id,
        purpose: row.purpose,
        destination: maskEmailAddress(row.target_email),
        expiresAt: expiresAt.toISOString(),
        resendAvailableAt: resendAvailableAt.toISOString()
      }
    };
  }

  private requireVerification(
    verificationId: string,
    purpose?: EmailVerificationPurpose,
    userId?: string
  ) {
    this.cleanupExpiredVerifications();
    const row = this.db.prepare(`
      SELECT id, purpose, user_id, target_email, payload_json, code_hash, attempts, max_attempts, sent_count, cooldown_until, expires_at, consumed_at, created_at, updated_at
      FROM account_verifications
      WHERE id = ?
    `).get(verificationId) as AccountVerificationRow | undefined;

    if (!row) {
      throw new AppError("Codigo de verificacao invalido ou expirado.", 404, "ACCOUNT_VERIFICATION_NOT_FOUND");
    }

    if (purpose && row.purpose !== purpose) {
      throw new AppError("Esse codigo nao corresponde a esta etapa de seguranca.", 409, "ACCOUNT_VERIFICATION_PURPOSE_MISMATCH");
    }

    if (userId && row.user_id !== userId) {
      throw new AppError("Esse codigo nao pertence a sua conta.", 403, "ACCOUNT_VERIFICATION_FORBIDDEN");
    }

    if (row.consumed_at) {
      throw new AppError("Esse codigo ja foi usado. Solicite um novo para continuar.", 409, "ACCOUNT_VERIFICATION_ALREADY_USED");
    }

    const expiresAt = new Date(row.expires_at);
    if (!Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      this.db.prepare("DELETE FROM account_verifications WHERE id = ?").run(row.id);
      throw new AppError("O codigo expirou. Solicite um novo para continuar.", 410, "ACCOUNT_VERIFICATION_EXPIRED");
    }

    return row;
  }

  private consumeVerificationCode(row: AccountVerificationRow, code: string) {
    const safeCode = String(code ?? "").trim();
    if (!/^\d{6}$/u.test(safeCode)) {
      throw new AppError("Digite o codigo numerico de 6 digitos enviado por e-mail.", 400, "ACCOUNT_VERIFICATION_CODE_INVALID");
    }

    const nextAttempts = Math.max(0, Number(row.attempts ?? 0)) + 1;
    if (!secureCompare(hashText(safeCode), row.code_hash)) {
      if (nextAttempts >= Math.max(1, Number(row.max_attempts ?? this.verificationMaxAttempts))) {
        this.db.prepare("DELETE FROM account_verifications WHERE id = ?").run(row.id);
        throw new AppError("Muitas tentativas invalidas. Solicite um novo codigo.", 429, "ACCOUNT_VERIFICATION_ATTEMPTS_EXCEEDED");
      }

      this.db.prepare("UPDATE account_verifications SET attempts = ?, updated_at = ? WHERE id = ?")
        .run(nextAttempts, new Date().toISOString(), row.id);
      throw new AppError("Codigo invalido. Confira os 6 digitos enviados por e-mail.", 401, "ACCOUNT_VERIFICATION_CODE_MISMATCH");
    }

    this.db.prepare("UPDATE account_verifications SET consumed_at = ?, updated_at = ? WHERE id = ?")
      .run(new Date().toISOString(), new Date().toISOString(), row.id);

    return JSON.parse(row.payload_json) as Record<string, unknown>;
  }

  private cleanupExpiredVerifications() {
    const nowIso = new Date().toISOString();
    this.db.prepare("DELETE FROM account_verifications WHERE expires_at <= ? OR consumed_at IS NOT NULL").run(nowIso);
  }

  private clearExistingVerificationScope(
    purpose: EmailVerificationPurpose,
    userId: string | null,
    targetEmail: string
  ) {
    if (purpose === "register") {
      this.db.prepare("DELETE FROM account_verifications WHERE purpose = ? AND target_email = ?")
        .run(purpose, targetEmail);
      return;
    }

    this.db.prepare("DELETE FROM account_verifications WHERE purpose = ? AND user_id = ?")
      .run(purpose, userId);
  }

  private requireEmailVerificationAvailability() {
    if (!this.emailService?.isConfigured()) {
      throw new AppError(
        "A confirmacao por e-mail ainda nao foi configurada neste ambiente. Configure o SMTP para continuar.",
        503,
        "ACCOUNT_EMAIL_VERIFICATION_UNAVAILABLE"
      );
    }
  }

  buildSetCookie(token: string, expiresAt: Date) {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    const maxAgeSeconds = Math.max(60, Math.round((expiresAt.getTime() - Date.now()) / 1000));
    return `${this.sessionCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
  }

  buildClearCookie() {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return `${this.sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
  }

  private ensureSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS account_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        user_agent_hash TEXT NOT NULL,
        ip_hash TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS account_verifications (
        id TEXT PRIMARY KEY,
        purpose TEXT NOT NULL,
        user_id TEXT,
        target_email TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        code_hash TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        max_attempts INTEGER NOT NULL DEFAULT 5,
        sent_count INTEGER NOT NULL DEFAULT 1,
        cooldown_until TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        consumed_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS account_plans (
        user_id TEXT PRIMARY KEY,
        plan TEXT NOT NULL,
        source TEXT NOT NULL,
        status TEXT NOT NULL,
        access_starts_at TEXT NOT NULL,
        access_expires_at TEXT NOT NULL,
        provider TEXT NOT NULL,
        provider_payment_id TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS billing_payments (
        payment_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        offer_id TEXT NOT NULL,
        provider TEXT NOT NULL,
        amount_brl REAL NOT NULL,
        status TEXT NOT NULL,
        raw_status TEXT NOT NULL,
        approved_at TEXT NOT NULL,
        external_reference TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS promo_codes (
        code TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        credit_amount REAL NOT NULL DEFAULT 0,
        discount_percent REAL NOT NULL DEFAULT 0,
        discount_days INTEGER NOT NULL DEFAULT 0,
        access_days INTEGER NOT NULL DEFAULT 0,
        access_plan TEXT,
        max_redemptions INTEGER,
        per_user_limit INTEGER NOT NULL DEFAULT 1,
        redeemed_count INTEGER NOT NULL DEFAULT 0,
        expires_at TEXT,
        active INTEGER NOT NULL DEFAULT 1,
        created_by_user_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS promo_redemptions (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        user_id TEXT NOT NULL,
        redeemed_at TEXT NOT NULL,
        credit_amount REAL NOT NULL DEFAULT 0,
        discount_percent REAL NOT NULL DEFAULT 0,
        discount_days INTEGER NOT NULL DEFAULT 0,
        access_days INTEGER NOT NULL DEFAULT 0,
        access_plan TEXT,
        FOREIGN KEY (code) REFERENCES promo_codes(code) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS account_favorites (
        user_id TEXT NOT NULL,
        tool_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (user_id, tool_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS account_conversion_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        tool_id TEXT NOT NULL,
        tool_label TEXT NOT NULL,
        source_label TEXT NOT NULL,
        input_count INTEGER NOT NULL DEFAULT 1,
        mode TEXT NOT NULL DEFAULT 'sync',
        options_json TEXT,
        input_files_json TEXT,
        output_filename TEXT,
        output_content_type TEXT,
        output_size_bytes INTEGER,
        provider TEXT,
        status TEXT NOT NULL,
        error_message TEXT,
        stored_file_name TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        completed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS account_notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        history_id TEXT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        action_url TEXT,
        read_at TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (history_id) REFERENCES account_conversion_history(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS admin_audit_log (
        id TEXT PRIMARY KEY,
        actor_user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE CASCADE
      );

    `);

    this.ensureUserColumn("email_verified_at", "TEXT");
    this.ensureUserColumn("avatar_blob", "BLOB");
    this.ensureUserColumn("avatar_content_type", "TEXT");
    this.ensureUserColumn("avatar_updated_at", "TEXT");
    this.ensureUserColumn("credit_balance", "REAL NOT NULL DEFAULT 0");
    this.ensureUserColumn("discount_percent", "REAL NOT NULL DEFAULT 0");
    this.ensureUserColumn("discount_expires_at", "TEXT");
    this.ensureConversionHistoryColumn("mode", "TEXT NOT NULL DEFAULT 'sync'");
    this.ensureConversionHistoryColumn("options_json", "TEXT");
    this.ensureConversionHistoryColumn("input_files_json", "TEXT");
    this.ensureConversionHistoryColumn("output_filename", "TEXT");
    this.ensureConversionHistoryColumn("output_content_type", "TEXT");
    this.ensureConversionHistoryColumn("output_size_bytes", "INTEGER");
    this.ensureConversionHistoryColumn("provider", "TEXT");
    this.ensureIndexes();
    this.db.prepare("UPDATE users SET email_verified_at = created_at WHERE email_verified_at IS NULL").run();
  }

  private ensureIndexes() {
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_account_sessions_expires_at ON account_sessions(expires_at);
      CREATE INDEX IF NOT EXISTS idx_account_verifications_expires_at ON account_verifications(expires_at);
      CREATE INDEX IF NOT EXISTS idx_account_verifications_target_email ON account_verifications(target_email);
      CREATE INDEX IF NOT EXISTS idx_account_favorites_user_id ON account_favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_account_conversion_history_user_id_created_at ON account_conversion_history(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_account_conversion_history_status ON account_conversion_history(status);
      CREATE INDEX IF NOT EXISTS idx_account_conversion_history_mode_status ON account_conversion_history(mode, status, created_at ASC);
      CREATE INDEX IF NOT EXISTS idx_account_notifications_user_id_created_at ON account_notifications(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_account_notifications_user_id_read_at ON account_notifications(user_id, read_at, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_promo_redemptions_user_id ON promo_redemptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_billing_payments_user_id ON billing_payments(user_id);
    `);
  }

  private ensureUserColumn(columnName: string, definition: string) {
    const columns = this.db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
    if (columns.some((column) => column.name === columnName)) {
      return;
    }

    this.db.exec(`ALTER TABLE users ADD COLUMN ${columnName} ${definition}`);
  }

  private ensureConversionHistoryColumn(columnName: string, definition: string) {
    const columns = this.db.prepare("PRAGMA table_info(account_conversion_history)").all() as Array<{ name: string }>;
    if (columns.some((column) => column.name === columnName)) {
      return;
    }

    this.db.exec(`ALTER TABLE account_conversion_history ADD COLUMN ${columnName} ${definition}`);
  }

  private issueAccountSession(userId: string, metadata: AccountRequestMetadata): AccountAuthResult {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.sessionDays * 24 * 60 * 60 * 1000);
    const token = crypto.randomBytes(32).toString("base64url");
    const userAgentHash = hashText(String(metadata.userAgent ?? ""));
    const ipHash = hashText(String(metadata.ip ?? ""));

    this.db.prepare(`
      INSERT INTO account_sessions (
        id,
        user_id,
        token_hash,
        expires_at,
        created_at,
        last_seen_at,
        user_agent_hash,
        ip_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      userId,
      hashText(token),
      expiresAt.toISOString(),
      now.toISOString(),
      now.toISOString(),
      userAgentHash,
      ipHash
    );

    const account = this.getPublicSessionForUser(userId);
    return {
      account,
      setCookie: this.buildSetCookie(token, expiresAt),
      accessSession: this.buildAccessSessionFromPublicPlan(account.plan)
    };
  }

  private buildAccessSessionFromPublicPlan(plan: AccountPlanPublic | null): AccessSession | null {
    if (!plan || plan.status !== "active") {
      return null;
    }

    return {
      plan: plan.plan,
      premium: true,
      source: plan.source,
      activatedAt: plan.accessStartsAt,
      expiresAt: plan.accessExpiresAt,
      dailyLimit: plan.plan === "pro" ? this.proDailyLimit : null
    };
  }

  private getPublicSessionForUser(userId: string): PublicAccountSession {
    const row = this.requireUserRow(userId);
    return {
      authenticated: true,
      user: mapUser(row),
      plan: this.getPlanForUser(userId),
      wallet: this.buildWalletForRow(row),
      isAdmin: this.isAdminEmail(row.email),
      favoriteToolIds: this.getFavoriteToolIdsForUser(userId),
      recentConversions: this.getRecentConversionsForUser(userId)
    };
  }

  private getFavoriteToolIdsForUser(userId: string) {
    const rows = this.db.prepare(`
      SELECT user_id, tool_id, created_at
      FROM account_favorites
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId) as unknown as AccountFavoriteRow[];

    return rows.map((row) => row.tool_id);
  }

  private getConversionHistoryRowsForUser(userId: string, limit = 8) {
    return this.db.prepare(`
      SELECT id, user_id, tool_id, tool_label, source_label, input_count, mode, options_json, input_files_json,
             output_filename, output_content_type, output_size_bytes, provider, status, error_message, stored_file_name,
             created_at, updated_at, completed_at
      FROM account_conversion_history
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(userId, Math.max(1, Math.min(100, Math.round(limit)))) as unknown as AccountConversionHistoryRow[];
  }

  private getRecentConversionsForUser(userId: string, limit = 8) {
    return this.getConversionHistoryRowsForUser(userId, Math.max(1, Math.min(50, Math.round(limit)))).map((row) => mapConversionHistory(row));
  }

  private getUsageBreakdownForUser(userId: string, limit = 12): AccountUsageBreakdownPublic[] {
    const rows = this.db.prepare(`
      SELECT tool_id, tool_label,
             COUNT(*) as total_conversions,
             SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as completed_conversions,
             SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_conversions,
             SUM(CASE WHEN status IN ('queued', 'processing') THEN 1 ELSE 0 END) as pending_conversions,
             MAX(updated_at) as last_used_at,
             SUM(input_count) as total_inputs
      FROM account_conversion_history
      WHERE user_id = ?
      GROUP BY tool_id, tool_label
      ORDER BY last_used_at DESC
      LIMIT ?
    `).all(userId, Math.max(1, Math.min(24, Math.round(limit)))) as Array<{
      tool_id: string;
      tool_label: string;
      total_conversions?: number;
      completed_conversions?: number;
      failed_conversions?: number;
      pending_conversions?: number;
      last_used_at?: string;
      total_inputs?: number;
    }>;

    return rows.map((row) => ({
      toolId: row.tool_id,
      toolLabel: row.tool_label,
      totalConversions: Math.max(0, Math.round(Number(row.total_conversions ?? 0))),
      completedConversions: Math.max(0, Math.round(Number(row.completed_conversions ?? 0))),
      failedConversions: Math.max(0, Math.round(Number(row.failed_conversions ?? 0))),
      pendingConversions: Math.max(0, Math.round(Number(row.pending_conversions ?? 0))),
      estimatedCreditsUsed: estimateToolCredits(row.tool_id, Math.max(1, Math.round(Number(row.total_inputs ?? row.total_conversions ?? 0)))),
      lastUsedAt: String(row.last_used_at ?? "")
    }));
  }

  private getGlobalUsageBreakdown(limit = 8): AccountUsageBreakdownPublic[] {
    const rows = this.db.prepare(`
      SELECT tool_id, tool_label,
             COUNT(*) as total_conversions,
             SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as completed_conversions,
             SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_conversions,
             SUM(CASE WHEN status IN ('queued', 'processing') THEN 1 ELSE 0 END) as pending_conversions,
             MAX(updated_at) as last_used_at,
             SUM(input_count) as total_inputs
      FROM account_conversion_history
      GROUP BY tool_id, tool_label
      ORDER BY total_conversions DESC, last_used_at DESC
      LIMIT ?
    `).all(Math.max(1, Math.min(20, Math.round(limit)))) as Array<{
      tool_id: string;
      tool_label: string;
      total_conversions?: number;
      completed_conversions?: number;
      failed_conversions?: number;
      pending_conversions?: number;
      last_used_at?: string;
      total_inputs?: number;
    }>;

    return rows.map((row) => ({
      toolId: row.tool_id,
      toolLabel: row.tool_label,
      totalConversions: Math.max(0, Math.round(Number(row.total_conversions ?? 0))),
      completedConversions: Math.max(0, Math.round(Number(row.completed_conversions ?? 0))),
      failedConversions: Math.max(0, Math.round(Number(row.failed_conversions ?? 0))),
      pendingConversions: Math.max(0, Math.round(Number(row.pending_conversions ?? 0))),
      estimatedCreditsUsed: estimateToolCredits(row.tool_id, Math.max(1, Math.round(Number(row.total_inputs ?? row.total_conversions ?? 0)))),
      lastUsedAt: String(row.last_used_at ?? "")
    }));
  }

  private buildWalletForRow(row: AccountUserRow): AccountWalletPublic {
    const currentPercent = Math.max(0, Math.min(100, Number(row.discount_percent ?? 0)));
    const currentExpiry = row.discount_expires_at ? new Date(row.discount_expires_at) : null;

    if (!currentPercent || !currentExpiry || !Number.isFinite(currentExpiry.getTime()) || currentExpiry.getTime() <= Date.now()) {
      if (currentPercent > 0 || row.discount_expires_at) {
        this.db.prepare("UPDATE users SET discount_percent = 0, discount_expires_at = NULL, updated_at = ? WHERE id = ?")
          .run(new Date().toISOString(), row.id);
      }

      return {
        creditBalance: clampPositiveCurrency(Number(row.credit_balance ?? 0)),
        discountPercent: 0,
        discountExpiresAt: null
      };
    }

    return {
      creditBalance: clampPositiveCurrency(Number(row.credit_balance ?? 0)),
      discountPercent: currentPercent,
      discountExpiresAt: currentExpiry.toISOString()
    };
  }

  private getWalletForUser(userId: string) {
    const row = this.requireUserRow(userId);
    return this.buildWalletForRow(row);
  }

  private getPlanForUser(userId: string) {
    const row = this.getPlanRowForUser(userId);
    if (!row) {
      return null;
    }

    const expiresAt = new Date(row.access_expires_at);
    if (!Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      this.expirePlanIfNeeded(userId, mapPlan(row));
      return mapPlan({
        ...row,
        status: "expired"
      });
    }

    return mapPlan(row);
  }

  private expirePlanIfNeeded(userId: string, plan: AccountPlanPublic | null) {
    if (!plan || plan.status === "expired") {
      return;
    }

    this.db.prepare("UPDATE account_plans SET status = 'expired', updated_at = ? WHERE user_id = ?")
      .run(new Date().toISOString(), userId);
  }

  private getPlanRowForUser(userId: string) {
    return this.db.prepare(`
      SELECT user_id, plan, source, status, access_starts_at, access_expires_at, provider, provider_payment_id, updated_at
      FROM account_plans
      WHERE user_id = ?
    `).get(userId) as AccountPlanRow | undefined;
  }

  private async purgeExpiredConversionHistory() {
    const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const rows = this.db.prepare(`
      SELECT id, user_id, tool_id, tool_label, source_label, input_count, mode, options_json, input_files_json,
             output_filename, output_content_type, output_size_bytes, provider, status, error_message, stored_file_name,
             created_at, updated_at, completed_at
      FROM account_conversion_history
      WHERE created_at <= ?
    `).all(cutoff) as unknown as AccountConversionHistoryRow[];

    for (const row of rows) {
      await this.deleteStoredInputFiles(row);
      if (row.stored_file_name) {
        await rm(path.join(this.conversionHistoryDir, row.stored_file_name), { force: true }).catch(() => undefined);
      }
    }

    this.db.prepare("DELETE FROM account_notifications WHERE created_at <= ?").run(cutoff);
    this.db.prepare("DELETE FROM account_conversion_history WHERE created_at <= ?").run(cutoff);

    try {
      const fileNames = new Set(
        (
          this.db.prepare("SELECT stored_file_name FROM account_conversion_history WHERE stored_file_name IS NOT NULL").all() as Array<{ stored_file_name: string }>
        ).map((row) => row.stored_file_name)
      );
      const files = await readdir(this.conversionHistoryDir).catch(() => []);
      await Promise.all(
        files
          .filter((fileName) => !fileNames.has(fileName))
          .map((fileName) => rm(path.join(this.conversionHistoryDir, fileName), { force: true }).catch(() => undefined))
      );
    } catch {
      // Ignore cleanup failures to keep account operations available.
    }
  }

  private shouldNotifyAsyncTool(toolId: string) {
    return new Set(["pdf-ocr", "3d-convert", "mp4-to-mp3"]).has(toolId);
  }

  private createNotification(
    userId: string,
    input: {
      historyId?: string | null;
      type: "job-ready" | "job-failed";
      title: string;
      message: string;
      actionUrl?: string | null;
    }
  ) {
    this.db.prepare(`
      INSERT INTO account_notifications (
        id,
        user_id,
        history_id,
        type,
        title,
        message,
        action_url,
        read_at,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?)
    `).run(
      crypto.randomUUID(),
      userId,
      input.historyId ?? null,
      input.type,
      input.title.slice(0, 120),
      input.message.slice(0, 240),
      input.actionUrl ?? null,
      new Date().toISOString()
    );
  }

  private async deleteStoredInputFiles(row: AccountConversionHistoryRow) {
    const inputFiles = parseStoredInputFiles(row.input_files_json);
    await Promise.all(
      inputFiles.map((item) => rm(path.join(this.conversionInputDir, item.storedFileName), { force: true }).catch(() => undefined))
    );
  }

  private isAdminEmail(email: string) {
    return this.adminOwnerEmails.size > 0 && this.adminOwnerEmails.has(normalizeEmail(email));
  }

  private requireAuthenticated(cookieHeader?: string) {
    const authenticated = this.getAuthenticatedAccount(cookieHeader);
    if (!authenticated) {
      throw new AppError("Entre na sua conta para continuar.", 401, "ACCOUNT_AUTH_REQUIRED");
    }

    return authenticated;
  }

  private requireAdminAccess(cookieHeader?: string) {
    const authenticated = this.requireAuthenticated(cookieHeader);
    if (this.adminOwnerEmails.size === 0) {
      throw new AppError("O painel administrativo ainda nao foi configurado neste ambiente.", 503, "ADMIN_UNAVAILABLE");
    }

    if (!authenticated.isAdmin) {
      throw new AppError("Acesso restrito ao dono do site.", 403, "ADMIN_FORBIDDEN");
    }

    return authenticated;
  }

  private requirePromoRow(code: string) {
    const row = this.db.prepare(`
      SELECT code, label, description, credit_amount, discount_percent, discount_days, access_days, access_plan, max_redemptions, per_user_limit, redeemed_count, expires_at, active, created_by_user_id, created_at, updated_at
      FROM promo_codes
      WHERE code = ?
    `).get(code) as PromoCodeRow | undefined;

    if (!row) {
      throw new AppError("Codigo promocional nao encontrado.", 404, "PROMO_CODE_NOT_FOUND");
    }

    return row;
  }

  private buildExtendedPlanWindow(userId: string, accessDays: number, referenceDate: Date) {
    const safeReference = this.parseDateOrNow(referenceDate.toISOString());
    const currentPlan = this.getPlanRowForUser(userId);
    const currentExpiry = currentPlan ? new Date(currentPlan.access_expires_at) : null;
    const extensionBaseTime =
      currentExpiry && Number.isFinite(currentExpiry.getTime()) && currentExpiry.getTime() > safeReference.getTime()
        ? currentExpiry.getTime()
        : safeReference.getTime();

    return {
      accessStartsAt: safeReference.toISOString(),
      accessExpiresAt: new Date(extensionBaseTime + accessDays * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  private upsertPlanRecord(
    userId: string,
    input: {
      plan: PersistedPlan;
      source: Extract<AccessSource, "code" | "payment">;
      provider: string;
      providerPaymentId: string;
      accessStartsAt: string;
      accessExpiresAt: string;
    }
  ) {
    this.db.prepare(`
      INSERT INTO account_plans (
        user_id,
        plan,
        source,
        status,
        access_starts_at,
        access_expires_at,
        provider,
        provider_payment_id,
        updated_at
      ) VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        plan = excluded.plan,
        source = excluded.source,
        status = excluded.status,
        access_starts_at = excluded.access_starts_at,
        access_expires_at = excluded.access_expires_at,
        provider = excluded.provider,
        provider_payment_id = excluded.provider_payment_id,
        updated_at = excluded.updated_at
    `).run(
      userId,
      input.plan,
      input.source,
      input.accessStartsAt,
      input.accessExpiresAt,
      input.provider,
      input.providerPaymentId,
      new Date().toISOString()
    );
  }

  private recordAdminAudit(
    actorUserId: string,
    action: string,
    targetType: string,
    targetId: string,
    payload: Record<string, unknown>
  ) {
    this.db.prepare(`
      INSERT INTO admin_audit_log (
        id,
        actor_user_id,
        action,
        target_type,
        target_id,
        payload_json,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      actorUserId,
      action,
      targetType,
      targetId,
      JSON.stringify(payload),
      new Date().toISOString()
    );
  }

  private parseDateOrNow(value?: string) {
    const parsed = value ? new Date(value) : new Date();
    return Number.isFinite(parsed.getTime()) ? parsed : new Date();
  }

  private getSessionToken(cookieHeader?: string) {
    return parseCookieHeader(cookieHeader).get(this.sessionCookieName) ?? "";
  }

  private cleanupExpiredSessions() {
    this.db.prepare("DELETE FROM account_sessions WHERE expires_at <= ?").run(new Date().toISOString());
  }

  private findUserByEmail(email: string) {
    return this.db.prepare(`
      SELECT id, email, display_name, password_hash, password_salt, email_verified_at, created_at, updated_at, avatar_content_type, avatar_updated_at, credit_balance, discount_percent, discount_expires_at
      FROM users
      WHERE email = ?
    `).get(email) as AccountUserRow | undefined;
  }

  private findUserById(userId: string) {
    return this.db.prepare(`
      SELECT id, email, display_name, password_hash, password_salt, email_verified_at, created_at, updated_at, avatar_content_type, avatar_updated_at, credit_balance, discount_percent, discount_expires_at
      FROM users
      WHERE id = ?
    `).get(userId) as AccountUserRow | undefined;
  }

  private requireUserRow(userId: string) {
    const row = this.findUserById(userId);
    if (!row) {
      throw new AppError("Conta nao encontrada.", 404, "ACCOUNT_NOT_FOUND");
    }

    return row;
  }
}

export function createAccountService(config: AccountServiceConfig = {}) {
  return new AccountService(config);
}
