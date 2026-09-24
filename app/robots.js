import { siteUrl } from "@/lib/supabase";

export default function robots() {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/m/", "/my-polls", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
