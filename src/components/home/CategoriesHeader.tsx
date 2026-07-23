import { ArrowRight } from "lucide-react";

interface CategoriesHeaderProps {
  showToggle: boolean;
  showAll: boolean;
  onToggle: () => void;
}

export default function CategoriesHeader({
  showToggle,
  showAll,
  onToggle,
}: CategoriesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-10">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Popular Categories
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Explore the most in-demand fields of study across the United
          States.
        </p>
      </div>
      
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 shrink-0"
        >
          {showAll ? "Show less" : "View all categories"}
          <ArrowRight
            className={`w-4 h-4 transition-transform ${showAll ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}
