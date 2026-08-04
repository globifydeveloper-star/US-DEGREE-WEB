import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // Authenticated, per-user content — nothing here is useful in an index
        // and crawling it just burns crawl budget on redirects to login.
        "/profile",
        // The comparison view is driven entirely by client-side state; crawled
        // URLs would render an empty comparison.
        "/compare",
        // Proxy and auth callbacks, never user-facing pages.
        "/api/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
