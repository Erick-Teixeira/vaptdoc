import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
type BackupModule = {
  createEncryptedBackup: (input: { sourceDir: string; outputDir: string; secret: string }) => Promise<{
    files: unknown[];
  }>;
  readAndVerifyBackup: (input: { backupDir: string; secret: string }) => Promise<{
    manifest: { files: unknown[] };
  }>;
  restoreEncryptedBackup: (input: { backupDir: string; destinationDir: string; secret: string }) => Promise<{
    files: unknown[];
  }>;
};

describe("encrypted backups", () => {
  const directories: string[] = [];

  afterEach(async () => {
    while (directories.length) {
      await rm(directories.pop()!, { recursive: true, force: true });
    }
  });

  it("encrypts, verifies and restores the data tree", async () => {
    // @ts-expect-error Backup scripts are runtime ESM helpers used by npm scripts.
    const { createEncryptedBackup, readAndVerifyBackup, restoreEncryptedBackup } = await import("../scripts/backup-lib.mjs") as BackupModule;
    const root = await mkdtemp(path.join(os.tmpdir(), "vaptdoc-backup-"));
    directories.push(root);
    const source = path.join(root, "source");
    const backup = path.join(root, "backup");
    const restored = path.join(root, "restored");
    await import("node:fs/promises").then(({ mkdir }) => mkdir(path.join(source, "nested"), { recursive: true }));
    await writeFile(path.join(source, "vaptdoc.sqlite"), "database-content");
    await writeFile(path.join(source, "nested", "result.pdf"), Buffer.from("%PDF-test"));

    const secret = "backup-secret-with-at-least-thirty-two-characters";
    const created = await createEncryptedBackup({ sourceDir: source, outputDir: backup, secret });
    expect(created.files).toHaveLength(2);
    const verified = await readAndVerifyBackup({ backupDir: backup, secret });
    expect(verified.manifest.files).toHaveLength(2);
    await restoreEncryptedBackup({ backupDir: backup, destinationDir: restored, secret });

    expect(await readFile(path.join(restored, "vaptdoc.sqlite"), "utf8")).toBe("database-content");
    expect(await readFile(path.join(restored, "nested", "result.pdf"), "utf8")).toBe("%PDF-test");
    await expect(readAndVerifyBackup({ backupDir: backup, secret: "wrong-secret" })).rejects.toThrow();
  });
});
