import React, { useRef, useState } from "react";
import { Select, Button, Spin } from "antd";
import { BarChart3, ChevronRight, Search, Trash2, Plus } from "lucide-react";
import { authedFetch } from "@/lib/auth/api";
import { UniOption, parseEntryId } from "./useCompareColleges";

const MAX_COMPARE = 5;

const MIN_PROGRAM_SEARCH_CHARS = 3;
const PROGRAM_SEARCH_DEBOUNCE_MS = 300;

interface CredentialOption {
  credential_title: string;
  credential_level: number;
}

interface ProgramResult {
  title: string;
  cip_code: string;
  credential_title: string;
  credential_level: number;
}

interface CompareSearchBarProps {
  comparedCount: number;
  isSearching: boolean;
  selectOptions: UniOption[];
  comparedIds: string[];
  minSearchChars: number;
  onSearch: (searchText: string) => void;
  onAdd: (
    id: string,
    program?: {
      cipCode: string;
      programName: string;
      credentialTitle?: string;
      credentialLevel?: number | string;
    },
  ) => void;
  onClearAll: () => void;
}

export default function CompareSearchBar({
  comparedCount,
  isSearching,
  selectOptions,
  comparedIds,
  minSearchChars,
  onSearch,
  onAdd,
  onClearAll,
}: CompareSearchBarProps) {
  // Step 1: which college the user is currently configuring.
  const [pendingCollege, setPendingCollege] = useState<UniOption | null>(null);

  // Step 2: credential level (degree level) offered at that college — required
  // before a course can be picked.
  const [credentialOptions, setCredentialOptions] = useState<CredentialOption[]>([]);
  const [credentialTitle, setCredentialTitle] = useState<string | null>(null);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);

  // Step 3: course/program search, scoped to the college + credential level.
  // `programResults` holds up to 20 courses — the credential level's default
  // list until the user types at least MIN_PROGRAM_SEARCH_CHARS, then live
  // search results — so the field is never empty as soon as it's usable.
  const [programQuery, setProgramQuery] = useState("");
  const [programResults, setProgramResults] = useState<ProgramResult[]>([]);
  const [isSearchingPrograms, setIsSearchingPrograms] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ProgramResult | null>(null);
  const programSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetFlow = () => {
    setPendingCollege(null);
    setCredentialOptions([]);
    setCredentialTitle(null);
    setProgramQuery("");
    setProgramResults([]);
    setSelectedProgram(null);
  };

  // Fetches up to 20 programs for a college; `q` empty returns the default
  // course list for that credential level, otherwise it's a keyword search —
  // always hits the backend rather than filtering whatever's already on
  // screen, so a search can surface courses outside the initial 20.
  const fetchPrograms = async (
    collegeId: string,
    q: string,
    credential: string | null,
  ): Promise<ProgramResult[]> => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (credential) params.set("credential_title", credential);
    params.set("limit", "20");

    const res = await authedFetch(
      `/schools/${collegeId}/programs?${params.toString()}`,
    );
    if (!res.ok) return [];
    const data: unknown = await res.json();
    return Array.isArray(data)
      ? data
      : Array.isArray((data as { programs?: ProgramResult[] })?.programs)
        ? (data as { programs: ProgramResult[] }).programs
        : [];
  };

  // Load the credential (degree) levels a college actually offers. Triggered
  // directly from the college picker's onChange (not an effect) so the
  // subsequent setState calls happen inside a real event handler.
  const loadCredentialsFor = (college: UniOption) => {
    setIsLoadingCredentials(true);
    setCredentialOptions([]);
    setCredentialTitle(null);
    setProgramQuery("");
    setProgramResults([]);
    setSelectedProgram(null);

    authedFetch(`/schools/${college.id}/programs/credentials`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        const items: CredentialOption[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.credentials)
            ? data.credentials
            : [];
        setCredentialOptions(items);
      })
      .catch(() => setCredentialOptions([]))
      .finally(() => setIsLoadingCredentials(false));
  };

  // Debounced keyword search for courses within the chosen college/credential level.
  const handleProgramSearch = (text: string, credentialOverride?: string | null) => {
    setProgramQuery(text);
    if (programSearchTimerRef.current) {
      clearTimeout(programSearchTimerRef.current);
      programSearchTimerRef.current = null;
    }

    const trimmed = text.trim();
    const activeCredential =
      credentialOverride !== undefined ? credentialOverride : credentialTitle;
    // A credential level must be chosen before courses can be browsed/searched.
    if (!pendingCollege || !activeCredential) return;

    // Below the minimum keyword length, fall back to the default list for
    // this credential level instead of hitting search.
    if (trimmed.length < MIN_PROGRAM_SEARCH_CHARS) {
      setIsSearchingPrograms(true);
      fetchPrograms(pendingCollege.id, "", activeCredential)
        .then((items) => setProgramResults(items))
        .catch((err) => console.error("Failed to load default programs:", err))
        .finally(() => setIsSearchingPrograms(false));
      return;
    }

    setIsSearchingPrograms(true);
    programSearchTimerRef.current = setTimeout(async () => {
      try {
        const items = await fetchPrograms(
          pendingCollege.id,
          trimmed,
          activeCredential,
        );
        setProgramResults(items);
      } catch (err) {
        console.error("Failed to search programs:", err);
      } finally {
        setIsSearchingPrograms(false);
      }
    }, PROGRAM_SEARCH_DEBOUNCE_MS);
  };

  // Credential level changed — load that level's default course list (or
  // re-run the current search under it), from the credential Select's own
  // onChange handler. Clearing the credential disables/empties the course field.
  const handleCredentialChange = (value: string | null | undefined) => {
    const next = value ?? null;
    setCredentialTitle(next);
    setSelectedProgram(null);
    if (!next) {
      setProgramResults([]);
      setProgramQuery("");
      return;
    }
    handleProgramSearch(programQuery, next);
  };

  const handleFinalAdd = () => {
    if (!pendingCollege) return;
    if (selectedProgram) {
      onAdd(pendingCollege.id, {
        cipCode: selectedProgram.cip_code,
        programName: selectedProgram.title,
        credentialTitle: selectedProgram.credential_title,
        credentialLevel: selectedProgram.credential_level,
      });
    } else {
      onAdd(pendingCollege.id);
    }
    resetFlow();
    // Reset the college picker back to its default (unfiltered) list rather
    // than leaving it stuck on whatever search text/results were last typed.
    onSearch("");
  };

  const credentialEnabled = !!pendingCollege;
  const courseEnabled = !!pendingCollege && !!credentialTitle;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 sm:mb-10 overflow-hidden">
      {/* Header: comparing count + segmented progress + Clear all */}
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#3F51B5] shrink-0">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 leading-none mb-1">
                Comparing
              </p>
              <p className="font-extrabold text-slate-900 text-base sm:text-lg leading-none">
                {comparedCount} / {MAX_COMPARE} Selected
              </p>
            </div>
          </div>
          {comparedCount > 0 && (
            <Button
              danger
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={onClearAll}
              className="font-bold flex items-center gap-1.5 shrink-0 rounded-lg border-red-200 text-red-500 hover:!text-red-600 hover:!border-red-400"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Segmented progress bar — one segment per compare slot */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: MAX_COMPARE }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < comparedCount ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* All three steps are shown together — college is always pickable;
          credential level unlocks once a college is chosen; course search
          unlocks once a credential level is chosen. */}
      <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-stretch gap-4 lg:gap-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 leading-tight">
                College
              </p>
              <p className="text-[11px] text-gray-400 leading-tight truncate">
                Search and select a college
              </p>
            </div>
          </div>
          <Select
            showSearch
            className="w-full h-11"
            placeholder="Search for a college"
            value={pendingCollege?.id ?? null}
            filterOption={false}
            onSearch={onSearch}
            loading={isSearching}
            suffixIcon={<Search className="w-3.5 h-3.5 text-gray-400" />}
            notFoundContent={
              isSearching ? (
                <Spin size="small" />
              ) : (
                <span className="text-gray-400 text-xs">
                  Type at least {minSearchChars} characters to search
                </span>
              )
            }
            onChange={(value) => {
              const opt = selectOptions.find((c) => c.id === value);
              if (opt) {
                setPendingCollege(opt);
                loadCredentialsFor(opt);
              }
            }}
            options={(pendingCollege &&
            !selectOptions.some((c) => c.id === pendingCollege.id)
              ? [pendingCollege, ...selectOptions]
              : selectOptions
            ).map((c) => {
              const base =
                c.city && c.state
                  ? `${c.name} (${c.city}, ${c.state})`
                  : c.name;
              // We compare programs now, not just colleges — a college
              // already in the matrix can still be added again under a
              // different course, so this is a hint, not a disabled state.
              const alreadyAdded = comparedIds.some(
                (entryId) => parseEntryId(entryId).unitid === c.id,
              );
              return {
                value: c.id,
                label: alreadyAdded ? `${base} • already added` : base,
              };
            })}
          />
        </div>

        <div className="hidden lg:flex items-center justify-center px-3 self-end pb-3.5 shrink-0">
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 leading-tight">
                Credential
              </p>
              <p className="text-[11px] text-gray-400 leading-tight truncate">
                Select credential type
              </p>
            </div>
          </div>
          <Select
            className="w-full h-11"
            placeholder="Select credential"
            disabled={!credentialEnabled}
            value={credentialTitle}
            loading={isLoadingCredentials}
            allowClear
            onChange={handleCredentialChange}
            options={credentialOptions.map((c) => ({
              value: c.credential_title,
              label: c.credential_title,
            }))}
            notFoundContent={
              isLoadingCredentials ? (
                <Spin size="small" />
              ) : (
                <span className="text-gray-400 text-xs">
                  No credential levels found
                </span>
              )
            }
          />
        </div>

        <div className="hidden lg:flex items-center justify-center px-3 self-end pb-3.5 shrink-0">
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 leading-tight">
                Program
              </p>
              <p className="text-[11px] text-gray-400 leading-tight truncate">
                Select program of study
              </p>
            </div>
          </div>
          <Select
            showSearch
            className="w-full h-11"
            placeholder="Select program"
            disabled={!courseEnabled}
            value={selectedProgram?.title ?? null}
            filterOption={false}
            onSearch={handleProgramSearch}
            loading={isSearchingPrograms}
            onChange={(value) => {
              const prog = programResults.find((p) => p.title === value);
              setSelectedProgram(prog ?? null);
            }}
            notFoundContent={
              isSearchingPrograms ? (
                <Spin size="small" />
              ) : (
                <span className="text-gray-400 text-xs">
                  No courses found for this search
                </span>
              )
            }
            options={programResults.map((p) => ({
              value: p.title,
              label: p.title,
            }))}
          />
        </div>

        <div className="flex items-stretch lg:pl-4 lg:ml-1 lg:border-l lg:border-gray-100">
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleFinalAdd}
            disabled={!pendingCollege}
            className="w-full lg:w-auto self-end bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none font-bold rounded-xl h-11 px-5 shadow-sm flex items-center justify-center gap-1.5 shrink-0"
          >
            Add to Comparison
          </Button>
        </div>
      </div>
    </div>
  );
}
