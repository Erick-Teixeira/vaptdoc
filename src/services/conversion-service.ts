import { createHash } from "node:crypto";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import ConvertAPI from "convertapi";
import { AlignmentType, BorderStyle, Document, Packer, Paragraph, TextRun } from "docx";
import { PDFParse } from "pdf-parse";
import sharp from "sharp";
import { toolCatalog, type SupportedKind, type ToolDefinition, type ToolId } from "../catalog.js";
import { env } from "../env.js";
import type {
  CompressionLevel,
  ConversionOptions,
  ConversionRequest,
  ConversionResult,
  EditPosition,
  HtmlPdfPageOrientation,
  HtmlPdfPageSize,
  ImagePdfOrientation,
  ImagePdfPageSize,
  PdfJpgMode,
  SplitMode,
  TextLayoutMode,
  UploadedAsset
} from "../types.js";
import { AppError } from "../utils/errors.js";
import { readBuffer, withTempWorkspace, writeBuffer } from "../utils/fs.js";
import { assertToolCompatibility, detectUpload, type DetectedUpload } from "../utils/file-validation.js";
import { runCommand } from "../utils/process.js";
import {
  formatTextByLayout,
  normalizeBlockText,
  parseStructuredSections,
  splitLines,
  type ExtractedTextSource,
  type ParsedStructuredSection
} from "../utils/text-layout.js";
import {
  pickAspose3dClient,
  type Aspose3dClient,
  type Aspose3dOutputFormat
} from "./aspose-3d-client.js";
import {
  ILovePdfSdkClient,
  type ILovePdfBinaryResult,
  type ILovePdfClient,
  type ILovePdfEditTextParams,
  type ILovePdfTaskFile,
  type ILovePdfTaskType,
  type PdfaConformance
} from "./ilovepdf-client.js";

interface OcrSpaceResponse {
  IsErroredOnProcessing: boolean;
  ParsedResults?: Array<{ ParsedText?: string }>;
  ErrorMessage?: string | string[];
}

interface UploadHandle {
  FileName: string;
}

interface ConvertApiResult {
  saveFiles(directory: string): Promise<string[]>;
}

interface ConvertApiClient {
  upload(stream: Readable, fileName: string): Promise<UploadHandle>;
  convert(targetFormat: string, params: Record<string, unknown>): Promise<ConvertApiResult>;
}

interface ConversionServiceDeps {
  runCommandImpl?: typeof runCommand;
  fetchImpl?: typeof fetch;
  convertApiClient?: ConvertApiClient | null;
  ilovePdfClient?: ILovePdfClient | null;
  aspose3dClient?: Aspose3dClient | null;
}

interface ConversionCacheEntry {
  expiresAt: number;
  storedAt: number;
  result: ConversionResult;
}

interface ExternalProbeSnapshot {
  reachable: boolean;
  responseTimeMs: number | null;
  statusCode: number | null;
  checkedAt: string | null;
  note?: string;
}

export interface ConversionServiceHealthSnapshot {
  ilovePdf: {
    configured: boolean;
    status: "configured" | "fallback-only";
    ocrLanguages: string[];
    probe: ExternalProbeSnapshot;
  };
  aspose3d: {
    cloudConfigured: boolean;
    localLibraryAvailable: boolean;
    localLibraryStatus: "available" | "unavailable";
    note: string;
    probe: ExternalProbeSnapshot;
  };
  cache: {
    enabled: boolean;
    ttlSeconds: number;
    entries: number;
    hits: number;
    misses: number;
  };
}

interface PreparedUpload {
  upload: UploadedAsset;
  detected: DetectedUpload;
  safeFileName: string;
}

const simpleRangesPattern = /^\d+(?:-\d+)?(?:\s*,\s*\d+(?:-\d+)?)*$/u;
const pageSelectionPattern = /^(?:all|(?:-?\d+|end)(?:-(?:-?\d+|end))?)(?:\s*,\s*(?:all|(?:-?\d+|end)(?:-(?:-?\d+|end))?))*$/u;
const ilovePdfProbeUrl = "https://api.ilovepdf.com/v1/start/compress";
const asposeProbeUrl = "https://api.aspose.cloud/connect/token";
const pdfaConformances: PdfaConformance[] = [
  "pdfa-1b",
  "pdfa-1a",
  "pdfa-2b",
  "pdfa-2u",
  "pdfa-2a",
  "pdfa-3b",
  "pdfa-3u",
  "pdfa-3a"
];

type Frontend3dOutputFormat = Aspose3dOutputFormat;

interface Aspose3dSaveOptions {
  readonly [key: string]: unknown;
  setFileName?(value: string): void;
}

interface Aspose3dFileFormat {
  createSaveOptions(): Aspose3dSaveOptions;
  getExtension?(): string;
  getExtensions?(): string[];
  canExport?: boolean;
  CanExport?: boolean;
  getCanExport?(): boolean;
}

interface Aspose3dScene {
  open(fileName: string): void | Promise<void>;
  save(fileName: string, options: Aspose3dSaveOptions | Aspose3dFileFormat): void | Promise<void>;
}

interface Aspose3dPolygonModifier {
  triangulate(scene: Aspose3dScene): void | Promise<void>;
}

interface Aspose3dNamespace {
  Scene: new () => Aspose3dScene;
  FileFormat: Record<string, unknown> & {
    getFormatByExtension?(extensionName: string): Aspose3dFileFormat | null;
  };
  PolygonModifier: Aspose3dPolygonModifier;
}

const aspose3dModuleName = "aspose.3d";
const localAspose3dFormatMap: Record<
  Frontend3dOutputFormat,
  {
    propertyNames: readonly string[];
    extensionNames: readonly string[];
  }
> = {
  stl: {
    propertyNames: ["STL_BINARY", "StlBinary", "STLASCII"],
    extensionNames: [".stl"]
  },
  obj: {
    propertyNames: ["WavefrontOBJ", "WAVEFRONTOBJ"],
    extensionNames: [".obj"]
  },
  fbx: {
    propertyNames: ["FBX7500_BINARY", "FBX7400_BINARY", "FBX7300_BINARY", "FBX7200_BINARY", "FBX_BINARY"],
    extensionNames: [".fbx"]
  },
  glb: {
    propertyNames: ["GLTF_BINARY", "GLB"],
    extensionNames: [".glb"]
  },
  gltf: {
    propertyNames: ["GLTF"],
    extensionNames: [".gltf"]
  },
  dae: {
    propertyNames: ["Collada", "COLLADA"],
    extensionNames: [".dae"]
  },
  ply: {
    propertyNames: ["PLY"],
    extensionNames: [".ply"]
  },
  amf: {
    propertyNames: ["AMF"],
    extensionNames: [".amf"]
  },
  "3ds": {
    propertyNames: ["Discreet3DS", "DISCREET3DS"],
    extensionNames: [".3ds"]
  },
  u3d: {
    propertyNames: ["Universal3D", "UNIVERSAL3D", "U3D"],
    extensionNames: [".u3d"]
  },
  drc: {
    propertyNames: ["Draco", "DRACO"],
    extensionNames: [".drc"]
  },
  rvm: {
    propertyNames: ["RVM_BINARY", "RVM_TEXT", "RVM"],
    extensionNames: [".rvm"]
  },
  pdf: {
    propertyNames: ["PDF"],
    extensionNames: [".pdf"]
  }
};

function ensureMeaningfulText(value: string) {
  const normalized = normalizeBlockText(value);
  if (normalized.length < 16) {
    throw new AppError("Nao foi possivel extrair texto suficiente do arquivo enviado.", 422, "TEXT_EXTRACTION_FAILED");
  }
  return normalized;
}

function parseIlovePdfLanguages(value: string) {
  const languages = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return languages.length > 0 ? languages : ["por", "eng"];
}

function pickILovePdfClient(explicitClient?: ILovePdfClient | null) {
  if (explicitClient !== undefined) {
    return explicitClient;
  }

  if (!env.ILOVEPDF_PUBLIC_KEY || !env.ILOVEPDF_SECRET_KEY) {
    return null;
  }

  return new ILovePdfSdkClient(env.ILOVEPDF_PUBLIC_KEY, env.ILOVEPDF_SECRET_KEY);
}

