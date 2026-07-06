import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TabContent from "@/components/university/TabContent";
import ScrollToTop from "@/components/university/ScrollToTop";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { TuitionData } from "@/types/university/TuitionData";
import { getTestingRequirementsForCategory } from "@/data/testingRequirements";
import { TestingRequirementsDisclosure } from "@/types/university/AdmissionsTabContent";

// Minimal shapes for the backend JSON this page consumes. Every field is
// optional because the endpoints may omit data; we only declare what is read.
type ApiNum = number | string | null;

interface ApiOverview {
  program?: { cip_code?: string };
  school?: {
    school_name?: string;
    school_description?: string;
    program_count?: number | null;
    accreditor?: string | null;
  };
  students?: {
    size?: number | null;
    student_faculty_ratio?: ApiNum;
    retention_rate?: number | null;
    fafsa_applications?: number | null;
  };
  admissions?: {
    admission_rate?: number | null;
    sat_avg_overall?: ApiNum;
    sat_rw_min?: number | null;
    sat_rw_max?: number | null;
    sat_math_min?: number | null;
    sat_math_max?: number | null;
    // Testing-requirements disclosure (publishable rows only; the backend
    // suppresses Tier 3). Absent/null category ⇒ show the numeric SAT range.
    satDisclosureCategory?: string | null;
    badgeLabel?: string | null;
    badgeColor?: string | null;
    supportingCopy?: string | null;
    disclaimerTier?: number | null;
    disclaimerText?: string | null;
    showAdmissionRateRequired?: boolean | null;
  };
  completion?: { completion_rate?: number | null };
  earnings?: {
    year_1?: ApiNum;
    year_5?: ApiNum;
    year_10?: ApiNum;
    growth_rate?: ApiNum;
    avg_salary?: ApiNum;
  };
  roi?: { roi_20yr?: ApiNum };
  school_description?: string;
}

interface ApiOutcomes {
  earnings?: {
    year_1?: ApiNum;
    year_5?: ApiNum;
    year_10?: ApiNum;
    growth_rate?: ApiNum;
    avg_salary?: ApiNum;
  };
  roi?: { roi_20yr?: ApiNum };
  completion?: { emp_factor?: ApiNum };
  debt_income_ratio?: { debt_income_ratio?: ApiNum };
}

interface ApiCampus {
  campus?: { student_faculty_ratio?: ApiNum };
}

interface ApiCollege {
  school_name?: string;
  city?: string;
  state?: string;
  school_type?: string;
  school_url?: string | null;
  accreditor?: string | null;
}

interface ApiUni {
  unitid?: string | number;
  accreditor?: string | null;
}

