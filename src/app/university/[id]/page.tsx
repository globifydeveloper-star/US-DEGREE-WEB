import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TabContent from "@/components/university/TabContent";
import ScrollToTop from "@/components/university/ScrollToTop";

// Mock data — fallback if API fetch fails or if id is 1 or 2 and backend lacks data
const universityData: Record<string, {
  name: string; location: string; type: string; rank: string;
  admissionRate: string; tuitionFee: string; logoColor: string;
  description: string; degree: string; duration: string; format: string;
  financialAid: string; cipCode: string; school: string; programDescription: string;
  applicants: string; satReadingWriting: string; satMath: string; satAverage: string;
}> = {
  "1": {
    name: "Stanford University",
    location: "Stanford, CA",
    type: "Private Research",
    rank: "#1 National",
    admissionRate: "4.3%",
    tuitionFee: "$56,169",
    logoColor: "bg-[#8c1515]",
    description: "Stanford University is one of the world's leading research universities. It is known for its proximity to Silicon Valley and its entrepreneurial spirit. The campus spans 8,180 acres and is home to a diverse community of scholars.",
    degree: "Bachelor of Science",
    duration: "4 Years",
    format: "Full-time, On-campus",
    financialAid: "Available",
    cipCode: "11.0701",
    school: "School of Engineering",
    programDescription: "The Computer Science major at Stanford focuses on the mathematical and scientific foundations of computing. Students engage in cutting-edge research and gain practical experience through projects and internships.",
    applicants: "1,980",
    satReadingWriting: "690 - 840",
    satMath: "630 - 810",
    satAverage: "1203",
  },
  "2": {
    name: "UC Berkeley",
    location: "Berkeley, CA",
    type: "Public Research",
    rank: "#4 National",
    admissionRate: "11.4%",
    tuitionFee: "$43,980",
    logoColor: "bg-[#003262]",
    description: "The University of California, Berkeley is a public research university and the flagship institution of the ten research universities affiliated with the University of California system. Founded in 1868, Berkeley has grown to instruct over 43,000 students.",
    degree: "Bachelor of Science",
    duration: "4 Years",
    format: "Full-time, On-campus",
    financialAid: "Available",
    cipCode: "11.0701",
    school: "College of Engineering",
    programDescription: "UC Berkeley's EECS department is consistently ranked among the top computer science programs in the world, offering rigorous coursework combined with groundbreaking research opportunities.",
    applicants: "5,700",
    satReadingWriting: "660 - 780",
    satMath: "680 - 800",
    satAverage: "1380",
  },
};

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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const sanitizeSalary = (val: any) => {
    if (val === null || val === undefined) return null;
    const str = String(val).trim();
    if (str === "No Value" || str === "N/A" || str === "" || str.toLowerCase() === "null") {
      return null;
    }
    const num = Number(str.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? null : num;
  };

  // 1. Gather all data we can fetch from the backend overview endpoint
  let apiData: any = null;
  if (sParams.cip) {
    try {
      const res = await fetch(`${apiUrl}/overview/${id}/${sParams.cip}`, { cache: "no-store" });
      if (res.ok) {
        apiData = await res.json();
      }
    } catch (err) {
      console.error("Error fetching overview details:", err);
    }
  } else {
    try {
      const res = await fetch(`${apiUrl}/overview/${id}/default`, { cache: "no-store" });
      if (res.ok) {
        apiData = await res.json();
      }
    } catch (err) {
      console.error("Error fetching overview details with default cip:", err);
    }
  }

  // 2. Fetch outcomes details using resolved cip
  const resolvedCip = sParams.cip || apiData?.program?.cip_code;
  let outcomesData: any = null;
  if (resolvedCip) {
    try {
      const res = await fetch(`${apiUrl}/outcomes/${id}/${resolvedCip}`, { cache: "no-store" });
      if (res.ok) {
        outcomesData = await res.json();
      }
    } catch (err) {
      console.error("Error fetching outcomes details:", err);
    }
  }

  // 2b. Fetch campus details
  let campusData: any = null;
  try {
    const res = await fetch(`${apiUrl}/campus/${id}`, { cache: "no-store" });
    if (res.ok) {
      campusData = await res.json();
    }
  } catch (err) {
    console.error("Error fetching campus details:", err);
  }

  // 2c. Fetch tuition details
  let tuitionData: any = null;
  try {
    const res = await fetch(`${apiUrl}/tuition/${id}`, { cache: "no-store" });
    if (res.ok) {
      tuitionData = await res.json();
    }
  } catch (err) {
    console.error("Error fetching tuition details:", err);
  }

  // 2d. Fetch college details (for school_url)
  let collegeData: any = null;
  try {
    const res = await fetch(`${apiUrl}/colleges/${id}`, { cache: "no-store" });
    if (res.ok) {
      collegeData = await res.json();
    }
  } catch (err) {
    console.error("Error fetching college details:", err);
  }

  // 3. Build the final data object, prioritizing sParams first, then apiData, then mock fallback
  const name = sParams.name || (universityData[id]?.name) || "Unknown University";
  const city = sParams.city || "";
  const state = sParams.state || "";
  const location = city && state ? `${city}, ${state}` : (city || state || "Unknown Location");

  const type = sParams.type || (universityData[id]?.type) || "Private Research";

  const admissionRateRaw = sParams.admissionRate || (apiData?.admissions?.admission_rate !== null && apiData?.admissions?.admission_rate !== undefined
    ? `${(Number(apiData.admissions.admission_rate) * 100).toFixed(1)}%`
    : null) || (universityData[id]?.admissionRate) || "N/A";

  // Calculate real sticker price if tuitionData is available
  let calculatedStickerPriceString = "N/A";
  if (tuitionData) {
    const tuitionInState = tuitionData.tuition?.tuition_in_state ?? 12714;
    const bookSupply = tuitionData.tuition?.booksupply ?? 1200;
    const roomBoardOnCampus = tuitionData.housing?.roomboard_oncampus ?? 7348;
    const otherExpenseOnCampus = tuitionData.expenses?.otherexpense_oncampus ?? 2832;
    const stickerInState = bookSupply + tuitionInState + roomBoardOnCampus + otherExpenseOnCampus;
    calculatedStickerPriceString = `$${Math.round(stickerInState).toLocaleString()}`;
  }

  const tuitionRaw = tuitionData
    ? calculatedStickerPriceString
    : (sParams.tuition || (universityData[id]?.tuitionFee) || "N/A");

  const degree = sParams.degree || (universityData[id]?.degree) || "Bachelor's Degree";

  const cipCode = resolvedCip || (universityData[id]?.cipCode) || "N/A";

  // Student body stats from API overview details
  const totalStudents = apiData?.students?.size !== null && apiData?.students?.size !== undefined
    ? Number(apiData.students.size)
    : (id === "1" ? 17249 : id === "2" ? 43000 : null);

  const rawFacultyRatio = apiData?.students?.student_faculty_ratio;
  const facultyRatio = rawFacultyRatio
    ? (String(rawFacultyRatio).includes(":") ? String(rawFacultyRatio) : `${rawFacultyRatio}:1`)
    : (id === "1" ? "5:1" : id === "2" ? "18:1" : "N/A");

  const rawRetention = apiData?.students?.retention_rate;
  const retentionRate = rawRetention !== null && rawRetention !== undefined
    ? `${(Number(rawRetention) * 100).toFixed(0)}%`
    : (id === "1" ? "98%" : id === "2" ? "97%" : "N/A");

  const programs = apiData?.school?.program_count !== null && apiData?.school?.program_count !== undefined
    ? Number(apiData.school.program_count)
    : (id === "1" ? 20 : id === "2" ? 150 : null);

  const fafsaApplications = apiData?.students?.fafsa_applications !== null && apiData?.students?.fafsa_applications !== undefined
    ? Number(apiData.students.fafsa_applications)
    : (id === "1" ? 2412 : id === "2" ? 5700 : null);

  const rawCompletion = apiData?.completion?.completion_rate;
  const completionRate = rawCompletion !== null && rawCompletion !== undefined
    ? `${Number(rawCompletion).toFixed(0)}%`
    : (id === "1" ? "94%" : id === "2" ? "92%" : "N/A");

  // SAT & Student metrics from API if present, otherwise mock fallbacks
  const satAverage = apiData?.admissions?.sat_avg_overall !== null && apiData?.admissions?.sat_avg_overall !== undefined
    ? String(apiData.admissions.sat_avg_overall)
    : (universityData[id]?.satAverage) || "N/A";

  const satReadingWriting = apiData?.admissions?.sat_rw_min !== null && apiData?.admissions?.sat_rw_max !== null && apiData?.admissions?.sat_rw_min !== undefined && apiData?.admissions?.sat_rw_max !== undefined
    ? `${apiData.admissions.sat_rw_min} - ${apiData.admissions.sat_rw_max}`
    : (universityData[id]?.satReadingWriting) || "N/A";

  const satMath = apiData?.admissions?.sat_math_min !== null && apiData?.admissions?.sat_math_max !== null && apiData?.admissions?.sat_math_min !== undefined && apiData?.admissions?.sat_math_max !== undefined
    ? `${apiData.admissions.sat_math_min} - ${apiData.admissions.sat_math_max}`
    : (universityData[id]?.satMath) || "N/A";

  const applicants = apiData?.students?.fafsa_applications
    ? String(apiData.students.fafsa_applications)
    : (universityData[id]?.applicants) || "N/A";

  // Outcomes & Careers statistics
  const salaryYear1 = sanitizeSalary(outcomesData?.earnings?.year_1)
    || sanitizeSalary(apiData?.earnings?.year_1)
    || (id === "1" ? 91200 : id === "2" ? 85000 : null);
  const salaryYear5 = sanitizeSalary(outcomesData?.earnings?.year_5)
    || sanitizeSalary(apiData?.earnings?.year_5)
    || null;
  const salaryYear10 = sanitizeSalary(outcomesData?.earnings?.year_10)
    || sanitizeSalary(apiData?.earnings?.year_10)
    || (id === "1" ? 149696 : id === "2" ? 135000 : null);

  const netRoi20Yr = sParams.roi || outcomesData?.roi?.roi_20yr || apiData?.roi?.roi_20yr || (id === "1" ? 2100000 : id === "2" ? 1900000 : null);

  const rawGrowth = outcomesData?.earnings?.growth_rate || apiData?.earnings?.growth_rate;
  const growthRate = rawGrowth !== undefined && rawGrowth !== null
    ? Number(rawGrowth)
    : (salaryYear1 && salaryYear10 ? ((Number(salaryYear10) - Number(salaryYear1)) / Number(salaryYear1)) * 100 : (id === "1" ? 62.5 : id === "2" ? 58.8 : null));

  const empFactor = outcomesData?.completion?.emp_factor !== null && outcomesData?.completion?.emp_factor !== undefined
    ? Number(outcomesData.completion.emp_factor)
    : (id === "1" ? 0.95 : id === "2" ? 0.91 : null);

  const debtIncomeRatio = outcomesData?.debt_income_ratio?.debt_income_ratio !== null && outcomesData?.debt_income_ratio?.debt_income_ratio !== undefined
    ? Number(outcomesData.debt_income_ratio.debt_income_ratio)
    : (id === "1" ? 0.08 : id === "2" ? 0.12 : null);

  const avgSalary = outcomesData?.earnings?.avg_salary !== null && outcomesData?.earnings?.avg_salary !== undefined
    ? Number(outcomesData.earnings.avg_salary)
    : null;

  const data = {
    name,
    location,
    type,
    rank: "#1 National",
    admissionRate: admissionRateRaw,
    tuitionFee: tuitionRaw,
    logoColor: id === "2" ? "bg-[#003262]" : "bg-blue-600",
    description: `${name} is a distinguished institution situated in ${location}. It offers a wide range of academic opportunities and a vibrant student environment.`,
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

    // School URL
    schoolUrl: collegeData?.school_url || null,
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
