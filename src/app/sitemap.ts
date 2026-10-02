import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import {
  categoryEntries,
  indexPageDates,
  postEntries,
  productEntries,
  verticalEntries,
  type SitemapEntry,
} from "@/lib/data/sitemap-entries";

// Rebuilt at most hourly; the Strapi webhook revalidates the tags used by the
// queries below (verticals/categories/products/posts/...), so a content save
// refreshes this immediately rather than an hour later.
export const revalidate = 3600;

// Sitemaps protocol limits. At ~91 URLs we are far below, but crossing either
// silently truncates in Google's eyes, so fail loudly instead.
const MAX_URLS = 50_000;
const MAX_BYTES = 50 * 1024 * 1024;

const CACHE_FILE = path.join(os.tmpdir(), "solbath-sitemap-last-good.json");

/** Code-only pages: no CMS record, so no honest lastmod. */
const STATIC_PATHS = [
  "/", "/about", "/catalogues", "/contact", "/dealers", "/for-trade",
  "/inspiration", "/quote", "/privacy-policy", "/terms",
];
// /selection is excluded on purpose: noindex + robots Disallow (personal shortlist).

async function collect(): Promise<SitemapEntry[]> {
  const [dates, verticals, categories, products, posts] = await Promise.all([
    indexPageDates(),
    verticalEntries(),
    categoryEntries(),
    productEntries(),
    postEntries(),
  ]);
  return [
    ...STATIC_PATHS.map((p) => ({ path: p, lastModified: dates[p] })),
    ...verticals,
    ...categories,
    ...products,
    ...posts,
  ];
}

function toSitemap(entries: SitemapEntry[]): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  const unique = entries.filter((e) => !seen.has(e.path) && seen.add(e.path));

  if (unique.length > MAX_URLS) {
    console.error(
      `[sitemap] ${unique.length} URLs exceeds the ${MAX_URLS} limit — split into a sitemap index ` +
        `(Next.js generateSitemaps) before shipping more content. Serving the first ${MAX_URLS}.`,
    );
  }
  const capped = unique.slice(0, MAX_URLS);

  const bytes = capped.reduce((n, e) => n + e.path.length + SITE_URL.length + 120, 0);
  if (bytes > MAX_BYTES) console.error(`[sitemap] ~${bytes} bytes exceeds the ${MAX_BYTES} byte limit — split required.`);

  // `url` is absolute and self-canonical: exactly what each page declares in
  // alternates.canonical. lastModified is a Date -> W3C datetime in the XML.
  return capped.map((e) => ({
    url: `${SITE_URL}${e.path === "/" ? "/" : e.path}`,
    ...(e.lastModified ? { lastModified: new Date(e.lastModified) } : {}),
  }));
}

/** Survives a cold start after a CMS outage: last good copy lives on disk too. */
let lastGood: SitemapEntry[] | null = null;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const entries = await collect();
    if (entries.length === 0) throw new Error("no entries");
    lastGood = entries;
    await fs.writeFile(CACHE_FILE, JSON.stringify(entries), "utf8").catch(() => {});
    return toSitemap(entries);
  } catch (error) {
    console.error("[sitemap] generation failed, serving last good copy:", error);
    if (lastGood) return toSitemap(lastGood);
    try {
      const cached = JSON.parse(await fs.readFile(CACHE_FILE, "utf8")) as SitemapEntry[];
      return toSitemap(cached);
    } catch {
      // Never 500: a minimal, always-true sitemap beats an error page.
      return toSitemap(STATIC_PATHS.map((p) => ({ path: p })));
    }
  }
}
