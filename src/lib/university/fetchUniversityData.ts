import { TuitionData } from "@/types/university/TuitionData";
import { AthleticsData } from "@/types/university/AthleticsData";
import {
  ApiCampus,
  ApiCollege,
  ApiOutcomes,
  ApiOverview,
  ApiUni,
} from "@/types/university/apiResponses";

const getApiUrl = () =>
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

// Fetch + parse JSON, swallowing failures so a single dead endpoint never
// takes down the whole page. Logs with the caller-provided context on error.
async function fetchJson<T>(
  url: string,
  errorContext: string,
): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      return (await res.json()) as T;
    }
  } catch (err) {
    console.error(errorContext, err);
  }
  return null;
}

export interface UniversityApiBundle {
  apiData: ApiOverview | null;
  outcomesData: ApiOutcomes | null;
  campusData: ApiCampus | null;
  tuitionData: TuitionData | null;
  collegeData: ApiCollege | null;
  programsData: unknown;
  fetchedAccreditor: string | null;
  resolvedCip: string | undefined;
  athleticsData: AthleticsData | null;
}

export async function fetchUniversityData(
  id: string,
  cip: string | undefined,
  // The same cip_code can be offered at more than one credential level at a
  // school (e.g. a Bachelor's and a Doctoral program both filed under the
  // same CIP) — /overview and /outcomes otherwise silently return whichever
  // level's row comes back first (observed: always the lowest level), so a
  // program picked for its credential level (e.g. "Doctoral Degree") would
  // render with the wrong Course Summary / Education Level info. Passing
  // credential_title disambiguates; an unrecognized value is safely ignored
  // by the backend and falls back to prior (single-row) behavior.
  credentialTitle: string | undefined,
): Promise<UniversityApiBundle> {
  const apiUrl = getApiUrl();
  const credentialQuery = credentialTitle
    ? `?credential_title=${encodeURIComponent(credentialTitle)}`
    : "";

  // 1. Gather all data we can fetch from the backend overview endpoint
  let apiData: ApiOverview | null = null;
  if (cip) {
    apiData = await fetchJson<ApiOverview>(
      `${apiUrl}/overview/${id}/${cip}${credentialQuery}`,
      "Error fetching overview details:",
    );
  } else {
    apiData = await fetchJson<ApiOverview>(
      `${apiUrl}/overview/${id}/default${credentialQuery}`,
      "Error fetching overview details with default cip:",
    );
  }

  // 2. Fetch outcomes details using resolved cip
  const resolvedCip = cip || apiData?.program?.cip_code;
  let outcomesData: ApiOutcomes | null = null;
  if (resolvedCip) {
    outcomesData = await fetchJson<ApiOutcomes>(
      `${apiUrl}/outcomes/${id}/${resolvedCip}${credentialQuery}`,
      "Error fetching outcomes details:",
    );
  }

  // 2b. Fetch campus details
  const campusData = await fetchJson<ApiCampus>(
    `${apiUrl}/campus/${id}`,
    "Error fetching campus details:",
  );

  // 2c. Fetch tuition details
  const tuitionData = await fetchJson<TuitionData>(
    `${apiUrl}/tuition/${id}`,
    "Error fetching tuition details:",
  );

  // 2d. Fetch college details (for school_url)
  const collegeData = await fetchJson<ApiCollege>(
    `${apiUrl}/colleges/${id}`,
    "Error fetching college details:",
  );

  // 2e. Fetch programs details
  const programsData = await fetchJson<unknown>(
    `${apiUrl}/programs/${id}`,
    "Error fetching programs details:",
  );

  // 2f. Fetch accreditor from search endpoint (since detail endpoints omit it)
  const accreditorSearchData = await fetchJson<ApiUni[]>(
    `${apiUrl}/search?type=universities`,
    "Error fetching university list for accreditor:",
  );
  const matchedUni = Array.isArray(accreditorSearchData)
    ? accreditorSearchData.find((uni) => String(uni.unitid) === String(id))
    : null;
  const fetchedAccreditor = matchedUni?.accreditor || null;

  // 2g. Fetch athletics disclosure details
  const athleticsData = await fetchJson<AthleticsData>(
    `${apiUrl}/colleges/${id}/athletics`,
    "Error fetching athletics details:",
  );

  return {
    apiData,
    outcomesData,
    campusData,
    tuitionData,
    collegeData,
    programsData,
    fetchedAccreditor,
    resolvedCip,
    athleticsData,
  };
}
