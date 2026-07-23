export interface CourseSummarySideCardProps {
  degree: string;
  format: string;
  financialAid: string;
  schoolUrl?: string | null;
  // IPEDS credential_level code for this program (e.g. 3 = Bachelor's
  // Degree) — see src/constants/credentialLevel.ts. When null/unknown, the
  // "About this credential type" section is hidden entirely.
  credentialLevel?: number | null;
}
