/**
 * Mock university + program catalog used by the Profile Dashboard's
 * "My Matches", "Saved Colleges" and "Compare List" sections.
 *
 * NOTE: This is temporary placeholder data. There is no saved-colleges or
 * matchmaking API in the backend yet, so the dashboard runs on this mock set.
 * The live comparison flow (/compare) uses real API data via useCompareColleges,
 * keyed by the IPEDS `unitid` carried on each university below.
 */

import { University, Program } from "../types/profile";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop";

export const UNIVERSITIES: University[] = [
  {
    id: "stanford",
    unitid: "243744",
    name: "Stanford University",
    city: "Stanford",
    state: "CA",
    type: "Private",
    ranking: 3,
    acceptanceRate: 3.9,
    annualCost: 56169,
    rating: 4.9,
    description:
      "A private research university in Stanford, California, renowned for entrepreneurship and engineering.",
    logoColor: "bg-red-700 text-white",
    image: PLACEHOLDER_IMAGE,
  },
  {
    id: "berkeley",
    unitid: "110635",
    name: "University of California, Berkeley",
    city: "Berkeley",
    state: "CA",
    type: "Public",
    ranking: 15,
    acceptanceRate: 11.4,
    annualCost: 14226,
    rating: 4.7,
    description:
      "The flagship public research university of the University of California system.",
    logoColor: "bg-blue-900 text-amber-400",
    image: PLACEHOLDER_IMAGE,
  },
  {
    id: "mit",
    unitid: "166683",
    name: "Massachusetts Institute of Technology",
    city: "Cambridge",
    state: "MA",
    type: "Private",
    ranking: 2,
    acceptanceRate: 4.0,
    annualCost: 57986,
    rating: 4.9,
    description:
      "A private research university in Cambridge, Massachusetts, a global leader in science and technology.",
    logoColor: "bg-neutral-800 text-white",
    image: PLACEHOLDER_IMAGE,
  },
  {
    id: "harvard",
    unitid: "166027",
    name: "Harvard University",
    city: "Cambridge",
    state: "MA",
    type: "Private",
    ranking: 1,
    acceptanceRate: 3.4,
    annualCost: 57261,
    rating: 4.9,
    description:
      "An Ivy League private research university in Cambridge, Massachusetts.",
    logoColor: "bg-red-900 text-white",
    image: PLACEHOLDER_IMAGE,
  },
  {
    id: "nyu",
    unitid: "193900",
    name: "New York University",
    city: "New York",
    state: "NY",
    type: "Private",
    ranking: 30,
    acceptanceRate: 12.2,
    annualCost: 58168,
    rating: 4.5,
    description: "A private research university based in New York City.",
    logoColor: "bg-violet-700 text-white",
    image: PLACEHOLDER_IMAGE,
  },
  {
    id: "columbia",
    unitid: "190150",
    name: "Columbia University",
    city: "New York",
    state: "NY",
    type: "Private",
    ranking: 12,
    acceptanceRate: 3.9,
    annualCost: 65524,
    rating: 4.8,
    description: "An Ivy League private research university in New York City.",
    logoColor: "bg-sky-800 text-white",
    image: PLACEHOLDER_IMAGE,
  },
  {
    id: "utaustin",
    unitid: "228778",
    name: "University of Texas at Austin",
    city: "Austin",
    state: "TX",
    type: "Public",
    ranking: 32,
    acceptanceRate: 31.0,
    annualCost: 11448,
    rating: 4.4,
    description:
      "A major public research university and the flagship of the University of Texas System.",
    logoColor: "bg-orange-700 text-white",
    image: PLACEHOLDER_IMAGE,
  },
  {
    id: "rice",
    unitid: "227757",
    name: "Rice University",
    city: "Houston",
    state: "TX",
    type: "Private",
    ranking: 17,
    acceptanceRate: 8.7,
    annualCost: 54960,
    rating: 4.7,
    description:
      "A private research university in Houston, Texas, known for small class sizes.",
    logoColor: "bg-blue-800 text-white",
    image: PLACEHOLDER_IMAGE,
  },
  {
    id: "uchicago",
    unitid: "144050",
    name: "University of Chicago",
    city: "Chicago",
    state: "IL",
    type: "Private",
    ranking: 6,
    acceptanceRate: 5.4,
    annualCost: 62241,
    rating: 4.8,
    description:
      "A private research university in Chicago, Illinois, famed for its core curriculum.",
    logoColor: "bg-rose-900 text-white",
    image: PLACEHOLDER_IMAGE,
  },
  {
    id: "uw",
    unitid: "236948",
    name: "University of Washington",
    city: "Seattle",
    state: "WA",
    type: "Public",
    ranking: 40,
    acceptanceRate: 48.0,
    annualCost: 12076,
    rating: 4.3,
    description: "A public research university in Seattle, Washington.",
    logoColor: "bg-purple-900 text-amber-300",
    image: PLACEHOLDER_IMAGE,
  },
  {
    id: "upenn",
    unitid: "215062",
    name: "University of Pennsylvania",
    city: "Philadelphia",
    state: "PA",
    type: "Private",
    ranking: 7,
    acceptanceRate: 5.9,
    annualCost: 63452,
    rating: 4.8,
    description:
      "An Ivy League private research university in Philadelphia, Pennsylvania.",
    logoColor: "bg-blue-700 text-red-200",
    image: PLACEHOLDER_IMAGE,
  },
];

// A couple of programs per university so the match algorithm can align
// against the student's preferred majors.
const PROGRAM_FIELDS = [
  "Computer Science",
  "Business Administration",
  "Data Science",
];

export const PROGRAMS: Program[] = UNIVERSITIES.flatMap((uni) =>
  PROGRAM_FIELDS.map((field, i) => ({
    id: `${uni.id}-${i}`,
    universityId: uni.id,
    name: `${field} (${uni.name})`,
    fieldOfStudy: field,
    state: uni.state,
    degreeLevel: "Bachelor's",
  })),
);
