// Generates the site's favicon / app icons from the SolBath logo's water-drop
// mark (the blue "O" in SOLBATH), replacing Create Next App's default icon.
//
//   node scripts/generate-icons.mjs
//
// Writes (Next.js picks these up by file convention and adds the <link> tags to
// every page — no metadata config needed):
//   src/app/favicon.ico     16/32/48 px, transparent  (browser tabs, bookmarks)
//   src/app/icon.png        96x96, transparent        (modern browsers, Google results)
//   src/app/apple-icon.png  180x180 on white          (iOS home screen; must be opaque)
//
// The drop in the logo is only ~78x90 px, so nothing larger is generated: a
// 512 px icon would be a blurry upscale. Swap SOURCE for a vector/high-res
// mark to add bigger sizes.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// fileURLToPath, not URL.pathname: the latter keeps "%20" for spaces in the path.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(root, "public/logo-light-trimmed.png");
const APP = path.join(root, "src/app");

// 1. Locate the drop: the only blue shapes in the logo (the lettering is navy).
const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let x0 = info.width, y0 = info.height, x1 = -1, y1 = -1;
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * 4;
    const [r, , b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a >= 40 && b - r > 70) {
      x0 = Math.min(x0, x); y0 = Math.min(y0, y);
      x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
  }
}
if (x1 < 0) throw new Error(`No blue drop found in ${SOURCE}`);
// 1px margin keeps the anti-aliased edge.
x0 = Math.max(0, x0 - 1); y0 = Math.max(0, y0 - 1);
x1 = Math.min(info.width - 1, x1 + 1); y1 = Math.min(info.height - 1, y1 + 1);
const w = x1 - x0 + 1;
const h = y1 - y0 + 1;

// 2. Square master: drop centered, small breathing room so it isn't clipped by
//    rounded tab/launcher masks.
const side = Math.ceil(Math.max(w, h) * 1.06);
const clear = { r: 0, g: 0, b: 0, alpha: 0 };
const master = await sharp(SOURCE)
  .extract({ left: x0, top: y0, width: w, height: h })
  .extend({
    left: Math.floor((side - w) / 2), right: Math.ceil((side - w) / 2),
    top: Math.floor((side - h) / 2), bottom: Math.ceil((side - h) / 2),
    background: clear,
  })
  .png()
  .toBuffer();

const png = (size) => sharp(master).resize(size, size, { kernel: "lanczos3" }).png().toBuffer();

// 3. favicon.ico — an ICO container of PNG images (supported by every current browser).
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = header.length + dir.length;
  images.forEach(({ size, buf }, n) => {
    const e = n * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, e);
    dir.writeUInt8(size >= 256 ? 0 : size, e + 1);
    dir.writeUInt16LE(1, e + 4);   // colour planes
    dir.writeUInt16LE(32, e + 6);  // bits per pixel
    dir.writeUInt32LE(buf.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += buf.length;
  });
  return Buffer.concat([header, dir, ...images.map((i) => i.buf)]);
}
const icoImages = await Promise.all([16, 32, 48].map(async (size) => ({ size, buf: await png(size) })));
fs.writeFileSync(path.join(APP, "favicon.ico"), ico(icoImages));

// 4. icon.png — close to the drop's native resolution, so it stays crisp.
fs.writeFileSync(path.join(APP, "icon.png"), await png(96));

// 5. apple-icon.png — iOS renders transparency as black, so flatten onto white
//    with the ~75% safe area Apple's rounded mask expects.
const inner = await png(136);
fs.writeFileSync(
  path.join(APP, "apple-icon.png"),
  await sharp({ create: { width: 180, height: 180, channels: 4, background: "#ffffff" } })
    .composite([{ input: inner, gravity: "center" }])
    .flatten({ background: "#ffffff" })
    .png()
    .toBuffer(),
);

console.log(`drop ${w}x${h} at (${x0},${y0}) -> favicon.ico [16,32,48], icon.png 96, apple-icon.png 180`);
