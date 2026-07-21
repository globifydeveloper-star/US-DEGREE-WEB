/**
 * Canonical disclaimer text for each upstream data source, keyed for reuse
 * across the app's "?" info tooltips (see DisclaimerTooltip).
 */
export const DATA_SOURCE_DISCLAIMERS = {
  ipeds:
    "Institutional data is sourced from IPEDS, the U.S. Department of Education's official higher education database.",
  collegeScorecard:
    "Student outcomes, costs, and institutional metrics are sourced from the U.S. Department of Education's College Scorecard.",
  collegeNavigator:
    "College information is sourced from College Navigator, maintained by the National Center for Education Statistics (NCES).",
  censusLehd:
    "Employment and workforce insights are based on data from the U.S. Census Bureau's LEHD -(Post-Secondary Employment Outcomes Explorer) program.",
  eada: "Athletics data is sourced from the U.S. Department of Education's Equity in Athletics Disclosure Act (EADA) database.",
  lehdCalculated:
    "This figure is calculated manually from LEHD data and is not reported directly by the source.",
} as const;
