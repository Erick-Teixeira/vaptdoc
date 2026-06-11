import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const loadPublicFile = (fileName: string) =>
  readFile(new URL(`../public/${fileName}`, import.meta.url), "utf8");

describe("admin dashboard structure", () => {
  it("uses a hidden full-page surface instead of the legacy modal", async () => {
    const html = await loadPublicFile("index.html");

    expect(html).toContain('class="admin-dashboard-page" id="admin-panel-page"');
    expect(html).toMatch(/id="admin-panel-page"[^>]*\shidden>/);
    expect(html).not.toContain('id="admin-panel-modal"');
  });

  it("keeps each administrative area in one accessible tab panel", async () => {
    const html = await loadPublicFile("index.html");
    const paneNames = ["overview", "account", "access", "promos", "activity"];

    for (const paneName of paneNames) {
      expect(html).toContain(`data-admin-pane-target="${paneName}"`);
      expect(html).toContain(`data-admin-pane="${paneName}"`);
      expect(html).toContain(`aria-controls="admin-pane-${paneName}"`);
    }
  });

  it("keeps document ids unique after the layout refactor", async () => {
    const html = await loadPublicFile("index.html");
    const ids = Array.from(html.matchAll(/\bid="([^"]+)"/g), (match) => match[1]);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
