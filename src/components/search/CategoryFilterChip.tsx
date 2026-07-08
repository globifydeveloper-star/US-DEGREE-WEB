import { X } from "lucide-react";

interface CategoryFilterChipProps {
  label: string;
  onRemove: () => void;
}

export default function CategoryFilterChip({
  label,
  onRemove,
}: CategoryFilterChipProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xs text-gray-500">Category:</span>
      <button
        onClick={onRemove}
        className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-blue-100 transition-colors"
      >
        {label}
        <X size={12} className="opacity-70" />
      </button>
    </div>
  );
}
