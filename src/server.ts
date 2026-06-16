import { createApp } from "./app.js";
import { env } from "./env.js";

const sensitiveStartupValues = [
  env.ACCESS_TOKEN_SECRET,
  env.BILLING_STATE_SECRET,
  env.MERCADOPAGO_ACCESS_TOKEN,
  env.MERCADOPAGO_WEBHOOK_SECRET,
  env.ASPOSE3D_CLIENT_SECRET,
  env.ILOVEPDF_SECRET_KEY,
  env.CONVERTAPI_TOKEN,
  env.OCR_SPACE_API_KEY,
  env.BREVO_API_KEY,
  env.SMTP_PASS,
  env.BACKUP_ENCRYPTION_KEY
]
  .map((value) => String(value ?? "").trim())
  .filter((value) => value.length >= 8);

function redactStartupText(value: string) {
  return sensitiveStartupValues.reduce((accumulator, secret) => accumulator.split(secret).join("[redacted]"), value);
}

function buildSafeStartupError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: redactStartupText(error.message),
      stack: typeof error.stack === "string" ? redactStartupText(error.stack) : undefined
    };
  }

  return {
    message: redactStartupText(String(error))
  };
}

async function main() {
  const app = await createApp();

  await app.listen({
    host: env.HOST,
    port: env.PORT
  });

  app.log.info({
    host: env.HOST,
    port: env.PORT,
    maxConcurrentConversions: env.MAX_CONCURRENT_CONVERSIONS,
    maxPendingConversions: env.MAX_PENDING_CONVERSIONS
  }, "vaptdoc server started.");
}

main().catch((error) => {
  console.error(buildSafeStartupError(error));
  process.exit(1);
});
