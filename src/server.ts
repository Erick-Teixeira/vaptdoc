import { createApp } from "./app.js";
import { env } from "./env.js";

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
  console.error(error);
  process.exit(1);
});
