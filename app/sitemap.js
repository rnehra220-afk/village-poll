import { getAnonClient, siteUrl } from "@/lib/supabase";
import { STATES, slugify } from "@/lib/geo";

export const dynamic = "force-dynamic";

/**
 * Dynamic sitemap: static routes + state pages + public polls.
 * Falls back to static routes only when DB env is unavailable.
 */
export default async function sitemap() {
  const base = siteUrl();
  const now = new Date();

  const routes = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/create`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/search`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/guidelines`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  try {
    const db = getAnonClient();

    for (const s of STATES) {
      routes.push({
        url: `${base}/${slugify(s)}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }

    const { data: polls } = await db
      .from("polls")
      .select("slug, created_at")
      .in("status", ["active", "closed"])
      .order("created_at", { ascending: false })
      .limit(5000);

    for (const p of polls || []) {
      routes.push({
        url: `${base}/poll/${p.slug}`,
        lastModified: new Date(p.created_at),
        changeFrequency: "hourly",
        priority: 0.8,
      });
    }
  } catch {
    // DB unavailable (e.g. build without env) — static routes only.
  }

  return routes;
}
