import type { ToolId } from "./catalog.js";
import type { Aspose3dOutputFormat } from "./services/aspose-3d-client.js";
import type { PdfaConformance } from "./services/ilovepdf-client.js";

export type TextLayoutMode = "blocks" | "lines";
export type SplitMode = "ranges" | "fixed_range" | "remove_pages";
export type CompressionLevel = "low" | "recommended" | "extreme";
export type PdfJpgMode = "pages" | "extract";
export type ImagePdfOrientation = "portrait" | "landscape";
export type ImagePdfPageSize = "fit" | "A4" | "letter";
export type HtmlPdfPageSize = "A3" | "A4" | "A5" | "A6" | "Letter";
export type HtmlPdfPageOrientation = "portrait" | "landscape";
export type WatermarkVerticalPosition = "bottom" | "top" | "middle";
export type WatermarkHorizontalPosition = "left" | "center" | "right";
export type PageNumbersVerticalPosition = "bottom" | "top";
export type PageNumbersHorizontalPosition = "left" | "center" | "right";
export type ThreeDTargetFormat = Aspose3dOutputFormat;
export type EditPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-center"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface UploadedAsset {
  buffer: Buffer;
  filename: string;
  declaredMime?: string;
  size: number;
}

export interface ConversionOptions {
  target3dFormat?: ThreeDTargetFormat;
  textLayout?: TextLayoutMode;
  splitMode?: SplitMode;
  ranges?: string;
  fixedRange?: number;
  removePages?: string;
  mergeAfter?: boolean;
  compressionLevel?: CompressionLevel;
  pdfJpgMode?: PdfJpgMode;
  dpi?: number;
  imagePdfOrientation?: ImagePdfOrientation;
  imagePdfPageSize?: ImagePdfPageSize;
  imagePdfMargin?: number;
  imagePdfMergeAfter?: boolean;
  pdfaConformance?: PdfaConformance;
  allowDowngrade?: boolean;
  htmlSinglePage?: boolean;
  htmlPageSize?: HtmlPdfPageSize;
  htmlPageOrientation?: HtmlPdfPageOrientation;
  htmlPageMargin?: number;
  validatePdfaConformance?: PdfaConformance;
  rotateAngle?: 90 | 180 | 270;
  pdfPassword?: string;
  protectPassword?: string;
  watermarkText?: string;
  watermarkPages?: string;
  watermarkVerticalPosition?: WatermarkVerticalPosition;
  watermarkHorizontalPosition?: WatermarkHorizontalPosition;
  watermarkRotation?: number;
  watermarkTransparency?: number;
  pageNumbersStartingNumber?: number;
  pageNumbersPages?: string;
  pageNumbersVerticalPosition?: PageNumbersVerticalPosition;
  pageNumbersHorizontalPosition?: PageNumbersHorizontalPosition;
  pageNumbersText?: string;
  extractDetailed?: boolean;
  extractByWord?: boolean;
  editText?: string;
  editPages?: string;
  editPosition?: EditPosition;
  editOpacity?: number;
  editRotation?: number;
}

export interface ConversionRequest {
  toolId: ToolId;
  uploads: UploadedAsset[];
  options?: ConversionOptions;
}

export interface ConversionResult {
  data: Buffer;
  filename: string;
  contentType: string;
  provider: string;
  summary: string;
  warnings?: string[];
}
