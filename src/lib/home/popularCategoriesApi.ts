import { authedFetch, hasAuthenticatedUser } from "@/lib/auth/api";
import { PopularCategoriesResponse } from "@/types/home/PopularCategory";

const PROXY_BASE = "/api/proxy";
const PERSONALIZED_PATH = "/popular-categories/personalized";

/**
 * GET /popular-categories/personalized. Always hit this route rather than
 * the plain GET /popular-categories?target_degree_level= one — the
 * backend's tryResolveUserId already resolves an anonymous caller onto the
 * same default-categories behavior, so the frontend doesn't need to
 * duplicate that auth-state branching by picking between two routes.
 *
 * Only whether to attach the app JWT differs: logged-in calls go through
 * authedFetch (Authorization: Bearer <appJWT>, same as every other
 * protected call in src/lib/auth/api.ts); logged-out calls hit the proxy
 * directly with no Authorization header, which it forwards as absent.
 */
export async function fetchPopularCategories(): Promise<PopularCategoriesResponse> {
  const res = (await hasAuthenticatedUser())
    ? await authedFetch(PERSONALIZED_PATH)
    : await fetch(`${PROXY_BASE}${PERSONALIZED_PATH}`);

  if (!res.ok) {
    // Surface the backend's error body (forwarded verbatim by the proxy) so
    // a 500 isn't opaque.
    let detail = "";
    try {
      detail = (await res.text()).slice(0, 500);
    } catch {
      // ignore — body may be unreadable
    }
    throw new Error(
      `Load popular categories failed (${res.status})${detail ? `: ${detail}` : ""}`,
    );
  }

  return (await res.json()) as PopularCategoriesResponse;
}
