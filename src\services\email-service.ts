import nodemailer from "nodemailer";

export type EmailVerificationPurpose = "register" | "email-change" | "password-change";
export type EmailProvider = "disabled" | "smtp" | "brevo-api" | "memory";

export interface VerificationEmailPayload {
  to: string;
  displayName?: string;
  code: string;
  purpose: EmailVerificationPurpose;
  expiresInMinutes: number;
}

export interface EmailService {
  isConfigured(): boolean;
  getProvider(): EmailProvider;
  sendVerificationCode(payload: VerificationEmailPayload): Promise<void>;
}

export interface EmailServiceConfig {
  brevoApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  fromEmail?: string;
  fromName?: string;
  fetchImpl?: typeof fetch;
  logger?: Pick<Console, "info" | "warn" | "error">;
}

type NodemailerTransport = Pick<
  ReturnType<typeof nodemailer.createTransport>,
  "sendMail"
>;

function buildSubject(purpose: EmailVerificationPurpose) {
  if (purpose === "register") {
    return "vaptdoc | Confirme sua conta";
  }

  if (purpose === "email-change") {
    return "vaptdoc | Confirme seu novo e-mail";
  }

  return "vaptdoc | Confirme a troca de senha";
}

function buildHeadline(purpose: EmailVerificationPurpose) {
  if (purpose === "register") {
    return "Confirme sua conta vaptdoc";
  }

  if (purpose === "email-change") {
    return "Confirme seu novo e-mail";
  }

  return "Confirme a troca de senha";
}

function buildCopy(purpose: EmailVerificationPurpose) {
  if (purpose === "register") {
    return "Use este codigo para terminar a criacao da sua conta com seguranca.";
  }

  if (purpose === "email-change") {
    return "Use este codigo para confirmar a alteracao do e-mail da sua conta.";
  }

  return "Use este codigo para confirmar a troca da senha da sua conta.";
}

function buildTextMessage(payload: VerificationEmailPayload) {
  return [
    buildHeadline(payload.purpose),
    "",
    `Codigo: ${payload.code}`,
    `Validade: ${payload.expiresInMinutes} minutos`,
    "",
    buildCopy(payload.purpose),
    "",
    "Se voce nao solicitou essa acao, ignore este e-mail."
  ].join("\n");
}

function buildHtmlMessage(payload: VerificationEmailPayload) {
  const safeName = payload.displayName ? `<p style="margin:0 0 16px;">Ola, ${escapeHtml(payload.displayName)}.</p>` : "";

  return `
    <div style="font-family:Plus Jakarta Sans,Arial,sans-serif;background:#f4f3ff;padding:24px;color:#141f26;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:24px;padding:28px;border:1px solid rgba(125,56,255,0.12);box-shadow:0 24px 48px rgba(93,49,199,0.08);">
        <p style="margin:0 0 10px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#7d38ff;font-weight:800;">vaptdoc</p>
        <h1 style="margin:0 0 14px;font-size:24px;line-height:1.1;">${escapeHtml(buildHeadline(payload.purpose))}</h1>
        ${safeName}
        <p style="margin:0 0 18px;line-height:1.6;color:#4d5b66;">${escapeHtml(buildCopy(payload.purpose))}</p>
        <div style="margin:0 0 18px;padding:16px 18px;border-radius:18px;background:linear-gradient(135deg,#18bcff 0%,#7d38ff 100%);color:#ffffff;text-align:center;">
          <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.88;margin-bottom:8px;">Codigo de verificacao</div>
          <div style="font-size:34px;line-height:1;font-weight:800;letter-spacing:.18em;">${escapeHtml(payload.code)}</div>
        </div>
        <p style="margin:0 0 8px;line-height:1.5;color:#4d5b66;">Validade: <strong>${payload.expiresInMinutes} minutos</strong></p>
        <p style="margin:0;line-height:1.5;color:#72808a;">Se voce nao solicitou essa acao, ignore este e-mail.</p>
      </div>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

class DisabledEmailService implements EmailService {
  isConfigured() {
    return false;
  }

  getProvider(): EmailProvider {
    return "disabled";
  }

  async sendVerificationCode() {
    throw new Error("O envio de e-mail ainda nao foi configurado neste ambiente.");
  }
}

class SmtpEmailService implements EmailService {
  private readonly from: string;
  private readonly transport: NodemailerTransport;

  constructor(
    private readonly config: Required<Pick<EmailServiceConfig, "fromEmail" | "fromName">>,
    transport: NodemailerTransport
  ) {
    this.transport = transport;
    this.from = config.fromName
      ? `"${config.fromName.replaceAll('"', "")}" <${config.fromEmail}>`
      : config.fromEmail;
  }

  isConfigured() {
    return true;
  }

  getProvider(): EmailProvider {
    return "smtp";
  }

  async sendVerificationCode(payload: VerificationEmailPayload) {
    await this.transport.sendMail({
      from: this.from,
      to: payload.to,
      subject: buildSubject(payload.purpose),
      text: buildTextMessage(payload),
      html: buildHtmlMessage(payload)
    });
  }
}

