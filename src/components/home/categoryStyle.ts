import {
  Briefcase,
  Monitor,
  BrainCircuit,
  Settings,
  HeartPulse,
  PenTool,
  type LucideIcon,
} from "lucide-react";

// The categories endpoint returns data, not presentation — icon/color per
// slug stays a client-side lookup, with a neutral fallback for any slug the
// API returns that isn't in this map yet.
const CATEGORY_STYLE: Record<
  string,
  { icon: LucideIcon; iconColor: string; bg: string }
> = {
  business: { icon: Briefcase, iconColor: "text-orange-600", bg: "bg-orange-50" },
  "computer-science": {
    icon: Monitor,
    iconColor: "text-blue-600",
    bg: "bg-blue-50",
  },
  psychology: {
    icon: BrainCircuit,
    iconColor: "text-pink-600",
    bg: "bg-pink-50",
  },
  "mechanical-engineering": {
    icon: Settings,
    iconColor: "text-gray-600",
    bg: "bg-gray-100",
  },
  "public-health": {
    icon: HeartPulse,
    iconColor: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  design: { icon: PenTool, iconColor: "text-yellow-600", bg: "bg-yellow-50" },
};

const DEFAULT_CATEGORY_STYLE = {
  icon: Briefcase,
  iconColor: "text-slate-600",
  bg: "bg-slate-50",
};

// The personalized endpoint doesn't return a slug (see PopularCategory.slug),
// so styling for it falls back to matching on category_name against the
// same six categories the static logged-out list uses — keeps personalized
// cards from all landing on the neutral default style.
const NAME_TO_SLUG: Record<string, string> = {
  business: "business",
  "computer science": "computer-science",
  psychology: "psychology",
  "mechanical engineering": "mechanical-engineering",
  "public health": "public-health",
  design: "design",
};

export function getCategoryStyle(
  slug: string | undefined,
  categoryName?: string,
) {
  if (slug && CATEGORY_STYLE[slug]) return CATEGORY_STYLE[slug];

  const nameSlug = categoryName
    ? NAME_TO_SLUG[categoryName.trim().toLowerCase()]
    : undefined;
  if (nameSlug) return CATEGORY_STYLE[nameSlug];

  return DEFAULT_CATEGORY_STYLE;
}
