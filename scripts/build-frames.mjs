#!/usr/bin/env node
/**
 * One-shot frame processor for the cinematic home sequence.
 *
 *   in:  assets/sequence-source.zip   (240 portrait JPGs from Veo)
 *   out: public/sequence/desktop/frame-001.webp ... frame-240.webp  (1280w)
 *        public/sequence/mobile/frame-001.webp  ... frame-240.webp  (720w)
 *
 * For every frame we crop the bottom 8% (removes the "Veo" watermark) and
 * encode to WebP at quality 78. The desktop variant is 1280 wide; the
 * mobile variant is 720 wide. Output is committed so CI doesn't have to
 * rerun this.
 *
 * Usage:
 *   node scripts/build-frames.mjs
 *   npm run build:frames
 */
import { readFileSync, mkdirSync, existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import AdmZip from "adm-zip";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const zipPath = join(root, "assets", "sequence-source.zip");
const outDesktop = join(root, "public", "sequence", "desktop");
const outMobile = join(root, "public", "sequence", "mobile");

const CROP_BOTTOM_PCT = 0.08; // 8% off the bottom — hides "Veo" watermark
const QUALITY = 78;
const DESKTOP_WIDTH = 720; // source is 720 wide; we keep desktop at native
const MOBILE_WIDTH = 540;  // shrink mobile for ~40% bandwidth savings

if (!existsSync(zipPath)) {
  console.error(`✗ Source zip not found: ${zipPath}`);
  process.exit(1);
}

mkdirSync(outDesktop, { recursive: true });
mkdirSync(outMobile, { recursive: true });

console.log(`→ Reading ${zipPath}`);
const zip = new AdmZip(zipPath);
const entries = zip
  .getEntries()
  .filter((e) => /^ezgif-frame-\d+\.jpg$/i.test(e.entryName))
  .sort((a, b) => a.entryName.localeCompare(b.entryName));

console.log(`→ Found ${entries.length} frames`);

let processed = 0;
const concurrency = 8;

async function processOne(entry, idx) {
  const buf = entry.getData();
  const meta = await sharp(buf).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const cropY = 0;
  const cropH = Math.floor(h * (1 - CROP_BOTTOM_PCT));
  const baseName = `frame-${String(idx + 1).padStart(3, "0")}.webp`;

  const cropped = sharp(buf).extract({ left: 0, top: cropY, width: w, height: cropH });

  const desktopBuf = await cropped
    .clone()
    .resize({ width: DESKTOP_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 5 })
    .toBuffer();
  writeFileSync(join(outDesktop, baseName), desktopBuf);

  const mobileBuf = await cropped
    .clone()
    .resize({ width: MOBILE_WIDTH })
    .webp({ quality: QUALITY, effort: 5 })
    .toBuffer();
  writeFileSync(join(outMobile, baseName), mobileBuf);

  processed += 1;
  if (processed % 24 === 0 || processed === entries.length) {
    process.stdout.write(`  ${processed}/${entries.length}\r`);
  }
}

async function run() {
  // Process in waves of `concurrency`
  for (let i = 0; i < entries.length; i += concurrency) {
    const slice = entries.slice(i, i + concurrency);
    await Promise.all(slice.map((entry, j) => processOne(entry, i + j)));
  }
  console.log(`\n✓ Wrote ${entries.length} desktop frames → ${outDesktop}`);
  console.log(`✓ Wrote ${entries.length} mobile frames  → ${outMobile}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
