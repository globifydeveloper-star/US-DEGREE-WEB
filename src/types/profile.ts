/**
 * Types backing the Profile Dashboard's mock match/saved/compare data.
 * These are local to the profile feature; live college data on /compare and
 * /university uses the API-driven `College` type instead.
 */

export interface University {
  id: string;
  /** IPEDS unit id used to look the college up on the live /compare page. */
  unitid: string;
  name: string;
  city: string;
  state: string;
  type: "Public" | "Private";
  ranking: number;
  acceptanceRate: number;
  annualCost: number;
  rating: number;
  description: string;
  logoColor: string;
  image: string;
}

export interface Program {
  id: string;
  universityId: string;
  name: string;
  fieldOfStudy: string;
  state: string;
  degreeLevel: string;
}
