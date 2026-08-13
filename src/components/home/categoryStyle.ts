import {
  Briefcase,
  Monitor,
  BrainCircuit,
  Settings,
  HeartPulse,
  PenTool,
  Stethoscope,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

// Icon/color per slug is a client-side lookup, with a neutral fallback for
// any slug not in this map yet.
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
  nursing: { icon: Stethoscope, iconColor: "text-red-600", bg: "bg-red-50" },
  education: {
    icon: GraduationCap,
    iconColor: "text-indigo-600",
    bg: "bg-indigo-50",
  },
};

const DEFAULT_CATEGORY_STYLE = {
  icon: Briefcase,
  iconColor: "text-slate-600",
  bg: "bg-slate-50",
};

export function getCategoryStyle(
  slug: string | undefined,
  categoryName?: string,
) {
  if (slug && CATEGORY_STYLE[slug]) return CATEGORY_STYLE[slug];

  const nameSlug = categoryName ? categoryName.trim().toLowerCase().replace(/\s+/g, "-") : "";
  if (nameSlug && CATEGORY_STYLE[nameSlug]) return CATEGORY_STYLE[nameSlug];

  return DEFAULT_CATEGORY_STYLE;
}
