import path from "node:path";
import ILovePDFApi from "@ilovepdf/ilovepdf-nodejs";
import ILovePDFFile from "@ilovepdf/ilovepdf-nodejs/ILovePDFFile.js";
import TextElement from "@ilovepdf/ilovepdf-js-core/tasks/edit/Text.js";
import { withTempWorkspace, writeBuffer } from "../utils/fs.js";

export type ILovePdfTaskType =
  | "compress"
  | "extract"
  | "htmlpdf"
  | "imagepdf"
  | "merge"
  | "officepdf"
  | "pagenumber"
  | "pdfa"
  | "pdfjpg"
  | "pdfocr"
  | "protect"
  | "repair"
  | "rotate"
  | "split"
  | "unlock"
  | "watermark";

export type PdfaConformance =
  | "pdfa-1b"
  | "pdfa-1a"
  | "pdfa-2b"
  | "pdfa-2u"
  | "pdfa-2a"
  | "pdfa-3b"
  | "pdfa-3u"
  | "pdfa-3a";

export interface ILovePdfFileParams {
  rotate?: 0 | 90 | 180 | 270;
  password?: string;
}

export interface ILovePdfTaskFile {
  buffer: Buffer;
  fileName: string;
  params?: ILovePdfFileParams;
  info?: boolean;
}

export interface ILovePdfTaskMetadata {
  download_filename: string;
  filesize: number;
  output_filesize: number;
  output_filenumber: number;
  output_extensions: string[];
  timer: string;
  status: string;
}

export interface ILovePdfBinaryResult {
  data: Buffer;
  meta: ILovePdfTaskMetadata;
}

export interface ILovePdfValidationResult {
  validations: Array<{
    server_filename: string;
    status: string;
  }>;
}

export interface ILovePdfEditTextParams {
  text: string;
  pages?: string;
  position: "top-left" | "top-center" | "top-right" | "middle-center" | "bottom-left" | "bottom-center" | "bottom-right";
  opacity: number;
  rotation: number;
}

interface ILovePdfTask {
  start(): Promise<unknown>;
  addFile(file: unknown, params?: { info?: boolean }): Promise<{
    info?: {
      pageNumber: number;
      pageSizes: Array<[number, number]>;
    };
  }>;
  process(params?: Record<string, unknown>): Promise<ILovePdfTaskMetadata | ILovePdfValidationResult>;
  download(): Promise<Uint8Array | Buffer>;
  addElement?(element: unknown): unknown;
}

export interface ILovePdfClient {
  officeToPdf(buffer: Buffer, fileName: string): Promise<Buffer>;
  ocrPdf(buffer: Buffer, fileName: string, languages: string[]): Promise<Buffer>;
  runTask(taskType: ILovePdfTaskType, files: ILovePdfTaskFile[], processParams?: Record<string, unknown>): Promise<ILovePdfBinaryResult>;
  validatePdfa(file: ILovePdfTaskFile, processParams?: Record<string, unknown>): Promise<ILovePdfValidationResult>;
  editPdfText(file: ILovePdfTaskFile, params: ILovePdfEditTextParams): Promise<ILovePdfBinaryResult>;
}

function pickOutputBounds(pageSize?: [number, number]) {
  const width = pageSize?.[0] ?? 595;
  const height = pageSize?.[1] ?? 842;

  return { width, height };
}