export default async function UniversityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    cip?: string;
    name?: string;
    city?: string;
    state?: string;
    degree?: string;
    type?: string;
    admissionRate?: string;
    tuition?: string;
    avgSalary?: string;
    roi?: string;
  }>;
}) {
  const { id } = await params;
  const sParams = await searchParams;

  const apiUrl =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

  const sanitizeSalary = (val: unknown) => {
    if (val === null || val === undefined) return null;
    const str = String(val).trim();
    if (
      str === "No Value" ||
      str === "N/A" ||
      str === "" ||
      str.toLowerCase() === "null"
    ) {
      return null;
    }
    const num = Number(str.replace(/[^0-9.-]/g, ""));
    return isNaN(num) ? null : num;
  };

  // 1. Gather all data we can fetch from the backend overview endpoint
  let apiData: ApiOverview | null = null;
  if (sParams.cip) {
    try {
      const res = await fetch(`${apiUrl}/overview/${id}/${sParams.cip}`, {
        cache: "no-store",
      });
      if (res.ok) {
        apiData = await res.json();
        console.log("API Data:", apiData);
      }
    } catch (err) {
      console.error("Error fetching overview details:", err);
    }
  } else {
    try {
      const res = await fetch(`${apiUrl}/overview/${id}/default`, {
        cache: "no-store",
      });
      if (res.ok) {
        apiData = await res.json();
        console.log("API Data:", apiData);
      }
    } catch (err) {
      console.error("Error fetching overview details with default cip:", err);
    }
  }

  // 2. Fetch outcomes details using resolved cip
  const resolvedCip = sParams.cip || apiData?.program?.cip_code;
  let outcomesData: ApiOutcomes | null = null;
  if (resolvedCip) {
    try {
      const res = await fetch(`${apiUrl}/outcomes/${id}/${resolvedCip}`, {
        cache: "no-store",
      });
      if (res.ok) {
        outcomesData = await res.json();
      }
    } catch (err) {
      console.error("Error fetching outcomes details:", err);
    }
  }

  // 2b. Fetch campus details
  let campusData: ApiCampus | null = null;
  try {
    const res = await fetch(`${apiUrl}/campus/${id}`, { cache: "no-store" });
    if (res.ok) {
      campusData = await res.json();
    }
  } catch (err) {
    console.error("Error fetching campus details:", err);
  }

  // 2c. Fetch tuition details
  let tuitionData: TuitionData | null = null;
  try {
    const res = await fetch(`${apiUrl}/tuition/${id}`, { cache: "no-store" });
    if (res.ok) {
      tuitionData = await res.json();
    }
  } catch (err) {
    console.error("Error fetching tuition details:", err);
  }

  // 2d. Fetch college details (for school_url)
  let collegeData: ApiCollege | null = null;
  try {
    const res = await fetch(`${apiUrl}/colleges/${id}`, { cache: "no-store" });
    if (res.ok) {
      collegeData = await res.json();
    }
  } catch (err) {
    console.error("Error fetching college details:", err);
  }

  // 2e. Fetch programs details
  let programsData: unknown = null;
  try {
    const res = await fetch(`${apiUrl}/programs/${id}`, { cache: "no-store" });
    if (res.ok) {
      programsData = await res.json();
    }
  } catch (err) {
    console.error("Error fetching programs details:", err);
  }

  // 2f. Fetch accreditor from search endpoint (since detail endpoints omit it)
  let accreditorSearchData: ApiUni[] | null = null;
  try {
    const res = await fetch(`${apiUrl}/search?type=universities`, {
      cache: "no-store",
    });
    if (res.ok) {
      accreditorSearchData = await res.json();
    }
  } catch (err) {
    console.error("Error fetching university list for accreditor:", err);
  }
  const matchedUni = Array.isArray(accreditorSearchData)
    ? accreditorSearchData.find(
        (uni: ApiUni) => String(uni.unitid) === String(id),
      )
    : null;
  const fetchedAccreditor = matchedUni?.accreditor || null;

  // If no backend data is found for this university ID
  if (!collegeData && !apiData) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center transition-all duration-300 hover:shadow-2xl">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 animate-pulse">
              <AlertCircle size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight mb-3">
              University Details Unavailable
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              We couldn&apos;t retrieve the details for this university (ID:{" "}
              <span className="font-semibold text-slate-800">{id}</span>). It
              may not exist in our database, or there might be a temporary
              network issue.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/search"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
              >
                Go to Search
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200 active:scale-95"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
        <Footer className="mt-0" />
      </main>
    );
  }

  // 3. Build the final data object, prioritizing sParams first, then apiData / collegeData
  const name = sParams.name || collegeData?.school_name || "Unknown University";
  const city = sParams.city || collegeData?.city || "";
  const state = sParams.state || collegeData?.state || "";
  const location =
    city && state ? `${city}, ${state}` : city || state || "Unknown Location";

  const type = sParams.type || collegeData?.school_type || "Private Research";

  const admissionRateRaw =
    sParams.admissionRate ||
    (apiData?.admissions?.admission_rate !== null &&
    apiData?.admissions?.admission_rate !== undefined
      ? `${(Number(apiData.admissions.admission_rate) * 100).toFixed(1)}%`
      : null) ||
    "N/A";

  // Calculate real sticker price if tuitionData is available
  let calculatedStickerPriceString = "N/A";
  if (tuitionData) {
    const tuitionInState = tuitionData.tuition?.tuition_in_state ?? 12714;
    const bookSupply = tuitionData.tuition?.booksupply ?? 1200;
    const roomBoardOnCampus = tuitionData.housing?.roomboard_oncampus ?? 7348;
    const otherExpenseOnCampus =
      tuitionData.expenses?.otherexpense_oncampus ?? 2832;
    const stickerInState =
      bookSupply + tuitionInState + roomBoardOnCampus + otherExpenseOnCampus;
    calculatedStickerPriceString = `$${Math.round(stickerInState).toLocaleString()}`;
  }

  const tuitionRaw = tuitionData
    ? calculatedStickerPriceString
    : sParams.tuition || "N/A";

  const degree = sParams.degree || "Bachelor's Degree";

  const cipCode = resolvedCip || "N/A";

  // Student body stats from API overview details
  const totalStudents =
    apiData?.students?.size !== null && apiData?.students?.size !== undefined
      ? Number(apiData.students.size)
      : null;

  const rawFacultyRatio =
    campusData?.campus?.student_faculty_ratio ||
    apiData?.students?.student_faculty_ratio;
  const facultyRatio = rawFacultyRatio
    ? String(rawFacultyRatio).includes(":")
      ? String(rawFacultyRatio)
      : `${rawFacultyRatio}:1`
    : "N/A";

  const rawRetention = apiData?.students?.retention_rate;
  const retentionRate =
    rawRetention !== null && rawRetention !== undefined
      ? `${(Number(rawRetention) * 100).toFixed(0)}%`
      : "N/A";

  const programs =
    apiData?.school?.program_count !== null &&
    apiData?.school?.program_count !== undefined
      ? Number(apiData.school.program_count)
      : null;

  const fafsaApplications =
    apiData?.students?.fafsa_applications !== null &&
    apiData?.students?.fafsa_applications !== undefined
      ? Number(apiData.students.fafsa_applications)
      : null;

  const rawCompletion = apiData?.completion?.completion_rate;
  const completionRate =
    rawCompletion !== null && rawCompletion !== undefined
      ? `${Number(rawCompletion).toFixed(0)}%`
      : "N/A";

  // SAT & Student metrics from API if present
  const satAverage =
    apiData?.admissions?.sat_avg_overall !== null &&
    apiData?.admissions?.sat_avg_overall !== undefined
      ? String(apiData.admissions.sat_avg_overall)
      : "N/A";

  const satReadingWriting =
    apiData?.admissions?.sat_rw_min !== null &&
    apiData?.admissions?.sat_rw_max !== null &&
    apiData?.admissions?.sat_rw_min !== undefined &&
    apiData?.admissions?.sat_rw_max !== undefined
      ? `${apiData.admissions.sat_rw_min} - ${apiData.admissions.sat_rw_max}`
      : "N/A";

  const satMath =
    apiData?.admissions?.sat_math_min !== null &&
    apiData?.admissions?.sat_math_max !== null &&
    apiData?.admissions?.sat_math_min !== undefined &&
    apiData?.admissions?.sat_math_max !== undefined
      ? `${apiData.admissions.sat_math_min} - ${apiData.admissions.sat_math_max}`
      : "N/A";

  const applicants = apiData?.students?.fafsa_applications
    ? String(apiData.students.fafsa_applications)
    : "N/A";

  // Testing-requirements disclosure. The overview endpoint returns a per-college
  // category code (`sat_disclosure_category`); the badge DISPLAY metadata comes
  // from the `admission_disclosure_categories` lookup table. Only build the
  // object when the college carries a category; otherwise leave it null so the
  // Admissions tab shows the numeric SAT range exactly as before.
  //
  // When the overview response already inlines the display fields, prefer those;
  // otherwise resolve them from the categories table by the category code.
  const admissionsRaw = apiData?.admissions;
  const disclosureCategory = admissionsRaw?.satDisclosureCategory ?? null;

  let testingRequirementsFinal: TestingRequirementsDisclosure | null = null;
  if (disclosureCategory != null) {
    testingRequirementsFinal = admissionsRaw?.badgeLabel
      ? {
          satDisclosureCategory: disclosureCategory,
          badgeLabel: admissionsRaw.badgeLabel,
          badgeColor: (admissionsRaw.badgeColor ??
            "gray") as TestingRequirementsDisclosure["badgeColor"],
          supportingCopy: admissionsRaw.supportingCopy ?? "",
          disclaimerTier: (Number(admissionsRaw.disclaimerTier) ||
            1) as TestingRequirementsDisclosure["disclaimerTier"],
          disclaimerText: admissionsRaw.disclaimerText ?? null,
          showAdmissionRateRequired: Boolean(
            admissionsRaw.showAdmissionRateRequired,
          ),
        }
      : await getTestingRequirementsForCategory(disclosureCategory);
  }

  // Outcomes & Careers statistics
  const salaryYear1 =
    sanitizeSalary(outcomesData?.earnings?.year_1) ||
    sanitizeSalary(apiData?.earnings?.year_1) ||
    (id === "1" ? 91200 : id === "2" ? 85000 : null);
  const salaryYear5 =
    sanitizeSalary(outcomesData?.earnings?.year_5) ||
    sanitizeSalary(apiData?.earnings?.year_5) ||
    null;
  const salaryYear10 =
    sanitizeSalary(outcomesData?.earnings?.year_10) ||
    sanitizeSalary(apiData?.earnings?.year_10) ||
    (id === "1" ? 149696 : id === "2" ? 135000 : null);

  const netRoi20Yr =
    sParams.roi ||
    outcomesData?.roi?.roi_20yr ||
    apiData?.roi?.roi_20yr ||
    null;

  const rawGrowth =
    outcomesData?.earnings?.growth_rate || apiData?.earnings?.growth_rate;
  const growthRate =
    rawGrowth !== undefined && rawGrowth !== null
      ? Number(rawGrowth)
      : salaryYear1 && salaryYear10
        ? ((Number(salaryYear10) - Number(salaryYear1)) / Number(salaryYear1)) *
          100
        : null;

  const empFactor =
    outcomesData?.completion?.emp_factor !== null &&
    outcomesData?.completion?.emp_factor !== undefined
      ? Number(outcomesData.completion.emp_factor)
      : null;

  const debtIncomeRatio =
    outcomesData?.debt_income_ratio?.debt_income_ratio !== null &&
    outcomesData?.debt_income_ratio?.debt_income_ratio !== undefined
      ? Number(outcomesData.debt_income_ratio.debt_income_ratio)
      : null;

  const avgSalary =
    outcomesData?.earnings?.avg_salary !== null &&
    outcomesData?.earnings?.avg_salary !== undefined
      ? Number(outcomesData.earnings.avg_salary)
      : null;

  const data = {
    id,
    name,
    location,
    type,
    rank: "#1 National",
    admissionRate: admissionRateRaw,
    tuitionFee: tuitionRaw,
    logoColor: "bg-blue-600",
    description:
      apiData?.school?.school_description ||
      `${name} is a distinguished institution situated in ${location}. It offers a wide range of academic opportunities and a vibrant student environment.`,
    degree,
    duration: "4 Years",
    format: "Full-time, On-campus",
    financialAid: "Available",
    cipCode,
    school: "College of Engineering",
    programDescription: degree
      ? `The ${degree} program at ${name} is designed to provide comprehensive, top-tier training in the discipline, combining foundational principles with modern applications.`
      : "Information about this program is currently being updated by the university.",
    applicants,
    satReadingWriting,
    satMath,
    satAverage,
    testingRequirements: testingRequirementsFinal,

    // Dynamic Stats for StatsGrid
    totalStudents,
    facultyRatio,
    retentionRate,
    programs,
    fafsaApplications,
    completionRate,

    // Dynamic Outcomes
    salaryYear1,
    salaryYear5,
    salaryYear10,
    netRoi20Yr,
    growthRate,
    empFactor,
    debtIncomeRatio,
    avgSalary,

    // Campus Data
    campusData,

    // Tuition Data
    tuitionData,

    // Programs Data
    programsData,

    // School URL
    schoolUrl: collegeData?.school_url || null,
    accreditor:
      collegeData?.accreditor ||
      apiData?.school?.accreditor ||
      fetchedAccreditor ||
      null,
  };

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
