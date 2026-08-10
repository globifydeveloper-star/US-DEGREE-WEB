import { Suspense } from "react";
import type { Metadata } from "next";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SearchClientContent from "@/components/search/SearchClientContent";
import {
  ResultListSkeleton,
  SearchHeaderSkeleton,
} from "@/components/search/SearchSkeletons";
import { fetchServerSearchResults } from "@/lib/search/searchServer";
import { getCategoryLabel } from "@/constants/searchCategories";
import { getSiteUrl } from "@/lib/env";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const titleParam = (resolvedParams.title as string) || "";
  const categoryParam = (resolvedParams.category as string) || "";
  const stateParam = (resolvedParams.state as string) || "";
  const credentialParam = (resolvedParams.credential_title as string) || "";

  const categoryLabel = getCategoryLabel(categoryParam);

  const parts: string[] = [];
  if (titleParam) parts.push(`"${titleParam}"`);
  if (categoryLabel) parts.push(categoryLabel);
  if (credentialParam) parts.push(credentialParam);
  if (stateParam) parts.push(`in ${stateParam.toUpperCase()}`);

  const mainDescriptor = parts.length > 0 ? parts.join(" ") : "All Programs";
  const title = `${mainDescriptor} | Degree Search | US Degrees`;
  const description = `Explore accredited ${mainDescriptor.toLowerCase()} programs across US universities. Compare tuition, admissions, outcomes, and median graduate earnings.`;

  const siteUrl = getSiteUrl();

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/search`,
      type: "website",
    },
    alternates: {
      canonical: `${siteUrl}/search`,
    },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const initialData = await fetchServerSearchResults(resolvedSearchParams);

  // Build ItemList JSON-LD schema for search engines
  const siteUrl = getSiteUrl();
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: initialData.results.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.program_title || item.school_name,
      url: `${siteUrl}/university/${item.unitid}${item.cip_code ? `?cip=${item.cip_code}` : ""}`,
    })),
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Suspense
        fallback={
          <div className="flex-1">
            <div className="w-full max-w-[2380px] mx-auto px-6 sm:px-10 lg:px-[86px] py-4">
              <SearchHeaderSkeleton />
              <ResultListSkeleton count={5} />
            </div>
          </div>
        }
      >
        <SearchClientContent initialData={initialData} />
      </Suspense>
      <Footer />
    </main>
  );
}
