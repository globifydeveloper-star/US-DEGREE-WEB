import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

/**
 * Public, indexable routes.
 *
 * University detail pages (/university/[id]) are intentionally omitted:
 * enumerating them requires a full listing from the backend, and a sitemap
 * generation that fails or times out against the API would break the build.
 * If those pages matter for SEO, generate them separately via
 * generateSitemaps() with an explicit, paginated backend query.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/search`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
