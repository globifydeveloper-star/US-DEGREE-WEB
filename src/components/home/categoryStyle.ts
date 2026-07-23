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

export function getCategoryStyle(slug: string | undefined) {
  return (slug && CATEGORY_STYLE[slug]) || DEFAULT_CATEGORY_STYLE;
}
