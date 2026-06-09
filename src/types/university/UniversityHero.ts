export interface UniversityHeroProps {
  id?: string | number;
  name: string;
  location: string;
  type: string;
  rank: string;
  admissionRate: string;
  tuitionFee: string;
  logoColor: string;
  tuitionData?: any;
  tuitionType?: 'in_state' | 'out_state';
  schoolUrl?: string | null;
  accreditor?: string | null;
}
