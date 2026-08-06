import React, { useRef, useState } from "react";
import { Select, Button, Spin } from "antd";
import { BarChart3, ChevronRight, Search, Trash2, Plus } from "lucide-react";
import {
  fetchProgramsByCredential,
  fetchSchoolsForProgram,
  type ProgramByCredential,
  type SchoolForProgram,
} from "@/lib/auth/api";
import { CREDENTIAL_LEVEL_INFO } from "@/constants/credentialLevel";
import { parseEntryId } from "./compareEntryIds";

const MAX_COMPARE = 5;

const MIN_SEARCH_CHARS = 3;
const SEARCH_DEBOUNCE_MS = 300;

interface CompareSearchBarProps {
  comparedCount: number;
  comparedIds: string[];
  onAdd: (
    id: string,
    program?: {
      cipCode: string;
      programName: string;
      credentialTitle?: string;
      credentialLevel?: number | string;
      name?: string;
      location?: string;
    },
  ) => void;
  onClearAll: () => void;
  isClearingAll?: boolean;
}

const CREDENTIAL_LEVEL_OPTIONS = Object.entries(CREDENTIAL_LEVEL_INFO).map(
  ([level, info]) => ({
    value: Number(level),
    label: info.title,
  }),
);

export default function CompareSearchBar({
  comparedCount,
  comparedIds,
  onAdd,
  onClearAll,
  isClearingAll = false,
}: CompareSearchBarProps) {
  // Step 1: credential level — a fixed, static list (no backend call).
  const [credentialLevel, setCredentialLevel] = useState<number | null>(null);

  // Step 2: program search, scoped to the chosen credential level (global
  // across every school, not any one college).
  //
  // The query value itself is never read — the input is uncontrolled and the
  // debounced fetch closes over its argument — so only the setter is bound.
  const [, setProgramQuery] = useState("");
  const [programResults, setProgramResults] = useState<ProgramByCredential[]>(
    [],
  );
  const [isSearchingPrograms, setIsSearchingPrograms] = useState(false);
  const [selectedProgram, setSelectedProgram] =
    useState<ProgramByCredential | null>(null);
  const programSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Step 3: college search, scoped to the chosen program's cip_code + the
  // credential level — the reverse of the compare page's old college-first flow.
  const [, setCollegeQuery] = useState("");
  const [collegeResults, setCollegeResults] = useState<SchoolForProgram[]>([]);
  const [isSearchingColleges, setIsSearchingColleges] = useState(false);
  const [selectedCollege, setSelectedCollege] =
    useState<SchoolForProgram | null>(null);
  const collegeSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const resetFlow = () => {
    setCredentialLevel(null);
    setProgramQuery("");
    setProgramResults([]);
    setSelectedProgram(null);
    setCollegeQuery("");
    setCollegeResults([]);
    setSelectedCollege(null);
  };

  // Debounced keyword search for programs at the chosen credential level.
  // Below MIN_SEARCH_CHARS, falls back to the level's default list instead of
  // hitting search — so the field is never empty as soon as it's usable.
  const handleProgramSearch = (
    text: string,
    credentialOverride?: number | null,
  ) => {
    setProgramQuery(text);
    if (programSearchTimerRef.current) {
      clearTimeout(programSearchTimerRef.current);
      programSearchTimerRef.current = null;
    }

    const activeCredential =
      credentialOverride !== undefined ? credentialOverride : credentialLevel;
    if (activeCredential === null) return;

    const trimmed = text.trim();
    if (trimmed.length < MIN_SEARCH_CHARS) {
      setIsSearchingPrograms(true);
      fetchProgramsByCredential(activeCredential)
        .then((items) => setProgramResults(items))
        .catch((err) => console.error("Failed to load default programs:", err))
        .finally(() => setIsSearchingPrograms(false));
      return;
    }

    setIsSearchingPrograms(true);
    programSearchTimerRef.current = setTimeout(async () => {
      try {
        const items = await fetchProgramsByCredential(
          activeCredential,
          trimmed,
        );
        setProgramResults(items);
      } catch (err) {
        console.error("Failed to search programs:", err);
      } finally {
        setIsSearchingPrograms(false);
      }
    }, SEARCH_DEBOUNCE_MS);
  };

  // Credential level changed — reset everything downstream and load that
  // level's default program list.
  const handleCredentialChange = (value: number | null | undefined) => {
    const next = value ?? null;
    setCredentialLevel(next);
    setProgramQuery("");
    setProgramResults([]);
    setSelectedProgram(null);
    setCollegeQuery("");
    setCollegeResults([]);
    setSelectedCollege(null);
    if (next === null) return;
    handleProgramSearch("", next);
  };

  // Debounced keyword search for colleges offering the chosen program.
  const handleCollegeSearch = (text: string) => {
    setCollegeQuery(text);
    if (collegeSearchTimerRef.current) {
      clearTimeout(collegeSearchTimerRef.current);
      collegeSearchTimerRef.current = null;
    }

    if (!selectedProgram || credentialLevel === null) return;

    const trimmed = text.trim();
    if (trimmed.length < MIN_SEARCH_CHARS) {
      setIsSearchingColleges(true);
      fetchSchoolsForProgram(
        selectedProgram.cip_code,
        credentialLevel,
        selectedProgram.title,
      )
        .then((items) => setCollegeResults(items))
        .catch((err) => console.error("Failed to load default colleges:", err))
        .finally(() => setIsSearchingColleges(false));
      return;
    }

    setIsSearchingColleges(true);
    collegeSearchTimerRef.current = setTimeout(async () => {
      try {
        const items = await fetchSchoolsForProgram(
          selectedProgram.cip_code,
          credentialLevel,
          selectedProgram.title,
          trimmed,
        );
        setCollegeResults(items);
      } catch (err) {
        console.error("Failed to search colleges:", err);
      } finally {
        setIsSearchingColleges(false);
      }
    }, SEARCH_DEBOUNCE_MS);
  };

  // Program changed — reset the college step and load that program's default
  // college list.
  const handleProgramChange = (value: string | null | undefined) => {
    const prog = programResults.find((p) => p.title === value) ?? null;
    setSelectedProgram(prog);
    setCollegeQuery("");
    setCollegeResults([]);
    setSelectedCollege(null);
    if (!prog || credentialLevel === null) return;
    setIsSearchingColleges(true);
    fetchSchoolsForProgram(prog.cip_code, credentialLevel, prog.title)
      .then((items) => setCollegeResults(items))
      .catch((err) => console.error("Failed to load default colleges:", err))
      .finally(() => setIsSearchingColleges(false));
  };

  const handleFinalAdd = () => {
    if (!selectedCollege || !selectedProgram) return;
    onAdd(String(selectedCollege.unitid), {
      cipCode: selectedProgram.cip_code,
      programName: selectedProgram.title,
      credentialTitle: selectedProgram.credential_title,
      credentialLevel: selectedProgram.credential_level,
      name: selectedCollege.school_name,
      location:
        selectedCollege.city && selectedCollege.state
          ? `${selectedCollege.city}, ${selectedCollege.state}`
          : undefined,
    });
    resetFlow();
  };

  const programEnabled = credentialLevel !== null;
  const collegeEnabled = !!selectedProgram;

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
              loading={isClearingAll}
              disabled={isClearingAll}
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

      {/* All three steps are shown together — credential is always pickable;
          program unlocks once a credential level is chosen; college search
          unlocks once a program is chosen. */}
      <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-stretch gap-4 lg:gap-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
              1
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
            value={credentialLevel}
            allowClear
            onChange={handleCredentialChange}
            options={CREDENTIAL_LEVEL_OPTIONS}
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
            placeholder="Type a program to search"
            disabled={!programEnabled}
            value={selectedProgram?.title ?? null}
            filterOption={false}
            onSearch={(text) => handleProgramSearch(text)}
            loading={isSearchingPrograms}
            onChange={handleProgramChange}
            notFoundContent={
              isSearchingPrograms ? (
                <Spin size="small" />
              ) : (
                <span className="text-gray-400 text-xs">
                  No programs found for this search
                </span>
              )
            }
            options={programResults.map((p) => ({
              value: p.title,
              label: p.title,
            }))}
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
            disabled={!collegeEnabled}
            value={selectedCollege ? String(selectedCollege.unitid) : null}
            filterOption={false}
            onSearch={handleCollegeSearch}
            loading={isSearchingColleges}
            suffixIcon={<Search className="w-3.5 h-3.5 text-gray-400" />}
            onChange={(value) => {
              const college = collegeResults.find(
                (c) => String(c.unitid) === value,
              );
              setSelectedCollege(college ?? null);
            }}
            notFoundContent={
              isSearchingColleges ? (
                <Spin size="small" />
              ) : (
                <span className="text-gray-400 text-xs">
                  No colleges found for this search
                </span>
              )
            }
            options={collegeResults.map((c) => {
              const base =
                c.city && c.state
                  ? `${c.school_name} (${c.city}, ${c.state})`
                  : c.school_name;
              // We compare programs now, not just colleges — a college
              // already in the matrix can still be added again under a
              // different course, so this is a hint, not a disabled state.
              const alreadyAdded = comparedIds.some(
                (entryId) =>
                  parseEntryId(entryId).unitid === String(c.unitid),
              );
              return {
                value: String(c.unitid),
                label: alreadyAdded ? `${base} • already added` : base,
              };
            })}
          />
        </div>

        <div className="flex items-stretch lg:pl-4 lg:ml-1 lg:border-l lg:border-gray-100">
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleFinalAdd}
            disabled={!selectedCollege}
            className="w-full lg:w-auto self-end bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none font-bold rounded-xl h-11 px-5 shadow-sm flex items-center justify-center gap-1.5 shrink-0"
          >
            Add to Comparison
          </Button>
        </div>
      </div>
    </div>
  );
}
