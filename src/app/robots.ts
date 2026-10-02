import type { MetadataRoute } from "next";
import { SITE_INDEXABLE, SITE_URL } from "@/lib/site";

/**
 * AI crawlers are allowed deliberately, not by accident: the goal is to be
 * quoted by answer engines (ChatGPT, Claude, Perplexity, Google AI Overviews).
 * Google-Extended controls Gemini/AI Overviews training and grounding without
 * affecting normal Google Search ranking; blocking any of these removes the
 * site from those answers.
 */
const AI_CRAWLERS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "PerplexityBot", "CCBot", "Google-Extended"];

export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXABLE) {
    // Staging / local builds: keep every crawler out, AI ones included.
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  const disallow = ["/api/", "/selection"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
