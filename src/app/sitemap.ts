import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllCategories, getVerticalMeta } from "@/lib/data/categories";
import { getAllProductSlugs } from "@/lib/data/products";
import { getPosts } from "@/lib/data/posts";

// Same data layer (and cache tags) as the pages themselves, so the Strapi
// revalidation webhook keeps the sitemap in step with the catalog.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [verticalMeta, categories, products, posts] = await Promise.all([
    getVerticalMeta(),
    getAllCategories(),
    getAllProductSlugs(),
    getPosts(),
  ]);

  const url = (path: string) => `${SITE_URL}${path}`;
  const staticPaths = [
    "/", "/about", "/catalogues", "/contact", "/dealers", "/for-trade",
    "/inspiration", "/quote", "/privacy-policy", "/terms",
  ];

  return [
    ...staticPaths.map((p) => ({ url: url(p) })),
    ...Object.values(verticalMeta).map((v) => ({ url: url(`/${v.slug}`) })),
    ...categories
      .filter((c) => c.vertical)
      .map((c) => ({ url: url(`/${c.vertical}/${c.slug}`) })),
    ...products.map((p) => ({ url: url(`/product/${p.slug}`) })),
    ...posts.map((p) => ({ url: url(`/inspiration/${p.slug}`) })),
  ];
}
