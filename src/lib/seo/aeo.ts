import type { Category, Product } from "@/lib/types";
import type { SiteSettings } from "@/lib/data/site";
import type { Faq } from "./jsonld";
import { OPENING_HOURS, parseAddress } from "./business";

/**
 * Answer-first copy and FAQs for answer engines (AI Overviews, Perplexity,
 * Copilot), which quote a direct factual sentence far more readily than
 * marketing prose.
 *
 * Everything here is composed from data the site already holds - names, sizes,
 * series, finishes, the showroom address. Nothing asserts a technical claim
 * (water absorption, PEI rating, "vitrified vs ceramic") that the catalogue
 * cannot back: those FAQs need copy from the owner before they can be added.
 */

const list = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

const seriesOf = (products: Product[]) =>
  [...new Set(products.map((p) => p.collection).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "en", { numeric: true }),
  );

const sizesOf = (products: Product[]) =>
  [...new Set(products.flatMap((p) => p.sizes ?? []))];

/** One factual sentence, placed above the marketing copy. */
export function categoryLead(category: Category, products: Product[]): string | null {
  if (!products.length) return null;
  const sizes = sizesOf(products);
  const series = seriesOf(products);
  const parts = [
    `SolBath lists ${products.length} ${category.name.toLowerCase()} ${products.length === 1 ? "product" : "products"}`,
  ];
  if (series.length > 1) parts.push(`across ${series.length} series`);
  if (sizes.length) parts.push(`in ${sizes.length} ${sizes.length === 1 ? "size" : "sizes"}`);
  return `${parts.join(" ")}, supplied from the SolBath showroom in Ahmedabad.`;
}

export function productLead(product: Product, categoryName?: string): string | null {
  const bits: string[] = [];
  if (product.sizes?.length) bits.push(`${product.sizes.length} ${product.sizes.length === 1 ? "size" : "sizes"} (${list(product.sizes)})`);
  if (product.finishes.length) bits.push(`${product.finishes.length} ${product.finishes.length === 1 ? "finish" : "finishes"} (${list(product.finishes)})`);
  if (!bits.length) return null;
  const where = categoryName ? `SolBath's ${categoryName} range` : "the SolBath catalogue";
  const series = product.collection ? ` (${product.collection})` : "";
  return `${product.name} is listed in ${where}${series}, available in ${list(bits)}.`;
}

function whereToBuy(site: SiteSettings, what: string): Faq | null {
  const address = parseAddress(site.address);
  if (!address) return null;
  return {
    question: `Where can I buy ${what} in Ahmedabad?`,
    answer:
      `SolBath Global Private Limited supplies ${what} from its showroom at ${address.streetAddress}, ` +
      `${address.addressLocality}, ${address.addressRegion} ${address.postalCode}, open ${OPENING_HOURS.label}. ` +
      `Call ${site.phone} or message the team on WhatsApp, or use the dealers page to find a stockist near you.`,
  };
}

function howToPrice(what: string): Faq {
  return {
    question: `How do I get a price for ${what}?`,
    answer:
      `Prices are not published on the site, because they depend on the sizes, finishes and quantities you need. ` +
      `Add the items you want to your selection and submit the quote form, or send the list to SolBath on WhatsApp, ` +
      `and the team replies with a quotation for your project.`,
  };
}

export function categoryFaqs(category: Category, products: Product[], site: SiteSettings): Faq[] {
  if (!products.length) return [];
  const what = category.name.toLowerCase();
  const sizes = sizesOf(products);
  const series = seriesOf(products);
  const faqs: Faq[] = [];

  if (sizes.length) {
    faqs.push({
      question: `What sizes do ${what} come in?`,
      answer:
        `SolBath lists ${what} in ${sizes.length} ${sizes.length === 1 ? "size" : "sizes"}: ${list(sizes)}. ` +
        `Every size is shown on the product page it belongs to, so you can match a format to the room before ` +
        `requesting a quote or visiting the Ahmedabad showroom.`,
    });
  }
  if (series.length > 1) {
    faqs.push({
      question: `Which series are available in ${category.name}?`,
      answer:
        `${category.name} are offered in ${series.length} series: ${list(series)}. ` +
        `Each series lists its own sizes on its product page. If you are not sure which one suits your project, ` +
        `send the room measurements and the finish you want through the quote form and the team will recommend one.`,
    });
  }
  const where = whereToBuy(site, what);
  if (where) faqs.push(where);
  faqs.push(howToPrice(what));
  return faqs;
}

export function productFaqs(product: Product, site: SiteSettings): Faq[] {
  const faqs: Faq[] = [];
  if (product.sizes?.length) {
    faqs.push({
      question: `What sizes does ${product.name} come in?`,
      answer:
        `${product.name} is listed in ${product.sizes.length} ${product.sizes.length === 1 ? "size" : "sizes"}: ` +
        `${list(product.sizes)}, exactly as listed on this page. Tell SolBath which size and quantity you need in ` +
        `the quote form or on WhatsApp, and the team confirms availability and lead time for your order.`,
    });
  }
  if (product.finishes.length) {
    faqs.push({
      question: `Which finishes does ${product.name} come in?`,
      answer:
        `${product.name} is available in ${product.finishes.length} ${product.finishes.length === 1 ? "finish" : "finishes"}: ` +
        `${list(product.finishes)}. Pick the finish on this page before adding the product to your selection, ` +
        `so the quotation you receive matches what you want to install.`,
    });
  }
  const where = whereToBuy(site, product.name);
  if (where) faqs.push(where);
  return faqs;
}
