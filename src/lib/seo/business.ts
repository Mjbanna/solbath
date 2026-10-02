import type { SiteSettings } from "@/lib/data/site";

/**
 * Showroom opening hours, shown on /contact and published as
 * openingHoursSpecification. One constant so the page and the schema can
 * never drift apart.
 */
export const OPENING_HOURS = {
  label: "Mon–Sat, 10am–7pm",
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  opens: "10:00",
  closes: "19:00",
} as const;

export interface PostalAddress {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: "IN";
}

/**
 * Splits the single address string from Site Settings into schema.org fields.
 * The CMS value stays the single source of truth (NAP consistency: whatever
 * the owner types there is what search engines and the Google Business Profile
 * must agree with), so this only normalises whitespace, collapses a repeated
 * locality ("AHMEDABAD, AHMEDABAD") and splits on commas - it never rewrites
 * or re-cases the words.
 */
export function parseAddress(raw: string): PostalAddress | null {
  const parts = raw
    .replace(/ /g, " ")
    .split(",")
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((p, i, all) => p.toLowerCase() !== all[i - 1]?.toLowerCase()); // AHMEDABAD, AHMEDABAD
  if (parts.length < 4) return null;

  const postalCode = /^\d{6}$/.test(parts[parts.length - 1]) ? parts.pop()! : "";
  const addressRegion = parts.pop()!;
  const addressLocality = parts.pop()!;
  return {
    streetAddress: parts.join(", "),
    addressLocality,
    addressRegion,
    postalCode,
    addressCountry: "IN",
  };
}

/** Profiles for Organization.sameAs - only real URLs, never "#" placeholders. */
export function sameAs(site: SiteSettings): string[] {
  return Object.values(site.social ?? {})
    .filter((url): url is string => typeof url === "string")
    .map((url) => url.trim())
    .filter((url) => /^https?:\/\//i.test(url));
}
