import path from "node:path";
import { createEncryptedBackup } from "./backup-lib.mjs";

const sourceDir = path.resolve(process.argv[2] || process.env.DATA_DIR || "./data");
const outputDir = path.resolve(
  process.argv[3] || `./backups/vaptdoc-${new Date().toISOString().replaceAll(":", "-")}`
);

const manifest = await createEncryptedBackup({
  sourceDir,
  outputDir,
  secret: process.env.BACKUP_ENCRYPTION_KEY
});
console.log(`Backup criptografado criado em ${outputDir} com ${manifest.files.length} arquivo(s).`);
