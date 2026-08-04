"use client";

interface CollegeAvatarProps {
  name: string;
  /** "lg" is used in the desktop table header, "md" in the mobile top card. */
  size?: "lg" | "md";
}

const SIZE_CLASSES = {
  lg: "w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl p-2 md:p-3 mb-2 md:mb-4",
  md: "w-12 h-12 rounded-xl p-2",
};

const FALLBACK_TEXT_SIZE = {
  lg: "text-sm md:text-lg",
  md: "text-sm",
};

/**
 * The college marker shown in the desktop table header and the mobile
 * "school directory" cards. Renders a colored initial — logo images are not
 * displayed here.
 */
export default function CollegeAvatar({ name, size = "lg" }: CollegeAvatarProps) {
  return (
    <div
      className={`bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm overflow-hidden ${SIZE_CLASSES[size]}`}
    >
      <div
        className={`w-full h-full rounded-lg bg-blue-100 flex items-center justify-center font-bold text-[#3F51B5] ${FALLBACK_TEXT_SIZE[size]} select-none`}
      >
        {name ? name.trim().charAt(0).toUpperCase() : "U"}
      </div>
    </div>
  );
}
