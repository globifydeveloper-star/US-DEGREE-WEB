export interface SelectOption {
  value: string;
  label: string;
}

const API_URL = "/api/proxy";

// Each fetcher returns mapped options only when the endpoint responds OK with a
// non-empty array; otherwise null so the caller leaves existing state untouched.
// Network errors are left to throw so the caller can handle them together.

export async function fetchStateOptions(): Promise<SelectOption[] | null> {
  const res = await fetch(`${API_URL}/states`);
  if (res.ok) {
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map(
        (state: { state_code: string; state_title: string }) => ({
          value: state.state_code,
          label: state.state_title,
        }),
      );
    }
    return null;
  }
  console.error("Failed to fetch states:", await res.text());
  return null;
}

export async function fetchCredentialOptions(): Promise<SelectOption[] | null> {
  const res = await fetch(`${API_URL}/credentials`);
  if (res.ok) {
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map((credential: { id: number; name: string }) => ({
        value: credential.name,
        label: credential.name,
      }));
    }
    return null;
  }
  console.error("Failed to fetch credentials:", await res.text());
  return null;
}

export async function fetchCourseOptions(
  level: string | null,
  state: string | null,
): Promise<SelectOption[] | null> {
  const queryParams = new URLSearchParams();
  if (level) queryParams.append("credential_title", level);
  if (state) queryParams.append("state", state);

  const res = await fetch(`${API_URL}/courses?${queryParams.toString()}`);
  if (res.ok) {
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item: { title: string }) => ({
        value: item.title,
        label: item.title,
      }));
    }
  }
  return null;
}
