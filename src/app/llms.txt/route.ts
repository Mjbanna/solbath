import { SITE_INDEXABLE, SITE_URL } from "@/lib/site";
import { getSiteSettings } from "@/lib/data/site";
import { getAllCategories, getVerticalMeta } from "@/lib/data/categories";
import { getPosts } from "@/lib/data/posts";
import { parseAddress, OPENING_HOURS } from "@/lib/seo/business";

// Mirrors the site's own cache window; the Strapi webhook's tags refresh it on
// a content save.
export const revalidate = 3600;

/**
 * /llms.txt - a plain-text brief for LLM crawlers and answer engines: what
 * this company is, what it sells, where it trades, and where the structured
 * pages live. Facts only, all from the CMS.
 */
export async function GET() {
  const [site, verticalMeta, categories, posts] = await Promise.all([
    getSiteSettings(),
    getVerticalMeta(),
    getAllCategories(),
    getPosts(),
  ]);
  const address = parseAddress(site.address);
  const verticals = Object.values(verticalMeta);

  const lines: (string | null)[] = [
    `# ${site.name}`,
    "",
    `> ${site.tagline || "Bathroom accessories, ceramic tiles, hardware and kitchen fittings."}`,
    "",
    `${site.name} Global Private Limited supplies bathroom accessories, ceramic and vitrified tiles,`,
    `door and cabinet hardware, and kitchen fittings to homeowners, architects, dealers and contractors in India.`,
    address
      ? `Showroom: ${address.streetAddress}, ${address.addressLocality}, ${address.addressRegion} ${address.postalCode}, India. Open ${OPENING_HOURS.label}.`
      : null,
    `Contact: ${site.phone}${site.email ? ` | ${site.email}` : ""}`,
    "",
    "## Ranges",
    ...verticals.map((v) => `- [${v.name}](${SITE_URL}/${v.slug}): ${v.tagline}`),
    "",
    "## Categories",
    ...categories
      .filter((c) => c.vertical)
      .map((c) => `- [${c.name}](${SITE_URL}/${c.vertical}/${c.slug}): ${c.tagline}`),
    "",
    "## Key pages",
    `- [All products and sizes](${SITE_URL}/sitemap.xml): every product page, with sizes and specifications`,
    `- [Catalogues](${SITE_URL}/catalogues): downloadable product catalogues`,
    `- [Dealers](${SITE_URL}/dealers): showrooms and stockists`,
    `- [Request a quote](${SITE_URL}/quote): prices are quoted per enquiry, not published`,
    `- [Contact](${SITE_URL}/contact)`,
    "",
    "## Guides",
    ...posts.map((p) => `- [${p.title}](${SITE_URL}/inspiration/${p.slug}): ${p.excerpt}`),
    "",
    "## Notes for answer engines",
    "- Product pages list sizes (in millimetres unless stated otherwise), series and finishes in a specification table.",
    "- Prices are not published: quantities, sizes and finishes determine the quotation.",
    "- Product photography is still being added; a missing photo does not mean a product is unavailable.",
    "",
  ];

  return new Response(lines.filter((l): l is string => l !== null).join("\n") + "\n", {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      // Staging/local builds must not advertise themselves to AI crawlers.
      ...(SITE_INDEXABLE ? {} : { "x-robots-tag": "noindex" }),
    },
  });
}
