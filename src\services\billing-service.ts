import crypto from "node:crypto";
import { AppError } from "../utils/errors.js";

export type BillingOfferId = "pro-monthly" | "pro-yearly" | "starter-pack";
export type BillingPlan = "pro" | "team";
export type BillingPaymentStatus = "approved" | "pending" | "rejected" | "cancelled";

export interface BillingOffer {
  id: BillingOfferId;
  title: string;
  description: string;
  plan: BillingPlan;
  accessDays: number;
  amountBRL: number;
}

export interface PublicBillingOffer {
  id: BillingOfferId;
  title: string;
  description: string;
  plan: BillingPlan;
  accessDays: number;
  amountBRL: number;
}

export interface BillingConfig {
  accessToken?: string;
  webhookSecret?: string;
  publicAppUrl?: string;
  stateSecret?: string;
  stateCookieName?: string;
  stateTtlSeconds?: number;
  requestTimeoutMs?: number;
  offers?: Partial<Record<BillingOfferId, Partial<BillingOffer>>>;
}

export interface CheckoutLaunch {
  checkoutUrl: string;
  preferenceId: string;
  stateToken: string;
  offer: BillingOffer;
  provider: "mercadopago";
}

export interface BillingConfirmation {
  stateToken: string;
  offer: BillingOffer;
  paymentId: string;
  status: BillingPaymentStatus;
  rawStatus: string;
  amountBRL: number;
  approvedAt?: string;
}

export interface WebhookVerificationResult {
  ok: boolean;
  topic?: string;
  paymentId?: string;
  paymentStatus?: string;
}

interface MercadoPagoPreferenceResponse {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
}

interface MercadoPagoPaymentResponse {
  id: number | string;
  status?: string;
  status_detail?: string;
  transaction_amount?: number | string;
  currency_id?: string;
  external_reference?: string;
  date_created?: string;
  date_approved?: string;
}

interface MercadoPagoSearchResponse {
  results?: MercadoPagoPaymentResponse[];
}

interface ParsedStateToken {
  offerId: BillingOfferId;
  token: string;
  expectedAmountBRL: number | null;
}

const defaultOffers: Record<BillingOfferId, BillingOffer> = {
  "pro-monthly": {
    id: "pro-monthly",
    title: "Vaptdoc Pro 30 dias",
    description: "Acesso premium por 30 dias com OCR, PDF avancado e ferramentas 3D.",
    plan: "pro",
    accessDays: 30,
    amountBRL: 19.9
  },
  "pro-yearly": {
    id: "pro-yearly",
    title: "Vaptdoc Pro 365 dias",
    description: "Acesso premium por 1 ano para uso frequente e prioridade de conversao.",
    plan: "pro",
    accessDays: 365,
    amountBRL: 149.9
  },
  "starter-pack": {
    id: "starter-pack",
    title: "Vaptdoc Starter",
    description: "Pacote rapido para liberar recursos premium por alguns dias.",
    plan: "pro",
    accessDays: 7,
    amountBRL: 9.9
  }
};

const offerCodeMap: Record<BillingOfferId, string> = {
  "pro-monthly": "m",
  "pro-yearly": "y",
  "starter-pack": "s"
};

const reverseOfferCodeMap = Object.fromEntries(
  Object.entries(offerCodeMap).map(([offerId, code]) => [code, offerId as BillingOfferId])
) as Record<string, BillingOfferId>;

function normalizePublicUrl(value?: string) {
  const trimmed = String(value ?? "").trim().replace(/\/+$/u, "");
  return trimmed;
}

function parseCookieHeader(cookieHeader?: string) {
  const cookies = new Map<string, string>();

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
      cookies.set(key, decodeURIComponent(value));
    } catch {
      cookies.set(key, value);
    }
  }

  return cookies;
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function parseMercadoPagoError(payload: unknown) {
  if (typeof payload === "object" && payload !== null) {
    const cause = (payload as { cause?: Array<{ description?: string }> }).cause?.[0]?.description;
    if (cause) {
      return cause;
    }

    const message = (payload as { message?: string }).message;
    if (message) {
      return message;
    }
  }

  return "Falha na comunicacao com o checkout.";
}

