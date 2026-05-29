import { describe, expect, it } from "vitest";
import { assertToolCompatibility, detectUpload } from "../src/utils/file-validation.js";

function makeZipLikeBuffer(...entries: string[]) {
  return Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from(entries.join("\n"), "utf8")]);
}

describe("file validation", () => {
  it("detects a pdf from magic bytes", async () => {
    const buffer = Buffer.from("%PDF-1.7\n1 0 obj");
    const detected = await detectUpload(buffer, "contrato.pdf");
    expect(detected.kind).toBe("pdf");
    expect(detected.safeStem).toBe("contrato");
  });

  it("accepts docx only when extension and zip signature match", async () => {
    const buffer = makeZipLikeBuffer("[Content_Types].xml", "word/document.xml");
    const detected = await detectUpload(buffer, "relatorio.docx");
    expect(detected.kind).toBe("docx");
  });

  it("rejects zip files that only pretend to be docx", async () => {
    const fakeDocx = makeZipLikeBuffer("random.txt", "notes/readme.md");
    await expect(detectUpload(fakeDocx, "relatorio.docx")).rejects.toThrow(/nao foi possivel reconhecer|nao suportado/i);
  });

  it("sanitizes upload names before reusing them as stems", async () => {
    const buffer = Buffer.from("%PDF-1.7\n1 0 obj");
    const detected = await detectUpload(buffer, "..\\..\\Relatorio Final (v2).pdf");
    expect(detected.safeStem).toBe("Relatorio-Final-v2");
  });

  it("detects common 3d uploads by extension and structure", async () => {
    const obj = Buffer.from("# cube\nv 0 0 0\nv 1 0 0\nf 1 2 2\n", "utf8");
    const detectedObj = await detectUpload(obj, "modelo.obj");
    expect(detectedObj.kind).toBe("obj");

    const threeMf = makeZipLikeBuffer("[Content_Types].xml", "3D/3dmodel.model");
    const detected3mf = await detectUpload(threeMf, "peca.3mf");
    expect(detected3mf.kind).toBe("3mf");
  });

  it("rejects misleading 3d extensions without matching structure", async () => {
    const fakeFbx = Buffer.from("plain text that is not a 3d model", "utf8");
    await expect(detectUpload(fakeFbx, "modelo.fbx")).rejects.toThrow(/nao foi possivel reconhecer|nao suportado/i);

    const fakeStl = Buffer.from("solid but without facets", "utf8");
    await expect(detectUpload(fakeStl, "modelo.stl")).rejects.toThrow(/nao foi possivel reconhecer|nao suportado/i);
  });

  it("rejects incompatible tool and detected kind", () => {
    expect(() => assertToolCompatibility("docx-to-pdf", ["pdf"])).toThrow(/nao aceita/i);
  });

  it("accepts the dedicated 3d converter with supported model kinds", () => {
    expect(() => assertToolCompatibility("3d-convert", ["stl"])).not.toThrow();
  });

  it("rejects 3mf for the public 3d converter catalog", () => {
    expect(() => assertToolCompatibility("3d-convert", ["3mf"])).toThrow(/nao aceita/i);
  });
});
