import path from "node:path";
import { access, copyFile, mkdir } from "node:fs/promises";
import sharp from "sharp";

const assetRoot = path.resolve(import.meta.dirname, "../public/assets");
const vendorAssetRoot = path.resolve(assetRoot, "vendor");
const pdfJsBuildRoot = path.resolve(import.meta.dirname, "../node_modules/pdfjs-dist/build");

const imageJobs = [
  {
    source: "vaptdoc-symbol-clean.png",
    outputs: [
      { file: "vaptdoc-symbol-clean.webp" },
      { file: "vaptdoc-symbol-clean-320.webp", width: 320 },
      { file: "vaptdoc-symbol-clean-640.webp", width: 640 }
    ]
  },
  {
    source: "vaptdoc-logo-transparent.png",
    outputs: [
      { file: "vaptdoc-logo-transparent.webp" },
      { file: "vaptdoc-logo-transparent-640.webp", width: 640 }
    ]
  }
];

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function generateAssetVariants() {
  await mkdir(assetRoot, { recursive: true });

  for (const job of imageJobs) {
    const sourcePath = path.join(assetRoot, job.source);
    if (!(await fileExists(sourcePath))) {
      continue;
    }

    for (const output of job.outputs) {
      const pipeline = sharp(sourcePath);
      if (output.width) {
        pipeline.resize({ width: output.width, withoutEnlargement: true });
      }

      await pipeline.webp({ quality: 86 }).toFile(path.join(assetRoot, output.file));
    }
  }
}

async function copyVendorAssets() {
  await mkdir(vendorAssetRoot, { recursive: true });

  const vendorFiles = [
    ["pdf.mjs", "pdf.mjs"],
    ["pdf.worker.mjs", "pdf.worker.mjs"]
  ];

  for (const [sourceFile, targetFile] of vendorFiles) {
    const sourcePath = path.join(pdfJsBuildRoot, sourceFile);
    if (!(await fileExists(sourcePath))) {
      continue;
    }

    await copyFile(sourcePath, path.join(vendorAssetRoot, targetFile));
  }
}

await generateAssetVariants();
await copyVendorAssets();
