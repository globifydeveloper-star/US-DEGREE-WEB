import {
  TestingBadgeColor,
  TestingRequirementsDisclosure,
} from "@/types/university/AdmissionsTabContent";

/**
 * Testing-requirements disclosures, sourced from the backend-exposed
 * `admission_disclosure_categories` table (NO mock/seed data).
 *
 * The table is a small, fixed lookup keyed by `category` (e.g. C_TEST_OPTIONAL)
 * that supplies the badge DISPLAY metadata — label, color, supporting copy,
 * disclaimer tier/text. A college's category itself comes per-college from the
 * overview endpoint (`admissions.sat_disclosure_category`); this module maps
 * that code to its disclosure. Rows are fetched once and cached per process.
 */

/** Raw row shape as returned by GET /admission-disclosure-categories. */
interface RawDisclosureCategory {
  category?: string | null;
  badge_label?: string | null;
  badge_color?: string | null;
  supporting_copy?: string | null;
  disclaimer_tier?: number | string | null;
  disclaimer_text?: string | null;
  show_admission_rate_required?: boolean | null;
}

const VALID_BADGE_COLORS: readonly TestingBadgeColor[] = [
  "green",
  "slate_blue_gray",
  "teal",
  "amber_outline",
  "coral",
  "gray",
];

function normalizeBadgeColor(raw: string | null | undefined): TestingBadgeColor {
  return VALID_BADGE_COLORS.includes(raw as TestingBadgeColor)
    ? (raw as TestingBadgeColor)
    : "gray";
}

function normalizeTier(raw: number | string | null | undefined): 1 | 2 | 3 {
  const n = Number(raw);
  return n === 2 ? 2 : n === 3 ? 3 : 1;
}

/** Map a raw DB row to the disclosure shape the UI consumes. */
function toDisclosure(
  row: RawDisclosureCategory,
): TestingRequirementsDisclosure | null {
  if (!row?.category) return null;
  return {
    satDisclosureCategory: row.category,
    badgeLabel: row.badge_label ?? "",
    badgeColor: normalizeBadgeColor(row.badge_color),
    supportingCopy: row.supporting_copy ?? "",
    disclaimerTier: normalizeTier(row.disclaimer_tier),
    disclaimerText: row.disclaimer_text ?? null,
    showAdmissionRateRequired: Boolean(row.show_admission_rate_required),
  };
}

function resolveApiUrl(): string {
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000"
  );
}

let categoriesCache: Map<string, TestingRequirementsDisclosure> | null = null;
let categoriesInflight: Promise<Map<
  string,
  TestingRequirementsDisclosure
>> | null = null;

/**
 * Fetch and cache the full category→disclosure map from the backend. Returns an
 * empty map on failure so callers degrade to "no badge" rather than throwing.
 */
async function loadDisclosureCategories(): Promise<
  Map<string, TestingRequirementsDisclosure>
> {
  if (categoriesCache) return categoriesCache;
  if (categoriesInflight) return categoriesInflight;

  categoriesInflight = (async () => {
    const map = new Map<string, TestingRequirementsDisclosure>();
    try {
      const res = await fetch(
        `${resolveApiUrl()}/admission-disclosure-categories`,
        { cache: "no-store" },
      );
      if (res.ok) {
        const data: unknown = await res.json();
        if (Array.isArray(data)) {
          for (const row of data as RawDisclosureCategory[]) {
            const disclosure = toDisclosure(row);
            if (disclosure?.satDisclosureCategory) {
              map.set(disclosure.satDisclosureCategory, disclosure);
            }
          }
        }
      } else {
        console.error(
          `Failed to load admission disclosure categories (${res.status})`,
        );
      }
      categoriesCache = map;
      return map;
    } catch (err) {
      console.error("Error fetching admission disclosure categories:", err);
      // Don't poison the cache on transient errors — allow a later retry.
      return map;
    } finally {
      categoriesInflight = null;
    }
  })();

  return categoriesInflight;
}

/**
 * Resolve the disclosure for a college's disclosure category (as returned by the
 * overview endpoint). Returns null when the category is absent or unknown, in
 * which case the Admissions tab shows the numeric SAT range instead.
 */
export async function getTestingRequirementsForCategory(
  category: string | null | undefined,
): Promise<TestingRequirementsDisclosure | null> {
  if (!category) return null;
  const map = await loadDisclosureCategories();
  return map.get(category) ?? null;
}
