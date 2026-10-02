import { SITE_URL } from "@/lib/site";
import type { SiteSettings } from "@/lib/data/site";
import type { Product } from "@/lib/types";
import { OPENING_HOURS, parseAddress, sameAs } from "./business";

const abs = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
const ORG_ID = `${SITE_URL}/#organization`;
const BUSINESS_ID = `${SITE_URL}/#localbusiness`;

/** Drops undefined/empty values so no key is ever emitted with a null-ish value. */
function clean<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)),
  ) as T;
}

export function organizationNode(site: SiteSettings) {
  const address = parseAddress(site.address);
  const profiles = sameAs(site);
  return clean({
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    url: `${SITE_URL}/`,
    logo: clean({ "@type": "ImageObject", url: abs("/logo.png"), caption: site.name }),
    email: site.email || undefined,
    telephone: site.phone || undefined,
    address: address ? { "@type": "PostalAddress", ...address } : undefined,
    // sameAs only when real profiles exist in the CMS - never "#" placeholders.
    sameAs: profiles.length ? profiles : undefined,
  });
}

export function localBusinessNode(site: SiteSettings) {
  const address = parseAddress(site.address);
  return clean({
    // HomeGoodsStore: a showroom selling bathroom fittings, tiles and hardware.
    "@type": ["LocalBusiness", "HomeGoodsStore"],
    "@id": BUSINESS_ID,
    name: site.name,
    url: `${SITE_URL}/`,
    image: abs("/logo.png"),
    telephone: site.phone || undefined,
    email: site.email || undefined,
    address: address ? { "@type": "PostalAddress", ...address } : undefined,
    parentOrganization: { "@id": ORG_ID },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [...OPENING_HOURS.days],
        opens: OPENING_HOURS.opens,
        closes: OPENING_HOURS.closes,
      },
    ],
    // No priceRange / geo / sameAs: not known yet. Omitted rather than guessed.
  });
}

export function webSiteNode(site: SiteSettings) {
  return clean({
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: site.name,
    description: site.tagline || undefined,
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
    // No SearchAction: the site has no search results page to point at.
  });
}

export interface Crumb {
  name: string;
  path: string;
}

/** Home is always position 1; pass the trail below it. */
export function breadcrumbNode(trail: Crumb[]) {
  const items = [{ name: "Home", path: "/" }, ...trail];
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

export function productNode(product: Product, categoryName?: string) {
  const specs = product.specs.map((s) => ({ "@type": "PropertyValue", name: s.label, value: s.value }));
  const extra = [
    product.sizes?.length ? { "@type": "PropertyValue", name: "Available sizes", value: product.sizes.join(", ") } : null,
    product.finishes.length ? { "@type": "PropertyValue", name: "Finishes", value: product.finishes.join(", ") } : null,
    product.collection ? { "@type": "PropertyValue", name: "Series", value: product.collection } : null,
  ].filter(Boolean);

  return clean({
    "@type": "Product",
    "@id": abs(`/product/${product.slug}`) + "#product",
    name: product.name,
    description: product.shortDescription || product.description,
    url: abs(`/product/${product.slug}`),
    category: categoryName || undefined,
    brand: { "@type": "Brand", name: "SolBath" },
    // image only when a real photo exists - no placeholder stand-ins.
    image: product.images?.length ? product.images : undefined,
    additionalProperty: [...specs, ...extra],
    // No `offers`: there are no prices yet, and an offer without a price is
    // worse than none. Add offers (price, priceCurrency, availability) the day
    // pricing ships.
  });
}

export function itemListNode(products: Product[], listName: string) {
  return {
    "@type": "ItemList",
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: abs(`/product/${p.slug}`),
      name: p.name,
    })),
  };
}

export interface Faq {
  question: string;
  answer: string;
}

export function faqNode(faqs: Faq[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** Wraps nodes in a single @graph so one script tag carries the page's markup. */
export function graph(nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
