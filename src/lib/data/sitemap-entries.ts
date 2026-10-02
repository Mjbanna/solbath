import { strapiList, strapiSingle } from "@/lib/cms/client";
import { Vertical } from "@/lib/types";

/** A URL's real last-modified date, straight from the record in Strapi. */
export interface SitemapEntry {
  path: string;
  lastModified?: string;
}

const iso = (value?: string | null) => (value ? new Date(value).toISOString() : undefined);

/** Newest updatedAt in a list — the real lastmod for an index page. */
function newest(rows: { updatedAt?: string | null }[]): string | undefined {
  const times = rows.map((r) => r.updatedAt).filter((t): t is string => Boolean(t)).sort();
  return iso(times[times.length - 1]);
}

export async function verticalEntries(): Promise<SitemapEntry[]> {
  const rows = await strapiList<{ slug: string; updatedAt: string }>(
    "/api/verticals?filters[isActive][$eq]=true&sort=sortOrder&fields[0]=slug&fields[1]=updatedAt&pagination[pageSize]=100",
    ["verticals"],
  );
  return rows.map((r) => ({ path: `/${r.slug}`, lastModified: iso(r.updatedAt) }));
}

export async function categoryEntries(): Promise<SitemapEntry[]> {
  const rows = await strapiList<{ slug: string; updatedAt: string; vertical: { key: Vertical } | null }>(
    "/api/categories?filters[isActive][$eq]=true&sort=sortOrder&fields[0]=slug&fields[1]=updatedAt" +
      "&populate[vertical][fields][0]=key&pagination[pageSize]=100",
    ["categories"],
  );
  return rows
    .filter((r) => r.vertical?.key)
    .map((r) => ({ path: `/${r.vertical!.key}/${r.slug}`, lastModified: iso(r.updatedAt) }));
}

export async function productEntries(): Promise<SitemapEntry[]> {
  // Strapi caps a page at 100 (cms/config/api.ts maxLimit), so page through.
  const rows: { slug: string; updatedAt: string }[] = [];
  for (let page = 1; page <= 50; page++) {
    const batch = await strapiList<{ slug: string; updatedAt: string }>(
      `/api/products?sort=sortOrder&fields[0]=slug&fields[1]=updatedAt&pagination[page]=${page}&pagination[pageSize]=100`,
      ["products"],
    );
    rows.push(...batch);
    if (batch.length < 100) break;
  }
  return rows.map((r) => ({ path: `/product/${r.slug}`, lastModified: iso(r.updatedAt) }));
}

export async function postEntries(): Promise<SitemapEntry[]> {
  const rows = await strapiList<{ slug: string; updatedAt: string }>(
    "/api/inspiration-posts?fields[0]=slug&fields[1]=updatedAt&pagination[pageSize]=100",
    ["posts"],
  );
  return rows.map((r) => ({ path: `/inspiration/${r.slug}`, lastModified: iso(r.updatedAt) }));
}

/**
 * lastmod for the index pages whose content comes from a collection, and for
 * the homepage (its content is the HomePage singleton). Code-only pages
 * (/about, /contact, /terms, ...) get no lastmod rather than a fake one.
 */
export async function indexPageDates(): Promise<Record<string, string | undefined>> {
  const [home, catalogs, dealers, posts] = await Promise.all([
    strapiSingle<{ updatedAt: string }>("/api/home-page?fields[0]=updatedAt", ["home-page"]),
    strapiList<{ updatedAt: string }>("/api/catalogs?fields[0]=updatedAt&pagination[pageSize]=100", ["catalogs"]),
    strapiList<{ updatedAt: string }>("/api/dealers?fields[0]=updatedAt&pagination[pageSize]=100", ["dealers"]),
    strapiList<{ updatedAt: string }>("/api/inspiration-posts?fields[0]=updatedAt&pagination[pageSize]=100", ["posts"]),
  ]);
  return {
    "/": iso(home?.updatedAt),
    "/catalogues": newest(catalogs),
    "/dealers": newest(dealers),
    "/inspiration": newest(posts),
  };
}
