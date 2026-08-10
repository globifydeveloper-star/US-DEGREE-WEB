import type { MetadataRoute } from "next";
import { getSiteUrl, getBackendBaseUrl } from "@/lib/env";
import { CATEGORY_LABELS } from "@/constants/searchCategories";

interface UniItem {
  unitid: number | string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  const routes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/search`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/compare`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Add popular category landing routes
  Object.keys(CATEGORY_LABELS).forEach((catSlug) => {
    routes.push({
      url: `${siteUrl}/search?category=${encodeURIComponent(catSlug)}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  });

  // Fetch university listing safely for /university/[id] pages
  try {
    const backendUrl = `${getBackendBaseUrl()}/search?type=universities`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout safety

    const res = await fetch(backendUrl, {
      signal: controller.signal,
      next: { revalidate: 86400 }, // Cache sitemap fetch for 24h
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data: unknown = await res.json();
      if (Array.isArray(data)) {
        (data as UniItem[]).forEach((uni) => {
          if (uni.unitid) {
            routes.push({
              url: `${siteUrl}/university/${uni.unitid}`,
              lastModified,
              changeFrequency: "monthly",
              priority: 0.7,
            });
          }
        });
      }
    }
  } catch (error) {
    console.warn("[sitemap] Failed to fetch university list for sitemap:", error);
  }

  return routes;
}
