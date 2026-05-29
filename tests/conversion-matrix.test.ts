import path from "node:path";
import { writeFile } from "node:fs/promises";
import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";
import { createConversionService } from "../src/services/conversion-service.js";

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildSimplePdf(lines: string[]) {
  const textCommands = lines
    .map((line, index) => `BT /F1 12 Tf 72 ${720 - index * 18} Td (${escapePdfText(line)}) Tj ET`)
    .join("\n");

  const stream = `${textCommands}\n`;
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}endstream\nendobj\n`
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += object;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

function buildDocxLikeBuffer() {
  return Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x03, 0x04]),
    Buffer.from("[Content_Types].xml\nword/document.xml", "utf8")
  ]);
}

function buildMp4LikeBuffer() {
  return Buffer.from([
    0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d,
    0x00, 0x00, 0x02, 0x00, 0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32,
    0x61, 0x76, 0x63, 0x31, 0x6d, 0x70, 0x34, 0x31
  ]);
}

async function buildJpegBuffer() {
  return sharp({
    create: {
      width: 4,
      height: 4,
      channels: 3,
      background: { r: 240, g: 120, b: 80 }
    }
  })
    .jpeg()
    .toBuffer();
}

async function buildPngBuffer() {
  return sharp({
    create: {
      width: 4,
      height: 4,
      channels: 4,
      background: { r: 20, g: 120, b: 220, alpha: 0.5 }
    }
  })
    .png()
    .toBuffer();
}

function buildILovePdfBinaryResult(
  outputExtension = "pdf",
  options: { content?: Buffer; outputFileNumber?: number; downloadFilename?: string } = {}
) {
  return {
    data:
      options.content ??
      (outputExtension === "zip" ? Buffer.from([0x50, 0x4b, 0x03, 0x04]) : Buffer.from("%PDF-1.7\nmock")),
    meta: {
      download_filename: options.downloadFilename ?? `resultado.${outputExtension}`,
      filesize: 128,
      output_filesize: 128,
      output_filenumber: options.outputFileNumber ?? 1,
      output_extensions: [outputExtension],
      timer: "0.1",
      status: "TaskSuccess"
    }
  };
}

describe("conversion matrix", () => {
  it("validates jpg-to-png", async () => {
    const jpeg = await buildJpegBuffer();
    const service = createConversionService({ convertApiClient: null, ilovePdfClient: null });

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
    expect(result.provider).toBe("sharp-local");
    expect(result.data.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))).toBe(true);
  });

  it("validates jpeg-to-png", async () => {
    const jpeg = await buildJpegBuffer();
    const service = createConversionService({ convertApiClient: null, ilovePdfClient: null });

    const result = await service.convert({
      toolId: "jpeg-to-png",
      uploads: [
        {
          buffer: jpeg,
          filename: "sample.jpeg",
          size: jpeg.byteLength,
          declaredMime: "image/jpeg"
        }
      ]
    });

    expect(result.filename).toBe("sample.png");
    expect(result.provider).toBe("sharp-local");
    expect(result.contentType).toContain("image/png");
  });

  it("validates png-to-jpg", async () => {
    const png = await buildPngBuffer();
    const service = createConversionService({ convertApiClient: null, ilovePdfClient: null });

    const result = await service.convert({
      toolId: "png-to-jpg",
      uploads: [
        {
          buffer: png,
          filename: "sample.png",
          size: png.byteLength,
          declaredMime: "image/png"
        }
      ]
    });

    expect(result.filename).toBe("sample.jpg");
    expect(result.provider).toBe("sharp-local");
    expect(result.data.subarray(0, 2).equals(Buffer.from([0xff, 0xd8]))).toBe(true);
  });

  it("validates png-to-jpeg", async () => {
    const png = await buildPngBuffer();
    const service = createConversionService({ convertApiClient: null, ilovePdfClient: null });

    const result = await service.convert({
      toolId: "png-to-jpeg",
      uploads: [
        {
          buffer: png,
          filename: "sample.png",
          size: png.byteLength,
          declaredMime: "image/png"
        }
      ]
    });

    expect(result.filename).toBe("sample.jpeg");
    expect(result.provider).toBe("sharp-local");
    expect(result.contentType).toContain("image/jpeg");
  });

  it("validates mp4-to-mp3", async () => {
    const mp4 = buildMp4LikeBuffer();
    const runCommandImpl = vi.fn(async (_command: string, args: string[]) => {
      const outputPath = args.at(-1);
      if (!outputPath) {
        throw new Error("missing output path");
      }

      await writeFile(outputPath, Buffer.from([0x49, 0x44, 0x33, 0x03, 0x00, 0x00]));
      return { stdout: "", stderr: "" };
    });

    const service = createConversionService({
      convertApiClient: null,
      ilovePdfClient: null,
      runCommandImpl
    });

    const result = await service.convert({
      toolId: "mp4-to-mp3",
      uploads: [
        {
          buffer: mp4,
          filename: "clip.mp4",
          size: mp4.byteLength,
          declaredMime: "video/mp4"
        }
      ]
    });

    expect(result.filename).toBe("clip.mp3");
    expect(result.provider).toBe("ffmpeg-local");
    expect(result.data.subarray(0, 3).toString("utf8")).toBe("ID3");
  });

  it("validates docx-to-pdf via iLovePDF", async () => {
    const docxLikeBuffer = buildDocxLikeBuffer();
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
    expect(result.filename).toBe("Relatorio-Final.pdf");
    expect(result.provider).toBe("ilovepdf-officepdf");
  });

  it("validates docx-to-pdf fallback local", async () => {
    const docxLikeBuffer = buildDocxLikeBuffer();
    const runCommandImpl = vi.fn(async (_command: string, args: string[]) => {
      const outDir = args[4];
      const inputPath = args[5];
      if (!outDir || !inputPath) {
        throw new Error("invalid libreoffice args");
      }

      const outputPath = path.join(outDir, `${path.parse(inputPath).name}.pdf`);
      await writeFile(outputPath, Buffer.from("%PDF-1.7\nfallback"));
      return { stdout: "", stderr: "" };
    });

    const service = createConversionService({
      convertApiClient: null,
      ilovePdfClient: null,
      runCommandImpl
    });

    const result = await service.convert({
      toolId: "docx-to-pdf",
      uploads: [
        {
          buffer: docxLikeBuffer,
          filename: "Aula 01.docx",
          size: docxLikeBuffer.byteLength,
          declaredMime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }
      ]
    });

    expect(result.filename).toBe("Aula-01.pdf");
    expect(result.provider).toBe("libreoffice-local");
    expect(result.data.subarray(0, 4).toString("utf8")).toBe("%PDF");
  });

  it("validates pdf-to-text in block mode", async () => {
    const pdf = buildSimplePdf([
      "UNIVERSIDADE DO OESTE DE SANTA CATARINA - UNOESC",
      "CURSO: Farmacia",
      "DISCIPLINA: Teste",
      "TEXTO DE VALIDACAO LONGO PARA EXTRAIR COM SEGURANCA NO PARSER LOCAL"
    ]);
    const service = createConversionService({ convertApiClient: null, ilovePdfClient: null });

    const result = await service.convert({
      toolId: "pdf-to-text",
      uploads: [
        {
          buffer: pdf,
          filename: "fonte.pdf",
          size: pdf.byteLength,
          declaredMime: "application/pdf"
        }
      ],
      options: {
        textLayout: "blocks"
      }
    });

    const text = result.data.toString("utf8");
    expect(result.filename).toBe("fonte.txt");
    expect(result.provider).toBe("pdf-parser-local");
    expect(text).toContain("CURSO: Farmacia");
    expect(text).toContain("\n\n-- 1 of 1 --");
  });

  it("validates pdf-to-text in line mode with iLovePDF OCR fallback", async () => {
    const scannedPdf = buildSimplePdf(["x"]);
    const searchablePdf = buildSimplePdf([
      "UNIVERSIDADE DO OESTE DE SANTA CATARINA - UNOESC",
      "CURSO: Farmacia",
      "DISCIPLINA: Teste",
      "TEXTO OCR LONGO PARA VALIDAR O FALLBACK DA API DO ILOVEPDF"
    ]);
    const ocrPdf = vi.fn().mockResolvedValue(searchablePdf);
    const service = createConversionService({
      convertApiClient: null,
      ilovePdfClient: {
        officeToPdf: vi.fn(),
        ocrPdf,
        runTask: vi.fn(),
        validatePdfa: vi.fn(),
        editPdfText: vi.fn()
      }
    });

    const result = await service.convert({
      toolId: "pdf-to-text",
      uploads: [
        {
          buffer: scannedPdf,
          filename: "scan.pdf",
          size: scannedPdf.byteLength,
          declaredMime: "application/pdf"
        }
      ],
      options: {
        textLayout: "lines"
      }
    });

    const text = result.data.toString("utf8");
    expect(ocrPdf).toHaveBeenCalled();
    expect(result.provider).toBe("ilovepdf-pdfocr+pdf-parser");
    expect(text).toContain("DISCIPLINA: Teste");
    expect(text).not.toContain("\n\n-- 1 of 1 --");
  });

  it("validates pdf-to-docx in block mode", async () => {
    const pdf = buildSimplePdf([
      "UNIVERSIDADE DO OESTE DE SANTA CATARINA - UNOESC",
      "CURSO: Farmacia",
      "DISCIPLINA: Teste",
      "TEXTO DE VALIDACAO LONGO PARA GERAR UM DOCX LOCALMENTE COM BLOCOS"
    ]);
    const service = createConversionService({ convertApiClient: null, ilovePdfClient: null });

    const result = await service.convert({
      toolId: "pdf-to-docx",
      uploads: [
        {
          buffer: pdf,
          filename: "apostila.pdf",
          size: pdf.byteLength,
          declaredMime: "application/pdf"
        }
      ],
      options: {
        textLayout: "blocks"
      }
    });

    expect(result.filename).toBe("apostila.docx");
    expect(result.provider).toBe("pdf-parser-local+docx-local");
    expect(result.data.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))).toBe(true);
  });

  it("validates pdf-to-docx in line mode with iLovePDF OCR fallback", async () => {
    const scannedPdf = buildSimplePdf(["x"]);
    const searchablePdf = buildSimplePdf([
      "UNIVERSIDADE DO OESTE DE SANTA CATARINA - UNOESC",
      "CURSO: Farmacia",
      "DISCIPLINA: Teste",
      "TEXTO OCR LONGO PARA GERAR DOCX A PARTIR DO ILOVEPDF"
    ]);
    const ocrPdf = vi.fn().mockResolvedValue(searchablePdf);
    const service = createConversionService({
      convertApiClient: null,
      ilovePdfClient: {
        officeToPdf: vi.fn(),
        ocrPdf,
        runTask: vi.fn(),
        validatePdfa: vi.fn(),
        editPdfText: vi.fn()
      }
    });

    const result = await service.convert({
      toolId: "pdf-to-docx",
      uploads: [
        {
          buffer: scannedPdf,
          filename: "scan.pdf",
          size: scannedPdf.byteLength,
          declaredMime: "application/pdf"
        }
      ],
      options: {
        textLayout: "lines"
      }
    });

    expect(ocrPdf).toHaveBeenCalled();
    expect(result.filename).toBe("scan.docx");
    expect(result.provider).toBe("ilovepdf-pdfocr+pdf-parser+docx-local");
    expect(result.data.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))).toBe(true);
  });

  it("validates pdf merge with multiple files", async () => {
    const firstPdf = buildSimplePdf(["PRIMEIRO PDF COM TEXTO SUFICIENTE"]);
    const secondPdf = buildSimplePdf(["SEGUNDO PDF COM TEXTO SUFICIENTE"]);
    const runTask = vi.fn().mockResolvedValue(buildILovePdfBinaryResult("pdf"));
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
      toolId: "pdf-merge",
      uploads: [
        {
          buffer: firstPdf,
          filename: "parte-1.pdf",
          size: firstPdf.byteLength,
          declaredMime: "application/pdf"
        },
        {
          buffer: secondPdf,
          filename: "parte-2.pdf",
          size: secondPdf.byteLength,
          declaredMime: "application/pdf"
        }
      ]
    });

    expect(runTask).toHaveBeenCalledWith("merge", expect.any(Array));
    expect(runTask.mock.calls[0][1]).toHaveLength(2);
    expect(result.provider).toBe("ilovepdf-merge");
    expect(result.filename).toBe("parte-1-unido.pdf");
  });

  it("validates pdf split returning zip output", async () => {
    const pdf = buildSimplePdf(["PDF PARA DIVISAO CONTROLADA"]);
    const runTask = vi.fn().mockResolvedValue(
      buildILovePdfBinaryResult("pdf", {
        outputFileNumber: 3,
        content: Buffer.from([0x50, 0x4b, 0x03, 0x04])
      })
    );
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
      toolId: "pdf-split",
      uploads: [
        {
          buffer: pdf,
          filename: "caderno.pdf",
          size: pdf.byteLength,
          declaredMime: "application/pdf"
        }
      ],
      options: {
        splitMode: "ranges",
        ranges: "1-2,3-4"
      }
    });

    expect(runTask).toHaveBeenCalledWith(
      "split",
      expect.any(Array),
      expect.objectContaining({
        split_mode: "ranges",
        ranges: "1-2,3-4"
      })
    );
    expect(result.provider).toBe("ilovepdf-split");
    expect(result.filename).toBe("caderno-dividido.zip");
    expect(result.data.subarray(0, 2).toString("utf8")).toBe("PK");
  });

  it("validates image to pdf with multiple images", async () => {
    const jpeg = await buildJpegBuffer();
    const png = await buildPngBuffer();
    const runTask = vi.fn().mockResolvedValue(buildILovePdfBinaryResult("pdf"));
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
      toolId: "image-to-pdf",
      uploads: [
        {
          buffer: jpeg,
          filename: "foto.jpg",
          size: jpeg.byteLength,
          declaredMime: "image/jpeg"
        },
        {
          buffer: png,
          filename: "capa.png",
          size: png.byteLength,
          declaredMime: "image/png"
        }
      ]
    });

    expect(runTask).toHaveBeenCalledWith(
      "imagepdf",
      expect.any(Array),
      expect.objectContaining({
        orientation: "portrait",
        pagesize: "fit",
        margin: 0,
        merge_after: true
      })
    );
    expect(runTask.mock.calls[0][1]).toHaveLength(2);
    expect(result.provider).toBe("ilovepdf-imagepdf");
    expect(result.filename).toBe("foto-imagens.pdf");
  });

  it("validates watermark defaults to vaptdoc", async () => {
    const pdf = buildSimplePdf(["PDF PARA MARCA DAGUA"]);
    const runTask = vi.fn().mockResolvedValue(buildILovePdfBinaryResult("pdf"));
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
          buffer: pdf,
          filename: "manual.pdf",
          size: pdf.byteLength,
          declaredMime: "application/pdf"
        }
      ]
    });

    expect(runTask).toHaveBeenCalledWith(
      "watermark",
      expect.any(Array),
      expect.objectContaining({
        mode: "text",
        text: "vaptdoc",
        layer: "above"
      })
    );
    expect(result.provider).toBe("ilovepdf-watermark");
    expect(result.filename).toBe("manual-marca-dagua.pdf");
  });

  it("validates pdfa report generation", async () => {
    const pdf = buildSimplePdf(["PDFA VALIDATION TEST"]);
    const validatePdfa = vi.fn().mockResolvedValue({
      validations: [{ server_filename: "arquivo.pdf", status: "ok" }]
    });
    const service = createConversionService({
      convertApiClient: null,
      ilovePdfClient: {
        officeToPdf: vi.fn(),
        ocrPdf: vi.fn(),
        runTask: vi.fn(),
        validatePdfa,
        editPdfText: vi.fn()
      }
    });

    const result = await service.convert({
      toolId: "pdf-validate-pdfa",
      uploads: [
        {
          buffer: pdf,
          filename: "arquivo.pdf",
          size: pdf.byteLength,
          declaredMime: "application/pdf"
        }
      ]
    });

    const payload = JSON.parse(result.data.toString("utf8"));
    expect(validatePdfa).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: "arquivo.pdf" }),
      expect.objectContaining({ conformance: "pdfa-2b" })
    );
    expect(result.provider).toBe("ilovepdf-validatepdfa");
    expect(result.filename).toBe("arquivo-validacao-pdfa.json");
    expect(payload.validations[0].status).toBe("ok");
  });
});
