export type Vertical = "bathroom-accessories" | "ceramic-tiles" | "hardware" | "kitchen";

export type PlaceholderTone =
  | "bath"
  | "tile"
  | "hardware"
  | "kitchen"
  | "lifestyle"
  | "neutral"
  | "dark";

export interface Category {
  slug: string;
  vertical: Vertical;
  name: string;
  tagline: string;
  description: string;
  filters: {
    label: string;
    options: string[];
  }[];
  /** Generated from a source file (e.g. tiles.generated.ts): scripts/seed.ts
   *  re-syncs its fields on every run instead of only creating it once. */
  syncOnSeed?: boolean;
}

export interface SpecRow {
  label: string;
  value: string;
}

export interface Product {
  slug: string;
  vertical: Vertical;
  categorySlug: string;
  name: string;
  collection: string;
  shortDescription: string;
  description: string;
  finishes: string[];
  sizes?: string[];
  specs: SpecRow[];
  tags: string[];
  featured?: boolean;
  isNew?: boolean;
  tone: PlaceholderTone;
  /** See Category.syncOnSeed. Never touches images or other admin-only fields. */
  syncOnSeed?: boolean;
}

export interface Dealer {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  rating: number;
  categories: Vertical[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
}

export interface InspirationPost {
  slug: string;
  title: string;
  room: string;
  excerpt: string;
  readTime: string;
  tone: PlaceholderTone;
  relatedProductSlugs: string[];
}

export interface Catalog {
  id: string;
  title: string;
  vertical: Vertical | "all";
  fileSize: string;
  fileUrl?: string;
}

export interface SectionHeading {
  eyebrow?: string;
  title: string;
}

export interface StatItem {
  icon: "award" | "users" | "shield" | "truck";
  label: string;
  detail: string;
}

export interface PersonaItem {
  icon: "home" | "architect" | "dealer";
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
}

export interface CtaCard {
  icon: "map-pin" | "download";
  heading: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  variant: "light" | "dark";
}

export interface HomePage {
  heroEyebrow: string;
  heroHeading: string;
  heroSubheading: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaHref: string;
  trustStats: StatItem[];
  personaHeading: SectionHeading;
  personas: PersonaItem[];
  featuredProductsHeading: SectionHeading;
  featuredProductsCtaLabel: string;
  featuredProductsCtaHref: string;
  inspirationHeading: SectionHeading;
  inspirationCtaLabel: string;
  testimonialsHeading: SectionHeading;
  ctaCards: CtaCard[];
}
