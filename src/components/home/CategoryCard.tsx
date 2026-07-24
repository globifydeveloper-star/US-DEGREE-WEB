import Link from "next/link";

import CredentialLevelChip from "@/components/common/CredentialLevelChip";
import { PopularCategory } from "@/types/home/PopularCategory";
import { getCategoryStyle } from "./categoryStyle";

interface CategoryCardProps {
  category: PopularCategory;
  /** Fixed-width card for the horizontal carousel; full-width for the grid. */
  fixedWidth?: boolean;
}

export default function CategoryCard({
  category,
  fixedWidth = false,
}: CategoryCardProps) {
  const style = getCategoryStyle(category.slug, category.category_name);
  const Icon = style.icon;
  // No slug in the live response yet — fall back to a free-text title
  // search on the category name rather than inventing a slug/category
  // taxonomy on the frontend.
  const href = category.slug
    ? `/search?category=${category.slug}`
    : `/search?title=${encodeURIComponent(category.category_name)}`;

  return (
    <Link
      href={href}
      className={`block p-4 sm:p-8 rounded-2xl sm:rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${style.bg} ${
        fixedWidth ? "shrink-0 snap-start w-[200px] sm:w-[260px]" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-6">
        <Icon
          className={`${style.iconColor} w-6 h-6 sm:w-7 sm:h-7`}
          strokeWidth={1.5}
        />
        <CredentialLevelChip credentialLevel={category.credential_level} />
      </div>
      <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">
        {category.category_name}
      </h3>
      {category.description && (
        <p className="text-[11px] sm:text-sm text-gray-600 leading-normal sm:leading-relaxed">
          {category.description}
        </p>
      )}
    </Link>
  );
}
