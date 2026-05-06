import sharp from "sharp";
import { writeFileSync } from "node:fs";

// Build a 1200x630 OG image from a mid-sequence frame + brand overlay.
const src = "/home/user/procarequtar/public/sequence/desktop/frame-120.webp";

const overlay = Buffer.from(`
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1a1c1e" stop-opacity="0.0"/>
      <stop offset="0.55" stop-color="#1a1c1e" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#1a1c1e" stop-opacity="0.95"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g font-family="Inter, system-ui, sans-serif" fill="#fff">
    <text x="64" y="120" font-size="20" letter-spacing="6" opacity="0.7">PRO CARE · DOHA · C.R. 217949</text>
    <text x="64" y="430" font-size="86" font-weight="600" letter-spacing="-2.5">Engineered care,</text>
    <text x="64" y="520" font-size="86" font-weight="600" letter-spacing="-2.5">in 240 frames.</text>
    <circle cx="76" cy="588" r="4" fill="#FF5B1F"/>
    <text x="92" y="594" font-size="18" letter-spacing="4" opacity="0.8">CONSTRUCTION · CLEANING · MATERIALS · FM · PEST CONTROL</text>
  </g>
</svg>
`);

const out = await sharp(src)
  .resize(1200, 630, { fit: "cover", position: "center" })
  .composite([{ input: overlay, top: 0, left: 0 }])
  .png({ compressionLevel: 9 })
  .toBuffer();
writeFileSync("/home/user/procarequtar/public/og-image.png", out);
console.log("✓ Wrote og-image.png (" + out.length + " bytes)");
