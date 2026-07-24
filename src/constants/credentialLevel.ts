// Static lookup for IPEDS credential-level codes (the `credential_level`
// field returned by /overview's `program` object, sourced from the
// `credentia` column). Keys were verified against real data via
// GET /schools/:id/programs/credentials across several schools — NOT assumed
// from the standard IPEDS awlevel table, which has levels 6 and 8 reversed
// from what this project's backend actually returns:
//   6 -> Doctoral Degree (not "Graduate/Professional Certificate")
//   8 -> Graduate/Professional Certificate (not "Doctoral Degree")
export interface CredentialLevelInfo {
  title: string;
  typicalDuration: string;
  educationLevel: string;
  receives: string;
}

export const CREDENTIAL_LEVEL_INFO: Record<number, CredentialLevelInfo> = {
  1: {
    title: "Undergraduate Certificate or Diploma",
    typicalDuration: "6 months – 1 year",
    educationLevel: "Undergraduate",
    receives:
      "Awarded upon successful completion of a short-term program focused on developing foundational knowledge and practical skills.",
  },

  2: {
    title: "Associate's Degree",
    typicalDuration: "2 years",
    educationLevel: "Undergraduate",
    receives: "Awarded upon successful completion of an undergraduate program.",
  },

  3: {
    title: "Bachelor's Degree",
    typicalDuration: "4 years",
    educationLevel: "Undergraduate",
    receives:
      "Awarded upon successful completion of a comprehensive undergraduate program.",
  },

  4: {
    title: "Post-baccalaureate Certificate",
    typicalDuration: "6 months – 2 years",
    educationLevel: "Graduate",
    receives:
      "Awarded upon successful completion of advanced post-undergraduate study.",
  },

  5: {
    title: "Master's Degree",
    typicalDuration: "1–2 years",
    educationLevel: "Graduate",
    receives:
      "Awarded upon successful completion of an advanced graduate program.",
  },

  6: {
    title: "Doctoral Degree",
    typicalDuration: "4–7+ years",
    educationLevel: "Doctoral",
    receives:
      "Awarded upon successful completion of the highest level of academic study.",
  },

  7: {
    title: "First Professional Degree",
    typicalDuration: "3–6 years (after Bachelor's in most cases)",
    educationLevel: "Professional",
    receives:
      "Awarded upon successful completion of a professional practice program.",
  },

  8: {
    title: "Graduate/Professional Certificate",
    typicalDuration: "6 months – 1.5 years",
    educationLevel: "Graduate",
    receives:
      "Awarded upon successful completion of a specialized graduate-level program.",
  },
};

export function getCredentialLevelInfo(
  level: number | null | undefined,
): CredentialLevelInfo | null {
  if (level === null || level === undefined) return null;
  return CREDENTIAL_LEVEL_INFO[level] ?? null;
}

// Placeholder Tailwind pill colors, one per IPEDS level — chosen only for
// visual separation between levels. No design-system color tokens exist in
// this project yet (tailwind.config.tsx has no custom palette); swap these
// for real tokens once design confirms them.
export const CREDENTIAL_LEVEL_COLOR: Record<number, string> = {
  1: "bg-slate-50 text-slate-700 border-slate-200",
  2: "bg-cyan-50 text-cyan-700 border-cyan-200",
  3: "bg-blue-50 text-blue-700 border-blue-200",
  4: "bg-purple-50 text-purple-700 border-purple-200",
  5: "bg-indigo-50 text-indigo-700 border-indigo-200",
  6: "bg-rose-50 text-rose-700 border-rose-200",
  7: "bg-amber-50 text-amber-700 border-amber-200",
  8: "bg-teal-50 text-teal-700 border-teal-200",
};

export const CREDENTIAL_LEVEL_COLOR_DEFAULT =
  "bg-gray-100 text-gray-500 border-gray-300";

// Short forms of CREDENTIAL_LEVEL_INFO[x].title for space-constrained chips;
// the full title is still available via getCredentialLevelInfo for tooltips.
export const CREDENTIAL_LEVEL_SHORT_LABEL: Record<number, string> = {
  1: "Certificate",
  2: "Associate's",
  3: "Bachelor's",
  4: "Post-Bacc Cert.",
  5: "Master's",
  6: "Doctoral",
  7: "Professional",
  8: "Grad Certificate",
};
