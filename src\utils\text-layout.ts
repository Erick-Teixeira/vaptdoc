import type { TextLayoutMode } from "../types.js";

export interface ExtractedTextSource {
  text: string;
  usedOcr: boolean;
  provider: string;
}

export interface ParsedStructuredLine {
  raw: string;
  kind: "metadata" | "title" | "section-heading" | "caption" | "body";
  label?: string;
  value?: string;
}

export interface ParsedStructuredSection {
  kind: "metadata" | "title" | "body" | "mixed";
  lines: ParsedStructuredLine[];
}

export function normalizeBlockText(value: string) {
  return value
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function splitParagraphs(value: string) {
  return normalizeBlockText(value)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function splitLines(value: string) {
  return value
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function formatTextByLayout(value: string, layout: TextLayoutMode) {
  if (layout === "lines") {
    return splitLines(value).join("\n");
  }

  return splitParagraphs(value).join("\n\n");
}

function uppercaseRatio(line: string) {
  const letters = Array.from(line).filter((character) => /\p{L}/u.test(character));
  if (letters.length === 0) {
    return 0;
  }

  const uppercaseLetters = letters.filter((character) => character === character.toUpperCase()).length;
  return uppercaseLetters / letters.length;
}

function parseStructuredLine(rawLine: string): ParsedStructuredLine {
  const line = rawLine.trim();

  const metadataMatch = line.match(/^([\p{Lu}0-9][\p{Lu}0-9 ./()_-]{1,40}:)\s*(.+)$/u);
  if (metadataMatch) {
    return {
      raw: line,
      kind: "metadata",
      label: metadataMatch[1],
      value: metadataMatch[2]
    };
  }

  if (/^figura\s+\d+/iu.test(line)) {
    return { raw: line, kind: "caption" };
  }

  if (/^\d+(\.\d+)*\s+/u.test(line) || /^[\p{Lu}][^:]{0,80}:$/u.test(line)) {
    return { raw: line, kind: "section-heading" };
  }

  const ratio = uppercaseRatio(line);
  if (ratio >= 0.72 && line.length >= 18) {
    return { raw: line, kind: "title" };
  }

  return { raw: line, kind: "body" };
}

export function parseStructuredSections(value: string): ParsedStructuredSection[] {
  return splitParagraphs(value)
    .map((section) => {
      const lines = splitLines(section).map(parseStructuredLine);

      const kinds = new Set(lines.map((line) => line.kind));
      let kind: ParsedStructuredSection["kind"] = "mixed";

      if (kinds.size === 1 && kinds.has("metadata")) {
        kind = "metadata";
      } else if ([...kinds].every((item) => item === "title" || item === "section-heading")) {
        kind = "title";
      } else if ([...kinds].every((item) => item === "body" || item === "caption")) {
        kind = "body";
      }

      return { kind, lines };
    })
    .filter((section) => section.lines.length > 0);
}
