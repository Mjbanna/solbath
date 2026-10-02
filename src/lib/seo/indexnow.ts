import { SITE_INDEXABLE, SITE_URL } from "@/lib/site";

/**
 * IndexNow: tells Bing (and so ChatGPT search, which is backed by it) that a
 * URL changed, instead of waiting for the next crawl. Yandex and Seznam share
 * the same endpoint. Google does not participate.
 *
 * The key is served at /indexnow-key.txt and passed as keyLocation, so it does
 * not have to sit at the domain root as <key>.txt.
 */
const ENDPOINT = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/IndexNow";

export async function submitToIndexNow(paths: string[]): Promise<{ submitted: number; status?: number; skipped?: string }> {
  const key = process.env.INDEXNOW_KEY;
  if (!SITE_INDEXABLE) return { submitted: 0, skipped: "not an indexable build" };
  if (!key) return { submitted: 0, skipped: "INDEXNOW_KEY not set" };

  const urlList = [...new Set(paths)].map((p) => `${SITE_URL}${p.startsWith("/") ? p : `/${p}`}`);
  if (!urlList.length) return { submitted: 0, skipped: "no URLs" };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key,
        keyLocation: `${SITE_URL}/indexnow-key.txt`,
        urlList,
      }),
      // Never let a slow third party hold up the revalidation webhook.
      signal: AbortSignal.timeout(5000),
    });
    return { submitted: urlList.length, status: res.status };
  } catch (error) {
    console.error("[indexnow] submission failed:", error);
    return { submitted: 0, skipped: "request failed" };
  }
}
