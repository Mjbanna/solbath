import { compileStrapi, createStrapi } from "@strapi/strapi";

import { categories as staticCategories, verticalMeta } from "../seed-data/categories";
import { products as staticProducts } from "../seed-data/products";
import { dealers as staticDealers } from "../seed-data/dealers";
import { testimonials as staticTestimonials } from "../seed-data/testimonials";
import { posts as staticPosts } from "../seed-data/posts";
import { catalogs as staticCatalogs } from "../seed-data/catalogs";
import { site } from "../seed-data/site";
import { homePage } from "../seed-data/home";

function assertUniqueSlugs(kind: string, items: { slug: string }[]) {
  const seen = new Set<string>();
  const dupes = items.map((i) => i.slug).filter((s) => (seen.has(s) ? true : (seen.add(s), false)));
  if (dupes.length) throw new Error(`Duplicate ${kind} slugs in seed-data: ${[...new Set(dupes)].join(", ")}`);
}

async function main() {
  // Upserts match on slug, so a duplicate would silently overwrite its twin.
  assertUniqueSlugs("category", staticCategories);
  assertUniqueSlugs("product", staticProducts);

  const app = await compileStrapi();
  const strapi = await createStrapi(app).load();
  strapi.log.level = "error";

  console.log("Seeding Verticals...");
  const verticalIdByKey = new Map<string, string>();
  let verticalSortOrder = 0;
  for (const [key, meta] of Object.entries(verticalMeta)) {
    const existing = await strapi.documents("api::vertical.vertical").findFirst({
      filters: { key: { $eq: key as "bathroom-accessories" | "ceramic-tiles" | "hardware" | "kitchen" } },
    });
    const doc = existing
      ? await strapi
          .documents("api::vertical.vertical")
          .update({
            documentId: existing.documentId,
            data: {
              sortOrder: verticalSortOrder,
              isActive: true,
              heroDescription: meta.heroDescription,
            },
          })
          .then((d) => d ?? existing)
      : await strapi.documents("api::vertical.vertical").create({
          data: {
            key: key as "bathroom-accessories" | "ceramic-tiles" | "hardware" | "kitchen",
            name: meta.name,
            slug: meta.slug,
            tagline: meta.tagline,
            heroDescription: meta.heroDescription,
            tone: meta.tone,
            sortOrder: verticalSortOrder,
            isActive: true,
          },
        });
    verticalIdByKey.set(key, doc.documentId);
    verticalSortOrder += 1;
  }

  console.log("Seeding Categories...");
  const categoryIdBySlug = new Map<string, string>();
  const categorySortOrderByVertical = new Map<string, number>();
  for (const category of staticCategories) {
    const existing = await strapi.documents("api::category.category").findFirst({
      filters: { slug: { $eq: category.slug } },
    });
    const verticalId = verticalIdByKey.get(category.vertical);
    if (!verticalId) throw new Error(`Unknown vertical "${category.vertical}"`);

    const sortOrder = categorySortOrderByVertical.get(category.vertical) ?? 0;
    categorySortOrderByVertical.set(category.vertical, sortOrder + 1);

    const sourceFields = {
      vertical: verticalId,
      name: category.name,
      tagline: category.tagline,
      description: category.description,
      filters: category.filters.map((f) => ({
        label: f.label,
        options: f.options.map((value) => ({ value })),
      })),
    };
    // Generated categories (syncOnSeed) re-sync their source fields every run
    // so spreadsheet edits land; hand-written ones keep their admin edits.
    // Category has no draft/publish, so the update is live immediately.
    const doc = existing
      ? await strapi
          .documents("api::category.category")
          .update({
            documentId: existing.documentId,
            data: {
              ...(category.syncOnSeed ? sourceFields : {}),
              sortOrder,
              isActive: true,
            },
          })
          .then((d) => d ?? existing)
      : await strapi.documents("api::category.category").create({
          data: { slug: category.slug, ...sourceFields, sortOrder, isActive: true },
        });
    categoryIdBySlug.set(category.slug, doc.documentId);
  }

  console.log("Seeding Products...");
  const productIdBySlug = new Map<string, string>();
  const productSortOrderByCategory = new Map<string, number>();
  const MARKER_TAGS = new Set(["bestseller", "new"]);
  for (const product of staticProducts) {
    const sortOrder = productSortOrderByCategory.get(product.categorySlug) ?? 0;
    productSortOrderByCategory.set(product.categorySlug, sortOrder + 1);

    const existing = await strapi.documents("api::product.product").findFirst({
      filters: { slug: { $eq: product.slug } },
      status: "draft",
    });
    const categoryId = categoryIdBySlug.get(product.categorySlug);
    const verticalId = verticalIdByKey.get(product.vertical);
    if (!categoryId || !verticalId) {
      throw new Error(
        `Product "${product.slug}" references unknown category/vertical "${product.categorySlug}"`,
      );
    }

    if (existing) {
      if (product.syncOnSeed) {
        // Generated product: re-sync everything the source file owns, then
        // publish (Product has draft/publish — an update alone only changes the
        // draft). images, featured, isNew and popularProducts are admin-owned
        // and deliberately left alone.
        await strapi.documents("api::product.product").update({
          documentId: existing.documentId,
          data: {
            vertical: verticalId,
            category: categoryId,
            name: product.name,
            collection: product.collection,
            shortDescription: product.shortDescription,
            description: product.description,
            finishes: product.finishes.map((value) => ({ value })),
            sizes: (product.sizes ?? []).map((value) => ({ value })),
            specs: product.specs,
            tone: product.tone,
            sortOrder,
          },
        });
        await strapi.documents("api::product.product").publish({ documentId: existing.documentId });
      } else {
        await strapi.documents("api::product.product").update({
          documentId: existing.documentId,
          data: { sortOrder },
        });
      }
      productIdBySlug.set(product.slug, existing.documentId);
      continue;
    }

    const extraTags = product.tags.filter((t) => !MARKER_TAGS.has(t.toLowerCase()));
    if (extraTags.length > 0) {
      console.warn(
        `Product "${product.slug}" has non-marker tags dropped during migration: ${extraTags.join(", ")}`,
      );
    }

    const created = await strapi.documents("api::product.product").create({
      data: {
        slug: product.slug,
        vertical: verticalId,
        category: categoryId,
        name: product.name,
        collection: product.collection,
        shortDescription: product.shortDescription,
        description: product.description,
        finishes: product.finishes.map((value) => ({ value })),
        sizes: (product.sizes ?? []).map((value) => ({ value })),
        specs: product.specs,
        featured: Boolean(product.featured),
        isNew: Boolean(product.isNew),
        tone: product.tone,
        sortOrder,
      },
    });
    await strapi.documents("api::product.product").publish({ documentId: created.documentId });
    productIdBySlug.set(product.slug, created.documentId);
  }

  console.log("Seeding Dealers...");
  for (const dealer of staticDealers) {
    const existing = await strapi.documents("api::dealer.dealer").findFirst({
      filters: { name: { $eq: dealer.name } },
    });

    const categoryIds = dealer.categories
      .map((v) => verticalIdByKey.get(v))
      .filter((id): id is string => Boolean(id));

    if (existing) {
      await strapi.documents("api::dealer.dealer").update({
        documentId: existing.documentId,
        data: { categories: { set: categoryIds } },
      });
      continue;
    }

    await strapi.documents("api::dealer.dealer").create({
      data: {
        name: dealer.name,
        city: dealer.city,
        state: dealer.state,
        address: dealer.address,
        phone: dealer.phone,
        rating: dealer.rating,
        categories: { connect: categoryIds },
      },
    });
  }

  console.log("Seeding Testimonials...");
  for (const testimonial of staticTestimonials) {
    const existing = await strapi.documents("api::testimonial.testimonial").findFirst({
      filters: { name: { $eq: testimonial.name }, quote: { $eq: testimonial.quote } },
    });
    if (existing) continue;

    await strapi.documents("api::testimonial.testimonial").create({
      data: {
        name: testimonial.name,
        role: testimonial.role,
        quote: testimonial.quote,
        rating: testimonial.rating,
      },
    });
  }

  console.log("Seeding Inspiration Posts...");
  for (const post of staticPosts) {
    const existing = await strapi.documents("api::inspiration-post.inspiration-post").findFirst({
      filters: { slug: { $eq: post.slug } },
      status: "draft",
    });
    if (existing) continue;

    const relatedProductIds = post.relatedProductSlugs
      .map((slug) => productIdBySlug.get(slug))
      .filter((id): id is string => Boolean(id));

    const created = await strapi.documents("api::inspiration-post.inspiration-post").create({
      data: {
        slug: post.slug,
        title: post.title,
        room: post.room as "Bathroom" | "Kitchen" | "Guide" | "Outdoor",
        excerpt: post.excerpt,
        readTime: post.readTime,
        tone: post.tone,
        relatedProducts: { connect: relatedProductIds },
      },
    });
    await strapi
      .documents("api::inspiration-post.inspiration-post")
      .publish({ documentId: created.documentId });
  }

  console.log("Seeding Catalogs...");
  let catalogSortOrder = 0;
  for (const catalog of staticCatalogs) {
    const sortOrder = catalogSortOrder;
    catalogSortOrder += 1;

    const existing = await strapi.documents("api::catalog.catalog").findFirst({
      filters: { title: { $eq: catalog.title } },
    });
    if (existing) {
      await strapi.documents("api::catalog.catalog").update({
        documentId: existing.documentId,
        data: { sortOrder, isActive: true },
      });
      continue;
    }

    const verticalIds =
      catalog.vertical === "all"
        ? []
        : [verticalIdByKey.get(catalog.vertical)].filter((id): id is string => Boolean(id));

    await strapi.documents("api::catalog.catalog").create({
      data: {
        title: catalog.title,
        vertical: { connect: verticalIds },
        sortOrder,
        isActive: true,
        // no real PDF files exist in the repo yet — upload the actual catalog PDFs
        // in the admin and attach them to these records manually.
      },
    });
  }

  console.log("Seeding Site Settings...");
  const existingSettings = await strapi.documents("api::site-setting.site-setting").findFirst({});
  const settingsData = {
    name: site.name,
    tagline: site.tagline,
    whatsappNumber: site.whatsappNumber,
    phone: site.phone,
    email: site.email,
    address: site.address,
    social: site.social,
    nav: site.nav,
    footerTagline: site.footerTagline,
    footerColumns: site.footerColumns,
  };
  if (existingSettings) {
    await strapi.documents("api::site-setting.site-setting").update({
      documentId: existingSettings.documentId,
      data: settingsData,
    });
  } else {
    await strapi.documents("api::site-setting.site-setting").create({ data: settingsData });
  }

  console.log("Seeding Home Page...");
  const existingHomePage = await strapi.documents("api::home-page.home-page").findFirst({});
  if (existingHomePage) {
    await strapi.documents("api::home-page.home-page").update({
      documentId: existingHomePage.documentId,
      data: homePage,
    });
  } else {
    await strapi.documents("api::home-page.home-page").create({ data: homePage });
  }

  console.log("Seed complete.");
  await strapi.destroy();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
