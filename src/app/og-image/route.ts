import sharp from "sharp";
import { SITE_URL } from "@/lib/site";

/**
 * Social preview images, resized from CMS photos.
 *
 * Product/category photos are 200-800 KB PNGs at arbitrary aspect ratios.
 * WhatsApp - the channel that matters most here - quietly drops previews whose
 * image is too large, so this renders a predictable 1200x630 JPEG on the brand
 * ground instead. Not under /api/ because robots.txt disallows that path and
 * Google will not fetch a disallowed image for rich results.
 *
 *   /og-image?src=https://api.solbath.com/uploads/foo.png
 */
const ALLOWED_HOST = (() => {
  try {
    return new URL(process.env.STRAPI_URL ?? "").host;
  } catch {
    return "";
  }
})();
const NAVY = { r: 14, g: 44, b: 78, alpha: 1 };

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("src");
  if (!src) return new Response("Missing src", { status: 400 });

  // Only this site's own CMS: never a general-purpose image proxy.
  let parsed: URL;
  try {
    parsed = new URL(src);
  } catch {
    return new Response("Bad src", { status: 400 });
  }
  if (!ALLOWED_HOST || parsed.host !== ALLOWED_HOST || !parsed.pathname.startsWith("/uploads/")) {
    return new Response("Forbidden src", { status: 403 });
  }

  try {
    const upstream = await fetch(parsed.toString(), { signal: AbortSignal.timeout(8000) });
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);
    const input = Buffer.from(await upstream.arrayBuffer());

    const body = await sharp(input)
      .resize(1200, 630, { fit: "contain", background: NAVY })
      .flatten({ background: NAVY })
      .jpeg({ quality: 82, progressive: true })
      .toBuffer();

    return new Response(new Uint8Array(body), {
      headers: {
        "content-type": "image/jpeg",
        // Immutable: the URL changes when the CMS file changes.
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[og-image] falling back to the branded image:", error);
    return Response.redirect(`${SITE_URL}/og-default.png`, 302);
  }
}
