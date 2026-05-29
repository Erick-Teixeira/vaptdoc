import { describe, expect, it } from "vitest";
import { formatTextByLayout, splitLines, splitParagraphs } from "../src/utils/text-layout.js";

describe("text layout utilities", () => {
  const sample = "Primeira linha\nSegunda linha\n\nTerceiro bloco\nQuarta linha";

  it("groups text by blocks", () => {
    expect(splitParagraphs(sample)).toEqual(["Primeira linha\nSegunda linha", "Terceiro bloco\nQuarta linha"]);
    expect(formatTextByLayout(sample, "blocks")).toBe("Primeira linha\nSegunda linha\n\nTerceiro bloco\nQuarta linha");
  });

  it("breaks text by individual lines", () => {
    expect(splitLines(sample)).toEqual(["Primeira linha", "Segunda linha", "Terceiro bloco", "Quarta linha"]);
    expect(formatTextByLayout(sample, "lines")).toBe("Primeira linha\nSegunda linha\nTerceiro bloco\nQuarta linha");
  });
});
