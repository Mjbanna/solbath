import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const SITE_NAME = "SolBath";
export const DEFAULT_TITLE = "SolBath - Bathroom Accessories, Ceramic Tiles, Hardware & Kitchen";
export const DEFAULT_DESCRIPTION =
  "Premium bathroom accessories, ceramic tiles, hardware and kitchen solutions. Browse the catalog, get inspired, and request a quote.";

/** Branded 1200x630 fallback (scripts/generate-og-image.mjs). */
export const DEFAULT_OG_IMAGE = {
  url: "/og-default.png",
  width: 1200,
  height: 630,
  alt: "SolBath - bathroom accessories, ceramic tiles, hardware and kitchen fittings",
};

interface PageMetaInput {
  title?: string;
  description?: string;
  /** Path only; canonical and og:url are built from SITE_URL. */
  path: string;
  /** Absolute image URLs (product photos). Falls back to the branded image. */
  images?: string[];
  noIndex?: boolean;
}

/**
 * One source for a page's title/description/canonical/OG/Twitter tags.
 * Next merges metadata shallowly - a page that sets `openGraph` replaces the
 * parent's entirely - so every page builds its full set through this helper
 * instead of relying on inheritance.
 */
export function pageMetadata({ title, description, path, images, noIndex }: PageMetaInput): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description ?? DEFAULT_DESCRIPTION;
  // CMS photos: dimensions are not stored, so width/height are omitted (they
  // are hints, not requirements); alt is the page's own title.
  const ogImages = images?.length
    ? images.map((u) => ({ url: u, alt: title ?? SITE_NAME }))
    : [DEFAULT_OG_IMAGE];

  return {
    ...(title ? { title } : {}),
    description: desc,
    alternates: { canonical: path },
    ...(noIndex ? { robots: { index: false } } : {}),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_IN",
      title: fullTitle,
      description: desc,
      url,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: ogImages.map((i) => (typeof i === "string" ? i : i.url)),
    },
  };
}
