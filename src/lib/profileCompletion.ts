import type { StudentProfile } from "@/types/profile";

const sectionCompletion = (fields: unknown[]) =>
  fields.filter(Boolean).length / fields.length;

/**
 * Overall completion = average of the three profile dashboard sections'
 * own completion rates (Profile Info, Academics, Match Preferences). Kept
 * in one place so every consumer (the profile progress bar, the AI report
 * gate) agrees on the same percentage.
 */
export function calculateProfileCompletion(profile: StudentProfile): number {
  const profileInfoFields = [
    profile.fullName,
    profile.email,
    profile.phone,
    profile.address,
  ];
  const academicFields = [
    profile.highSchoolName,
    profile.graduationYear,
    profile.gpa,
    profile.satScore,
  ];
  const preferenceFields = [
    profile.preferredStates.length > 0,
    profile.preferredPrograms.length > 0,
    profile.preferredDegreeLevel,
    profile.preferredCollegeType,
  ];
  return Math.round(
    ((sectionCompletion(profileInfoFields) +
      sectionCompletion(academicFields) +
      sectionCompletion(preferenceFields)) /
      3) *
      100,
  );
}
