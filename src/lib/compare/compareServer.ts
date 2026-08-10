import { getBackendBaseUrl } from "@/lib/env";
import type { College } from "@/types/university/ComparisonTable";
import { parseEntryId } from "@/components/compare/compareEntryIds";
import { resolveSalaryValue, type SelectedCompareCollege } from "@/lib/auth/api";

export interface ServerCompareBundle {
  comparedIds: string[];
  comparedColleges: College[];
}

export async function fetchServerCompareDetails(
  idsParam?: string,
): Promise<ServerCompareBundle> {
  if (!idsParam) {
    return { comparedIds: [], comparedColleges: [] };
  }

  const comparedIds = idsParam.split(",").filter(Boolean);
  if (comparedIds.length === 0) {
    return { comparedIds: [], comparedColleges: [] };
  }

  try {
    const backendUrl = `${getBackendBaseUrl()}/compare/matrix/details`;
    // Pass entryIds to backend for details
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries: comparedIds }),
      cache: "no-store",
    });

    if (!res.ok) {
      // Fallback: build minimal rows for the IDs
      const fallbackColleges: College[] = comparedIds.map((entryId) => {
        const { unitid } = parseEntryId(entryId);
        return {
          id: entryId,
          unitid,
          name: `Institution (${unitid})`,
          shortName: `Institution ${unitid}`,
          logo: "",
          state: "US",
          location: "US",
          isPrivate: false,
          tuitionInState: null,
          tuitionOutOfState: null,
          acceptanceRate: null,
          satMin: null,
          satMax: null,
          graduationRate: null,
          medianSalary: null,
          studentPopulation: null,
          image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
          schoolUrl: undefined,
        };
      });

      return { comparedIds, comparedColleges: fallbackColleges };
    }

    const data: SelectedCompareCollege[] = await res.json();
    const baseMap = new Map<string, SelectedCompareCollege>();
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item.unitid) baseMap.set(String(item.unitid), item);
      });
    }

    const comparedColleges: College[] = comparedIds.map((entryId) => {
      const { unitid, cipCode } = parseEntryId(entryId);
      const base = baseMap.get(unitid);
      const name = base?.name || `Institution (${unitid})`;
      const location = base?.location || "US";
      const state = location.includes(",") ? location.split(",")[1].trim() : "US";

      return {
        id: entryId,
        unitid,
        name,
        shortName: name.replace("University", "").trim(),
        logo: base?.schoolUrl ? `https://logo.clearbit.com/${base.schoolUrl}` : "",
        state,
        location,
        isPrivate: (base?.schoolType || "").toLowerCase().includes("private"),
        tuitionInState: base?.tuitionInState ?? null,
        tuitionOutOfState: base?.cost?.tuitionOutState ?? null,
        acceptanceRate: base?.acceptanceRate ?? null,
        satMin: base?.academics?.satRangeLow ?? null,
        satMax: base?.academics?.satRangeHigh ?? null,
        graduationRate:
          base?.academics?.graduationRate != null
            ? base.academics.graduationRate / 100
            : null,
        medianSalary: resolveSalaryValue(base?.outcomes?.avgSalary),
        studentPopulation: base?.students?.size ?? null,
        image:
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
        schoolUrl: base?.schoolUrl || undefined,
        cipCode: cipCode !== "default" ? cipCode : undefined,
      };
    });

    return { comparedIds, comparedColleges };
  } catch (error) {
    console.error("Server compare details fetch failed:", error);
    return { comparedIds, comparedColleges: [] };
  }
}
