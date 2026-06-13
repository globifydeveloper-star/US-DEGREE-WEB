export interface College {
  schoolUrl: string | undefined;
  id: string;
  name: string;
  shortName: string;
  logo: string;
  state: string;
  location: string;
  isPrivate: boolean;
  tuitionInState: number | null;
  tuitionOutOfState: number | null;
  acceptanceRate: number | null; // 0.0 to 1.0
  satMin: number | null;
  satMax: number | null;
  graduationRate: number | null; // 0.0 to 1.0
  medianSalary: number | null;
  studentPopulation: number | null;
  image: string;
  cipCode?: string;
}