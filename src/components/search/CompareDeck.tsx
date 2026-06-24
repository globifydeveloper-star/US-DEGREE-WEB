"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight } from "lucide-react";
import { removeFromCompare, clearCompare } from "./useCompareSelected";

// Display shape for one college chip in the deck (also the localStorage detail shape).
interface DeckCollege {
  id: string;
  name: string;
  logo?: string;
  logoColor: string;
  location: string;
  cipCode: string;
  schoolUrl: string;
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
  const [colleges, setColleges] = useState<DeckCollege[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const loadColleges = async () => {
    const list: string[] =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("compared_colleges") || "[]")
        : [];
    const detailsList: DeckCollege[] =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("compared_colleges_details") || "[]")
        : [];

    if (list.length === 0) {
      setColleges([]);
      return;
    }

    // Filter detailsList to only include items that are in list
    const currentColleges = detailsList.filter((c) =>
      list.includes(String(c.id)),
    );

    // Find which IDs in list are missing details
    const existingIds = currentColleges.map((c) => String(c.id));
    const missingIds = list.filter((id) => !existingIds.includes(String(id)));

    if (missingIds.length > 0) {
      const apiUrl = "/api/proxy";
      try {
        const fetchedDetails = await Promise.all(
          missingIds.map(async (id): Promise<DeckCollege> => {
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

        // Merge without duplicates
        const merged = [...currentColleges];
        fetchedDetails.forEach((fd) => {
          if (!merged.some((m) => String(m.id) === String(fd.id))) {
            merged.push(fd);
          }
        });

        setColleges(merged);
        localStorage.setItem(
          "compared_colleges_details",
          JSON.stringify(merged),
        );
      } catch (e) {
        console.error(e);
        setColleges(currentColleges);
      }
    } else {
      setColleges(currentColleges);
    }
  };

  useEffect(() => {
    // Defer the initial load so its setState calls aren't synchronous within
    // the effect body. Subsequent loads are driven by the external event below.
    queueMicrotask(() => {
      void loadColleges();
    });
    window.addEventListener("compared-colleges-updated", loadColleges);
    return () =>
      window.removeEventListener("compared-colleges-updated", loadColleges);
  }, []);

  useEffect(() => {
    // Both transitions are scheduled (not synchronous) so the deck still slides
    // in after a 50ms delay and out when emptied.
    const t = setTimeout(
      () => setIsVisible(colleges.length > 0),
      colleges.length > 0 ? 50 : 0,
    );
    return () => clearTimeout(t);
  }, [colleges.length]);

  const handleRemove = (id: string) => {
    // Route through the shared store (updates backend + localStorage mirror +
    // notifies the Navbar badge / profile section).
    removeFromCompare(String(id)).catch((err) =>
      console.error("Failed to remove from comparison:", err),
    );
  };

  const handleClearAll = () => {
    clearCompare().catch((err) =>
      console.error("Failed to clear comparison set:", err),
    );
  };

  if (colleges.length === 0) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[40] w-[calc(100%-2rem)] max-w-4xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-500 transform bg-white border border-slate-200/80 shadow-[0_10px_50px_rgba(0,0,0,0.15)] rounded-2xl ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      {/* College List */}
      <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto degree-scrollbar py-1 pr-2">
        {colleges.map((c) => (
          <div
            key={c.id}
            className="relative flex items-center gap-2 bg-slate-50/80 border border-slate-100 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white transition-all shrink-0 min-w-[130px] max-w-[180px] shadow-sm shadow-slate-100"
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

            {/* School Name */}
            <span className="text-xs font-bold text-slate-700 truncate flex-1 leading-tight select-none">
              {c.name}
            </span>

            {/* Remove Button */}
            <button
              onClick={() => handleRemove(c.id)}
              className="text-slate-400 hover:text-red-500 hover:bg-slate-200/50 p-0.5 rounded-full transition-colors cursor-pointer shrink-0"
              aria-label={`Remove ${c.name}`}
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
            router.push(`/compare?ids=${colleges.map((c) => c.id).join(",")}`)
          }
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-5 rounded-full shadow-md active:scale-95 hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5 select-none"
        >
          <span>Compare ({colleges.length}/5)</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
