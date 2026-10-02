import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { submitToIndexNow } from "@/lib/seo/indexnow";

// Maps a Strapi webhook payload's `model` (content-type UID) to the cache
// tag used when fetching that content type in src/lib/data/*.ts. Falls back
// to revalidating everything ("strapi") for models not listed here, so a new
// content type never silently goes stale.
const MODEL_TAGS: Record<string, string> = {
  vertical: "verticals",
  category: "categories",
  product: "products",
  dealer: "dealers",
  testimonial: "testimonials",
  "inspiration-post": "posts",
  catalog: "catalogs",
  "site-setting": "site-settings",
  "home-page": "home-page",
};

/**
 * The public URL(s) a saved record affects. Strapi sends the entry without its
 * relations (webhooks.populateRelations is off), so a category's vertical is
 * looked up; anything we cannot resolve falls back to the homepage, which
 * lists the ranges.
 */
async function changedPaths(model: string | undefined, entry: Record<string, unknown> | undefined): Promise<string[]> {
  const slug = typeof entry?.slug === "string" ? entry.slug : undefined;
  if (!slug) return ["/"];
  switch (model) {
    case "product":
      return [`/product/${slug}`, "/"];
    case "inspiration-post":
      return [`/inspiration/${slug}`, "/inspiration"];
    case "vertical":
      return [`/${slug}`, "/"];
    case "category": {
      try {
        const res = await fetch(
          `${process.env.STRAPI_URL}/api/categories?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[vertical][fields][0]=key`,
          { cache: "no-store", signal: AbortSignal.timeout(5000) },
        );
        const json = await res.json();
        const key = json?.data?.[0]?.vertical?.key;
        return key ? [`/${key}/${slug}`, `/${key}`] : ["/"];
      } catch {
        return ["/"];
      }
    }
    default:
      return ["/"];
  }
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ revalidated: false, error: "Invalid secret" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const model = typeof body?.model === "string" ? body.model : undefined;
  const tag = (model && MODEL_TAGS[model]) || "strapi";

  // Webhooks need the tag to expire immediately (not the stale-while-revalidate
  // "max" profile), since Strapi calls this once right after a save and the
  // editor expects the very next page load to show the new content.
  revalidateTag(tag, { expire: 0 });

  // Tell Bing (and so ChatGPT search) straight away. Never blocks or fails the
  // revalidation: submitToIndexNow swallows its own errors and times out.
  const indexnow = await submitToIndexNow(await changedPaths(model, body?.entry));

  return NextResponse.json({ revalidated: true, tag, indexnow });
}
