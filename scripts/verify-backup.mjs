import path from "node:path";
import { readAndVerifyBackup } from "./backup-lib.mjs";

const backupDir = process.argv[2];
if (!backupDir) {
  throw new Error("Uso: npm run backup:verify -- <pasta-do-backup>");
}
const { manifest } = await readAndVerifyBackup({
  backupDir: path.resolve(backupDir),
  secret: process.env.BACKUP_ENCRYPTION_KEY
});
console.log(`Backup íntegro: ${manifest.files.length} arquivo(s), criado em ${manifest.createdAt}.`);
