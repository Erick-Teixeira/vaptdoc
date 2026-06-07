import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";
import { createConversionService } from "../src/services/conversion-service.js";

describe("conversion service", () => {
  it("converts a real jpeg buffer to png", async () => {
    const jpeg = await sharp({
      create: {
        width: 2,
        height: 2,
        channels: 3,
        background: { r: 240, g: 120, b: 80 }
      }
    })
      .jpeg()
      .toBuffer();

    const service = createConversionService({ convertApiClient: null });
    const result = await service.convert({
      toolId: "jpg-to-png",
      uploads: [
        {
          buffer: jpeg,
          filename: "sample.jpg",
          size: jpeg.byteLength,
          declaredMime: "image/jpeg"
        }
      ]
    });

    expect(result.filename).toBe("sample.png");
    expect(result.contentType).toContain("image/png");
    expect(result.data.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))).toBe(true);
  });

  it("prefers iLovePDF for docx to pdf when client is configured", async () => {
    const docxLikeBuffer = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      Buffer.from("[Content_Types].xml\nword/document.xml", "utf8")
    ]);
    const officeToPdf = vi.fn().mockResolvedValue(Buffer.from("%PDF-1.7\n"));
    const service = createConversionService({
      convertApiClient: null,
      ilovePdfClient: {
        officeToPdf,
        ocrPdf: vi.fn(),
        runTask: vi.fn(),
        validatePdfa: vi.fn(),
        editPdfText: vi.fn()
      }
    });

    const result = await service.convert({
      toolId: "docx-to-pdf",
      uploads: [
        {
          buffer: docxLikeBuffer,
          filename: "Relatorio Final.docx",
          size: docxLikeBuffer.byteLength,
          declaredMime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }
      ]
    });

    expect(officeToPdf).toHaveBeenCalledWith(docxLikeBuffer, "Relatorio-Final.docx");
    expect(result.provider).toBe("ilovepdf-officepdf");
    expect(result.filename).toBe("Relatorio-Final.pdf");
    expect(result.contentType).toContain("application/pdf");
  });

  it("normalizes malformed iLovePDF output extension metadata", async () => {
    const pdfLikeBuffer = Buffer.from("%PDF-1.7\n1 0 obj\n", "utf8");
    const runTask = vi.fn().mockResolvedValue({
      data: Buffer.from("%PDF-1.7\nmock"),
      meta: {
        download_filename: "resultado.pdf",
        filesize: 120,
        output_filesize: 120,
        output_filenumber: 1,
        output_extensions: '["pdf"]' as unknown as string[],
        timer: "0.1",
        status: "TaskSuccess"
      }
    });

    const service = createConversionService({
      convertApiClient: null,
      ilovePdfClient: {
        officeToPdf: vi.fn(),
        ocrPdf: vi.fn(),
        runTask,
        validatePdfa: vi.fn(),
        editPdfText: vi.fn()
      }
    });

    const result = await service.convert({
      toolId: "pdf-watermark",
      uploads: [
        {
          buffer: pdfLikeBuffer,
          filename: "manual.pdf",
          size: pdfLikeBuffer.byteLength,
          declaredMime: "application/pdf"
        }
      ]
    });

    expect(runTask).toHaveBeenCalled();
    expect(result.filename).toBe("manual-marca-dagua.pdf");
    expect(result.contentType).toContain("application/pdf");
  });

  it("uses Aspose 3D for dedicated model conversion", async () => {
    const objBuffer = Buffer.from("# cube\nv 0 0 0\nv 1 0 0\nf 1 2 2\n", "utf8");
    const convertFile = vi.fn().mockResolvedValue(Buffer.from("solid cube\nendsolid cube\n", "utf8"));
    const service = createConversionService({
      convertApiClient: null,
      ilovePdfClient: null,
      aspose3dClient: {
        convertFile
      }
    });

    const result = await service.convert({
      toolId: "3d-convert",
      uploads: [
        {
          buffer: objBuffer,
          filename: "modelo.obj",
          size: objBuffer.byteLength,
          declaredMime: "text/plain"
        }
      ],
      options: {
        target3dFormat: "stl"
      }
    });

    expect(convertFile).toHaveBeenCalledWith(objBuffer, "modelo.obj", "stl", "modelo.stl");
    expect(result.provider).toBe("aspose3d-saveas");
    expect(result.filename).toBe("modelo.stl");
    expect(result.contentType).toContain("model/stl");
  });

  it("reuses a cached result for the same file and conversion", async () => {
    const docxLikeBuffer = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      Buffer.from("[Content_Types].xml\nword/document.xml", "utf8")
    ]);
    const officeToPdf = vi.fn().mockResolvedValue(Buffer.from("%PDF-1.7\ncached"));
    const service = createConversionService({
      convertApiClient: null,
      ilovePdfClient: {
        officeToPdf,
        ocrPdf: vi.fn(),
        runTask: vi.fn(),
        validatePdfa: vi.fn(),
        editPdfText: vi.fn()
      }
    });

    const request = {
      toolId: "docx-to-pdf" as const,
      uploads: [
        {
          buffer: docxLikeBuffer,
          filename: "Relatorio Final.docx",
          size: docxLikeBuffer.byteLength,
          declaredMime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }
      ]
    };

    const first = await service.convert(request);
    const second = await service.convert(request);

    expect(officeToPdf).toHaveBeenCalledTimes(1);
    expect(first.filename).toBe("Relatorio-Final.pdf");
    expect(second.filename).toBe("Relatorio-Final.pdf");
    expect(Buffer.compare(first.data, second.data)).toBe(0);
  });
});
