import crypto from "node:crypto";
import path from "node:path";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";

function deriveKey(secret, salt) {
  if (!String(secret ?? "").trim()) {
    throw new Error("BACKUP_ENCRYPTION_KEY não foi configurada.");
  }
  return crypto.scryptSync(String(secret), salt, 32);
}

function encryptBuffer(buffer, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return {
    encrypted,
    iv: iv.toString("base64url"),
    tag: cipher.getAuthTag().toString("base64url")
  };
}

function decryptBuffer(buffer, key, iv, tag) {
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(buffer), decipher.final()]);
}

function hashBuffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function walkFiles(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(current, entry.name);
    if (entry.isSymbolicLink()) {
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...await walkFiles(root, absolute));
    } else if (entry.isFile()) {
      files.push({
        absolute,
        relative: path.relative(root, absolute).replaceAll("\\", "/")
      });
    }
  }
  return files;
}

function safeRestorePath(root, relative) {
  const absoluteRoot = path.resolve(root);
  const target = path.resolve(absoluteRoot, relative);
  if (target !== absoluteRoot && !target.startsWith(`${absoluteRoot}${path.sep}`)) {
    throw new Error(`Caminho inválido no backup: ${relative}`);
  }
  return target;
}

export async function createEncryptedBackup({ sourceDir, outputDir, secret }) {
  const source = path.resolve(sourceDir);
  const sourceStats = await stat(source);
  if (!sourceStats.isDirectory()) {
    throw new Error("A origem do backup precisa ser uma pasta.");
  }
  await mkdir(path.join(outputDir, "files"), { recursive: true });
  const salt = crypto.randomBytes(16);
  const key = deriveKey(secret, salt);
  const files = await walkFiles(source);
  const manifest = {
    version: 1,
    createdAt: new Date().toISOString(),
    files: []
  };

  for (const [index, file] of files.entries()) {
    const data = await readFile(file.absolute);
    const encrypted = encryptBuffer(data, key);
    const blob = `files/${String(index).padStart(6, "0")}.bin`;
    await writeFile(path.join(outputDir, blob), encrypted.encrypted, { flag: "wx" });
    manifest.files.push({
      path: file.relative,
      size: data.byteLength,
      sha256: hashBuffer(data),
      blob,
      iv: encrypted.iv,
      tag: encrypted.tag
    });
  }

  const encryptedManifest = encryptBuffer(Buffer.from(JSON.stringify(manifest)), key);
  await writeFile(path.join(outputDir, "manifest.enc"), encryptedManifest.encrypted, { flag: "wx" });
  await writeFile(path.join(outputDir, "backup.json"), JSON.stringify({
    version: 1,
    algorithm: "aes-256-gcm",
    kdf: "scrypt",
    salt: salt.toString("base64url"),
    manifest: {
      file: "manifest.enc",
      iv: encryptedManifest.iv,
      tag: encryptedManifest.tag
    }
  }, null, 2), { flag: "wx" });
  return manifest;
}

export async function readAndVerifyBackup({ backupDir, secret }) {
  const header = JSON.parse(await readFile(path.join(backupDir, "backup.json"), "utf8"));
  if (header.version !== 1 || header.algorithm !== "aes-256-gcm" || header.kdf !== "scrypt") {
    throw new Error("Formato de backup não suportado.");
  }
  const key = deriveKey(secret, Buffer.from(header.salt, "base64url"));
  const manifestBuffer = decryptBuffer(
    await readFile(path.join(backupDir, header.manifest.file)),
    key,
    header.manifest.iv,
    header.manifest.tag
  );
  const manifest = JSON.parse(manifestBuffer.toString("utf8"));
  for (const file of manifest.files) {
    const decrypted = decryptBuffer(
      await readFile(path.join(backupDir, file.blob)),
      key,
      file.iv,
      file.tag
    );
    if (decrypted.byteLength !== file.size || hashBuffer(decrypted) !== file.sha256) {
      throw new Error(`Falha de integridade no arquivo ${file.path}.`);
    }
  }
  return { manifest, key };
}

export async function restoreEncryptedBackup({ backupDir, destinationDir, secret }) {
  const { manifest, key } = await readAndVerifyBackup({ backupDir, secret });
  await mkdir(destinationDir, { recursive: true });
  for (const file of manifest.files) {
    const target = safeRestorePath(destinationDir, file.path);
    await mkdir(path.dirname(target), { recursive: true });
    const decrypted = decryptBuffer(
      await readFile(path.join(backupDir, file.blob)),
      key,
      file.iv,
      file.tag
    );
    await writeFile(target, decrypted, { flag: "wx" });
  }
  return manifest;
}
