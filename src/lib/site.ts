// Public origin of this deployment (https://solbath.com in production,
// https://test.solbath.com on staging). Baked in at build time — the web image
// is built per environment (SITE_URL build arg, see deploy/*/web.Dockerfile).
// Drives metadataBase (canonical URLs, og:url), robots.txt and sitemap.xml.
export const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

// Only a build with SITE_INDEXABLE=true (production) may be indexed. Every other
// build — staging, local — serves `Disallow: /` and a noindex robots meta tag,
// so a copy of the site can never compete with, or deindex, the real one.
export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true";
