export interface NavLink {
  href: string;
  label: string;
  showCompareBadge?: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/compare", label: "Compare Colleges", showCompareBadge: true },
  { href: "/courses", label: "Courses" },
  { href: "/categories", label: "Categories" },
  { href: "/mentors", label: "Mentors" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blogs", label: "Blogs" },
];
