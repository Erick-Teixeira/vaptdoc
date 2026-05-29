import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export async function withTempWorkspace<T>(callback: (directory: string) => Promise<T>) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "vaptdoc-"));
  try {
    return await callback(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

export async function writeBuffer(filePath: string, buffer: Buffer) {
  await writeFile(filePath, buffer);
  return filePath;
}

export async function readBuffer(filePath: string) {
  return readFile(filePath);
}
