import { PopularCategory } from "@/types/home/PopularCategory";

// Static "Popular Categories" list shown to all visitors, logged in or not.
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
  {
    category_id: "nursing",
    category_name: "Nursing",
    slug: "nursing",
    description:
      "Registered Nursing, Nurse Practitioner, and Clinical Nursing specializations.",
    credential_level: null,
    popularity_score: 0,
    sort_order: 6,
  },
  {
    category_id: "education",
    category_name: "Education",
    slug: "education",
    description:
      "Elementary Education, Curriculum & Instruction, and Educational Leadership programs.",
    credential_level: null,
    popularity_score: 0,
    sort_order: 7,
  },
];
