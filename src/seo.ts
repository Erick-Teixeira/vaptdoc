import { env } from "./env.js";
import { toolCatalog, toolList, type ToolDefinition, type ToolId } from "./catalog.js";
import { getToolPath } from "./tool-paths.js";

const siteName = "vaptdoc";
const defaultTitle = "vaptdoc | Converta arquivos sem complicação";
const defaultDescription =
  "Converta PDF, DOCX, imagens, áudio, vídeo e modelos 3D com rapidez, segurança e uma experiência limpa em qualquer dispositivo.";
const defaultOgImagePath = "/assets/vaptdoc-logo-transparent.png";

export interface SeoViewModel {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  pageToolId: string;
  pagePath: string;
  softwareApplicationJson: string;
  howToJson: string;
  faqJson: string;
}

function normalizeBaseUrl(input?: string) {
  const fallbackHost =
    env.HOST === "0.0.0.0" || env.HOST === "::" || env.HOST === "::0" ? "localhost" : env.HOST;
  const fallback = `http://${fallbackHost}:${env.PORT}`;
  const candidate = String(input ?? env.PUBLIC_APP_URL ?? "").trim() || fallback;

  try {
    const url = new URL(candidate);
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/u, "");
  } catch {
    return fallback;
  }
}

function absoluteUrl(baseUrl: string, pathname: string) {
  return new URL(pathname, `${normalizeBaseUrl(baseUrl)}/`).toString();
}

function formatToolTitle(tool: ToolDefinition) {
  return `Converter ${tool.label} online | ${siteName}`;
}

function formatToolDescription(tool: ToolDefinition) {
  const leadingCopy = tool.fileHint ?? `Envie um arquivo para ${tool.label.toLowerCase()}.`;
  const supportCopy = tool.description.replace(/\.$/u, "");
  return `${leadingCopy} ${supportCopy}.`;
}

function formatToolPagePath(toolId: ToolId) {
  return getToolPath(toolId);
}

function getReadableFormats(tool: ToolDefinition) {
  const input = tool.inputKinds.map((kind) => kind.toUpperCase()).join(", ");
  const output = tool.outputExtension.toUpperCase();
  return {
    input,
    output
  };
}

function buildHowToSteps(tool?: ToolDefinition) {
  if (!tool) {
    return [
      "Escolha a conversão ideal na grade principal.",
      "Envie seu arquivo e organize a ordem quando necessário.",
      "Revise os ajustes visíveis e inicie a conversão.",
      "Baixe o resultado assim que o processamento terminar."
    ];
  }

  const formats = getReadableFormats(tool);
  const uploadStep = tool.allowsMultipleFiles
    ? `Envie ${
        tool.minFiles && tool.minFiles > 1 ? `pelo menos ${tool.minFiles} arquivos` : "seus arquivos"
      } no formato ${formats.input} e ajuste a ordem visualmente.`
    : `Envie um arquivo no formato ${formats.input} para iniciar ${tool.label.toLowerCase()}.`;
  const optionsStep = Array.isArray(tool.optionFields) && tool.optionFields.length > 0
    ? "Ajuste apenas as opções que aparecem no painel lateral para refinar o resultado."
    : "Revise o painel e avance sem preencher campos desnecessários.";

  return [
    `Abra a ferramenta ${tool.label} no vaptdoc.`,
    uploadStep,
    optionsStep,
    `Converta e baixe o arquivo final em ${formats.output}.`
  ];
}

function buildFaqItems(tool?: ToolDefinition) {
  if (!tool) {
    return [
      {
        question: "Quais arquivos posso converter no vaptdoc?",
        answer: "O vaptdoc suporta fluxos para PDF, Office, imagens, áudio, vídeo e alguns modelos 3D, com cada ferramenta exibindo exatamente os formatos aceitos."
      },
      {
        question: "Preciso instalar algum programa?",
        answer: "Não. O processamento acontece na web, então basta escolher a ferramenta, enviar o arquivo e baixar o resultado."
      },
      {
        question: "Meus arquivos ficam salvos para sempre?",
        answer: "Não. Os arquivos são tratados com limpeza automática e o histórico recente serve apenas para facilitar seus downloads mais recentes."
      }
    ];
  }

  const readableInput = tool.inputKinds.map((kind) => String(kind).toUpperCase()).join(", ");
  const readableOutput = String(tool.outputExtension ?? "").toUpperCase();
  const minFiles = tool.minFiles && tool.minFiles > 1 ? `pelo menos ${tool.minFiles} arquivos` : "um arquivo";

  return [
    {
      question: `O que eu preciso para usar ${tool.label}?`,
      answer: `Basta enviar ${minFiles} no formato ${readableInput} e seguir para a conversão no próprio navegador.`
    },
    {
      question: `${tool.label} gera saída em qual formato?`,
      answer: `Essa ferramenta entrega o resultado final em ${readableOutput}, com os ajustes da operação mostrados somente quando forem necessários.`
    },
    {
      question: `${tool.label} funciona bem no celular?`,
      answer: "Sim. O fluxo foi simplificado para telas móveis, com upload direto, ajustes enxutos e download do resultado sem telas longas."
    }
  ];
}

