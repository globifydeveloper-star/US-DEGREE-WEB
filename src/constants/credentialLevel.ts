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
