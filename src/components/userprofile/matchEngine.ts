/**
 * College matchmaking algorithm for the Profile Dashboard.
 *
 * Pure, side-effect free: combines the student's SAT score, preferred states,
 * preferred programs and GPA into a ranked list of college matches. Extracted
 * from ProfileDashboard so the scoring logic can be tested/tuned in isolation.
 */

import { UNIVERSITIES, PROGRAMS } from "../../data/mockColleges";
import { StudentProfile, University } from "../../types/profile";

export type MatchBadge = "Strong Match" | "Good Match" | "Reach School";

export interface CollegeMatch {
  university: University;
  percentage: number;
  badgeType: MatchBadge;
  graduationRate: number;
  estimatedSalary: number;
}

export function computeCollegeMatches(profile: StudentProfile): CollegeMatch[] {
  return UNIVERSITIES.map((uni) => {
    let baseMatch = 55;

    // 1. State matching check (+20%)
    const matchesState = profile.preferredStates.includes(uni.state);
    if (matchesState) {
      baseMatch += 20;
    }

    // 2. SAT Fit assessment (+15%)
    const totalSAT = (profile.satMath ?? 0) + (profile.satReadingWriting ?? 0);
    // Elite universities (Stanford, Harvard, MIT, Columbia, etc.)
    const isUltraSelective = [
      "stanford",
      "mit",
      "harvard",
      "columbia",
      "rice",
      "upenn",
    ].includes(uni.id);

    if (isUltraSelective) {
      if (totalSAT >= 1480) {
        baseMatch += 15;
      } else if (totalSAT >= 1350) {
        baseMatch += 5;
      } else {
        baseMatch -= 15; // Tough reach
      }
    } else {
      // Public flagships & other top schools
      if (totalSAT >= 1300) {
        baseMatch += 15;
      } else if (totalSAT >= 1150) {
        baseMatch += 10;
      }
    }

    // 3. GPA Factor (+10%)
    const gpa = profile.gpa ?? 0;
    if (gpa >= 3.85) {
      baseMatch += 10;
    } else if (gpa >= 3.5) {
      baseMatch += 5;
    }

    // 4. Preferred Programs check
    // We see if the program list at this university matches any of the user's preferred majors
    const uniPrograms = PROGRAMS.filter((p) => p.universityId === uni.id);
    const matchesMajor = uniPrograms.some((up) =>
      profile.preferredPrograms.includes(up.fieldOfStudy),
    );
    if (matchesMajor) {
      baseMatch += 10;
    }

    // Constrain scoring to sensible bounds
    const finalScore = Math.max(40, Math.min(98, baseMatch));

    // Match Type Classification badge
    let badgeType: MatchBadge = "Good Match";
    if (finalScore >= 85) {
      badgeType = "Strong Match";
    } else if (isUltraSelective && totalSAT < 1400) {
      badgeType = "Reach School";
    } else if (finalScore < 70) {
      badgeType = "Reach School";
    }

    // Mock additional matching stats
    const graduationRate =
      uni.id === "stanford" || uni.id === "mit" || uni.id === "harvard"
        ? 96
        : 84;
    const estimatedSalary = uni.type === "Private" ? 104000 : 78000;

    return {
      university: uni,
      percentage: finalScore,
      badgeType,
      graduationRate,
      estimatedSalary,
    };
  }).sort((a, b) => b.percentage - a.percentage); // highest match first
}
