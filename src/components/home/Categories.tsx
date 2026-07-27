import CategoriesHeader from "./CategoriesHeader";
import CategoryGrid from "./CategoryGrid";
import { DEFAULT_CATEGORIES } from "./defaultCategories";

export default function Categories() {
  return (
    <section className="px-4 sm:px-10 lg:px-[86px] py-12 sm:py-16 flex justify-center">
      <div className="w-full max-w-[2380px]">
        <CategoriesHeader />
        <CategoryGrid categories={DEFAULT_CATEGORIES} />
      </div>
    </section>
  );
}
