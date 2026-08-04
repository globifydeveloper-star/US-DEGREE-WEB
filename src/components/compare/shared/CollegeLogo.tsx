"use client";

interface CollegeLogoProps {
  name: string;
  /** Pixel size of the square logo box. Defaults to 24 (used in mobile rows). */
  size?: number;
}

/**
 * Shows a colored square with the first letter of the college's name. Logo
 * images are not displayed here.
 */
export default function CollegeLogo({ name, size = 24 }: CollegeLogoProps) {
  return (
    <div
      className="bg-white border border-gray-100 rounded p-0.5 flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <div className="w-full h-full rounded bg-blue-50 flex items-center justify-center font-bold text-[#3F51B5] text-[10px] select-none">
        {name ? name.trim().charAt(0).toUpperCase() : "U"}
      </div>
    </div>
  );
}