export class BillingService {
  private readonly accessToken: string;
  private readonly webhookSecret: string;
  private readonly publicAppUrl: string;
  private readonly stateSecret: string;
  private readonly stateCookieName: string;
  private readonly stateTtlSeconds: number;
  private readonly requestTimeoutMs: number;
  private readonly offers: Record<BillingOfferId, BillingOffer>;
  private readonly fetchImpl: typeof fetch;

  constructor(config: BillingConfig = {}, fetchImpl: typeof fetch = fetch) {
    this.accessToken = String(config.accessToken ?? "").trim();
    this.webhookSecret = String(config.webhookSecret ?? "").trim();
    this.publicAppUrl = normalizePublicUrl(config.publicAppUrl);
    this.stateSecret = String(config.stateSecret ?? "").trim() || "vaptdoc-billing-state-secret";
    this.stateCookieName = config.stateCookieName ?? "vaptdoc-checkout";
    this.stateTtlSeconds = Math.max(300, config.stateTtlSeconds ?? 24 * 60 * 60);
    this.requestTimeoutMs = Math.max(3_000, config.requestTimeoutMs ?? 15_000);
    this.fetchImpl = fetchImpl;
    this.offers = {
      "pro-monthly": {
        ...defaultOffers["pro-monthly"],
        ...(config.offers?.["pro-monthly"] ?? {})
      },
      "pro-yearly": {
        ...defaultOffers["pro-yearly"],
        ...(config.offers?.["pro-yearly"] ?? {})
      },
      "starter-pack": {
        ...defaultOffers["starter-pack"],
        ...(config.offers?.["starter-pack"] ?? {})
      }
    };
  }

  isCheckoutEnabled() {
    return Boolean(this.accessToken);
  }

  getCheckoutProvider() {
    return this.isCheckoutEnabled() ? "mercadopago" : "";
  }

  getOffer(offerId: BillingOfferId) {
    return this.offers[offerId] ?? null;
  }

  getPublicOffers(): PublicBillingOffer[] {
    return Object.values(this.offers).map((offer) => ({
      id: offer.id,
      title: offer.title,
      description: offer.description,
      plan: offer.plan,
      accessDays: offer.accessDays,
      amountBRL: offer.amountBRL
    }));
  }

  getStateToken(cookieHeader?: string) {
    const token = parseCookieHeader(cookieHeader).get(this.stateCookieName);
    if (!token) {
      return null;
    }

    return this.parseStateToken(token)?.token ?? null;
  }

  buildStateCookie(stateToken: string) {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return `${this.stateCookieName}=${encodeURIComponent(stateToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${this.stateTtlSeconds}${secure}`;
  }

