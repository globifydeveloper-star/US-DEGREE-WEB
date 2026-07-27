export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "computer-science": [
    "computer science",
    "software engineering",
    "cybersecurity",
    "information technology",
    "data science",
    "artificial intelligence",
  ],
  business: [
    "business",
    "finance",
    "accounting",
    "management",
    "marketing",
    "entrepreneurship",
  ],
  psychology: ["psychology", "behavioral science", "counseling"],
  "mechanical-engineering": ["mechanical engineering", "robotics", "aerospace"],
  "public-health": ["public health", "epidemiology", "health policy"],
  design: ["Design"],
  nursing: ["nursing"],
  education: ["education"],
};

export const CATEGORY_LABELS: Record<string, string> = {
  "computer-science": "Computer Science",
  business: "Business",
  psychology: "Psychology",
  "mechanical-engineering": "Mechanical Engineering",
  "public-health": "Public Health",
  design: "Design",
  nursing: "Nursing",
  education: "Education",
};

// Resolve a human-readable label for a category slug, falling back to a
// title-cased version of the slug when it isn't in the known label map.
export const getCategoryLabel = (category: string): string =>
  category
    ? CATEGORY_LABELS[category] ||
      category
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "";
