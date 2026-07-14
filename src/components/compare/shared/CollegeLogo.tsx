"use client";

import Image from "next/image";

interface CollegeLogoProps {
  name: string;
  logo?: string;
  /** Pixel size of the square logo box. Defaults to 24 (used in mobile rows). */
  size?: number;
}

/**
 * Shows a college's logo image, or a colored circle with the first letter
 * of the college's name when there is no logo.
 */
export default function CollegeLogo({ name, logo, size = 24 }: CollegeLogoProps) {
  return (
    <div
      className="bg-white border border-gray-100 rounded p-0.5 flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      {logo ? (
        <Image
          src={logo}
          alt={name}
          width={size}
          height={size}
          className="object-contain"
          referrerPolicy="no-referrer"
          unoptimized
        />
      ) : (
        <div className="w-full h-full rounded bg-blue-50 flex items-center justify-center font-bold text-[#3F51B5] text-[9px]">
          {name ? name.charAt(0) : "U"}
        </div>
      )}
    </div>
  );
}