  buildClearStateCookie() {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return `${this.stateCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
  }

  async createCheckout(input: { offerId: BillingOfferId; originHint?: string; overrideAmountBRL?: number }) {
    if (!this.isCheckoutEnabled()) {
      throw new AppError("O checkout de pagamento ainda nao esta configurado.", 503, "CHECKOUT_UNAVAILABLE");
    }

    const publicBaseUrl = this.resolvePublicBaseUrl(input.originHint);
    const offer = this.getOffer(input.offerId);
    if (!offer) {
      throw new AppError("Plano de pagamento invalido.", 400, "INVALID_BILLING_OFFER");
    }

    const effectiveAmountBRL = roundCurrency(
      Number.isFinite(Number(input.overrideAmountBRL)) ? Number(input.overrideAmountBRL) : offer.amountBRL
    );
    const stateToken = this.createStateToken(offer.id, effectiveAmountBRL);
    const payload = {
      items: [
        {
          id: offer.id,
          title: offer.title,
          description: offer.description,
          quantity: 1,
          unit_price: effectiveAmountBRL,
          currency_id: "BRL"
        }
      ],
      external_reference: stateToken,
      back_urls: {
        success: `${publicBaseUrl}/checkout/success`,
        pending: `${publicBaseUrl}/checkout/pending`,
        failure: `${publicBaseUrl}/checkout/failure`
      },
      auto_return: "approved",
      binary_mode: false,
      notification_url: `${publicBaseUrl}/api/billing/mercadopago/webhook?source_news=webhooks`,
      metadata: {
        vaptdoc_offer_id: offer.id,
        vaptdoc_state: stateToken
      }
    };

    const preference = await this.requestMercadoPago<MercadoPagoPreferenceResponse>(
      "POST",
      "/checkout/preferences",
      {
        body: payload,
        idempotencyKey: crypto.randomUUID()
      }
    );

    const checkoutUrl = preference.init_point ?? preference.sandbox_init_point;
    if (!checkoutUrl || !preference.id) {
      throw new AppError("O checkout foi criado, mas a URL de pagamento nao retornou corretamente.", 502, "CHECKOUT_URL_MISSING");
    }

    return {
      checkoutUrl,
      preferenceId: preference.id,
      stateToken,
      offer: {
        ...offer,
        amountBRL: effectiveAmountBRL
      },
      provider: "mercadopago"
    } satisfies CheckoutLaunch;
  }

  async confirmCheckout(input: { stateToken: string; paymentId?: string }) {
    const parsedState = this.parseStateToken(input.stateToken);
    if (!parsedState) {
      throw new AppError("Sua sessao de pagamento expirou. Abra o checkout novamente.", 400, "CHECKOUT_STATE_INVALID");
    }

    const payment = input.paymentId
      ? await this.getPaymentById(input.paymentId)
      : await this.searchLatestPayment(parsedState.token);

    if (!payment) {
      return {
        stateToken: parsedState.token,
        offer: this.offers[parsedState.offerId],
        paymentId: "",
        status: "pending",
        rawStatus: "pending",
        amountBRL: this.offers[parsedState.offerId].amountBRL
      } satisfies BillingConfirmation;
    }

    return this.buildConfirmation(parsedState, payment);
  }

  async verifyWebhook(input: {
    headers: Record<string, string | string[] | undefined>;
    query: Record<string, unknown>;
    body: unknown;
  }) {
    const topic = typeof (input.body as { type?: string })?.type === "string"
      ? String((input.body as { type?: string }).type)
      : "";
    const paymentId = this.extractWebhookPaymentId(input.query, input.body);

    if (this.webhookSecret) {
      const isValid = this.validateWebhookSignature(input.headers, input.query);
      if (!isValid) {
        return {
          ok: false,
          topic,
          paymentId
        } satisfies WebhookVerificationResult;
      }
    }

    if (!paymentId || topic !== "payment" || !this.isCheckoutEnabled()) {
      return {
        ok: true,
        topic,
        paymentId
      } satisfies WebhookVerificationResult;
    }

    const payment = await this.getPaymentById(paymentId);
    return {
      ok: true,
      topic,
      paymentId,
      paymentStatus: payment.status ?? "unknown"
    } satisfies WebhookVerificationResult;
  }

  private createStateToken(offerId: BillingOfferId, expectedAmountBRL?: number) {
    const offerCode = offerCodeMap[offerId];
    const nonce = crypto.randomBytes(9).toString("base64url").replace(/[^a-zA-Z0-9_-]/gu, "").slice(0, 12);
    const issuedAt = Date.now().toString(36);
    const amountCode = Math.max(1, Math.round(roundCurrency(expectedAmountBRL ?? this.offers[offerId].amountBRL) * 100)).toString(36);
    const unsigned = `${offerCode}.${nonce}.${issuedAt}.${amountCode}`;
    const signature = crypto.createHmac("sha256", this.stateSecret).update(unsigned).digest("hex").slice(0, 32);
    return `vpd_${offerCode}_${nonce}_${issuedAt}_${amountCode}_${signature}`;
  }

  private parseStateToken(token: string): ParsedStateToken | null {
    const newFormatMatch = /^vpd_([mys])_([A-Za-z0-9_-]{6,20})_([A-Za-z0-9]+)_([A-Za-z0-9]+)_([a-f0-9]{32})$/u.exec(token);
    const oldFormatMatch = /^vpd_([mys])_([A-Za-z0-9_-]{6,20})_([A-Za-z0-9]+)_([a-f0-9]{32})$/u.exec(token);
    const match = newFormatMatch ?? oldFormatMatch;
    if (!match) {
      return null;
    }

    const isNewFormat = match.length === 6;
    const offerCode = match[1] ?? "";
    const nonce = match[2] ?? "";
    const issuedAtBase36 = match[3] ?? "";
    const amountCode = isNewFormat ? match[4] ?? "" : "";
    const providedSignature = isNewFormat ? match[5] ?? "" : match[4] ?? "";
    const offerId = reverseOfferCodeMap[offerCode];
    if (!offerId) {
      return null;
    }

    const unsigned = isNewFormat ? `${offerCode}.${nonce}.${issuedAtBase36}.${amountCode}` : `${offerCode}.${nonce}.${issuedAtBase36}`;
    const expectedSignature = crypto.createHmac("sha256", this.stateSecret).update(unsigned).digest("hex").slice(0, 32);
    if (!safeCompare(expectedSignature, providedSignature)) {
      return null;
    }

    const issuedAt = Number.parseInt(issuedAtBase36, 36);
    if (!Number.isFinite(issuedAt)) {
      return null;
    }

    if (Date.now() - issuedAt > this.stateTtlSeconds * 1000) {
      return null;
    }

    const expectedAmountBRL =
      isNewFormat && amountCode
        ? roundCurrency(Number.parseInt(amountCode, 36) / 100)
        : null;

    return {
      offerId,
      token,
      expectedAmountBRL: Number.isFinite(expectedAmountBRL ?? Number.NaN) ? expectedAmountBRL : null
    };
  }

  private resolvePublicBaseUrl(originHint?: string) {
    const normalizedHint = normalizePublicUrl(originHint);
    const publicBaseUrl = this.publicAppUrl || normalizedHint;

    if (!publicBaseUrl) {
      throw new AppError("Defina a URL publica do site antes de ativar o checkout.", 503, "PUBLIC_URL_MISSING");
    }

    return publicBaseUrl;
  }

  private async getPaymentById(paymentId: string) {
    return this.requestMercadoPago<MercadoPagoPaymentResponse>("GET", `/v1/payments/${encodeURIComponent(paymentId)}`);
  }

  private async searchLatestPayment(stateToken: string) {
    const payload = await this.requestMercadoPago<MercadoPagoSearchResponse>("GET", "/v1/payments/search", {
      query: {
        sort: "date_created",
        criteria: "desc",
        limit: "10",
        offset: "0",
        external_reference: stateToken
      }
    });

    return payload.results?.find((entry) => entry.external_reference === stateToken) ?? null;
  }

  private buildConfirmation(parsedState: ParsedStateToken, payment: MercadoPagoPaymentResponse) {
    const offer = {
      ...this.offers[parsedState.offerId],
      amountBRL: parsedState.expectedAmountBRL ?? this.offers[parsedState.offerId].amountBRL
    };
    const externalReference = String(payment.external_reference ?? "");
    if (!externalReference || !safeCompare(externalReference, parsedState.token)) {
      throw new AppError("O pagamento retornado nao corresponde ao checkout iniciado neste navegador.", 409, "CHECKOUT_STATE_MISMATCH");
    }

    const amountBRL = roundCurrency(Number(payment.transaction_amount ?? Number.NaN));
    if (!Number.isFinite(amountBRL)) {
      throw new AppError("O pagamento retornou sem valor valido.", 502, "PAYMENT_AMOUNT_MISSING");
    }

    if (roundCurrency(offer.amountBRL) !== amountBRL) {
      throw new AppError("O valor do pagamento nao corresponde ao plano solicitado.", 409, "PAYMENT_AMOUNT_MISMATCH");
    }

    if (String(payment.currency_id ?? "").toUpperCase() !== "BRL") {
      throw new AppError("A moeda retornada pelo pagamento nao e suportada para esse checkout.", 409, "PAYMENT_CURRENCY_MISMATCH");
    }

    const rawStatus = String(payment.status ?? "pending").toLowerCase();
    const status = this.normalizePaymentStatus(rawStatus);

    return {
      stateToken: parsedState.token,
      offer,
      paymentId: String(payment.id ?? ""),
      status,
      rawStatus,
      amountBRL,
      approvedAt: payment.date_approved ?? payment.date_created
    } satisfies BillingConfirmation;
  }

  private normalizePaymentStatus(status: string): BillingPaymentStatus {
    if (status === "approved") {
      return "approved";
    }

    if (status === "rejected") {
      return "rejected";
    }

    if (status === "cancelled" || status === "cancelled_by_user") {
      return "cancelled";
    }

    return "pending";
  }

  private extractWebhookPaymentId(query: Record<string, unknown>, body: unknown) {
    const queryValue = query["data.id"];
    if (typeof queryValue === "string" && queryValue) {
      return queryValue;
    }

    const bodyValue = (body as { data?: { id?: string | number } })?.data?.id;
    if (typeof bodyValue === "string" || typeof bodyValue === "number") {
      return String(bodyValue);
    }

    return "";
  }

  private validateWebhookSignature(headers: Record<string, string | string[] | undefined>, query: Record<string, unknown>) {
    const signatureHeader = this.readHeader(headers, "x-signature");
    const requestId = this.readHeader(headers, "x-request-id");
    const dataId = typeof query["data.id"] === "string" ? String(query["data.id"]).toLowerCase() : "";
    if (!signatureHeader || !requestId || !dataId) {
      return false;
    }

    let ts = "";
    let signature = "";

    for (const segment of signatureHeader.split(",")) {
      const [key, value] = segment.split("=", 2).map((part) => part.trim());
      if (key === "ts") {
        ts = value ?? "";
      } else if (key === "v1") {
        signature = value ?? "";
      }
    }

    if (!ts || !signature) {
      return false;
    }

    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const expectedSignature = crypto.createHmac("sha256", this.webhookSecret).update(manifest).digest("hex");
    return safeCompare(expectedSignature, signature);
  }

  private readHeader(headers: Record<string, string | string[] | undefined>, name: string) {
    const rawValue = headers[name];
    if (Array.isArray(rawValue)) {
      return rawValue[0] ?? "";
    }

    return String(rawValue ?? "");
  }

  private async requestMercadoPago<T>(
    method: "GET" | "POST",
    path: string,
    options: {
      body?: unknown;
      query?: Record<string, string>;
      idempotencyKey?: string;
    } = {}
  ) {
    if (!this.accessToken) {
      throw new AppError("O checkout de pagamento ainda nao esta configurado.", 503, "CHECKOUT_UNAVAILABLE");
    }

    const url = new URL(path, "https://api.mercadopago.com");
    Object.entries(options.query ?? {}).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: "application/json",
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...(options.idempotencyKey ? { "X-Idempotency-Key": options.idempotencyKey } : {})
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });

      const text = await response.text();
      const payload = text ? JSON.parse(text) as unknown : {};

      if (!response.ok) {
        throw new AppError(parseMercadoPagoError(payload), response.status >= 500 ? 502 : 400, "MERCADOPAGO_REQUEST_FAILED");
      }

      return payload as T;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new AppError("O checkout demorou mais do que o esperado para responder.", 504, "CHECKOUT_TIMEOUT");
      }

      throw new AppError("Nao foi possivel falar com o provedor de pagamento agora.", 502, "CHECKOUT_NETWORK_ERROR");
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function createBillingService(config: BillingConfig = {}, fetchImpl?: typeof fetch) {
  return new BillingService(config, fetchImpl);
}