class BrevoApiEmailService implements EmailService {
  private readonly endpoint = "https://api.brevo.com/v3/smtp/email";
  private readonly fromName: string;

  constructor(
    private readonly config: Required<Pick<EmailServiceConfig, "brevoApiKey" | "fromEmail" | "fromName">>,
    private readonly fetchImpl: typeof fetch
  ) {
    this.fromName = config.fromName.trim() || "vaptdoc";
  }

  isConfigured() {
    return true;
  }

  getProvider(): EmailProvider {
    return "brevo-api";
  }

  async sendVerificationCode(payload: VerificationEmailPayload) {
    const response = await this.fetchImpl(this.endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": this.config.brevoApiKey
      },
      body: JSON.stringify({
        sender: {
          email: this.config.fromEmail,
          name: this.fromName
        },
        to: [
          payload.displayName
            ? {
                email: payload.to,
                name: payload.displayName
              }
            : {
                email: payload.to
              }
        ],
        subject: buildSubject(payload.purpose),
        htmlContent: buildHtmlMessage(payload),
        textContent: buildTextMessage(payload)
      })
    });

    if (response.ok) {
      return;
    }

    const rawBody = await response.text();
    let detail = "";

    try {
      const parsed = JSON.parse(rawBody) as { message?: string; code?: string };
      detail = parsed.message || parsed.code || "";
    } catch {
      detail = rawBody;
    }

    throw new Error(
      detail
        ? `Brevo recusou o envio do e-mail de verificacao: ${detail}`
        : "Brevo recusou o envio do e-mail de verificacao."
    );
  }
}

export function createEmailService(config: EmailServiceConfig = {}): EmailService {
  const brevoApiKey = String(config.brevoApiKey ?? "").trim();
  const smtpHost = String(config.smtpHost ?? "").trim();
  const fromEmail = String(config.fromEmail ?? "").trim();
  const fromName = String(config.fromName ?? "vaptdoc").trim() || "vaptdoc";
  const fetchImpl = config.fetchImpl ?? fetch;

  if (brevoApiKey && fromEmail) {
    config.logger?.info?.("[vaptdoc] Servico de e-mail configurado com Brevo API.");
    return new BrevoApiEmailService(
      {
        brevoApiKey,
        fromEmail,
        fromName
      },
      fetchImpl
    );
  }

  if (!smtpHost || !fromEmail) {
    config.logger?.warn?.("[vaptdoc] Servico de e-mail nao configurado. Verificacao por codigo ficara indisponivel.");
    return new DisabledEmailService();
  }

  const port = Number(config.smtpPort ?? 587);
  const secure = Boolean(config.smtpSecure ?? port === 465);
  const user = String(config.smtpUser ?? "").trim();
  const pass = String(config.smtpPass ?? "");

  const transport = nodemailer.createTransport({
    host: smtpHost,
    port,
    secure,
    auth: user ? { user, pass } : undefined
  });

  return new SmtpEmailService(
    {
      fromEmail,
      fromName
    },
    transport
  );
}

export class MemoryEmailService implements EmailService {
  readonly sent: VerificationEmailPayload[] = [];

  isConfigured() {
    return true;
  }

  getProvider(): EmailProvider {
    return "memory";
  }

  async sendVerificationCode(payload: VerificationEmailPayload) {
    this.sent.push({
      ...payload
    });
  }

  getLatestCode(targetEmail: string, purpose?: EmailVerificationPurpose) {
    const normalizedEmail = targetEmail.trim().toLowerCase();
    const match = [...this.sent]
      .reverse()
      .find((entry) => entry.to.trim().toLowerCase() === normalizedEmail && (!purpose || entry.purpose === purpose));

    return match?.code ?? "";
  }
}