function pickConvertApiClient(explicitClient?: ConvertApiClient | null) {
  if (explicitClient !== undefined) {
    return explicitClient;
  }

  if (!env.CONVERTAPI_TOKEN) {
    return null;
  }

  return new ConvertAPI(env.CONVERTAPI_TOKEN) as unknown as ConvertApiClient;
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function asRecord(value: unknown) {
  if ((typeof value === "object" || typeof value === "function") && value !== null) {
    return value as Record<string, unknown>;
  }

  return undefined;
}

function isAspose3dFileFormat(value: unknown): value is Aspose3dFileFormat {
  return (
    (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    typeof (value as Aspose3dFileFormat).createSaveOptions === "function"
  );
}

function isAspose3dNamespace(value: unknown): value is Aspose3dNamespace {
  const record = asRecord(value);
  const polygonModifier = asRecord(record?.PolygonModifier);

  return Boolean(
    record &&
      typeof record.Scene === "function" &&
      record.FileFormat &&
      asRecord(record.FileFormat) &&
      polygonModifier &&
      typeof polygonModifier.triangulate === "function"
  );
}

async function loadAspose3dNamespace() {
  try {
    const imported = (await import(aspose3dModuleName)) as Record<string, unknown>;
    const defaultExport = asRecord(imported.default);
    const candidates = [defaultExport?.threed, defaultExport, imported.threed, imported];

    for (const candidate of candidates) {
      if (isAspose3dNamespace(candidate)) {
        return candidate;
      }
    }
  } catch (error) {
    throw new AppError(
      `A biblioteca aspose.3d nao esta disponivel neste ambiente. ${toErrorMessage(error)}`,
      503,
      "ASPOSE3D_LOCAL_UNAVAILABLE"
    );
  }

  throw new AppError(
    "A biblioteca aspose.3d foi carregada, mas nao expoe Scene, FileFormat e PolygonModifier como esperado.",
    503,
    "ASPOSE3D_LOCAL_UNAVAILABLE"
  );
}

function normalize3dOutputFormat(value: unknown): Frontend3dOutputFormat {
  const normalized = String(value ?? "stl")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/gu, "");

  const map: Record<string, Frontend3dOutputFormat> = {
    STL: "stl",
    OBJ: "obj",
    FBX: "fbx",
    GLB: "glb",
    GLTF: "gltf",
    DAE: "dae",
    COLLADA: "dae",
    PLY: "ply",
    AMF: "amf",
    "3DS": "3ds",
    U3D: "u3d",
    DRC: "drc",
    DRACO: "drc",
    RVM: "rvm",
    PDF: "pdf"
  };

  const targetFormat = map[normalized];
  if (!targetFormat) {
    throw new AppError("Formato de saida 3D invalido.", 400, "INVALID_OPTION");
  }

  return targetFormat;
}

function resolveLocalAspose3dFormat(namespace: Aspose3dNamespace, outputFormat: Frontend3dOutputFormat) {
  const formatDefinition = localAspose3dFormatMap[outputFormat];

  for (const propertyName of formatDefinition.propertyNames) {
    const candidate = namespace.FileFormat[propertyName];
    if (isAspose3dFileFormat(candidate)) {
      return candidate;
    }
  }

  if (typeof namespace.FileFormat.getFormatByExtension === "function") {
    for (const extensionName of formatDefinition.extensionNames) {
      const candidate = namespace.FileFormat.getFormatByExtension(extensionName);
      if (candidate) {
        return candidate;
      }
    }
  }

  throw new AppError(
    `A biblioteca aspose.3d nao encontrou um FileFormat compativel para ${outputFormat.toUpperCase()}.`,
    422,
    "ASPOSE3D_LOCAL_FORMAT_UNAVAILABLE"
  );
}

function canExportWithLocalAspose(fileFormat: Aspose3dFileFormat) {
  const booleanCandidates = [fileFormat.canExport, fileFormat.CanExport];

  for (const candidate of booleanCandidates) {
    if (typeof candidate === "boolean") {
      return candidate;
    }
  }

  if (typeof fileFormat.getCanExport === "function") {
    const candidate = fileFormat.getCanExport();
    if (typeof candidate === "boolean") {
      return candidate;
    }
  }

  return true;
}

function resolveLocalAspose3dExtension(fileFormat: Aspose3dFileFormat, outputFormat: Frontend3dOutputFormat) {
  const extensions = typeof fileFormat.getExtensions === "function" ? fileFormat.getExtensions() : undefined;
  const firstExtension = Array.isArray(extensions) ? extensions.find((item) => typeof item === "string") : undefined;
  const fallbackExtension = typeof fileFormat.getExtension === "function" ? fileFormat.getExtension() : undefined;
  const extension = firstExtension ?? fallbackExtension ?? localAspose3dFormatMap[outputFormat].extensionNames[0];

  return extension.replace(/^\./u, "").toLowerCase();
}

function configureLocalAspose3dSaveOptions(saveOptions: Aspose3dSaveOptions, outputFileName: string) {
  if (typeof saveOptions.setFileName === "function") {
    saveOptions.setFileName(outputFileName);
  }

  return saveOptions;
}

function extensionForKind(kind: SupportedKind) {
  const map: Record<SupportedKind, string> = {
    pdf: "pdf",
    doc: "doc",
    docx: "docx",
    xls: "xls",
    xlsx: "xlsx",
    ppt: "ppt",
    pptx: "pptx",
    odt: "odt",
    ods: "ods",
    odp: "odp",
    jpg: "jpg",
    jpeg: "jpeg",
    png: "png",
    tif: "tif",
    tiff: "tiff",
    html: "html",
    mp4: "mp4",
    stl: "stl",
    obj: "obj",
    "3mf": "3mf",
    step: "step",
    fbx: "fbx",
    dae: "dae",
    amf: "amf",
    ply: "ply",
    glb: "glb",
    gltf: "gltf",
    "3ds": "3ds",
    u3d: "u3d",
    drc: "drc",
    rvm: "rvm",
    usd: "usd",
    usdz: "usdz"
  };

  return map[kind];
}

function contentTypeForExtension(extension: string) {
  const normalized = extension.toLowerCase();
  const map: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain; charset=utf-8",
    csv: "text/csv; charset=utf-8",
    json: "application/json; charset=utf-8",
    zip: "application/zip",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    mp3: "audio/mpeg",
    stl: "model/stl",
    obj: "model/obj",
    "3mf": "model/3mf",
    step: "application/step",
    fbx: "application/octet-stream",
    dae: "model/vnd.collada+xml",
    amf: "application/amf+xml",
    ply: "application/octet-stream",
    glb: "model/gltf-binary",
    gltf: "model/gltf+json",
    "3ds": "application/x-3ds",
    u3d: "model/u3d",
    drc: "application/octet-stream",
    rvm: "application/octet-stream",
    usd: "application/octet-stream",
    usdz: "application/octet-stream"
  };

  return map[normalized] ?? "application/octet-stream";
}

