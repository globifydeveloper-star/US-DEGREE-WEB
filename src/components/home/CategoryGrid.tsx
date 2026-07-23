import { PopularCategory } from "@/types/home/PopularCategory";
import CategoryCard from "./CategoryCard";

export default function CategoryGrid({
  categories,
}: {
  categories: PopularCategory[];
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Rendered in the order the API returns (sort_order) — no
          client-side re-sort. */}
      {categories.map((category) => (
        <CategoryCard
          key={`${category.category_id}-${category.sort_order}`}
          category={category}
        />
      ))}
    </div>
  );
}
