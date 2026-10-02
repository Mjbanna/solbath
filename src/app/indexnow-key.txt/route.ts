import { SITE_INDEXABLE } from "@/lib/site";

/** The IndexNow key file, referenced as keyLocation in every submission. */
export async function GET() {
  const key = process.env.INDEXNOW_KEY;
  if (!key || !SITE_INDEXABLE) return new Response("Not found", { status: 404 });
  return new Response(key, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
