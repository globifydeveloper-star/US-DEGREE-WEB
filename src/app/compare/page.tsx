import { Suspense } from "react";
import type { Metadata } from "next";
import { Spin } from "antd";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompareClientContent from "@/components/compare/CompareClientContent";
import { fetchServerCompareDetails } from "@/lib/compare/compareServer";
import { getSiteUrl } from "@/lib/env";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const idsParam = (resolvedParams.ids as string) || "";
  const initialBundle = await fetchServerCompareDetails(idsParam);

  const names = initialBundle.comparedColleges.map((c) => c.name);
  const siteUrl = getSiteUrl();

  let title = "Compare Colleges & Degree Programs Side-by-Side | US Degrees";
  let description =
    "Compare up to 5 US colleges side-by-side on tuition costs, admission rates, graduate salaries, graduation rates, and overall ROI.";

  if (names.length > 0) {
    const listStr = names.join(" vs. ");
    title = `College Comparison: ${listStr} | US Degrees`;
    description = `Detailed side-by-side breakdown of ${listStr}. Compare tuition, graduation rate, median salary, and admissions requirements.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/compare${idsParam ? `?ids=${idsParam}` : ""}`,
      type: "website",
    },
    alternates: {
      canonical: `${siteUrl}/compare${idsParam ? `?ids=${idsParam}` : ""}`,
    },
  };
}

export default async function ComparePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const idsParam = (resolvedSearchParams.ids as string) || "";
  const initialBundle = await fetchServerCompareDetails(idsParam);

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-24">
            <Spin size="large" />
          </div>
        }
      >
        <CompareClientContent initialBundle={initialBundle} />
      </Suspense>
      <Footer />
    </main>
  );
}
