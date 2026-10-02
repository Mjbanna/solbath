// Builds public/og-default.png (1200x630) - the link preview image used on
// WhatsApp, Slack, LinkedIn, X and anywhere else a solbath.com URL is shared.
//
//   node scripts/generate-og-image.mjs
//
// Brand navy ground + the white SolBath wordmark, kept well inside the safe
// area so nothing is cropped by rounded preview cards.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NAVY = "#0E2C4E"; // --navy, same as the site's dark sections
const W = 1200, H = 630;

const logo = await sharp(path.join(root, "public/logo.png"))
  .resize({ width: 620, withoutEnlargement: false })
  .toBuffer();
const { height: logoH } = await sharp(logo).metadata();

const strap = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
     <text x="${W / 2}" y="${H / 2 + (logoH ?? 0) / 2 + 72}" text-anchor="middle"
           font-family="DejaVu Sans, Helvetica, Arial, sans-serif" font-size="30" letter-spacing="3"
           fill="#FFFFFF" fill-opacity="0.72">BATHROOM · TILES · HARDWARE · KITCHEN</text>
   </svg>`,
);

await sharp({ create: { width: W, height: H, channels: 4, background: NAVY } })
  .composite([{ input: logo, gravity: "center", top: Math.round((H - (logoH ?? 0)) / 2) - 30, left: Math.round((W - 620) / 2) },
              { input: strap }])
  .png()
  .toFile(path.join(root, "public/og-default.png"));

const { size, width, height } = { ...(await sharp(path.join(root, "public/og-default.png")).metadata()), size: fs.statSync(path.join(root, "public/og-default.png")).size };
console.log(`public/og-default.png ${width}x${height}, ${(size / 1024).toFixed(0)} KB`);
