import "dotenv/config";
import ffmpegStatic from "ffmpeg-static";
import { z } from "zod";

function emptyToUndefined(value: unknown) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}

function defaultedInt(defaultValue: number, minimum: number, maximum: number) {
  return z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(minimum).max(maximum).default(defaultValue)
  );
}

function defaultedPositiveNumber(defaultValue: number, maximum: number) {
  return z.preprocess(
    emptyToUndefined,
    z.coerce.number().positive().max(maximum).default(defaultValue)
  );
}

function defaultedString(defaultValue: string) {
  return z.preprocess(emptyToUndefined, z.string().default(defaultValue));
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: defaultedString("0.0.0.0"),
  PORT: defaultedInt(3000, 1, 65535),
  MAX_FILE_SIZE_MB: defaultedInt(25, 1, 100),
  MAX_OCR_PAGES: defaultedInt(8, 1, 25),
  MAX_CONCURRENT_CONVERSIONS: defaultedInt(3, 1, 12),
  MAX_PENDING_CONVERSIONS: defaultedInt(12, 0, 60),
  CONVERSION_CACHE_TTL_SECONDS: defaultedInt(600, 0, 86_400),
  HEALTHCHECK_TIMEOUT_MS: defaultedInt(3000, 500, 15000),
  ACCESS_TOKEN_SECRET: defaultedString(""),
  FREE_DAILY_LIMIT: defaultedInt(8, 1, 50),
  PRO_DAILY_LIMIT: defaultedInt(80, 1, 500),
  PRO_ACCESS_DAYS: defaultedInt(30, 1, 3650),
  TEAM_ACCESS_DAYS: defaultedInt(365, 1, 3650),
  ACCOUNT_SESSION_DAYS: defaultedInt(30, 1, 365),
  PRO_ACCESS_CODES: defaultedString(""),
  TEAM_ACCESS_CODES: defaultedString(""),
  ADMIN_OWNER_EMAILS: defaultedString(""),
  DATA_DIR: defaultedString("./data"),
  BILLING_PRO_MONTHLY_URL: defaultedString(""),
  BILLING_PRO_YEARLY_URL: defaultedString(""),
  BILLING_STARTER_PACK_URL: defaultedString(""),
  BILLING_SUPPORT_URL: defaultedString(""),
  BILLING_WHATSAPP_URL: defaultedString(""),
  PUBLIC_APP_URL: defaultedString(""),
  BILLING_STATE_SECRET: defaultedString(""),
  MERCADOPAGO_ACCESS_TOKEN: defaultedString(""),
  MERCADOPAGO_WEBHOOK_SECRET: defaultedString(""),
  BREVO_API_KEY: defaultedString(""),
  SMTP_HOST: defaultedString(""),
  SMTP_PORT: defaultedInt(587, 1, 65535),
  SMTP_SECURE: z.preprocess(emptyToUndefined, z.coerce.boolean().default(false)),
  SMTP_USER: defaultedString(""),
  SMTP_PASS: defaultedString(""),
  EMAIL_FROM_ADDRESS: defaultedString(""),
  EMAIL_FROM_NAME: defaultedString("vaptdoc"),
  PRO_MONTHLY_PRICE_BRL: defaultedPositiveNumber(19.9, 10000),
  PRO_YEARLY_PRICE_BRL: defaultedPositiveNumber(149.9, 10000),
  STARTER_PACK_PRICE_BRL: defaultedPositiveNumber(9.9, 10000),
  STARTER_ACCESS_DAYS: defaultedInt(7, 1, 3650),
  ASPOSE3D_CLIENT_ID: defaultedString(""),
  ASPOSE3D_CLIENT_SECRET: defaultedString(""),
  ILOVEPDF_PUBLIC_KEY: defaultedString(""),
  ILOVEPDF_SECRET_KEY: defaultedString(""),
  ILOVEPDF_OCR_LANGUAGES: defaultedString("por,eng"),
  CONVERTAPI_TOKEN: defaultedString(""),
  OCR_SPACE_API_KEY: defaultedString(""),
  OCR_SPACE_LANGUAGE: defaultedString("por"),
  LIBREOFFICE_BIN: defaultedString("soffice"),
  PDFTOPPM_BIN: defaultedString("pdftoppm"),
  TESSERACT_BIN: defaultedString("tesseract"),
  FFMPEG_BIN: defaultedString(ffmpegStatic ?? "ffmpeg")
});

export const env = envSchema.parse(process.env);
