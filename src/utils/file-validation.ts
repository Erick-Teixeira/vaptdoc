import path from "node:path";
import { fileTypeFromBuffer } from "file-type";
import sanitizeFilename from "sanitize-filename";
import { toolCatalog, type SupportedKind, type ToolDefinition, type ToolId } from "../catalog.js";
import { AppError } from "./errors.js";

export interface DetectedUpload {
  kind: SupportedKind;
  safeStem: string;
}

export interface UploadLike {
  filename: string;
  size: number;
}

const pdfMagic = Buffer.from("%PDF");
const zipMagic = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const oleMagic = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const glbMagic = Buffer.from([0x67, 0x6c, 0x54, 0x46]);
const fbxBinaryMagic = Buffer.from("Kaydara FBX Binary", "utf8");
const plyMagic = Buffer.from("ply", "utf8");
const stepMagic = Buffer.from("ISO-10303-21", "utf8");
const dracoMagic = Buffer.from("DRACO", "utf8");
const usdcMagic = Buffer.from("PXR-USDC", "utf8");
const maxInspectionBytes = 256 * 1024;

interface ZipKindRule {
  kind: SupportedKind;
  requiredAll?: readonly string[];
  requiredAny?: readonly string[];
}

const zipKindRules: Partial<Record<string, ZipKindRule>> = {
  ".docx": {
    kind: "docx",
    requiredAll: ["[Content_Types].xml", "word/"]
  },
  ".xlsx": {
    kind: "xlsx",
    requiredAll: ["[Content_Types].xml", "xl/"]
  },
  ".pptx": {
    kind: "pptx",
    requiredAll: ["[Content_Types].xml", "ppt/"]
  },
  ".odt": {
    kind: "odt",
    requiredAny: ["mimetypeapplication/vnd.oasis.opendocument.text", "META-INF/manifest.xml"]
  },
  ".ods": {
    kind: "ods",
    requiredAny: ["mimetypeapplication/vnd.oasis.opendocument.spreadsheet", "META-INF/manifest.xml"]
  },
  ".odp": {
    kind: "odp",
    requiredAny: ["mimetypeapplication/vnd.oasis.opendocument.presentation", "META-INF/manifest.xml"]
  },
  ".3mf": {
    kind: "3mf",
    requiredAll: ["[Content_Types].xml", "3D/3dmodel.model"]
  },
  ".usdz": {
    kind: "usdz",
    requiredAny: [".usdc", ".usda", ".usd"]
  }
};

function buildSafeStem(filename: string) {
  const originalStem = path.parse(filename).name || "arquivo";
  const sanitized = sanitizeFilename(originalStem)
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

  return sanitized || "arquivo";
}

function extensionOf(filename: string) {
  return path.extname(filename).toLowerCase();
}

function getInspectionSlice(buffer: Buffer, limit = maxInspectionBytes) {
  return buffer.subarray(0, Math.min(buffer.byteLength, limit));
}

function bufferIncludesUtf8(buffer: Buffer, marker: string, limit = maxInspectionBytes) {
  return getInspectionSlice(buffer, limit).includes(Buffer.from(marker, "utf8"));
}

function sampleUtf8(buffer: Buffer, limit = 4096) {
  return getInspectionSlice(buffer, limit).toString("utf8");
}

function inferZipBasedKind(buffer: Buffer, filename: string): SupportedKind | null {
  if (!buffer.subarray(0, 4).equals(zipMagic)) {
    return null;
  }

  const ext = extensionOf(filename);
  const rule = zipKindRules[ext];
  if (!rule) {
    return null;
  }

  const matchesAll = (rule.requiredAll ?? []).every((marker) => bufferIncludesUtf8(buffer, marker));
  const matchesAny = (rule.requiredAny ?? []).length === 0 || (rule.requiredAny ?? []).some((marker) => bufferIncludesUtf8(buffer, marker));

  return matchesAll && matchesAny ? rule.kind : null;
}

function inferOleKind(buffer: Buffer, filename: string): SupportedKind | null {
  if (!buffer.subarray(0, 8).equals(oleMagic)) {
    return null;
  }

  const ext = extensionOf(filename);
  const map: Partial<Record<string, SupportedKind>> = {
    ".doc": "doc",
    ".xls": "xls",
    ".ppt": "ppt"
  };

  return map[ext] ?? null;
}

function inferHtml(buffer: Buffer, filename: string, declaredMime?: string): SupportedKind | null {
  const ext = extensionOf(filename);
  if (ext !== ".html" && ext !== ".htm" && declaredMime !== "text/html") {
    return null;
  }

  const sample = buffer.subarray(0, Math.min(buffer.byteLength, 1024)).toString("utf8").trim().toLowerCase();
  if (!sample) {
    return null;
  }

  if (sample.startsWith("<!doctype html") || sample.startsWith("<html") || sample.includes("<body") || sample.includes("<head")) {
    return "html";
  }

  return null;
}

