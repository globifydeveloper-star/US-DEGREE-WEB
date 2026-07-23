import { SearchX, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

/**
 * Generic "nothing to show" panel. Used for the Popular Categories grid when
 * no categories are returned, and reused as-is for empty filtered-results
 * states elsewhere — pass title/description/icon to fit the context.
 */
export default function EmptyState({
  title = "Nothing to show",
  description = "Check back soon.",
  icon: Icon = SearchX,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={[
        "bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-8 sm:p-16 text-center max-w-xl mx-auto",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="w-14 h-14 sm:w-20 sm:h-20 bg-blue-50 text-[#3F51B5] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <Icon className="w-7 h-7 sm:w-10 sm:h-10" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
        {description}
      </p>
    </div>
  );
}
