/**
 * College matchmaking for the Profile Dashboard.
 *
 * Matches are driven entirely by the student's saved preferences — target
 * states and target majors/curriculums — and pulled from the live backend
 * (NO mock/seed data). For each preferred major we query GET /search (which
 * filters by `title` and `state`), merge + de-duplicate the results, then
 * enrich the top few colleges with graduation rate and 1-year median salary
 * from GET /overview and GET /outcomes (those two fields aren't in /search).
 *
 * Every numeric field is nullable: when the backend has no value the tile
 * renders "N/A" rather than a fabricated number.
 */

"use client";

import { useState, useEffect } from "react";
import { authedFetch } from "@/lib/auth/api";
import { StudentProfile } from "../../types/profile";
import { SearchResult } from "../../types/search-details";

/** A single matched college, ready to render. Rates are percentages (0–100). */
export interface CollegeMatch {
  id: string; // unitid (also used as the React key / save+compare id)
  unitid: string;
  name: string;
  city: string;
  state: string;
  cipCode: string;
  programTitle: string; // the matched major/curriculum
  degreeLevel: string; // credential level for that program (e.g. "Bachelor's Degree")
  isPrivate: boolean;
  tuition: number | null; // in-state tuition, $/yr
  acceptanceRate: number | null; // %
  graduationRate: number | null; // %
  employmentRate: number | null; // %
  medianSalary1yr: number | null; // 1-year median salary, $
}

// How many match tiles to show (and therefore enrich).
const MAX_MATCHES = 8;

// Parse a numeric API value, returning null for anything non-numeric.
function toNum(val: number | string | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  const num = Number(val);
  return Number.isNaN(num) ? null : num;
}

// Salaries arrive as numbers, numeric strings, or sentinel strings ("No Value",
// "N/A", "null"). Return a clean number or null.
function sanitizeSalary(
  val: number | string | null | undefined,
): number | null {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (
    str === "" ||
    str === "No Value" ||
    str === "N/A" ||
    str.toLowerCase() === "null"
  ) {
    return null;
  }
  const num = Number(str.replace(/[^0-9.-]/g, ""));
  return Number.isNaN(num) ? null : num;
}

// Normalise a rate to a 0–100 percentage. `admission_rate`/`emp_factor` arrive
// as 0–1 fractions, while `completion_rate` is already 0–100, so anything <= 1
// is scaled up.
function toPercent(val: number | string | null | undefined): number | null {
  const num = toNum(val);
  if (num === null) return null;
  return num <= 1 ? num * 100 : num;
}

/**
 * Reactive college matches for a profile. Re-runs whenever the user's target
 * states or majors change. Returns the matches and a loading flag.
 */
export function useCollegeMatches(profile: StudentProfile): {
  matches: CollegeMatch[];
  loading: boolean;
} {
  const [matches, setMatches] = useState<CollegeMatch[]>([]);
  const [loading, setLoading] = useState(false);

  const states = profile.preferredStates;
  const programs = profile.preferredPrograms;
  // Primitive deps so the effect only re-runs on actual preference changes.
  const statesKey = states.join(",");
  const programsKey = programs.join(",");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // No preferences yet → nothing to match on.
      if (programs.length === 0 && states.length === 0) {
        setMatches([]);
        return;
      }

      setLoading(true);
      try {
        // 1. Query /search once per preferred major (or once with no title when
        //    only states are set). We send the first state to narrow the result
        //    set server-side, then filter client-side for the rest.
        const queries = programs.length > 0 ? programs : [""];
        const resultArrays = await Promise.all(
          queries.map(async (major) => {
            const params = new URLSearchParams();
            if (major) params.set("title", major);
            if (states.length > 0) params.set("state", states[0]);
            try {
              const res = await authedFetch(`/search?${params.toString()}`);
              if (!res.ok) return [];
              const data: unknown = await res.json();
              return Array.isArray(data) ? (data as SearchResult[]) : [];
            } catch {
              return [];
            }
          }),
        );

        let rows = resultArrays.flat();

        // Filter to the full set of preferred states (client-side).
        if (states.length > 0) {
          const wanted = new Set(states.map((s) => s.toUpperCase()));
          rows = rows.filter(
            (r) => r.state && wanted.has(String(r.state).toUpperCase()),
          );
        }

        // De-duplicate by college (a school can appear once per program row).
        const seen = new Set<string>();
        const unique: SearchResult[] = [];
        for (const r of rows) {
          const id = String(r.unitid ?? "");
          if (!id || seen.has(id)) continue;
          seen.add(id);
          unique.push(r);
        }

        const base: CollegeMatch[] = unique.slice(0, MAX_MATCHES).map((r) => ({
          id: String(r.unitid),
          unitid: String(r.unitid),
          name: r.school_name || "Unknown University",
          city: r.city ?? "",
          state: r.state ?? "",
          cipCode: r.cip_code || "default",
          programTitle: r.program_title ?? "",
          degreeLevel: r.credential_title ?? "",
          isPrivate: String(r.college_type ?? r.school_type ?? "")
            .toLowerCase()
            .includes("private"),
          tuition: toNum(r.tuition_in_state),
          acceptanceRate: toPercent(r.admission_rate),
          employmentRate: toPercent(r.emp_factor),
          graduationRate: null, // filled in by the enrichment pass below
          medianSalary1yr: null,
        }));

        // Show the base tiles immediately; grad rate + 1-yr salary stream in.
        if (!cancelled) setMatches(base);

        // 2. Enrich each shown college with graduation rate (completion_rate)
        //    and 1-year median salary (earnings.year_1), which /search omits.
        const enriched = await Promise.all(
          base.map(async (m) => {
            try {
              const [ovRes, outRes] = await Promise.all([
                authedFetch(`/overview/${m.id}/${m.cipCode}`),
                authedFetch(`/outcomes/${m.id}/${m.cipCode}`),
              ]);

              let graduationRate: number | null = null;
              let medianSalary1yr: number | null = null;

              if (ovRes.ok) {
                const ov = await ovRes.json();
                graduationRate = toPercent(ov?.completion?.completion_rate);
                medianSalary1yr = sanitizeSalary(ov?.earnings?.year_1);
              }
              if (outRes.ok) {
                const out = await outRes.json();
                medianSalary1yr =
                  sanitizeSalary(out?.earnings?.year_1) ?? medianSalary1yr;
              }

              return { ...m, graduationRate, medianSalary1yr };
            } catch {
              return m;
            }
          }),
        );

        if (!cancelled) setMatches(enriched);
      } catch (err) {
        console.error("Failed to compute college matches:", err);
        if (!cancelled) setMatches([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statesKey, programsKey]);

  return { matches, loading };
}
//
