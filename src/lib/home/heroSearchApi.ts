export interface SelectOption {
  value: string;
  label: string;
}

const API_URL = "/api/proxy";

let statesCache: SelectOption[] | null = null;
let credentialsCache: SelectOption[] | null = null;
const coursesCache = new Map<string, SelectOption[]>();

// Each fetcher returns mapped options only when the endpoint responds OK with a
// non-empty array; otherwise null so the caller leaves existing state untouched.
// Network/proxy errors are caught and return null for graceful degradation.

const FALLBACK_CREDENTIALS: SelectOption[] = [
  { value: "Undergraduate Certificate or Diploma", label: "Undergraduate Certificate or Diploma" },
  { value: "Associate's Degree", label: "Associate's Degree" },
  { value: "Bachelor's Degree", label: "Bachelor's Degree" },
  { value: "Post-baccalaureate Certificate", label: "Post-baccalaureate Certificate" },
  { value: "Master's Degree", label: "Master's Degree" },
  { value: "Doctoral Degree", label: "Doctoral Degree" },
  { value: "First Professional Degree", label: "First Professional Degree" },
  { value: "Graduate/Professional Certificate", label: "Graduate/Professional Certificate" },
];

const FALLBACK_STATES: SelectOption[] = [
  { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" }, { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" }, { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" }, { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" }, { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" }, { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" }, { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" }, { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" }, { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" }, { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" }, { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" }, { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" }, { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" }, { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" }, { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" }, { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" }, { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" }, { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" }, { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" }, { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" }, { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" }, { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" },
  { value: "DC", label: "District of Columbia" }, { value: "PR", label: "Puerto Rico" },
];

export async function fetchStateOptions(): Promise<SelectOption[] | null> {
  if (statesCache) return statesCache;
  try {
    const res = await fetch(`${API_URL}/states`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map(
          (state: { state_code: string; state_title: string }) => ({
            value: state.state_code,
            label: state.state_title,
          }),
        );
        statesCache = mapped;
        return mapped;
      }
    }
    return FALLBACK_STATES;
  } catch (err) {
    console.warn("Unable to fetch state options, using fallback:", err);
    return FALLBACK_STATES;
  }
}

export async function fetchCredentialOptions(): Promise<SelectOption[] | null> {
  if (credentialsCache) return credentialsCache;
  try {
    const res = await fetch(`${API_URL}/credentials`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((credential: { id: number; name: string }) => ({
          value: credential.name,
          label: credential.name,
        }));
        credentialsCache = mapped;
        return mapped;
      }
    }
    return FALLBACK_CREDENTIALS;
  } catch (err) {
    console.warn("Unable to fetch credential options, using fallback:", err);
    return FALLBACK_CREDENTIALS;
  }
}

export async function fetchCourseOptions(
  level: string | null,
  state: string | null,
): Promise<SelectOption[] | null> {
  const cacheKey = `${level ?? ""}||${state ?? ""}`;
  if (coursesCache.has(cacheKey)) {
    return coursesCache.get(cacheKey)!;
  }
  try {
    const queryParams = new URLSearchParams();
    if (level) queryParams.append("credential_title", level);
    if (state) queryParams.append("state", state);

    const res = await fetch(`${API_URL}/courses?${queryParams.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((item: { title: string }) => ({
          value: item.title,
          label: item.title,
        }));
        coursesCache.set(cacheKey, mapped);
        return mapped;
      }
    }
    return null;
  } catch (err) {
    console.warn("Unable to fetch course options:", err);
    return null;
  }
}