function buildSoftwareApplicationSchema(baseUrl: string, seo: Pick<SeoViewModel, "title" | "description" | "canonicalUrl">) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: seo.canonicalUrl,
    image: absoluteUrl(baseUrl, defaultOgImagePath),
    description: seo.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL"
    }
  };
}

function buildHowToSchema(seo: Pick<SeoViewModel, "title" | "description" | "canonicalUrl">, tool?: ToolDefinition) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: tool ? `Como ${tool.label.toLowerCase()} no vaptdoc` : "Como converter arquivos no vaptdoc",
    description: seo.description,
    url: seo.canonicalUrl,
    step: buildHowToSteps(tool).map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: text,
      text
    }))
  };
}

function buildFaqSchema(seo: Pick<SeoViewModel, "canonicalUrl">, tool?: ToolDefinition) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: seo.canonicalUrl,
    mainEntity: buildFaqItems(tool).map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

export function getSeoViewModel(baseUrlInput?: string, toolId?: string): SeoViewModel {
  const baseUrl = normalizeBaseUrl(baseUrlInput);
  const tool = toolId && toolId in toolCatalog ? toolCatalog[toolId as ToolId] : undefined;
  const pagePath = tool ? formatToolPagePath(tool.id as ToolId) : "/";
  const canonicalUrl = absoluteUrl(baseUrl, pagePath);
  const title = tool ? formatToolTitle(tool) : defaultTitle;
  const description = tool ? formatToolDescription(tool) : defaultDescription;
  const seo = {
    title,
    description,
    canonicalUrl
  };

  return {
    title,
    description,
    canonicalUrl,
    ogTitle: title,
    ogDescription: description,
    ogImageUrl: absoluteUrl(baseUrl, defaultOgImagePath),
    pageToolId: tool?.id ?? "",
    pagePath,
    softwareApplicationJson: JSON.stringify(buildSoftwareApplicationSchema(baseUrl, seo)),
    howToJson: JSON.stringify(buildHowToSchema(seo, tool)),
    faqJson: JSON.stringify(buildFaqSchema(seo, tool))
  };
}

function replaceTagValue(template: string, selectorId: string, nextValue: string) {
  const pattern = new RegExp(`(<[^>]+id="${selectorId}"[^>]*>)([\\s\\S]*?)(</[^>]+>)`, "u");
  return template.replace(pattern, `$1${nextValue}$3`);
}

function replaceMetaContent(template: string, selectorId: string, nextValue: string) {
  const escapedValue = escapeHtmlAttribute(nextValue);
  return template.replace(
    new RegExp(`(<meta[^>]+id="${selectorId}"[^>]+content=")([^"]*)(")`, "u"),
    `$1${escapedValue}$3`
  );
}

function replaceLinkHref(template: string, selectorId: string, nextValue: string) {
  const escapedValue = escapeHtmlAttribute(nextValue);
  return template.replace(
    new RegExp(`(<link[^>]+id="${selectorId}"[^>]+href=")([^"]*)(")`, "u"),
    `$1${escapedValue}$3`
  );
}

function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function renderSeoHtml(template: string, seo: SeoViewModel) {
  let output = template;
  output = output.replace(/(<title id="seo-title">)([\s\S]*?)(<\/title>)/u, `$1${seo.title}$3`);
  output = replaceMetaContent(output, "seo-description", seo.description);
  output = replaceMetaContent(output, "seo-og-title", seo.ogTitle);
  output = replaceMetaContent(output, "seo-og-description", seo.ogDescription);
  output = replaceMetaContent(output, "seo-og-url", seo.canonicalUrl);
  output = replaceMetaContent(output, "seo-og-image", seo.ogImageUrl);
  output = replaceMetaContent(output, "seo-twitter-title", seo.ogTitle);
  output = replaceMetaContent(output, "seo-twitter-description", seo.ogDescription);
  output = replaceMetaContent(output, "seo-twitter-image", seo.ogImageUrl);
  output = replaceMetaContent(output, "seo-tool-id", seo.pageToolId);
  output = replaceLinkHref(output, "seo-canonical", seo.canonicalUrl);
  output = replaceTagValue(output, "seo-software-schema", seo.softwareApplicationJson);
  output = replaceTagValue(output, "seo-howto-schema", seo.howToJson);
  output = replaceTagValue(output, "seo-faq-schema", seo.faqJson);
  output = replaceTagValue(
    output,
    "vaptdoc-page-data",
    JSON.stringify({
      toolId: seo.pageToolId,
      canonicalUrl: seo.canonicalUrl,
      pagePath: seo.pagePath,
      siteUrl: normalizeBaseUrl(seo.canonicalUrl)
    })
  );
  return output;
}

export function buildSitemapXml(baseUrlInput?: string) {
  const baseUrl = normalizeBaseUrl(baseUrlInput);
  const urls = [
    absoluteUrl(baseUrl, "/"),
    absoluteUrl(baseUrl, "/privacy.html"),
    absoluteUrl(baseUrl, "/terms.html"),
    ...toolList.map((tool) => absoluteUrl(baseUrl, formatToolPagePath(tool.id as ToolId)))
  ];

  const rows = urls
    .map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
}

export function buildRobotsTxt(baseUrlInput?: string) {
  const baseUrl = normalizeBaseUrl(baseUrlInput);
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /checkout/",
    `Sitemap: ${absoluteUrl(baseUrl, "/sitemap.xml")}`
  ].join("\n");
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
