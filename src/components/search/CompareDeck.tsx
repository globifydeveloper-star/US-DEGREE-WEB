"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight } from "lucide-react";
import { removeFromCompare, clearCompare } from "./useCompareSelected";
import {
  parseEntryId,
  mergeCompareEntryIds,
} from "@/components/compare/useCompareColleges";
import {
  MATRIX_ENTRIES_KEY,
  MATRIX_UPDATED_EVENT,
  ENTRY_PROGRAMS_KEY,
} from "@/hooks/useCompareCount";

// College-level detail row, as cached in the shared "compared_colleges_details"
// mirror (one row per unitid — see useCompareColleges.ts's dedupe comment).
interface DeckCollege {
  id: string;
  name: string;
  logo?: string;
  logoColor: string;
  location: string;
  cipCode: string;
  schoolUrl: string;
}

// One chip in the deck. A college compared under more than one program (via
// the /compare page's own picker) renders as one chip per program — this is
// the merged view of the shared college-level bucket (search cards, etc.)
// and the /compare page's richer per-program matrix.
interface DeckEntry extends DeckCollege {
  entryId: string;
  programName?: string;
  credentialTitle?: string;
}

function readJsonArray(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function readEntryPrograms(): Record<
  string,
  { programName: string; credentialTitle: string }
> {
  if (typeof window === "undefined") return {};
  try {
    const v = JSON.parse(localStorage.getItem(ENTRY_PROGRAMS_KEY) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

// Minimal shapes for the API responses we read here.
interface DeckApiSchool {
  school_name?: string;
  name?: string;
  city?: string;
  state?: string;
  school_url?: string;
}
interface DeckOverview {
  school_name?: string;
  school_url?: string;
  school?: DeckApiSchool;
}
interface DeckCollegeApi {
  school_name?: string;
  name?: string;
  city?: string;
  state?: string;
  school_url?: string;
}

export default function CompareDeck() {
  const router = useRouter();
  const [entries, setEntries] = useState<DeckEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const loadEntries = async () => {
    const entryIds = mergeCompareEntryIds();
    if (entryIds.length === 0) {
      setEntries([]);
      return;
    }

    const unitids = Array.from(
      new Set(entryIds.map((entryId) => parseEntryId(entryId).unitid)),
    );

    const detailsList: DeckCollege[] =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("compared_colleges_details") || "[]")
        : [];

    // College-level (unitid) details — shared across every program entry for
    // that college, so we only fetch/cache once per college, not per entry.
    const currentDetails = detailsList.filter((c) =>
      unitids.includes(String(c.id)),
    );
    const existingUnitids = currentDetails.map((c) => String(c.id));
    const missingUnitids = unitids.filter(
      (id) => !existingUnitids.includes(id),
    );

    let mergedDetails = currentDetails;
    if (missingUnitids.length > 0) {
      const apiUrl = "/api/proxy";
      try {
        const fetchedDetails = await Promise.all(
          missingUnitids.map(async (id): Promise<DeckCollege> => {
            try {
              const [overviewRes, collegeRes] = await Promise.all([
                fetch(`${apiUrl}/overview/${id}/default`),
                fetch(`${apiUrl}/colleges/${id}`),
              ]);

              let overviewData: DeckOverview = {};
              let collegeData: DeckCollegeApi = {};

              if (overviewRes.ok) overviewData = await overviewRes.json();
              if (collegeRes.ok) collegeData = await collegeRes.json();

              const name =
                collegeData?.school_name ||
                collegeData?.name ||
                overviewData?.school_name ||
                overviewData?.school?.school_name ||
                overviewData?.school?.name ||
                `College ${id}`;

              const rawUrl =
                collegeData?.school_url ||
                overviewData?.school?.school_url ||
                overviewData?.school_url ||
                "";

              let website = "";
              if (rawUrl && rawUrl.trim()) {
                const trimmed = rawUrl.trim();
                website = trimmed.startsWith("http")
                  ? trimmed
                  : `https://${trimmed}`;
              }

              let logo = "";
              if (website) {
                try {
                  logo = `https://logo.clearbit.com/${new URL(website).hostname}`;
                } catch (urlErr) {
                  console.error(
                    "Failed to parse website URL for logo:",
                    urlErr,
                  );
                }
              }

              const city =
                collegeData?.city || overviewData?.school?.city || "";
              const state =
                collegeData?.state || overviewData?.school?.state || "";
              const location =
                city && state ? `${city}, ${state}` : city || state || "US";

              return {
                id,
                name,
                logo,
                logoColor: "bg-blue-600",
                location,
                cipCode: "default",
                schoolUrl: website,
              };
            } catch (e) {
              console.error("Failed to fetch basic overview for deck:", e);
            }
            return {
              id,
              name: `College ${id}`,
              logoColor: "bg-blue-600",
              location: "US",
              cipCode: "default",
              schoolUrl: "",
            };
          }),
        );

        mergedDetails = [...currentDetails];
        fetchedDetails.forEach((fd) => {
          if (!mergedDetails.some((m) => String(m.id) === String(fd.id))) {
            mergedDetails.push(fd);
          }
        });

        localStorage.setItem(
          "compared_colleges_details",
          JSON.stringify(mergedDetails),
        );
      } catch (e) {
        console.error(e);
      }
    }

    // Combine college-level details with each entry's own program info (if
    // this is a program-specific entry, not a bare college-only one).
    const detailsByUnitid = new Map(
      mergedDetails.map((d) => [String(d.id), d]),
    );
    const entryPrograms = readEntryPrograms();
    const built: DeckEntry[] = entryIds.map((entryId) => {
      const { unitid, cipCode } = parseEntryId(entryId);
      const detail = detailsByUnitid.get(unitid);
      const programInfo =
        entryId !== unitid ? entryPrograms[entryId] : undefined;
      return {
        id: unitid,
        entryId,
        name: detail?.name || `College ${unitid}`,
        logo: detail?.logo,
        logoColor: detail?.logoColor || "bg-blue-600",
        location: detail?.location || "US",
        cipCode,
        schoolUrl: detail?.schoolUrl || "",
        programName: programInfo?.programName,
        credentialTitle: programInfo?.credentialTitle,
      };
    });

    setEntries(built);
  };

  useEffect(() => {
    // Defer the initial load so its setState calls aren't synchronous within
    // the effect body. Subsequent loads are driven by the external events below.
    queueMicrotask(() => {
      void loadEntries();
    });
    window.addEventListener("compared-colleges-updated", loadEntries);
    window.addEventListener(MATRIX_UPDATED_EVENT, loadEntries);
    return () => {
      window.removeEventListener("compared-colleges-updated", loadEntries);
      window.removeEventListener(MATRIX_UPDATED_EVENT, loadEntries);
    };
  }, []);

  useEffect(() => {
    // Both transitions are scheduled (not synchronous) so the deck still slides
    // in after a 50ms delay and out when emptied.
    const t = setTimeout(
      () => setIsVisible(entries.length > 0),
      entries.length > 0 ? 50 : 0,
    );
    return () => clearTimeout(t);
  }, [entries.length]);

  const handleRemove = (entryId: string) => {
    const { unitid } = parseEntryId(entryId);

    if (entryId === unitid) {
      // Bare (no-program) entry — just drop the college from the shared store.
      removeFromCompare(unitid).catch((err) =>
        console.error("Failed to remove from comparison:", err),
      );
      return;
    }

    // Program-specific entry — drop just this entry from the /compare page's
    // matrix (mirrors useCompareColleges.handleRemoveCollege, minus the URL
    // sync, since this isn't the compare page). Only drop the college from
    // the shared store once no entry for it remains.
    const remaining = readJsonArray(MATRIX_ENTRIES_KEY).filter(
      (id) => id !== entryId,
    );
    localStorage.setItem(MATRIX_ENTRIES_KEY, JSON.stringify(remaining));
    const programsMap = readEntryPrograms();
    delete programsMap[entryId];
    localStorage.setItem(ENTRY_PROGRAMS_KEY, JSON.stringify(programsMap));
    window.dispatchEvent(new Event(MATRIX_UPDATED_EVENT));

    const stillPresent = remaining.some(
      (id) => parseEntryId(id).unitid === unitid,
    );
    if (!stillPresent) {
      removeFromCompare(unitid).catch((err) =>
        console.error("Failed to remove from comparison:", err),
      );
    }
  };

  const handleClearAll = () => {
    localStorage.setItem(MATRIX_ENTRIES_KEY, "[]");
    localStorage.removeItem(ENTRY_PROGRAMS_KEY);
    window.dispatchEvent(new Event(MATRIX_UPDATED_EVENT));
    clearCompare().catch((err) =>
      console.error("Failed to clear comparison set:", err),
    );
  };

  if (entries.length === 0) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[40] w-[calc(100%-2rem)] max-w-4xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-500 transform bg-white border border-slate-200/80 shadow-[0_10px_50px_rgba(0,0,0,0.15)] rounded-2xl ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      {/* Entry List */}
      <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto degree-scrollbar py-1 pr-2">
        {entries.map((c) => (
          <div
            key={c.entryId}
            className="relative flex items-center gap-2 bg-slate-50/80 border border-slate-100 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white transition-all shrink-0 min-w-[130px] max-w-[200px] shadow-sm shadow-slate-100"
          >
            {/* Logo/Initials */}
            {c.logo ? (
              // Third-party Clearbit logo (arbitrary runtime host) with an
              // onError → initials fallback; intentionally a plain <img> rather
              // than next/image, which would route every external logo through
              // the image optimizer.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.logo}
                alt={c.name}
                className="w-7 h-7 rounded-lg object-contain bg-white p-0.5 shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                  const fallback = (e.target as HTMLElement)
                    .nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-[10px] uppercase shrink-0"
              style={{ display: c.logo ? "none" : "flex" }}
            >
              {c.name.charAt(0)}
            </div>

            {/* School Name + Program (if this entry has one) */}
            <div className="flex-1 min-w-0 leading-tight select-none">
              <span className="block text-xs font-bold text-slate-700 truncate">
                {c.name}
              </span>
              {c.programName && (
                <span className="block text-[10px] font-semibold text-blue-600 truncate">
                  {c.programName}
                </span>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={() => handleRemove(c.entryId)}
              className="text-slate-400 hover:text-red-500 hover:bg-slate-200/50 p-0.5 rounded-full transition-colors cursor-pointer shrink-0"
              aria-label={`Remove ${c.name}${c.programName ? ` — ${c.programName}` : ""}`}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0 border-t border-slate-100 pt-3 md:pt-0 md:border-none">
        <button
          onClick={handleClearAll}
          className="text-slate-500 hover:text-slate-800 hover:underline text-xs font-bold px-3 py-2 cursor-pointer transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={() =>
            router.push(
              `/compare?ids=${entries.map((c) => c.entryId).join(",")}`,
            )
          }
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-5 rounded-full shadow-md active:scale-95 hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5 select-none"
        >
          <span>Compare ({entries.length}/5)</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
