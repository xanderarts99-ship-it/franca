import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

const PUBLIC_DIR = path.resolve(__dirname, "../public");
const LOGO_PATH = path.resolve(__dirname, "../public/images/logo.jpeg");

async function removeWhiteBackground(inputBuffer: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buf = Buffer.from(data);
  for (let i = 0; i < buf.length; i += 4) {
    const r = buf[i];
    const g = buf[i + 1];
    const b = buf[i + 2];
    if (r > 240 && g > 240 && b > 240) {
      buf[i + 3] = 0;
    }
  }

  return sharp(buf, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

async function main() {
  console.log("Reading logo...");
  const logoBuffer = fs.readFileSync(LOGO_PATH);
  const meta = await sharp(logoBuffer).metadata();
  const width = meta.width!;
  const height = meta.height!;
  console.log(`Logo dimensions: ${width}×${height}`);

  // ── Icon crop: top 55% (house + palm tree, no text) ──────────────────
  const iconHeight = Math.round(height * 0.55);
  const iconCroppedBuffer = await sharp(logoBuffer)
    .extract({ left: 0, top: 0, width, height: iconHeight })
    .toBuffer();
  console.log(`Cropped icon region: ${width}×${iconHeight}`);

  // ── Remove white background from icon ────────────────────────────────
  console.log("Removing white background from icon crop...");
  const iconTransparent = await removeWhiteBackground(iconCroppedBuffer);

  // ── Generate favicon sizes ────────────────────────────────────────────
  const faviconSizes = [
    { name: "favicon-16x16.png", size: 16 },
    { name: "favicon-32x32.png", size: 32 },
    { name: "apple-touch-icon.png", size: 180 },
    { name: "android-chrome-192x192.png", size: 192 },
    { name: "android-chrome-512x512.png", size: 512 },
  ];

  for (const { name, size } of faviconSizes) {
    const outPath = path.join(PUBLIC_DIR, name);
    await sharp(iconTransparent)
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(outPath);
    const stat = fs.statSync(outPath);
    console.log(`  ✓ ${name} — ${(stat.size / 1024).toFixed(1)} KB`);
  }

  // Copy favicon-32x32.png as favicon.ico (browsers accept PNG named .ico)
  fs.copyFileSync(
    path.join(PUBLIC_DIR, "favicon-32x32.png"),
    path.join(PUBLIC_DIR, "favicon.ico")
  );
  console.log("  ✓ favicon.ico (copied from favicon-32x32.png)");

  // ── logo-transparent.png (400×400, full logo with bg removed) ────────
  console.log("Generating logo-transparent.png...");
  const fullLogoTransparent = await removeWhiteBackground(logoBuffer);
  const logoTransparentPath = path.join(PUBLIC_DIR, "logo-transparent.png");
  await sharp(fullLogoTransparent)
    .resize(400, 400, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(logoTransparentPath);
  const ltStat = fs.statSync(logoTransparentPath);
  console.log(`  ✓ logo-transparent.png — ${(ltStat.size / 1024).toFixed(1)} KB`);

  // ── OG image: 1200×630 dark green canvas + full logo centered ────────
  console.log("Generating og-image.jpg...");
  const OG_WIDTH = 1200;
  const OG_HEIGHT = 630;
  const LOGO_H = Math.round(OG_HEIGHT * 0.4); // ~252px
  const LOGO_W = LOGO_H; // square logo

  const logoForOg = await sharp(logoBuffer)
    .resize(LOGO_W, LOGO_H, { fit: "contain", background: { r: 27, g: 67, b: 50 } })
    .jpeg({ quality: 95 })
    .toBuffer();

  const left = Math.round((OG_WIDTH - LOGO_W) / 2);
  const top = Math.round((OG_HEIGHT - LOGO_H) / 2);

  const ogPath = path.join(PUBLIC_DIR, "og-image.jpg");
  await sharp({
    create: {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      channels: 3,
      background: { r: 27, g: 67, b: 50 },
    },
  })
    .composite([{ input: logoForOg, left, top }])
    .jpeg({ quality: 90 })
    .toFile(ogPath);

  const ogStat = fs.statSync(ogPath);
  console.log(`  ✓ og-image.jpg — ${(ogStat.size / 1024).toFixed(1)} KB`);

  console.log("\nAll favicon assets generated successfully!");
  console.log("\nPublic directory contents:");
  const publicFiles = fs.readdirSync(PUBLIC_DIR).filter(f =>
    [".png", ".jpg", ".ico", ".svg", ".webmanifest", ".txt"].some(ext => f.endsWith(ext))
  );
  for (const f of publicFiles.sort()) {
    const stat = fs.statSync(path.join(PUBLIC_DIR, f));
    console.log(`  ${f} — ${(stat.size / 1024).toFixed(1)} KB`);
  }
}

main().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