function createTextElementConfig(
  pageSize: [number, number] | undefined,
  params: ILovePdfEditTextParams
) {
  const { width, height } = pickOutputBounds(pageSize);
  const elementWidth = Math.max(140, Math.round(width * 0.4));
  const elementHeight = 48;
  const horizontalPadding = 36;
  const verticalPadding = 34;

  const positions: Record<ILovePdfEditTextParams["position"], { x: number; y: number }> = {
    "top-left": { x: horizontalPadding, y: verticalPadding },
    "top-center": { x: Math.max(horizontalPadding, Math.round((width - elementWidth) / 2)), y: verticalPadding },
    "top-right": { x: Math.max(horizontalPadding, width - elementWidth - horizontalPadding), y: verticalPadding },
    "middle-center": {
      x: Math.max(horizontalPadding, Math.round((width - elementWidth) / 2)),
      y: Math.max(verticalPadding, Math.round((height - elementHeight) / 2))
    },
    "bottom-left": { x: horizontalPadding, y: Math.max(verticalPadding, height - elementHeight - verticalPadding) },
    "bottom-center": {
      x: Math.max(horizontalPadding, Math.round((width - elementWidth) / 2)),
      y: Math.max(verticalPadding, height - elementHeight - verticalPadding)
    },
    "bottom-right": {
      x: Math.max(horizontalPadding, width - elementWidth - horizontalPadding),
      y: Math.max(verticalPadding, height - elementHeight - verticalPadding)
    }
  };

  const coordinates = positions[params.position];

  return new TextElement({
    coordinates,
    dimensions: {
      w: elementWidth,
      h: elementHeight
    },
    text: params.text,
    pages: params.pages,
    rotation: params.rotation,
    opacity: params.opacity,
    font_family: "Arial Unicode MS",
    font_size: 18,
    font_style: "Bold",
    font_color: "#1E4EFF"
  });
}

export class ILovePdfSdkClient implements ILovePdfClient {
  private readonly api: ILovePDFApi;

  constructor(publicKey: string, secretKey: string) {
    this.api = new ILovePDFApi(publicKey, secretKey);
  }

  async officeToPdf(buffer: Buffer, fileName: string): Promise<Buffer> {
    const result = await this.runTask("officepdf", [{ buffer, fileName }]);
    return result.data;
  }

  async ocrPdf(buffer: Buffer, fileName: string, languages: string[]): Promise<Buffer> {
    const result = await this.runTask("pdfocr", [{ buffer, fileName }], {
      ocr_languages: languages
    });
    return result.data;
  }

  async runTask(
    taskType: ILovePdfTaskType,
    files: ILovePdfTaskFile[],
    processParams: Record<string, unknown> = {}
  ): Promise<ILovePdfBinaryResult> {
    return withTempWorkspace(async (directory) => {
      const task = this.api.newTask(taskType as never) as unknown as ILovePdfTask;
      await task.start();

      for (const [index, file] of files.entries()) {
        const localPath = await writeBuffer(path.join(directory, `${index + 1}-${file.fileName}`), file.buffer);
        await task.addFile(new ILovePDFFile(localPath, file.params), file.info ? { info: true } : undefined);
      }

      const meta = (await task.process(processParams)) as ILovePdfTaskMetadata;
      const data = await task.download();
      return {
        data: Buffer.from(data),
        meta
      };
    });
  }

  async validatePdfa(
    file: ILovePdfTaskFile,
    processParams: Record<string, unknown> = {}
  ): Promise<ILovePdfValidationResult> {
    return withTempWorkspace(async (directory) => {
      const task = this.api.newTask("validatepdfa" as never) as unknown as ILovePdfTask;
      await task.start();

      const localPath = await writeBuffer(path.join(directory, file.fileName), file.buffer);
      await task.addFile(new ILovePDFFile(localPath, file.params));

      return (await task.process(processParams)) as ILovePdfValidationResult;
    });
  }

  async editPdfText(file: ILovePdfTaskFile, params: ILovePdfEditTextParams): Promise<ILovePdfBinaryResult> {
    return withTempWorkspace(async (directory) => {
      const task = this.api.newTask("editpdf" as never) as unknown as ILovePdfTask;
      await task.start();

      const localPath = await writeBuffer(path.join(directory, file.fileName), file.buffer);
      const addedFile = await task.addFile(new ILovePDFFile(localPath, file.params), { info: true });
      const pageSize = addedFile.info?.pageSizes?.[0];

      task.addElement?.(createTextElementConfig(pageSize, params));

      const meta = (await task.process()) as ILovePdfTaskMetadata;
      const data = await task.download();
      return {
        data: Buffer.from(data),
        meta
      };
    });
  }
}

