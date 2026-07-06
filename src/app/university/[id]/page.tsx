import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TabContent from "@/components/university/TabContent";
import ScrollToTop from "@/components/university/ScrollToTop";
import UniversityUnavailable from "@/components/university/UniversityUnavailable";
import { fetchUniversityData } from "@/lib/university/fetchUniversityData";
import { buildUniversityViewData } from "@/lib/university/buildUniversityViewData";
import { UniversitySearchParams } from "@/types/university/apiResponses";

export default async function UniversityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<UniversitySearchParams>;
}) {
  const { id } = await params;
  const sParams = await searchParams;

  const bundle = await fetchUniversityData(id, sParams.cip);

  // If no backend data is found for this university ID
  if (!bundle.collegeData && !bundle.apiData) {
    return <UniversityUnavailable id={id} />;
  }

  const data = await buildUniversityViewData(id, sParams, bundle);

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <ScrollToTop />
      <Navbar />

      {/* Page Content with Tabs, Hero, and Sidebar */}
      <TabContent data={data} />

      <Footer className="mt-0" />
    </main>
  );
}