function sanitizeExtensionCandidate(candidate: string | undefined) {
  if (!candidate) {
    return undefined;
  }

  const normalized = candidate
    .trim()
    .toLowerCase()
    .replace(/^[.\[\s"'`]+/u, "")
    .replace(/[.\s"'`\]]+$/u, "");

  if (!/^[a-z0-9]{2,10}$/u.test(normalized)) {
    return undefined;
  }

  return normalized;
}

function resolveOutputExtensionFromMeta(meta: ILovePdfBinaryResult["meta"], fallbackExtension: string) {
  const rawOutputExtensions = meta.output_extensions as unknown;

  if (Array.isArray(rawOutputExtensions)) {
    const direct = sanitizeExtensionCandidate(rawOutputExtensions.find((item) => typeof item === "string"));
    if (direct) {
      return direct;
    }
  }

  if (typeof rawOutputExtensions === "string") {
    const trimmed = rawOutputExtensions.trim();

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        const parsedExtension = sanitizeExtensionCandidate(parsed.find((item) => typeof item === "string"));
        if (parsedExtension) {
          return parsedExtension;
        }
      }
    } catch {
      // Keep falling back below.
    }

    const fromList = sanitizeExtensionCandidate(trimmed.split(",")[0]);
    if (fromList) {
      return fromList;
    }
  }

  const fromDownloadName = sanitizeExtensionCandidate(path.extname(meta.download_filename ?? "").slice(1));
  return fromDownloadName ?? fallbackExtension.toLowerCase();
}

function primaryStem(preparedUploads: PreparedUpload[]) {
  return preparedUploads[0]?.detected.safeStem ?? "arquivo";
}

function toILovePdfFiles(
  preparedUploads: PreparedUpload[],
  extraParams?: (prepared: PreparedUpload) => ILovePdfTaskFile["params"] | undefined
) {
  return preparedUploads.map((prepared) => ({
    buffer: prepared.upload.buffer,
    fileName: prepared.safeFileName,
    params: extraParams?.(prepared)
  }));
}

function cloneConversionResult(result: ConversionResult): ConversionResult {
  return {
    ...result,
    data: Buffer.from(result.data),
    warnings: result.warnings ? [...result.warnings] : undefined
  };
}

function normalizeOptionsForCache(options: ConversionOptions | undefined): string {
  if (!options) {
    return "{}";
  }

  const entries = Object.entries(options as Record<string, unknown>)
    .filter(([, value]) => value !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));

  return JSON.stringify(Object.fromEntries(entries));
}

export class ConversionService {
  private readonly runCommandImpl: typeof runCommand;
  private readonly fetchImpl: typeof fetch;
  private readonly convertApiClient: ConvertApiClient | null;
  private readonly ilovePdfClient: ILovePdfClient | null;
  private readonly aspose3dClient: Aspose3dClient | null;
  private readonly ilovePdfLanguages: string[];
  private readonly cacheTtlMs: number;
  private readonly conversionCache = new Map<string, ConversionCacheEntry>();
  private cacheHits = 0;
  private cacheMisses = 0;
  private lastHealthSnapshot: ConversionServiceHealthSnapshot | null = null;
  private lastHealthSnapshotExpiresAt = 0;

  constructor(deps: ConversionServiceDeps = {}) {
    this.runCommandImpl = deps.runCommandImpl ?? runCommand;
    this.fetchImpl = deps.fetchImpl ?? fetch;
    this.convertApiClient = pickConvertApiClient(deps.convertApiClient);
    this.ilovePdfClient = pickILovePdfClient(deps.ilovePdfClient);
    this.aspose3dClient = pickAspose3dClient(deps.aspose3dClient, this.fetchImpl);
    this.ilovePdfLanguages = parseIlovePdfLanguages(env.ILOVEPDF_OCR_LANGUAGES);
    this.cacheTtlMs = Math.max(0, env.CONVERSION_CACHE_TTL_SECONDS) * 1000;

    if (this.ilovePdfClient) {
      console.info("[vaptdoc] iLovePDF provider configured for document workflows.");
    } else {
      console.warn("[vaptdoc] iLovePDF provider unavailable. Local fallbacks remain active where possible.");
    }

    if (this.aspose3dClient) {
      console.info("[vaptdoc] Aspose 3D provider configured for model conversion workflows.");
    }
  }

  private buildCacheKey(toolId: ToolId, preparedUploads: PreparedUpload[], options: ConversionOptions | undefined) {
    const hash = createHash("sha256");
    hash.update(toolId);
    hash.update("\u0000");
    hash.update(normalizeOptionsForCache(options));

    for (const prepared of preparedUploads) {
      hash.update("\u0000");
      hash.update(prepared.detected.kind);
      hash.update("\u0000");
      hash.update(prepared.upload.buffer);
    }

    return hash.digest("hex");
  }

  private pruneCache(now = Date.now()) {
    for (const [key, entry] of this.conversionCache.entries()) {
      if (entry.expiresAt <= now) {
        this.conversionCache.delete(key);
      }
    }

    const maxEntries = 48;
    while (this.conversionCache.size > maxEntries) {
      const oldestKey = this.conversionCache.keys().next().value;
      if (!oldestKey) {
        break;
      }

      this.conversionCache.delete(oldestKey);
    }
  }

  private getCachedResult(cacheKey: string) {
    if (!this.cacheTtlMs) {
      return null;
    }

    const entry = this.conversionCache.get(cacheKey);
    if (!entry) {
      this.cacheMisses += 1;
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      this.conversionCache.delete(cacheKey);
      this.cacheMisses += 1;
      return null;
    }

    this.cacheHits += 1;
    this.conversionCache.delete(cacheKey);
    this.conversionCache.set(cacheKey, entry);
    return cloneConversionResult(entry.result);
  }

  private storeCachedResult(cacheKey: string, result: ConversionResult) {
    if (!this.cacheTtlMs) {
      return;
    }

    const now = Date.now();
    this.pruneCache(now);
    this.conversionCache.set(cacheKey, {
      storedAt: now,
      expiresAt: now + this.cacheTtlMs,
      result: cloneConversionResult(result)
    });
  }

  private async probeEndpoint(input: RequestInfo | URL, init: RequestInit = {}): Promise<ExternalProbeSnapshot> {
    const startedAt = performance.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.HEALTHCHECK_TIMEOUT_MS);

    try {
      const response = await this.fetchImpl(input, {
        ...init,
        signal: controller.signal
      });

      return {
        reachable: response.ok || response.status < 500,
        responseTimeMs: Math.round(performance.now() - startedAt),
        statusCode: response.status,
        checkedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        reachable: false,
        responseTimeMs: null,
        statusCode: null,
        checkedAt: new Date().toISOString(),
        note: toErrorMessage(error).slice(0, 160)
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private async probeILovePdf(): Promise<ExternalProbeSnapshot> {
    if (!this.ilovePdfClient) {
      return {
        reachable: false,
        responseTimeMs: null,
        statusCode: null,
        checkedAt: null,
        note: "Provider nao configurado."
      };
    }

    return this.probeEndpoint(ilovePdfProbeUrl, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });
  }

  private async probeAsposeCloud(): Promise<ExternalProbeSnapshot> {
    if (!env.ASPOSE3D_CLIENT_ID || !env.ASPOSE3D_CLIENT_SECRET) {
      return {
        reachable: false,
        responseTimeMs: null,
        statusCode: null,
        checkedAt: null,
        note: "Provider cloud nao configurado."
      };
    }

    return this.probeEndpoint(asposeProbeUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: env.ASPOSE3D_CLIENT_ID,
        client_secret: env.ASPOSE3D_CLIENT_SECRET
      })
    });
  }

  async getHealthSnapshot(): Promise<ConversionServiceHealthSnapshot> {
    if (this.lastHealthSnapshot && Date.now() < this.lastHealthSnapshotExpiresAt) {
      return this.lastHealthSnapshot;
    }

    let localLibraryAvailable = false;
    let localLibraryStatus: "available" | "unavailable" = "unavailable";
    let note = "Biblioteca local indisponivel.";

    try {
      await loadAspose3dNamespace();
      localLibraryAvailable = true;
      localLibraryStatus = "available";
      note = "Biblioteca local pronta para exportacoes 3D suportadas.";
    } catch (error) {
      note = toErrorMessage(error).slice(0, 180);
    }

    this.pruneCache();
    const [ilovePdfProbe, asposeProbe] = await Promise.all([this.probeILovePdf(), this.probeAsposeCloud()]);

    const snapshot = {
      ilovePdf: {
        configured: Boolean(this.ilovePdfClient),
        status: this.ilovePdfClient ? "configured" : "fallback-only",
        ocrLanguages: this.ilovePdfLanguages,
        probe: ilovePdfProbe
      },
      aspose3d: {
        cloudConfigured: Boolean(this.aspose3dClient),
        localLibraryAvailable,
        localLibraryStatus,
        note,
        probe: asposeProbe
      },
      cache: {
        enabled: this.cacheTtlMs > 0,
        ttlSeconds: Math.round(this.cacheTtlMs / 1000),
        entries: this.conversionCache.size,
        hits: this.cacheHits,
        misses: this.cacheMisses
      }
    } satisfies ConversionServiceHealthSnapshot;

    this.lastHealthSnapshot = snapshot;
    this.lastHealthSnapshotExpiresAt = Date.now() + 20_000;
    return snapshot;
  }

  async convert({ toolId, uploads, options }: ConversionRequest): Promise<ConversionResult> {
    const preparedUploads = await Promise.all(
      uploads.map(async (upload) => {
        const detected = await detectUpload(upload.buffer, upload.filename, upload.declaredMime);
        const ext = path.extname(upload.filename).toLowerCase() || `.${extensionForKind(detected.kind)}`;

        return {
          upload,
          detected,
          safeFileName: `${detected.safeStem}${ext}`
        } satisfies PreparedUpload;
      })
    );

    assertToolCompatibility(
      toolId,
      preparedUploads.map((item) => item.detected.kind)
    );

    const cacheKey = this.buildCacheKey(toolId, preparedUploads, options);
    const cachedResult = this.getCachedResult(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    let result: ConversionResult;

    switch (toolId) {
      case "3d-convert":
        result = await this.convert3dModel(preparedUploads[0], options);
        break;
      case "jpg-to-png":
      case "jpeg-to-png":
        result = await this.convertImageToPng(preparedUploads[0].upload.buffer, preparedUploads[0].detected.safeStem);
        break;
      case "png-to-jpg":
        result = await this.convertPngToJpeg(preparedUploads[0].upload.buffer, preparedUploads[0].detected.safeStem, "jpg");
        break;
      case "png-to-jpeg":
        result = await this.convertPngToJpeg(preparedUploads[0].upload.buffer, preparedUploads[0].detected.safeStem, "jpeg");
        break;
      case "mp4-to-mp3":
        result = await this.convertMp4ToMp3(preparedUploads[0].upload.buffer, preparedUploads[0].detected.safeStem);
        break;
      case "pdf-to-text":
        result = await this.convertPdfToText(
          preparedUploads[0].upload.buffer,
          preparedUploads[0].detected.safeStem,
          this.resolveTextLayout(toolId, options?.textLayout)
        );
        break;
      case "pdf-to-docx":
        result = await this.convertPdfToDocx(
          preparedUploads[0].upload.buffer,
          preparedUploads[0].detected.safeStem,
          this.resolveTextLayout(toolId, options?.textLayout)
        );
        break;
      case "docx-to-pdf":
      case "office-to-pdf":
        result = await this.convertOfficeToPdf(preparedUploads[0]);
        break;
      case "pdf-merge":
        result = await this.convertPdfMerge(preparedUploads);
        break;
      case "pdf-split":
        result = await this.convertPdfSplit(preparedUploads[0], options);
        break;
      case "pdf-compress":
        result = await this.convertPdfCompress(preparedUploads[0], options);
        break;
      case "pdf-ocr":
        result = await this.convertPdfOcr(preparedUploads[0]);
        break;
      case "pdf-to-jpg":
        result = await this.convertPdfToJpg(preparedUploads[0], options);
        break;
      case "image-to-pdf":
        result = await this.convertImagesToPdf(preparedUploads, options);
        break;
      case "pdf-to-pdfa":
        result = await this.convertPdfToPdfa(preparedUploads[0], options);
        break;
      case "html-to-pdf":
        result = await this.convertHtmlToPdf(preparedUploads[0], options);
        break;
      case "pdf-validate-pdfa":
        result = await this.validatePdfa(preparedUploads[0], options);
        break;
      case "pdf-rotate":
        result = await this.rotatePdf(preparedUploads[0], options);
        break;
      case "pdf-unlock":
        result = await this.unlockPdf(preparedUploads[0], options);
        break;
      case "pdf-protect":
        result = await this.protectPdf(preparedUploads[0], options);
        break;
      case "pdf-watermark":
        result = await this.watermarkPdf(preparedUploads[0], options);
        break;
      case "pdf-page-numbers":
        result = await this.numberPdfPages(preparedUploads[0], options);
        break;
      case "pdf-repair":
        result = await this.repairPdf(preparedUploads[0]);
        break;
      case "pdf-extract":
        result = await this.extractPdf(preparedUploads[0], options);
        break;
      case "pdf-edit":
        result = await this.editPdf(preparedUploads[0], options);
        break;
      default: {
        const unreachable: never = toolId;
        throw new AppError(`Ferramenta nao implementada: ${unreachable}`, 400, "UNKNOWN_TOOL");
      }
    }

    this.storeCachedResult(cacheKey, result);
    return cloneConversionResult(result);
  }

  private getOptionValue(options: ConversionOptions | undefined, key: keyof ConversionOptions | string) {
    return (options as Record<string, unknown> | undefined)?.[key];
  }

  private readStringOption(
    options: ConversionOptions | undefined,
    key: keyof ConversionOptions | string,
    label: string,
    config: { maxLength?: number; defaultValue?: string; allowEmpty?: boolean } = {}
  ) {
    const { maxLength = 200, defaultValue, allowEmpty = false } = config;
    const raw = this.getOptionValue(options, key);

    if (raw === undefined || raw === null) {
      return defaultValue;
    }

    const value = String(raw).trim();
    if (!value) {
      return allowEmpty ? "" : defaultValue;
    }

    if (value.length > maxLength) {
      throw new AppError(`${label} excede o limite permitido.`, 400, "INVALID_OPTION");
    }

    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) {
      throw new AppError(`${label} contem caracteres invalidos.`, 400, "INVALID_OPTION");
    }

    return value;
  }

  private readBooleanOption(
    options: ConversionOptions | undefined,
    key: keyof ConversionOptions | string,
    defaultValue = false
  ) {
    const raw = this.getOptionValue(options, key);

    if (typeof raw === "boolean") {
      return raw;
    }

    if (typeof raw === "string") {
      const normalized = raw.trim().toLowerCase();
      if (["true", "1", "on", "yes", "sim"].includes(normalized)) {
        return true;
      }

      if (["false", "0", "off", "no", "nao"].includes(normalized)) {
        return false;
      }
    }

    return defaultValue;
  }

  private readIntegerOption(
    options: ConversionOptions | undefined,
    key: keyof ConversionOptions | string,
    label: string,
    config: { min: number; max: number; defaultValue?: number; required?: boolean }
  ) {
    const raw = this.getOptionValue(options, key);
    if (raw === undefined || raw === null || raw === "") {
      if (config.required && config.defaultValue === undefined) {
        throw new AppError(`${label} e obrigatorio.`, 400, "INVALID_OPTION");
      }

      return config.defaultValue;
    }

    const numeric = typeof raw === "number" ? raw : Number(String(raw).trim());
    if (!Number.isInteger(numeric)) {
      throw new AppError(`${label} precisa ser um numero inteiro valido.`, 400, "INVALID_OPTION");
    }

    if (numeric < config.min || numeric > config.max) {
      throw new AppError(`${label} precisa ficar entre ${config.min} e ${config.max}.`, 400, "INVALID_OPTION");
    }

    return numeric;
  }

  private readEnumOption<T extends string>(
    options: ConversionOptions | undefined,
    key: keyof ConversionOptions | string,
    label: string,
    allowedValues: readonly T[],
    defaultValue: T
  ): T {
    const candidate = this.readStringOption(options, key, label, { defaultValue }) as T;

    if (!allowedValues.includes(candidate)) {
      throw new AppError(`${label} recebeu um valor invalido.`, 400, "INVALID_OPTION");
    }

    return candidate;
  }

  private readSimpleRangesOption(options: ConversionOptions | undefined, key: keyof ConversionOptions | string, label: string) {
    const value = this.readStringOption(options, key, label, { maxLength: 120 });
    if (!value) {
      return undefined;
    }

    if (!simpleRangesPattern.test(value)) {
      throw new AppError(`${label} precisa seguir o formato 1-3,5-8.`, 400, "INVALID_OPTION");
    }

    return value.replace(/\s+/gu, "");
  }

  private readPageSelectionOption(options: ConversionOptions | undefined, key: keyof ConversionOptions | string, label: string) {
    const value = this.readStringOption(options, key, label, { maxLength: 120 });
    if (!value) {
      return undefined;
    }

    if (!pageSelectionPattern.test(value)) {
      throw new AppError(`${label} precisa seguir um formato valido, como 1-3,5 ou 3-end.`, 400, "INVALID_OPTION");
    }

    return value.replace(/\s+/gu, "");
  }

  private readPasswordOption(
    options: ConversionOptions | undefined,
    key: keyof ConversionOptions | string,
    label: string,
    config: { required?: boolean; minLength?: number } = {}
  ) {
    const { required = false, minLength = 1 } = config;
    const value = this.readStringOption(options, key, label, { maxLength: 128 });

    if (!value) {
      if (required) {
        throw new AppError(`${label} e obrigatoria.`, 400, "INVALID_OPTION");
      }

      return undefined;
    }

    if (value.length < minLength) {
      throw new AppError(`${label} precisa ter pelo menos ${minLength} caracteres.`, 400, "INVALID_OPTION");
    }

    return value;
  }

  private resolveTextLayout(toolId: ToolId, requested?: TextLayoutMode): TextLayoutMode {
    const tool = toolCatalog[toolId] as ToolDefinition;
    const supported = tool.textLayoutSupport;

    if (!supported?.enabled) {
      return "blocks";
    }

    return requested === "lines" ? "lines" : supported.defaultMode;
  }

  private requireILovePdf(toolLabel: string) {
    if (!this.ilovePdfClient) {
      throw new AppError(
        `${toolLabel} depende da API do iLovePDF e esta indisponivel no ambiente atual.`,
        503,
        "ILOVEPDF_UNAVAILABLE"
      );
    }

    return this.ilovePdfClient;
  }

  private requireAspose3d(toolLabel: string) {
    if (!this.aspose3dClient) {
      throw new AppError(
        `${toolLabel} depende da Aspose 3D Cloud e esta indisponivel no ambiente atual.`,
        503,
        "ASPOSE3D_UNAVAILABLE"
      );
    }

    return this.aspose3dClient;
  }

  private buildTaskDownload(
    taskResult: ILovePdfBinaryResult,
    stem: string,
    fallbackExtension: string,
    provider: string,
    summary: string,
    warnings?: string[]
  ): ConversionResult {
    const downloadName = taskResult.meta.download_filename?.toLowerCase() ?? "";
    const outputExtension = resolveOutputExtensionFromMeta(taskResult.meta, fallbackExtension);
    const shouldZip = taskResult.meta.output_filenumber > 1 || downloadName.endsWith(".zip");
    const finalExtension = shouldZip ? "zip" : outputExtension;

    return {
      data: taskResult.data,
      filename: `${stem}.${finalExtension}`,
      contentType: contentTypeForExtension(finalExtension),
      provider,
      summary,
      warnings
    };
  }

  private async runILovePdfTask(
    taskType: ILovePdfTaskType,
    preparedUploads: PreparedUpload[],
    processParams: Record<string, unknown>,
    provider: string,
    summary: string,
    fallbackStem: string,
    fallbackExtension: string,
    fileParams?: (prepared: PreparedUpload) => ILovePdfTaskFile["params"] | undefined
  ) {
    const client = this.requireILovePdf(toolCatalog[providerToToolId(provider)].label);
    const taskResult = await client.runTask(taskType, toILovePdfFiles(preparedUploads, fileParams), processParams);
    return this.buildTaskDownload(taskResult, fallbackStem, fallbackExtension, provider, summary);
  }

  private async convert3dModelWithLocalAspose(
    preparedUpload: PreparedUpload,
    outputFormat: Frontend3dOutputFormat,
    warnings?: string[]
  ): Promise<ConversionResult> {
    const namespace = await loadAspose3dNamespace();
    const fileFormat = resolveLocalAspose3dFormat(namespace, outputFormat);

    if (!canExportWithLocalAspose(fileFormat)) {
      throw new AppError(
        `A biblioteca aspose.3d carregada neste ambiente nao suporta exportacao para ${outputFormat.toUpperCase()}.`,
        422,
        "ASPOSE3D_LOCAL_EXPORT_UNSUPPORTED"
      );
    }

    return withTempWorkspace(async (directory) => {
      const inputPath = path.join(directory, preparedUpload.safeFileName);
      const outputExtension = resolveLocalAspose3dExtension(fileFormat, outputFormat);
      const outputFileName = `${preparedUpload.detected.safeStem}.${outputExtension}`;
      const outputPath = path.join(directory, outputFileName);
      await writeBuffer(inputPath, preparedUpload.upload.buffer);

      const scene = new namespace.Scene();

      try {
        await Promise.resolve(scene.open(inputPath));
        await Promise.resolve(namespace.PolygonModifier.triangulate(scene));

        const saveOptions = configureLocalAspose3dSaveOptions(fileFormat.createSaveOptions(), outputFileName);
        await Promise.resolve(scene.save(outputPath, saveOptions));
      } catch (error) {
        throw new AppError(
          `Falha ao converter o modelo 3D com a biblioteca aspose.3d. ${toErrorMessage(error)}`,
          502,
          "ASPOSE3D_LOCAL_CONVERSION_FAILED"
        );
      }

      return {
        data: await readBuffer(outputPath),
        filename: outputFileName,
        contentType: contentTypeForExtension(outputExtension),
        provider: "aspose3d-local",
        summary: `Modelo 3D convertido para ${outputFormat.toUpperCase()} com triangulacao completa via Aspose.3D.`,
        warnings
      };
    });
  }

  private async convert3dModel(preparedUpload: PreparedUpload, options?: ConversionOptions) {
    const outputFormat = normalize3dOutputFormat(this.getOptionValue(options, "target3dFormat"));

    const sourceExtension = extensionForKind(preparedUpload.detected.kind);
    if (sourceExtension === outputFormat) {
      throw new AppError("Escolha um formato de saida diferente do arquivo enviado.", 400, "INVALID_OPTION");
    }

    const warnings =
      preparedUpload.detected.kind === "step"
        ? ["Arquivos STEP/STP estao em modo experimental porque esse formato nao aparece na lista principal da documentacao publica da Aspose 3D."]
        : undefined;

    try {
      return await this.convert3dModelWithLocalAspose(preparedUpload, outputFormat, warnings);
    } catch (error) {
      const cloudOutputFormat = outputFormat;
      const canFallbackToCloud =
        error instanceof AppError &&
        ["ASPOSE3D_LOCAL_UNAVAILABLE", "ASPOSE3D_LOCAL_FORMAT_UNAVAILABLE", "ASPOSE3D_LOCAL_EXPORT_UNSUPPORTED"].includes(
          error.code
        );

      if (!canFallbackToCloud) {
        throw error;
      }

      const outputFileName = `${preparedUpload.detected.safeStem}.${cloudOutputFormat}`;
      const data = await this.requireAspose3d(toolCatalog["3d-convert"].label).convertFile(
        preparedUpload.upload.buffer,
        preparedUpload.safeFileName,
        cloudOutputFormat,
        outputFileName
      );

      return {
        data,
        filename: outputFileName,
        contentType: contentTypeForExtension(cloudOutputFormat),
        provider: "aspose3d-saveas",
        summary: `Modelo 3D convertido para ${cloudOutputFormat.toUpperCase()} com a Aspose 3D Cloud.`,
        warnings
      };
    }
  }

  private async convertImageToPng(buffer: Buffer, stem: string): Promise<ConversionResult> {
    const data = await sharp(buffer).png({ compressionLevel: 9 }).toBuffer();
    return {
      data,
      filename: `${stem}.png`,
      contentType: toolCatalog["jpg-to-png"].outputMime,
      provider: "sharp-local",
      summary: "Imagem convertida localmente para PNG com compressao sem perdas."
    };
  }

  private async convertPngToJpeg(buffer: Buffer, stem: string, extension: "jpg" | "jpeg"): Promise<ConversionResult> {
    const data = await sharp(buffer)
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();

    return {
      data,
      filename: `${stem}.${extension}`,
      contentType: toolCatalog["png-to-jpg"].outputMime,
      provider: "sharp-local",
      summary: "Imagem convertida localmente para JPEG com nivel de qualidade alto."
    };
  }

  private async convertMp4ToMp3(buffer: Buffer, stem: string): Promise<ConversionResult> {
    return withTempWorkspace(async (directory) => {
      const inputPath = await writeBuffer(path.join(directory, "input.mp4"), buffer);
      const outputPath = path.join(directory, `${stem}.mp3`);

      await this.runCommandImpl(env.FFMPEG_BIN, [
        "-y",
        "-i",
        inputPath,
        "-vn",
        "-acodec",
        "libmp3lame",
        "-b:a",
        "192k",
        outputPath
      ]);

      return {
        data: await readBuffer(outputPath),
        filename: `${stem}.mp3`,
        contentType: toolCatalog["mp4-to-mp3"].outputMime,
        provider: "ffmpeg-local",
        summary: "Audio extraido localmente em MP3 com bitrate de 192 kbps."
      };
    });
  }

  private async convertPdfToText(buffer: Buffer, stem: string, textLayout: TextLayoutMode): Promise<ConversionResult> {
    const extracted = await this.extractPdfTextSource(buffer, `${stem}.pdf`);
    const text = formatTextByLayout(extracted.text, textLayout);

    return {
      data: Buffer.from(text, "utf-8"),
      filename: `${stem}.txt`,
      contentType: toolCatalog["pdf-to-text"].outputMime,
      provider: extracted.provider,
      summary: `Texto extraido do PDF em formato de ${textLayout === "lines" ? "linhas" : "blocos"}, com OCR automatico quando necessario.`
    };
  }

  private async convertPdfToDocx(buffer: Buffer, stem: string, textLayout: TextLayoutMode): Promise<ConversionResult> {
    const extracted = await this.extractPdfTextSource(buffer, `${stem}.pdf`);
    const document = new Document({
      sections: [
        {
          children:
            textLayout === "blocks"
              ? this.buildBlockModeDocxParagraphs(extracted.text)
              : this.buildTextModeDocxParagraphs(extracted.text)
        }
      ]
    });

    const data = Buffer.from(await Packer.toBuffer(document));

    return {
      data,
      filename: `${stem}.docx`,
      contentType: toolCatalog["pdf-to-docx"].outputMime,
      provider: `${extracted.provider}+docx-local`,
      summary:
        textLayout === "blocks"
          ? "PDF convertido para DOCX em modo de blocos, preservando hierarquia visual e paragrafos com OCR reforcado quando necessario."
          : "PDF convertido para DOCX em modo linear, priorizando leitura corrida e orientacao textual."
    };
  }

  private async convertOfficeToPdf(preparedUpload: PreparedUpload): Promise<ConversionResult> {
    const { upload, safeFileName, detected } = preparedUpload;

    if (this.ilovePdfClient) {
      try {
        const data = await this.ilovePdfClient.officeToPdf(upload.buffer, safeFileName);
        return {
          data,
          filename: `${detected.safeStem}.pdf`,
          contentType: toolCatalog["docx-to-pdf"].outputMime,
          provider: "ilovepdf-officepdf",
          summary: "Arquivo Office convertido para PDF pela API oficial do iLovePDF."
        };
      } catch (error) {
        console.warn(`[vaptdoc] iLovePDF officepdf fallback activated: ${toErrorMessage(error)}`);
      }
    } else {
      console.warn("[vaptdoc] iLovePDF officepdf not configured; using fallback provider.");
    }

    if (this.convertApiClient) {
      try {
        return await this.convertWithConvertApi(upload.buffer, safeFileName, detected.safeStem, "pdf", {
          ConvertBookmarks: true,
          ConvertHeadings: true,
          StoreFile: false
        });
      } catch {
        // Fallback local abaixo.
      }
    }

    return withTempWorkspace(async (directory) => {
      const inputPath = await writeBuffer(path.join(directory, safeFileName), upload.buffer);

      await this.runCommandImpl(env.LIBREOFFICE_BIN, [
        "--headless",
        "--convert-to",
        "pdf",
        "--outdir",
        directory,
        inputPath
      ]);

      const outputPath = path.join(directory, `${path.parse(safeFileName).name}.pdf`);
      const data = await readBuffer(outputPath);

      return {
        data,
        filename: `${detected.safeStem}.pdf`,
        contentType: toolCatalog["docx-to-pdf"].outputMime,
        provider: "libreoffice-local",
        summary: "Arquivo Office convertido para PDF com LibreOffice headless no servidor."
      };
    });
  }

  private async convertPdfMerge(preparedUploads: PreparedUpload[]) {
    const taskResult = await this.requireILovePdf(toolCatalog["pdf-merge"].label).runTask("merge", toILovePdfFiles(preparedUploads));
    return this.buildTaskDownload(
      taskResult,
      `${primaryStem(preparedUploads)}-unido`,
      "pdf",
      "ilovepdf-merge",
      "PDFs unidos com a ordem enviada."
    );
  }

  private async convertPdfSplit(preparedUpload: PreparedUpload, options?: ConversionOptions) {
    const splitMode = this.readEnumOption(options, "splitMode", "Modo de divisao", ["ranges", "fixed_range", "remove_pages"], "ranges");
    const ranges = splitMode === "ranges" ? this.readSimpleRangesOption(options, "ranges", "Intervalos") : undefined;
    const fixedRange = splitMode === "fixed_range"
      ? this.readIntegerOption(options, "fixedRange", "Paginas por arquivo", { min: 1, max: 500, defaultValue: undefined, required: true })
      : undefined;
    const removePages = splitMode === "remove_pages" ? this.readSimpleRangesOption(options, "removePages", "Paginas para remover") : undefined;
    const mergeAfter = splitMode === "ranges" ? this.readBooleanOption(options, "mergeAfter", false) : false;

    if (splitMode === "ranges" && !ranges) {
      throw new AppError("Informe ao menos um intervalo para dividir o PDF.", 400, "INVALID_OPTION");
    }

    if (splitMode === "remove_pages" && !removePages) {
      throw new AppError("Informe quais paginas devem ser removidas.", 400, "INVALID_OPTION");
    }

    const processParams: Record<string, unknown> = { split_mode: splitMode };
    if (ranges) {
      processParams.ranges = ranges;
    }
    if (fixedRange) {
      processParams.fixed_range = fixedRange;
    }
    if (removePages) {
      processParams.remove_pages = removePages;
    }
    if (mergeAfter) {
      processParams.merge_after = true;
    }

    const taskResult = await this.requireILovePdf(toolCatalog["pdf-split"].label).runTask(
      "split",
      toILovePdfFiles([preparedUpload]),
      processParams
    );

    return this.buildTaskDownload(
      taskResult,
      `${preparedUpload.detected.safeStem}-dividido`,
      splitMode === "remove_pages" || mergeAfter ? "pdf" : "zip",
      "ilovepdf-split",
      "PDF dividido com a configuracao escolhida."
    );
  }

  private async convertPdfCompress(preparedUpload: PreparedUpload, options?: ConversionOptions) {
    const compressionLevel = this.readEnumOption<CompressionLevel>(
      options,
      "compressionLevel",
      "Nivel de compressao",
      ["low", "recommended", "extreme"],
      "recommended"
    );

    const taskResult = await this.requireILovePdf(toolCatalog["pdf-compress"].label).runTask(
      "compress",
      toILovePdfFiles([preparedUpload]),
      {
        compression_level: compressionLevel
      }
    );

    return this.buildTaskDownload(
      taskResult,
      `${preparedUpload.detected.safeStem}-compactado`,
      "pdf",
      "ilovepdf-compress",
      "PDF compactado pela API oficial do iLovePDF."
    );
  }

  private async convertPdfOcr(preparedUpload: PreparedUpload) {
    const taskResult = await this.requireILovePdf(toolCatalog["pdf-ocr"].label).runTask("pdfocr", toILovePdfFiles([preparedUpload]), {
      ocr_languages: this.ilovePdfLanguages
    });

    return this.buildTaskDownload(
      taskResult,
      `${preparedUpload.detected.safeStem}-ocr`,
      "pdf",
      "ilovepdf-pdfocr",
      "OCR aplicado ao PDF para tornalo pesquisavel."
    );
  }

  private async convertPdfToJpg(preparedUpload: PreparedUpload, options?: ConversionOptions) {
    const mode = this.readEnumOption<PdfJpgMode>(options, "pdfJpgMode", "Modo do PDF para JPG", ["pages", "extract"], "pages");
    const dpi =
      mode === "pages"
        ? this.readIntegerOption(options, "dpi", "Resolucao em DPI", { min: 72, max: 300, defaultValue: 150 })
        : undefined;

    const processParams: Record<string, unknown> = {
      pdfjpg_mode: mode
    };

    if (dpi) {
      processParams.dpi = dpi;
    }

    const taskResult = await this.requireILovePdf(toolCatalog["pdf-to-jpg"].label).runTask(
      "pdfjpg",
      toILovePdfFiles([preparedUpload]),
      processParams
    );

    return this.buildTaskDownload(
      taskResult,
      `${preparedUpload.detected.safeStem}-jpg`,
      mode === "pages" ? "jpg" : "zip",
      "ilovepdf-pdfjpg",
      mode === "pages"
        ? "Paginas do PDF convertidas em imagens JPG."
        : "Imagens internas do PDF extraidas pela API do iLovePDF."
    );
  }

  private async convertImagesToPdf(preparedUploads: PreparedUpload[], options?: ConversionOptions) {
    const orientation = this.readEnumOption<ImagePdfOrientation>(
      options,
      "imagePdfOrientation",
      "Orientacao",
      ["portrait", "landscape"],
      "portrait"
    );
    const pagesize = this.readEnumOption<ImagePdfPageSize>(
      options,
      "imagePdfPageSize",
      "Tamanho da pagina",
      ["fit", "A4", "letter"],
      "fit"
    );
    const margin = this.readIntegerOption(options, "imagePdfMargin", "Margem", { min: 0, max: 100, defaultValue: 0 });
    const mergeAfter = this.readBooleanOption(options, "imagePdfMergeAfter", true);

    const taskResult = await this.requireILovePdf(toolCatalog["image-to-pdf"].label).runTask(
      "imagepdf",
      toILovePdfFiles(preparedUploads),
      {
        orientation,
        pagesize,
        margin,
        merge_after: mergeAfter
      }
    );

    return this.buildTaskDownload(
      taskResult,
      `${primaryStem(preparedUploads)}-imagens`,
      mergeAfter ? "pdf" : "zip",
      "ilovepdf-imagepdf",
      mergeAfter
        ? "Imagens convertidas em um unico PDF."
        : "Imagens convertidas em PDFs individuais."
    );
  }

  private async convertPdfToPdfa(preparedUpload: PreparedUpload, options?: ConversionOptions) {
    const conformance = this.readEnumOption<PdfaConformance>(
      options,
      "pdfaConformance",
      "Conformidade PDF/A",
      pdfaConformances,
      "pdfa-2b"
    );
    const allowDowngrade = this.readBooleanOption(options, "allowDowngrade", true);

    const taskResult = await this.requireILovePdf(toolCatalog["pdf-to-pdfa"].label).runTask(
      "pdfa",
      toILovePdfFiles([preparedUpload]),
      {
        conformance,
        allow_downgrade: allowDowngrade
      }
    );

    return this.buildTaskDownload(
      taskResult,
      `${preparedUpload.detected.safeStem}-pdfa`,
      "pdf",
      "ilovepdf-pdfa",
      `PDF convertido para ${conformance.toUpperCase()} pela API do iLovePDF.`
    );
  }

  private async convertHtmlToPdf(preparedUpload: PreparedUpload, options?: ConversionOptions) {
    const singlePage = this.readBooleanOption(options, "htmlSinglePage", false);
    const pageSize = this.readEnumOption<HtmlPdfPageSize>(
      options,
      "htmlPageSize",
      "Tamanho da pagina",
      ["A3", "A4", "A5", "A6", "Letter"],
      "A4"
    );
    const pageOrientation = this.readEnumOption<HtmlPdfPageOrientation>(
      options,
      "htmlPageOrientation",
      "Orientacao da pagina",
      ["portrait", "landscape"],
      "portrait"
    );
    const pageMargin = this.readIntegerOption(options, "htmlPageMargin", "Margem do HTML", { min: 0, max: 100, defaultValue: 12 });

    const taskResult = await this.requireILovePdf(toolCatalog["html-to-pdf"].label).runTask(
      "htmlpdf",
      toILovePdfFiles([preparedUpload]),
      {
        single_page: singlePage,
        page_size: pageSize,
        page_orientation: pageOrientation,
        page_margin: pageMargin
      }
    );

    return this.buildTaskDownload(
      taskResult,
      `${preparedUpload.detected.safeStem}-html`,
      "pdf",
      "ilovepdf-htmlpdf",
      "HTML convertido em PDF pela API do iLovePDF."
    );
  }

  private async validatePdfa(preparedUpload: PreparedUpload, options?: ConversionOptions) {
    const conformance = this.readEnumOption<PdfaConformance>(
      options,
      "validatePdfaConformance",
      "Conformidade esperada",
      pdfaConformances,
      "pdfa-2b"
    );

    const validations = await this.requireILovePdf(toolCatalog["pdf-validate-pdfa"].label).validatePdfa(
      {
        buffer: preparedUpload.upload.buffer,
        fileName: preparedUpload.safeFileName
      },
      { conformance }
    );

    return {
      data: Buffer.from(
        JSON.stringify(
          {
            tool: "validatepdfa",
            conformance,
            filename: preparedUpload.safeFileName,
            validations: validations.validations
          },
          null,
          2
        ),
        "utf-8"
      ),
      filename: `${preparedUpload.detected.safeStem}-validacao-pdfa.json`,
      contentType: toolCatalog["pdf-validate-pdfa"].outputMime,
      provider: "ilovepdf-validatepdfa",
      summary: `Relatorio de validacao PDF/A gerado para ${conformance.toUpperCase()}.`
    };
  }

  private async rotatePdf(preparedUpload: PreparedUpload, options?: ConversionOptions) {
    const rotateAngle = this.readEnumOption(options, "rotateAngle", "Rotacao", ["90", "180", "270"], "90");
    const rotation = Number(rotateAngle) as 90 | 180 | 270;

    const taskResult = await this.requireILovePdf(toolCatalog["pdf-rotate"].label).runTask(
      "rotate",
      toILovePdfFiles([preparedUpload], () => ({ rotate: rotation })),
      {}
    );

    return this.buildTaskDownload(
      taskResult,
      `${preparedUpload.detected.safeStem}-girado`,
      "pdf",
      "ilovepdf-rotate",
      `PDF girado em ${rotation} graus.`
    );
  }

  private async unlockPdf(preparedUpload: PreparedUpload, options?: ConversionOptions) {
    const password = this.readPasswordOption(options, "pdfPassword", "Senha atual do PDF");

    const taskResult = await this.requireILovePdf(toolCatalog["pdf-unlock"].label).runTask(
      "unlock",
      toILovePdfFiles([preparedUpload], () => (password ? { password } : undefined)),
      {}
    );

    return this.buildTaskDownload(
      taskResult,
      `${preparedUpload.detected.safeStem}-desbloqueado`,
      "pdf",
      "ilovepdf-unlock",
      "Protecao removida do PDF."
    );
  }

  private async protectPdf(preparedUpload: PreparedUpload, options?: ConversionOptions) {
    const password = this.readPasswordOption(options, "protectPassword", "Nova senha", { required: true, minLength: 4 });

    const taskResult = await this.requireILovePdf(toolCatalog["pdf-protect"].label).runTask(
      "protect",
      toILovePdfFiles([preparedUpload]),
      {
        password
      }
    );

    return this.buildTaskDownload(
      taskResult,
      `${preparedUpload.detected.safeStem}-protegido`,
      "pdf",
      "ilovepdf-protect",
      "Senha aplicada ao PDF com sucesso."
    );
  }

  private async watermarkPdf(preparedUpload: PreparedUpload, options?: ConversionOptions) {
    const text = this.readStringOption(options, "watermarkText", "Texto da marca d'agua", {
      maxLength: 120,
      defaultValue: "vaptdoc"
    })!;
    const pages = this.readPageSelectionOption(options, "watermarkPages", "Paginas da marca d'agua");
    const vertical = this.readEnumOption(options, "watermarkVerticalPosition", "Posicao vertical da marca d'agua", ["top", "middle", "bottom"], "middle");
    const horizontal = this.readEnumOption(options, "watermarkHorizontalPosition", "Posicao horizontal da marca d'agua", ["left", "center", "right"], "center");
    const rotation = this.readIntegerOption(options, "watermarkRotation", "Rotacao da marca d'agua", {
      min: 0,
      max: 360,
      defaultValue: 315
    });
    const transparency = this.readIntegerOption(options, "watermarkTransparency", "Opacidade da marca d'agua", {
      min: 1,
      max: 100,
      defaultValue: 40
    });

    const taskResult = await this.requireILovePdf(toolCatalog["pdf-watermark"].label).runTask(
      "watermark",
      toILovePdfFiles([preparedUpload]),
      {
        mode: "text",
        text,
        pages,
        vertical_position: vertical,
        horizontal_position: horizontal,
        rotation,
        transparency,
        layer: "above",
        font_family: "Arial Unicode MS",
        font_style: "Bold",
        font_size: 24,
        font_color: "#3D63FF"
      }
    );

    return this.buildTaskDownload(
      taskResult,
      `${preparedUpload.detected.safeStem}-marca-dagua`,
      "pdf",
      "ilovepdf-watermark",
      "Marca d'agua aplicada ao PDF."
    );
  }

  private async numberPdfPages(preparedUpload: PreparedUpload, options?: ConversionOptions) {
    const startingNumber = this.readIntegerOption(options, "pageNumbersStartingNumber", "Numero inicial", {
      min: 1,
      max: 9999,
      defaultValue: 1
    });
    const pages = this.readPageSelectionOption(options, "pageNumbersPages", "Paginas a numerar");
    const vertical = this.readEnumOption(options, "pageNumbersVerticalPosition", "Posicao vertical da numeracao", ["top", "bottom"], "bottom");
    const horizontal = this.readEnumOption(
      options,
      "pageNumbersHorizontalPosition",
      "Posicao horizontal da numeracao",
      ["left", "center", "right"],
      "center"
    );
    const text = this.readStringOption(options, "pageNumbersText", "Formato da numeracao", {
      maxLength: 80,
      defaultValue: "Pagina {n} de {p}"
    });

    const taskResult = await this.requireILovePdf(toolCatalog["pdf-page-numbers"].label).runTask(
      "pagenumber",
      toILovePdfFiles([preparedUpload]),
      {
        starting_number: startingNumber,
        pages,
        vertical_position: vertical,
        horizontal_position: horizontal,
        text
      }
    );

    return this.buildTaskDownload(
      taskResult,
      `${preparedUpload.detected.safeStem}-numerado`,
      "pdf",
      "ilovepdf-pagenumber",
      "Numeracao adicionada ao PDF."
    );
  }

  private async repairPdf(preparedUpload: PreparedUpload) {
    const taskResult = await this.requireILovePdf(toolCatalog["pdf-repair"].label).runTask(
      "repair",
      toILovePdfFiles([preparedUpload]),
      {}
    );

    return this.buildTaskDownload(
      taskResult,
      `${preparedUpload.detected.safeStem}-reparado`,
      "pdf",
      "ilovepdf-repair",
      "Tentativa de reparo do PDF concluida."
    );
  }

  private async extractPdf(preparedUpload: PreparedUpload, options?: ConversionOptions) {
    const detailed = this.readBooleanOption(options, "extractDetailed", false);
    const byWord = detailed ? this.readBooleanOption(options, "extractByWord", false) : false;

    const taskResult = await this.requireILovePdf(toolCatalog["pdf-extract"].label).runTask(
      "extract",
      toILovePdfFiles([preparedUpload]),
      {
        detailed,
        by_word: byWord
      }
    );

    return this.buildTaskDownload(
      taskResult,
      `${preparedUpload.detected.safeStem}-extracao`,
      detailed ? "csv" : "txt",
      "ilovepdf-extract",
      detailed ? "Extracao detalhada gerada em CSV." : "Texto extraido pela API do iLovePDF."
    );
  }

  private async editPdf(preparedUpload: PreparedUpload, options?: ConversionOptions) {
    const text = this.readStringOption(options, "editText", "Texto de edicao", {
      maxLength: 120,
      defaultValue: "Editado com vaptdoc"
    })!;
    const pages = this.readPageSelectionOption(options, "editPages", "Paginas da edicao");
    const position = this.readEnumOption<EditPosition>(
      options,
      "editPosition",
      "Posicao do texto",
      ["top-left", "top-center", "top-right", "middle-center", "bottom-left", "bottom-center", "bottom-right"],
      "bottom-center"
    );
    const opacity =
      this.readIntegerOption(options, "editOpacity", "Opacidade do texto", {
        min: 1,
        max: 100,
        defaultValue: 85
      }) ?? 85;
    const rotation =
      this.readIntegerOption(options, "editRotation", "Rotacao do texto", {
        min: 0,
        max: 360,
        defaultValue: 0
      }) ?? 0;

    const taskResult = await this.requireILovePdf(toolCatalog["pdf-edit"].label).editPdfText(
      {
        buffer: preparedUpload.upload.buffer,
        fileName: preparedUpload.safeFileName
      },
      {
        text,
        pages,
        position,
        opacity,
        rotation
      } satisfies ILovePdfEditTextParams
    );

    return this.buildTaskDownload(
      taskResult,
      `${preparedUpload.detected.safeStem}-editado`,
      "pdf",
      "ilovepdf-editpdf",
      "Texto inserido no PDF pela API do iLovePDF."
    );
  }

  private buildBlockModeDocxParagraphs(text: string) {
    const sections = parseStructuredSections(text);
    const paragraphs: Paragraph[] = [];

    sections.forEach((section, index) => {
      paragraphs.push(...this.renderBlockSection(section, index === 0));
    });

    return paragraphs;
  }

  private renderBlockSection(section: ParsedStructuredSection, isFirstSection: boolean) {
    const output: Paragraph[] = [];

    if (section.kind === "metadata") {
      section.lines.forEach((line, lineIndex) => {
        if (line.kind === "title") {
          output.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { after: 220, before: lineIndex === 0 ? 0 : 120 },
              children: [
                new TextRun({
                  text: line.raw,
                  bold: true,
                  size: 28
                })
              ]
            })
          );
          return;
        }

        output.push(
          new Paragraph({
            spacing: { after: 70 },
            children: [
              new TextRun({
                text: line.label ?? line.raw,
                bold: true,
                size: 24
              }),
              ...(line.value
                ? [
                    new TextRun({
                      text: ` ${line.value}`,
                      size: 24
                    })
                  ]
                : [])
            ]
          })
        );
      });

      output.push(
        new Paragraph({
          spacing: { before: 80, after: 420 },
          border: {
            bottom: {
              color: "B7C0C7",
              size: 6,
              style: BorderStyle.SINGLE
            }
          }
        })
      );

      return output;
    }

    if (section.kind === "title") {
      section.lines.forEach((line, lineIndex) => {
        output.push(
          new Paragraph({
            spacing: { before: lineIndex === 0 ? 120 : 0, after: lineIndex === section.lines.length - 1 ? 180 : 20 },
            border:
              lineIndex === section.lines.length - 1
                ? {
                    bottom: {
                      color: "2B3137",
                      size: 8,
                      style: BorderStyle.SINGLE
                    }
                  }
                : undefined,
            children: [
              new TextRun({
                text: line.raw,
                bold: true,
                size: line.kind === "title" ? 38 : 30
              })
            ]
          })
        );
      });

      return output;
    }

    const bodyLines = section.lines.filter((line) => line.kind === "body");
    const headingLines = section.lines.filter((line) => line.kind === "section-heading");
    const captionLines = section.lines.filter((line) => line.kind === "caption");
    const metadataLines = section.lines.filter((line) => line.kind === "metadata");
    const titleLines = section.lines.filter((line) => line.kind === "title");

    titleLines.forEach((line, index) => {
      output.push(
        new Paragraph({
          spacing: { after: 180, before: isFirstSection && index === 0 ? 0 : 60 },
          children: [
            new TextRun({
              text: line.raw,
              bold: true,
              size: 28
            })
          ]
        })
      );
    });

    metadataLines.forEach((line) => {
      output.push(
        new Paragraph({
          spacing: { after: 70 },
          children: [
            new TextRun({ text: line.label ?? "", bold: true, size: 24 }),
            ...(line.value ? [new TextRun({ text: ` ${line.value}`, size: 24 })] : [])
          ]
        })
      );
    });

    if (metadataLines.length > 0 && bodyLines.length === 0 && headingLines.length === 0 && captionLines.length === 0) {
      output.push(
        new Paragraph({
          spacing: { before: 80, after: 420 },
          border: {
            bottom: {
              color: "B7C0C7",
              size: 6,
              style: BorderStyle.SINGLE
            }
          }
        })
      );
    }

    headingLines.forEach((line) => {
      output.push(
        new Paragraph({
          spacing: { before: isFirstSection ? 0 : 120, after: 100 },
          children: [
            new TextRun({
              text: line.raw,
              bold: true,
              size: 28
            })
          ]
        })
      );
    });

    if (bodyLines.length > 0) {
      output.push(
        new Paragraph({
          spacing: { after: 220 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: bodyLines.map((line) => line.raw).join(" "),
              size: 24
            })
          ]
        })
      );
    }

    captionLines.forEach((line) => {
      output.push(
        new Paragraph({
          spacing: { after: 160 },
          children: [
            new TextRun({
              text: line.raw,
              italics: true,
              size: 22
            })
          ]
        })
      );
    });

    return output;
  }

  private buildTextModeDocxParagraphs(text: string) {
    const paragraphs: Paragraph[] = [];
    const lines = splitLines(text);

    lines.forEach((line, index) => {
      const isHeading = /^\d+(\.\d+)*\s+/u.test(line) || /^[\p{Lu}][\p{Lu}0-9 ,\-()]{12,}$/u.test(line);
      const metadataMatch = line.match(/^([\p{Lu}0-9][\p{Lu}0-9 ./()_-]{1,40}:)\s*(.+)$/u);

      if (metadataMatch) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: 50, before: index === 0 ? 0 : 20 },
            children: [
              new TextRun({ text: metadataMatch[1], bold: true, size: 24 }),
              new TextRun({ text: ` ${metadataMatch[2]}`, size: 24 })
            ]
          })
        );
        return;
      }

      paragraphs.push(
        new Paragraph({
          spacing: { after: isHeading ? 80 : 40, before: isHeading ? 80 : 0 },
          children: [
            new TextRun({
              text: line,
              bold: isHeading,
              size: isHeading ? 26 : 24
            })
          ]
        })
      );
    });

    return paragraphs;
  }

  private async convertWithConvertApi(
    buffer: Buffer,
    fileName: string,
    stem: string,
    targetFormat: "pdf" | "docx",
    params: Record<string, unknown>
  ): Promise<ConversionResult> {
    if (!this.convertApiClient) {
      throw new AppError("ConvertAPI nao configurada no ambiente.", 503, "CONVERTAPI_UNAVAILABLE");
    }

    const client = this.convertApiClient;

    return withTempWorkspace(async (directory) => {
      const uploadHandle = await client.upload(Readable.from(buffer), fileName);
      const result = await client.convert(targetFormat, {
        File: uploadHandle,
        ...params
      });

      const files = await result.saveFiles(directory);
      const outputPath = files.at(0);

      if (!outputPath) {
        throw new AppError("A API de conversao nao retornou arquivo de saida.", 502, "EMPTY_PROVIDER_RESPONSE");
      }

      return {
        data: await readBuffer(outputPath),
        filename: `${stem}.${targetFormat}`,
        contentType: targetFormat === "pdf" ? toolCatalog["docx-to-pdf"].outputMime : toolCatalog["pdf-to-docx"].outputMime,
        provider: "convertapi",
        summary: `Arquivo convertido pela ConvertAPI para ${targetFormat.toUpperCase()}.`
      };
    });
  }

  private async extractPdfTextSource(buffer: Buffer, fileName: string): Promise<ExtractedTextSource> {
    const sourceText = await this.parsePdfText(buffer);
    const normalized = normalizeBlockText(sourceText);

    if (normalized.length >= 48) {
      return {
        text: sourceText,
        usedOcr: false,
        provider: "pdf-parser-local"
      };
    }

    if (this.ilovePdfClient) {
      try {
        const searchablePdf = await this.ilovePdfClient.ocrPdf(buffer, fileName, this.ilovePdfLanguages);
        const searchableText = await this.parsePdfText(searchablePdf);
        return {
          text: ensureMeaningfulText(searchableText),
          usedOcr: true,
          provider: "ilovepdf-pdfocr+pdf-parser"
        };
      } catch (error) {
        console.warn(`[vaptdoc] iLovePDF pdfocr fallback activated: ${toErrorMessage(error)}`);
      }
    } else {
      console.warn("[vaptdoc] iLovePDF pdfocr not configured; using fallback OCR providers.");
    }

    if (env.OCR_SPACE_API_KEY) {
      try {
        const text = await this.extractWithOcrSpace(buffer);
        return {
          text: ensureMeaningfulText(text),
          usedOcr: true,
          provider: "ocr-space"
        };
      } catch {
        // Fallback local abaixo.
      }
    }

    return {
      text: ensureMeaningfulText(await this.extractWithLocalOcr(buffer)),
      usedOcr: true,
      provider: "tesseract-local"
    };
  }

  private async parsePdfText(buffer: Buffer) {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const parsed = await parser.getText();
      return parsed.text ?? "";
    } finally {
      await parser.destroy();
    }
  }

  private async extractWithOcrSpace(buffer: Buffer): Promise<string> {
    const form = new FormData();
    form.set("apikey", env.OCR_SPACE_API_KEY);
    form.set("language", env.OCR_SPACE_LANGUAGE);
    form.set("OCREngine", "2");
    form.set("filetype", "PDF");
    form.set("detectOrientation", "true");
    form.set("scale", "true");
    form.set("file", new Blob([new Uint8Array(buffer)], { type: "application/pdf" }), "document.pdf");

    const response = await this.fetchImpl("https://api.ocr.space/parse/image", {
      method: "POST",
      body: form
    });

    if (!response.ok) {
      throw new AppError("OCR Space retornou erro ao processar o PDF.", 502, "OCR_SPACE_FAILED");
    }

    const payload = (await response.json()) as OcrSpaceResponse;

    if (payload.IsErroredOnProcessing) {
      const detail = Array.isArray(payload.ErrorMessage) ? payload.ErrorMessage.join(", ") : payload.ErrorMessage;
      throw new AppError(`OCR Space nao conseguiu processar o arquivo: ${detail ?? "erro desconhecido"}.`, 502, "OCR_SPACE_FAILED");
    }

    const combined = payload.ParsedResults?.map((item) => item.ParsedText ?? "").join("\n\n") ?? "";
    return normalizeBlockText(combined);
  }

  private async extractWithLocalOcr(buffer: Buffer): Promise<string> {
    return withTempWorkspace(async (directory) => {
      const inputPath = await writeBuffer(path.join(directory, "input.pdf"), buffer);
      const imagePrefix = path.join(directory, "page");

      await this.runCommandImpl(env.PDFTOPPM_BIN, [
        "-f",
        "1",
        "-l",
        String(env.MAX_OCR_PAGES),
        "-png",
        inputPath,
        imagePrefix
      ]);

      const files = (await readdir(directory))
        .filter((entry) => entry.startsWith("page-") && entry.endsWith(".png"))
        .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

      if (files.length === 0) {
        throw new AppError("Nao foi possivel rasterizar o PDF para OCR.", 422, "OCR_PREP_FAILED");
      }

      const pageTexts: string[] = [];

      for (const file of files) {
        const imagePath = path.join(directory, file);
        const result = await this.runCommandImpl(env.TESSERACT_BIN, [
          imagePath,
          "stdout",
          "-l",
          "por+eng",
          "--psm",
          "6"
        ]);

        pageTexts.push(result.stdout);
      }

      return normalizeBlockText(pageTexts.join("\n\n"));
    });
  }
}

function providerToToolId(provider: string): ToolId {
  const map: Record<string, ToolId> = {
    "ilovepdf-merge": "pdf-merge",
    "ilovepdf-split": "pdf-split",
    "ilovepdf-compress": "pdf-compress",
    "ilovepdf-pdfocr": "pdf-ocr",
    "ilovepdf-pdfjpg": "pdf-to-jpg",
    "ilovepdf-imagepdf": "image-to-pdf",
    "ilovepdf-pdfa": "pdf-to-pdfa",
    "ilovepdf-htmlpdf": "html-to-pdf",
    "ilovepdf-validatepdfa": "pdf-validate-pdfa",
    "ilovepdf-rotate": "pdf-rotate",
    "ilovepdf-unlock": "pdf-unlock",
    "ilovepdf-protect": "pdf-protect",
    "ilovepdf-watermark": "pdf-watermark",
    "ilovepdf-pagenumber": "pdf-page-numbers",
    "ilovepdf-repair": "pdf-repair",
    "ilovepdf-extract": "pdf-extract",
    "ilovepdf-editpdf": "pdf-edit"
  };

  return map[provider];
}

export function createConversionService(deps?: ConversionServiceDeps) {
  return new ConversionService(deps);
}
