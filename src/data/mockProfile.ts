/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StudentProfile {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  createdDate: string;
  lastLogin: string;

  highSchoolName: string;
  graduationYear: number;
  gpa: number;

  satReadingWriting: number;
  satMath: number;
  actScore?: number;

  preferredStates: string[]; // Code strings e.g., ['CA', 'NY']
  preferredPrograms: string[];
  preferredDegreeLevel: string;
}

export const INITIAL_PROFILE: StudentProfile = {
  fullName: "Rahul Vidyabhushan",
  email: "rahulvidx0696@gmail.com",
  phone: "+1 (555) 739-1829",
  address: "1428 Oakridge Drive, San Jose, CA 95125",
  createdDate: "March 12, 2025",
  lastLogin: "June 17, 2026",

  highSchoolName: "Lincoln High School",
  graduationYear: 2024,
  gpa: 3.85,

  satReadingWriting: 710,
  satMath: 740,
  actScore: 31,

  preferredStates: ["CA", "NY", "MA"],
  preferredPrograms: [
    "Computer Science",
    "Data Science",
    "Business Administration",
  ],
  preferredDegreeLevel: "Bachelor's",
};

// Preset lists for form select boxes
export const SAC_STATES = [
  { code: "CA", name: "California" },
  { code: "NY", name: "New York" },
  { code: "TX", name: "Texas" },
  { code: "MA", name: "Massachusetts" },
  { code: "IL", name: "Illinois" },
  { code: "WA", name: "Washington" },
  { code: "FL", name: "Florida" },
  { code: "PA", name: "Pennsylvania" },
];

export const SAC_PROGRAMS = [
  "Computer Science",
  "Business Administration",
  "Data Science",
  "Mechanical Engineering",
  "Psychology",
  "Electrical Engineering",
  "Biotechnology",
  "Economics",
];

export const DEACTIVATION_REASONS = [
  { value: "1", label: "I found another college platform" },
  { value: "2", label: "I no longer plan to attend college" },
  { value: "3", label: "Too many emails/notifications" },
  { value: "4", label: "Privacy concerns" },
  { value: "5", label: "Other" },
];