function infer3dKind(buffer: Buffer, filename: string): SupportedKind | null {
  const ext = extensionOf(filename);
  const sample = sampleUtf8(buffer, 4096).trimStart();
  const lowerSample = sample.toLowerCase();

  if (ext === ".glb" && buffer.subarray(0, 4).equals(glbMagic)) {
    return "glb";
  }

  if (ext === ".fbx") {
    if (
      buffer.subarray(0, fbxBinaryMagic.byteLength).equals(fbxBinaryMagic) ||
      lowerSample.includes("fbxheaderextension") ||
      lowerSample.includes("kaydara\\fbx")
    ) {
      return "fbx";
    }

    return null;
  }

  if (
    (ext === ".step" || ext === ".stp") &&
    (sample.startsWith("ISO-10303-21") ||
      buffer.subarray(0, stepMagic.byteLength).equals(stepMagic) ||
      lowerSample.includes("file_description") ||
      lowerSample.includes("file_schema"))
  ) {
    return "step";
  }

  if (ext === ".stl") {
    if (lowerSample.startsWith("solid") && (lowerSample.includes("facet normal") || lowerSample.includes("endsolid"))) {
      return "stl";
    }

    if (buffer.byteLength >= 84) {
      const triangleCount = buffer.readUInt32LE(80);
      const expectedSize = 84 + triangleCount * 50;
      if (triangleCount > 0 && buffer.byteLength >= expectedSize) {
        return "stl";
      }
    }

    return null;
  }

  if (ext === ".obj") {
    if (/^(#|v |vn |vt |f |o |g |mtllib |usemtl |s )/mu.test(sample)) {
      return "obj";
    }

    return null;
  }

  if (ext === ".dae" && lowerSample.includes("<collada")) {
    return "dae";
  }

  if (ext === ".amf" && lowerSample.includes("<amf")) {
    return "amf";
  }

  if (ext === ".ply" && buffer.subarray(0, 3).equals(plyMagic) && /format\s+(ascii|binary_(little|big)_endian)/u.test(lowerSample)) {
    return "ply";
  }

  if (
    ext === ".gltf" &&
    lowerSample.startsWith("{") &&
    lowerSample.includes("\"asset\"") &&
    (lowerSample.includes("\"meshes\"") || lowerSample.includes("\"nodes\"") || lowerSample.includes("\"scenes\""))
  ) {
    return "gltf";
  }

  if (ext === ".3ds" && buffer.byteLength >= 6 && buffer.readUInt16LE(0) === 0x4d4d) {
    return "3ds";
  }

  if (ext === ".usd" && (lowerSample.startsWith("#usda") || buffer.subarray(0, usdcMagic.byteLength).equals(usdcMagic))) {
    return "usd";
  }

  if (ext === ".drc" && buffer.subarray(0, dracoMagic.byteLength).equals(dracoMagic)) {
    return "drc";
  }

  if (ext === ".u3d" && lowerSample.includes("u3d")) {
    return "u3d";
  }

  if (ext === ".rvm" && lowerSample.includes("rvm")) {
    return "rvm";
  }

  return null;
}

export async function detectUpload(buffer: Buffer, filename: string, declaredMime?: string): Promise<DetectedUpload> {
  const safeStem = buildSafeStem(filename);

  if (buffer.subarray(0, 4).equals(pdfMagic)) {
    return { kind: "pdf", safeStem };
  }

  const zipBased = inferZipBasedKind(buffer, filename);
  if (zipBased) {
    return { kind: zipBased, safeStem };
  }

  const oleBased = inferOleKind(buffer, filename);
  if (oleBased) {
    return { kind: oleBased, safeStem };
  }

  const htmlKind = inferHtml(buffer, filename, declaredMime);
  if (htmlKind) {
    return { kind: htmlKind, safeStem };
  }

  const threeDimensionalKind = infer3dKind(buffer, filename);
  if (threeDimensionalKind) {
    return { kind: threeDimensionalKind, safeStem };
  }

  const fileType = await fileTypeFromBuffer(buffer);

  if (!fileType) {
    throw new AppError("Nao foi possivel reconhecer o tipo real do arquivo enviado.", 415, "UNSUPPORTED_MEDIA");
  }

  const mimeToKind: Record<string, SupportedKind> = {
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/tiff": "tiff",
    "video/mp4": "mp4"
  };

  const kind = mimeToKind[fileType.mime];

  if (!kind) {
    throw new AppError("Formato nao suportado para esta ferramenta.", 415, "UNSUPPORTED_MEDIA");
  }

  if (kind === "jpeg" && extensionOf(filename) === ".jpg") {
    return { kind: "jpg", safeStem };
  }

  if (kind === "tiff" && extensionOf(filename) === ".tif") {
    return { kind: "tif", safeStem };
  }

  return { kind, safeStem };
}

export function assertToolCompatibility(toolId: ToolId, detectedKinds: SupportedKind[]) {
  const tool = toolCatalog[toolId] as ToolDefinition;
  const supportedKinds = tool.inputKinds as readonly SupportedKind[];
  const minFiles = tool.minFiles ?? 1;
  const maxFiles = tool.maxFiles ?? 1;

  if (detectedKinds.length < minFiles) {
    throw new AppError(`A ferramenta ${tool.label} precisa de pelo menos ${minFiles} arquivo(s).`, 400, "TOOL_FILE_COUNT");
  }

  if (detectedKinds.length > maxFiles) {
    throw new AppError(`A ferramenta ${tool.label} aceita no maximo ${maxFiles} arquivo(s) por vez.`, 400, "TOOL_FILE_COUNT");
  }

  for (const detectedKind of detectedKinds) {
    if (!supportedKinds.includes(detectedKind)) {
      throw new AppError(
        `A ferramenta ${tool.label} nao aceita arquivos do tipo ${detectedKind.toUpperCase()}.`,
        400,
        "TOOL_INPUT_MISMATCH"
      );
    }
  }
}

export function assertUploadLimits(uploads: UploadLike[], maxFileSizeBytes: number) {
  for (const upload of uploads) {
    if (upload.size <= 0) {
      throw new AppError("Um dos arquivos enviados esta vazio. Envie um arquivo valido para converter.", 400, "EMPTY_FILE");
    }

    if (upload.size > maxFileSizeBytes) {
      throw new AppError(
        `O arquivo ${upload.filename} ultrapassa o limite de ${(maxFileSizeBytes / 1024 / 1024).toFixed(0)} MB permitido nesta conversao.`,
        413,
        "FILE_TOO_LARGE"
      );
    }
  }
}
