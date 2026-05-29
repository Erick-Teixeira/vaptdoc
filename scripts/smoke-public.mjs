const baseUrl = (process.env.SMOKE_BASE_URL || "https://transmutalab.up.railway.app").replace(/\/+$/u, "");

async function assertOk(pathname, check) {
  const response = await fetch(`${baseUrl}${pathname}`);
  if (!response.ok) {
    throw new Error(`${pathname} respondeu ${response.status}`);
  }

  const body = await response.text();
  if (check && !check(body)) {
    throw new Error(`${pathname} nao passou na validacao de conteudo`);
  }
}

async function main() {
  await assertOk("/health", (body) => body.includes('"status":"ok"') && body.includes('"service":"vaptdoc"'));
  await assertOk("/readyz", (body) => body.includes('"status":"ready"') || body.includes('"status":"busy"'));
  await assertOk("/api/tools", (body) => body.includes('"pdf-to-docx"') && body.includes('"3d-convert"'));
  await assertOk("/", (body) => body.includes("vaptdoc") && body.includes("tool-search"));
  await assertOk("/ferramenta/pdf-to-docx", (body) => body.includes("Converter PDF para DOCX online | vaptdoc"));
  await assertOk("/sitemap.xml", (body) => body.includes("/ferramenta/pdf-to-docx") && body.includes("/privacy.html"));
  await assertOk("/robots.txt", (body) => body.includes("Disallow: /api/") && body.includes("Sitemap:"));

  console.log(`Smoke publico concluido com sucesso em ${baseUrl}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
