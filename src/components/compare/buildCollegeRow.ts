import type { College } from "@/types/university/ComparisonTable";
import type { SelectedCompareCollege } from "@/lib/auth/api";
import { parseEntryId } from "./compareEntryIds";
import type { EntryProgramInfo } from "./compareEntryIds";
import type { RawUniversity, StoredDetail, UniOption } from "./compareCollegeTypes";

// academics.graduationRate arrives as an already-scaled percentage (e.g.
// 31.69); College.graduationRate is a fraction, matching acceptanceRate and
// every renderer in desktop/rows + mobile/sections that does `rate * 100`.
function toFraction(percent: number | null): number | null {
  return percent === null ? null : percent / 100;
}

function deriveLogo(schoolUrl: string | null): string {
  if (!schoolUrl) return "";
  try {
    const url = schoolUrl.startsWith("http") ? schoolUrl : `https://${schoolUrl}`;
    return `https://logo.clearbit.com/${new URL(url).hostname}`;
  } catch {
    return "";
  }
}

interface BuildContext {
  // Keyed by unitid (string). One row per college in the backend's set, from
  // a single GET /compare/selected?programs=... call — `selectedProgram` is
  // already resolved on each row against whichever program in the list
  // matches that college.
  baseByUnitid: Map<string, SelectedCompareCollege>;
  storedDetails: StoredDetail[];
  entryProgramsMap: Record<string, EntryProgramInfo>;
  allUniversities: Map<string, UniOption>;
  cacheUniversity: (uni: RawUniversity) => UniOption | null;
}

/**
 * Build one comparison-table row from the already-fetched `/compare/selected`
 * data. Never throws and never returns null — if the backend's set hasn't
 * caught up with a just-added college yet, the row renders with cached
 * name/location and N/A metrics rather than disappearing, and self-heals on
 * the next fetch.
 */
export function buildCollegeRow(entryId: string, ctx: BuildContext): College {
  const { unitid, cipCode: entryCipCode } = parseEntryId(entryId);
  const base = ctx.baseByUnitid.get(unitid);

  // Bare entries (no `~cipCode` suffix) stay resolved the historical way — via
  // the shared cross-app details mirror — so links from other pages
  // (Intelligent Matches, university page, CompareDeck) keep working
  // unchanged. Suffixed entries carry their own cipCode; programName for
  // those comes from the compare-page-local map, since the shared mirror
  // only holds one program per unitid.
  const isBareEntry = entryId === unitid;
  const matchedStored = ctx.storedDetails.find(
    (d) => String(d.id) === unitid,
  );
  const cipCode = isBareEntry
    ? matchedStored?.cipCode || "default"
    : entryCipCode;
  const programInfo = ctx.entryProgramsMap[entryId];
  const programName =
    cipCode === "default"
      ? ""
      : isBareEntry
        ? matchedStored?.programName || ""
        : programInfo?.programName || "";
  const credentialTitle =
    cipCode === "default" ? "" : isBareEntry ? "" : programInfo?.credentialTitle || "";

  // If this entry names a specific program, prefer that program's own
  // earnings figure (when the backend matched one) over the school-wide average.
  const selectedProgram = programName
    ? base?.programs.selectedProgram
    : undefined;

  const matchedUni =
    ctx.allUniversities.get(unitid) || matchedStored;
  const name = base?.name || matchedUni?.name || "Unknown University";
  const location =
    base?.location ||
    (matchedStored?.city && matchedStored?.state
      ? `${matchedStored.city}, ${matchedStored.state}`
      : matchedStored?.location) ||
    "Unknown";
  const [city = "", state = ""] = location.split(",").map((s) => s.trim());
  const schoolType = base?.schoolType || matchedStored?.schoolType || "Public";
  const isPrivate = schoolType.toLowerCase().includes("private");
  const schoolUrl = base?.schoolUrl || matchedStored?.schoolUrl || undefined;

  ctx.cacheUniversity({
    unitid,
    school_name: name,
    city,
    state,
    school_type: schoolType,
  });

  return {
    id: entryId,
    unitid,
    name,
    shortName: name
      .replace("University", "")
      .replace("Institute of Technology", "")
      .trim(),
    logo: deriveLogo(schoolUrl ?? null),
    state,
    location,
    isPrivate,
    tuitionInState: base?.tuitionInState ?? null,
    tuitionOutOfState: base?.cost.tuitionOutState ?? null,
    acceptanceRate: base?.acceptanceRate ?? null,
    satMin: base?.academics.satRangeLow ?? null,
    satMax: base?.academics.satRangeHigh ?? null,
    graduationRate: base ? toFraction(base.academics.graduationRate) : null,
    medianSalary: selectedProgram?.earnings ?? base?.outcomes.avgSalary ?? null,
    // Not provided by /compare/selected — the old per-college /overview call
    // was the only source for this and is no longer fetched.
    studentPopulation: null,
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
    schoolUrl,
    cipCode,
    programName: programName || undefined,
    credentialTitle: credentialTitle || undefined,
  };
}
