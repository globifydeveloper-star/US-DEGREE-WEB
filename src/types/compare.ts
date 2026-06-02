export interface College {
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
  website: string;
}
export interface ComparisonTableProps {
  comparedColleges: College[];
  averages: { tuition: number; graduationRate: number; medianSalary: number };
  highlights: { lowestTuitionId: string; highestGraduationId: string; highestSalaryId: string; bestValueId: string };
  onRemove: (id: string) => void;
  onViewDetails: (id: string) => void;
}