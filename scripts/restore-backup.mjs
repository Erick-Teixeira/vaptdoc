import path from "node:path";
import { restoreEncryptedBackup } from "./backup-lib.mjs";

const backupDir = process.argv[2];
const destinationDir = process.argv[3];
if (!backupDir || !destinationDir) {
  throw new Error("Uso: npm run backup:restore -- <pasta-do-backup> <destino-vazio>");
}
const manifest = await restoreEncryptedBackup({
  backupDir: path.resolve(backupDir),
  destinationDir: path.resolve(destinationDir),
  secret: process.env.BACKUP_ENCRYPTION_KEY
});
console.log(`Restauração concluída com ${manifest.files.length} arquivo(s).`);
