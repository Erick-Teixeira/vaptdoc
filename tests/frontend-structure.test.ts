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

describe("account dashboard structure", () => {
  it("keeps overview focused on summaries and interactive charts", async () => {
    const html = await loadPublicFile("index.html");

    expect(html).toContain('id="account-usage-chart"');
    expect(html).toContain('id="account-status-donut"');
    expect(html).not.toContain('id="account-shortcut-profile"');
    expect(html).not.toContain('id="account-shortcut-settings"');
    expect(html).not.toContain('id="account-shortcut-admin"');
  });

  it("provides a mobile menu control without duplicating account destinations", async () => {
    const html = await loadPublicFile("index.html");

    expect(html).toContain('id="account-dashboard-menu-toggle"');
    expect(html).toContain('aria-controls="account-dashboard-menu"');
    expect(html).toContain('id="account-dashboard-menu"');
    expect(html.match(/id="account-dashboard-profile-nav"/g)).toHaveLength(1);
    expect(html.match(/id="account-dashboard-subscription-nav"/g)).toHaveLength(1);
    expect(html.match(/id="account-dashboard-admin-nav"/g)).toHaveLength(1);
  });

  it("renders plan and credential management as full-page account surfaces", async () => {
    const html = await loadPublicFile("index.html");
    const styles = await loadPublicFile("styles.css");

    expect(html).toContain('class="account-detail-page account-pane-modal" id="account-subscription-modal"');
    expect(html).toContain('class="account-detail-page account-pane-modal" id="account-profile-modal"');
    expect(html).not.toMatch(/billing-modal account-pane-modal" id="account-(subscription|profile)-modal"/);
    expect(styles).toContain(".account-detail-page {");
    expect(styles).toContain("height: 100dvh;");
  });
});
