import { PopularCategory } from "@/types/home/PopularCategory";

// Static fallback shown to logged-out visitors instead of hitting
// /popular-categories/personalized — there's no user to personalize for, so
// this avoids a network round-trip and a loading skeleton on first paint.
// Icon/color per slug comes from categoryStyle.ts via CategoryCard.
export const DEFAULT_CATEGORIES: PopularCategory[] = [
  {
    category_id: "business",
    category_name: "Business",
    slug: "business",
    description:
      "MBA, Finance, Business Management, and Entrepreneurship programs.",
    credential_level: null,
    popularity_score: 0,
    sort_order: 0,
  },
  {
    category_id: "computer-science",
    category_name: "Computer Science",
    slug: "computer-science",
    description: "AI, Software Engineering, Cybersecurity, and Data Science.",
    credential_level: null,
    popularity_score: 0,
    sort_order: 1,
  },
  {
    category_id: "psychology",
    category_name: "Psychology",
    slug: "psychology",
    description:
      "Biopsychology, Clinical, Behavioral Sciences, and Counseling specializations.",
    credential_level: null,
    popularity_score: 0,
    sort_order: 2,
  },
  {
    category_id: "mechanical-engineering",
    category_name: "Mechanical Engineering",
    slug: "mechanical-engineering",
    description:
      "Mechanical Engineering Related Technologies/Technicians, Aerospace, and Material design programs.",
    credential_level: null,
    popularity_score: 0,
    sort_order: 3,
  },
  {
    category_id: "public-health",
    category_name: "Public Health",
    slug: "public-health",
    description:
      "Public Health and Health-Related Fields and Global Health studies.",
    credential_level: null,
    popularity_score: 0,
    sort_order: 4,
  },
  {
    category_id: "design",
    category_name: "Design",
    slug: "design",
    description:
      "Environmental Design, Drafting/Design Engineering Technologies/Technicians, and Multimedia programs.",
    credential_level: null,
    popularity_score: 0,
    sort_order: 5,
  },
];
